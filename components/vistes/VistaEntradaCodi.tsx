"use client";

import { useState } from "react";
import { AvisError, Marca, Pantalla } from "@/components/ui/Pantalla";

export interface VistaEntradaCodiProps {
  codi: string;
  error: string | null;
  enviant: boolean;
  onCodiChange: (codi: string) => void;
  onSubmit: () => void;
}

const LLARGADA = 6;

/** Pantalla d'entrada del codi d'equip (6 caràcters), en sis caselles. */
export function VistaEntradaCodi({ codi, error, enviant, onCodiChange, onSubmit }: VistaEntradaCodiProps) {
  const [focus, setFocus] = useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  const complet = codi.trim().length === LLARGADA;

  return (
    <Pantalla centrat>
      <div className="mb-10 animate-entrar">
        <Marca petita />
      </div>

      <form onSubmit={enviar} className="flex animate-entrar flex-col gap-5 [animation-delay:100ms]">
        <label htmlFor="codi" className="text-center">
          <span className="block font-display text-4xl font-bold">El codi de l&apos;equip</span>
          <span className="mt-1 block text-ink-soft">Introduïu els sis caràcters del vostre codi.</span>
        </label>

        {/* L'input real és invisible i cobreix les caselles: teclat i enganxar funcionen igual. */}
        <div className={`relative ${error ? "animate-tremolar" : ""}`} key={error ?? "ok"}>
          <div className="grid grid-cols-6 gap-2" aria-hidden>
            {Array.from({ length: LLARGADA }, (_, i) => {
              const lletra = codi[i];
              const actiu = focus && (i === codi.length || (i === LLARGADA - 1 && complet));
              return (
                <div
                  key={i}
                  className={`flex aspect-[4/5] items-center justify-center rounded-xl border-[3px] text-4xl font-extrabold transition-all ${
                    error
                      ? "border-blood bg-blood/10 text-blood"
                      : lletra
                        ? "border-ink bg-[#fffdf7] shadow-[0_4px_0_var(--ink)]"
                        : "border-ink/40 bg-paper-2"
                  } ${actiu ? "-translate-y-1 border-ink ring-4 ring-gold/70" : ""}`}
                >
                  {lletra ?? (actiu ? <span className="h-8 w-1 animate-pulse rounded bg-ink" /> : "")}
                </div>
              );
            })}
          </div>
          <input
            id="codi"
            type="text"
            value={codi}
            onChange={(e) =>
              onCodiChange(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, LLARGADA)
              )
            }
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={LLARGADA}
            className="absolute inset-0 h-full w-full cursor-text opacity-0"
            style={{ fontSize: 16 }}
          />
        </div>

        {error && <AvisError>{error}</AvisError>}

        <button type="submit" disabled={!complet || enviant} className="btn btn-primari mt-2">
          {enviant ? "Entrant..." : "Entrar a la partida →"}
        </button>
      </form>
    </Pantalla>
  );
}
