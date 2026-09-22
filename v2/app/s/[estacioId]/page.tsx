"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InputAnswerGame } from "@/components/games/InputAnswerGame";
import { ChooseImageGame } from "@/components/games/ChooseImageGame";

interface EstacioData {
  estacio: {
    id: string;
    nom: string;
    entrada: string;
    imatge?: string;
    disponible: boolean;
  };
  joc: { tipus: "text" } | { tipus: "imatge"; opcions: { id: string; imatge: string; etiqueta: string }[] };
}

export default function EstacioPage() {
  const params = useParams();
  const router = useRouter();
  const estacioId = params.estacioId as string;

  const [dades, setDades] = useState<EstacioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/joc/${estacioId}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "No s'ha pogut carregar l'estació");
          return;
        }
        setDades(await res.json());
      })
      .catch(() => setError("Error de connexió"));
  }, [estacioId, router]);

  if (error) {
    return (
      <PantallaEstacio>
        <p className="text-center text-lg text-cochineal">{error}</p>
        <TornarHub />
      </PantallaEstacio>
    );
  }

  if (!dades) {
    return (
      <PantallaEstacio>
        <p className="text-center text-leather">Carregant...</p>
      </PantallaEstacio>
    );
  }

  const { estacio, joc } = dades;

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

      {joc.tipus === "text" && (
        <InputAnswerGame estacioId={estacioId} onResolt={() => router.push("/joc")} />
      )}
      {joc.tipus === "imatge" && (
        <ChooseImageGame
          estacioId={estacioId}
          opcions={joc.opcions}
          onResolt={() => router.push("/joc")}
        />
      )}

      <TornarHub />
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

function TornarHub() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/joc")}
      className="mt-6 w-full rounded-xl border-2 border-leather bg-transparent px-4 py-3 text-center font-semibold text-leather"
    >
      ← Tornar al mapa
    </button>
  );
}
