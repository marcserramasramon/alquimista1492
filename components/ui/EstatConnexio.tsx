"use client";

import { useEffect, useState } from "react";

export interface DadesConnexio {
  /** Quan va arribar l'última resposta bona del servidor (Date.now()); null si encara cap. */
  ultimaLecturaAt: number | null;
  /** Lectures fallides seguides des de l'última bona. */
  errorsSeguits: number;
}

/** A partir d'aquí les dades ja no es consideren al dia. */
const LLINDAR_LENT_S = 15;
/** A partir d'aquí (o d'ERRORS_CAIGUT errors seguits) es considera que no hi ha connexió. */
const LLINDAR_CAIGUT_S = 60;
const ERRORS_CAIGUT = 3;

export interface EstatConnexio {
  nivell: "carregant" | "bo" | "lent" | "caigut";
  /** Segons des de l'última lectura bona; null si encara cap. */
  segons: number | null;
}

function textEdat(segons: number) {
  return segons < 60 ? `fa ${segons} s` : `fa ${Math.floor(segons / 60)} min`;
}

/** Com estan de fresques les dades del panell, recalculat cada segon. */
export function useEstatConnexio({ ultimaLecturaAt, errorsSeguits }: DadesConnexio): EstatConnexio {
  const [ara, setAra] = useState(() => Date.now());
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setAra(Date.now()), 1000);
    const actualitzar = () => setOnline(navigator.onLine);
    const inicial = setTimeout(actualitzar, 0);
    window.addEventListener("online", actualitzar);
    window.addEventListener("offline", actualitzar);
    return () => {
      clearInterval(interval);
      clearTimeout(inicial);
      window.removeEventListener("online", actualitzar);
      window.removeEventListener("offline", actualitzar);
    };
  }, []);

  const segons = ultimaLecturaAt === null ? null : Math.max(0, Math.floor((ara - ultimaLecturaAt) / 1000));
  let nivell: EstatConnexio["nivell"];
  if (!online || errorsSeguits >= ERRORS_CAIGUT || (segons !== null && segons >= LLINDAR_CAIGUT_S)) nivell = "caigut";
  else if (segons === null) nivell = "carregant";
  else if (segons >= LLINDAR_LENT_S) nivell = "lent";
  else nivell = "bo";

  return { nivell, segons };
}

/** Píndola petita per a la capçalera del màster: al dia, fa X s o sense connexió. */
export function PindolaConnexio({ nivell, segons }: EstatConnexio) {
  if (nivell === "carregant") return null;
  const pindola = {
    bo: { text: "al dia", classe: "bg-ok text-white" },
    lent: { text: textEdat(segons ?? 0), classe: "bg-gold text-ink" },
    caigut: { text: "sense connexió", classe: "bg-blood text-white" },
  }[nivell];
  return (
    <p className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink px-2.5 text-sm font-extrabold ${pindola.classe}`}
    >
      <span aria-hidden>●</span>
      {pindola.text}
    </p>
  );
}

/** Franja vermella a tota l'amplada quan no arriben dades. */
export function FranjaSenseConnexio({ nivell, segons }: EstatConnexio) {
  if (nivell !== "caigut") return null;
  return (
    <div role="alert" className="mt-3 rounded-xl border-[3px] border-ink bg-blood px-3 py-2 text-white">
      <p className="text-lg font-extrabold leading-tight">⚠ Sense connexió: les dades poden ser velles.</p>
      <p className="text-base">
        {segons === null ? "Encara no s'ha pogut llegir res." : `Última actualització ${textEdat(segons)}.`}
      </p>
    </div>
  );
}
