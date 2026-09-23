"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaMasterEquips, type EquipMaster } from "@/components/vistes/VistaMasterEquips";
import type { EstacioMapa } from "@/components/player/MapaEquip";
import { getEstacionsOrdenades } from "@/content/public/estacions";
import { useCompartirUbicacio } from "@/lib/useCompartirUbicacio";
import type {
  EnviamentMissatge,
  MissatgeEnviat,
  ResultatEnviament,
} from "@/components/vistes/PanellMissatgesMaster";

type Equip = EquipMaster;

interface EquipApi extends Omit<EquipMaster, "ubicacio"> {
  last_lat: number | null;
  last_lng: number | null;
  last_location_at: string | null;
}

interface EquipsResponse {
  equips: EquipApi[];
  master: { sharing: boolean } | null;
  partidaIniciadaAt: string | null;
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
  const [partidaIniciadaAt, setPartidaIniciadaAt] = useState<string | null>(null);
  const [canviantPartida, setCanviantPartida] = useState(false);
  const [comparteixo, setComparteixo] = useState(false);
  const ubicacio = useCompartirUbicacio({ actiu: comparteixo, endpoint: "/api/master/ubicacio" });
  const [missatgesRecents, setMissatgesRecents] = useState<MissatgeEnviat[]>([]);

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
    if (!data) return;
    setEquips(ambUbicacio(data.equips));
    setPartidaIniciadaAt(data.partidaIniciadaAt);
  }

  useEffect(() => {
    let primera = true;
    const refresca = () =>
      llegirEquips()
        .then((data) => {
          if (!data) return;
          setEquips(ambUbicacio(data.equips));
          setPartidaIniciadaAt(data.partidaIniciadaAt);
          // L'interruptor arrenca amb el que diu el servidor (p.ex. després de recarregar).
          if (primera && data.master?.sharing) setComparteixo(true);
          primera = false;
        })
        .catch(() => {});
    refresca();
    const interval = setInterval(refresca, 5000);
    return () => clearInterval(interval);
  }, [llegirEquips]);

  const carregarMissatges = useCallback(
    () =>
      fetch("/api/master/missatges")
        .then(async (res) => {
          if (!res.ok) return;
          const data: { missatges: MissatgeEnviat[] } = await res.json();
          setMissatgesRecents(data.missatges);
        })
        .catch(() => {}),
    []
  );

  // Estat de lectura dels missatges enviats (el 401 ja el gestiona el refresc dels equips).
  useEffect(() => {
    const inicial = setTimeout(carregarMissatges, 0);
    const interval = setInterval(carregarMissatges, 5000);
    return () => {
      clearTimeout(inicial);
      clearInterval(interval);
    };
  }, [carregarMissatges]);

  async function enviarMissatge(enviament: EnviamentMissatge): Promise<ResultatEnviament> {
    const res = await fetch("/api/master/missatges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enviament),
    }).catch(() => null);
    if (!res) return { ok: false, error: "Sense connexió. Torna-ho a provar." };
    if (res.status === 401) {
      router.push("/master/login");
      return { ok: false, error: "Cal tornar a entrar" };
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "No s'ha pogut enviar" };
    carregarMissatges();
    return { ok: true, enviats: data.enviats };
  }

  async function canviarComparteixo(valor: boolean) {
    setComparteixo(valor);
    await fetch("/api/master/ubicacio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharing: valor }),
    }).catch(() => {});
  }

  async function canviarPartida(accio: "iniciar" | "reiniciar") {
    if (canviantPartida) return;
    setCanviantPartida(true);
    try {
      await fetch("/api/master/partida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accio }),
      });
      await carregar();
    } finally {
      setCanviantPartida(false);
    }
  }

  function iniciarPartida() {
    const aPunt = equips?.filter((e) => e.agafat).length ?? 0;
    if (!confirm(`Iniciar la partida amb ${aPunt} ${aPunt === 1 ? "equip" : "equips"}? El cronòmetre arrenca ara.`)) return;
    canviarPartida("iniciar");
  }

  function reiniciarPartida() {
    if (!confirm("Reiniciar tota la partida? S'aturarà el cronòmetre, s'alliberaran tots els equips i s'esborrarà el progrés i els missatges.")) return;
    canviarPartida("reiniciar");
  }

  async function alliberar(teamId: string) {
    if (!confirm("Alliberar aquest equip? El mòbil que el té en perdrà l'accés i la icona tornarà a quedar lliure. El progrés es conserva.")) return;
    await fetch("/api/master/alliberar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    await carregar();
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
      partidaIniciadaAt={partidaIniciadaAt}
      canviantPartida={canviantPartida}
      onIniciarPartida={iniciarPartida}
      onReiniciarPartida={reiniciarPartida}
      onAlliberar={alliberar}
      onReiniciar={reiniciar}
      estacions={ESTACIONS_MAPA}
      posicioMaster={ubicacio.posicio ? { lat: ubicacio.posicio.lat, lng: ubicacio.posicio.lng } : null}
      comparteixo={comparteixo}
      estatUbicacio={ubicacio.estat}
      onComparteixoChange={canviarComparteixo}
      missatges={{ recents: missatgesRecents, onEnviar: enviarMissatge }}
    />
  );
}
