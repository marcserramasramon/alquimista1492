"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Franja de dalt de les pantalles de joc. El compte enrere hi és sempre; una pantalla hi pot
 * afegir una peça al costat (el hub hi posa els elements aconseguits).
 */
/** "pendent" mentre encara no se sap si la partida té compte enrere (abans de la primera consulta). */
export type EstatRellotge = "pendent" | "si" | "no";

interface Accions {
  setExtra: (node: ReactNode) => void;
  setRellotge: (fn: (actual: EstatRellotge) => EstatRellotge) => void;
  setAlcada: (px: number) => void;
}

const ExtraCtx = createContext<ReactNode>(null);
const RellotgeCtx = createContext<EstatRellotge>("pendent");
/** Alçada real (px) de la franja de dalt muntada ara (rellotge o substituta). */
const AlcadaCtx = createContext<number>(0);
const AccionsCtx = createContext<Accions | null>(null);

export function FranjaPartidaProvider({ children }: { children: ReactNode }) {
  const [extra, setExtra] = useState<ReactNode>(null);
  const [rellotge, setRellotge] = useState<EstatRellotge>("pendent");
  const [alcada, setAlcada] = useState(0);
  const accions = useMemo(() => ({ setExtra, setRellotge, setAlcada }), []);
  return (
    <AccionsCtx value={accions}>
      <RellotgeCtx value={rellotge}>
        <AlcadaCtx value={alcada}>
          <ExtraCtx value={extra}>{children}</ExtraCtx>
        </AlcadaCtx>
      </RellotgeCtx>
    </AccionsCtx>
  );
}

/**
 * La barra fina enganxada a dalt de tot. Ocupa la mateixa franja que la càmera (safe area) en
 * lloc d'afegir-s'hi a sota: el rellotge va a la cantonada esquerra i la peça de la pantalla a
 * la dreta, i la càmera, si és al mig, queda entre els dos.
 */
export function BarraFranja({
  alerta = false,
  className = "",
  children,
}: {
  alerta?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const accions = useContext(AccionsCtx);
  const ref = useRef<HTMLDivElement | null>(null);

  // Mesura la seva pròpia alçada real (inclou vora i padding) perquè les pantalles
  // que no volen scroll de pàgina (p. ex. el hub) puguin descomptar-la del 100dvh.
  // Cap amunt: és millor descomptar un punt de més que deixar-ne un escletxa de scroll.
  const mesurar = useCallback(() => {
    const el = ref.current;
    if (el && accions) accions.setAlcada(Math.ceil(el.getBoundingClientRect().height));
  }, [accions]);

  // El ResizeObserver cobreix canvis externs (orientació, safe area); com que `children` és
  // nou a cada render, aquest efecte també torna a mesurar quan la barra en rep de nous (p.
  // ex. quan el hub hi afegeix la casella d'elements just després de muntar-se el rellotge).
  useEffect(mesurar);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(mesurar);
    obs.observe(el);
    return () => obs.disconnect();
  }, [mesurar]);

  // Sense barra muntada no hi ha d'haver res a descomptar: altrament una pantalla que no en
  // té (el "pendent" d'entre dues, p. ex.) heretaria l'alçada de l'anterior i deixaria un buit.
  useEffect(() => () => accions?.setAlcada(0), [accions]);

  return (
    <div
      ref={ref}
      className={`sticky top-0 z-30 flex min-h-[max(1.5rem,env(safe-area-inset-top))] items-center gap-3 border-b-2 py-0.5 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] transition-colors ${
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

/**
 * Alçada real (px) de la franja de dalt muntada ara (el rellotge o la substituta d'una
 * pantalla). Permet a una pantalla sense scroll (p. ex. el hub) encabir-se exactament a
 * `calc(100dvh - alçada)` sense haver de conèixer per endavant la mida de la franja.
 */
export function useAlcadaFranja(): number {
  return useContext(AlcadaCtx);
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
