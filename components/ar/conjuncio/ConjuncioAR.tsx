"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { disposarRunesCercle } from "@/components/ui/runes";
import { ELEMENTS as ELEMENTS_JOC } from "@/content/public/estacions";
import {
  azEl,
  baseDesMirada,
  codisDesDir,
  diffAz,
  enCamera,
  dirDesAzEl,
  dirDesCodis,
  errorAngular,
  projecta,
  rollGraus,
  type Base,
  type V3,
} from "@/lib/conjuncio/cel";
import { useSensorsCel } from "./sensors";
import { crearGema, type EstatGema, type Gema } from "./gema";
import {
  iniciarCarregaLock,
  iniciarMusicaFons,
  iniciarSorollRadio,
  sonAconseguit,
  sonAmbient,
  sonEstrellaEncaixada,
  sonTocBoto,
  type Carrega,
} from "@/lib/sorollConjuncio";

/**
 * PROTOTIP LOCAL — «La Conjunció dels Astres» (no forma part del joc i no es publica mai).
 *
 * Cada fita revela DOS números de 3 xifres, X (est–oest) i Z (nord–sud), que són les coordenades d'un punt
 * del cel (veure cel.ts). Les 5 estrelles dels elements són els vèrtexs d'un pentagrama que envolta el
 * jugador.
 *
 * - Mode AR: amb brúixola/orientació i GPS concedits, el mòbil és el sintonitzador: s'apunta al cel (sobre la
 *   càmera) i, mentre es gira, els anells s'inclinen en 3D (X = elevació, Y = azimut, Z = gir lateral), l'ona
 *   s'aclareix i l'estrella apareix i s'enganxa al lloc. Mantenint l'apuntat uns 1,5 s fa lock.
 * - Mode dials: només si no hi ha els permisos (o no es volen donar). Sis dials (X i Z, de tres xifres) donen
 *   la mateixa direcció, i tot el que ve després (nitidesa, anells, constel·lacions, gravetat) és idèntic.
 *
 * ATENCIÓ: les coordenades i les claus de ressonància són NOMÉS de prova i viuen al client. Si mai
 * passa a ser del joc, tot això (solució + proximitat) ha de viure al servidor (content/private/ + API).
 * `?sim` a l'URL activa un botó per simular el mòbil amb el ratolí (arrossegar per girar el cel).
 */

const senseSubscripcio = () => () => {};

/** Pedra filosofal: segons després d'encaixar l'últim astre abans que aparegui, i durada (s) de la caiguda. */
const GEMA_RETARD = 1.4;
const GEMA_CAIGUDA = 7;

const ELEMENTS = [
  { id: "aigua", nom: "Aigua", color: "#4a9bff", pos: [-0.9, -0.5, 1.6] },
  { id: "foc", nom: "Foc", color: "#ff6a35", pos: [0.8, -0.8, 2.2] },
  { id: "terra", nom: "Terra", color: "#8fd13a", pos: [1.1, 0.6, 1.2] },
  { id: "aire", nom: "Aire", color: "#3fd4f0", pos: [-0.2, 0.9, 2.6] },
  { id: "anima", nom: "Ànima", color: "#c27bff", pos: [-1.2, 0.3, 2.0] },
] as const;

/** Vèrtexs del pentagrama en un pla inclinat: el z que en resulta és la profunditat que es conserva. */
function vertexsPentagrama(): V3[] {
  const r = 0.62;
  const rx = 0.55;
  const ry = -0.5;
  return ELEMENTS.map((_, i) => {
    // Els vèrtexs segueixen l'ordre geogràfic de les fites (no l'ordre dels elements).
    const a = -Math.PI / 2 + (posCircular(i) * 2 * Math.PI) / 5;
    let x = r * Math.cos(a);
    let y = r * Math.sin(a);
    let z = 0;
    [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
    [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
    return [x, y, z + 0.9];
  });
}

/** Anells de runes concèntrics (viewBox 400): un per element, de fora cap a dins. */
const VB = 400;
const RADIS_ANELLS = [190, 172, 154, 136, 118];
/** Àrea gran al voltant de cada estrella (graus): dins d'aquesta, la nota de càrrega ja sona i puja. */
const AREA_CARREGA = 20;
const ALCADA_RUNA = 9;
/** Velocitat de gir (°/s) mentre l'anell no és encaixat; signes alterns, com al Stargate. */
const VELOCITATS = [11, -17, 24, -8, 15];
/** Alçada (fracció) del centre de l'escena: deixa lloc al sintonitzador de sota. */
const CENTRE_Y = 0.38;
/** Centre de l'escena en mode AR (el panell de sota és més baix: no hi ha dials). */
const CENTRE_AR = 0.45;

/** Arc de 9° al capdamunt d'un anell: el «xevró» que s'encén en encaixar. */
function arcXevro(r: number): string {
  const a = (4.5 * Math.PI) / 180;
  const rm = r + ALCADA_RUNA / 2;
  const x = Math.sin(a) * rm;
  const y = Math.cos(a) * rm;
  return `M${VB / 2 - x} ${VB / 2 - y} A${rm} ${rm} 0 0 1 ${VB / 2 + x} ${VB / 2 - y}`;
}

/**
 * Estrelles que l'equip ha vist. El servidor només en retorna la més propera (i, en fer lock, la que ha encaixat):
 * la resta són null i no es dibuixen ni tenen lock. Mai no hi ha les cinc posicions al client a la vegada.
 */
const coneguda: (V3 | null)[] = [null, null, null, null, null];
/** Lock pendent de confirmar al servidor, per estrella (evita enviar-ne una altra mentre s'espera). */
const lockPendent = [false, false, false, false, false];
/** Ordre per azimut de les estrelles (el pentagrama s'uneix cada vèrtex amb el de dos llocs més enllà). Només es
 *  coneix quan les cinc estrelles són vistes. */
let ordreCiclic: number[] = [0, 1, 2, 3, 4];

/** Posició de l'estrella al pentagrama de la pantalla (0-4 segons l'ordre cíclic). */
function posCircular(i: number): number {
  return ordreCiclic.indexOf(i);
}
/** Element amb el qual s'uneix cada element en dibuixar el pentagrama. */
function liniaPentagrama(i: number): number {
  return ordreCiclic[(posCircular(i) + 2) % 5];
}
/** Quan les cinc estrelles són conegudes, es calcula l'ordre pel seu azimut (la forma real del pentagrama). */
function calculaOrdreCiclic() {
  if (coneguda.some((d) => d === null)) return;
  ordreCiclic = [0, 1, 2, 3, 4].sort((a, b) => azEl(coneguda[a]!).az - azEl(coneguda[b]!).az);
}
/** Xifres (X i Z, tres dígits cadascun) de l'estrella del canal, o null si encara no s'ha vist. */
function digitsObjectiu(i: number): number[] | null {
  const d = coneguda[i];
  if (!d) return null;
  const [x, z] = codisDesDir(d);
  return [...String(x).padStart(3, '0'), ...String(z).padStart(3, '0')].map(Number);
}

/** Demana al servidor si l'equip apunta a l'estrella `i` (sense enviar-ne la posició si no encaixa). */
async function consultaLock(i: number, aim: V3, mode: 'mobil' | 'dials'): Promise<boolean> {
  if (lockPendent[i]) return false;
  lockPendent[i] = true;
  try {
    const res = await fetch('/api/conjuncio/lock', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ i, aim, mode }),
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data: { ok: boolean; dir?: V3 } = await res.json();
    if (!data.ok || !data.dir) return false;
    coneguda[i] = data.dir;
    calculaOrdreCiclic();
    return true;
  } catch {
    return false;
  } finally {
    lockPendent[i] = false;
  }
}

/** Demana al servidor quina estrella és més a prop de `aim` (només n'envia una, dins de l'àrea gran). */
async function consultaMira(aim: V3): Promise<void> {
  try {
    const res = await fetch('/api/conjuncio/mira', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ aim }),
      cache: 'no-store',
    });
    if (!res.ok) return;
    const data: { estrella: { i: number; dir: V3 } | null } = await res.json();
    if (data.estrella) coneguda[data.estrella.i] = data.estrella.dir;
  } catch {
    // Sense xarxa, l'estrella simplement no es veu aquest cop.
  }
}

/** Direcció del cel que marquen els dials (els dígits arrodonits). */
function dirDeDials(f: number[]): V3 {
  const r = f.map((v) => Math.round(v));
  return dirDesCodis(r[0] * 100 + r[1] * 10 + r[2], r[3] * 100 + r[4] * 10 + r[5]);
}

const INICIALS: number[][] = [
  [4, 1, 2, 3, 0, 8],
  [0, 8, 5, 7, 2, 1],
  [5, 4, 0, 1, 9, 4],
  [9, 0, 5, 6, 6, 0],
  [2, 6, 0, 8, 3, 7],
];
const NOM_DIALS = ['Centenes', 'Desenes', 'Unitats'];
const NOM_GRUP = ['X · est–oest', 'Z · nord–sud'];

/** Estat que calcula el bucle a cada fotograma i comparteixen l'oscil·loscopi i els dials (prototip: variables de mòdul). */
const CLARITAT = [0, 0, 0, 0, 0];
const FREQ = [0, 0, 0, 0, 0];

/** Nitidesa del senyal (0 = soroll pur, 1 = sintonitzat) segons l'error angular de cada canal (la calcula el bucle). */
function nitidesa(_d: number[], i: number): number {
  return CLARITAT[i];
}

/** Ressonància d'una estrella del cel amb un dial: ample (en unitats de freqüència) de la banda. */
const AMPLE_RESSONANCIA = 16;
/** Decalatge de la clau de les estrelles pròpies de cada element respecte a la seva freqüència. */
const DECALATGES = [-10, -6, -2, 3, 7, 11];

/** Intensitat de l'atracció gravitatòria (px³/s²) entre els astres conjurats. */
const GRAVETAT = 380000;

const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const GRIS: [number, number, number] = [150, 156, 184];
function hexRgb(h: string): [number, number, number] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
/** Color que va del gris (desafinat) al de l'element (sintonitzat). */
function colorSenyal(hex: string, c: number): string {
  const e = hexRgb(hex);
  const m = GRIS.map((g, k) => Math.round(lerp(g, e[k], c)));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

/** Igual que `colorSenyal` però amb transparència. */
function colorSenyalA(hex: string, c: number, alfa: number): string {
  const e = hexRgb(hex);
  const m = GRIS.map((g, k) => Math.round(lerp(g, e[k], c)));
  return `rgba(${m[0]},${m[1]},${m[2]},${alfa.toFixed(3)})`;
}

/** Proximitat (0–1) d'una sola xifra a la seva xifra objectiu. */
function proximitatXifra(v: number, i: number, j: number): number {
  const obj = digitsObjectiu(i);
  if (!obj) return 0;
  return Math.pow(Math.max(0, 1 - Math.abs(v - obj[j]) / 5), 1.4);
}

function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Estrella {
  p: V3;
  /** Direcció al cel (mode AR). */
  d: V3;
  m: number;
  /** Clau de ressonància (0–999), o -1 si no ressona amb res. */
  k: number;
  /** Element al qual pertany de debò (només les estrelles de la seva constel·lació), o -1. */
  el: number;
}

export interface ConjuncioARProps {
  /** L'equip continua després de la gema (el botó surt uns 10 s després que s'hi arribi). */
  onContinuar: () => void;
}

export function ConjuncioAR({ onContinuar }: ConjuncioARProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Canvas WebGL de la pedra filosofal (per sobre dels anells). */
  const gemaRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [vals, setVals] = useState<number[][]>(INICIALS);
  const [alineats, setAlineats] = useState<boolean[]>([false, false, false, false, false]);
  const [actiu, setActiu] = useState(0);
  /** Quina de les dues coordenades (0 = X, 1 = Z) editen els tres dials. */
  const [grup, setGrup] = useState(0);
  /** inici: cal activar els sensors · demanant: esperant els permisos · ar: apuntant amb el mòbil · dials: sense sensors. */
  const [modeEstat, setMode] = useState<"inici" | "demanant" | "ar" | "dials">("inici");
  const [gpsOk, setGpsOk] = useState<boolean | null>(null);
  /** `?sim` a l'URL: botó per simular el mòbil amb el ratolí (només per provar a l'ordinador). */
  const simulacio = useSyncExternalStore(
    senseSubscripcio,
    () => window.location.search.includes("sim"),
    () => false,
  );
  /** Números X i Z cap on apunta ara el mòbil (només en mode AR). */
  const { base: baseSensors, estat: estatSensors, demanar: demanarSensors } = useSensorsCel();
  // Sense GPS o sense sensors d'orientació → dials. Amb tots dos → AR. (Derivat: no cal cap efecte.)
  const mode: "inici" | "demanant" | "ar" | "dials" =
    modeEstat === "demanant" && gpsOk !== null
      ? !gpsOk || estatSensors === "denegat" || estatSensors === "no-disponible"
        ? "dials"
        : estatSensors === "actiu"
          ? "ar"
          : "demanant"
      : modeEstat;
  const anellsRef = useRef<(SVGGElement | null)[]>([]);
  /** Un <svg> per anell: així cada anell es pot inclinar en 3D de manera independent. */
  const svgsRef = useRef<(SVGSVGElement | null)[]>([]);
  const runes = useMemo(
    () => RADIS_ANELLS.map((r) => disposarRunesCercle(VB / 2, VB / 2, r, ALCADA_RUNA, { separacio: 2 })),
    [],
  );
  const alineatsRef = useRef(alineats);
  /** Valors decimals de cada dial (el que dibuixen els canvas); `vals` n'és l'arrodoniment per a la UI. */
  const valsRef = useRef<number[][]>(INICIALS.map((d) => [...d]));
  const actiuRef = useRef(actiu);
  /** Estat de la vista AR que llegeix el bucle de dibuix. */
  /** Fil màgic (duende) que guia cap a l'estrella del canal actiu. Més endavant podria ser una pista amb cost. */
  const [guia, setGuia] = useState(true);
  /** Fites aconseguides al joc: només d'aquests elements es pot demanar el fil màgic i es poden sintonitzar. */
  const [fites, setFites] = useState<boolean[]>([false, false, false, false, false]);
  const arRef = useRef({
    actiu: false,
    guia: true,
    fites: [false, false, false, false, false] as boolean[],
    base: null as Base | null,
    video: false,
    sim: false,
    simRumb: 0,
    simElev: 20,
  });
  const bloquejarRef = useRef<(i: number) => void>(() => {});
  useEffect(() => {
    alineatsRef.current = alineats;
    actiuRef.current = actiu;
  }, [alineats, actiu]);
  useEffect(() => {
    arRef.current.actiu = mode === 'ar';
  }, [mode]);
  useEffect(() => {
    arRef.current.guia = guia;
  }, [guia]);
  useEffect(() => {
    arRef.current.fites = fites;
  }, [fites]);

  // Fites aconseguides: es llegeixen de /api/estat (com fa el Gresol). Sense equip (prova local) es consideren totes
  // aconseguides, o només les de `?fites=aigua,foc` si s'indica, per poder provar els dos estats.
  useEffect(() => {
    let cancelat = false;
    // Prova amb ?sim: `?fites=aigua,foc` marca les fites aconseguides sense equip.
    const forcades = new URLSearchParams(window.location.search).get('fites');
    if (window.location.search.includes('sim') && forcades) {
      const noms = forcades.split(',');
      const f = ELEMENTS.map((el) => noms.includes(el.id));
      setFites(f);
      setActiu(Math.max(0, f.indexOf(true)));
      return;
    }
    fetch('/api/estat', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data: { estacions: { element?: string; progres: { resolta: boolean } }[] } = await res.json();
        return ELEMENTS.map((el) => data.estacions.some((e) => e.element === el.id && e.progres.resolta));
      })
      // Sense dades de l'equip no es pot triar cap canal: només es veuen els logos.
      .catch(() => ELEMENTS.map(() => false))
      .then((f) => {
        if (cancelat) return;
        setFites(f);
        setActiu(Math.max(0, f.indexOf(true)));
      });
    return () => {
      cancelat = true;
    };
  }, []);
  const completa = alineats.every(Boolean);
  useEffect(() => {
    if (completa) sonAconseguit();
  }, [completa]);
  // Uns 10 s després de la gema, surt el botó per continuar.
  const [continuaVisible, setContinuaVisible] = useState(false);
  useEffect(() => {
    if (!completa) return;
    const id = setTimeout(() => setContinuaVisible(true), 10_000);
    return () => clearTimeout(id);
  }, [completa]);
  // Soroll de ràdio mentre es sintonitza amb els dials (s'atura en completar-ho tot).
  // El volum el marca el bucle de dibuix: com menys nítid és el canal actiu, més soroll.
  const radioRef = useRef<((v: number) => void) | null>(null);
  // Nota de càrrega mentre s'apunta a una estrella (només en AR, on es fa el lock).
  const carregaRef = useRef<{ i: number; so: Carrega } | null>(null);
  useEffect(
    () => () => {
      carregaRef.current?.so.aturar();
      carregaRef.current = null;
    },
    [mode],
  );
  useEffect(() => {
    if (mode !== "dials" || completa) return;
    const radio = iniciarSorollRadio();
    radioRef.current = radio.volum;
    return () => {
      radioRef.current = null;
      radio.aturar();
    };
  }, [mode, completa]);
  // Música de fons en bucle mentre s'hi juga (AR o dials).
  const jugant = mode === "ar" || mode === "dials";
  useEffect(() => {
    if (!jugant) return;
    return iniciarMusicaFons();
  }, [jugant]);
  // Ambient de fons mentre s'hi juga: 5 s d'un dels sons, de tant en tant.
  useEffect(() => {
    if (mode !== "ar" && mode !== "dials") return;
    const primer = setTimeout(sonAmbient, 10_000);
    const id = setInterval(sonAmbient, 35_000);
    return () => {
      clearTimeout(primer);
      clearInterval(id);
    };
  }, [mode]);

  // Lock d'un canal (en mode AR el decideix el bucle de dibuix en mantenir l'apuntat).
  useEffect(() => {
    bloquejarRef.current = (i: number) => {
      const obj = digitsObjectiu(i);
      if (alineatsRef.current[i] || !obj) return;
      sonEstrellaEncaixada();
      valsRef.current[i] = [...obj];
      setVals((a) => a.map((d, k) => (k === i ? [...obj] : d)));
      setAlineats((a) => a.map((x, k) => (k === i ? true : x)));
      // En mode AR, el fil màgic passa sol a l'estrella següent que falta.
      if (arRef.current.actiu) {
        const seguent = ELEMENTS.findIndex((_, k) => k !== i && !alineatsRef.current[k] && arRef.current.fites[k]);
        if (seguent >= 0) setTimeout(() => setActiu(seguent), 1500);
      }
    };
  }, []);

  function sintonitza(i: number, j: number, x: number) {
    if (alineatsRef.current[i]) return;
    const v = Math.min(9, Math.max(0, x));
    valsRef.current[i][j] = v;
    const r = Math.round(v);
    setVals((a) => (a[i][j] === r ? a : a.map((d, k) => (k === i ? d.map((q, n) => (n === j ? r : q)) : d))));
  }

  // Dials: quan les sis xifres queden clavades a l'objectiu, el senyal s'encaixa i es passa al següent canal.
  // El servidor decideix si els dials són a l'estrella (les xifres no es comparen al client).
  const clauActiu = vals[actiu].join('');
  useEffect(() => {
    if (mode === 'ar' || alineatsRef.current[actiu]) return;
    const id = setTimeout(async () => {
      const aim = dirDeDials(valsRef.current[actiu]);
      if (!(await consultaLock(actiu, aim, 'dials'))) return;
      bloquejarRef.current(actiu);
      const seguent = ELEMENTS.findIndex((_, k) => k !== actiu && !alineatsRef.current[k] && arRef.current.fites[k]);
      if (seguent >= 0) setTimeout(() => setActiu(seguent), 1100);
    }, 800);
    return () => clearTimeout(id);
  }, [clauActiu, actiu, mode]);

  // Mentre s'apunta (mòbil o dials), el servidor diu quina estrella és més a prop i la fa visible.
  useEffect(() => {
    if (mode !== 'ar' && mode !== 'dials') return;
    const id = setInterval(() => {
      const ar = arRef.current;
      if (ar.actiu && ar.base) consultaMira(ar.base.f);
      else if (!ar.actiu) consultaMira(dirDeDials(valsRef.current[actiuRef.current]));
    }, 300);
    return () => clearInterval(id);
  }, [mode]);

  /** Demana alhora brúixola/orientació, GPS i càmera (ha de ser dins del gest de l'usuari, per iOS). */
  async function activar() {
    sonTocBoto();
    setMode('demanant');
    const pSensors = demanarSensors();
    const pGps = new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) return resolve(false);
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 15_000 },
      );
    });
    const pCamera: Promise<MediaStream | null> = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).catch(() => null)
      : Promise.resolve(null);
    const [gps, stream] = await Promise.all([pGps, pCamera, pSensors]);
    if (stream && videoRef.current) {
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
      arRef.current.video = true;
    }
    setGpsOk(gps);
  }

  function simular() {
    sonTocBoto();
    arRef.current.sim = true;
    setMode('ar');
  }

  // La càmera només es manté oberta en mode AR.
  useEffect(() => {
    if (mode === 'ar') return;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    arRef.current.video = false;
  }, [mode]);
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pedra filosofal (3D): només es crea quan cal, i si no hi ha WebGL es queda el resplendor del canvas 2D.
    const gemaCanvas = gemaRef.current;
    let gema: Gema | null = null;
    let gemaFallida = false;
    let gemaT0 = -1;
    const historialGema: { x: number; y: number }[] = [];

    const rnd = mulberry(1472);
    let destins = vertexsPentagrama();
    // Direcció aleatòria del cel (sobretot per sobre de l'horitzó).
    const dirAleatoria = (): V3 => {
      const u = rnd() * 1.25 - 0.25;
      const az = rnd() * 6.283;
      const c = Math.sqrt(1 - u * u);
      return [Math.sin(az) * c, u, Math.cos(az) * c];
    };
    const fons: Estrella[] = Array.from({ length: 240 }, () => ({
      p: [(rnd() - 0.5) * 7, (rnd() - 0.5) * 5, rnd() * 5 + 0.3] as V3,
      d: dirAleatoria(),
      m: rnd() * 1.4 + 0.4,
      k: rnd() < 0.55 ? Math.floor(rnd() * 1000) : -1,
      el: -1,
    }));
    // Estrelles pròpies de cada element: un cúmul al voltant del seu punt del cel, amb claus properes a la seva X.
    // El cúmul es crea quan el servidor ha confirmat l'estrella (abans no es pot dibuixar: no es coneix on és).
    const cumulFet = [false, false, false, false, false];
    const afegeixCumul = (i: number) => {
      const t0 = coneguda[i];
      if (!t0 || cumulFet[i]) return;
      cumulFet[i] = true;
      const x0 = codisDesDir(t0)[0];
      DECALATGES.forEach((o) => {
        const dj: V3 = [t0[0] + (rnd() - 0.5) * 0.22, t0[1] + (rnd() - 0.5) * 0.22, t0[2] + (rnd() - 0.5) * 0.22];
        const l = Math.hypot(dj[0], dj[1], dj[2]);
        fons.push({
          p: [destins[i][0] + (rnd() - 0.5) * 0.8, destins[i][1] + (rnd() - 0.5) * 0.8, destins[i][2] + (rnd() - 0.5) * 0.8],
          d: [dj[0] / l, dj[1] / l, dj[2] / l],
          m: rnd() * 1.4 + 0.4,
          k: x0 + o,
          el: i,
        });
      });
    };
    const aimErr = ELEMENTS.map(() => ({ err: 180, dAz: 0, dEl: 0 }));
    // Punta del fil que guia (el duende): només en defineix el recorregut, no es dibuixa.
    const duende = { x: 0, y: 0, ini: false };
    // Triple zoom de l'anell quan l'astre es grava al cel: instant en què ha començat, i si ja estava encaixat.
    const zoomInici = [-1, -1, -1, -1, -1];
    const abansEncaixat = [false, false, false, false, false];
    const aguant = [0, 0, 0, 0, 0];
    // Túnel de partícules: anells al voltant de l'eix de la càmera. d = -1 s'acosta (blau), d = +1 s'allunya (vermell).
    const nouTunel = (z: number): V3 => {
      const ang = rnd() * 6.283;
      const r = 0.12 + Math.pow(rnd(), 1.3) * 3;
      return [Math.cos(ang) * r, Math.sin(ang) * r, z];
    };
    const particules = Array.from({ length: 80 }, (_, n) => ({
      p: nouTunel(rnd() * 15 - 2),
      v: 0.6 + rnd() * 0.9,
      d: n % 3 === 0 ? 1 : -1,
    }));
    // Matèria que s'escapa d'un astre conjurat, es corba per la gravetat dels altres i hi és capturada.
    const materia: { x: number; y: number; vx: number; vy: number; vida: number; max: number; o: number; cua: number[] }[] = [];
    /** Pulsació de cada astre en capturar matèria (decau sola). */
    const pulso = [0, 0, 0, 0, 0];
    const espurnes: { x: number; y: number; vx: number; vy: number; vida: number; max: number; c: [number, number, number] }[] = [];
    const t = [0, 0, 0, 0, 0];
    let zoom = 0;
    const angleAnell = RADIS_ANELLS.map((_, i) => i * 71);
    /** Inclinació 3D actual [X, Y, Z] en graus de cada anell. */
    const tilt = RADIS_ANELLS.map(() => [0, 0, 0]);
    const arrossegat = { yaw: 0, pitch: 0 };
    let arrossega: { x: number; y: number } | null = null;
    let w = 0;
    let h = 0;

    function mida() {
      const r = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    mida();
    const ro = new ResizeObserver(mida);
    ro.observe(canvas);

    const onDown = (e: PointerEvent) => {
      arrossega = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!arrossega) return;
      const dx = e.clientX - arrossega.x;
      const dy = e.clientY - arrossega.y;
      if (arRef.current.actiu && arRef.current.sim) {
        // Simulació del mòbil: arrossegar «agafa» el cel.
        arRef.current.simRumb = (arRef.current.simRumb - dx * 0.25 + 360) % 360;
        arRef.current.simElev = Math.max(-80, Math.min(89, arRef.current.simElev + dy * 0.2));
      } else if (!arRef.current.actiu) {
        arrossegat.yaw += dx * 0.006;
        arrossegat.pitch = Math.max(-0.7, Math.min(0.7, arrossegat.pitch + dy * 0.004));
      }
      arrossega = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      arrossega = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    let raf = 0;
    let ultim = performance.now();
    const inici = ultim;

    function frame(ara: number) {
      const dt = Math.min((ara - ultim) / 1000, 0.05);
      ultim = ara;
      const temps = (ara - inici) / 1000;
      const al = alineatsRef.current;
      const tot = al.every(Boolean);
      const ar = arRef.current;
      if (ar.actiu) ar.base = ar.sim ? baseDesMirada(ar.simRumb, ar.simElev) : baseSensors.current;
      const AR = ar.actiu && ar.base !== null;
      const cx = w / 2;
      const cy = h * (AR ? CENTRE_AR : CENTRE_Y);

      for (let i = 0; i < 5; i++) afegeixCumul(i);
      destins = vertexsPentagrama();
      // Cap on apunta cada canal (els dials o el mòbil) → error angular respecte a la seva estrella → nitidesa.
      // Una estrella no vista encara no té error (és lluny, i no es pot encaixar sense que el servidor la confirmi).
      for (let i = 0; i < 5; i++) {
        let aim: V3;
        if (AR) aim = ar.base!.f;
        else aim = dirDeDials(valsRef.current[i]);
        const obj = coneguda[i];
        const ae = azEl(aim);
        const oe = obj ? azEl(obj) : null;
        const dAz = oe ? diffAz(ae.az, oe.az) : 0;
        const dEl = oe ? ae.el - oe.el : 0;
        const err = obj ? errorAngular(aim, obj) : 180;
        aimErr[i] = { err, dAz, dEl };
        CLARITAT[i] = al[i] ? 1 : Math.pow(Math.max(0, 1 - err / 40), 1.8);
        FREQ[i] = (obj ? codisDesDir(obj)[0] : 500) + (dAz + dEl) * 2.5;
      }
      if (!AR) radioRef.current?.(0.06 + 0.4 * (1 - CLARITAT[actiuRef.current]));
      if (AR) {
        // Lock: mantenir l'apuntat (menys de 3°) 1,5 s. El canal més «calent» passa a ser l'actiu.
        // Només es canvia de canal si un altre és clarament més «calent» (el fil màgic segueix el canal triat).
        let millor = -1;
        let cMillor = Math.max(0.5, (al[actiuRef.current] ? 0 : CLARITAT[actiuRef.current]) + 0.15);
        for (let i = 0; i < 5; i++) {
          // Només les fites aconseguides es poden bloquejar i prendre com a canal actiu (com als dials).
          if (al[i] || !ar.fites[i]) continue;
          aguant[i] = aimErr[i].err < 3 ? aguant[i] + dt : 0;
          if (aguant[i] > 1.5) {
            aguant[i] = 0;
            // El servidor confirma l'encaix; només aleshores el canal queda bloquejat.
            consultaLock(i, ar.base!.f, 'mobil').then((ok) => {
              if (ok) bloquejarRef.current(i);
            });
          }
          if (CLARITAT[i] > cMillor) {
            cMillor = CLARITAT[i];
            millor = i;
          }
        }
        if (millor >= 0 && millor !== actiuRef.current) setActiu(millor);
        // Nota de càrrega: dins de l'àrea gran, el volum depèn de la distància a l'estrella (com més a prop, més fort).
        const dins = [0, 1, 2, 3, 4].find((i) => !al[i] && aimErr[i].err < AREA_CARREGA) ?? -1;
        let carr = carregaRef.current;
        if (carr && (carr.i !== dins || al[carr.i])) {
          carr.so.aturar();
          carregaRef.current = carr = null;
        }
        if (dins >= 0) {
          if (!carr) carr = carregaRef.current = { i: dins, so: iniciarCarregaLock(dins) };
          carr.so.progres(1 - aimErr[dins].err / AREA_CARREGA);
        }
      }

      for (let i = 0; i < 5; i++) t[i] = Math.min(1, Math.max(0, t[i] + (al[i] ? dt / 2.2 : 0)));
      zoom = lerp(zoom, tot ? 1 : 0, 1 - Math.exp(-dt * 1.6));
      if (!arrossega) {
        arrossegat.yaw *= Math.exp(-dt * 0.6);
        arrossegat.pitch *= Math.exp(-dt * 0.6);
      }

      // El cel gira lent; un cop completat només es balanceja, per mostrar que la 3D es manté.
      const yaw = (tot ? Math.sin(temps * 0.5) * 0.28 : temps * 0.05) + arrossegat.yaw;
      const pitch = (tot ? Math.cos(temps * 0.4) * 0.1 : 0) + arrossegat.pitch;
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const focal = Math.min(w, h * 1.3) * (1.0 + zoom * 0.25);
      const cam = 3.2 - zoom * 0.5;

      function proj(p: V3) {
        // El centre de la rotació és el del pentagrama (z≈0.9).
        const x0 = p[0];
        const y0 = p[1];
        const z0 = p[2] - 0.9;
        const x1 = x0 * cyw + z0 * syw;
        const z1 = -x0 * syw + z0 * cyw;
        const y1 = y0 * cp - z1 * sp;
        const z2 = y0 * sp + z1 * cp;
        const s = focal / Math.max(0.2, cam + z2 + 0.9);
        return { x: cx + x1 * s, y: cy + y1 * s, s };
      }

      // Mode AR: el cel virtual es dibuixa sobre la càmera (un vel fosc perquè les estrelles es vegin de dia).
      const focalAR = w * 0.98;
      const projAR = (d: V3) => projecta(d, ar.base!, focalAR, cx, cy);
      if (AR) {
        ctx!.clearRect(0, 0, w, h);
        ctx!.fillStyle = ar.video ? 'rgba(5,4,15,0.4)' : '#05040f';
        ctx!.fillRect(0, 0, w, h);
      } else {
        const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
        grad.addColorStop(0, "#14123a");
        grad.addColorStop(1, "#05040f");
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      // Estrelles del cel: més lluny = més petites i apagades.
      const qs = fons.map((e) => (AR ? { ...projAR(e.d), s: focal * 0.25 } : { ...proj(e.p), vis: true }));
      fons.forEach((e, j) => {
        const q = qs[j];
        if (!q.vis) return;
        const prof = AR ? 0.55 : Math.min(1, Math.max(0, q.s / (focal / 2)));
        const a = (0.25 + prof * 0.6) * (0.75 + 0.25 * Math.sin(temps * e.m * 2 + e.p[0] * 9));
        ctx!.fillStyle = `rgba(235,235,255,${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(q.x, q.y, 0.4 + prof * 1.5, 0, 6.283);
        ctx!.fill();
      });

      // Partícules que vénen de l'infinit cap a la càmera: ratlles que s'allarguen i s'aclareixen en acostar-se.
      // Van més de pressa com més nítid és el senyal del canal actiu i en completar-ho tot.
      const cActiu = al[actiuRef.current] ? 1 : nitidesa(valsRef.current[actiuRef.current], actiuRef.current);
      const velocitatPart = 0.7 + 2 * cActiu + 1.5 * zoom;
      ctx!.lineCap = "round";
      for (const pt of particules) {
        const pas = velocitatPart * pt.v * dt;
        pt.p[2] += pt.d * pas;
        if (pt.d < 0 ? pt.p[2] < -2.2 : pt.p[2] > 15) {
          pt.p = nouTunel(pt.d < 0 ? 13 + rnd() * 3 : -2.1 + rnd() * 0.5);
          continue;
        }
        // Sense la rotació del cel: el punt de fuga és sempre el centre, la direcció cap on mira la càmera.
        // La cua de la ratlla és on era fa un moment; com més ràpid, més llarga (efecte túnel).
        const llarg = velocitatPart * pt.v * 0.22;
        const sA = focal / Math.max(0.2, cam + pt.p[2] + 0.9);
        const sB = focal / Math.max(0.2, cam + pt.p[2] - pt.d * llarg + 0.9);
        const a = { x: cx + pt.p[0] * sA, y: cy + pt.p[1] * sA };
        const b = { x: cx + pt.p[0] * sB, y: cy + pt.p[1] * sB };
        // Lluny, la perspectiva les fa minúscules: es garanteix una llargada mínima en pantalla (radial) perquè es vegin al centre.
        const dist = Math.hypot(a.x - cx, a.y - cy);
        if (dist > 0.5 && Math.hypot(a.x - b.x, a.y - b.y) < 9) {
          b.x = a.x + (pt.d * 9 * (a.x - cx)) / dist;
          b.y = a.y + (pt.d * 9 * (a.y - cy)) / dist;
        }
        const prox = Math.min(1, Math.max(0, 1 - (pt.p[2] + 2.2) / 15));
        // Entren i surten suaument per no aparèixer de cop.
        const entra = pt.d < 0 ? (pt.p[2] > 11 ? (13 - pt.p[2]) / 2 : 1) : Math.min(1, (pt.p[2] + 2.2) / 1.5);
        const surt = pt.d < 0 ? Math.min(1, (pt.p[2] + 2.2) / 1.2) : pt.p[2] > 11 ? (15 - pt.p[2]) / 4 : 1;
        const alfa = Math.min(1, prox * 1.6 + 0.3) * Math.max(0, Math.min(entra, surt));
        if (alfa <= 0.02 || (a.x < -60 && b.x < -60) || (a.x > w + 60 && b.x > w + 60) || (a.y < -60 && b.y < -60) || (a.y > h + 60 && b.y > h + 60)) continue;
        // Efecte Doppler: les que s'acosten tiren a blau; les que s'allunyen, a vermell.
        ctx!.strokeStyle = pt.d < 0 ? `hsl(${215 + 10 * prox} 100% ${68 + 24 * prox}%)` : `hsl(${4 + 8 * prox} 95% ${52 + 10 * prox}%)`;
        ctx!.globalAlpha = Math.max(0, alfa * 0.4);
        ctx!.lineWidth = 0.3 + prox * 0.7;
        ctx!.beginPath();
        ctx!.moveTo(b.x, b.y);
        ctx!.lineTo(a.x, a.y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      const pos = ELEMENTS.map((el, i) => {
        const k = ease(t[i]);
        // Sense encaixar, l'astre s'acosta una mica a mesura que el senyal es torna nítid.
        if (AR) {
          // L'estrella és al seu lloc del cel; només se'n veu el resplendor si s'hi apunta a prop.
          const od = coneguda[i];
          const q = od ? projAR(od) : { x: -9999, y: -9999, vis: false };
          return { x: q.x, y: q.y, s: focal * 0.2, k, vis: q.vis };
        }
        const kp = Math.max(k, 0.85 * nitidesa(valsRef.current[i], i));
        const p: V3 = [lerp(el.pos[0], destins[i][0], kp), lerp(el.pos[1], destins[i][1], kp), lerp(el.pos[2], destins[i][2], kp)];
        return { ...proj(p), k, vis: true };
      });

      // Ressonància: l'estrella de cada element s'enllaça amb les estrelles del cel que sonen a la seva freqüència
      // actual (mini constel·lacions que canvien en moure el dial). Encaixat, només queden les que li pertoquen.
      ctx!.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        if (!pos[i].vis || (AR && !al[i] && CLARITAT[i] < 0.05)) continue;
        const F = FREQ[i];
        const col = ELEMENTS[i].color;
        const lit: { j: number; s: number; ang: number }[] = [];
        // Només el canal que s'està tocant ressona a ple; els altres, tènuement, i els encaixats, fixos.
        const pes = al[i] ? 1 : i === actiuRef.current ? 1 : 0.3;
        fons.forEach((e, j) => {
          if (e.k < 0 || !qs[j].vis) return;
          const dx = qs[j].x - pos[i].x;
          const dy = qs[j].y - pos[i].y;
          // Les línies molt llargues s'esvaeixen: són mini constel·lacions, no tela d'aranya.
          const prop = 0.3 + 0.7 * Math.max(0, 1 - Math.hypot(dx, dy) / 260);
          const s = (al[i] ? (e.el === i ? 1 : 0) : Math.max(0, 1 - Math.abs(F - e.k) / AMPLE_RESSONANCIA)) * pes * (al[i] ? 1 : prop);
          if (s > 0.05) lit.push({ j, s, ang: Math.atan2(dy, dx) });
        });
        if (!lit.length) continue;
        lit.sort((a, b) => b.s - a.s);
        const triades = lit.slice(0, 9).sort((a, b) => a.ang - b.ang);
        ctx!.strokeStyle = col;
        ctx!.shadowColor = col;
        ctx!.shadowBlur = 6;
        ctx!.lineWidth = 1.2;
        triades.forEach((a, n) => {
          ctx!.globalAlpha = 0.45 * a.s;
          ctx!.beginPath();
          ctx!.moveTo(pos[i].x, pos[i].y);
          ctx!.lineTo(qs[a.j].x, qs[a.j].y);
          ctx!.stroke();
          const b = triades[n + 1];
          if (b) {
            ctx!.globalAlpha = 0.8 * Math.min(a.s, b.s);
            ctx!.beginPath();
            ctx!.moveTo(qs[a.j].x, qs[a.j].y);
            ctx!.lineTo(qs[b.j].x, qs[b.j].y);
            ctx!.stroke();
          }
        });
        ctx!.shadowBlur = 0;
        triades.forEach((a) => {
          const q = qs[a.j];
          const r = 3 + a.s * 6;
          const g = ctx!.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
          g.addColorStop(0, col);
          g.addColorStop(1, col + "00");
          ctx!.globalAlpha = a.s;
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(q.x, q.y, r, 0, 6.283);
          ctx!.fill();
          ctx!.fillStyle = "#fff";
          ctx!.beginPath();
          ctx!.arc(q.x, q.y, 1.1 + a.s * 0.9, 0, 6.283);
          ctx!.fill();
        });
        ctx!.globalAlpha = 1;
      }

      // Línies del pentagrama (i → i+2) entre estrelles ja alineades.
      for (let i = 0; i < 5; i++) {
        const j = liniaPentagrama(i);
        const f = Math.min(pos[i].k, pos[j].k);
        if (f <= 0.02 || !pos[i].vis || !pos[j].vis) continue;
        ctx!.strokeStyle = tot ? `rgba(255,215,110,${0.55 + 0.4 * zoom})` : `rgba(255,255,255,${(0.5 * f).toFixed(3)})`;
        ctx!.lineWidth = (1 + 1.6 * f) * (tot ? 1.4 : 1);
        ctx!.shadowColor = tot ? "#ffd76e" : "transparent";
        ctx!.shadowBlur = tot ? 14 : 0;
        ctx!.beginPath();
        ctx!.moveTo(pos[i].x, pos[i].y);
        ctx!.lineTo(pos[j].x, pos[j].y);
        ctx!.stroke();
      }
      ctx!.shadowBlur = 0;

      // Atracció gravitatòria entre els astres conjurats: la matèria s'escapa d'un astre, el pes dels altres
      // en corba la trajectòria (òrbites i espirals) i, en arribar-hi, és capturada: l'astre pulsa i salten espurnes.
      const ancores: number[] = [];
      for (let i = 0; i < 5; i++) if (pos[i].k > 0.35 && pos[i].vis) ancores.push(i);
      const massa = (i: number) => 0.35 + 0.65 * pos[i].k;
      const objectiuMateria = ancores.length >= 2 ? Math.round(4 * ancores.length * (1 + 0.5 * zoom)) : 0;
      if (ancores.length >= 2) {
        for (let q = 0; q < 3 && materia.length < objectiuMateria; q++) {
          const o = ancores[Math.floor(rnd() * ancores.length)];
          let d = ancores[Math.floor(rnd() * ancores.length)];
          if (d === o) d = ancores[(ancores.indexOf(o) + 1) % ancores.length];
          const dx = pos[d].x - pos[o].x;
          const dy = pos[d].y - pos[o].y;
          const L = Math.hypot(dx, dy) || 1;
          const ux = dx / L;
          const uy = dy / L;
          const tang = (rnd() - 0.5) * 80;
          const v0 = 50 + rnd() * 50;
          const x0 = pos[o].x + ux * 6;
          const y0 = pos[o].y + uy * 6;
          materia.push({ x: x0, y: y0, cua: [], vx: ux * v0 - uy * tang, vy: uy * v0 + ux * tang, vida: 0, max: 6 + rnd() * 4, o });
        }
      }
      ctx!.globalCompositeOperation = "lighter";
      ctx!.lineCap = "round";
      for (let n = materia.length - 1; n >= 0; n--) {
        const m = materia[n];
        m.vida += dt;
        let ax = 0;
        let ay = 0;
        let capturada = -1;
        let propera = -1;
        let distPropera = Infinity;
        for (const i of ancores) {
          const dx = pos[i].x - m.x;
          const dy = pos[i].y - m.y;
          const d2 = dx * dx + dy * dy;
          const d = Math.sqrt(d2);
          if (d < 7 && (i !== m.o || m.vida > 2.5)) {
            capturada = i;
            break;
          }
          if (i !== m.o && d < distPropera) {
            distPropera = d;
            propera = i;
          }
          const f = (GRAVETAT * massa(i)) / Math.pow(d2 + 144, 1.5);
          ax += dx * f;
          ay += dy * f;
        }
        if (capturada >= 0) {
          pulso[capturada] = Math.min(1.5, pulso[capturada] + 0.35);
          const c = hexRgb(ELEMENTS[m.o].color);
          for (let k = 0; k < 4 && espurnes.length < 400; k++) {
            const ang = rnd() * 6.283;
            const v = 15 + rnd() * 35;
            espurnes.push({ x: pos[capturada].x, y: pos[capturada].y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: 0, max: 0.5 + rnd() * 0.5, c });
          }
          materia.splice(n, 1);
          continue;
        }
        if (m.vida > m.max || ancores.length < 2) {
          materia.splice(n, 1);
          continue;
        }
        m.vx += ax * dt;
        m.vy += ay * dt;
        const vel = Math.hypot(m.vx, m.vy);
        if (vel > 260) {
          m.vx *= 260 / vel;
          m.vy *= 260 / vel;
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.cua.push(m.x, m.y);
        if (m.cua.length > 110) m.cua.splice(0, 2);
        // El color va del de l'astre d'origen al de l'astre que s'acosta (o a or en completar-ho tot).
        const co = hexRgb(ELEMENTS[m.o].color);
        const cd = propera >= 0 ? hexRgb(ELEMENTS[propera].color) : co;
        const mescla = propera >= 0 ? Math.max(0, Math.min(1, 1 - distPropera / 130)) : 0;
        const c = [0, 1, 2].map((k) => Math.round(lerp(lerp(co[k], cd[k], mescla), 255 - k * 20, 0.5 * zoom)));
        const alfa = Math.min(1, m.vida / 0.4) * Math.min(1, (m.max - m.vida) / 1);
        // Cua: les últimes posicions, que s'esvaeixen; dibuixa l'arc que traça la gravetat.
        const pts = m.cua.length / 2;
        ctx!.lineWidth = 2;
        for (let k = 1; k < pts; k++) {
          ctx!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(alfa * 1.0 * Math.pow(k / pts, 1.5)).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(m.cua[2 * k - 2], m.cua[2 * k - 1]);
          ctx!.lineTo(m.cua[2 * k], m.cua[2 * k + 1]);
          ctx!.stroke();
        }
        ctx!.fillStyle = `rgba(255,255,255,${(alfa * 0.9).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, 1.8, 0, 6.283);
        ctx!.fill();
      }
      for (let i = 0; i < 5; i++) pulso[i] *= Math.exp(-dt * 2.5);
      for (let n = espurnes.length - 1; n >= 0; n--) {
        const e = espurnes[n];
        e.vida += dt;
        if (e.vida >= e.max) {
          espurnes.splice(n, 1);
          continue;
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= Math.exp(-dt * 2);
        e.vy *= Math.exp(-dt * 2);
        const a = 1 - e.vida / e.max;
        ctx!.fillStyle = `rgba(${e.c[0]},${e.c[1]},${e.c[2]},${(a * 0.9).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, 0.6 + 1.2 * a, 0, 6.283);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";

      // Estrelles principals: la mida depèn de la profunditat; les no alineades són tènues.
      for (let i = 0; i < 5; i++) {
        const q = pos[i];
        if (!q.vis) continue;
        // En mode AR, una estrella no encaixada és un fantasma que es va aclarint a mesura que s'hi apunta.
        const fantasma = AR && !al[i] ? Math.min(1, CLARITAT[i] * 2.5) : 1;
        if (fantasma < 0.02) continue;
        ctx!.globalAlpha = fantasma;
        const r = Math.max(4, (q.s / focal) * 34) * (1 + 0.15 * Math.sin(temps * 2 + i) + 0.4 * pulso[i]);
        const g = ctx!.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 4);
        g.addColorStop(0, ELEMENTS[i].color + (q.k > 0.3 ? "ff" : "99"));
        g.addColorStop(0.25, ELEMENTS[i].color + "66");
        g.addColorStop(1, ELEMENTS[i].color + "00");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(q.x, q.y, r * 4, 0, 6.283);
        ctx!.fill();
        ctx!.fillStyle = "#fff";
        ctx!.beginPath();
        ctx!.arc(q.x, q.y, r * 0.5, 0, 6.283);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }

      // Fil màgic (duende): indica cap a on girar el mòbil per arribar a l'estrella del canal actiu.
      // Lluny, és un fil de partícules que surt del punt de mira i corre cap a l'estrella (si és darrere teu, indica per
      // on girar); a prop, el duende volta l'estrella i es va estrenyent a mesura que s'enquadra.
      if (AR && ar.guia && !tot && ar.fites[actiuRef.current] && coneguda[actiuRef.current]) {
        const ia = actiuRef.current;
        const col = hexRgb(ELEMENTS[ia].color);
        const objA = coneguda[ia]!;
        const cc = enCamera(objA, ar.base!);
        const qT = projAR(objA);
        const dinsPantalla = qT.vis && qT.x > 24 && qT.x < w - 24 && qT.y > 24 && qT.y < h * 0.72;
        const cg = CLARITAT[ia];
        const lead = Math.min(w, h) * 0.3;
        const angCap = Math.hypot(cc[0], cc[1]) < 1e-3 ? 0 : Math.atan2(-cc[1], cc[0]);
        const distT = dinsPantalla ? Math.hypot(qT.x - cx, qT.y - cy) : Infinity;
        let gx: number;
        let gy: number;
        if (dinsPantalla && distT < lead * 1.4) {
          const rad = 8 + 64 * (1 - cg) * (1 - cg);
          const th = temps * (2.2 + 2.5 * cg);
          gx = qT.x + Math.cos(th) * rad;
          gy = qT.y + Math.sin(th) * rad * 0.8;
        } else {
          const a = dinsPantalla ? Math.atan2(qT.y - cy, qT.x - cx) : angCap;
          gx = cx + Math.cos(a) * lead;
          gy = cy + Math.sin(a) * lead;
        }
        if (!duende.ini) {
          duende.x = cx;
          duende.y = cy;
          duende.ini = true;
        }
        const segueix = 1 - Math.exp(-dt * 2.5);
        duende.x += (gx - duende.x) * segueix;
        duende.y += (gy - duende.y) * segueix;
        const hx = duende.x + Math.sin(temps * 1.3) * 6 + Math.sin(temps * 0.53 + 1) * 5;
        const hy = duende.y + Math.cos(temps * 0.97) * 6 + Math.cos(temps * 0.41) * 5;

        ctx!.globalCompositeOperation = "lighter";
        // El fil: partícules que surten de la mira i corren cap al duende, ondulant. Com més a prop, més curt i més tens.
        const dxw = hx - cx;
        const dyw = hy - cy;
        const lw = Math.hypot(dxw, dyw);
        if (lw > 14) {
          const nx = -dyw / lw;
          const ny = dxw / lw;
          const amp = 12 + 18 * (1 - cg);
          const N = 30;
          for (let k = 0; k < N; k++) {
            const s = (k / N + temps * 0.14) % 1;
            // Ondulació lenta i irregular: tres ones amb freqüències que no es repeteixen.
            const ond =
              (0.6 * Math.sin(s * 7 - temps * 1.3) + 0.3 * Math.sin(s * 15.5 - temps * 2.1 + 1.7) + 0.5 * Math.sin(s * 3.3 + temps * 0.8)) *
              amp *
              Math.sin(Math.PI * s);
            const px = cx + dxw * s + nx * ond;
            const py = cy + dyw * s + ny * ond;
            const alfa = Math.sin(Math.PI * s) * 0.85;
            const r = 1.2 + 2.6 * s;
            const mix = (v: number) => Math.round(lerp(255, v, 0.8 * s));
            const g = ctx!.createRadialGradient(px, py, 0, px, py, r * 3);
            g.addColorStop(0, `rgba(${mix(col[0])},${mix(col[1])},${mix(col[2])},${alfa.toFixed(3)})`);
            g.addColorStop(1, `rgba(${mix(col[0])},${mix(col[1])},${mix(col[2])},0)`);
            ctx!.fillStyle = g;
            ctx!.beginPath();
            ctx!.arc(px, py, r * 3, 0, 6.283);
            ctx!.fill();
          }
        }
        ctx!.globalCompositeOperation = "source-over";
      }

      // Pedra filosofal: en marcar els cinc astres, apareix al centre del pentagrama (el zenit), cau com un meteorit
      // a poc a poc i es queda davant del jugador, brillant i girant.
      if (tot && gemaT0 < 0) gemaT0 = temps;
      if (!tot) {
        gemaT0 = -1;
        historialGema.length = 0;
      }
      const tg = gemaT0 < 0 ? -1 : temps - gemaT0;
      let estatGema: EstatGema | null = null;
      if (tg > GEMA_RETARD) {
        const u = Math.min(1, (tg - GEMA_RETARD) / GEMA_CAIGUDA);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const R = 24;
        let sx = 0;
        let sy = 0;
        let sz = -R;
        if (AR) {
          // El zenit, en l'espai de la càmera: d'allà surt la gema, vingui d'on vingui el jugador.
          const cz = enCamera([0, 1, 0], ar.base!);
          sx = cz[0] * R;
          sy = cz[1] * R;
          sz = -cz[2] * R;
        }
        const px = lerp(sx, 0, e);
        const py = lerp(sy, Math.sin(temps * 1.3) * 0.03, e);
        const pz = lerp(sz, -1.55, e);
        const dist = -pz;
        const brill = 0.5 + 0.5 * Math.sin(temps * 2.6);
        estatGema = { x: px, y: py, z: pz, gir: tg * 1.15, escala: 0.26, brillantor: brill, w, h, focal: focalAR, cy };
        if (dist > 0.12) {
          const gx = cx + (focalAR * px) / dist;
          const gy = cy - (focalAR * py) / dist;
          const rpx = (0.26 * focalAR) / dist;
          historialGema.push({ x: gx, y: gy });
          if (historialGema.length > 44) historialGema.shift();
          ctx!.globalCompositeOperation = "lighter";
          ctx!.lineCap = "round";
          // Cua de meteorit mentre cau: es va apagant a mesura que arriba.
          if (u < 0.999) {
            const n = historialGema.length;
            for (let k = 1; k < n; k++) {
              const f = k / n;
              ctx!.strokeStyle = `rgba(175,205,255,${(Math.pow(f, 1.6) * 0.75 * (1 - u * 0.6)).toFixed(3)})`;
              ctx!.lineWidth = 1 + f * Math.min(rpx * 0.8, 26);
              ctx!.beginPath();
              ctx!.moveTo(historialGema[k - 1].x, historialGema[k - 1].y);
              ctx!.lineTo(historialGema[k].x, historialGema[k].y);
              ctx!.stroke();
            }
            for (let k = 0; k < 2 && espurnes.length < 400; k++) {
              const ang = rnd() * 6.283;
              const v = 10 + rnd() * 40;
              espurnes.push({ x: gx, y: gy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: 0, max: 0.5 + rnd() * 0.7, c: [190, 215, 255] });
            }
          }
          // Resplendor que respira al voltant de la gema.
          const halo = ctx!.createRadialGradient(gx, gy, 0, gx, gy, rpx * 2.8);
          halo.addColorStop(0, `rgba(165,195,255,${(0.35 + 0.3 * brill).toFixed(3)})`);
          halo.addColorStop(0.45, "rgba(120,160,255,0.16)");
          halo.addColorStop(1, "rgba(120,160,255,0)");
          ctx!.fillStyle = halo;
          ctx!.beginPath();
          ctx!.arc(gx, gy, rpx * 2.8, 0, 6.283);
          ctx!.fill();
          // Guspires que brillen al voltant, fora de la silueta.
          for (let k = 0; k < 8; k++) {
            const ang = temps * 0.7 * (k % 2 ? 1 : -1) + k * 0.785;
            const rr = rpx * (1.4 + 0.45 * Math.sin(temps * 2 + k));
            const tw = 0.5 + 0.5 * Math.sin(temps * 5 + k * 1.7);
            ctx!.fillStyle = `rgba(225,238,255,${(tw * 0.9).toFixed(3)})`;
            ctx!.beginPath();
            ctx!.arc(gx + Math.cos(ang) * rr, gy + Math.sin(ang) * rr, 0.8 + 1.6 * tw, 0, 6.283);
            ctx!.fill();
          }
          // Llampec en arribar.
          const desDeArribada = tg - GEMA_RETARD - GEMA_CAIGUDA;
          if (desDeArribada > 0 && desDeArribada < 1.4) {
            ctx!.fillStyle = `rgba(210,228,255,${(0.35 * Math.exp(-desDeArribada * 3)).toFixed(3)})`;
            ctx!.fillRect(0, 0, w, h);
          }
          ctx!.globalCompositeOperation = "source-over";
        }
      }
      if (estatGema && gemaCanvas && !gema && !gemaFallida) {
        try {
          gema = crearGema(gemaCanvas);
        } catch {
          gemaFallida = true;
        }
      }
      gema?.pinta(estatGema);

      if (AR) {
        // Punts cardinals sobre l'horitzó i punt de mira al centre.
        ctx!.font = "700 13px sans-serif";
        ctx!.textAlign = "center";
        ["N", "E", "S", "O"].forEach((lletra, k) => {
          const q = projAR(dirDesAzEl(k * 90, 0));
          if (!q.vis) return;
          ctx!.fillStyle = "rgba(255,255,255,0.75)";
          ctx!.fillText(lletra, q.x, q.y + 5);
          ctx!.fillRect(q.x - 0.5, q.y - 14, 1, 7);
        });
        const cr = CLARITAT[actiuRef.current];
        ctx!.strokeStyle = colorSenyalA(ELEMENTS[actiuRef.current].color, cr, 0.5 + 0.5 * cr);
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(cx, cy, 16 + 6 * (1 - cr), 0, 6.283);
        ctx!.moveTo(cx - 26, cy);
        ctx!.lineTo(cx - 10, cy);
        ctx!.moveTo(cx + 10, cy);
        ctx!.lineTo(cx + 26, cy);
        ctx!.moveTo(cx, cy - 26);
        ctx!.lineTo(cx, cy - 10);
        ctx!.moveTo(cx, cy + 10);
        ctx!.lineTo(cx, cy + 26);
        ctx!.stroke();
      }

      // Anells de runes: giren sols; en encaixar, el xevró s'orienta cap a la seva estrella.
      // Mentre es sintonitza, l'anell frena, s'il·lumina amb el color de l'element i s'orienta cap a la seva
      // estrella; en arribar al valor exacte fa lock.
      for (let i = 0; i < 5; i++) {
        const c = al[i] ? 1 : nitidesa(valsRef.current[i], i);
        const dx = pos[i].x - cx;
        const dy = pos[i].y - cy;
        const dif = pos[i].vis ? ((((Math.atan2(dx, -dy) * 180) / Math.PI - angleAnell[i] + 540) % 360) - 180) : 0;
        angleAnell[i] += VELOCITATS[i] * (1 - c) * dt;
        angleAnell[i] += dif * (1 - Math.exp(-dt * (al[i] ? 3.5 : 4 * c * c * c)));
        const g = anellsRef.current[i];
        if (!g) continue;
        g.setAttribute("transform", `rotate(${angleAnell[i].toFixed(2)} ${VB / 2} ${VB / 2})`);
        const color = tot ? "#ffd76e" : al[i] ? ELEMENTS[i].color : colorSenyal(ELEMENTS[i].color, c);
        g.style.setProperty("--anell", color);
        g.style.setProperty("--xevro", tot ? "#ffd76e" : colorSenyalA(ELEMENTS[i].color, c, 0.15 + 0.85 * c * c));
        g.style.opacity = String(al[i] || tot ? 1 : 0.5 + 0.5 * c);
        // L'anell s'inclina en 3D segons l'error d'apuntat: X = elevació, Y = azimut, Z = gir lateral del mòbil.
        // Cada eix és a 0° quan és el bo: l'anell queda pla (de cara) en arribar al punt exacte.
        const e = aimErr[i];
        const lim = (x: number) => Math.max(-75, Math.min(75, x));
        const objTilt =
          al[i] || tot ? [0, 0, 0] : [lim(e.dEl * 1.4), lim(e.dAz * 0.8), AR ? lim(rollGraus(ar.base!) * 0.6) : lim((e.dAz - e.dEl) * 0.4)];
        const suau = 1 - Math.exp(-dt * (al[i] ? 4 : 12));
        for (let k = 0; k < 3; k++) tilt[i][k] += (objTilt[k] - tilt[i][k]) * suau;
        const sv = svgsRef.current[i];
        // Triple zoom: en encaixar-se l'astre, l'anell creix i torna tres cops seguits, cada cop més fluix.
        if (al[i] && !abansEncaixat[i]) zoomInici[i] = temps;
        abansEncaixat[i] = al[i];
        const uz = zoomInici[i] < 0 ? 1 : (temps - zoomInici[i]) / 1.6;
        const escala = uz >= 1 ? 1 : 1 + 0.5 * Math.pow(Math.sin(uz * Math.PI * 3), 2) * (1 - uz);
        if (sv) {
          sv.style.transform = `rotateX(${tilt[i][0].toFixed(2)}deg) rotateY(${tilt[i][1].toFixed(2)}deg) rotateZ(${tilt[i][2].toFixed(2)}deg) scale(${escala.toFixed(3)})`;
          sv.style.filter = uz < 1 ? `drop-shadow(0 0 ${(10 * (1 - uz)).toFixed(1)}px ${ELEMENTS[i].color})` : "";
        }
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gema?.destrueix();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [baseSensors]);

  const enAr = mode === 'ar';
  const dialsVisibles = mode === 'dials';
  const colorActiu = alineats[actiu] ? '#ffd76e' : ELEMENTS[actiu].color;
  const caixaCoord = 'flex min-h-12 flex-1 items-center justify-center rounded-md border px-3';

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#05040f] text-white">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 h-full w-full object-cover ${enAr ? '' : 'hidden'}`}
        aria-hidden
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden />
      <canvas ref={gemaRef} className="pointer-events-none absolute inset-0 z-[6] h-full w-full" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 z-[5] aspect-square w-[min(100vw,60dvh)] -translate-x-1/2 -translate-y-1/2 transition-[filter] duration-1000"
        style={{ top: `${(enAr ? CENTRE_AR : CENTRE_Y) * 100}%`, perspective: '800px', filter: completa ? 'drop-shadow(0 0 8px #ffd76e)' : 'none' }}
        aria-hidden
      >
        {/* Els colors (--anell, --xevro) i la inclinació 3D els posa el bucle d'animació segons l'apuntat de cada canal. */}
        {RADIS_ANELLS.map((r, i) => (
          <svg
            key={i}
            ref={(el) => {
              svgsRef.current[i] = el;
            }}
            viewBox={`0 0 ${VB} ${VB}`}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <g
              ref={(el) => {
                anellsRef.current[i] = el;
              }}
              style={{ ['--anell' as string]: 'rgb(150,156,184)', ['--xevro' as string]: 'rgba(150,156,184,0.15)', opacity: 0.5 }}
            >
              <circle cx={VB / 2} cy={VB / 2} r={r - 2} fill="none" strokeWidth={0.8} style={{ stroke: 'var(--anell)' }} />
              <circle cx={VB / 2} cy={VB / 2} r={r + ALCADA_RUNA + 2} fill="none" strokeWidth={0.8} style={{ stroke: 'var(--anell)' }} />
              <g style={{ fill: 'var(--anell)' }}>
                {runes[i].map((g) => (
                  <path key={g.key} d={g.d} transform={g.transform} />
                ))}
              </g>
              <path d={arcXevro(r)} fill="none" strokeWidth={ALCADA_RUNA + 3} style={{ stroke: 'var(--xevro)' }} />
            </g>
          </svg>
        ))}
      </div>
      <div className="relative z-10 px-4 pt-5 text-center">
        <h1 className="text-2xl font-bold tracking-wide">La Conjunció dels Astres</h1>
        <p className="mt-1 text-base text-white/80">
          {completa
            ? "Els astres són alineats. Els cinc vèrtexs del pentagrama envolten el cel."
            : enAr
              ? "Gira el mòbil cap a l'estrella que marca el fil i mantén-lo quiet fins que aparegui."
              : dialsVisibles
                ? "Sense sensors: posa amb els dials els números X i Z de la fita."
                : "Apunta el mòbil al cel, allà on et diguin els números de cada fita."}
        </p>
      </div>
      {completa && continuaVisible && (
        <div className="relative z-10 mt-auto px-4 pb-6">
          <button
            type="button"
            onClick={onContinuar}
            className="min-h-12 w-full rounded-lg bg-[#ffd76e] px-4 text-lg font-bold text-[#1b1511]"
          >
            Continuar
          </button>
        </div>
      )}
      {enAr && !completa && (
        <button
          type="button"
          onClick={() => {
            sonTocBoto();
            setGuia((g) => !g);
          }}
          aria-pressed={guia}
          className="absolute right-3 top-24 z-20 min-h-12 rounded-full border px-4 text-base font-semibold"
          style={{
            color: guia ? '#1b1511' : '#ffd76e',
            background: guia ? '#ffd76e' : 'rgba(5,4,15,0.65)',
            borderColor: '#ffd76e',
          }}
        >
          ✦ Fil màgic
        </button>
      )}
      <div className="relative z-10 mt-auto flex flex-col gap-1.5 px-2 pb-3">
        {mode === 'inici' || mode === 'demanant' ? (
          <div className="rounded-xl border border-white/20 bg-black/65 p-4 text-center">
            <p className="text-base">
              Per apuntar al cel el mòbil necessita la brúixola, el GPS i, si vols veure el cel real, la càmera.
            </p>
            <button
              type="button"
              onClick={activar}
              disabled={mode === 'demanant'}
              className="mt-3 min-h-12 w-full rounded-lg bg-[#ffd76e] px-4 text-lg font-bold text-[#1b1511] disabled:opacity-60"
            >
              {mode === 'demanant' ? 'Esperant els permisos…' : 'Activar el cel'}
            </button>
            <button
              type="button"
              onClick={() => {
                sonTocBoto();
                setMode('dials');
              }}
              disabled={mode === 'demanant'}
              className="mt-2 min-h-12 w-full text-base text-white/70 underline disabled:opacity-40"
            >
              Prefereixo els dials
            </button>
            {simulacio && (
              <button type="button" onClick={simular} className="mt-1 min-h-12 w-full text-base text-[#ffd76e] underline">
                Simular el mòbil amb el ratolí (prova)
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex w-full justify-center gap-1.5">
              {ELEMENTS.map((el, i) => (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => {
                    if (!fites[i]) return;
                    sonTocBoto();
                    setActiu(i);
                  }}
                  disabled={!fites[i]}
                  aria-label={`Canal ${el.nom}`}
                  className="flex min-h-20 flex-1 items-center justify-center rounded-lg border-2 p-1"
                  style={{
                    borderColor: i === actiu ? el.color : 'rgba(255,255,255,0.15)',
                    background: i === actiu ? `${el.color}22` : 'rgba(5,4,15,0.55)',
                    boxShadow: alineats[i] ? `inset 0 0 10px ${el.color}88` : 'none',
                  }}
                >
                  {/* Icona oficial de l'element (la del medalló amb el ✓ quan ja és gravat al cel). */}
                  <Image
                    src={fites[i] ? ELEMENTS_JOC[el.id].iconaResolta : ELEMENTS_JOC[el.id].icona}
                    alt=""
                    width={52}
                    height={52}
                    className="size-13 object-contain"
                    style={{ opacity: !fites[i] ? 0.4 : i === actiu ? 1 : 0.75 }}
                  />
                </button>
              ))}
            </div>
            {!enAr && (
              <>
                <div className="flex gap-1.5">
                  {[0, 1].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        sonTocBoto();
                        setGrup(g);
                      }}
                      className={caixaCoord}
                      style={{ borderColor: g === grup ? colorActiu : 'rgba(255,255,255,0.15)', background: g === grup ? `${colorActiu}22` : 'rgba(5,4,15,0.6)' }}
                    >
                      <span className="text-sm font-semibold" style={{ color: colorActiu }}>
                        {NOM_GRUP[g]}
                      </span>
                    </button>
                  ))}
                </div>
                {[0, 1, 2].map((j) => (
                  <DialRadio
                    key={j}
                    index={actiu}
                    roda={grup * 3 + j}
                    etiqueta={`${grup === 0 ? 'X' : 'Z'} · ${NOM_DIALS[j]}`}
                    valsRef={valsRef}
                    bloquejat={alineats[actiu]}
                    onSintonitza={sintonitza}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/** Canvas que s'ajusta a la mida CSS (amb DPR) i dibuixa cada fotograma amb `dibuixa`. */
function useCanvasBucle(dibuixa: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dibuixaRef = useRef(dibuixa);
  useEffect(() => {
    dibuixaRef.current = dibuixa;
  });
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0;
    let h = 0;
    const mida = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    mida();
    const ro = new ResizeObserver(mida);
    ro.observe(canvas);
    const inici = performance.now();
    let raf = 0;
    const bucle = (ara: number) => {
      ctx.clearRect(0, 0, w, h);
      dibuixaRef.current(ctx, w, h, (ara - inici) / 1000);
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return ref;
}

/**
 * Dial de sintonia horitzontal i fi d'una xifra (0–9), a tota l'amplada: s'arrossega l'agulla (el dit
 * la segueix 1:1) i en deixar-la, s'enganxa a la xifra més propera.
 */
function DialRadio({
  index,
  roda,
  etiqueta,
  valsRef,
  bloquejat,
  onSintonitza,
}: {
  index: number;
  roda: number;
  etiqueta: string;
  valsRef: React.RefObject<number[][]>;
  bloquejat: boolean;
  onSintonitza: (i: number, j: number, x: number) => void;
}) {
  const MARGE = 14;
  /** Xifres visibles alhora a tota l'amplada del dial. */
  const FINESTRA = 6;
  const drag = useRef<number | null>(null);
  const snap = useRef(0);
  const propsRef = useRef({ index, roda, bloquejat, onSintonitza });
  useEffect(() => {
    propsRef.current = { index, roda, bloquejat, onSintonitza };
  });
  // Si es canvia de canal, l'enganxament del canal anterior no ha de moure el nou.
  useEffect(() => {
    drag.current = null;
    cancelAnimationFrame(snap.current);
  }, [index]);

  const ref = useCanvasBucle((ctx, w, h, temps) => {
    const d = valsRef.current[index];
    const v = d[roda];
    const hex = ELEMENTS[index].color;
    // Proximitat d'aquesta xifra: governa l'agulla, l'ondulació de l'escala, el mesurador i la vora.
    const p = bloquejat ? 1 : proximitatXifra(v, index, roda);
    const obj = digitsObjectiu(index);
    const correcta = bloquejat || (obj !== null && Math.abs(v - obj[roda]) < 0.06);
    const color = colorSenyal(hex, p);
    const base = h - 4;
    // L'agulla és fixa al centre; l'escala (finestra de FINESTRA xifres) llisca per sota.
    const ppu = w / FINESTRA;
    const xAgulla = w / 2;

    // Vora: s'il·lumina amb el color de l'element a mesura que la xifra s'acosta; amb la xifra bona, pulsa.
    const pols = correcta ? 0.65 + 0.35 * Math.sin(temps * 5) : 1;
    ctx.strokeStyle = colorSenyalA(hex, p, (0.15 + 0.85 * p) * pols);
    ctx.lineWidth = 1 + 1.5 * p;
    ctx.shadowColor = hex;
    ctx.shadowBlur = correcta ? 10 : 0;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.shadowBlur = 0;

    // Halo darrere l'agulla.
    const halo = ctx.createRadialGradient(xAgulla, base, 0, xAgulla, base, 60);
    halo.addColorStop(0, colorSenyalA(hex, p, 0.1 + 0.4 * p));
    halo.addColorStop(1, colorSenyalA(hex, p, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(235,235,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGE, base);
    ctx.lineTo(w - MARGE, base);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "600 11px sans-serif";
    // Escala simple: una marca per xifra (amb número) i una de mitja entre cada dues; s'esvaeix cap a les vores.
    for (let n = 0; n <= 18; n++) {
      const x = w / 2 + (n / 2 - v) * ppu;
      if (x < 0 || x > w) continue;
      const gran = n % 2 === 0;
      const fosa = 1 - 0.85 * Math.pow(Math.abs(x - w / 2) / (w / 2), 2);
      ctx.strokeStyle = `rgba(235,235,255,${((gran ? 0.85 : 0.4) * fosa).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.lineTo(x, base - (gran ? 14 : 8));
      ctx.stroke();
      if (gran) {
        ctx.fillStyle = `rgba(235,235,255,${(0.85 * fosa).toFixed(3)})`;
        ctx.fillText(String(n / 2), x, base - 20);
      }
    }
    ctx.textAlign = "left";
    ctx.font = "600 9px sans-serif";
    ctx.fillStyle = "rgba(235,235,255,0.5)";
    ctx.fillText(etiqueta.toUpperCase(), MARGE, 10);

    // ✓ quan la xifra és la bona.
    if (correcta) {
      ctx.textAlign = "right";
      ctx.font = "700 12px sans-serif";
      ctx.fillStyle = hex;
      ctx.fillText("✓", w - MARGE, 13);
    }

    // Agulla.
    const x = xAgulla;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6 + 10 * p;
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 5, 8);
    ctx.lineTo(x + 5, 8);
    ctx.lineTo(x, 15);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  const mou = (x: number) => {
    const p = propsRef.current;
    if (!p.bloquejat) p.onSintonitza(p.index, p.roda, x);
  };

  return (
    <canvas
      ref={ref}
      aria-label={`Dial de ${etiqueta.toLowerCase()}`}
      className="h-[52px] w-full touch-none rounded-md border border-white/15 bg-[#05040f]/70"
      onPointerDown={(e) => {
        cancelAnimationFrame(snap.current);
        drag.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current === null) return;
        // L'escala segueix el dit: arrossegar cap a la dreta fa baixar el valor.
        const w = e.currentTarget.getBoundingClientRect().width;
        const du = (-(e.clientX - drag.current) / w) * FINESTRA;
        drag.current = e.clientX;
        mou(valsRef.current[propsRef.current.index][propsRef.current.roda] + du);
      }}
      onPointerUp={() => {
        drag.current = null;
        let ultim = performance.now();
        const enganxa = (ara: number) => {
          const dt = (ara - ultim) / 1000;
          ultim = ara;
          const { index: i, roda: j } = propsRef.current;
          const v = valsRef.current[i][j];
          const meta = Math.round(v);
          if (Math.abs(meta - v) < 0.004) {
            mou(meta);
            return;
          }
          mou(v + (meta - v) * (1 - Math.exp(-dt * 16)));
          snap.current = requestAnimationFrame(enganxa);
        };
        snap.current = requestAnimationFrame(enganxa);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    />
  );
}
