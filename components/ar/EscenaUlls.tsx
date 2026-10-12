"use client";

import { useEffect, useRef, type RefObject } from "react";
import { diferenciaRumb, type Mirada } from "@/lib/orientacio";
import type { EstatFigura3D } from "@/components/ar/Figura3D";
import { dibuixaVora } from "@/components/ar/voraGuia";

/**
 * Escena "ulls en la foscor": parells d'ulls que brillen entre les ombres i siluetes que espien
 * de lluny. Es dibuixa en un canvas transparent sobre el vídeo de la càmera. Els personatges
 * viuen en un "cel" fix al voltant de l'usuari (no dels metres GPS), així que la tremolor del GPS
 * no els belluga.
 *
 * Fan el que fa algú que et vigila:
 * - abans que aparegui la figura se senten passes que s'acosten, i mentre és present no hi ha cap
 *   parell d'ulls a la foscor;
 * - apareixen a la vora del camp de visió o darrere teu, mai just al davant; els ulls sempre
 *   molt lluny, com una cosa que et mira des del fons del bosc;
 * - si els mires fix se n'adonen: els ulls desapareixen de cop, la
 *   figura es dissol;
 * - els ulls són una mica diferents: alts, baixos, amb pupil·la de bèstia. La figura és només la
 *   imatge, sense cap altre element al voltant.
 */

interface Props {
  /** Lectura de sensors (brúixola i inclinació). Pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors (ordinador): arrossegar el dit/ratolí gira la mirada. */
  arrossegar: boolean;
  /**
   * Si hi ha un estat, la figura la dibuixa el 3D (Figura3D) i aquesta escena només hi escriu
   * on és i quant es veu. Si és nul, es dibuixa la figura plana (la imatge).
   */
  figura3D?: RefObject<EstatFigura3D> | null;
  /**
   * Rumb del camí que fa el jugador (graus des del nord). Si hi és, la figura apareix en aquesta
   * direcció o a la contrària; si és nul, on mira el mòbil.
   */
  rumbCami?: number | null;
  /** Depuració (?debug=1): l'escena hi escriu l'estat de la figura i de la mirada. */
  depuracio?: RefObject<string> | null;
  /** Micròfon: funció que retorna el volum actual (0-1). Si hi és, un crit espanta la figura. */
  nivellMicro?: (() => number) | null;
  /** Compta cops: cada cop que puja, la figura s'espanta (botó de cridar, si no hi ha micròfon). */
  crit?: number;
  /** Frases de l'Inquisidor: demana que soni la frase i retorna quant dura (ms). */
  alVeu?: (nom: "on-sou" | "alto" | "a-la-forca") => number;
  /**
   * Per al so de la caminada: cada fotograma, quant camina la figura (volum 0-1, més fort com més a
   * prop) i cap a quina banda és (-1 esquerra, 1 dreta).
   */
  alCaminar?: (volum: number, pan: number) => void;
  /** Per al so: la figura és a punt d'aparèixer i s'acosta pel costat `pan` (-1 esquerra, 1 dreta). */
  alPasses?: (pan: number, duradaMs: number) => void;
}

type Tipus = "ulls" | "silueta";
type Fase = "amagat" | "passes" | "apareix" | "present" | "fuig";

/** Temps que se senten les passes abans que aparegui la figura (ms), un cop acabada la frase «On sou?». */
export const DURADA_PASSES_MS = 4800;
type Motiu = "mirat" | "temps";

interface Varietat {
  tipus: Tipus;
  /** RGB de la llum dels ulls. */
  color: string;
  distMin: number;
  distMax: number;
  /** Ulls: alçada sobre el terra (m). */
  altMin: number;
  altMax: number;
  /** Mida visual dels ulls respecte a l'estàndard. */
  escala: number;
  pupilaVertical: boolean;
  /** Siluetes: alçada (m) i amplada relativa a l'alçada. */
  alcada: number;
  ample: number;
}

const BASE: Varietat = {
  tipus: "ulls",
  color: "255, 45, 35",
  distMin: 26,
  distMax: 38,
  altMin: 0.8,
  altMax: 2.2,
  escala: 1,
  pupilaVertical: false,
  alcada: 1.9,
  ample: 0.42,
};

const VARIETATS: Record<string, Varietat> = {
  /** Els ulls de sempre: vermells, a alçada de persona. */
  normal: { ...BASE, escala: 2.2 },
  /** Petits, junts i a ran de terra, vermell encès: com una rata gran o una cosa que s'arrossega. */
  baix: { ...BASE, color: "255, 90, 30", distMin: 24, distMax: 34, altMin: 0.15, altMax: 0.45, escala: 2 },
  /** Enormes i molt amunt, entre les branques: alguna cosa gran que no és d'aquí. */
  alt: { ...BASE, color: "255, 70, 25", distMin: 34, distMax: 46, altMin: 2.6, altMax: 3.9, escala: 3 },
  /** Vermell fosc, amb pupil·la vertical de bèstia. */
  bestia: { ...BASE, color: "235, 20, 45", distMin: 24, distMax: 34, altMin: 0.9, altMax: 1.5, escala: 2.4, pupilaVertical: true },
  monjo: { ...BASE, tipus: "silueta", distMin: 6, distMax: 10 },
};

interface Personatge {
  v: Varietat;
  fase: Fase;
  motiu: Motiu;
  rumb: number;
  /** Distància fictícia (m): només decideix la mida a pantalla. */
  dist: number;
  alt: number;
  desde: number;
  fins: number;
  mirat: number;
  proximaParpella: number;
  parpellaEsq: number;
  parpellaDre: number;
  /** Per desfasar el balanceig, la llum i el parpelleig de cada personatge. */
  llavor: number;
  /** Un ull una mica més gran que l'altre: res no és del tot simètric. */
  asim: number;
  costat: 1 | -1;
  /** Guió de la veu: quan comencen les passes (després de «On sou?»), si ja han sonat i per on vénen. */
  passesInici: number;
  passesFetes: boolean;
  panPasses: number;
  /** «A la força!»: des de quan es pot dir, si ja s'ha dit i quant fa que el jugador l'enfoca. */
  forcaPermesDesde: number;
  forcaDita: boolean;
  enfocatMs: number;
  /** S'ha espantat (crit): es gira i marxa. `gir` és quant s'ha girat (0-1). */
  espantat: boolean;
  espantatDesde: number;
  gir: number;
  /** Distància a la qual ha aparegut (m): serveix per saber quant s'ha acostat. */
  distInici: number;
  /** Quant camina (0-1), suavitzat: arrenca i s'atura a poc a poc. */
  camina: number;
}

/** Imatge de la figura (public/images/ar/figura-encaputxada.webp, retallada a la figura) i la seva proporció. */
export const IMATGE_FIGURA = "/images/ar/figura-encaputxada.webp";
const FIGURA = { ample: 306 / 699 };

/** Fins on s'acosta la figura caminant (m) i la velocitat a la qual camina (m/s). */
const DIST_PARADA = 4.5;
const VELOCITAT_CAMINADA = 0.45;
/** Quan s'espanta: velocitat amb què marxa (m/s) i quant triga a desaparèixer (ms). */
const VELOCITAT_FUGIDA = 1.6;
const TEMPS_FUGIDA_MS = 3500;

const ALCADA_CAMERA = 1.5;
const FOV_HORITZONTAL = 52;
const RAD = Math.PI / 180;

const aleatori = (min: number, max: number) => min + Math.random() * (max - min);
const mitja = (x: number) => x * x * (3 - 2 * x);

function nou(v: Varietat, espera: number, ara: number): Personatge {
  return {
    v,
    fase: "amagat",
    motiu: "temps",
    rumb: 0,
    dist: v.distMin,
    alt: v.altMin,
    desde: ara,
    fins: ara + espera,
    mirat: 0,
    proximaParpella: 0,
    parpellaEsq: 0,
    parpellaDre: 0,
    llavor: Math.random() * 1000,
    asim: aleatori(0.86, 1.14),
    costat: Math.random() < 0.5 ? -1 : 1,
    camina: 0,
    espantat: false,
    espantatDesde: 0,
    gir: 0,
    passesInici: 0,
    passesFetes: false,
    panPasses: 0,
    forcaPermesDesde: 0,
    forcaDita: false,
    enfocatMs: 0,
    distInici: v.distMin,
  };
}

function durada(p: Personatge, fase: "apareix" | "fuig"): number {
  if (fase === "apareix") return p.v.tipus === "ulls" ? 900 : 1500;
  if (p.v.tipus === "ulls") return 300;
  return 700;
}

function aparicio(p: Personatge, mirada: Mirada, ara: number) {
  // A la vora o darrere del camp de visió: es noten en girar.
  const costat = Math.random() < 0.5 ? -1 : 1;
  p.rumb = (mirada.rumb + costat * aleatori(30, 130) + 720) % 360;
  p.dist = aleatori(p.v.distMin, p.v.distMax);
  p.distInici = p.dist;
  p.espantat = false;
  p.gir = 0;
  p.camina = 0;
  p.forcaDita = false;
  p.enfocatMs = 0;
  p.alt = p.v.tipus === "ulls" ? aleatori(p.v.altMin, p.v.altMax) : 0;
  p.costat = Math.random() < 0.5 ? -1 : 1;
  p.fase = "apareix";
  p.motiu = "temps";
  p.desde = ara;
  p.mirat = 0;
  p.proximaParpella = ara + aleatori(1200, 3500);
  p.parpellaEsq = 0;
  p.parpellaDre = 0;
}

function actualitza(
  p: Personatge,
  mirada: Mirada,
  ara: number,
  dt: number,
  figuraActiva: boolean,
  rumbCami: number | null,
  alPasses?: (pan: number, duradaMs: number) => void,
  alVeu?: (nom: "on-sou" | "alto" | "a-la-forca") => number
) {
  // Mentre hi ha la figura (o se'n senten les passes) no hi ha ulls a la foscor.
  if (p.v.tipus === "ulls" && figuraActiva && (p.fase === "apareix" || p.fase === "present")) {
    p.fase = "fuig";
    p.motiu = "temps";
    p.desde = ara;
    return;
  }
  switch (p.fase) {
    case "amagat":
      if (ara >= p.fins) {
        if (p.v.tipus === "ulls" && figuraActiva) {
          p.fins = ara + 1500;
          return;
        }
        aparicio(p, mirada, ara);
        if (p.v.tipus === "silueta") {
          p.fase = "passes";
          if (rumbCami !== null) {
            // Al davant del camí o al darrere, el que quedi més a prop d'on mira ara el jugador.
            const davant = rumbCami;
            const darrere = (rumbCami + 180) % 360;
            const triaDavant = Math.abs(diferenciaRumb(davant, mirada.rumb)) <= Math.abs(diferenciaRumb(darrere, mirada.rumb));
            p.rumb = ((triaDavant ? davant : darrere) + aleatori(-6, 6) + 360) % 360;
            // Les passes vénen d'aquella banda.
            p.panPasses = Math.max(-1, Math.min(1, diferenciaRumb(p.rumb, mirada.rumb) / 70));
          } else {
            p.panPasses = aleatori(-0.35, 0.35);
          }
          // Primer l'Inquisidor: «On sou?»; les passes comencen quan acaba.
          const durVeu = alVeu?.("on-sou") ?? 0;
          p.passesInici = ara + (durVeu > 0 ? durVeu + 500 : 0);
          p.passesFetes = false;
        }
      }
      return;
    case "passes":
      // Primer la veu i, després, uns peus que s'acosten; la figura encara no es veu.
      if (!p.passesFetes && ara >= p.passesInici) {
        p.passesFetes = true;
        alPasses?.(p.panPasses, DURADA_PASSES_MS);
      }
      if (ara >= p.passesInici + DURADA_PASSES_MS) {
        // Sense camí, apareix al davant, on mira ara el jugador; amb camí, ja té el seu rumb.
        if (rumbCami === null) p.rumb = (mirada.rumb + aleatori(-8, 8) + 360) % 360;
        p.fase = "apareix";
        p.desde = ara;
        // Quan acaben les passes: «Alto!». «A la força!» ve quan el jugador l'enfoca, passada aquesta frase.
        const durAlto = alVeu?.("alto") ?? 0;
        p.forcaPermesDesde = ara + durAlto + 400;
      }
      return;
    case "apareix":
      if (ara - p.desde >= durada(p, "apareix")) {
        p.fase = "present";
        p.desde = ara;
        p.fins = p.v.tipus === "silueta" ? Infinity : ara + aleatori(14_000, 26_000);
      }
      break;
    case "present":
      if (p.v.tipus === "ulls" && ara >= p.proximaParpella) {
        const sort = Math.random();
        if (sort < 0.7) {
          p.parpellaEsq = p.parpellaDre = ara + 170;
          p.proximaParpella = ara + aleatori(1800, 5000);
        } else if (sort < 0.85) {
          // Doble parpelleig, ràpid, com algú nerviós.
          p.parpellaEsq = p.parpellaDre = ara + 130;
          p.proximaParpella = ara + 330;
        } else {
          // Només un ull: una clucada que no és de persona.
          if (Math.random() < 0.5) p.parpellaEsq = ara + 260;
          else p.parpellaDre = ara + 260;
          p.proximaParpella = ara + aleatori(2500, 5500);
        }
      }
      if (ara >= p.fins) {
        p.fase = "fuig";
        p.motiu = "temps";
        p.desde = ara;
      }
      break;
    case "fuig":
      if (ara - p.desde >= durada(p, "fuig")) {
        p.fase = "amagat";
        // Un cop marxa (espantada), no torna fins d'aquí una bona estona.
        p.fins = ara + (p.v.tipus === "silueta" ? aleatori(25_000, 45_000) : aleatori(5000, 12_000));
      }
      return;
  }

  if (p.fase !== "present") return;
  // La figura es queda: un cop apareix al davant no desapareix ni en mirar-la ni amb el temps.
  // Camina cap al jugador (caminada falsa, sense esquelet) i s'atura a DIST_PARADA.
  if (p.v.tipus === "silueta") {
    // «A la força!»: quan el jugador l'enfoca (la té dins del camp de visió) mig segon.
    if (!p.espantat && !p.forcaDita && ara >= p.forcaPermesDesde) {
      const dxF = Math.abs(diferenciaRumb(p.rumb, mirada.rumb));
      const dyF = Math.abs(Math.atan(((p.v.alcada * 0.86) - ALCADA_CAMERA) / p.dist) / RAD - mirada.elevacio);
      p.enfocatMs = dxF < 14 && dyF < 28 ? p.enfocatMs + dt : Math.max(0, p.enfocatMs - dt);
      if (p.enfocatMs > 500) {
        p.forcaDita = true;
        alVeu?.("a-la-forca");
      }
    }
    if (p.espantat) {
      // Es gira d'esquena i marxa corrent; passats uns segons, s'esvaeix.
      p.gir = Math.min(1, p.gir + dt / 700);
      p.camina += (1 - p.camina) * Math.min(1, dt / 250);
      if (p.gir > 0.5) p.dist += VELOCITAT_FUGIDA * p.camina * (dt / 1000);
      if (ara - p.espantatDesde > TEMPS_FUGIDA_MS) {
        p.fase = "fuig";
        p.motiu = "temps";
        p.desde = ara;
      }
      return;
    }
    const objectiu = p.dist > DIST_PARADA + 0.05 ? 1 : 0;
    p.camina += (objectiu - p.camina) * Math.min(1, dt / 500);
    p.dist = Math.max(DIST_PARADA, p.dist - VELOCITAT_CAMINADA * p.camina * (dt / 1000));
    return;
  }

  // Només els ulls: si els mires fix, se n'adonen i desapareixen.
  const dx = diferenciaRumb(p.rumb, mirada.rumb);
  const elevacio = Math.atan((p.alt - ALCADA_CAMERA) / p.dist) / RAD;
  const dy = Math.abs(elevacio - mirada.elevacio);
  if (Math.abs(dx) < 9 && dy < 16) {
    p.mirat += dt;
    if (p.mirat > 800) {
      p.fase = "fuig";
      p.motiu = "mirat";
      p.desde = ara;
      p.mirat = 0;
      try {
        navigator.vibrate?.(35);
      } catch {
        // Sense vibració: no passa res.
      }
    }
  } else {
    p.mirat = Math.max(0, p.mirat - dt * 0.5);
  }
}

/** Opacitat segons la fase. Els ulls espantats s'encenen un instant i desapareixen de cop. */
function opacitat(p: Personatge, ara: number): number {
  const t = ara - p.desde;
  if (p.fase === "apareix") return mitja(Math.min(1, t / durada(p, "apareix")));
  if (p.fase === "present") return 1;
  if (p.fase === "fuig") {
    if (p.v.tipus === "ulls") {
      if (p.motiu === "mirat") return t < 150 ? 1 : 0;
      return Math.max(0, 1 - t / durada(p, "fuig"));
    }
    const f = t / durada(p, "fuig");
    return Math.max(0, 1 - f);
  }
  return 0;
}

/** Llum que oscil·la i parpelleja una mica: res no brilla amb una intensitat perfecta. */
function llum(p: Personatge, ara: number): number {
  return 0.8 + 0.12 * Math.sin(ara / 430 + p.llavor) + 0.08 * Math.sin(ara / 97 + p.llavor * 3);
}

interface OpcionsUlls {
  color: string;
  pupilaVertical: boolean;
  asim: number;
  tancatEsq: number;
  tancatDre: number;
  /** Cap on mira (-1 esquerra, 1 dreta): les pupil·les segueixen el jugador. */
  segueix: number;
}

function dibuixaUlls(ctx: CanvasRenderingContext2D, x: number, y: number, unitatBase: number, alfa: number, o: OpcionsUlls) {
  const unitat = unitatBase;
  const separacio = unitat * 0.3;
  const costats: [number, number, number][] = [
    [-1, 1, o.tancatEsq],
    [1, o.asim, o.tancatDre],
  ];
  for (const [costat, mida, tancat] of costats) {
    const cx = x + costat * separacio;
    const meitatAmple = unitat * 0.15 * mida;
    const meitatAlt = Math.max(0.5, unitat * 0.055 * mida * (1 - tancat));

    // Llum que se suma a la del voltant, no que la tapa.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(cx, y, 0, cx, y, unitat * 0.55 * mida);
    halo.addColorStop(0, `rgba(${o.color}, ${0.45 * alfa})`);
    halo.addColorStop(1, `rgba(${o.color}, 0)`);
    ctx.fillStyle = halo;
    ctx.fillRect(cx - unitat * 0.6, y - unitat * 0.6, unitat * 1.2, unitat * 1.2);
    ctx.restore();

    // Ull amb forma d'ametlla, inclinat amb la cantonada de dins cap avall (mirall horitzontal de la versió anterior).
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(-costat * 0.22);
    ctx.beginPath();
    ctx.moveTo(-meitatAmple, 0);
    ctx.quadraticCurveTo(0, -meitatAlt * 2, meitatAmple, 0);
    ctx.quadraticCurveTo(0, meitatAlt * 2, -meitatAmple, 0);
    ctx.fillStyle = `rgba(${o.color}, ${alfa})`;
    ctx.shadowColor = `rgba(${o.color}, ${alfa})`;
    ctx.shadowBlur = unitat * 0.25;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Nucli molt clar al mig.
    ctx.beginPath();
    ctx.ellipse(0, 0, meitatAmple * 0.55, Math.max(0.3, meitatAlt * 0.5), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 195, ${alfa * 0.85})`;
    ctx.fill();

    // Pupil·la vertical de bèstia, que segueix el jugador.
    if (o.pupilaVertical && meitatAlt > 2) {
      ctx.beginPath();
      ctx.ellipse(o.segueix * meitatAmple * 0.4, 0, meitatAmple * 0.13, meitatAlt * 0.95, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${alfa * 0.92})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

/** La figura de la imatge, sense res més al voltant. */
function dibuixaSilueta(
  ctx: CanvasRenderingContext2D,
  x: number,
  yPeus: number,
  alcada: number,
  alfa: number,
  ara: number,
  p: Personatge,
  imatge: HTMLImageElement | null
) {
  if (imatge === null || !imatge.complete || imatge.naturalWidth === 0) return;
  const ample = alcada * FIGURA.ample;
  const balanceig = Math.sin(ara / 1700 + p.llavor) * alcada * 0.012;
  ctx.globalAlpha = alfa;
  ctx.drawImage(imatge, x + balanceig - ample / 2, yPeus - alcada, ample, alcada);
  ctx.globalAlpha = 1;
}

/** Espanta la figura si és present i encara no ha marxat. */
function espantar(p: Personatge, ara: number) {
  if (p.v.tipus !== "silueta" || p.fase !== "present" || p.espantat) return;
  p.espantat = true;
  p.espantatDesde = ara;
  try {
    navigator.vibrate?.([80, 40, 80]);
  } catch {
    // Sense vibració: no passa res.
  }
}

export function EscenaUlls({
  mirada,
  arrossegar,
  figura3D = null,
  depuracio = null,
  rumbCami = null,
  nivellMicro = null,
  crit = 0,
  alPasses,
  alCaminar,
  alVeu,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const manual = useRef<Mirada>({ rumb: 0, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const passesRef = useRef(alPasses);
  const figura3DRef = useRef(figura3D);
  const depuracioRef = useRef(depuracio);
  const camiRef = useRef(rumbCami);
  const caminarRef = useRef(alCaminar);
  const veuRef = useRef(alVeu);
  const microRef = useRef(nivellMicro);
  const critRef = useRef(crit);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    passesRef.current = alPasses;
    figura3DRef.current = figura3D;
    depuracioRef.current = depuracio;
    camiRef.current = rumbCami;
    caminarRef.current = alCaminar;
    veuRef.current = alVeu;
    microRef.current = nivellMicro;
    critRef.current = crit;
  }, [arrossegar, alPasses, figura3D, depuracio, rumbCami, alCaminar, nivellMicro, crit, alVeu]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let amplada = 0;
    let alcada = 0;
    function mida() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      amplada = canvas.clientWidth;
      alcada = canvas.clientHeight;
      canvas.width = Math.round(amplada * dpr);
      canvas.height = Math.round(alcada * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    mida();
    window.addEventListener("resize", mida);

    const figura = new Image();
    figura.src = IMATGE_FIGURA;

    const inici = performance.now();
    // Només la figura. Els ulls a la foscor (VARIETATS.normal, alt, bestia, baix) continuen
    // definits: per tornar-los, afegeix-los aquí amb nou(VARIETATS.normal, 1500, inici), etc.
    const personatges: Personatge[] = [nou(VARIETATS.monjo, 4000, inici)];

    let anterior = inici;
    let frame = 0;
    // Detector de crits: el volum de fons s'aprèn a poc a poc i un crit és molt per sobre i dura.
    let sorollBase = 0.01;
    let fortMs = 0;
    let critVist = critRef.current;
    let nivellActual = 0;
    let llindarActual = 0.12;
    function dibuixa(ara: number) {
      if (!ctx) return;
      const dt = Math.min(100, ara - anterior);
      anterior = ara;
      const lectura = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);

      ctx.clearRect(0, 0, amplada, alcada);

      // Foscor: velat fosc i vinyeta, perquè el que brilla es noti.
      ctx.fillStyle = "rgba(0, 5, 14, 0.4)";
      ctx.fillRect(0, 0, amplada, alcada);
      const vinyeta = ctx.createRadialGradient(amplada / 2, alcada / 2, alcada * 0.25, amplada / 2, alcada / 2, alcada * 0.75);
      vinyeta.addColorStop(0, "rgba(0, 0, 0, 0)");
      vinyeta.addColorStop(1, "rgba(0, 0, 0, 0.7)");
      ctx.fillStyle = vinyeta;
      ctx.fillRect(0, 0, amplada, alcada);

      const fx = amplada / 2 / Math.tan((FOV_HORITZONTAL / 2) * RAD);
      // Crit del jugador: micròfon (volum sostingut molt per sobre del de fons) o botó de cridar.
      const lectorMicro = microRef.current;
      if (lectorMicro) {
        nivellActual = lectorMicro();
        sorollBase += (Math.min(nivellActual, sorollBase * 3 + 0.01) - sorollBase) * 0.003;
        llindarActual = Math.max(0.12, sorollBase * 5);
        fortMs = nivellActual > llindarActual ? fortMs + dt : Math.max(0, fortMs - dt * 2);
        if (fortMs > 300) {
          fortMs = 0;
          for (const q of personatges) espantar(q, ara);
        }
      }
      if (critRef.current !== critVist) {
        critVist = critRef.current;
        for (const q of personatges) espantar(q, ara);
      }

      const figuraActiva = personatges.some((q) => q.v.tipus === "silueta" && q.fase !== "amagat");
      // El més llunyà primer, perquè el que és a prop el tapi.
      const ordenats = [...personatges].sort((a, b) => b.dist - a.dist);
      for (const p of ordenats) {
        actualitza(p, lectura, ara, dt, figuraActiva, camiRef.current, passesRef.current, veuRef.current);
        const alfa = opacitat(p, ara);
        const estat3D = figura3DRef.current;
        if (p.v.tipus === "silueta" && estat3D) {
          // La dibuixa el 3D: només cal dir-li on és i quant es veu.
          const e = estat3D.current;
          e.alfa = alfa;
          e.dx = diferenciaRumb(p.rumb, lectura.rumb);
          e.dist = p.dist;
          e.elevacio = lectura.elevacio;
          e.altura = p.v.alcada;
          e.camina = p.camina;
          e.gir = p.gir;
          e.llavor = p.llavor;
          continue;
        }
        if (alfa <= 0) continue;
        const dx = diferenciaRumb(p.rumb, lectura.rumb);
        if (Math.abs(dx) > 80) continue;
        const x = amplada / 2 + fx * Math.tan(dx * RAD);
        const yDe = (alt: number) => {
          const elevacio = Math.atan((alt - ALCADA_CAMERA) / p.dist) / RAD;
          return alcada / 2 - fx * Math.tan((elevacio - lectura.elevacio) * RAD);
        };
        const tanca = (fins: number) => (fins > ara ? 1 : 0);
        const opcions: OpcionsUlls = {
          color: p.v.color,
          pupilaVertical: p.v.pupilaVertical,
          asim: p.asim,
          tancatEsq: tanca(p.parpellaEsq),
          tancatDre: tanca(p.parpellaDre),
          segueix: Math.max(-1, Math.min(1, -dx / 30)),
        };
        if (p.v.tipus === "ulls") {
          dibuixaUlls(ctx, x, yDe(p.alt), (fx / p.dist) * p.v.escala, alfa * llum(p, ara), opcions);
        } else {
          const peus = yDe(0);
          dibuixaSilueta(ctx, x, peus, peus - yDe(p.v.alcada), alfa, ara, p, figura);
        }
      }
      // Resplendor a la vora: guia cap a la figura des que se senten les passes.
      const guia = personatges.find((q) => q.v.tipus === "silueta");
      if (guia && !guia.espantat && (guia.fase === "passes" || guia.fase === "apareix" || guia.fase === "present")) {
        const enPasses = guia.fase === "passes";
        const progres = enPasses ? Math.max(0, Math.min(1, (ara - guia.passesInici) / DURADA_PASSES_MS)) : 1;
        dibuixaVora(ctx, amplada, alcada, diferenciaRumb(guia.rumb, lectura.rumb), enPasses ? 0.4 + 0.6 * progres : 1, enPasses ? 620 : 1400, ara);
      }

      // So de la caminada: les passes se senten mentre camina, més fortes com més a prop.
      const caminant = personatges.find((q) => q.v.tipus === "silueta" && q.fase === "present");
      if (caminant && caminarRef.current) {
        const recorregut = Math.max(0.01, caminant.distInici - DIST_PARADA);
        const aprop = 1 - Math.max(0, Math.min(1, (caminant.dist - DIST_PARADA) / recorregut));
        const dxC = diferenciaRumb(caminant.rumb, lectura.rumb);
        caminarRef.current(caminant.camina * (0.28 + 0.3 * aprop), dxC / 60);
      }

      const dep = depuracioRef.current;
      if (dep) {
        const f = personatges.find((q) => q.v.tipus === "silueta");
        dep.current = f
          ? `fase ${f.fase}
sensors ${arrossegarRef.current ? "NO (arrossegar)" : "sí"}
mirada rumb ${Math.round(lectura.rumb)}°  elev ${Math.round(lectura.elevacio)}°
figura a ${Math.round(diferenciaRumb(f.rumb, lectura.rumb))}° del centre, a ${f.dist.toFixed(1)} m
camí ${camiRef.current === null ? "—" : Math.round(camiRef.current) + "°"}
micro ${microRef.current ? nivellActual.toFixed(2) + " (llindar " + llindarActual.toFixed(2) + ")" : "no"}${f.espantat ? "  ESPANTAT" : ""}`
          : "";
      }
      frame = requestAnimationFrame(dibuixa);
    }
    frame = requestAnimationFrame(dibuixa);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", mida);
    };
  }, [mirada]);

  // Sense sensors: arrossegar gira la mirada (rumb amb l'horitzontal, inclinació amb la vertical).
  const punter = useRef<{ x: number; y: number } | null>(null);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-none"
      onPointerDown={(e) => {
        punter.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!arrossegarRef.current || !punter.current) return;
        const dx = e.clientX - punter.current.x;
        const dy = e.clientY - punter.current.y;
        punter.current = { x: e.clientX, y: e.clientY };
        const graus = FOV_HORITZONTAL / Math.max(1, e.currentTarget.clientWidth);
        manual.current = {
          rumb: (manual.current.rumb - dx * graus + 360) % 360,
          elevacio: Math.max(-60, Math.min(60, manual.current.elevacio + dy * graus)),
        };
      }}
      onPointerUp={() => {
        punter.current = null;
      }}
      onPointerCancel={() => {
        punter.current = null;
      }}
    />
  );
}
