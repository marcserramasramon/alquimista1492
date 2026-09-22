"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaMasterEquips, type EquipMaster } from "@/components/vistes/VistaMasterEquips";
import type { EstacioMapa } from "@/components/player/MapaEquip";
import { getEstacionsOrdenades } from "@/content/public/estacions";
import { useCompartirUbicacio } from "@/lib/useCompartirUbicacio";

type Equip = EquipMaster;

interface EquipApi extends Omit<EquipMaster, "ubicacio"> {
  last_lat: number | null;
  last_lng: number | null;
  last_location_at: string | null;
}

interface EquipsResponse {
  equips: EquipApi[];
  master: { sharing: boolean } | null;
}

// Les fites al mapa del màster, només per situar-se (sense progrés).
const ESTACIONS_MAPA: EstacioMapa[] = getEstacionsOrdenades().map((e) => ({ ...e, progres: { resolta: false } }));

function ambUbicacio(equips: EquipApi[]): Equip[] {
  const ara = Date.now();
  return equips.map(({ last_lat, last_lng, last_location_at, ...equip }) => ({
    ...equip,
    ubicacio:
      last_lat !== null && last_lng !== null && last_location_at
        ? {
            lat: last_lat,
            lng: last_lng,
            faMinuts: Math.floor((ara - new Date(last_location_at).getTime()) / 60_000),
          }
        : null,
  }));
}

export default function MasterPage() {
  const router = useRouter();
  const [equips, setEquips] = useState<Equip[] | null>(null);
  const [nom, setNom] = useState("");
  const [creant, setCreant] = useState(false);
  const [comparteixo, setComparteixo] = useState(false);
  const ubicacio = useCompartirUbicacio({ actiu: comparteixo, endpoint: "/api/master/ubicacio" });

  const llegirEquips = useCallback(async (): Promise<EquipsResponse | null> => {
    const res = await fetch("/api/master/equips");
    if (res.status === 401) {
      router.push("/master/login");
      return null;
    }
    return res.json();
  }, [router]);

  async function carregar() {
    const data = await llegirEquips();
    if (data) setEquips(ambUbicacio(data.equips));
  }

  useEffect(() => {
    let primera = true;
    const refresca = () =>
      llegirEquips()
        .then((data) => {
          if (!data) return;
          setEquips(ambUbicacio(data.equips));
          // L'interruptor arrenca amb el que diu el servidor (p.ex. després de recarregar).
          if (primera && data.master?.sharing) setComparteixo(true);
          primera = false;
        })
        .catch(() => {});
    refresca();
    const interval = setInterval(refresca, 5000);
    return () => clearInterval(interval);
  }, [llegirEquips]);

  async function canviarComparteixo(valor: boolean) {
    setComparteixo(valor);
    await fetch("/api/master/ubicacio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharing: valor }),
    }).catch(() => {});
  }

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
      estacions={ESTACIONS_MAPA}
      posicioMaster={ubicacio.posicio ? { lat: ubicacio.posicio.lat, lng: ubicacio.posicio.lng } : null}
      comparteixo={comparteixo}
      estatUbicacio={ubicacio.estat}
      onComparteixoChange={canviarComparteixo}
    />
  );
}
