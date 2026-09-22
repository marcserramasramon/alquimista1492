"use client";

import { useState } from "react";

interface InputAnswerGameProps {
  estacioId: string;
  onResolt: () => void;
}

export function InputAnswerGame({ estacioId, onResolt }: InputAnswerGameProps) {
  const [resposta, setResposta] = useState("");
  const [missatge, setMissatge] = useState<string | null>(null);
  const [correcte, setCorrecte] = useState(false);
  const [enviant, setEnviant] = useState(false);
  const [pista, setPista] = useState<string | null>(null);
  const [carregantPista, setCarregantPista] = useState(false);

  async function enviarResposta(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <form onSubmit={enviarResposta} className="flex flex-col gap-4">
      <input
        type="text"
        value={resposta}
        onChange={(e) => setResposta(e.target.value)}
        placeholder="Escriviu la resposta..."
        autoComplete="off"
        autoCapitalize="characters"
        className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-3 text-lg text-ink placeholder:text-leather/60 focus:outline-none focus:ring-2 focus:ring-prussian"
      />

      <button
        type="submit"
        disabled={enviant || !resposta.trim()}
        className="w-full rounded-xl bg-prussian px-4 py-3 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
      >
        {enviant ? "Comprovant..." : "Comprovar"}
      </button>

      {missatge && (
        <p
          className={`text-center text-lg font-bold ${correcte ? "text-green-700" : "text-cochineal"}`}
          role="status"
        >
          {correcte ? "✅ " : "❌ "}
          {missatge}
        </p>
      )}

      <div className="pt-2 text-center">
        {pista && <p className="mb-2 rounded-lg bg-gold/20 p-3 text-sm italic text-ink">💡 {pista}</p>}
        <button
          type="button"
          onClick={demanarPista}
          disabled={carregantPista}
          className="text-sm font-semibold text-leather underline underline-offset-4"
        >
          {carregantPista ? "Carregant pista..." : "Necessito una pista"}
        </button>
      </div>
    </form>
  );
}
