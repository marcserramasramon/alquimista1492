"use client";

import { useEffect, useRef } from "react";

export interface VistaMissatgeMasterProps {
  titol: string;
  text: string;
  /** Quants missatges queden per llegir, comptant aquest. */
  pendents?: number;
  /** Mentre es desa que s'ha llegit. */
  enviant?: boolean;
  onAcceptar: () => void;
}

/**
 * Pop-up amb un missatge del màster. Tapa la pantalla de joc sencera (hub, fita, final):
 * gran i amb molt de contrast perquè es llegeixi a ple sol, i només es tanca amb "D'acord".
 */
export function VistaMissatgeMaster({ titol, text, pendents = 1, enviant = false, onAcceptar }: VistaMissatgeMasterProps) {
  const boto = useRef<HTMLButtonElement>(null);

  // El focus va al botó: lector de pantalla i teclat hi arriben de seguida.
  useEffect(() => {
    boto.current?.focus();
  }, [titol, text]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="missatge-master-titol"
      aria-describedby="missatge-master-text"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="targeta flex max-h-full w-full max-w-md animate-segellar flex-col gap-5 overflow-y-auto bg-[#fffdf7] p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="etiqueta text-gold-deep">✦ missatge ✦</p>
          {pendents > 1 && (
            <p className="rounded-full border-2 border-ink bg-gold px-2.5 text-sm font-extrabold">
              1 de {pendents}
            </p>
          )}
        </div>
        <h2 id="missatge-master-titol" className="font-display text-4xl font-extrabold leading-tight">
          {titol}
        </h2>
        <p id="missatge-master-text" className="whitespace-pre-line text-2xl font-bold leading-snug text-ink">
          {text}
        </p>
        <button ref={boto} type="button" onClick={onAcceptar} disabled={enviant} className="btn btn-primari mt-2">
          D&apos;acord
        </button>
      </div>
    </div>
  );
}
