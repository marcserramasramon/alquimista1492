"use client";

import { useEffect, useRef, type RefObject } from "react";
import { dibuixaVora } from "@/components/ar/voraGuia";
import { diferenciaRumb, type Mirada } from "@/lib/orientacio";
import { sonarFugidaCarta, sonarMovimentCarta, type TipusMoviment } from "@/lib/sorollCarta";

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
/** Mentre vola, la carta va i ve fins aquí. Cada viatge dura el mateix que el seu so. */
const DISTANCIA_LLUNY = 3.4;
const DURADA_ALLUNYAR_MS = 890;
const DURADA_APROPAR_MS = 1630;
const AMPLE_CARTA = 0.62;
const ALT_CARTA = 0.42;
const OR = "234, 179, 8";
const RAD = Math.PI / 180;

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
        let viatge: { des: number; fins: number; inici: number; durada: number } | null = null;
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
          if (fase === "vola") {
            // Va i ve: s'allunya, s'espera, s'acosta, s'espera. Cada viatge sona una vegada.
            if (!viatge && ara >= properViatge) {
              const marxa = distBase < DISTANCIA_LLUNY;
              viatge = {
                des: distBase,
                fins: marxa ? DISTANCIA_LLUNY : DISTANCIA,
                inici: ara,
                durada: marxa ? DURADA_ALLUNYAR_MS : DURADA_APROPAR_MS,
              };
              sonarMoviment(marxa ? "lluny" : "aprop");
            }
            if (viatge) {
              const t = Math.min(1, (ara - viatge.inici) / viatge.durada);
              distBase = viatge.des + (viatge.fins - viatge.des) * suau(t);
              if (t >= 1) {
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
          const rb = rumbCarta * RAD;
          const el = elevCarta * RAD;
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
