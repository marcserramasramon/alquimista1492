"use client";

import { useState } from "react";
import Link from "next/link";
import { Cronometre } from "@/components/ui/Cronometre";
import { CompteEnrere } from "@/components/ui/CompteEnrere";
import {
  AJUSTOS_MIN,
  DURADA_MAXIMA_MIN,
  DURADA_MINIMA_MIN,
  DURADA_PER_DEFECTE_MIN,
  DURADES_RAPIDES_MIN,
  MINUTS_ALERTA,
  tempsRestantMs,
} from "@/lib/partida";

export interface PanellPartidaMasterProps {
  /** Inici global de la partida (ISO); null si encara no ha començat. */
  partidaIniciadaAt: string | null;
  partidaAcabaAt: string | null;
  desfasamentMs: number;
  canviant: boolean;
  equipsAPunt: number;
  onIniciar: (duradaMinuts: number) => void;
  onAjustar: (minuts: number) => void;
  onAcabar: () => void;
  onReiniciar: () => void;
}

/** Pestanya "Partida" del màster: iniciar, ajustar el temps i, lluny de tot, reiniciar. */
export function PanellPartidaMaster({
  partidaIniciadaAt,
  partidaAcabaAt,
  desfasamentMs,
  canviant,
  equipsAPunt,
  onIniciar,
  onAjustar,
  onAcabar,
  onReiniciar,
}: PanellPartidaMasterProps) {
  return (
    <div className="flex flex-col gap-6">
      {partidaIniciadaAt ? (
        <PartidaEnCurs
          iniciadaAt={partidaIniciadaAt}
          acabaAt={partidaAcabaAt}
          desfasamentMs={desfasamentMs}
          canviant={canviant}
          onAjustar={onAjustar}
          onAcabar={onAcabar}
          onReiniciar={onReiniciar}
        />
      ) : (
        <IniciPartida equipsAPunt={equipsAPunt} canviant={canviant} onIniciar={onIniciar} />
      )}

      <Link href="/master/codis" className="btn btn-secundari text-lg">
        🔳 Codis dels cartells
      </Link>
    </div>
  );
}

function IniciPartida({
  equipsAPunt,
  canviant,
  onIniciar,
}: {
  equipsAPunt: number;
  canviant: boolean;
  onIniciar: (duradaMinuts: number) => void;
}) {
  const [durada, setDurada] = useState<number>(DURADA_PER_DEFECTE_MIN);
  const valida = Number.isInteger(durada) && durada >= DURADA_MINIMA_MIN && durada <= DURADA_MAXIMA_MIN;

  return (
    <div className="targeta flex flex-col gap-4 p-4">
      <div>
        <p className="etiqueta mb-2">durada de la partida (minuts)</p>
        <div className="grid grid-cols-5 gap-2">
          {DURADES_RAPIDES_MIN.map((minuts) => (
            <button
              key={minuts}
              type="button"
              onClick={() => setDurada(minuts)}
              aria-pressed={durada === minuts}
              className={`min-h-12 rounded-xl border-[3px] border-ink text-lg font-extrabold ${
                durada === minuts ? "bg-ink text-gold" : "bg-[#fffdf7] text-ink"
              }`}
            >
              {minuts}
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-3 text-base font-bold">
          Altres:
          <input
            type="number"
            inputMode="numeric"
            min={DURADA_MINIMA_MIN}
            max={DURADA_MAXIMA_MIN}
            value={Number.isNaN(durada) ? "" : durada}
            onChange={(e) => setDurada(e.target.valueAsNumber)}
            className="camp w-24 text-center"
          />
          minuts
        </label>
      </div>
      <button type="button" onClick={() => onIniciar(durada)} disabled={canviant || !valida} className="btn btn-primari">
        {canviant ? "Iniciant..." : `▶ Iniciar partida (${valida ? durada : "?"} min)`}
      </button>
      <p className="text-center text-base text-ink-soft">
        {equipsAPunt === 0
          ? "Encara no ha entrat cap equip."
          : `${equipsAPunt} ${equipsAPunt === 1 ? "equip a punt" : "equips a punt"}. En iniciar, el compte enrere arrenca per a tothom.`}
      </p>
    </div>
  );
}

function PartidaEnCurs({
  iniciadaAt,
  acabaAt,
  desfasamentMs,
  canviant,
  onAjustar,
  onAcabar,
  onReiniciar,
}: {
  iniciadaAt: string;
  acabaAt: string | null;
  desfasamentMs: number;
  canviant: boolean;
  onAjustar: (minuts: number) => void;
  onAcabar: () => void;
  onReiniciar: () => void;
}) {
  const restant = acabaAt ? tempsRestantMs(acabaAt, desfasamentMs) : null;
  const acabat = restant === 0;
  const alerta = restant !== null && restant < MINUTS_ALERTA * 60_000;

  return (
    <div className="targeta flex flex-col gap-4 p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="etiqueta">{acabaAt ? (acabat ? "temps esgotat" : "temps que queda") : "temps de joc"}</p>
          {acabaAt ? (
            <CompteEnrere
              acabaAt={acabaAt}
              desfasamentMs={desfasamentMs}
              className={`font-display text-6xl font-extrabold leading-none ${alerta ? "text-blood" : ""}`}
            />
          ) : (
            <Cronometre des={iniciadaAt} className="font-display text-5xl font-extrabold leading-none" />
          )}
        </div>
        <div className="text-right text-base text-ink-soft">
          <p>
            jugant <Cronometre des={iniciadaAt} className="font-bold" />
          </p>
          {acabaAt && (
            <p>
              fi a les{" "}
              <strong suppressHydrationWarning>
                {new Date(Date.parse(acabaAt)).toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" })}
              </strong>
            </p>
          )}
        </div>
      </div>

      {acabaAt && (
        <div className="grid grid-cols-4 gap-2">
          {AJUSTOS_MIN.map((minuts) => (
            <button
              key={minuts}
              type="button"
              onClick={() => onAjustar(minuts)}
              disabled={canviant || (minuts < 0 && acabat)}
              className="min-h-12 rounded-xl border-[3px] border-ink bg-[#fffdf7] text-lg font-extrabold active:bg-ink active:text-paper disabled:opacity-40"
            >
              {minuts > 0 ? `+${minuts}` : `−${-minuts}`} min
            </button>
          ))}
          <button
            type="button"
            onClick={onAcabar}
            disabled={canviant || acabat}
            className="min-h-12 rounded-xl border-[3px] border-blood text-base font-extrabold text-blood active:bg-blood active:text-white disabled:opacity-40"
          >
            ⏹ Acabar
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onReiniciar}
        disabled={canviant}
        className="min-h-12 rounded-xl border-[3px] border-blood px-3 text-sm font-extrabold text-blood active:bg-blood active:text-white disabled:opacity-50"
      >
        ↺ Reiniciar partida
      </button>
    </div>
  );
}
