"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ContornPersones, type EstatContorn } from "@/components/ar/aura/contorn";

interface Props {
  /** Vídeo de la càmera, d'on es treu la silueta de les persones. */
  video: RefObject<HTMLVideoElement | null>;
  alEstatContorn?: (estat: EstatContorn) => void;
  /** ?debug=1: aquí s'hi escriu l'estat del model. */
  depuracio?: RefObject<string> | null;
}

/** Resolució del dibuix respecte de la pantalla: una llum difuminada no necessita píxels de sobra. */
const RESOLUCIO = 0.75;

/** Escena de la llum sobre la càmera: un filtre difús taronja-vermell a les persones. Canvas 2D transparent. */
export function EscenaAura({ video, alEstatContorn, depuracio }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef(video);
  const estatRef = useRef(alEstatContorn);
  const depuracioRef = useRef(depuracio);

  useEffect(() => {
    videoRef.current = video;
    estatRef.current = alEstatContorn;
    depuracioRef.current = depuracio;
  }, [video, alEstatContorn, depuracio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const contorn = new ContornPersones();
    let ultimEstat: EstatContorn | null = null;
    // El model es comença a carregar de seguida, mentre el mòbil encara demana el permís de la càmera.
    void contorn.iniciar();

    let frame = 0;
    const bucle = (ara: number) => {
      const w = Math.round(canvas.clientWidth * RESOLUCIO);
      const h = Math.round(canvas.clientHeight * RESOLUCIO);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      const v = videoRef.current.current;
      let error = "";
      try {
        if (v && w > 0 && h > 0) {
          contorn.actualitza(v, w, h, ara);
          contorn.pinta(ctx, w, h, ara);
        }
      } catch (e) {
        error = `\ndibuixa: ${e instanceof Error ? e.message : String(e)}`;
      }
      if (depuracioRef.current) {
        const video = v ? `${v.videoWidth}x${v.videoHeight} rs${v.readyState}` : "no";
        depuracioRef.current.current = `${contorn.estat} · vídeo ${video}\n${contorn.info}${error}`;
      }
      if (contorn.estat !== ultimEstat) {
        ultimEstat = contorn.estat;
        estatRef.current?.(contorn.estat);
      }
      frame = requestAnimationFrame(bucle);
    };
    frame = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(frame);
      contorn.tanca();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
