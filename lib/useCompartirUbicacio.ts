"use client";

import { useEffect, useRef, useState } from "react";
import { INTERVAL_UBICACIO_MS, type Ubicacio } from "@/lib/ubicacio";

export type EstatUbicacio = "inactiu" | "buscant" | "actiu" | "denegat" | "no-disponible";

/**
 * Vigila la posició del mòbil i l'envia a `endpoint` com a molt cada
 * INTERVAL_UBICACIO_MS. Retorna l'estat i l'última posició coneguda (per
 * pintar "on soc" al mapa). Si l'usuari denega el permís, el joc continua
 * igual: la ubicació és una capa opcional.
 */
export function useCompartirUbicacio({ actiu, endpoint }: { actiu: boolean; endpoint: string }) {
  const [estat, setEstat] = useState<EstatUbicacio>("inactiu");
  const [posicio, setPosicio] = useState<Ubicacio | null>(null);
  const ultima = useRef<Ubicacio | null>(null);
  const ultimEnviament = useRef(0);

  useEffect(() => {
    if (!actiu) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      queueMicrotask(() => setEstat("no-disponible"));
      return;
    }

    function enviar() {
      const ubicacio = ultima.current;
      if (!ubicacio) return;
      ultimEnviament.current = Date.now();
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ubicacio),
      }).catch(() => {
        // Sense cobertura: s'enviarà la següent.
      });
    }

    queueMicrotask(() => setEstat("buscant"));
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const ubicacio = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        const primera = ultima.current === null;
        ultima.current = ubicacio;
        setPosicio(ubicacio);
        setEstat("actiu");
        // La primera posició s'envia de seguida; la resta, amb l'interval.
        if (primera || Date.now() - ultimEnviament.current >= INTERVAL_UBICACIO_MS) enviar();
      },
      (error) => {
        setEstat(error.code === error.PERMISSION_DENIED ? "denegat" : "no-disponible");
      },
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 30_000 }
    );
    // Si el mòbil està quiet, watchPosition no dispara: reenviem igualment l'última posició.
    const interval = setInterval(enviar, INTERVAL_UBICACIO_MS);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    };
  }, [actiu, endpoint]);

  return { estat: actiu ? estat : "inactiu", posicio: actiu ? posicio : null };
}
