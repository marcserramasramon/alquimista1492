"use client";

import { useEffect, useState } from "react";
import { CompteEnrere } from "@/components/ui/CompteEnrere";
import { BarraFranja, useExtraFranja, useRegistrarRellotge } from "@/components/player/FranjaPartida";
import { MINUTS_ALERTA, tempsRestantMs } from "@/lib/partida";

export interface IndicadorTempsProps {
  acabaAt: string;
  desfasamentMs?: number;
  onZero?: () => void;
}

/**
 * Barra fina amb el temps que queda, enganxada a dalt de les pantalles de joc de l'equip. Va
 * en el flux (sticky): empeny la pantalla avall en lloc de tapar-ne el títol. En vermell i
 * bategant els últims minuts. A l'altra cantonada hi pot anar la peça que hi posi la pantalla
 * (FranjaPartida).
 */
export function IndicadorTemps({ acabaAt, desfasamentMs = 0, onZero }: IndicadorTempsProps) {
  // Es calcula ja d'entrada: si comencés a false, la barra sortiria daurada un moment.
  const [alerta, setAlerta] = useState(() => tempsRestantMs(acabaAt, desfasamentMs) < MINUTS_ALERTA * 60_000);
  const extra = useExtraFranja();
  useRegistrarRellotge();

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
    <BarraFranja alerta={alerta}>
      <p
        role="timer"
        aria-label="Temps que queda"
        className={`flex items-center gap-1.5 font-display text-lg font-extrabold leading-5 tabular-nums ${
          alerta ? "motion-safe:animate-pulse" : ""
        }`}
      >
        <span aria-hidden className="text-sm">⏳</span>
        <CompteEnrere acabaAt={acabaAt} desfasamentMs={desfasamentMs} onZero={onZero} />
      </p>
      {extra && <div className="ml-auto">{extra}</div>}
    </BarraFranja>
  );
}
