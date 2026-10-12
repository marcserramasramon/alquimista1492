"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Mirada } from "@/lib/orientacio";

interface Props {
  /** Lectura de la brúixola i la inclinació; pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors (ordinador): arrossegar el dit gira la mirada. */
  arrossegar: boolean;
  /** Rumb del camí, en graus des del nord. */
  rumb: number;
  quantitat: number;
  /** No s'ha pogut crear l'escena (sense WebGL o error en carregar). */
  onError: () => void;
}

const FOV_HORITZONTAL = 52;

/**
 * Escena de les ànimes guia sobre la càmera: canvas WebGL transparent. Three.js només es carrega en
 * obrir aquesta pantalla. La lògica és a components/ar/guies/monGuies.ts.
 */
export function EscenaGuies({ mirada, arrossegar, rumb, quantitat, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Sense sensors, la vista comença mirant cap al camí.
  const manual = useRef<Mirada>({ rumb, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const errorRef = useRef(onError);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    errorRef.current = onError;
  }, [arrossegar, onError]);

  useEffect(() => {
    let cancel = false;
    let frame = 0;
    let neteja: () => void = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const { MonGuies } = await import("@/components/ar/guies/monGuies");
        const canvas = canvasRef.current;
        if (cancel || !canvas) return;
        const mon = new MonGuies(THREE, canvas, { rumb, quantitat });
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
          mon.actualitza(ara, arrossegarRef.current ? manual.current : (mirada.current ?? manual.current));
          frame = requestAnimationFrame(bucle);
        };
        frame = requestAnimationFrame(bucle);
        neteja = () => {
          cancelAnimationFrame(frame);
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
  }, [mirada, rumb, quantitat]);

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
