"use client";

import { useState } from "react";
import type { VistaJocRespostaProps } from "@/components/vistes/VistaJocResposta";
import { ESPERA_ENTRE_INTENTS_MS } from "@/lib/partida";

interface InputAnswerGameProps {
  estacioId: string;
  onResolt: () => void;
}

/**
 * Lògica del joc de resposta escrita: valida contra /api/resposta i demana
 * pistes a /api/pista. Retorna les props de VistaJocResposta.
 */
export function useInputAnswerGame({ estacioId, onResolt }: InputAnswerGameProps): VistaJocRespostaProps & {
  /** Pistes que el servidor diu que l'equip ja havia desbloquejat (en carregar l'estació). */
  setPistesDesbloquejades: (pistes: string[]) => void;
} {
  const [resposta, setResposta] = useState("");
  const [missatge, setMissatge] = useState<string | null>(null);
  const [correcte, setCorrecte] = useState(false);
  const [enviant, setEnviant] = useState(false);
  // El servidor només accepta una resposta cada ESPERA_ENTRE_INTENTS_MS: el botó s'hi espera.
  const [esperant, setEsperant] = useState(false);
  const [pistes, setPistes] = useState<string[]>([]);
  const [carregantPista, setCarregantPista] = useState(false);

  async function enviarResposta() {
    if (!resposta.trim() || enviant || esperant) return;
    const inici = Date.now();
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
        // Temps per veure l'animació i sentir el so de CelebracioFragment abans del fragment.
        setTimeout(onResolt, 3000);
      } else {
        setEsperant(true);
        setTimeout(() => setEsperant(false), Math.max(0, inici + ESPERA_ENTRE_INTENTS_MS - Date.now()));
      }
    } catch {
      setMissatge("Error de connexió. Torna-ho a provar.");
    } finally {
      setEnviant(false);
    }
  }

  async function demanarPista() {
    if (carregantPista) return;
    const nivell = pistes.length;
    setCarregantPista(true);
    try {
      const res = await fetch("/api/pista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estacioId, nivell }),
      });
      const data = await res.json();
      if (res.ok && typeof data.pista === "string") {
        setPistes((actuals) => (actuals.length === nivell ? [...actuals, data.pista] : actuals));
      }
    } finally {
      setCarregantPista(false);
    }
  }

  return {
    resposta,
    missatge,
    correcte,
    enviant,
    esperant,
    pistes,
    carregantPista,
    onRespostaChange: setResposta,
    onSubmit: enviarResposta,
    onDemanarPista: demanarPista,
    setPistesDesbloquejades: setPistes,
  };
}
