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
import type { DadesRecorregut } from "@/components/vistes/PanellRecorregut";

/** Cada quant es torna a llegir el recorregut de l'equip triat (els equips envien la posició cada 30 s). */
const INTERVAL_RECORREGUT_MS = 30_000;

type Equip = EquipMaster;

interface EquipApi extends Omit<EquipMaster, "ubicacio" | "guardians"> {
  guardians_at: string | null;
  last_lat: number | null;
  last_lng: number | null;
  last_location_at: string | null;
}

interface EquipsResponse {
  equips: EquipApi[];
  master: { sharing: boolean } | null;
  partidaIniciadaAt: string | null;
  partidaAcabaAt: string | null;
  ara: string;
}

// Les fites al mapa del màster, només per situar-se (sense progrés).
const ESTACIONS_MAPA: EstacioMapa[] = getEstacionsOrdenades().map((e) => ({ ...e, progres: { resolta: false } }));

function ambUbicacio(equips: EquipApi[]): Equip[] {
  const ara = Date.now();
  return equips.map(({ last_lat, last_lng, last_location_at, guardians_at, ...equip }) => ({
    ...equip,
    guardians: guardians_at !== null,
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
  const [partidaAcabaAt, setPartidaAcabaAt] = useState<string | null>(null);
  const [desfasamentMs, setDesfasamentMs] = useState(0);
  const [canviantPartida, setCanviantPartida] = useState(false);
  const [comparteixo, setComparteixo] = useState(false);
  const ubicacio = useCompartirUbicacio({ actiu: comparteixo, endpoint: "/api/master/ubicacio" });
  const [missatgesRecents, setMissatgesRecents] = useState<MissatgeEnviat[]>([]);
  const [recorregutId, setRecorregutId] = useState<string | null>(null);
  const [recorregut, setRecorregut] = useState<DadesRecorregut | null>(null);

  useEffect(() => {
    if (!recorregutId) return;
    let cancelat = false;
    const llegir = () =>
      fetch(`/api/master/recorregut?teamId=${encodeURIComponent(recorregutId)}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok || cancelat) return;
          const data: DadesRecorregut = await res.json();
          if (!cancelat) setRecorregut(data);
        })
        .catch(() => {});
    llegir();
    const interval = setInterval(llegir, INTERVAL_RECORREGUT_MS);
    return () => {
      cancelat = true;
      clearInterval(interval);
    };
  }, [recorregutId]);

  function triarRecorregut(teamId: string | null) {
    setRecorregut(null);
    setRecorregutId(teamId);
  }

  const llegirEquips = useCallback(async (): Promise<EquipsResponse | null> => {
    const res = await fetch("/api/master/equips");
    if (res.status === 401) {
      router.push("/master/login");
      return null;
    }
    return res.json();
  }, [router]);

  const aplicar = useCallback((data: EquipsResponse) => {
    setEquips(ambUbicacio(data.equips));
    setPartidaIniciadaAt(data.partidaIniciadaAt);
    setPartidaAcabaAt(data.partidaAcabaAt);
    setDesfasamentMs(Date.parse(data.ara) - Date.now());
  }, []);

  async function carregar() {
    const data = await llegirEquips();
    if (data) aplicar(data);
  }

  useEffect(() => {
    let primera = true;
    const refresca = () =>
      llegirEquips()
        .then((data) => {
          if (!data) return;
          aplicar(data);
          // L'interruptor arrenca amb el que diu el servidor (p.ex. després de recarregar).
          if (primera && data.master?.sharing) setComparteixo(true);
          primera = false;
        })
        .catch(() => {});
    refresca();
    const interval = setInterval(refresca, 5000);
    return () => clearInterval(interval);
  }, [llegirEquips, aplicar]);

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

  async function canviarPartida(
    peticio:
      | { accio: "iniciar"; durada: number }
      | { accio: "ajustar"; minuts: number }
      | { accio: "acabar" }
      | { accio: "reiniciar" }
  ) {
    if (canviantPartida) return;
    setCanviantPartida(true);
    try {
      const res = await fetch("/api/master/partida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(peticio),
      }).catch(() => null);
      if (!res) alert("Sense connexió. Torna-ho a provar.");
      else if (!res.ok) alert((await res.json().catch(() => ({}))).error ?? "No s'ha pogut fer");
      await carregar();
    } finally {
      setCanviantPartida(false);
    }
  }

  function iniciarPartida(durada: number) {
    const aPunt = equips?.filter((e) => e.agafat).length ?? 0;
    if (!confirm(`Iniciar la partida de ${durada} minuts amb ${aPunt} ${aPunt === 1 ? "equip" : "equips"}? El compte enrere arrenca ara.`)) return;
    canviarPartida({ accio: "iniciar", durada });
  }

  function ajustarTemps(minuts: number) {
    canviarPartida({ accio: "ajustar", minuts });
  }

  function acabarTemps() {
    if (!confirm("Acabar el temps ara? Tots els equips veuran que s'ha acabat el temps i els enviarà al Pla de Masset.")) return;
    canviarPartida({ accio: "acabar" });
  }

  async function consagrar(teamId: string, valor: boolean) {
    const nom = equips?.find((e) => e.id === teamId)?.name ?? "aquest equip";
    const pregunta = valor
      ? `Consagrar ${nom} com a Guardians del Secret? El seu mòbil passarà a la pantalla final.`
      : `Desfer la consagració de ${nom}? El seu mòbil tornarà al Gresol.`;
    if (!confirm(pregunta)) return;
    const res = await fetch("/api/master/guardians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, consagrar: valor }),
    }).catch(() => null);
    if (!res?.ok) alert("No s'ha pogut desar. Torna-ho a provar.");
    await carregar();
  }

  function reiniciarPartida() {
    if (!confirm("Reiniciar tota la partida? S'aturarà el cronòmetre, s'alliberaran tots els equips i s'esborrarà el progrés i els missatges.")) return;
    canviarPartida({ accio: "reiniciar" });
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
      partidaAcabaAt={partidaAcabaAt}
      desfasamentMs={desfasamentMs}
      canviantPartida={canviantPartida}
      onIniciarPartida={iniciarPartida}
      onAjustarTemps={ajustarTemps}
      onAcabarTemps={acabarTemps}
      onReiniciarPartida={reiniciarPartida}
      onConsagrar={consagrar}
      onAlliberar={alliberar}
      onReiniciar={reiniciar}
      estacions={ESTACIONS_MAPA}
      posicioMaster={ubicacio.posicio ? { lat: ubicacio.posicio.lat, lng: ubicacio.posicio.lng } : null}
      comparteixo={comparteixo}
      estatUbicacio={ubicacio.estat}
      onComparteixoChange={canviarComparteixo}
      missatges={{ recents: missatgesRecents, onEnviar: enviarMissatge }}
      recorregut={{ triatId: recorregutId, dades: recorregut, onTriar: triarRecorregut }}
    />
  );
}
