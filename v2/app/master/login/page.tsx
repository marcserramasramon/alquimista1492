"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MasterLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviant, setEnviant] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/master/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "PIN incorrecte");
        return;
      }
      router.push("/master");
    } finally {
      setEnviant(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-8">
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-ink">Màster</h1>
      <form onSubmit={entrar} className="flex flex-col gap-4">
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="w-full rounded-xl border-2 border-leather bg-vellum px-4 py-4 text-center text-2xl tracking-widest text-ink focus:outline-none focus:ring-2 focus:ring-prussian"
        />
        <button
          type="submit"
          disabled={enviant}
          className="w-full rounded-xl bg-prussian px-4 py-4 text-lg font-bold text-parchment disabled:opacity-50"
        >
          Entrar
        </button>
        {error && <p className="text-center font-semibold text-cochineal">{error}</p>}
      </form>
    </main>
  );
}
