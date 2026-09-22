"use client";

import { useState } from "react";
import { AvisError } from "@/components/ui/Pantalla";

/** Tres nivells: cada botó només s'activa si ja s'ha demanat l'anterior. */
export const NOMS_PISTES = ["Pista 1", "Pista 2", "Resposta"] as const;

export interface VistaJocRespostaProps {
  resposta: string;
  missatge: string | null;
  correcte: boolean;
  enviant: boolean;
  /** Pistes ja desbloquejades, en ordre (la tercera és la resposta). */
  pistes: string[];
  carregantPista: boolean;
  onRespostaChange: (valor: string) => void;
  onSubmit: () => void;
  onDemanarPista: () => void;
}

const INDEX_RESPOSTA = NOMS_PISTES.length - 1;

/** Joc d'estació de resposta escrita (presentacional). */
export function VistaJocResposta({
  resposta,
  missatge,
  correcte,
  enviant,
  pistes,
  carregantPista,
  onRespostaChange,
  onSubmit,
  onDemanarPista,
}: VistaJocRespostaProps) {
  // Demanar la Resposta demana una confirmació: és fàcil tocar-la sense voler.
  const [confirmantResposta, setConfirmantResposta] = useState(false);
  const incorrecte = Boolean(missatge) && !correcte;

  function demanar(index: number) {
    if (index === INDEX_RESPOSTA && !confirmantResposta) {
      setConfirmantResposta(true);
      return;
    }
    setConfirmantResposta(false);
    onDemanarPista();
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <label htmlFor="resposta" className="etiqueta text-base">
          la vostra resposta
        </label>
        <div className={incorrecte ? "animate-tremolar" : ""}>
          <input
            id="resposta"
            type="text"
            value={resposta}
            onChange={(e) => onRespostaChange(e.target.value)}
            placeholder="Escriviu-la aquí..."
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className={`camp text-center uppercase tracking-wider ${incorrecte ? "border-blood" : ""} ${
              correcte ? "border-ok bg-ok/10" : ""
            }`}
          />
        </div>

        {missatge && !correcte && <AvisError>✗ {missatge}</AvisError>}
        {missatge && correcte && (
          <p role="status" className="animate-entrar rounded-2xl border-[3px] border-ok bg-ok px-4 py-3 text-center text-lg font-extrabold text-white">
            ✓ {missatge}
          </p>
        )}

        <button type="submit" disabled={enviant || !resposta.trim() || correcte} className="btn btn-primari">
          {enviant ? "Comprovant..." : "Comprovar"}
        </button>
      </form>

      <section aria-labelledby="titol-pistes" className="rounded-3xl border-[3px] border-dashed border-ink/35 p-4">
        <h2 id="titol-pistes" className="text-3xl font-bold">
          Necessiteu ajuda?
        </h2>
        <p className="mb-4 text-base text-ink-soft">Les pistes s&apos;obren d&apos;una en una.</p>

        {/* Escala de tres segells: fet → següent → tancat */}
        <ol className="relative grid grid-cols-3">
          <span aria-hidden className="absolute left-[16.6%] right-[16.6%] top-7 h-1 rounded bg-ink/15" />
          <span
            aria-hidden
            className="absolute left-[16.6%] top-7 h-1 rounded bg-gold transition-all duration-500"
            style={{ width: `${(Math.min(pistes.length, INDEX_RESPOSTA) / INDEX_RESPOSTA) * 66.8}%` }}
          />
          {NOMS_PISTES.map((nom, index) => {
            const demanada = index < pistes.length;
            const seguent = index === pistes.length;
            const esResposta = index === INDEX_RESPOSTA;
            return (
              <li key={nom} className="relative flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => demanar(index)}
                  disabled={!seguent || carregantPista}
                  aria-pressed={demanada}
                  aria-label={nom}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] font-display text-2xl font-extrabold transition ${
                    demanada
                      ? esResposta
                        ? "border-ink bg-blood text-white"
                        : "border-ink bg-gold text-ink"
                      : seguent
                        ? `animate-bategar border-ink bg-[#fffdf7] text-ink shadow-[0_4px_0_var(--ink)] active:translate-y-1 active:shadow-none ${
                            confirmantResposta && esResposta ? "ring-4 ring-blood" : ""
                          }`
                        : "border-dashed border-ink/35 bg-paper-2 text-ink/35"
                  }`}
                >
                  {seguent && carregantPista ? "…" : demanada ? "✓" : esResposta ? "!" : index + 1}
                </button>
                <span className={`text-sm font-extrabold ${seguent || demanada ? "text-ink" : "text-ink/40"}`}>
                  {nom}
                </span>
              </li>
            );
          })}
        </ol>

        {confirmantResposta && pistes.length === INDEX_RESPOSTA && (
          <div role="alertdialog" className="mt-4 animate-entrar rounded-2xl border-[3px] border-blood bg-blood/10 p-4">
            <p className="mb-3 text-center font-bold text-blood">Segur que voleu veure la resposta?</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmantResposta(false)} className="btn btn-secundari">
                No
              </button>
              <button type="button" onClick={() => demanar(INDEX_RESPOSTA)} disabled={carregantPista} className="btn btn-perill">
                Sí, mostra-la
              </button>
            </div>
          </div>
        )}

        {pistes.length > 0 && (
          <ol className="mt-5 flex flex-col gap-3">
            {pistes.map((text, index) => {
              const esResposta = index === INDEX_RESPOSTA;
              return (
                <li
                  key={index}
                  className={`animate-entrar rounded-2xl border-[3px] border-ink p-4 ${
                    esResposta ? "bg-blood text-white" : "bg-[#fffdf7]"
                  }`}
                  style={{ borderLeftWidth: 10, borderLeftColor: esResposta ? "var(--ink)" : "var(--gold)" }}
                >
                  <p className={`etiqueta mb-1 ${esResposta ? "text-white/85" : ""}`}>
                    {NOMS_PISTES[index] ?? `Pista ${index + 1}`}
                  </p>
                  <p className={esResposta ? "text-2xl font-extrabold" : "text-lg"}>{text}</p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
