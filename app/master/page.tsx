"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaMasterEquips, type EquipMaster } from "@/components/vistes/VistaMasterEquips";

type Equip = EquipMaster;

export default function MasterPage() {
  const router = useRouter();
  const [equips, setEquips] = useState<Equip[] | null>(null);
  const [nom, setNom] = useState("");
  const [creant, setCreant] = useState(false);

  const llegirEquips = useCallback(async (): Promise<Equip[] | null> => {
    const res = await fetch("/api/master/equips");
    if (res.status === 401) {
      router.push("/master/login");
      return null;
    }
    const data = await res.json();
    return data.equips;
  }, [router]);

  async function carregar() {
    const nous = await llegirEquips();
    if (nous) setEquips(nous);
  }

  useEffect(() => {
    const refresca = () =>
      llegirEquips()
        .then((nous) => {
          if (nous) setEquips(nous);
        })
        .catch(() => {});
    refresca();
    const interval = setInterval(refresca, 5000);
    return () => clearInterval(interval);
  }, [llegirEquips]);

  async function crearEquip() {
    if (!nom.trim() || creant) return;
    setCreant(true);
    try {
      await fetch("/api/master/equips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom }),
      });
      setNom("");
      await carregar();
    } finally {
      setCreant(false);
    }
  }

  async function reiniciar(teamId: string) {
    if (!confirm("Reiniciar el progrés d'aquest equip?")) return;
    await fetch("/api/master/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    await carregar();
  }

  return (
    <VistaMasterEquips
      equips={equips}
      nom={nom}
      creant={creant}
      onNomChange={setNom}
      onCrear={crearEquip}
      onReiniciar={reiniciar}
    />
  );
}
