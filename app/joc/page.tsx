"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstacioMapa, MarcadorMapa } from "@/components/player/MapaEquip";
import { ObrirFita } from "@/components/player/ObrirFita";
import { VistaHub } from "@/components/vistes/VistaHub";
import { VistaCarregant } from "@/components/vistes/VistaCarregant";
import {
  INTERVAL_UBICACIO_MS,
  RADI_OBERTURA_M,
  distanciaMetres,
  llegirDecisioUbicacio,
  type Ubicacio,
} from "@/lib/ubicacio";
import { useCompartirUbicacio } from "@/lib/useCompartirUbicacio";
import { desbloquejarSo, sonarArribada } from "@/lib/so";

interface EstatResponse {
  equip: { name: string; status: "espera" | "joc" | "final" };
  estacions: EstacioMapa[];
  totesResoltes: boolean;
  /** Només si el màster comparteix la seva ubicació. */
  master: { lat: number; lng: number } | null;
}

/** Si el servidor no obre una fita per GPS (posició just a la vora), no es torna a provar fins passat això. */
const REINTENT_GPS_MS = 15_000;

function distanciaA(posicio: Ubicacio | null, estacio: EstacioMapa): number | null {
  if (!posicio) return null;
  return Math.round(distanciaMetres(posicio, { lat: estacio.latitud, lng: estacio.longitud }));
}

async function obrirPerGps(estacio: EstacioMapa, posicio: Ubicacio): Promise<boolean> {
  const res = await fetch("/api/obrir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estacioId: estacio.id, lat: posicio.lat, lng: posicio.lng }),
  }).catch(() => null);
  return Boolean(res?.ok);
}

export default function HubPage() {
  const router = useRouter();
  const [estat, setEstat] = useState<EstatResponse | null>(null);
  const [comparteix] = useState(() => llegirDecisioUbicacio() === "si");
  const { posicio } = useCompartirUbicacio({ actiu: comparteix, endpoint: "/api/ubicacio" });
  const [arribadaId, setArribadaId] = useState<string | null>(null);
  const [escanejant, setEscanejant] = useState(false);
  const intentsGps = useRef(new Map<string, number>());

  const carregar = useCallback(
    () =>
      fetch("/api/estat")
        .then(async (res) => {
          if (res.status === 401) {
            router.push("/");
            return;
          }
          const data: EstatResponse = await res.json();
          // La partida encara no ha començat: a la sala d'espera.
          if (data.equip?.status === "espera") {
            router.replace("/espera");
            return;
          }
          setEstat(data);
        })
        .catch(() => {}),
    [router]
  );

  useEffect(() => {
    carregar();
    // Refresca el progrés i la posició del màster.
    const interval = setInterval(carregar, INTERVAL_UBICACIO_MS);
    return () => clearInterval(interval);
  }, [carregar]);

  // El navegador només deixa sonar el so d'arribada si abans s'ha tocat la pàgina.
  useEffect(() => {
    window.addEventListener("pointerdown", desbloquejarSo);
    return () => window.removeEventListener("pointerdown", desbloquejarSo);
  }, []);

  // Arribar a una fita tancada l'obre sola: so, vibració i la seva fitxa oberta.
  useEffect(() => {
    if (!posicio || !estat) return;
    const ara = Date.now();
    for (const estacio of estat.estacions) {
      if (estacio.oberta !== false || !estacio.disponible) continue;
      const distancia = distanciaA(posicio, estacio);
      if (distancia === null || distancia > RADI_OBERTURA_M) continue;
      if (ara - (intentsGps.current.get(estacio.id) ?? 0) < REINTENT_GPS_MS) continue;
      intentsGps.current.set(estacio.id, ara);
      obrirPerGps(estacio, posicio).then((oberta) => {
        if (!oberta) return;
        sonarArribada();
        setArribadaId(estacio.id);
        carregar();
      });
    }
  }, [posicio, estat, carregar]);

  if (!estat) {
    return <VistaCarregant />;
  }

  const marcadors: MarcadorMapa[] = [];
  if (estat.master) marcadors.push({ id: "master", tipus: "master", ...estat.master });
  if (posicio) marcadors.push({ id: "jo", tipus: "jo", lat: posicio.lat, lng: posicio.lng });

  async function anarEstacio(estacio: EstacioMapa) {
    if (estacio.tipus === "especial") {
      router.push("/final");
      return;
    }
    if (estacio.oberta !== false) {
      router.push(`/s/${estacio.id}`);
      return;
    }
    // El GPS encara no l'ha oberta: si ja hi sou, es prova de nou; si no, escàner del QR (opcional si el GPS funciona).
    const distancia = distanciaA(posicio, estacio);
    if (posicio && distancia !== null && distancia <= RADI_OBERTURA_M && (await obrirPerGps(estacio, posicio))) {
      router.push(`/s/${estacio.id}`);
      return;
    }
    setEscanejant(true);
  }

  return (
    <>
      <VistaHub
        estacions={estat.estacions}
        totesResoltes={estat.totesResoltes}
        marcadors={marcadors}
        fitaArribadaId={arribadaId}
        onAnarEstacio={anarEstacio}
        onAnarFinal={() => router.push("/final")}
        onLlegirMissatge={() => router.push("/missatge?tornada=1")}
      />
      {escanejant && (
        <ObrirFita onOberta={(estacioId) => router.push(`/s/${estacioId}`)} onTancar={() => setEscanejant(false)} />
      )}
    </>
  );
}
