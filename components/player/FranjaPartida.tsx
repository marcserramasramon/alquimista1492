"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Franja de dalt de les pantalles de joc. El compte enrere hi és sempre; una pantalla hi pot
 * afegir una peça al costat (el hub hi posa els elements aconseguits).
 */
interface Accions {
  setExtra: (node: ReactNode) => void;
  setHiHaRellotge: (hiHa: boolean) => void;
}

const ExtraCtx = createContext<ReactNode>(null);
const RellotgeCtx = createContext(false);
const AccionsCtx = createContext<Accions | null>(null);

export function FranjaPartidaProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<ReactNode>(null);
  const [hiHaRellotge, setHiHaRellotge] = useState(false);
  const accions = useMemo(() => ({ setExtra, setHiHaRellotge }), []);
  return (
    <AccionsCtx value={accions}>
      <RellotgeCtx value={hiHaRellotge}>
        <ExtraCtx value={extra}>{children}</ExtraCtx>
      </RellotgeCtx>
    </AccionsCtx>
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
    accions?.setHiHaRellotge(true);
    return () => accions?.setHiHaRellotge(false);
  }, [accions]);
}

/**
 * Posa `node` al costat del rellotge mentre la pantalla és muntada. Retorna si hi ha rellotge:
 * si no n'hi ha, la pantalla l'ha de mostrar ella mateixa. `claus` decideix quan cal refrescar-lo.
 */
export function useMostrarAFranja(node: ReactNode, claus: unknown[]): boolean {
  const accions = useContext(AccionsCtx);
  const hiHaRellotge = useContext(RellotgeCtx);
  useEffect(() => {
    accions?.setExtra(node);
    return () => accions?.setExtra(null);
    // El node és nou a cada render: només es refresca quan canvien les claus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accions, ...claus]);
  return hiHaRellotge;
}
