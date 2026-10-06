"use client";

import { useEffect, useRef, useState } from "react";
import { useSoVideo } from "@/lib/useSoVideo";

export interface VistaMissatgeVideoProps {
  titol: string;
  text: string;
  video: string;
  /** Quants missatges queden per llegir, comptant aquest. */
  pendents?: number;
  /** Mentre es desa que s'ha llegit. */
  enviant?: boolean;
  onAcceptar: () => void;
}

/**
 * Pop-up amb un missatge de vídeo del màster (l'Inquisidor alertant en directe).
 * A diferència de VistaMissatgeMaster, el vídeo ocupa tota la pantalla i el text
 * només hi queda com a subtítol, per si no es pot sentir el so a ple carrer.
 * Si el fitxer no es pot reproduir (encara no gravat, o error de xarxa), cau en
 * un missatge només de text perquè l'avís sempre arribi.
 *
 * Els listeners de <video> (error inclòs) es lliguen a mà abans de fixar `src`:
 * l'esdeveniment "error" no fa bombolla i, amb un fitxer local que falla de
 * seguida (404), pot arribar abans que React n'hagi enllaçat el `onError` de JSX.
 */
export function VistaMissatgeVideo({
  titol,
  text,
  video,
  pendents = 1,
  enviant = false,
  onAcceptar,
}: VistaMissatgeVideoProps) {
  const boto = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [blocat, setBlocat] = useState(false);
  const [reproduint, setReproduint] = useState(false);
  const [acabat, setAcabat] = useState(false);
  // El so és un fitxer a part; si el navegador el bloqueja, es para el vídeo i es mostren els controls perquè l'equip el toqui.
  useSoVideo(videoRef, video, {
    onBlocat: () => {
      videoRef.current?.pause();
      setBlocat(true);
    },
  });

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setError(false);
    setBlocat(false);
    setReproduint(false);
    setAcabat(false);

    const enError = () => setError(true);
    const enPreparat = () => el.play().catch(() => setBlocat(true));
    const enReproduir = () => {
      setReproduint(true);
      setAcabat(false);
    };
    const enPausa = () => setReproduint(false);
    const enAcabar = () => {
      setReproduint(false);
      setAcabat(true);
    };
    el.addEventListener("error", enError);
    el.addEventListener("canplay", enPreparat);
    el.addEventListener("play", enReproduir);
    el.addEventListener("pause", enPausa);
    el.addEventListener("ended", enAcabar);
    el.src = video;
    el.load();

    return () => {
      el.removeEventListener("error", enError);
      el.removeEventListener("canplay", enPreparat);
      el.removeEventListener("play", enReproduir);
      el.removeEventListener("pause", enPausa);
      el.removeEventListener("ended", enAcabar);
    };
  }, [video]);

  /** Pausa/reprèn; si el vídeo ja s'ha acabat, el torna a començar. */
  function alternarReproduccio() {
    const el = videoRef.current;
    if (!el) return;
    if (acabat) {
      el.currentTime = 0;
      el.play().catch(() => setBlocat(true));
    } else if (reproduint) {
      el.pause();
    } else {
      el.play().catch(() => setBlocat(true));
    }
  }

  useEffect(() => {
    boto.current?.focus();
  }, [titol, text, error]);

  if (error) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="missatge-video-titol"
        aria-describedby="missatge-video-text"
        className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="targeta flex max-h-full w-full max-w-md animate-segellar flex-col gap-5 overflow-y-auto bg-[#fffdf7] p-6">
          <p className="etiqueta text-gold-deep">✦ missatge ✦</p>
          <h2 id="missatge-video-titol" className="font-display text-4xl font-extrabold leading-tight">
            {titol}
          </h2>
          <p id="missatge-video-text" className="whitespace-pre-line text-2xl font-bold leading-snug text-ink">
            {text}
          </p>
          <button ref={boto} type="button" onClick={onAcceptar} disabled={enviant} className="btn btn-primari mt-2">
            D&apos;acord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="missatge-video-titol"
      aria-describedby="missatge-video-text"
      className="fixed inset-0 z-[200] flex flex-col bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      {pendents > 1 && (
        <p className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border-2 border-ink bg-gold px-2.5 text-sm font-extrabold">
          1 de {pendents}
        </p>
      )}

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline controls={blocat} />
        {!blocat && (
          <button
            type="button"
            onClick={alternarReproduccio}
            aria-label={acabat ? "Tornar a reproduir" : reproduint ? "Pausar" : "Reproduir"}
            className="btn btn-secundari btn-rodo absolute bottom-3 right-3 z-10 shadow-[0_3px_0_var(--ink)]"
          >
            {acabat ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path
                  d="M4 12a8 8 0 1 1 2.7 5.95M4 12v5h5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : reproduint ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
              </svg>
            )}
          </button>
        )}
        {blocat && (
          <button
            type="button"
            onClick={() => {
              videoRef.current?.play();
              setBlocat(false);
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-6xl text-white"
            aria-label="Reproduir el vídeo"
          >
            ▶
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 bg-[#fffdf7] p-5">
        <h2 id="missatge-video-titol" className="font-display text-2xl font-extrabold leading-tight text-ink">
          {titol}
        </h2>
        <p id="missatge-video-text" className="whitespace-pre-line text-lg leading-snug text-ink">
          {text}
        </p>
        <button ref={boto} type="button" onClick={onAcceptar} disabled={enviant} className="btn btn-primari mt-1">
          D&apos;acord
        </button>
      </div>
    </div>
  );
}
