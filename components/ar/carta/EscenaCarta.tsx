"use client";

import { useEffect, useRef, type RefObject } from "react";
import { dibuixaVora } from "@/components/ar/voraGuia";
import { diferenciaRumb, type Mirada } from "@/lib/orientacio";
import { sonarFugidaCarta, sonarMovimentCarta, sonarRiureCarta, type TipusMoviment } from "@/lib/sorollCarta";

/** On és la carta respecte a on mira el mòbil: cap a on cal moure'l, o "vista" si ja es veu. */
export type GuiaCarta = "dreta" | "esquerra" | "amunt" | "avall" | "vista" | "atrapada";

interface Props {
  /** Lectura de la brúixola i la inclinació. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors: la mirada es mou arrossegant el dit. */
  arrossegar: boolean;
  /** Canvia el que ha de dir el cartell; nul mentre la carta vola i no es pot atrapar. */
  alGuia: (guia: GuiaCarta | null) => void;
  /** El vent s'ha endut la carta el primer cop que l'han tocada. */
  alFugir: () => void;
  /** La carta ja és a les mans del jugador. */
  alAtrapar: () => void;
  /** No s'ha pogut dibuixar en 3D (el mòbil no té WebGL). */
  alError: () => void;
}

const DURADA_FUGIDA_MS = 1100;
const DURADA_ATRAPADA_MS = 650;
const DISTANCIA = 2.2;
/** Mentre vola, la carta reposa en aquestes distàncies. Cada viatge dura el mateix que el seu so. */
const POSICIONS_REPOS = [DISTANCIA, DISTANCIA * 2, DISTANCIA * 3];
const DURADA_ALLUNYAR_MS = 890;
const DURADA_APROPAR_MS = 1630;
const AMPLE_CARTA = 0.62;
const ALT_CARTA = 0.42;
const OR = "234, 179, 8";
const RAD = Math.PI / 180;
/** Estela d'estrelletes: quantes n'hi pot haver, quantes en surten per segon i quant duren (segons). */
const ESTRELLES_MAX = 600;
const ESTRELLES_PER_SEGON = 150;
const VIDA_ESTRELLA_MIN = 1.6;
const VIDA_ESTRELLA_MAX = 2.8;
const MIDA_ESTRELLA = 0.17;
/** Velocitat (m/s) a partir de la qual la carta deixa estela: el balanceig en repòs no en fa. */
const VELOCITAT_ESTELA = 0.4;
/** Corba lateral i cap amunt de cada viatge (graus), perquè l'estela no quedi darrere la carta. */
const CORBA_RUMB = 9;
const CORBA_ELEVACIO = 7;

/** Una estrelleta de quatre puntes amb halo, per a la textura de l'estela. */
function dibuixaEstrella(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const g = canvas.getContext("2d");
  if (!g) return canvas;
  const halo = g.createRadialGradient(32, 32, 0, 32, 32, 26);
  halo.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  halo.addColorStop(1, "rgba(255, 255, 255, 0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#ffffff";
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const radi = i % 2 === 0 ? 31 : 6;
    const x = 32 + Math.cos(angle) * radi;
    const y = 32 + Math.sin(angle) * radi;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fill();
  return canvas;
}

/** La carta plegada, amb el segell de cera al mig, dibuixada a la textura. */
function dibuixaCarta(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 346;
  const g = canvas.getContext("2d");
  if (!g) return canvas;
  g.fillStyle = "#ead9b0";
  g.fillRect(0, 0, 512, 346);
  // Taques i vora envellida.
  const vora = g.createRadialGradient(256, 173, 90, 256, 173, 320);
  vora.addColorStop(0, "rgba(120, 80, 30, 0)");
  vora.addColorStop(1, "rgba(120, 80, 30, 0.5)");
  g.fillStyle = vora;
  g.fillRect(0, 0, 512, 346);
  // Plecs del sobre.
  g.strokeStyle = "rgba(70, 45, 20, 0.65)";
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(4, 4);
  g.lineTo(256, 190);
  g.lineTo(508, 4);
  g.moveTo(4, 342);
  g.lineTo(196, 146);
  g.moveTo(508, 342);
  g.lineTo(316, 146);
  g.stroke();
  g.strokeStyle = "#1b1511";
  g.lineWidth = 8;
  g.strokeRect(4, 4, 504, 338);
  // Segell de cera.
  const cera = g.createRadialGradient(240, 170, 8, 256, 186, 62);
  cera.addColorStop(0, "#b3261e");
  cera.addColorStop(1, "#5e0d09");
  g.fillStyle = cera;
  g.beginPath();
  g.arc(256, 186, 58, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(255, 215, 170, 0.75)";
  g.lineWidth = 4;
  g.beginPath();
  for (let i = 0; i <= 5; i++) {
    const angle = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    const x = 256 + Math.cos(angle) * 38;
    const y = 186 + Math.sin(angle) * 38;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  return canvas;
}

function suau(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * La carta voleia en un punt fix de l'espai al voltant del jugador. Un resplendor daurat diu cap a on
 * girar-se. El primer cop que la toquen, el vent se l'endú a una altra banda; el segon, l'atrapen.
 * És el 3D (WebGL) el que també es comprova aquí; si no n'hi ha, avisa amb `alError`.
 */
export function EscenaCarta({ mirada, arrossegar, alGuia, alFugir, alAtrapar, alError }: Props) {
  const canvas3D = useRef<HTMLCanvasElement>(null);
  const canvasVora = useRef<HTMLCanvasElement>(null);
  const arrossegarRef = useRef(arrossegar);
  const callbacks = useRef({ alGuia, alFugir, alAtrapar, alError });

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    callbacks.current = { alGuia, alFugir, alAtrapar, alError };
  }, [arrossegar, alGuia, alFugir, alAtrapar, alError]);

  useEffect(() => {
    let desmuntat = false;
    let neteja = () => {};

    void (async () => {
      const canvas = canvas3D.current;
      const capa = canvasVora.current;
      const ctx = capa?.getContext("2d");
      if (!canvas || !capa || !ctx) return;
      try {
        const T = await import("three");
        if (desmuntat) return;
        const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const escena = new T.Scene();
        const camera = new T.PerspectiveCamera(58, 1, 0.05, 50);
        camera.rotation.order = "YXZ";

        const geometria = new T.PlaneGeometry(AMPLE_CARTA, ALT_CARTA, 14, 10);
        const base = Float32Array.from(geometria.attributes.position.array);
        const textura = new T.CanvasTexture(dibuixaCarta());
        textura.colorSpace = T.SRGBColorSpace;
        const material = new T.MeshBasicMaterial({ map: textura, side: T.DoubleSide });
        const carta = new T.Mesh(geometria, material);
        carta.visible = false;
        escena.add(carta);

        // Estela d'estrelletes daurades: es queden on les ha deixat la carta i s'apaguen a poc a poc.
        const posEstrelles = new Float32Array(ESTRELLES_MAX * 3);
        const colorEstrelles = new Float32Array(ESTRELLES_MAX * 4);
        const estrelles = Array.from({ length: ESTRELLES_MAX }, () => ({
          vx: 0,
          vy: 0,
          vz: 0,
          edat: 0,
          vida: 0,
          fase: 0,
        }));
        const geoEstrelles = new T.BufferGeometry();
        geoEstrelles.setAttribute("position", new T.BufferAttribute(posEstrelles, 3));
        geoEstrelles.setAttribute("color", new T.BufferAttribute(colorEstrelles, 4));
        const texEstrella = new T.CanvasTexture(dibuixaEstrella());
        const matEstrelles = new T.PointsMaterial({
          map: texEstrella,
          size: MIDA_ESTRELLA,
          vertexColors: true,
          transparent: true,
          depthWrite: false,
        });
        const puntsEstrelles = new T.Points(geoEstrelles, matEstrelles);
        puntsEstrelles.frustumCulled = false;
        escena.add(puntsEstrelles);
        let properaEstrella = 0;
        let perEmetre = 0;
        let anteriorFotograma = performance.now();
        let hiHaAnterior = false;
        const anteriorCarta = new T.Vector3();

        let amplada = 1;
        let alcada = 1;
        const ajustar = () => {
          amplada = window.innerWidth;
          alcada = window.innerHeight;
          renderer.setSize(amplada, alcada, false);
          camera.aspect = amplada / alcada;
          camera.updateProjectionMatrix();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          capa.width = amplada * dpr;
          capa.height = alcada * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        ajustar();
        window.addEventListener("resize", ajustar);

        // Mirada arrossegant el dit, quan no hi ha sensors.
        const dit = { rumb: 0, elevacio: 0, x: 0, y: 0, inici: { x: 0, y: 0 }, baixat: false };

        type Fase = "espera" | "vola" | "fuig" | "atrapada";
        let fase: Fase = "espera";
        let cops = 0;
        let rumbCarta = 0;
        let elevCarta = 2;
        let desDeRumb = 0;
        let finsRumb = 0;
        let desDeElev = 0;
        let finsElev = 0;
        let desDe = 0;
        // Distància actual, viatge d'anada o tornada en curs i quan comença el següent.
        let distBase = DISTANCIA;
        let distDes = DISTANCIA;
        let viatge: { des: number; fins: number; inici: number; durada: number; costat: number } | null = null;
        let properViatge = 0;
        let tornadaSonada = false;
        let rumbMirada = 0;

        const sonarMoviment = (tipus: TipusMoviment) => {
          sonarMovimentCarta(tipus, Math.sin(diferenciaRumb(rumbCarta, rumbMirada) * RAD));
        };

        let guiaActual: GuiaCarta | null = null;
        const posarGuia = (guia: GuiaCarta | null) => {
          if (guia === guiaActual) return;
          guiaActual = guia;
          callbacks.current.alGuia(guia);
        };

        const posicio = new T.Vector3();
        const projectada = new T.Vector3();

        const tocar = (x: number, y: number) => {
          if (fase !== "vola") return;
          projectada.copy(carta.position).project(camera);
          if (projectada.z > 1) return;
          const sx = ((projectada.x + 1) / 2) * amplada;
          const sy = ((1 - projectada.y) / 2) * alcada;
          // Marge ample: amb una mà i caminant, no ha de costar encertar-la.
          if (Math.hypot(x - sx, y - sy) > Math.max(110, amplada * 0.34)) return;
          cops++;
          desDe = performance.now();
          viatge = null;
          distDes = distBase;
          if (cops === 1) {
            fase = "fuig";
            tornadaSonada = false;
            sonarMoviment("lluny");
            desDeRumb = rumbCarta;
            finsRumb = (rumbCarta + (Math.random() < 0.5 ? -1 : 1) * (110 + Math.random() * 50) + 360) % 360;
            desDeElev = elevCarta;
            finsElev = -3;
            sonarFugidaCarta();
            sonarRiureCarta();
            navigator.vibrate?.(120);
            posarGuia(null);
            callbacks.current.alFugir();
          } else {
            fase = "atrapada";
            posarGuia("atrapada");
            navigator.vibrate?.([40, 40, 80]);
            sonarMoviment("aprop");
          }
        };

        const baixar = (e: PointerEvent) => {
          dit.baixat = true;
          dit.x = e.clientX;
          dit.y = e.clientY;
          dit.inici = { x: e.clientX, y: e.clientY };
        };
        const moure = (e: PointerEvent) => {
          if (!dit.baixat || !arrossegarRef.current) return;
          dit.rumb = (dit.rumb - (e.clientX - dit.x) * 0.25 + 360) % 360;
          dit.elevacio = Math.max(-60, Math.min(60, dit.elevacio + (e.clientY - dit.y) * 0.2));
          dit.x = e.clientX;
          dit.y = e.clientY;
        };
        const aixecar = (e: PointerEvent) => {
          if (dit.baixat && Math.hypot(e.clientX - dit.inici.x, e.clientY - dit.inici.y) < 14) tocar(e.clientX, e.clientY);
          dit.baixat = false;
        };
        capa.addEventListener("pointerdown", baixar);
        capa.addEventListener("pointermove", moure);
        capa.addEventListener("pointerup", aixecar);

        let raf = 0;
        const bucle = () => {
          raf = requestAnimationFrame(bucle);
          const ara = performance.now();
          const lectura: Mirada | null = arrossegarRef.current ? { rumb: dit.rumb, elevacio: dit.elevacio } : mirada.current;
          if (!lectura) return;

          if (fase === "espera") {
            // Sempre comença fora de la vista: cal girar-se per trobar-la.
            rumbCarta = (lectura.rumb + (Math.random() < 0.5 ? -1 : 1) * 120 + 360) % 360;
            elevCarta = Math.max(-5, Math.min(12, lectura.elevacio));
            carta.visible = true;
            fase = "vola";
            properViatge = ara + 1500;
          }
          rumbMirada = lectura.rumb;

          camera.rotation.y = -lectura.rumb * RAD;
          camera.rotation.x = lectura.elevacio * RAD;

          let distancia = distBase;
          let gir = 0;
          let corbaRumb = 0;
          let corbaElev = 0;
          if (fase === "vola") {
            // Salta a una altra posició de repòs, s'espera i torna a saltar. Cada viatge sona una vegada.
            if (!viatge && ara >= properViatge) {
              const altres = POSICIONS_REPOS.filter((d) => d !== distBase);
              const fins = altres[Math.floor(Math.random() * altres.length)];
              const marxa = fins > distBase;
              viatge = {
                des: distBase,
                fins,
                inici: ara,
                durada: marxa ? DURADA_ALLUNYAR_MS : DURADA_APROPAR_MS,
                costat: Math.random() < 0.5 ? -1 : 1,
              };
              sonarMoviment(marxa ? "lluny" : "aprop");
            }
            if (viatge) {
              const t = Math.min(1, (ara - viatge.inici) / viatge.durada);
              distBase = viatge.des + (viatge.fins - viatge.des) * suau(t);
              corbaRumb = Math.sin(t * Math.PI) * CORBA_RUMB * viatge.costat;
              corbaElev = Math.sin(t * Math.PI) * CORBA_ELEVACIO;
              if (t >= 1) {
                distBase = viatge.fins;
                viatge = null;
                properViatge = ara + 1500 + Math.random() * 2000;
              }
            }
            distancia = distBase;
          } else if (fase === "fuig") {
            const t = Math.min(1, (ara - desDe) / DURADA_FUGIDA_MS);
            const e = suau(t);
            rumbCarta = (desDeRumb + diferenciaRumb(finsRumb, desDeRumb) * e + 360) % 360;
            elevCarta = desDeElev + (finsElev - desDeElev) * e + Math.sin(t * Math.PI) * 22;
            distancia = distDes + (DISTANCIA - distDes) * e + Math.sin(t * Math.PI) * 2.2;
            gir = t * Math.PI * 3;
            if (t >= 0.5 && !tornadaSonada) {
              tornadaSonada = true;
              sonarMoviment("aprop");
            }
            if (t >= 1) {
              fase = "vola";
              distBase = DISTANCIA;
              properViatge = ara + 2500;
            }
          } else if (fase === "atrapada") {
            const t = Math.min(1, (ara - desDe) / DURADA_ATRAPADA_MS);
            distancia = distDes + (0.75 - distDes) * suau(t);
            rumbCarta = (rumbCarta + diferenciaRumb(lectura.rumb, rumbCarta) * 0.14 + 360) % 360;
            elevCarta += (lectura.elevacio - elevCarta) * 0.14;
            if (t >= 1) {
              carta.visible = false;
              renderer.render(escena, camera);
              ctx.clearRect(0, 0, amplada, alcada);
              cancelAnimationFrame(raf);
              callbacks.current.alAtrapar();
              return;
            }
          }

          const ondula = ara / 1000;
          const rb = (rumbCarta + corbaRumb) * RAD;
          const el = (elevCarta + corbaElev) * RAD;
          posicio.set(
            Math.sin(rb) * Math.cos(el) * distancia,
            Math.sin(el) * distancia + Math.sin(ondula * 1.7) * 0.05,
            -Math.cos(rb) * Math.cos(el) * distancia,
          );
          carta.position.copy(posicio);
          carta.lookAt(camera.position);
          carta.rotateZ(Math.sin(ondula * 1.3) * 0.16);
          carta.rotateY(Math.sin(ondula * 0.9) * 0.35 + gir);

          // El paper bat al vent.
          const atribut = geometria.attributes.position;
          for (let i = 0; i < atribut.count; i++) {
            const x = base[i * 3];
            const y = base[i * 3 + 1];
            atribut.setZ(i, Math.sin(x * 7 + ondula * 7) * 0.028 + Math.sin(y * 11 + ondula * 11) * 0.012);
          }
          atribut.needsUpdate = true;

          // Estela: surt mentre la carta es mou de debò, al llarg del camí que ha fet aquest fotograma.
          const dt = Math.min(0.1, (ara - anteriorFotograma) / 1000);
          anteriorFotograma = ara;
          if (hiHaAnterior && dt > 0) {
            const velocitat = posicio.distanceTo(anteriorCarta) / dt;
            if (velocitat > VELOCITAT_ESTELA) {
              perEmetre += ESTRELLES_PER_SEGON * dt;
              const quantes = Math.floor(perEmetre);
              perEmetre -= quantes;
              for (let n = 0; n < quantes; n++) {
                const e = estrelles[properaEstrella];
                const i = properaEstrella;
                properaEstrella = (properaEstrella + 1) % ESTRELLES_MAX;
                const f = Math.random();
                posEstrelles[i * 3] = anteriorCarta.x + (posicio.x - anteriorCarta.x) * f + (Math.random() - 0.5) * 0.3;
                posEstrelles[i * 3 + 1] = anteriorCarta.y + (posicio.y - anteriorCarta.y) * f + (Math.random() - 0.5) * 0.3;
                posEstrelles[i * 3 + 2] = anteriorCarta.z + (posicio.z - anteriorCarta.z) * f + (Math.random() - 0.5) * 0.3;
                e.vx = (Math.random() - 0.5) * 0.14;
                e.vy = -0.05 - Math.random() * 0.1;
                e.vz = (Math.random() - 0.5) * 0.14;
                e.edat = 0;
                e.vida = VIDA_ESTRELLA_MIN + Math.random() * (VIDA_ESTRELLA_MAX - VIDA_ESTRELLA_MIN);
                e.fase = Math.random() * Math.PI * 2;
              }
            }
          }
          anteriorCarta.copy(posicio);
          hiHaAnterior = true;
          for (let i = 0; i < ESTRELLES_MAX; i++) {
            const e = estrelles[i];
            if (e.vida <= 0) continue;
            e.edat += dt;
            const queda = 1 - e.edat / e.vida;
            if (queda <= 0) {
              e.vida = 0;
              colorEstrelles[i * 4 + 3] = 0;
              continue;
            }
            posEstrelles[i * 3] += e.vx * dt;
            posEstrelles[i * 3 + 1] += e.vy * dt;
            posEstrelles[i * 3 + 2] += e.vz * dt;
            // Daurat, amb espurnes més clares que parpellegen, i s'apaga cap al final.
            const parpelleig = 0.5 + 0.5 * Math.sin(e.edat * 14 + e.fase);
            colorEstrelles[i * 4] = 1;
            colorEstrelles[i * 4 + 1] = 0.68 + parpelleig * 0.17;
            colorEstrelles[i * 4 + 2] = 0.04 + parpelleig * 0.2;
            colorEstrelles[i * 4 + 3] = Math.min(1, queda * 1.6) * (0.55 + parpelleig * 0.45);
          }
          geoEstrelles.attributes.position.needsUpdate = true;
          geoEstrelles.attributes.color.needsUpdate = true;

          renderer.render(escena, camera);

          ctx.clearRect(0, 0, amplada, alcada);
          const dx = diferenciaRumb(rumbCarta, lectura.rumb);
          if (fase === "vola") {
            dibuixaVora(ctx, amplada, alcada, dx, 1, 1300, ara, OR);
            const dy = elevCarta - lectura.elevacio;
            const meitatH = Math.atan(Math.tan((camera.fov / 2) * RAD) * camera.aspect) / RAD;
            if (Math.abs(dx) > meitatH) posarGuia(dx > 0 ? "dreta" : "esquerra");
            else if (Math.abs(dy) > camera.fov / 2 - 4) posarGuia(dy > 0 ? "amunt" : "avall");
            else posarGuia("vista");
          }
        };
        raf = requestAnimationFrame(bucle);

        neteja = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", ajustar);
          capa.removeEventListener("pointerdown", baixar);
          capa.removeEventListener("pointermove", moure);
          capa.removeEventListener("pointerup", aixecar);
          geoEstrelles.dispose();
          texEstrella.dispose();
          matEstrelles.dispose();
          geometria.dispose();
          textura.dispose();
          material.dispose();
          renderer.dispose();
        };
      } catch {
        if (!desmuntat) callbacks.current.alError();
      }
    })();

    return () => {
      desmuntat = true;
      neteja();
    };
  }, [mirada]);

  return (
    <>
      <canvas ref={canvas3D} className="pointer-events-none absolute inset-0 h-full w-full" />
      <canvas ref={canvasVora} className="absolute inset-0 h-full w-full touch-none" />
    </>
  );
}
