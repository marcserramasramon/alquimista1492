"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_TEXT_AVIS } from "@/content/public/avisos";

export interface VistaEnviarAvisProps {
  enviant?: boolean;
  error?: string | null;
  enviat?: boolean;
  onEnviar: (text: string) => void;
  onTancar: () => void;
}

/**
 * Pop-up del botó "?" del mapa: l'equip escriu un avís curt per al màster
 * (p.ex. "no trobem la fita", "algú s'ha fet mal"). Direcció única: no és un
 * xat, no hi ha resposta dins l'app.
 */
export function VistaEnviarAvis({
  enviant = false,
  error = null,
  enviat = false,
  onEnviar,
  onTancar,
}: VistaEnviarAvisProps) {
  const [text, setText] = useState("");
  const camp = useRef<HTMLTextAreaElement>(null);
  const boto = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    (enviat ? boto : camp).current?.focus();
  }, [enviat]);

  const potEnviar = !enviant && text.trim().length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enviar-avis-titol"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="targeta flex w-full max-w-md animate-segellar flex-col gap-4 bg-[#fffdf7] p-6">
        {enviat ? (
          <>
            <p className="etiqueta text-gold-deep">✦ avís enviat ✦</p>
            <h2 id="enviar-avis-titol" className="font-display text-3xl font-extrabold leading-tight">
              El màster ho sabrà de seguida
            </h2>
            <button ref={boto} type="button" onClick={onTancar} className="btn btn-primari mt-2">
              D&apos;acord
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p id="enviar-avis-titol" className="etiqueta text-gold-deep">
                ✦ avisar el màster ✦
              </p>
              <button
                type="button"
                onClick={onTancar}
                aria-label="Tancar"
                className="btn btn-secundari btn-rodo text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-lg font-bold leading-snug text-ink-soft">
              Escriviu què passa. No és un xat: el màster ho llegirà i us buscarà si cal.
            </p>
            <label className="flex flex-col gap-1">
              <textarea
                ref={camp}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_TEXT_AVIS}
                rows={4}
                placeholder="Per exemple: no trobem la fita del Foc..."
                className="camp resize-none text-xl"
              />
              <span className="self-end text-sm text-ink-soft">
                {text.length}/{MAX_TEXT_AVIS}
              </span>
            </label>
            {error && (
              <p role="alert" className="rounded-xl border-[3px] border-blood bg-[#fffdf7] p-3 text-lg font-extrabold text-blood">
                ✗ {error}
              </p>
            )}
            <button type="button" onClick={() => onEnviar(text.trim())} disabled={!potEnviar} className="btn btn-primari">
              {enviant ? "Enviant..." : "✉️ Enviar al màster"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
