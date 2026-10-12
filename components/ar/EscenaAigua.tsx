"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ContornPersones, type EstatContorn } from "@/components/ar/foc/contorn";
import type { Mirada } from "@/lib/orientacio";

/** Camp de visió horitzontal que s'assumeix (el mateix que l'escena 3D). */
const FOV_HORITZONTAL = 52;

interface Props {
  /** Lectura de la brúixola i la inclinació; pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors (ordinador): arrossegar el dit gira la mirada. */
  arrossegar: boolean;
  /** Vídeo de la càmera, per retallar-hi les persones; null si no hi ha càmera. */
  video: RefObject<HTMLVideoElement | null> | null;
  alEstatContorn?: (estat: EstatContorn) => void;
  /** No s'ha pogut crear el 3D (sense WebGL). */
  alError?: () => void;
  /** Cap a on corre el riu (rumb en graus, p. ex. el del carrer) i quin ample té (m). */
  rumbRiu?: number | null;
  ampleRiu?: number;
  /** Aigües amunt el riu s'obre en una bassa (una explanada). */
  explanada?: { distancia: number; radi: number };
}

/** Resolució del dibuix respecte de la pantalla. */
const RESOLUCIO = 0.75;

/**
 * Escena de l'aigua sobre la càmera: ràpids en 3D (three.js) al terra, amb les persones per damunt.
 * Three.js dibuixa en un canvas fora de pantalla; aquí es copia al canvas visible i s'hi retallen les persones.
 */
export function EscenaAigua({ mirada, arrossegar, video, alEstatContorn, alError, rumbRiu = null, ampleRiu, explanada }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const manual = useRef<Mirada>({ rumb: rumbRiu ?? 0, elevacio: -35 });
  const arrossegarRef = useRef(arrossegar);
  const videoRef = useRef(video);
  const estatRef = useRef(alEstatContorn);
  const errorRef = useRef(alError);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    videoRef.current = video;
    estatRef.current = alEstatContorn;
    errorRef.current = alError;
  }, [arrossegar, video, alEstatContorn, alError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // Només es fa servir la silueta de les persones, per deixar-les per damunt de l'aigua.
    const persones = new ContornPersones();
    let ultimEstat: EstatContorn | null = null;
    void persones.iniciar();

    let cancel = false;
    let frame = 0;
    let alliberar = () => {};

    (async () => {
      let aigua: import("@/components/ar/aigua/aiguaThree").AiguaThree;
      try {
        // Three.js es carrega només quan es fa servir aquesta pantalla.
        const { AiguaThree } = await import("@/components/ar/aigua/aiguaThree");
        if (cancel) return;
        aigua = new AiguaThree(rumbRiu, ampleRiu, explanada);
      } catch {
        errorRef.current?.();
        return;
      }
      alliberar = () => aigua.dispose();

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
        if (w > 0 && h > 0) {
          const v = videoRef.current?.current;
          try {
            if (v) persones.actualitza(v, w, h, ara);
          } catch {
            // Sense silueta, l'aigua es veu igualment.
          }
          if (persones.estat !== ultimEstat) {
            ultimEstat = persones.estat;
            estatRef.current?.(persones.estat);
          }
          const lectura = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
          aigua.redimensiona(w, h);
          aigua.pinta(dt, lectura);
          // Ha de ser just després de dibuixar: el canvas de three.js no guarda la imatge.
          ctx.drawImage(aigua.canvas, 0, 0, w, h);
          try {
            if (v) persones.tapa(ctx, w, h);
          } catch {
            // Un error a la silueta no ha d'aturar el bucle.
          }
        }
        frame = requestAnimationFrame(bucle);
      };
      frame = requestAnimationFrame(bucle);
    })();

    return () => {
      cancel = true;
      cancelAnimationFrame(frame);
      alliberar();
      persones.tanca();
    };
  }, [mirada, rumbRiu, ampleRiu, explanada]);

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
