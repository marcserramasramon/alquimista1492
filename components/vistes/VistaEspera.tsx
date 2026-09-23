"use client";

import { Pantalla } from "@/components/ui/Pantalla";
import type { Equip } from "@/content/public/equips";

export interface VistaEsperaProps {
  equip: Equip;
}

/** Sala d'espera: l'equip ja té emblema i espera que el màster iniciï la partida. */
export function VistaEspera({ equip }: VistaEsperaProps) {
  return (
    <Pantalla centrat>
      <div className="flex animate-entrar flex-col items-center text-center">
        <div className="relative mb-8 flex w-64 max-w-full items-center justify-center" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/30 [animation-duration:2.4s]" />
          <img src={equip.imatge} alt="" className="relative aspect-square w-full animate-bategar" />
        </div>

        <p className="etiqueta">el vostre equip</p>
        <h1 className="mb-8 text-4xl font-bold leading-tight">{equip.nom}</h1>

        {/* TEXT PROVISIONAL */}
        <p className="font-display text-3xl font-extrabold">Tot a punt per a la partida!</p>
        {/* TEXT PROVISIONAL */}
        <p className="mt-2 text-xl text-ink-soft">Espereu la resta d&apos;equips.</p>

        <p className="etiqueta mt-10 flex items-center gap-2" role="status">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold-deep" />
          esperant l&apos;inici
        </p>
      </div>
    </Pantalla>
  );
}
