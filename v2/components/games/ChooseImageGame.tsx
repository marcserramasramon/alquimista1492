"use client";

import { useState } from "react";

interface Opcio {
  id: string;
  imatge: string;
  etiqueta: string;
}

interface ChooseImageGameProps {
  estacioId: string;
  opcions: Opcio[];
  onResolt: () => void;
}

export function ChooseImageGame({ estacioId, opcions, onResolt }: ChooseImageGameProps) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [missatge, setMissatge] = useState<string | null>(null);
  const [correcte, setCorrecte] = useState(false);
  const [enviant, setEnviant] = useState(false);

  async function triar(opcioId: string) {
    if (enviant) return;
    setSeleccionada(opcioId);
    setEnviant(true);
    setMissatge(null);
    try {
      const res = await fetch("/api/resposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estacioId, resposta: { opcioId } }),
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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {opcions.map((opcio) => (
          <button
            key={opcio.id}
            type="button"
            onClick={() => triar(opcio.id)}
            disabled={enviant}
            className={`rounded-xl border-4 p-1 shadow-md transition disabled:opacity-60 ${
              seleccionada === opcio.id
                ? correcte
                  ? "border-green-400"
                  : "border-cochineal"
                : "border-transparent"
            }`}
          >
            <img
              src={opcio.imatge}
              alt={opcio.etiqueta}
              className="aspect-square w-full rounded-lg object-cover"
            />
            <p className="pt-1 text-sm font-semibold text-ink">{opcio.etiqueta}</p>
          </button>
        ))}
      </div>

      {missatge && (
        <p
          className={`text-center text-lg font-bold ${correcte ? "text-green-400" : "text-cochineal"}`}
          role="status"
        >
          {correcte ? "✅ " : "❌ "}
          {missatge}
        </p>
      )}
    </div>
  );
}
