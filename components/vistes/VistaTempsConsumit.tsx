"use client";

import { useEffect } from "react";
import { Narracio } from "@/components/ui/Narracio";
import { Pantalla } from "@/components/ui/Pantalla";
import { TEMPS_CONSUMIT } from "@/content/public/textos";
import { sonarTemps } from "@/lib/so";

export interface VistaTempsConsumitProps {
  onAnarPlaMasset: () => void;
}

/**
 * 3b. S'acaba el temps: envia l'equip al Pla de Masset. Encara no hi ha cap durada de
 * partida al model de dades, així que aquesta vista no s'activa sola.
 * En obrir-se sona una campana greu (només si l'àudio ja s'ha desbloquejat amb un toc)
 * i el rellotge de sorra batega fins que marxen.
 */
export function VistaTempsConsumit({ onAnarPlaMasset }: VistaTempsConsumitProps) {
  useEffect(() => {
    sonarTemps();
  }, []);

  return (
    <Pantalla centrat className="gap-6">
      <div className="mx-auto animate-segellar">
        <img src="/images/rellotge-sorra.webp" alt="" className="h-40 w-auto animate-rellotge [animation-delay:600ms]" />
      </div>
      {/* La veu espera que la campana hagi tocat les tres vegades (lib/so.ts, sintesiTemps). */}
      <Narracio
        text={TEMPS_CONSUMIT}
        etiqueta="fra francesc"
        retardVeu={5500}
        className="animate-entrar [animation-delay:150ms]"
      />
      <button type="button" onClick={onAnarPlaMasset} className="btn btn-fosc animate-entrar [animation-delay:300ms]">
        ⚗️ Anar al Pla de Masset
      </button>
    </Pantalla>
  );
}
