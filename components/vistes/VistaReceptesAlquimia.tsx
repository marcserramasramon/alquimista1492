"use client";

import { BANDA_RUNES_PX, MarcRunes } from "@/components/ui/MarcRunes";
import { estilPapir, FiltresPapir } from "@/components/ui/papir";
import { TITOL_RECEPTES } from "@/components/ui/titolReceptes";
import type { ElementAlquimia, ReceptaAlquimia } from "@/content/public/alquimia";

export interface VistaReceptesAlquimiaProps {
  /** null mentre es carreguen. */
  receptes: ReceptaAlquimia[] | null;
  error?: boolean;
  onTancar: () => void;
}

/** Llibre de receptes del joc d'alquímia (/gresol), amb el mateix marc de runes que la taula. */
export function VistaReceptesAlquimia({ receptes, error = false, onTancar }: VistaReceptesAlquimiaProps) {
  return (
    <div className="fixed inset-0 z-40 bg-paper">
      <FiltresPapir />
      <main className="mx-auto flex h-dvh w-full max-w-md flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
          <div>
            <h1 className="font-display text-4xl font-extrabold">Receptes</h1>
            <p className="etiqueta">{receptes ? `${receptes.length} receptes` : "obrint el llibre…"}</p>
          </div>
          <button
            type="button"
            onClick={onTancar}
            className="btn btn-secundari btn-rodo shrink-0"
            aria-label="Tanca les receptes"
          >
            ✕
          </button>
        </header>

        <div
          className="relative mx-4 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex-1 overflow-hidden rounded-3xl border-[3px] border-ink bg-paper-2 shadow-[inset_0_4px_0_rgb(27_21_17/0.08)]"
          style={{
            backgroundImage:
              "var(--gra), radial-gradient(ellipse at center, #f8eed6 0%, var(--paper-2) 60%, var(--paper-3) 100%)",
          }}
        >
          <MarcRunes />
          <div
            className="pointer-events-none absolute rounded-2xl border-2 border-gold-deep/40"
            style={{ inset: BANDA_RUNES_PX }}
          />
          <div className="absolute overflow-y-auto overscroll-contain px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ inset: BANDA_RUNES_PX + 3 }}>
            {error ? (
              <p className="py-10 text-center font-bold text-blood">No s&apos;ha pogut obrir el llibre. Torna-ho a provar.</p>
            ) : !receptes ? (
              <p className="py-10 text-center font-bold text-ink-soft">Obrint el llibre…</p>
            ) : (
              <>
                <svg
                  role="img"
                  aria-label={TITOL_RECEPTES.text}
                  viewBox={TITOL_RECEPTES.viewBox}
                  className="mx-auto mt-1 mb-4 block h-auto w-[88%] fill-ink"
                >
                  <path d={TITOL_RECEPTES.d} />
                </svg>
                <ul>
                  {receptes.map((r) => (
                    <li
                      key={`${r.a.nom}+${r.b.nom}`}
                      className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start border-b border-gold-deep/25 py-2 last:border-b-0"
                    >
                      <Fitxa element={r.a} />
                      <Signe>+</Signe>
                      <Fitxa element={r.b} />
                      <Signe>=</Signe>
                      <Fitxa element={r.resultat} destacat />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Fitxa({ element, destacat = false }: { element: ElementAlquimia; destacat?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="fitxa-papir w-11 text-[1.5rem]" style={estilPapir(element.nom)}>
        <span>{element.emoji}</span>
      </span>
      <span
        className={`text-center font-sc leading-none font-bold ${destacat ? "text-[0.8rem] text-ink" : "text-[0.7rem] text-ink-soft"}`}
      >
        {element.nom}
      </span>
    </div>
  );
}

function Signe({ children }: { children: React.ReactNode }) {
  return <span className="pt-2 font-display text-2xl leading-none text-gold-deep">{children}</span>;
}
