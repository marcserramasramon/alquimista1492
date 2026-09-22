"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EntradaEquip({ codiInicial = "" }: { codiInicial?: string }) {
  const router = useRouter();
  const [codi, setCodi] = useState(codiInicial);
  const [error, setError] = useState<string | null>(null);
  const [enviant, setEnviant] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (codi.trim().length !== 6 || enviant) return;
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codi: codi.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No s'ha pogut entrar");
        return;
      }
      router.push("/joc");
    } catch {
      setError("Error de connexió. Torna-ho a provar.");
    } finally {
      setEnviant(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-8">
      <h1 className="mb-1 text-center font-serif text-3xl font-bold text-ink">
        Els Guardians del Secret de Sentfores
      </h1>
      <p className="mb-8 text-center text-leather">Introduïu el codi del vostre equip</p>

      <form onSubmit={entrar} className="flex flex-col gap-4">
        <input
          type="text"
          value={codi}
          onChange={(e) => setCodi(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="CODI"
          autoComplete="off"
          autoCapitalize="characters"
          className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-4 text-center text-2xl font-bold tracking-[0.3em] text-ink placeholder:text-leather/50 focus:outline-none focus:ring-2 focus:ring-prussian"
        />
        <button
          type="submit"
          disabled={codi.trim().length !== 6 || enviant}
          className="w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment shadow-md disabled:opacity-50"
        >
          {enviant ? "Entrant..." : "Entrar a la partida"}
        </button>
        {error && <p className="text-center font-semibold text-cochineal">{error}</p>}
      </form>
    </main>
  );
}
