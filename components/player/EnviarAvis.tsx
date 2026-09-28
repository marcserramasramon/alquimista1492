"use client";

import { useState } from "react";
import { VistaEnviarAvis } from "@/components/vistes/VistaEnviarAvis";

export interface EnviarAvisProps {
  onTancar: () => void;
}

/** Envia l'avís de l'equip al màster (POST /api/avisos) i en mostra el resultat. */
export function EnviarAvis({ onTancar }: EnviarAvisProps) {
  const [enviant, setEnviant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviat, setEnviat] = useState(false);

  async function enviar(text: string) {
    if (enviant || !text) return;
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No s'ha pogut enviar");
        return;
      }
      setEnviat(true);
    } catch {
      setError("Error de connexió. Torneu-ho a provar.");
    } finally {
      setEnviant(false);
    }
  }

  return <VistaEnviarAvis enviant={enviant} error={error} enviat={enviat} onEnviar={enviar} onTancar={onTancar} />;
}
