import { Narracio } from "@/components/ui/Narracio";
import { Pantalla } from "@/components/ui/Pantalla";
import { TEMPS_CONSUMIT } from "@/content/public/textos";

export interface VistaTempsConsumitProps {
  onAnarPlaMasset: () => void;
}

/**
 * 3b. S'acaba el temps: envia l'equip al Pla de Masset. Encara no hi ha cap durada de
 * partida al model de dades, així que aquesta vista no s'activa sola.
 */
export function VistaTempsConsumit({ onAnarPlaMasset }: VistaTempsConsumitProps) {
  return (
    <Pantalla centrat className="gap-6">
      <img
        src="/images/rellotge-sorra.webp"
        alt=""
        className="mx-auto h-40 w-auto animate-segellar drop-shadow-[0_0_20px_rgb(234_179_8/0.45)]"
      />
      <Narracio text={TEMPS_CONSUMIT} etiqueta="fra francesc" className="animate-entrar [animation-delay:150ms]" />
      <button type="button" onClick={onAnarPlaMasset} className="btn btn-fosc animate-entrar [animation-delay:300ms]">
        ⚗️ Anar al Pla de Masset
      </button>
    </Pantalla>
  );
}
