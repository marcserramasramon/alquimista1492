"use client";

import { AvisError, Marca, Pantalla } from "@/components/ui/Pantalla";
import { DialegConfirmacio } from "@/components/ui/DialegConfirmacio";
import { EQUIPS } from "@/content/public/equips";

export interface VistaSeleccioEquipProps {
  /** Ids dels equips que ja tenen algun mòbil connectat. */
  ambJugadors: string[];
  /** Equip que s'està agafant ara mateix (esperant el servidor). */
  triant: string | null;
  /** Equip amb jugadors on aquest mòbil vol entrar: es demana confirmació. */
  confirmant?: string | null;
  error: string | null;
  onTriar: (equipId: string) => void;
  onConfirmar?: (equipId: string) => void;
  onCancelar?: () => void;
}

/**
 * Les 8 icones d'equip. Un equip pot tenir diversos mòbils: si ja n'hi ha, es demana
 * confirmació abans d'entrar-hi (per no entrar per error a l'equip d'uns altres).
 */
export function VistaSeleccioEquip({
  ambJugadors,
  triant,
  confirmant = null,
  error,
  onTriar,
  onConfirmar,
  onCancelar,
}: VistaSeleccioEquipProps) {
  const equipConfirmant = EQUIPS.find((e) => e.id === confirmant);

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
          const ambJugadorsJa = ambJugadors.includes(equip.id);
          const aquest = triant === equip.id;
          return (
            <li key={equip.id}>
              <button
                type="button"
                onClick={() => onTriar(equip.id)}
                disabled={triant !== null}
                aria-label={ambJugadorsJa ? `${equip.nom} (ja hi ha jugadors)` : equip.nom}
                className={`flex h-full min-h-48 w-full flex-col items-center gap-2 rounded-2xl border-[3px] border-ink bg-[#fffdf7] p-3 text-center transition ${
                  aquest
                    ? "-translate-y-1 ring-4 ring-gold/70"
                    : "shadow-[0_4px_0_var(--ink)] active:translate-y-1 active:shadow-none"
                }`}
              >
                <span className="relative block w-full max-w-28">
                  <img src={equip.imatge} alt="" className={`aspect-square w-full ${aquest ? "animate-bategar" : ""}`} />
                </span>
                <span className="text-lg font-extrabold leading-tight">{equip.nom}</span>
                {/* TEXT PROVISIONAL */}
                {ambJugadorsJa && <span className="etiqueta text-xs">👥 ja hi ha jugadors</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {equipConfirmant && (
        <DialegConfirmacio
          key={equipConfirmant.id}
          confirmacio={{
            // TEXT PROVISIONAL
            titol: `Entrar a ${equipConfirmant.nom}?`,
            // TEXT PROVISIONAL
            text: "Aquest equip ja té jugadors. Entreu-hi només si és el vostre: compartireu el progrés.",
            boto: "Hi entro",
            accio: async () => {
              onConfirmar?.(equipConfirmant.id);
              return null;
            },
          }}
          onTancar={() => onCancelar?.()}
        />
      )}
    </Pantalla>
  );
}
