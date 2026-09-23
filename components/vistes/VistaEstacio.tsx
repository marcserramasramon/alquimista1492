"use client";

import { useState } from "react";
import { VistaJocResposta, type VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";
import { AvisError } from "@/components/ui/Pantalla";
import { Pentagrama } from "@/components/ui/Pentagrama";
import { Narracio } from "@/components/ui/Narracio";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { ARRIBADES, CORRECTE_PER_ELEMENT, FRAGMENTS } from "@/content/public/textos";
import { CelebracioFragment } from "@/components/vistes/CelebracioFragment";

/** Dades públiques d'una estació tal com les retorna /api/joc/[estacioId]. */
export interface EstacioPublica {
  id: string;
  nom: string;
  entrada: string;
  situacio?: string;
  ordre?: number;
  element?: Element;
  imatge?: string;
  disponible: boolean;
}

export interface VistaEstacioProps extends VistaJocRespostaProps {
  /** null mentre es carrega. */
  estacio: EstacioPublica | null;
  /** Si hi ha error (p.ex. "Estació no disponible"), es mostra en lloc del joc. */
  error?: string | null;
  /** Ja resolta: es mostra el fragment en lloc de la prova. */
  resolta?: boolean;
  /**
   * Pas amb què s'obre la fita: primer la narració de Fra Francesc (amb la veu) i, amb el botó
   * de sota, la prova. La galeria el fixa per ensenyar cada pas.
   */
  pasInicial?: "narracio" | "prova";
  onTornar: () => void;
}

export function VistaEstacio({
  estacio,
  error,
  resolta = false,
  pasInicial = "narracio",
  onTornar,
  ...joc
}: VistaEstacioProps) {
  const [pas, setPas] = useState(pasInicial);

  function anarAProva() {
    setPas("prova");
    window.scrollTo({ top: 0 });
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-8 text-center">
        <p className="text-6xl" aria-hidden>
          🔒
        </p>
        <AvisError>{error}</AvisError>
        <button onClick={onTornar} className="btn btn-secundari">
          ← Tornar al mapa
        </button>
      </main>
    );
  }

  if (!estacio) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4" aria-busy="true">
        <Pentagrama girar vius className="w-40 opacity-80" />
        <p className="etiqueta text-base">Carregant...</p>
      </main>
    );
  }

  const element = estacio.element ? ELEMENTS[estacio.element] : null;
  const color = element?.color ?? "var(--gold)";

  // La celebració ocupa tota la pantalla: sense la fita a sota, no hi ha res per fer scroll.
  if (joc.correcte && !resolta) {
    return (
      <CelebracioFragment
        nomElement={element?.nom}
        frase={estacio.element ? CORRECTE_PER_ELEMENT[estacio.element] : undefined}
        icona={element?.icona}
        color={color}
        missatge={joc.missatge}
      />
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md pb-[max(2rem,env(safe-area-inset-bottom))]">
      {/* Capçalera: foto de la fita (o el color de l'element) i segell al damunt */}
      <div
        className="relative h-64 overflow-hidden rounded-b-[2.5rem] border-b-[3px] border-ink"
        style={{ background: `radial-gradient(circle at 50% 40%, #ffffff55, transparent 65%), ${color}` }}
      >
        {estacio.imatge ? (
          <img src={estacio.imatge} alt={estacio.nom} className="h-full w-full object-cover" />
        ) : (
          element && (
            <img
              src={element.icona}
              alt=""
              className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 object-contain opacity-30 brightness-0 invert"
            />
          )
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/60 to-transparent" />
        <button
          onClick={onTornar}
          aria-label="Tornar al mapa"
          className="btn btn-secundari btn-rodo absolute left-4 top-[max(1rem,env(safe-area-inset-top))]"
        >
          ←
        </button>
      </div>

      <div className="relative px-5">
        {element && (
          <div
            className="-mt-12 mb-3 flex h-24 w-24 animate-segellar items-center justify-center rounded-full border-[3px] border-ink bg-[#fffdf7] shadow-[0_5px_0_var(--ink)]"
            style={{ outline: `6px solid ${color}`, outlineOffset: -12 }}
          >
            <img src={element.icona} alt={element.nom} className="h-14 w-14 object-contain" />
          </div>
        )}
        {element && (
          <p className="etiqueta" style={{ color }}>
            {element.nom}
          </p>
        )}
        <h1 className={`text-5xl font-extrabold ${estacio.situacio ? "mb-1" : "mb-5"}`}>{estacio.nom}</h1>
        {/* On és la fita: informació secundària, ja hi són. */}
        {estacio.situacio && (
          <p className="mb-5 flex gap-1.5 text-base text-ink-soft">
            <span aria-hidden>📍</span>
            <span>
              <span className="sr-only">On és: </span>
              {estacio.situacio}
            </span>
          </p>
        )}

        {resolta ? (
          estacio.element && (
            <Narracio
              text={FRAGMENTS[estacio.element]}
              etiqueta="✓ fragment trobat"
              color={color}
              className="animate-entrar"
            />
          )
        ) : pas === "narracio" && estacio.element ? (
          <>
            {/* Pas 1: la veu de Fra Francesc. El botó de sota dona pas a la prova. */}
            <Narracio
              text={ARRIBADES[estacio.element]}
              etiqueta="fra francesc"
              color={color}
              className="mb-6 animate-entrar"
            />
            <button onClick={anarAProva} className="btn btn-primari">
              A la prova →
            </button>
          </>
        ) : (
          <>
            {/* Pas 2: què han de fer, el primer i el més visible de la pantalla. */}
            <section
              className="targeta mb-6 animate-entrar p-5"
              style={{ borderLeftWidth: 10, borderLeftColor: color }}
            >
              <p className="etiqueta mb-1" style={{ color: element ? color : undefined }}>
                la prova
              </p>
              <p className="text-2xl font-extrabold leading-snug">{estacio.entrada}</p>
            </section>

            <VistaJocResposta {...joc} />
          </>
        )}

        <button onClick={onTornar} className="btn btn-secundari mt-8">
          ← Tornar al mapa
        </button>
      </div>

    </main>
  );
}
