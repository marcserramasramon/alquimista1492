"use client";

import { useEffect } from "react";
import { BONES_PRACTIQUES } from "@/content/public/textos";

export const DURADA_BONES_PRACTIQUES_MS = 5000;

export interface VistaBonesPractiquesProps {
  /** Es crida sola als 5 segons, o abans si es toca el botó. */
  onAcabar: () => void;
  /** Sense comptador (galeria de pantalles): es queda fins que es toca el botó. */
  fixa?: boolean;
}

/** Guia de bones pràctiques: surt 5 segons abans que comenci el manual d'ús, la primera vegada. */
export function VistaBonesPractiques({ onAcabar, fixa = false }: VistaBonesPractiquesProps) {
  useEffect(() => {
    if (fixa) return;
    const t = setTimeout(onAcabar, DURADA_BONES_PRACTIQUES_MS);
    return () => clearTimeout(t);
  }, [onAcabar, fixa]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bones-practiques-titol"
      className="fixed inset-0 z-[210] flex items-center justify-center bg-ink/85 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="targeta flex max-h-full w-full max-w-md animate-segellar flex-col gap-4 overflow-y-auto bg-[#fffdf7] p-6">
        <p id="bones-practiques-titol" className="etiqueta text-center text-gold-deep">
          ✦ {BONES_PRACTIQUES.titol.toLowerCase()} ✦
        </p>

        <ul className="flex flex-col gap-3">
          {BONES_PRACTIQUES.punts.map((p) => (
            <li key={p.negreta} className="flex items-start gap-3 text-base leading-snug">
              <span aria-hidden className="text-2xl leading-none">
                {p.emoji}
              </span>
              <span className="text-ink-soft">
                <span className="font-extrabold text-ink">{p.negreta}</span> {p.resta}
              </span>
            </li>
          ))}
        </ul>

        {!fixa && (
          <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-ink/15">
            <div
              className="h-full origin-left rounded-full bg-gold"
              style={{ animation: `buidar ${DURADA_BONES_PRACTIQUES_MS}ms linear forwards` }}
            />
          </div>
        )}

        <button type="button" onClick={onAcabar} className="btn btn-primari">
          Entès!
        </button>
      </div>
    </div>
  );
}
