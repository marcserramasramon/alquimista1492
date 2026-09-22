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

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 font-serif text-2xl font-bold text-ink">Mapa</h1>

      <MapaEquip estacions={estacions} totesResoltes={false} marcadors={marcadors} ambLlista={false} />

      <label className="mt-3 flex min-h-12 items-center gap-3 rounded-xl border-2 border-leather/40 bg-vellum px-4 py-3">
        <input
          type="checkbox"
          checked={comparteixo}
          onChange={(e) => onComparteixoChange(e.target.checked)}
          className="h-6 w-6 accent-prussian"
        />
        <span className="flex-1">
          <span className="block font-bold text-ink">Comparteixo la meva ubicació</span>
          <span className="block text-sm text-leather">
            {comparteixo ? TEXT_ESTAT_UBICACIO[estatUbicacio] : TEXT_ESTAT_UBICACIO.inactiu}
          </span>
        </span>
      </label>

      <h2 className="mb-4 mt-8 font-serif text-2xl font-bold text-ink">Equips</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCrear();
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={nom}
          onChange={(e) => onNomChange(e.target.value)}
          placeholder="Nom de l'equip"
          className="flex-1 rounded-xl border-2 border-leather bg-vellum px-4 py-3 text-ink"
        />
        <button
          type="submit"
          disabled={creant}
          className="rounded-xl bg-prussian px-4 py-3 font-bold text-parchment disabled:opacity-50"
        >
          Crear
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {equips?.map((equip) => (
          <div key={equip.id} className="rounded-xl border-2 border-leather/40 bg-vellum p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">{equip.name}</p>
                <p className="text-sm text-leather">
                  Codi: <span className="font-mono font-bold">{equip.code}</span> · {equip.status}
                </p>
                <p className="text-sm text-leather">
                  📍 {equip.ubicacio ? textEdat(equip.ubicacio.faMinuts) : "sense ubicació"}
                </p>
              </div>
              <p className="text-lg font-bold text-ink">
                {equip.resoltes}/{equip.total}
              </p>
            </div>
            <button
              onClick={() => onReiniciar(equip.id)}
              className="mt-3 w-full rounded-lg border border-cochineal px-3 py-2 text-sm font-semibold text-cochineal"
            >
              Reiniciar equip
            </button>
          </div>
        ))}
        {equips?.length === 0 && <p className="text-center text-leather">Encara no hi ha equips.</p>}
      </div>
    </main>
  );
}
