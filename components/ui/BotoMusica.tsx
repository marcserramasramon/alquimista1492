"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { escoltarEstatSo, iniciarMusica, soActiu } from "@/lib/so";

/**
 * Música de fons amb un botó per aturar-la o engegar-la. Dura 15 s com a màxim i
 * s'apaga amb un fos (lib/so.ts); el botó la torna a engegar.
 * Comença sola en obrir la pantalla; si el navegador encara no deixa sonar
 * res (cap toc previ), el botó diu "Engegar" i qualsevol toc la posa en marxa.
 */
export function BotoMusica({ className = "" }: { className?: string }) {
  const [volguda, setVolguda] = useState(true);
  const aturar = useRef<(() => void) | null>(null);
  const actiu = useSyncExternalStore(escoltarEstatSo, soActiu, () => false);

  useEffect(() => {
    if (!volguda) return;
    aturar.current = iniciarMusica("guardians", () => setVolguda(false));
    return () => {
      aturar.current?.();
      aturar.current = null;
    };
  }, [volguda]);

  const sonant = volguda && actiu;

  return (
    <button
      type="button"
      onClick={() => setVolguda(!sonant)}
      aria-pressed={sonant}
      className={`btn btn-secundari w-auto px-4 text-base ${className}`}
    >
      <span aria-hidden>{sonant ? "🔊" : "🔇"}</span>
      {sonant ? "Aturar la música" : "Engegar la música"}
    </button>
  );
}
