"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInputAnswerGame } from "@/components/games/InputAnswerGame";
import { VistaEstacio, type EstacioPublica } from "@/components/vistes/VistaEstacio";

interface EstacioData {
  estacio: EstacioPublica;
  pistesDesbloquejades: string[];
}

export default function EstacioPage() {
  const params = useParams();
  const router = useRouter();
  const estacioId = params.estacioId as string;

  const [dades, setDades] = useState<EstacioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setPistesDesbloquejades, ...joc } = useInputAnswerGame({
    estacioId,
    onResolt: () => router.push("/joc"),
  });

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
        const data: EstacioData = await res.json();
        setDades(data);
        setPistesDesbloquejades(data.pistesDesbloquejades ?? []);
      })
      .catch(() => setError("Error de connexió"));
    // setPistesDesbloquejades és un setter de useState: estable entre renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estacioId, router]);

  return (
    <VistaEstacio
      {...joc}
      estacio={dades?.estacio ?? null}
      error={error}
      onTornar={() => router.push("/joc")}
    />
  );
}
