"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapaEquip, type EstacioMapa } from "@/components/player/MapaEquip";

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
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-leather">Carregant...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-6">
      <header className="text-center">
        <h1 className="font-serif text-2xl font-bold text-ink">{estat.equip.name}</h1>
        <p className="text-sm text-leather">Els Guardians del Secret de Sentfores</p>
      </header>

      <MapaEquip estacions={estat.estacions} totesResoltes={estat.totesResoltes} />

      {estat.totesResoltes && (
        <button
          onClick={() => router.push("/final")}
          className="w-full rounded-xl bg-cochineal px-4 py-4 text-lg font-bold text-parchment shadow-md"
        >
          ⚗️ Anar al Pla de Masset
        </button>
      )}
    </main>
  );
}
