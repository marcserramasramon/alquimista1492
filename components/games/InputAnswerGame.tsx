"use client";

import { useState } from "react";
import { VistaJocResposta, type VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";

interface InputAnswerGameProps {
  estacioId: string;
  onResolt: () => void;
}

/**
 * Lògica del joc de resposta escrita: valida contra /api/resposta i demana
 * pistes a /api/pista. Retorna les props de VistaJocResposta.
 */
export function useInputAnswerGame({ estacioId, onResolt }: InputAnswerGameProps): VistaJocRespostaProps {
  const [resposta, setResposta] = useState("");
  const [missatge, setMissatge] = useState<string | null>(null);
  const [correcte, setCorrecte] = useState(false);
  const [enviant, setEnviant] = useState(false);
  const [pista, setPista] = useState<string | null>(null);
  const [carregantPista, setCarregantPista] = useState(false);

  async function enviarResposta() {
    if (!resposta.trim() || enviant) return;
    setEnviant(true);
    setMissatge(null);
    try {
      const res = await fetch("/api/resposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estacioId, resposta }),
      });
      const data = await res.json();
      setMissatge(data.missatge ?? "Error");
      setCorrecte(Boolean(data.correcte));
      if (data.correcte) {
        setTimeout(onResolt, 1200);
      }
    } catch {
      setMissatge("Error de connexió. Torna-ho a provar.");
    } finally {
      setEnviant(false);
    }
  }

  async function demanarPista() {
    setCarregantPista(true);
    try {
      const res = await fetch("/api/pista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estacioId }),
      });
      const data = await res.json();
      setPista(data.pista ?? null);
    } finally {
      setCarregantPista(false);
    }
  }

  return {
    resposta,
    missatge,
    correcte,
    enviant,
    pista,
    carregantPista,
    onRespostaChange: setResposta,
    onSubmit: enviarResposta,
    onDemanarPista: demanarPista,
  };
}

export function InputAnswerGame(props: InputAnswerGameProps) {
  const joc = useInputAnswerGame(props);
  return <VistaJocResposta {...joc} />;
}
