"use client";

import { useState } from "react";

export interface EquipMaster {
  id: string;
  name: string;
  imatge: string;
  /** Un mòbil ha triat aquest equip. */
  agafat: boolean;
  status: "espera" | "joc" | "final";
  /** Fra Francesc l'ha consagrat: el mòbil de l'equip és a la pantalla final. */
  guardians: boolean;
  resoltes: number;
  total: number;
  /** Última posició coneguda; null si l'equip no n'ha enviat cap. */
  ubicacio: { lat: number; lng: number; faMinuts: number } | null;
}

export interface TargetaEquipMasterProps {
  equip: EquipMaster;
  partidaIniciada: boolean;
  /** S'ha esgotat el temps: tots els equips van al Gresol, amb els fragments que tinguin. */
  tempsEsgotat: boolean;
  onConsagrar: (teamId: string, consagrar: boolean) => void;
  onAlliberar: (teamId: string) => void;
  onReiniciar: (teamId: string) => void;
}

const ESTATS: Record<EquipMaster["status"], { text: string; classe: string }> = {
  espera: { text: "En espera", classe: "bg-paper-3 text-ink" },
  joc: { text: "Jugant", classe: "bg-aigua text-white" },
  final: { text: "Al Gresol", classe: "bg-gold text-ink" },
};

const GUARDIANS = { text: "✨ Guardians", classe: "bg-anima text-white" };

const LLIURE = { text: "Lliure", classe: "bg-[#fffdf7] text-ink-soft" };

function textEdat(faMinuts: number) {
  return faMinuts < 1 ? "ara" : `fa ${faMinuts} min`;
}

const BOTO_SECUNDARI = "min-h-12 w-full rounded-xl border-[3px] px-3 text-left text-base font-extrabold";

export function TargetaEquipMaster({
  equip,
  partidaIniciada,
  tempsEsgotat,
  onConsagrar,
  onAlliberar,
  onReiniciar,
}: TargetaEquipMasterProps) {
  const [mesObert, setMesObert] = useState(false);
  const estat = !equip.agafat ? LLIURE : equip.guardians ? GUARDIANS : ESTATS[equip.status];

  const potConsagrar = equip.agafat && partidaIniciada && !equip.guardians;
  // Només es destaca quan toca: amb tots els fragments, al Gresol o amb el temps esgotat.
  const llestPerConsagrar =
    potConsagrar && (equip.resoltes >= equip.total || equip.status === "final" || tempsEsgotat);
  const potReiniciar = equip.agafat || equip.resoltes > 0 || equip.guardians;
  const teMes = (potConsagrar && !llestPerConsagrar) || potReiniciar;

  function fer(accio: () => void) {
    setMesObert(false);
    accio();
  }

  return (
    <li className="targeta p-4">
      <div className="flex items-start justify-between gap-3">
        <img src={equip.imatge} alt="" className={`h-14 w-14 shrink-0 ${equip.agafat ? "" : "opacity-40 grayscale"}`} />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold leading-tight">{equip.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border-2 border-ink px-2.5 text-sm font-extrabold ${estat.classe}`}>
              {estat.text}
            </span>
          </div>
        </div>
        <p className="shrink-0 font-display text-4xl font-extrabold leading-none">
          {equip.resoltes}
          <span className="text-2xl text-ink-soft">/{equip.total}</span>
        </p>
      </div>

      {/* Progrés en segments, un per fita */}
      <div className="mt-3 flex gap-1.5" aria-label={`${equip.resoltes} de ${equip.total} fites`}>
        {Array.from({ length: equip.total }, (_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 rounded-full border-2 border-ink ${i < equip.resoltes ? "bg-gold" : "bg-[#fffdf7]"}`}
          />
        ))}
      </div>

      {llestPerConsagrar && (
        <button type="button" onClick={() => onConsagrar(equip.id, true)} className="btn btn-fosc mt-4">
          ✨ Consagrar Guardians del Secret
        </button>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-base text-ink-soft">📍 {equip.ubicacio ? textEdat(equip.ubicacio.faMinuts) : "sense ubicació"}</p>
        {teMes && (
          <button
            type="button"
            onClick={() => setMesObert((v) => !v)}
            aria-expanded={mesObert}
            className={`min-h-12 rounded-xl border-[3px] border-ink px-4 text-base font-extrabold ${
              mesObert ? "bg-ink text-paper" : "bg-[#fffdf7] text-ink"
            }`}
          >
            {mesObert ? "✕ Tancar" : "⋯ Més accions"}
          </button>
        )}
      </div>

      {mesObert && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border-2 border-dashed border-ink/40 p-3">
          {potConsagrar && !llestPerConsagrar && (
            <button
              type="button"
              onClick={() => fer(() => onConsagrar(equip.id, true))}
              className={`${BOTO_SECUNDARI} border-ink bg-[#fffdf7] active:bg-ink active:text-paper`}
            >
              ✨ Consagrar Guardians del Secret
            </button>
          )}
          {equip.guardians && (
            <button
              type="button"
              onClick={() => fer(() => onConsagrar(equip.id, false))}
              className={`${BOTO_SECUNDARI} border-ink bg-[#fffdf7] active:bg-ink active:text-paper`}
            >
              ↩ Desfer la consagració
            </button>
          )}
          {equip.agafat && (
            <button
              type="button"
              onClick={() => fer(() => onAlliberar(equip.id))}
              className={`${BOTO_SECUNDARI} border-ink bg-[#fffdf7] active:bg-ink active:text-paper`}
            >
              🔓 Alliberar el mòbil
            </button>
          )}
          {potReiniciar && (
            <button
              type="button"
              onClick={() => fer(() => onReiniciar(equip.id))}
              className={`${BOTO_SECUNDARI} border-blood bg-[#fffdf7] text-blood active:bg-blood active:text-white`}
            >
              ↺ Reiniciar l&apos;equip
            </button>
          )}
        </div>
      )}
    </li>
  );
}
