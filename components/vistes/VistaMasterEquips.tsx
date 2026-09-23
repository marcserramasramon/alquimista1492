"use client";

import { useEffect, useState } from "react";
import { MapaEquip, type EstacioMapa, type MarcadorMapa } from "@/components/player/MapaEquip";
import type { EstatUbicacio } from "@/lib/useCompartirUbicacio";
import { PanellMissatgesMaster, type PanellMissatgesMasterProps } from "@/components/vistes/PanellMissatgesMaster";
import { PanellRecorregut, type PanellRecorregutProps } from "@/components/vistes/PanellRecorregut";
import { PanellPartidaMaster } from "@/components/vistes/PanellPartidaMaster";
import { TargetaEquipMaster, type EquipMaster } from "@/components/vistes/TargetaEquipMaster";
import { Cronometre } from "@/components/ui/Cronometre";
import { CompteEnrere } from "@/components/ui/CompteEnrere";
import { MINUTS_ALERTA, tempsRestantMs } from "@/lib/partida";
import { DialegConfirmacio, type Confirmacio } from "@/components/ui/DialegConfirmacio";
import { FranjaSenseConnexio, PindolaConnexio, useEstatConnexio, type DadesConnexio } from "@/components/ui/EstatConnexio";

export type { EquipMaster };

export type PestanyaMaster = "equips" | "mapa" | "missatges" | "partida";

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
  /** Com de fresques són les dades. Sense valor, no es mostra l'indicador. */
  connexio?: DadesConnexio;
  /** Acció pendent de confirmar: es mostra el diàleg. */
  confirmacio?: Confirmacio | null;
  onTancarConfirmacio?: () => void;
  /** Error d'una acció sense diàleg (p.ex. ajustar el temps). */
  avis?: string | null;
  onTancarAvis?: () => void;
  /** Pestanya amb què s'obre (galeria). Sense valor, la darrera que s'ha fet servir en aquest mòbil. */
  pestanyaInicial?: PestanyaMaster;
}

const PESTANYES: { id: PestanyaMaster; icona: string; nom: string }[] = [
  { id: "equips", icona: "👥", nom: "Equips" },
  { id: "mapa", icona: "🗺️", nom: "Mapa" },
  { id: "missatges", icona: "✉️", nom: "Missatges" },
  { id: "partida", icona: "⏳", nom: "Partida" },
];

const CLAU_PESTANYA = "master-pestanya";

function pestanyaDesada(): PestanyaMaster | null {
  try {
    const valor = window.localStorage.getItem(CLAU_PESTANYA);
    return PESTANYES.some((p) => p.id === valor) ? (valor as PestanyaMaster) : null;
  } catch {
    return null;
  }
}

function desarPestanya(pestanya: PestanyaMaster) {
  try {
    window.localStorage.setItem(CLAU_PESTANYA, pestanya);
  } catch {
    // Sense emmagatzematge (navegació privada): simplement no es recorda.
  }
}

const TEXT_ESTAT_UBICACIO: Record<EstatUbicacio, string> = {
  inactiu: "Els equips no veuen on ets.",
  buscant: "Buscant el GPS...",
  actiu: "Els equips veuen on ets.",
  denegat: "El navegador no deixa fer servir el GPS.",
  "no-disponible": "No s'ha pogut obtenir la posició.",
};

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
  connexio,
  confirmacio = null,
  onTancarConfirmacio = () => {},
  avis = null,
  onTancarAvis = () => {},
  pestanyaInicial,
}: VistaMasterEquipsProps) {
  const [pestanya, setPestanya] = useState<PestanyaMaster>(pestanyaInicial ?? "equips");

  // La pestanya desada només es llegeix al client (el servidor no té localStorage).
  useEffect(() => {
    if (pestanyaInicial) return;
    const t = setTimeout(() => {
      const desada = pestanyaDesada();
      if (desada) setPestanya(desada);
    }, 0);
    return () => clearTimeout(t);
  }, [pestanyaInicial]);

  function canviarPestanya(nova: PestanyaMaster) {
    setPestanya(nova);
    desarPestanya(nova);
    window.scrollTo({ top: 0 });
  }

  const marcadors: MarcadorMapa[] = (equips ?? []).flatMap((equip) =>
    equip.ubicacio
      ? [{ id: equip.id, tipus: "equip" as const, lat: equip.ubicacio.lat, lng: equip.ubicacio.lng, etiqueta: equip.name }]
      : []
  );
  if (posicioMaster) marcadors.push({ id: "jo", tipus: "jo", ...posicioMaster });

  const agafats = (equips ?? []).filter((e) => e.agafat);
  const tempsEsgotat = partidaAcabaAt !== null && tempsRestantMs(partidaAcabaAt, desfasamentMs) === 0;

  const errorGps = comparteixo && (estatUbicacio === "denegat" || estatUbicacio === "no-disponible");

  return (
    <div className="mx-auto max-w-2xl">
      <CapcaleraMaster
        partidaIniciadaAt={partidaIniciadaAt}
        partidaAcabaAt={partidaAcabaAt}
        desfasamentMs={desfasamentMs}
        equipsAgafats={equips ? agafats.length : null}
        equipsTotal={equips?.length ?? 0}
        connexio={connexio}
      />

      <main className="flex flex-col px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5">
        <section hidden={pestanya !== "equips"} className="flex flex-col gap-4">
          <h2 className="sr-only">Equips</h2>
          {equips && !partidaIniciadaAt && (
            <div className="flex flex-col gap-3 rounded-2xl border-[3px] border-dashed border-ink/40 p-4">
              <p className="text-lg font-bold">La partida encara no ha començat.</p>
              <button type="button" onClick={() => canviarPestanya("partida")} className="btn btn-primari">
                ⏳ Anar a Partida
              </button>
            </div>
          )}

          <ul className="flex flex-col gap-4">
            {equips?.map((equip) => (
              <TargetaEquipMaster
                key={equip.id}
                equip={equip}
                partidaIniciada={partidaIniciadaAt !== null}
                tempsEsgotat={tempsEsgotat}
                onConsagrar={onConsagrar}
                onAlliberar={onAlliberar}
                onReiniciar={onReiniciar}
              />
            ))}
          </ul>
          {equips?.length === 0 && (
            <p className="rounded-2xl border-[3px] border-dashed border-ink/30 p-6 text-center text-ink-soft">
              No s&apos;han trobat els equips. Cal aplicar la migració 20260924000015.
            </p>
          )}
          {equips === null && <p className="etiqueta text-center">carregant...</p>}
        </section>

        <section hidden={pestanya !== "mapa"} className="flex flex-col gap-3">
          <h2 className="sr-only">Mapa</h2>
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

        <div hidden={pestanya !== "missatges"}>
          {missatges ? (
            <PanellMissatgesMaster equips={equips && agafats} {...missatges} />
          ) : (
            <p className="etiqueta text-center">sense missatges</p>
          )}
        </div>

        <section hidden={pestanya !== "partida"} className="flex flex-col gap-3">
          <h2 className="sr-only">Partida</h2>
          <PanellPartidaMaster
            partidaIniciadaAt={partidaIniciadaAt}
            partidaAcabaAt={partidaAcabaAt}
            desfasamentMs={desfasamentMs}
            canviant={canviantPartida}
            equipsAPunt={agafats.length}
            onIniciar={onIniciarPartida}
            onAjustar={onAjustarTemps}
            onAcabar={onAcabarTemps}
            onReiniciar={onReiniciarPartida}
          />
        </section>
      </main>

      {avis && (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-2xl px-4 pb-2">
          <button
            type="button"
            role="alert"
            onClick={onTancarAvis}
            className="flex min-h-14 w-full animate-pujar items-center gap-3 rounded-xl border-[3px] border-ink bg-blood px-4 py-2 text-left text-lg font-extrabold text-white shadow-[0_4px_0_var(--ink)]"
          >
            <span className="flex-1">✗ {avis}</span>
            <span aria-hidden>✕</span>
          </button>
        </div>
      )}

      {confirmacio && <DialegConfirmacio key={confirmacio.titol} confirmacio={confirmacio} onTancar={onTancarConfirmacio} />}

      <nav
        aria-label="Seccions del panell"
        className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-ink bg-paper pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4">
          {PESTANYES.map((p, i) => {
            const actiu = pestanya === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => canviarPestanya(p.id)}
                aria-current={actiu ? "page" : undefined}
                className={`relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-extrabold ${
                  i > 0 ? "border-l-[3px] border-ink" : ""
                } ${actiu ? "bg-ink text-gold" : "bg-paper text-ink active:bg-paper-3"}`}
              >
                <span aria-hidden className="text-2xl leading-none">
                  {p.icona}
                </span>
                {p.nom}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/** Sempre a dalt, a totes les pestanyes: el temps i quants equips hi ha. */
function CapcaleraMaster({
  partidaIniciadaAt,
  partidaAcabaAt,
  desfasamentMs,
  equipsAgafats,
  equipsTotal,
  connexio,
}: {
  partidaIniciadaAt: string | null;
  partidaAcabaAt: string | null;
  desfasamentMs: number;
  equipsAgafats: number | null;
  equipsTotal: number;
  connexio?: DadesConnexio;
}) {
  const estatConnexio = useEstatConnexio(connexio ?? { ultimaLecturaAt: null, errorsSeguits: 0 });
  const restant = partidaAcabaAt ? tempsRestantMs(partidaAcabaAt, desfasamentMs) : null;
  const acabat = restant === 0;
  const alerta = restant !== null && restant < MINUTS_ALERTA * 60_000;

  let etiqueta = "partida sense iniciar";
  if (partidaIniciadaAt) etiqueta = partidaAcabaAt ? (acabat ? "temps esgotat" : "temps que queda") : "temps de joc";

  return (
    <header className="sticky top-0 z-20 border-b-[3px] border-ink bg-paper px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="etiqueta">màster · {etiqueta}</p>
          {partidaIniciadaAt && partidaAcabaAt ? (
            <CompteEnrere
              acabaAt={partidaAcabaAt}
              desfasamentMs={desfasamentMs}
              className={`font-display text-4xl font-extrabold leading-none ${alerta ? "text-blood" : ""}`}
            />
          ) : partidaIniciadaAt ? (
            <Cronometre des={partidaIniciadaAt} className="font-display text-4xl font-extrabold leading-none" />
          ) : (
            <p className="font-display text-3xl font-extrabold leading-none">—:—</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {connexio && <PindolaConnexio {...estatConnexio} />}
          {equipsAgafats !== null && (
            <p className="rounded-2xl border-[3px] border-ink bg-ink px-3 py-1 text-center font-display text-2xl font-extrabold text-gold">
              {equipsAgafats}/{equipsTotal} <span className="etiqueta text-xs text-paper">equips</span>
            </p>
          )}
        </div>
      </div>
      {connexio && <FranjaSenseConnexio {...estatConnexio} />}
    </header>
  );
}
