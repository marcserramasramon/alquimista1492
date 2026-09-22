"use client";

import { MapaEquip, type EstacioMapa, type MarcadorMapa } from "@/components/player/MapaEquip";
import type { EstatUbicacio } from "@/lib/useCompartirUbicacio";

export interface EquipMaster {
  id: string;
  code: string;
  name: string;
  status: "espera" | "joc" | "final";
  resoltes: number;
  total: number;
  /** Última posició coneguda; null si l'equip no n'ha enviat cap. */
  ubicacio: { lat: number; lng: number; faMinuts: number } | null;
}

export interface VistaMasterEquipsProps {
  /** null mentre es carrega la primera vegada. */
  equips: EquipMaster[] | null;
  nom: string;
  creant: boolean;
  onNomChange: (valor: string) => void;
  onCrear: () => void;
  onReiniciar: (teamId: string) => void;
  /** Fites (només per situar-se al mapa). */
  estacions: EstacioMapa[];
  /** Posició d'aquest mòbil del màster, si la comparteix. */
  posicioMaster: { lat: number; lng: number } | null;
  comparteixo: boolean;
  estatUbicacio: EstatUbicacio;
  onComparteixoChange: (valor: boolean) => void;
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

function textEdat(faMinuts: number) {
  return faMinuts < 1 ? "ara" : `fa ${faMinuts} min`;
}

export function VistaMasterEquips({
  equips,
  nom,
  creant,
  onNomChange,
  onCrear,
  onReiniciar,
  estacions,
  posicioMaster,
  comparteixo,
  estatUbicacio,
  onComparteixoChange,
}: VistaMasterEquipsProps) {
  const marcadors: MarcadorMapa[] = (equips ?? []).flatMap((equip) =>
    equip.ubicacio
      ? [{ id: equip.id, tipus: "equip" as const, lat: equip.ubicacio.lat, lng: equip.ubicacio.lng, etiqueta: equip.name }]
      : []
  );
  if (posicioMaster) marcadors.push({ id: "jo", tipus: "jo", ...posicioMaster });

  const errorGps = comparteixo && (estatUbicacio === "denegat" || estatUbicacio === "no-disponible");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-end justify-between">
        <div>
          <p className="etiqueta">panell del</p>
          <h1 className="text-5xl font-extrabold">Màster</h1>
        </div>
        {equips && (
          <p className="rounded-2xl border-[3px] border-ink bg-ink px-3 py-1 text-center font-display text-2xl font-extrabold text-gold">
            {equips.length} <span className="etiqueta text-xs text-paper">equips</span>
          </p>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="etiqueta text-base">mapa</h2>
        <MapaEquip estacions={estacions} totesResoltes={false} marcadors={marcadors} />

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

      <section className="flex flex-col gap-4">
        <h2 className="etiqueta text-base">equips</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCrear();
          }}
          className="flex gap-3"
        >
          <input
            value={nom}
            onChange={(e) => onNomChange(e.target.value)}
            placeholder="Nom de l'equip nou"
            aria-label="Nom de l'equip nou"
            className="camp min-w-0 flex-1 text-lg"
          />
          <button type="submit" disabled={creant} className="btn btn-primari w-auto shrink-0 px-5">
            + Crear
          </button>
        </form>

        <ul className="flex flex-col gap-4">
          {equips?.map((equip) => {
            const estat = ESTATS[equip.status];
            return (
              <li key={equip.id} className="targeta p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-2xl font-extrabold leading-tight">{equip.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border-2 border-ink bg-[#fffdf7] px-2 font-mono text-lg font-bold tracking-widest">
                        {equip.code}
                      </span>
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

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-base text-ink-soft">
                    📍 {equip.ubicacio ? textEdat(equip.ubicacio.faMinuts) : "sense ubicació"}
                  </p>
                  <button
                    onClick={() => onReiniciar(equip.id)}
                    className="min-h-12 rounded-xl border-[3px] border-blood px-3 text-sm font-extrabold text-blood active:bg-blood active:text-white"
                  >
                    ↺ Reiniciar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        {equips?.length === 0 && (
          <p className="rounded-2xl border-[3px] border-dashed border-ink/30 p-6 text-center text-ink-soft">
            Encara no hi ha equips.
          </p>
        )}
        {equips === null && <p className="etiqueta text-center">carregant...</p>}
      </section>
    </main>
  );
}
