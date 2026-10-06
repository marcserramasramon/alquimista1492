"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Àudio d'un vídeo, en un fitxer a part: /video/x.mp4 → /audio/video/x.mp3. */
export function audioDeVideo(video: string): string {
  return video.replace(/^\/video\//, "/audio/video/").replace(/\.mp4$/, ".mp3");
}

/**
 * Els vídeos van sense so; el so és un fitxer a part (audioDeVideo) que sona sincronitzat amb el
 * <video>: arrenca, es pausa, salta i s'atura amb ell. Si el fitxer d'àudio no hi és, el vídeo
 * es veu mut. Si el navegador bloqueja l'àudio (autoplay sense cap toc previ), crida `onBlocat`.
 */
export function useSoVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  video: string,
  { volum = 1, actiu = true, onBlocat }: { volum?: number; actiu?: boolean; onBlocat?: () => void } = {}
) {
  const blocatRef = useRef(onBlocat);
  useEffect(() => {
    blocatRef.current = onBlocat;
  });

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !actiu) return;
    const so = new Audio(audioDeVideo(video));
    so.preload = "auto";
    so.volume = volum;
    let fallat = false;

    const sincronitzar = () => {
      if (Math.abs(so.currentTime - el.currentTime) > 0.25) {
        try {
          so.currentTime = el.currentTime;
        } catch {
          // Encara sense metadades: arrencarà des del principi.
        }
      }
    };
    const enReproduir = () => {
      sincronitzar();
      so.play().catch(() => {
        if (!fallat) blocatRef.current?.();
      });
    };
    const enAturar = () => so.pause();

    so.addEventListener("error", () => {
      fallat = true;
    });
    el.addEventListener("playing", enReproduir);
    el.addEventListener("waiting", enAturar);
    el.addEventListener("pause", enAturar);
    el.addEventListener("ended", enAturar);
    el.addEventListener("seeked", sincronitzar);
    if (!el.paused && !el.ended) enReproduir();

    return () => {
      el.removeEventListener("playing", enReproduir);
      el.removeEventListener("waiting", enAturar);
      el.removeEventListener("pause", enAturar);
      el.removeEventListener("ended", enAturar);
      el.removeEventListener("seeked", sincronitzar);
      so.pause();
      so.removeAttribute("src");
      so.load();
    };
  }, [videoRef, video, volum, actiu]);
}
