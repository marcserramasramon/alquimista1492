"use client";

import { MapaEquip, type EstacioMapa } from "@/components/player/MapaEquip";

export interface VistaHubProps {
  nomEquip: string;
  estacions: EstacioMapa[];
  totesResoltes: boolean;
  onAnarEstacio: (estacio: EstacioMapa) => void;
  onAnarFinal: () => void;
  /** Fita seleccionada en obrir la vista (mostra el seu popup). */
  seleccionadaInicialId?: string | null;
}

export function VistaHub({
  nomEquip,
  estacions,
  totesResoltes,
  onAnarEstacio,
  onAnarFinal,
  seleccionadaInicialId,
}: VistaHubProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-6">
      <header className="text-center">
        <h1 className="font-serif text-2xl font-bold text-ink">{nomEquip}</h1>
        <p className="text-sm text-leather">Els Guardians del Secret de Sentfores</p>
      </header>

      <MapaEquip
        estacions={estacions}
        totesResoltes={totesResoltes}
        onAnar={onAnarEstacio}
        seleccionadaInicialId={seleccionadaInicialId}
      />

      {totesResoltes && (
        <button
          onClick={onAnarFinal}
          className="w-full rounded-xl bg-cochineal px-4 py-4 text-lg font-bold text-parchment shadow-md"
        >
          ⚗️ Anar al Pla de Masset
        </button>
      )}
    </main>
  );
}
