"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstacioMapa, MarcadorMapa } from "@/components/player/MapaEquip";
import { VistaHub } from "@/components/vistes/VistaHub";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";
import { INTERVAL_UBICACIO_MS, llegirDecisioUbicacio } from "@/lib/ubicacio";
import { useCompartirUbicacio } from "@/lib/useCompartirUbicacio";

interface EstatResponse {
  equip: { name: string };
  estacions: EstacioMapa[];
  totesResoltes: boolean;
  /** Només si el màster comparteix la seva ubicació. */
  master: { lat: number; lng: number } | null;
}

export default function HubPage() {
  const router = useRouter();
  const [estat, setEstat] = useState<EstatResponse | null>(null);
  const [comparteix] = useState(() => llegirDecisioUbicacio() === "si");
  const { posicio } = useCompartirUbicacio({ actiu: comparteix, endpoint: "/api/ubicacio" });

  useEffect(() => {
    const carregar = () =>
      fetch("/api/estat")
        .then(async (res) => {
          if (res.status === 401) {
            router.push("/");
            return;
          }
          setEstat(await res.json());
        })
        .catch(() => {});
    carregar();
    // Refresca el progrés i la posició del màster.
    const interval = setInterval(carregar, INTERVAL_UBICACIO_MS);
    return () => clearInterval(interval);
  }, [router]);

  if (!estat) {
    return <VistaCarregant />;
  }

  const marcadors: MarcadorMapa[] = [];
  if (estat.master) marcadors.push({ id: "master", tipus: "master", ...estat.master });
  if (posicio) marcadors.push({ id: "jo", tipus: "jo", lat: posicio.lat, lng: posicio.lng });

  return (
    <VistaHub
      nomEquip={estat.equip.name}
      estacions={estat.estacions}
      totesResoltes={estat.totesResoltes}
      marcadors={marcadors}
      onAnarEstacio={(estacio) => {
        if (estacio.tipus === "especial") router.push("/final");
        else router.push(`/s/${estacio.id}`);
      }}
      onAnarFinal={() => router.push("/final")}
    />
  );
}
