"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Franja de dalt de les pantalles de joc. El compte enrere hi és sempre; una pantalla hi pot
 * afegir una peça al costat (el hub hi posa els elements aconseguits).
 */
/** "pendent" mentre encara no se sap si la partida té compte enrere (abans de la primera consulta). */
export type EstatRellotge = "pendent" | "si" | "no";

interface Accions {
  setExtra: (node: ReactNode) => void;
  setRellotge: (fn: (actual: EstatRellotge) => EstatRellotge) => void;
}

const ExtraCtx = createContext<ReactNode>(null);
const RellotgeCtx = createContext<EstatRellotge>("pendent");
const AccionsCtx = createContext<Accions | null>(null);

export function FranjaPartidaProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<ReactNode>(null);
  const [rellotge, setRellotge] = useState<EstatRellotge>("pendent");
  const accions = useMemo(() => ({ setExtra, setRellotge }), []);
  return (
    <AccionsCtx value={accions}>
      <RellotgeCtx value={rellotge}>
        <ExtraCtx value={extra}>{children}</ExtraCtx>
      </RellotgeCtx>
    </AccionsCtx>
  );
}

/** La barra fina enganxada a dalt de tot on van el rellotge i la peça de la pantalla. */
export function BarraFranja({
  alerta = false,
  className = "",
  children,
}: {
  alerta?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`sticky top-0 z-30 flex items-center justify-center gap-3 border-b-2 px-4 pb-0.5 pt-[max(0.125rem,env(safe-area-inset-top))] transition-colors ${
        alerta ? "border-ink bg-blood text-white" : "border-ink bg-gold text-ink"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** El que la pantalla actual vol al costat del rellotge. */
export function useExtraFranja(): ReactNode {
  return useContext(ExtraCtx);
}

/** El rellotge avisa que és a la franja mentre està muntat. */
export function useRegistrarRellotge() {
  const accions = useContext(AccionsCtx);
  useEffect(() => {
    accions?.setRellotge(() => "si");
    return () => accions?.setRellotge(() => "no");
  }, [accions]);
}

/**
 * Ja se sap que no hi haurà rellotge (partida sense hora final, consulta fallida o fora del
 * joc). Només canvia "pendent": si el rellotge ja s'ha muntat, mana ell.
 */
export function useMarcarSenseRellotge(): () => void {
  const accions = useContext(AccionsCtx);
  return useCallback(() => accions?.setRellotge((actual) => (actual === "pendent" ? "no" : actual)), [accions]);
}

/**
 * Posa `node` al costat del rellotge mentre la pantalla és muntada. Retorna l'estat del
 * rellotge: amb "no", la pantalla l'ha de mostrar ella mateixa; amb "pendent", encara no res
 * (així no surt una barra que de seguida en substitueix una altra). `claus` decideix quan cal refrescar-lo.
 */
export function useMostrarAFranja(node: ReactNode, claus: unknown[]): EstatRellotge {
  const accions = useContext(AccionsCtx);
  const rellotge = useContext(RellotgeCtx);
  useEffect(() => {
    accions?.setExtra(node);
    return () => accions?.setExtra(null);
    // El node és nou a cada render: només es refresca quan canvien les claus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accions, ...claus]);
  return rellotge;
}
