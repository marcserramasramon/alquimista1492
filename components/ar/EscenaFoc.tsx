"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ContornPersones, type EstatContorn } from "@/components/ar/foc/contorn";
import { FOV_HORITZONTAL, MonFoc, type EsdevenimentSalt } from "@/components/ar/foc/mon";
import type { Mirada } from "@/lib/orientacio";

interface Props {
  /** Lectura de la brúixola i la inclinació; pot ser nul·la fins que arribi la primera. */
  mirada: RefObject<Mirada | null>;
  /** Sense sensors (ordinador): arrossegar el dit gira la mirada. */
  arrossegar: boolean;
  /** Vídeo de la càmera, per treure'n el contorn de les persones; null si no hi ha càmera. */
  video: RefObject<HTMLVideoElement | null> | null;
  alSalt?: (e: EsdevenimentSalt) => void;
  alEstatContorn?: (estat: EstatContorn) => void;
  /** ?debug=1: aquí s'hi escriu l'estat del contorn. */
  depuracio?: RefObject<string> | null;
}

/** Resolució del dibuix respecte de la pantalla: els resplendors no necessiten píxels de sobra. */
const RESOLUCIO = 0.75;

/** Escena del foc sobre la càmera: contorn de les persones i arcs de flames. Canvas 2D transparent. */
export function EscenaFoc({ mirada, arrossegar, video, alSalt, alEstatContorn, depuracio }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const manual = useRef<Mirada>({ rumb: 0, elevacio: 0 });
  const arrossegarRef = useRef(arrossegar);
  const videoRef = useRef(video);
  const saltRef = useRef(alSalt);
  const estatRef = useRef(alEstatContorn);
  const depuracioRef = useRef(depuracio);

  useEffect(() => {
    arrossegarRef.current = arrossegar;
    videoRef.current = video;
    saltRef.current = alSalt;
    estatRef.current = alEstatContorn;
    depuracioRef.current = depuracio;
  }, [arrossegar, video, alSalt, alEstatContorn, depuracio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const mon = new MonFoc((e) => saltRef.current?.(e));
    const contorn = new ContornPersones();
    let ultimEstat: EstatContorn | null = null;
    // El model es comença a carregar de seguida, mentre el mòbil encara demana el permís de la càmera.
    void contorn.iniciar();

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
      if (v && w > 0 && h > 0) contorn.actualitza(v, w, h, ara);
      if (depuracioRef.current) {
        depuracioRef.current.current = `${contorn.estat} · vídeo ${v ? `${v.videoWidth}x${v.videoHeight} rs${v.readyState}` : "no"}
${contorn.info}`;
      }
      if (contorn.estat !== ultimEstat) {
        ultimEstat = contorn.estat;
        estatRef.current?.(contorn.estat);
      }
      const lectura = arrossegarRef.current ? manual.current : (mirada.current ?? manual.current);
      // Primer les flames (fons), després s'hi retalla la silueta de les persones i, a sobre, el seu contorn.
      mon.pinta(ctx, w, h, dt, lectura);
      if (v && w > 0 && h > 0) {
        contorn.tapa(ctx, w, h);
        contorn.pinta(ctx, w, h, ara);
      }
      frame = requestAnimationFrame(bucle);
    };
    frame = requestAnimationFrame(bucle);
    return () => {
      cancelAnimationFrame(frame);
      contorn.tanca();
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
