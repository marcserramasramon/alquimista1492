"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaEspera } from "@/components/vistes/VistaEspera";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";
import { getEquip, type Equip } from "@/content/public/equips";

/** Cada quant es pregunta al servidor si el màster ja ha iniciat la partida. */
const INTERVAL_MS = 3000;

export function SalaEspera() {
  const router = useRouter();
  const [equip, setEquip] = useState<Equip | null>(null);

  useEffect(() => {
    let cancelat = false;
    const comprovar = () =>
      fetch("/api/partida", { cache: "no-store" })
        .then(async (res) => {
          // El màster ha alliberat l'equip: cal tornar a triar.
          if (res.status === 401) {
            router.replace("/equips");
            return;
          }
          if (!res.ok || cancelat) return;
          const data: { equip: string; iniciada: boolean } = await res.json();
          // En començar, el missatge secret de Fra Francesc obre la partida.
          if (data.iniciada) router.replace("/missatge");
          else setEquip(getEquip(data.equip) ?? null);
        })
        .catch(() => {});
    comprovar();
    const interval = setInterval(comprovar, INTERVAL_MS);
    return () => {
      cancelat = true;
      clearInterval(interval);
    };
  }, [router]);

  if (!equip) return <VistaCarregant />;
  return <VistaEspera equip={equip} />;
}
