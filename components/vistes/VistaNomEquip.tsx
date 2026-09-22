"use client";

import { AvisError, Pantalla } from "@/components/ui/Pantalla";

export interface VistaNomEquipProps {
  nom: string;
  error: string | null;
  enviant: boolean;
  onNomChange: (nom: string) => void;
  onSubmit: () => void;
}

const MAXIM = 30;

/** Pantalla on l'equip tria el seu nom (primera entrada). */
export function VistaNomEquip({ nom, error, enviant, onNomChange, onSubmit }: VistaNomEquipProps) {
  const nomValid = nom.trim().length >= 2 && nom.trim().length <= MAXIM;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <Pantalla centrat>
      <div className="mb-8 animate-entrar text-center">
        <div
          aria-hidden
          className="mx-auto mb-5 flex h-20 w-20 rotate-3 items-center justify-center rounded-2xl border-[3px] border-ink bg-gold text-4xl shadow-[0_5px_0_var(--ink)]"
        >
          🛡️
        </div>
        {/* TEXT PROVISIONAL */}
        <h1 className="text-5xl font-bold">Com es diu el vostre equip?</h1>
        {/* TEXT PROVISIONAL */}
        <p className="mt-2 text-ink-soft">Escolliu un nom per a la partida.</p>
      </div>

      <form onSubmit={enviar} className="flex animate-entrar flex-col gap-4 [animation-delay:100ms]">
        <div>
          <input
            type="text"
            value={nom}
            onChange={(e) => onNomChange(e.target.value.slice(0, MAXIM))}
            placeholder="Nom de l'equip"
            autoComplete="off"
            maxLength={MAXIM}
            aria-label="Nom de l'equip"
            className="camp text-center"
          />
          <p className="mt-1 pr-1 text-right text-sm text-ink-soft">
            {nom.length}/{MAXIM}
          </p>
        </div>
        {error && <AvisError>{error}</AvisError>}
        <button type="submit" disabled={!nomValid || enviant} className="btn btn-primari">
          {enviant ? "Desant..." : "Som-hi! →"}
        </button>
      </form>
    </Pantalla>
  );
}
