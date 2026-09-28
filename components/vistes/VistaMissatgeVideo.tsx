"use client";

import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setError(false);
    setBlocat(false);

    const enError = () => setError(true);
    const enPreparat = () => el.play().catch(() => setBlocat(true));
    el.addEventListener("error", enError);
    el.addEventListener("canplay", enPreparat);
    el.src = video;
    el.load();

    return () => {
      el.removeEventListener("error", enError);
      el.removeEventListener("canplay", enPreparat);
    };
  }, [video]);

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
