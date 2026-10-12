"use client";

import { useEffect, useRef, type RefObject } from "react";
import { FOV_HORITZONTAL, MonAigua } from "@/components/ar/aigua/mon";
import { ContornPersones, type EstatContorn } from "@/components/ar/foc/contorn";
import type { Mirada } from "@/lib/orientacio";

interface Props {
  /** Lectura de la brúixola i la inclinació; pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors (ordinador): arrossegar el dit gira la mirada. */
  arrossegar: boolean;
  /** Vídeo de la càmera, per retallar-hi les persones; null si no hi ha càmera. */
  video: RefObject<HTMLVideoElement | null> | null;
  alEstatContorn?: (estat: EstatContorn) => void;
}

/** Resolució del dibuix respecte de la pantalla. */
const RESOLUCIO = 0.75;

/** Escena de l'aigua sobre la càmera: ràpids al terra, amb les persones per damunt. Canvas 2D transparent. */
export function EscenaAigua({ mirada, arrossegar, video, alEstatContorn }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const manual = useRef<Mirada>({ rumb: 0, elevacio: -35 });
  const arrossegarRef = useRef(arrossegar);
  const videoRef = useRef(video);
  const estatRef = useRef(alEstatContorn);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    videoRef.current = video;
    estatRef.current = alEstatContorn;
  }, [arrossegar, video, alEstatContorn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const mon = new MonAigua();
    // Només es fa servir la silueta de les persones, per deixar-les per damunt de l'aigua.
    const persones = new ContornPersones();
    let ultimEstat: EstatContorn | null = null;
    void persones.iniciar();

    let frame = 0;
    let anterior = performance.now();
    const bucle = (ara: number) => {
      const dt = Math.min(0.05, Math.max(0, (ara - anterior) / 1000));
      anterior = ara;
      const w = Math.round(canvas.clientWidth * RESOLUCIO);
      const h = Math.round(canvas.clientHeight * RESOLUCIO);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      const v = videoRef.current?.current;
      try {
        if (v && w > 0 && h > 0) persones.actualitza(v, w, h, ara);
      } catch {
        // Sense silueta, l'aigua es veu igualment.
      }
      if (persones.estat !== ultimEstat) {
        ultimEstat = persones.estat;
        estatRef.current?.(persones.estat);
      }
      const lectura = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
      mon.pinta(ctx, w, h, dt, lectura);
      try {
        if (v && w > 0 && h > 0) persones.tapa(ctx, w, h);
      } catch {
        // Un error a la silueta no ha d'aturar el bucle.
      }
      frame = requestAnimationFrame(bucle);
    };
    frame = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(frame);
      persones.tanca();
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
          elevacio: Math.max(-80, Math.min(60, manual.current.elevacio + dy * graus)),
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
