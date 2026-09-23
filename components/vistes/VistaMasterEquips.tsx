"use client";

import { useState } from "react";
import Link from "next/link";
import { MapaEquip, type EstacioMapa, type MarcadorMapa } from "@/components/player/MapaEquip";
import type { EstatUbicacio } from "@/lib/useCompartirUbicacio";
import { PanellMissatgesMaster, type PanellMissatgesMasterProps } from "@/components/vistes/PanellMissatgesMaster";
import { PanellRecorregut, type PanellRecorregutProps } from "@/components/vistes/PanellRecorregut";
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

export interface VistaMasterEquipsProps {
  /** null mentre es carrega la primera vegada. */
  equips: EquipMaster[] | null;
  /** Inici global de la partida (ISO); null si encara no ha començat. */
  partidaIniciadaAt: string | null;
  /** Hora en què s'acaba el temps (ISO); null si la partida no ha començat o és d'abans del compte enrere. */
  partidaAcabaAt?: string | null;
  /** Rellotge del servidor menys el del mòbil, en ms. */
  desfasamentMs?: number;
  /** Esperant el servidor després de tocar "Iniciar" o "Reiniciar partida". */
  canviantPartida?: boolean;
  onIniciarPartida: (duradaMinuts: number) => void;
  onAjustarTemps: (minuts: number) => void;
  onAcabarTemps: () => void;
  onReiniciarPartida: () => void;
  /** El LED del Gresol s'ha encès: l'equip passa a la pantalla final (o es desfà). */
  onConsagrar: (teamId: string, consagrar: boolean) => void;
  onAlliberar: (teamId: string) => void;
  onReiniciar: (teamId: string) => void;
  /** Fites (només per situar-se al mapa). */
  estacions: EstacioMapa[];
  /** Posició d'aquest mòbil del màster, si la comparteix. */
  posicioMaster: { lat: number; lng: number } | null;
  comparteixo: boolean;
  estatUbicacio: EstatUbicacio;
  onComparteixoChange: (valor: boolean) => void;
  /** Panell de missatges als equips. Si no hi és, no es mostra. */
  missatges?: Omit<PanellMissatgesMasterProps, "equips">;
  /** Recorregut d'un equip al mapa, amb els temps. Si no hi és, no es mostra. */
  recorregut?: Omit<PanellRecorregutProps, "equips">;
}

const TEXT_ESTAT_UBICACIO: Record<EstatUbicacio, string> = {
  inactiu: "Els equips no veuen on ets.",
  buscant: "Buscant el GPS...",
  actiu: "Els equips veuen on ets.",
  denegat: "El navegador no deixa fer servir el GPS.",
  "no-disponible": "No s'ha pogut obtenir la posició.",
};

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

export function VistaMasterEquips({
  equips,
  partidaIniciadaAt,
  partidaAcabaAt = null,
  desfasamentMs = 0,
  canviantPartida = false,
  onIniciarPartida,
  onAjustarTemps,
  onAcabarTemps,
  onReiniciarPartida,
  onConsagrar,
  onAlliberar,
  onReiniciar,
  estacions,
  posicioMaster,
  comparteixo,
  estatUbicacio,
  onComparteixoChange,
  missatges,
  recorregut,
}: VistaMasterEquipsProps) {
  const marcadors: MarcadorMapa[] = (equips ?? []).flatMap((equip) =>
    equip.ubicacio
      ? [{ id: equip.id, tipus: "equip" as const, lat: equip.ubicacio.lat, lng: equip.ubicacio.lng, etiqueta: equip.name }]
      : []
  );
  if (posicioMaster) marcadors.push({ id: "jo", tipus: "jo", ...posicioMaster });

  const agafats = (equips ?? []).filter((e) => e.agafat);

  const errorGps = comparteixo && (estatUbicacio === "denegat" || estatUbicacio === "no-disponible");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-end justify-between">
        <div>
          <p className="etiqueta">panell del</p>
          <h1 className="text-5xl font-extrabold">Màster</h1>
        </div>
        <Link href="/master/codis" className="btn btn-secundari ml-auto mr-3 w-auto px-4 text-base">
          🔳 Codis QR
        </Link>
        {equips && (
          <p className="rounded-2xl border-[3px] border-ink bg-ink px-3 py-1 text-center font-display text-2xl font-extrabold text-gold">
            {agafats.length}/{equips.length} <span className="etiqueta text-xs text-paper">equips</span>
          </p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="etiqueta text-base">partida</h2>
        {partidaIniciadaAt ? (
          <PartidaEnCurs
            iniciadaAt={partidaIniciadaAt}
            acabaAt={partidaAcabaAt}
            desfasamentMs={desfasamentMs}
            canviant={canviantPartida}
            onAjustar={onAjustarTemps}
            onAcabar={onAcabarTemps}
            onReiniciar={onReiniciarPartida}
          />
        ) : (
          <IniciPartida equipsAPunt={agafats.length} canviant={canviantPartida} onIniciar={onIniciarPartida} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="etiqueta text-base">mapa</h2>
        <MapaEquip
          estacions={estacions}
          totesResoltes={false}
          marcadors={marcadors}
          recorregut={recorregut?.triatId ? recorregut.dades?.punts : undefined}
        />
        {recorregut && <PanellRecorregut equips={agafats} {...recorregut} />}

        {/* Interruptor gran: es toca amb el polze sense mirar gaire */}
        <label
          className={`mt-2 flex min-h-16 cursor-pointer items-center gap-4 rounded-2xl border-[3px] px-4 py-3 transition ${
            comparteixo ? "border-ink bg-[#fffdf7] shadow-[0_4px_0_var(--ink)]" : "border-ink/30 bg-paper-2"
          }`}
        >
          <input
            type="checkbox"
            checked={comparteixo}
            onChange={(e) => onComparteixoChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`relative h-9 w-16 shrink-0 rounded-full border-[3px] border-ink transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-gold ${
              comparteixo ? "bg-ok" : "bg-paper-3"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full border-[3px] border-ink bg-white transition-all ${
                comparteixo ? "left-[1.85rem]" : "left-0.5"
              }`}
            />
          </span>
          <span className="flex-1">
            <span className="block text-lg font-extrabold">Comparteixo la meva ubicació</span>
            <span className={`block text-base ${errorGps ? "font-bold text-blood" : "text-ink-soft"}`}>
              {comparteixo ? TEXT_ESTAT_UBICACIO[estatUbicacio] : TEXT_ESTAT_UBICACIO.inactiu}
            </span>
          </span>
        </label>
      </section>

      {missatges && <PanellMissatgesMaster equips={equips && agafats} {...missatges} />}

      <section className="flex flex-col gap-4">
        <h2 className="etiqueta text-base">equips</h2>

        <ul className="flex flex-col gap-4">
          {equips?.map((equip) => {
            const estat = !equip.agafat ? LLIURE : equip.guardians ? GUARDIANS : ESTATS[equip.status];
            return (
              <li key={equip.id} className="targeta p-4">
                <div className="flex items-start justify-between gap-3">
                  <img
                    src={equip.imatge}
                    alt=""
                    className={`h-14 w-14 shrink-0 ${equip.agafat ? "" : "opacity-40 grayscale"}`}
                  />
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

                {equip.agafat && partidaIniciadaAt && (
                  <button
                    type="button"
                    onClick={() => onConsagrar(equip.id, !equip.guardians)}
                    className={
                      equip.guardians
                        ? "mt-4 min-h-12 w-full rounded-xl border-[3px] border-ink/40 px-3 text-base font-extrabold text-ink-soft active:bg-paper-3"
                        : "btn btn-fosc mt-4"
                    }
                  >
                    {equip.guardians ? "↩ Desfer la consagració" : "✨ Consagrar Guardians del Secret"}
                  </button>
                )}

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-base text-ink-soft">
                    📍 {equip.ubicacio ? textEdat(equip.ubicacio.faMinuts) : "sense ubicació"}
                  </p>
                  <div className="flex gap-2">
                    {equip.agafat && (
                      <button
                        onClick={() => onAlliberar(equip.id)}
                        className="min-h-12 rounded-xl border-[3px] border-ink px-3 text-sm font-extrabold active:bg-ink active:text-paper"
                      >
                        🔓 Alliberar
                      </button>
                    )}
                    <button
                      onClick={() => onReiniciar(equip.id)}
                      className="min-h-12 rounded-xl border-[3px] border-blood px-3 text-sm font-extrabold text-blood active:bg-blood active:text-white"
                    >
                      ↺ Reiniciar
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {equips?.length === 0 && (
          <p className="rounded-2xl border-[3px] border-dashed border-ink/30 p-6 text-center text-ink-soft">
            No s&apos;han trobat els equips. Cal aplicar la migració 20260924000015.
          </p>
        )}
        {equips === null && <p className="etiqueta text-center">carregant...</p>}
      </section>
    </main>
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
