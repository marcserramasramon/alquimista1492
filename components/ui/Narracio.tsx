"use client";

import { useEffect, useRef, useState } from "react";
import type { TextNarratiu } from "@/content/public/textos";
import { carregarVeu, soActiu, sonarVeu, type Reproduccio } from "@/lib/so";

type Estat = "carregant" | "aturada" | "sonant" | "no-disponible";

function jaEscoltada(src: string): boolean {
  try {
    return sessionStorage.getItem(`veu:${src}`) === "1";
  } catch {
    return false;
  }
}

function marcarEscoltada(src: string) {
  try {
    sessionStorage.setItem(`veu:${src}`, "1");
  } catch {
    // Sense sessionStorage (navegació privada): tornarà a sonar sola, no passa res.
  }
}

/**
 * Botó rodó que engega o pausa la veu de Fra Francesc. La primera vegada que s'obre
 * un text a la sessió, la veu sona sola si l'àudio ja està desbloquejat (hi ha hagut
 * un toc); si no, cal tocar el botó. Si el fitxer no existeix, el botó no surt.
 */
export function BotoVeu({ src, retard = 0 }: { src: string; retard?: number }) {
  const [estat, setEstat] = useState<Estat>("carregant");
  const reproduccio = useRef<Reproduccio | null>(null);
  const posicio = useRef(0);
  const muntat = useRef(true);

  async function engegar() {
    setEstat("sonant");
    const r = await sonarVeu(src, posicio.current, () => {
      posicio.current = 0;
      reproduccio.current = null;
      if (muntat.current) setEstat("aturada");
    });
    if (!muntat.current) {
      r?.aturar();
      return;
    }
    if (!r) {
      setEstat("no-disponible");
      return;
    }
    reproduccio.current = r;
  }

  useEffect(() => {
    muntat.current = true;
    let temporitzador: ReturnType<typeof setTimeout> | undefined;
    void carregarVeu(src).then((hiEs) => {
      if (!muntat.current) return;
      if (!hiEs) {
        setEstat("no-disponible");
        return;
      }
      setEstat("aturada");
      if (soActiu() && !jaEscoltada(src)) {
        marcarEscoltada(src);
        temporitzador = setTimeout(() => void engegar(), retard);
      }
    });
    return () => {
      muntat.current = false;
      clearTimeout(temporitzador);
      reproduccio.current?.aturar();
      reproduccio.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- només en muntar o si canvia el fitxer
  }, [src, retard]);

  if (estat === "no-disponible") return null;

  const sonant = estat === "sonant";

  function alternar() {
    marcarEscoltada(src);
    if (sonant) {
      posicio.current = reproduccio.current?.aturar() ?? 0;
      reproduccio.current = null;
      setEstat("aturada");
    } else {
      void engegar();
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={estat === "carregant"}
      aria-pressed={sonant}
      aria-label={sonant ? "Pausar la veu de Fra Francesc" : "Escoltar Fra Francesc"}
      className={`btn btn-secundari btn-rodo shrink-0 shadow-[0_3px_0_var(--ink)] disabled:opacity-40 ${
        sonant ? "animate-pulse" : ""
      }`}
    >
      {sonant ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
          <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

/** Text de la història (missatge, fragment...), amb el botó de la veu a la cantonada si té àudio. */
export function Narracio({
  text,
  etiqueta,
  color,
  retardVeu,
  children,
  className = "",
}: {
  text: TextNarratiu;
  etiqueta?: string;
  color?: string;
  /** Mil·lisegons d'espera abans que la veu soni sola (per no trepitjar un so de la pantalla). */
  retardVeu?: number;
  /** Contingut extra al final (signatura, lema...). */
  children?: React.ReactNode;
  className?: string;
}) {
  const capcalera = (etiqueta || text.titol) && (
    <div className="min-w-0">
      {etiqueta && (
        <p className="etiqueta mb-1" style={color ? { color } : undefined}>
          {etiqueta}
        </p>
      )}
      {text.titol && <h2 className="mb-3 text-3xl font-extrabold">{text.titol}</h2>}
    </div>
  );

  return (
    <section className={`targeta p-5 ${className}`} style={color ? { borderLeft: `10px solid ${color}` } : undefined}>
      {text.audio ? (
        <div className="flex items-start justify-between gap-3">
          {capcalera || <span />}
          <BotoVeu src={text.audio} retard={retardVeu} />
        </div>
      ) : (
        capcalera
      )}
      <div className="flex flex-col gap-3 text-xl leading-snug">
        {text.paragrafs.map((p) =>
          p.startsWith("«") && p.endsWith("»") ? (
            <p key={p} className="text-center font-extrabold">
              {p}
            </p>
          ) : (
            <p key={p}>{p}</p>
          )
        )}
      </div>
      {children}
    </section>
  );
}
