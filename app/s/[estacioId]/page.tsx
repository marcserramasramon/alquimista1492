"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInputAnswerGame } from "@/components/games/InputAnswerGame";
import { VistaEstacio, type EstacioPublica } from "@/components/vistes/VistaEstacio";

interface EstacioData {
  estacio: EstacioPublica;
  pistesDesbloquejades: string[];
  resolta: boolean;
}

export default function EstacioPage() {
  const params = useParams();
  const router = useRouter();
  const estacioId = params.estacioId as string;

  const [dades, setDades] = useState<EstacioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolta, setResolta] = useState(false);

  const { setPistesDesbloquejades, ...joc } = useInputAnswerGame({
    estacioId,
    // Després de la celebració, la mateixa pantalla mostra el fragment desbloquejat.
    onResolt: () => {
      setResolta(true);
      window.scrollTo({ top: 0 });
    },
  });

  useEffect(() => {
    carregarEstacio();

    async function carregarEstacio() {
      // QR del cartell escanejat amb la càmera del mòbil: /s/{id}?c={codi}. Primer s'obre la fita.
      const codi = new URLSearchParams(window.location.search).get("c");
      if (codi) {
        window.history.replaceState(null, "", `/s/${estacioId}`);
        const res = await fetch("/api/obrir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codi, via: "qr" }),
        }).catch(() => null);
        if (res?.status === 401) {
          router.push("/");
          return;
        }
        const data = await res?.json().catch(() => null);
        if (data?.estacioId && data.estacioId !== estacioId) {
          router.replace(`/s/${data.estacioId}`);
          return;
        }
      }

      const res = await fetch(`/api/joc/${estacioId}`).catch(() => null);
      if (!res) {
        setError("Error de connexió");
        return;
      }
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) {
        // Inclou la fita encara tancada (403): cal arribar-hi o escanejar el QR des del mapa.
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No s'ha pogut carregar l'estació");
        return;
      }
      const data: EstacioData = await res.json();
      setDades(data);
      setResolta(data.resolta);
      setPistesDesbloquejades(data.pistesDesbloquejades ?? []);
    }
    // setPistesDesbloquejades és un setter de useState: estable entre renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estacioId, router]);

  return (
    <VistaEstacio
      {...joc}
      estacio={dades?.estacio ?? null}
      resolta={resolta}
      error={error}
      onTornar={() => router.push("/joc")}
    />
  );
}
