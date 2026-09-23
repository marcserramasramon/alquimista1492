"use client";

import { useEffect, useState } from "react";
import { formatTemps, tempsRestantMs } from "@/lib/partida";

export interface CompteEnrereProps {
  /** Hora final de la partida (ISO, del servidor). */
  acabaAt: string;
  /** Rellotge del servidor menys el del mòbil, en ms. */
  desfasamentMs?: number;
  /** Es crida un sol cop quan arriba a zero (també si ja hi era en muntar-se). */
  onZero?: () => void;
  className?: string;
}

/** Temps que queda fins a `acabaAt`, actualitzat cada segon. */
export function CompteEnrere({ acabaAt, desfasamentMs = 0, onZero, className = "" }: CompteEnrereProps) {
  const [ara, setAra] = useState(() => Date.now());
  const restant = tempsRestantMs(acabaAt, desfasamentMs, ara);

  useEffect(() => {
    const interval = setInterval(() => setAra(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // `onZero` ha de ser estable (useCallback): si canvia, es tornaria a cridar.
  const acabat = restant === 0;
  useEffect(() => {
    if (acabat) onZero?.();
  }, [acabat, onZero]);

  return (
    // El servidor i el client el pinten en segons diferents: la diferència és esperada.
    <time className={`tabular-nums ${className}`} suppressHydrationWarning>
      {formatTemps(restant)}
    </time>
  );
}
