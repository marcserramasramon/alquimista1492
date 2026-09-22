"use client";

import { VistaJocResposta, type VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";
import { AvisError } from "@/components/ui/Pantalla";
import { Pentagrama } from "@/components/ui/Pentagrama";
import { Narracio } from "@/components/ui/Narracio";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { ARRIBADES, CORRECTE_PER_ELEMENT, FRAGMENTS, RESPOSTA_CORRECTA } from "@/content/public/textos";

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
  onTornar: () => void;
}

const ROMANS = ["I", "II", "III", "IV", "V", "VI"];

export function VistaEstacio({ estacio, error, resolta = false, onTornar, ...joc }: VistaEstacioProps) {
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
      <Celebracio
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
        <p className="etiqueta" style={{ color: element ? color : undefined }}>
          fita {estacio.ordre ? ROMANS[estacio.ordre - 1] : ""}
          {element && ` · ${element.nom}`}
        </p>
        <h1 className="mb-5 text-5xl font-extrabold">{estacio.nom}</h1>

        {resolta ? (
          estacio.element && (
            <Narracio
              text={FRAGMENTS[estacio.element]}
              etiqueta="✓ fragment trobat"
              color={color}
              className="animate-entrar"
            />
          )
        ) : (
          <>
            {estacio.element && (
              <Narracio text={ARRIBADES[estacio.element]} etiqueta="fra francesc" color={color} className="mb-6" />
            )}

            <section className="targeta mb-8 p-5">
              <p className="etiqueta mb-1">la prova</p>
              <p className="text-xl leading-snug">{estacio.entrada}</p>
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

/** Pantalla d'encert: el segell de l'element cau sobre la pantalla. Després es mostra el fragment. */
function Celebracio({
  nomElement,
  frase,
  icona,
  color,
  missatge,
}: {
  nomElement?: string;
  frase?: string;
  icona?: string;
  color: string;
  missatge: string | null;
}) {
  return (
    <div
      role="status"
      className="fixed inset-0 z-50 flex animate-entrar overflow-hidden flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: `radial-gradient(circle at 50% 42%, #fffdf7 0%, #fbf4e4 35%, ${color} 140%)` }}
    >
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-10 animate-girar rounded-full opacity-50 [animation-duration:12s]"
          style={{
            background: `repeating-conic-gradient(${color} 0deg 8deg, transparent 8deg 24deg)`,
            maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
          }}
        />
        <div
          className="relative flex h-44 w-44 animate-segellar items-center justify-center rounded-full border-[4px] border-ink bg-[#fffdf7] shadow-[0_8px_0_var(--ink)]"
          style={{ outline: `10px solid ${color}`, outlineOffset: -20 }}
        >
          {icona ? <img src={icona} alt="" className="h-24 w-24 object-contain" /> : <span className="text-7xl">✦</span>}
        </div>
      </div>
      <div className="animate-entrar [animation-delay:350ms]">
        <p className="font-display text-6xl font-extrabold leading-none">{missatge ?? RESPOSTA_CORRECTA}</p>
        {nomElement && (
          <p className="etiqueta mt-3 text-lg" style={{ color }}>
            ✦ {nomElement} ✦
          </p>
        )}
        {frase && <p className="mt-4 text-2xl font-bold">{frase}</p>}
      </div>
      <p className="etiqueta animate-pulse">obrint el fragment...</p>
    </div>
  );
}
