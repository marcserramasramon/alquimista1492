"use client";

import type { IntroduccioAr } from "@/content/public/extres";

/**
 * Pantalla d'entrada d'un extra de realitat augmentada, abans de demanar càmera i sensors: explica
 * com funciona, què demanarà el mòbil i dona dos consells. El text és a content/public/extres.ts.
 * Els botons queden sempre a baix de tot i el text es desplaça per sobre.
 */
export function IntroduccioExtraAr({
  intro,
  onComençar,
  onTornar,
}: {
  intro: IntroduccioAr;
  onComençar: () => void;
  onTornar: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-black/95 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          <div className="text-center">
            <p className="font-display text-5xl font-extrabold text-paper">{intro.titol}</p>
            <p className="mt-2 text-lg leading-snug text-paper-3">{intro.entrada}</p>
          </div>

          <ol className="flex flex-col gap-3">
            {intro.passos.map((pas, i) => (
              <li key={pas.text} className="flex items-start gap-3 rounded-2xl bg-paper/10 px-3.5 py-3">
                <span aria-hidden className="text-3xl leading-none">
                  {pas.icona}
                </span>
                <p className="text-lg leading-snug text-paper">
                  <span className="sr-only">Pas {i + 1}: </span>
                  {pas.text}
                </p>
              </li>
            ))}
          </ol>

          <section aria-labelledby="extra-ar-permisos" className="rounded-2xl border-2 border-paper-3/40 px-3.5 py-3">
            <h2 id="extra-ar-permisos" className="text-base font-extrabold text-gold">
              {intro.permisos.titol}
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {intro.permisos.items.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5 text-base leading-snug text-paper-3">
                  <span aria-hidden className="text-xl leading-snug">
                    {item.icona}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-sm leading-snug text-paper-3/80">{intro.permisos.nota}</p>
          </section>

          <ul className="flex flex-col gap-1.5 text-base leading-snug text-paper-3">
            {intro.consells.map((consell) => (
              <li key={consell} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{consell}</span>
              </li>
            ))}
          </ul>

          <p className="text-center text-sm text-paper-3/80">{intro.nota}</p>
        </div>
      </div>

      <div className="shrink-0 border-t-2 border-paper-3/20 bg-black px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2.5">
          <button type="button" onClick={onComençar} className="btn btn-primari w-full">
            {intro.boto}
          </button>
          <button type="button" onClick={onTornar} className="btn btn-fosc w-full">
            Tornar al joc
          </button>
        </div>
      </div>
    </div>
  );
}
