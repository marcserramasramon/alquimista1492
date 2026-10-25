"use client";

import type { ReactNode } from "react";
import { AvisError, Marca, Pantalla } from "@/components/ui/Pantalla";

export type ModeEntradaEquip = "camera" | "manual";

export const LLARGADA_CODI_ENTRADA = 8;

export interface VistaEntradaEquipProps {
  mode: ModeEntradaEquip;
  /** El visor de la càmera. */
  camera?: ReactNode;
  codi: string;
  enviant: boolean;
  error: string | null;
  onCodiChange: (codi: string) => void;
  onEnviarCodi: () => void;
  onMode: (mode: ModeEntradaEquip) => void;
}

/**
 * Entrada a un equip: escanejar el QR que dona el màster o entrar-ne el codi a mà.
 * No hi ha icones: el codi ja diu quin equip és.
 */
export function VistaEntradaEquip({
  mode,
  camera,
  codi,
  enviant,
  error,
  onCodiChange,
  onEnviarCodi,
  onMode,
}: VistaEntradaEquipProps) {
  return (
    <Pantalla>
      <div className="mb-6 animate-entrar">
        <Marca petita />
      </div>

      <div className="mb-5 animate-entrar text-center [animation-delay:80ms]">
        {/* TEXT PROVISIONAL */}
        <h1 className="text-4xl font-bold">Quin és el vostre equip?</h1>
        {/* TEXT PROVISIONAL */}
        <p className="mt-1 text-ink-soft">
          {mode === "camera" ? "Escanegeu el QR que us dona l'organització." : "Entreu el codi del vostre equip."}
        </p>
      </div>

      {mode === "camera" ? (
        <div className="flex flex-col gap-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-[3px] border-ink bg-ink shadow-[0_5px_0_var(--ink)]">
            {camera}
          </div>
          {error && <AvisError>{error}</AvisError>}
          <button type="button" onClick={() => onMode("manual")} className="btn btn-secundari">
            ⌨️ Entreu el codi manualment
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onEnviarCodi();
          }}
          className="flex flex-col gap-4"
        >
          <label htmlFor="codi-equip" className="etiqueta">
            codi de l&apos;equip
          </label>
          <input
            id="codi-equip"
            type="text"
            value={codi}
            onChange={(e) =>
              onCodiChange(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, LLARGADA_CODI_ENTRADA)
              )
            }
            autoFocus
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={LLARGADA_CODI_ENTRADA}
            placeholder="········"
            className={`h-20 w-full rounded-2xl border-[3px] bg-[#fffdf7] text-center font-mono text-4xl font-extrabold tracking-[0.2em] shadow-[0_4px_0_var(--ink)] outline-none focus:ring-4 focus:ring-gold/70 ${
              error ? "animate-tremolar border-blood text-blood" : "border-ink"
            }`}
          />
          {error && <AvisError>{error}</AvisError>}
          <button type="submit" disabled={codi.length !== LLARGADA_CODI_ENTRADA || enviant} className="btn btn-primari">
            {enviant ? "Entrant..." : "Entrar a l'equip →"}
          </button>
          <button type="button" onClick={() => onMode("camera")} className="btn btn-secundari">
            📷 Tornar a escanejar el QR
          </button>
        </form>
      )}
    </Pantalla>
  );
}
