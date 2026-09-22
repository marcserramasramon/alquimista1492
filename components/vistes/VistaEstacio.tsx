"use client";

import { VistaJocResposta, type VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";

/** Dades públiques d'una estació tal com les retorna /api/joc/[estacioId]. */
export interface EstacioPublica {
  id: string;
  nom: string;
  entrada: string;
  imatge?: string;
  disponible: boolean;
}

export interface VistaEstacioProps extends VistaJocRespostaProps {
  /** null mentre es carrega. */
  estacio: EstacioPublica | null;
  /** Si hi ha error (p.ex. "Estació no disponible"), es mostra en lloc del joc. */
  error?: string | null;
  onTornar: () => void;
}

export function VistaEstacio({ estacio, error, onTornar, ...joc }: VistaEstacioProps) {
  if (error) {
    return (
      <PantallaEstacio>
        <p className="text-center text-lg text-cochineal">{error}</p>
        <TornarHub onTornar={onTornar} />
      </PantallaEstacio>
    );
  }

  if (!estacio) {
    return (
      <PantallaEstacio>
        <p className="text-center text-leather">Carregant...</p>
      </PantallaEstacio>
    );
  }

  return (
    <PantallaEstacio>
      {estacio.imatge && (
        <img
          src={estacio.imatge}
          alt={estacio.nom}
          className="mb-4 aspect-video w-full rounded-xl object-cover shadow-md"
        />
      )}
      <h1 className="mb-2 text-center font-serif text-2xl font-bold text-ink">{estacio.nom}</h1>
      <p className="mb-6 text-center text-ink/90">{estacio.entrada}</p>

      <VistaJocResposta {...joc} />

      <TornarHub onTornar={onTornar} />
    </PantallaEstacio>
  );
}

function PantallaEstacio({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      {children}
    </main>
  );
}

function TornarHub({ onTornar }: { onTornar: () => void }) {
  return (
    <button
      onClick={onTornar}
      className="mt-6 w-full rounded-xl border-2 border-leather bg-transparent px-4 py-3 text-center font-semibold text-leather"
    >
      ← Tornar al mapa
    </button>
  );
}
