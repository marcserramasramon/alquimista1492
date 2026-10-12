"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Mirada } from "@/lib/orientacio";
import type { EsdevenimentFantasma } from "@/components/ar/fantasmes/mon";
import type { PuntGps } from "@/content/public/extres";

/** Què pot fer qui hi ha a fora amb l'escena: el flaix i el crit (botons). */
export interface ControlFantasmes {
  /** Fa un flaix cap on mira la càmera; retorna quants fantasmes ha captat. */
  flaix: () => number;
  /** Fa marxar els fantasmes, com un crit. */
  crida: () => void;
}

interface Props {
  /** Lectura de la brúixola i la inclinació; pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors (ordinador): arrossegar el dit gira la mirada. */
  arrossegar: boolean;
  /** Micròfon: funció que retorna el volum actual (0-1). Si hi és, un crit espanta els fantasmes. */
  nivellMicro: (() => number) | null;
  quantitat: number;
  /** Posició GPS del punt de llum; sense ella (o lluny, o sense GPS) va a uns 15 m davant del jugador. */
  puntLlum?: PuntGps;
  alEsdeveniment?: (e: EsdevenimentFantasma) => void;
  /** Rep el control del flaix i del crit quan l'escena està a punt, i null quan es desmunta. */
  alControl: (control: ControlFantasmes | null) => void;
  /** No s'ha pogut crear l'escena (sense WebGL o error en carregar). */
  onError: () => void;
}

const FOV_HORITZONTAL = 52;
/** Davant del jugador a quina distància (m) va el punt de llum si no hi ha GPS, i a partir de quina es considera «lluny». */
const DIST_DAVANT = 15;
const DIST_MAX_GPS = 150;
const ESPERA_GPS_MS = 7000;

/**
 * Escena de les ànimes sobre la càmera: canvas WebGL transparent. Three.js només es carrega en obrir
 * aquesta pantalla. La lògica és a components/ar/fantasmes/mon.ts.
 */
export function EscenaFantasmes({ mirada, arrossegar, nivellMicro, quantitat, puntLlum, alEsdeveniment, alControl, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const manual = useRef<Mirada>({ rumb: 0, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const microRef = useRef(nivellMicro);
  const esdevenimentRef = useRef(alEsdeveniment);
  const errorRef = useRef(onError);
  const controlRef = useRef(alControl);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    microRef.current = nivellMicro;
    esdevenimentRef.current = alEsdeveniment;
    errorRef.current = onError;
    controlRef.current = alControl;
  }, [arrossegar, nivellMicro, alEsdeveniment, onError, alControl]);

  useEffect(() => {
    let cancel = false;
    let frame = 0;
    let neteja: () => void = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const { MonFantasmes } = await import("@/components/ar/fantasmes/mon");
        const canvas = canvasRef.current;
        if (cancel || !canvas) return;
        const mon = new MonFantasmes(THREE, canvas, {
          quantitat,
          alEsdeveniment: (e) => esdevenimentRef.current?.(e),
        });
        controlRef.current({ flaix: () => mon.flaix(), crida: () => mon.espantaTots() });
        // Punt de llum: al lloc GPS si hi som a prop; si no, davant d'on mirem ara.
        let ambGps = false;
        let idGps: number | null = null;
        const davant = () => {
          if (ambGps) return;
          const lectura = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
          mon.fixaPuntLlumDavant(lectura.rumb, DIST_DAVANT);
        };
        let tempsGps: ReturnType<typeof setTimeout> | null = null;
        if (puntLlum && typeof navigator !== "undefined" && navigator.geolocation) {
          tempsGps = setTimeout(davant, ESPERA_GPS_MS);
          idGps = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              const nord = (puntLlum.latitud - latitude) * 111320;
              const est = (puntLlum.longitud - longitude) * 111320 * Math.cos((latitude * Math.PI) / 180);
              if (Math.hypot(est, nord) > DIST_MAX_GPS) return; // lluny del lloc: es queda davant
              const ara = mon.puntLlum;
              if (!ambGps || !ara || Math.hypot(ara.est - est, ara.nord - nord) > 4) mon.fixaPuntLlum(est, nord);
              ambGps = true;
            },
            () => davant(),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
          );
        } else {
          davant();
        }
        let w = 0;
        let h = 0;
        const bucle = (ara: number) => {
          const cw = canvas.clientWidth;
          const ch = canvas.clientHeight;
          if (cw !== w || ch !== h) {
            w = cw;
            h = ch;
            mon.redimensiona(w, h);
          }
          const lectura = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
          const lector = microRef.current;
          mon.actualitza(ara, lectura, lector ? lector() : 0, lector !== null);
          frame = requestAnimationFrame(bucle);
        };
        frame = requestAnimationFrame(bucle);
        neteja = () => {
          cancelAnimationFrame(frame);
          if (tempsGps) clearTimeout(tempsGps);
          if (idGps !== null) navigator.geolocation.clearWatch(idGps);
          controlRef.current(null);
          mon.dispose();
        };
      } catch {
        if (!cancel) errorRef.current();
      }
    })();

    return () => {
      cancel = true;
      cancelAnimationFrame(frame);
      neteja();
    };
  }, [mirada, quantitat, puntLlum]);

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
