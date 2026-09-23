"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IndicadorTemps } from "@/components/ui/IndicadorTemps";
import { VistaTempsConsumit } from "@/components/vistes/VistaTempsConsumit";
import { tempsRestantMs } from "@/lib/partida";

interface EstatPartida {
  acabaAt: string | null;
  guardians: boolean;
  desfasamentMs: number;
}

/** Cada quant es torna a llegir l'hora final (el màster pot afegir o treure minuts). */
const INTERVAL_MS = 15_000;

/** Pantalles de joc de l'equip on es veu el compte enrere. */
const RUTES_JOC = ["/joc", "/s/", "/final", "/missatge"];

/** Quin final de partida ja ha vist l'equip (per no tornar-li a mostrar la pantalla). */
const CLAU_VIST = "sentfores:temps-consumit";

function esRutaJoc(ruta: string | null): boolean {
  return Boolean(ruta && RUTES_JOC.some((r) => ruta === r || ruta.startsWith(r.endsWith("/") ? r : `${r}/`)));
}

function jaVist(acabaAt: string): boolean {
  try {
    return sessionStorage.getItem(CLAU_VIST) === acabaAt;
  } catch {
    return false;
  }
}

/**
 * Compte enrere de la partida, sempre visible a dalt de les pantalles de joc. Es munta una
 * sola vegada al layout arrel. Quan arriba a zero mostra "El temps s'ha consumit" i envia
 * l'equip al Pla de Masset; si Fra Francesc ja l'ha consagrat, l'envia a la pantalla final.
 */
export function TempsPartida() {
  const router = useRouter();
  const ruta = usePathname();
  const actiu = esRutaJoc(ruta);
  const aLaFinal = ruta === "/final";
  const [estat, setEstat] = useState<EstatPartida | null>(null);
  const [esgotat, setEsgotat] = useState(false);

  const consultar = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    const res = await fetch("/api/partida", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const data: { acabaAt: string | null; guardians: boolean; ara: string } | null = await res.json().catch(() => null);
    if (!data) return;
    const desfasamentMs = Date.parse(data.ara) - Date.now();
    setEstat({ acabaAt: data.acabaAt, guardians: data.guardians, desfasamentMs });
    // El màster ha afegit temps: es torna a jugar.
    if (data.acabaAt && tempsRestantMs(data.acabaAt, desfasamentMs) > 0) setEsgotat(false);
  }, []);

  useEffect(() => {
    if (!actiu) return;
    const inicial = setTimeout(consultar, 0);
    const interval = setInterval(consultar, INTERVAL_MS);
    const enTornar = () => {
      if (document.visibilityState === "visible") consultar();
    };
    document.addEventListener("visibilitychange", enTornar);
    return () => {
      clearTimeout(inicial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", enTornar);
    };
  }, [actiu, consultar]);

  // Consagrats: la partida s'ha acabat per a ells, vagin on vagin.
  const guardians = estat?.guardians ?? false;
  useEffect(() => {
    if (actiu && guardians && !aLaFinal) router.replace("/final");
  }, [actiu, guardians, aLaFinal, router]);

  const enZero = useCallback(() => setEsgotat(true), []);

  if (!actiu || !estat?.acabaAt || guardians) return null;
  const { acabaAt, desfasamentMs } = estat;

  const mostrarAvis = esgotat && !aLaFinal && !jaVist(acabaAt);

  function anarPlaMasset() {
    try {
      sessionStorage.setItem(CLAU_VIST, acabaAt);
    } catch {
      // Només és una comoditat: sense emmagatzematge, tornaria a sortir en recarregar.
    }
    router.push("/final");
  }

  return (
    <>
      <IndicadorTemps acabaAt={acabaAt} desfasamentMs={desfasamentMs} onZero={enZero} />
      {mostrarAvis && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-paper">
          <VistaTempsConsumit onAnarPlaMasset={anarPlaMasset} />
        </div>
      )}
    </>
  );
}
