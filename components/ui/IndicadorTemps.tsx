"use client";

import { useEffect, useState } from "react";
import { CompteEnrere } from "@/components/ui/CompteEnrere";
import { MINUTS_ALERTA, tempsRestantMs } from "@/lib/partida";

export interface IndicadorTempsProps {
  acabaAt: string;
  desfasamentMs?: number;
  onZero?: () => void;
}

/**
 * Píndola amb el temps que queda, a dalt de les pantalles de joc de l'equip. Va en el flux
 * (sticky): empeny la pantalla avall en lloc de tapar-ne el títol. En vermell i bategant
 * els últims minuts.
 */
export function IndicadorTemps({ acabaAt, desfasamentMs = 0, onZero }: IndicadorTempsProps) {
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    const comprovar = () => setAlerta(tempsRestantMs(acabaAt, desfasamentMs) < MINUTS_ALERTA * 60_000);
    const inicial = setTimeout(comprovar, 0);
    const interval = setInterval(comprovar, 5000);
    return () => {
      clearTimeout(inicial);
      clearInterval(interval);
    };
  }, [acabaAt, desfasamentMs]);

  return (
    <div className="sticky top-0 z-30 flex justify-center pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] [background:linear-gradient(to_bottom,var(--paper)_70%,transparent)]">
      <p
        role="timer"
        aria-label="Temps que queda"
        className={`flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-0.5 font-display text-2xl font-extrabold shadow-[0_3px_0_var(--ink)] ${
          alerta ? "bg-blood text-white motion-safe:animate-bategar" : "bg-ink text-gold"
        }`}
      >
        <span aria-hidden>⏳</span>
        <CompteEnrere acabaAt={acabaAt} desfasamentMs={desfasamentMs} onZero={onZero} />
      </p>
    </div>
  );
}
