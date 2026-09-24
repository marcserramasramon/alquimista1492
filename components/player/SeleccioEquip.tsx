"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaSeleccioEquip } from "@/components/vistes/VistaSeleccioEquip";

/** Cada quant es refresca quins equips ja tenen jugadors. */
const INTERVAL_MS = 3000;

export function SeleccioEquip() {
  const router = useRouter();
  const [ambJugadors, setAmbJugadors] = useState<string[]>([]);
  const [triant, setTriant] = useState<string | null>(null);
  const [confirmant, setConfirmant] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(
    () =>
      fetch("/api/equips", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) return;
          const data: { ambJugadors: string[]; meu: string | null } = await res.json();
          // Aquest mòbil ja té equip (p.ex. ha tornat enrere): a l'espera.
          if (data.meu) router.replace("/espera");
          else setAmbJugadors(data.ambJugadors);
        })
        .catch(() => {}),
    [router]
  );

  useEffect(() => {
    const inicial = setTimeout(carregar, 0);
    const interval = setInterval(carregar, INTERVAL_MS);
    return () => {
      clearTimeout(inicial);
      clearInterval(interval);
    };
  }, [carregar]);

  function triar(equipId: string) {
    if (triant) return;
    // Si ja hi ha jugadors, primer es confirma (no fos cas que sigui l'equip d'uns altres).
    if (ambJugadors.includes(equipId)) setConfirmant(equipId);
    else void entrar(equipId);
  }

  async function entrar(equipId: string) {
    if (triant) return;
    setConfirmant(null);
    setTriant(equipId);
    setError(null);
    try {
      const res = await fetch("/api/equips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equip: equipId }),
      });
      if (res.ok) {
        router.replace("/espera");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No s'ha pogut triar l'equip");
      setTriant(null);
      await carregar();
    } catch {
      setError("Error de connexió. Torna-ho a provar.");
      setTriant(null);
    }
  }

  return (
    <VistaSeleccioEquip
      ambJugadors={ambJugadors}
      triant={triant}
      confirmant={confirmant}
      error={error}
      onTriar={triar}
      onConfirmar={entrar}
      onCancelar={() => setConfirmant(null)}
    />
  );
}
