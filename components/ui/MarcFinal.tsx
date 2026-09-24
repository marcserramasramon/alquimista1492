"use client";

import { BANDA_RUNES_PX, MarcRunes } from "@/components/ui/MarcRunes";

/** Espai que ha de deixar el contingut perquè no quedi sota el marc (banda de runes + aire). */
export const MARGE_MARC_FINAL_PX = BANDA_RUNES_PX + 6;

/**
 * Marc de runes en moviment al voltant de tota la pantalla, el mateix de la taula d'alquímia
 * (ou de pasqua). Distingeix les pantalles del final (Pla de Masset) de les fites.
 * Queda fix mentre el contingut fa scroll per sota; la banda és opaca (del color `fons`) perquè
 * les runes es llegeixin.
 */
export function MarcFinal({ fons = "var(--paper)" }: { fons?: string }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20">
      {/* Zones del notch i de la barra inferior, del color del paper */}
      <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)]" style={{ background: fons }} />
      <div className="absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)]" style={{ background: fons }} />
      <div className="absolute inset-x-0 top-[env(safe-area-inset-top)] bottom-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 0 ${BANDA_RUNES_PX}px ${fons}` }} />
        <MarcRunes />
        <div className="absolute rounded-2xl border-2 border-gold-deep/50" style={{ inset: BANDA_RUNES_PX }} />
      </div>
    </div>
  );
}
