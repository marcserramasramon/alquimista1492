"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Vídeo a pantalla completa que, en acabar, avisa amb `onAcabat` perquè el pare el tregui.
 * Si el navegador bloqueja l'inici automàtic (amb so), mostra un ▶ gran per tocar.
 * Si el fitxer no es pot carregar, acaba de seguida: el vídeo és un extra, mai pot encallar el joc.
 */
export function VideoPantallaCompleta({ src, onAcabat }: { src: string; onAcabat: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blocat, setBlocat] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => setBlocat(true));
  }, [src]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vídeo de Fra Francesc"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        playsInline
        preload="auto"
        onEnded={onAcabat}
        onError={onAcabat}
        onPlay={() => setBlocat(false)}
      />
      <button
        type="button"
        onClick={onAcabat}
        aria-label="Tancar el vídeo"
        className="absolute right-2 top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex h-12 w-12 items-center justify-center"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/40">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {blocat && (
        <button
          type="button"
          onClick={() => void videoRef.current?.play()}
          aria-label="Reproduir el vídeo"
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-7xl text-white"
        >
          ▶
        </button>
      )}
    </div>
  );
}
