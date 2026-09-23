"use client";

import { useEffect, useRef, useState } from "react";

export interface PasConfirmacio {
  titol: string;
  text: string;
  /** Text del botó que ho fa. */
  boto: string;
}

export interface Confirmacio extends PasConfirmacio {
  /** Acció que esborra o no es pot desfer: el botó va en vermell. */
  perill?: boolean;
  /** Segona pregunta abans de fer-ho, per al que no té marxa enrere. */
  segonPas?: PasConfirmacio;
  /** Fa l'acció. Retorna el missatge d'error, o null si ha anat bé (i el diàleg es tanca). */
  accio: () => Promise<string | null>;
  /** Només per a la galeria: obrir-lo directament al segon pas. */
  pasInicial?: 1 | 2;
}

export interface DialegConfirmacioProps {
  confirmacio: Confirmacio;
  onTancar: () => void;
}

/** Temps que el botó del segon pas està desactivat: un doble toc no el pot confirmar de retruc. */
const ESPERA_SEGON_PAS_MS = 800;

/**
 * Diàleg de confirmació del màster, en lloc del confirm() del navegador. El focus va a
 * "Enrere"; si l'acció falla, l'error surt aquí mateix i es pot tornar a provar.
 */
export function DialegConfirmacio({ confirmacio, onTancar }: DialegConfirmacioProps) {
  const [pas, setPas] = useState<1 | 2>(confirmacio.pasInicial ?? 1);
  const [enviant, setEnviant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esperant, setEsperant] = useState(false);
  const cancelar = useRef<HTMLButtonElement>(null);

  const segon = pas === 2 && confirmacio.segonPas ? confirmacio.segonPas : null;
  const actual: PasConfirmacio = segon ?? confirmacio;

  useEffect(() => {
    cancelar.current?.focus();
  }, [pas]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !enviant) onTancar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [enviant, onTancar]);

  async function confirmar() {
    if (confirmacio.segonPas && pas === 1) {
      setPas(2);
      setEsperant(true);
      setTimeout(() => setEsperant(false), ESPERA_SEGON_PAS_MS);
      return;
    }
    setEnviant(true);
    setError(null);
    try {
      const resultat = await confirmacio.accio();
      if (resultat) setError(resultat);
      else onTancar();
    } finally {
      setEnviant(false);
    }
  }

  const botoConfirmar = (
    <button
      key="confirmar"
      type="button"
      onClick={confirmar}
      disabled={enviant || esperant}
      className={`btn ${confirmacio.perill ? "btn-perill" : "btn-fosc"}`}
    >
      {enviant ? "Un moment..." : actual.boto}
    </button>
  );
  const botoCancelar = (
    <button key="cancelar" ref={cancelar} type="button" onClick={onTancar} disabled={enviant} className="btn btn-secundari">
      Enrere
    </button>
  );

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialeg-confirmacio-titol"
      aria-describedby="dialeg-confirmacio-text"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <div
        key={pas}
        className={`targeta flex max-h-full w-full max-w-md animate-entrar flex-col gap-4 overflow-y-auto bg-[#fffdf7] p-6 ${
          confirmacio.perill ? "border-blood" : ""
        }`}
      >
        <p className={`etiqueta ${confirmacio.perill ? "text-blood" : "text-gold-deep"}`}>
          {segon ? "segona confirmació" : "confirmació"}
        </p>
        <h2 id="dialeg-confirmacio-titol" className="font-display text-3xl font-extrabold leading-tight">
          {actual.titol}
        </h2>
        <p id="dialeg-confirmacio-text" className="text-lg leading-snug">
          {actual.text}
        </p>
        {error && (
          <p role="alert" className="rounded-xl border-[3px] border-blood p-3 text-lg font-extrabold text-blood">
            ✗ {error}
          </p>
        )}
        {/* Al segon pas els botons canvien de lloc: el mateix toc repetit cau a "Enrere". */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          {segon ? [botoConfirmar, botoCancelar] : [botoCancelar, botoConfirmar]}
        </div>
      </div>
    </div>
  );
}
