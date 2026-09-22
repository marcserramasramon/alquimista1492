"use client";

import { useState } from "react";

const TOCS_NECESSARIS = 8;

export function CampanarFinal() {
  const [tocs, setTocs] = useState(0);
  const [enviant, setEnviant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revelacio, setRevelacio] = useState<{ traidor: string; text: string } | null>(null);

  async function repicar() {
    if (tocs + 1 < TOCS_NECESSARIS) {
      setTocs((t) => t + 1);
      return;
    }
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/campanes", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Encara no podeu tocar les campanes");
        setTocs(0);
        return;
      }
      setRevelacio(data.revelacio);
    } finally {
      setEnviant(false);
    }
  }

  if (revelacio) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-5xl">🔔</p>
        <h2 className="font-serif text-2xl font-bold text-cochineal">El sometent ha sonat!</h2>
        <p className="text-lg font-bold text-ink">El traïdor és... {revelacio.traidor}</p>
        <p className="text-ink/90">{revelacio.text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-ink/90">Toqueu la campana fins que soni el sometent.</p>
      <button
        onClick={repicar}
        disabled={enviant}
        className="flex h-40 w-40 items-center justify-center rounded-full bg-cochineal text-7xl shadow-xl active:scale-95 disabled:opacity-60"
      >
        🔔
      </button>
      <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-vellum">
        <div
          className="h-full bg-gold transition-all"
          style={{ width: `${(tocs / TOCS_NECESSARIS) * 100}%` }}
        />
      </div>
      {error && <p className="font-semibold text-cochineal">{error}</p>}
    </div>
  );
}
