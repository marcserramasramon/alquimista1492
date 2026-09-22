"use client";

import type { ReactNode } from "react";
import { AvisError } from "@/components/ui/Pantalla";

export type ModeObrirFita = "camera" | "manual";

export interface VistaObrirFitaProps {
  mode: ModeObrirFita;
  /** El visor de la càmera (a la galeria, un requadre d'exemple). */
  camera?: ReactNode;
  codi: string;
  enviant: boolean;
  error: string | null;
  onCodiChange: (codi: string) => void;
  onEnviarCodi: () => void;
  onMode: (mode: ModeObrirFita) => void;
  onTancar: () => void;
}

export const LLARGADA_CODI_FITA = 5;

/**
 * Obrir una fita que el GPS encara no ha obert: escanejar el QR del cartell
 * o, a sota, entrar-ne el codi a mà. És la mateixa pantalla per a totes les
 * fites: el codi ja diu quina fita és.
 */
export function VistaObrirFita({
  mode,
  camera,
  codi,
  enviant,
  error,
  onCodiChange,
  onEnviarCodi,
  onMode,
  onTancar,
}: VistaObrirFitaProps) {
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-paper" role="dialog" aria-modal="true" aria-label="Obrir una fita">
      <div className="h-3 bg-gold" />
      <div className="mx-auto flex min-h-[calc(100dvh-0.75rem)] w-full max-w-md flex-col gap-5 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="etiqueta">obrir una fita</p>
            <h2 className="text-4xl font-extrabold leading-tight">
              {mode === "camera" ? "Escanegeu el QR" : "Entreu el codi"}
            </h2>
          </div>
          <button type="button" onClick={onTancar} aria-label="Tancar" className="btn btn-secundari btn-rodo shrink-0 text-xl">
            ✕
          </button>
        </header>

        <p className="text-lg leading-snug">
          {mode === "camera"
            ? "Cada fita té un cartell amb un codi QR. Escanegeu-lo per obrir la fita."
            : "Entreu el codi que hi ha escrit sota el QR del cartell."}
        </p>

        {mode === "camera" ? (
          <>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-[3px] border-ink bg-ink shadow-[0_5px_0_var(--ink)]">
              {camera}
            </div>
            {error && <AvisError>{error}</AvisError>}
            <button type="button" onClick={() => onMode("manual")} className="btn btn-secundari">
              ⌨️ Entreu el codi manualment
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onEnviarCodi();
            }}
            className="flex flex-col gap-4"
          >
            <label htmlFor="codi-fita" className="etiqueta">
              codi del cartell
            </label>
            <input
              id="codi-fita"
              type="text"
              value={codi}
              onChange={(e) =>
                onCodiChange(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, LLARGADA_CODI_FITA)
                )
              }
              autoFocus
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={LLARGADA_CODI_FITA}
              placeholder="·····"
              className={`h-20 w-full rounded-2xl border-[3px] bg-[#fffdf7] text-center font-mono text-5xl font-extrabold tracking-[0.35em] shadow-[0_4px_0_var(--ink)] outline-none focus:ring-4 focus:ring-gold/70 ${
                error ? "animate-tremolar border-blood text-blood" : "border-ink"
              }`}
            />
            {error && <AvisError>{error}</AvisError>}
            <button
              type="submit"
              disabled={codi.length !== LLARGADA_CODI_FITA || enviant}
              className="btn btn-primari"
            >
              {enviant ? "Obrint..." : "Obrir la fita →"}
            </button>
            <button type="button" onClick={() => onMode("camera")} className="btn btn-secundari">
              📷 Tornar a escanejar el QR
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
