"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstacioMapa } from "@/components/player/MapaEquip";
import { VistaHub } from "@/components/vistes/VistaHub";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";

interface EstatResponse {
  equip: { name: string };
  estacions: EstacioMapa[];
  totesResoltes: boolean;
}

export default function HubPage() {
  const router = useRouter();
  const [estat, setEstat] = useState<EstatResponse | null>(null);

  useEffect(() => {
    fetch("/api/estat")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/");
          return;
        }
        setEstat(await res.json());
      })
      .catch(() => {});
  }, [router]);

  if (!estat) {
    return <VistaCarregant />;
  }

  return (
    <VistaHub
      nomEquip={estat.equip.name}
      estacions={estat.estacions}
      totesResoltes={estat.totesResoltes}
      onAnarEstacio={(estacio) => {
        if (estacio.tipus === "especial") router.push("/final");
        else router.push(`/s/${estacio.id}`);
      }}
      onAnarFinal={() => router.push("/final")}
    />
  );
}
