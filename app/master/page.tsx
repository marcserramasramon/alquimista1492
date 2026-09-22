"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Equip {
  id: string;
  code: string;
  name: string;
  status: "espera" | "joc" | "final";
  resoltes: number;
  total: number;
}

export default function MasterPage() {
  const router = useRouter();
  const [equips, setEquips] = useState<Equip[] | null>(null);
  const [nom, setNom] = useState("");
  const [creant, setCreant] = useState(false);

  async function carregar() {
    const res = await fetch("/api/master/equips");
    if (res.status === 401) {
      router.push("/master/login");
      return;
    }
    const data = await res.json();
    setEquips(data.equips);
  }

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function crearEquip(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || creant) return;
    setCreant(true);
    try {
      await fetch("/api/master/equips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom }),
      });
      setNom("");
      await carregar();
    } finally {
      setCreant(false);
    }
  }

  async function reiniciar(teamId: string) {
    if (!confirm("Reiniciar el progrés d'aquest equip?")) return;
    await fetch("/api/master/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    await carregar();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 font-serif text-2xl font-bold text-ink">Equips</h1>

      <form onSubmit={crearEquip} className="mb-6 flex gap-2">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom de l'equip"
          className="flex-1 rounded-xl border-2 border-leather bg-vellum px-4 py-3 text-ink"
        />
        <button
          type="submit"
          disabled={creant}
          className="rounded-xl bg-prussian px-4 py-3 font-bold text-parchment disabled:opacity-50"
        >
          Crear
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {equips?.map((equip) => (
          <div key={equip.id} className="rounded-xl border-2 border-leather/40 bg-vellum p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">{equip.name}</p>
                <p className="text-sm text-leather">
                  Codi: <span className="font-mono font-bold">{equip.code}</span> · {equip.status}
                </p>
              </div>
              <p className="text-lg font-bold text-ink">
                {equip.resoltes}/{equip.total}
              </p>
            </div>
            <button
              onClick={() => reiniciar(equip.id)}
              className="mt-3 w-full rounded-lg border border-cochineal px-3 py-2 text-sm font-semibold text-cochineal"
            >
              Reiniciar equip
            </button>
          </div>
        ))}
        {equips?.length === 0 && <p className="text-center text-leather">Encara no hi ha equips.</p>}
      </div>
    </main>
  );
}
