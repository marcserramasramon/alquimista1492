"use client";

import { AvisError, Marca, Pantalla } from "@/components/ui/Pantalla";
import { EQUIPS } from "@/content/public/equips";

export interface VistaSeleccioEquipProps {
  /** Ids dels equips que ja ha agafat un altre mòbil. */
  agafats: string[];
  /** Equip que s'està agafant ara mateix (esperant el servidor). */
  triant: string | null;
  error: string | null;
  onTriar: (equipId: string) => void;
}

/** Les 8 icones d'equip: un toc agafa l'equip i el bloqueja per als altres mòbils. */
export function VistaSeleccioEquip({ agafats, triant, error, onTriar }: VistaSeleccioEquipProps) {
  return (
    <Pantalla>
      <div className="mb-6 animate-entrar">
        <Marca petita />
      </div>

      <div className="mb-5 animate-entrar text-center [animation-delay:80ms]">
        {/* TEXT PROVISIONAL */}
        <h1 className="text-4xl font-bold">Quin és el vostre equip?</h1>
        {/* TEXT PROVISIONAL */}
        <p className="mt-1 text-ink-soft">Toqueu el vostre emblema.</p>
      </div>

      {error && (
        <div className="mb-4">
          <AvisError>{error}</AvisError>
        </div>
      )}

      <ul className="grid animate-entrar grid-cols-2 gap-3 [animation-delay:160ms]">
        {EQUIPS.map((equip) => {
          const agafat = agafats.includes(equip.id);
          const aquest = triant === equip.id;
          return (
            <li key={equip.id}>
              <button
                type="button"
                onClick={() => onTriar(equip.id)}
                disabled={agafat || triant !== null}
                aria-label={agafat ? `${equip.nom} (ja triat)` : equip.nom}
                className={`flex h-full min-h-48 w-full flex-col items-center gap-2 rounded-2xl border-[3px] p-3 text-center transition ${
                  agafat
                    ? "border-ink/25 bg-paper-3"
                    : aquest
                      ? "-translate-y-1 border-ink bg-[#fffdf7] ring-4 ring-gold/70"
                      : "border-ink bg-[#fffdf7] shadow-[0_4px_0_var(--ink)] active:translate-y-1 active:shadow-none"
                }`}
              >
                <span className="relative block w-full max-w-28">
                  <img
                    src={equip.imatge}
                    alt=""
                    className={`aspect-square w-full ${agafat ? "opacity-30 grayscale" : ""} ${aquest ? "animate-bategar" : ""}`}
                  />
                  {agafat && (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden>
                      🔒
                    </span>
                  )}
                </span>
                <span className={`text-lg font-extrabold leading-tight ${agafat ? "text-ink-soft" : ""}`}>
                  {equip.nom}
                </span>
                {agafat && <span className="etiqueta text-xs">ja triat</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </Pantalla>
  );
}
