"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { llegirDecisioUbicacio } from "@/lib/ubicacio";
import { VistaEntradaCodi } from "@/components/vistes/VistaEntradaCodi";

export function EntradaEquip({ codiInicial = "" }: { codiInicial?: string }) {
  const router = useRouter();
  const [codi, setCodi] = useState(codiInicial);
  const [error, setError] = useState<string | null>(null);
  const [enviant, setEnviant] = useState(false);

  async function entrar() {
    if (codi.trim().length !== 6 || enviant) return;
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codi: codi.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No s'ha pogut entrar");
        return;
      }
      // La primera vegada que l'equip entra, tria el seu nom.
      // Primera entrada: nom → ubicació → hub. Si no, directe al hub, passant per
      // la ubicació si aquest mòbil encara no ho ha decidit.
      if (data.primeraEntrada === true) router.push("/nom");
      else router.push(llegirDecisioUbicacio() ? "/joc" : "/ubicacio");
    } catch {
      setError("Error de connexió. Torna-ho a provar.");
    } finally {
      setEnviant(false);
    }
  }

  return (
    <VistaEntradaCodi
      codi={codi}
      error={error}
      enviant={enviant}
      onCodiChange={setCodi}
      onSubmit={entrar}
    />
  );
}
