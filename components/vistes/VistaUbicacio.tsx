"use client";

export interface VistaUbicacioProps {
  /** Esperant que el navegador demani el permís i torni la primera posició. */
  demanant: boolean;
  onAcceptar: () => void;
  onRebutjar: () => void;
}

/** Consentiment abans de demanar el permís de GPS al navegador (després del nom). */
export function VistaUbicacio({ demanant, onAcceptar, onRebutjar }: VistaUbicacioProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-8 text-center">
      <p className="mb-4 text-5xl">📍</p>
      {/* TEXT PROVISIONAL */}
      <h1 className="mb-2 font-serif text-3xl font-bold text-ink">Compartiu la vostra ubicació</h1>
      {/* TEXT PROVISIONAL */}
      <p className="mb-8 text-leather">
        Durant la partida, l&apos;organització veurà on és el vostre equip al mapa. Només es fa servir
        durant el joc.
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onAcceptar}
          disabled={demanant}
          className="min-h-12 w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
        >
          {demanant ? "Esperant el permís..." : "D'acord, compartir"}
        </button>
        <button
          type="button"
          onClick={onRebutjar}
          disabled={demanant}
          className="min-h-12 w-full rounded-xl border-2 border-leather bg-transparent px-4 py-3 font-semibold text-leather disabled:opacity-50"
        >
          Ara no
        </button>
      </div>
    </main>
  );
}
