"use client";

import { Pantalla } from "@/components/ui/Pantalla";

export interface VistaUbicacioProps {
  /** Esperant que el navegador demani el permís i torni la primera posició. */
  demanant: boolean;
  onAcceptar: () => void;
  onRebutjar: () => void;
}

/** Consentiment abans de demanar el permís de GPS al navegador (després del nom). */
export function VistaUbicacio({ demanant, onAcceptar, onRebutjar }: VistaUbicacioProps) {
  return (
    <Pantalla>
      <div className="flex flex-1 animate-entrar flex-col items-center justify-center text-center">
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/30 [animation-duration:2.4s]" />
          <span className="absolute inset-4 rounded-full border-[3px] border-dashed border-ink/40" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-ink bg-gold text-4xl shadow-[0_5px_0_var(--ink)]">
            📍
          </span>
        </div>
        {/* TEXT PROVISIONAL */}
        <h1 className="mb-3 text-5xl font-bold">Compartiu la vostra ubicació</h1>
        {/* TEXT PROVISIONAL */}
        <p className="text-ink-soft">
          Durant la partida, l&apos;organització veurà on és el vostre equip al mapa. Només es fa servir
          durant el joc.
        </p>
      </div>

      <div className="flex flex-col gap-4 pt-6">
        <button type="button" onClick={onAcceptar} disabled={demanant} className="btn btn-primari">
          {demanant ? "Esperant el permís..." : "D'acord, compartir"}
        </button>
        <button type="button" onClick={onRebutjar} disabled={demanant} className="btn btn-secundari">
          Ara no
        </button>
      </div>
    </Pantalla>
  );
}
