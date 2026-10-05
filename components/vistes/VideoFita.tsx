"use client";

import { useEffect, useRef } from "react";
import { marcarEscoltada } from "@/components/ui/Narracio";
import { sonarVeu } from "@/lib/so";

export interface VideoFitaProps {
  /** Ruta a public/video/ del vídeo de la fita (fita-aigua.mp4...). Sense el fitxer, s'obvia. */
  video: string;
  /** Veu del fragment (public/audio/fragment-*.mp3): sona des del primer moment i no s'atura amb el vídeo. */
  veu?: string;
  onAcabat: () => void;
}

/** Xarxa de seguretat (autoplay bloquejat sense error): com a CelebracioEstrella. */
const RESERVA_MAXIMA_MS = 20_000;

/**
 * Vídeo de la fita resolta, entre la pantalla de fita completa (CelebracioFragment) i la de la fita
 * amb el text del fragment. El vídeo és mut: el so és la veu del fragment, que arrenca amb ell i,
 * quan el vídeo s'acaba, continua sonant a la pantalla de la fita (aquest component no l'atura mai).
 * Si el fitxer no hi és o falla, `onAcabat` es crida de seguida i la veu continua igualment.
 */
export function VideoFita({ video, veu, onAcabat }: VideoFitaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const acabatCridat = useRef(false);

  function acabar() {
    if (acabatCridat.current) return;
    acabatCridat.current = true;
    onAcabat();
  }

  useEffect(() => {
    if (!veu) return;
    marcarEscoltada(veu);
    void sonarVeu(veu, 0, () => {});
  }, [veu]);

  // Els listeners es lliguen abans de fixar `src`: un 404 pot disparar "error" abans que React l'enllaci.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const reserva = setTimeout(acabar, RESERVA_MAXIMA_MS);
    const final = () => {
      clearTimeout(reserva);
      el.pause();
      acabar();
    };
    el.addEventListener("error", final);
    el.addEventListener("ended", final);
    el.src = video;
    el.load();
    // So propi del vídeo (ambient) al 33%, sota la veu. Si el navegador bloqueja l'autoplay amb so, es reintenta mut.
    el.volume = 0.33;
    el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {});
    });
    return () => {
      el.removeEventListener("error", final);
      el.removeEventListener("ended", final);
      clearTimeout(reserva);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video]);

  return (
    <div role="status" aria-label="Vídeo del fragment trobat" className="fixed inset-0 z-50 overflow-hidden bg-black">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline />
    </div>
  );
}
