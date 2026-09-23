"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { VistaMissatgeMaster } from "@/components/vistes/VistaMissatgeMaster";

interface Missatge {
  id: string;
  titol: string;
  text: string;
}

/** Cada quant es consulta si el màster ha enviat res. */
const INTERVAL_MS = 8_000;

/** Pantalles de joc de l'equip on pot aparèixer el pop-up. */
const RUTES_JOC = ["/joc", "/s/", "/final", "/missatge"];

function esRutaJoc(ruta: string | null): boolean {
  return Boolean(ruta && RUTES_JOC.some((r) => ruta === r || ruta.startsWith(r.endsWith("/") ? r : `${r}/`)));
}

/**
 * Pop-up dels missatges del màster. Es munta una sola vegada al layout arrel i
 * només actua a les pantalles de joc: consulta /api/missatges, mostra el primer
 * pendent i, amb "D'acord", el marca com a llegit al servidor.
 */
export function MissatgesMaster() {
  const actiu = esRutaJoc(usePathname());
  const [missatges, setMissatges] = useState<Missatge[]>([]);
  const [enviant, setEnviant] = useState(false);
  const vistos = useRef(new Set<string>());
  /** Missatges ja acceptats però que el servidor encara pot tornar (desar en curs o fallit). */
  const acceptats = useRef(new Set<string>());

  const consultar = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    const res = await fetch("/api/missatges", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return; // 401: encara no hi ha equip. Altres errors: ja es provarà.
    const data: { missatges: Missatge[] } | null = await res.json().catch(() => null);
    if (!data) return;
    const pendents = data.missatges.filter((m) => !acceptats.current.has(m.id));
    if (pendents.some((m) => !vistos.current.has(m.id))) {
      navigator.vibrate?.([200, 100, 200]);
      pendents.forEach((m) => vistos.current.add(m.id));
    }
    setMissatges(pendents);
  }, []);

  useEffect(() => {
    if (!actiu) return;
    // Primera consulta en un microtask: no es fa setState de manera síncrona dins l'efecte.
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

  const actual = missatges[0];
  if (!actiu || !actual) return null;

  async function acceptar() {
    if (!actual) return;
    setEnviant(true);
    acceptats.current.add(actual.id);
    // Es tanca de seguida; si no es pot desar, el servidor el tornarà i sortirà de nou.
    setMissatges((ara) => ara.filter((m) => m.id !== actual.id));
    const res = await fetch("/api/missatges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: actual.id }),
    }).catch(() => null);
    if (!res?.ok) acceptats.current.delete(actual.id);
    setEnviant(false);
  }

  return (
    <VistaMissatgeMaster
      key={actual.id}
      titol={actual.titol}
      text={actual.text}
      pendents={missatges.length}
      enviant={enviant}
      onAcceptar={acceptar}
    />
  );
}
