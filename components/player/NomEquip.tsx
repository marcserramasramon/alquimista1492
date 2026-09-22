"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaNomEquip } from "@/components/vistes/VistaNomEquip";
import { NomEquipSchema } from "@/lib/nomEquip";

/** Contenidor de la pantalla del nom: carrega el nom provisional, el valida i el desa. */
export function NomEquip() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviant, setEnviant] = useState(false);

  useEffect(() => {
    let cancelat = false;
    (async () => {
      try {
        const res = await fetch("/api/estat", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/");
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelat && typeof data?.equip?.name === "string") setNom(data.equip.name);
      } catch {
        // Sense connexió: l'equip pot escriure el nom igualment.
      }
    })();
    return () => {
      cancelat = true;
    };
  }, [router]);

  async function desar() {
    if (enviant) return;
    const validacio = NomEquipSchema.safeParse({ nom });
    if (!validacio.success) {
      setError(validacio.error.issues[0]?.message ?? "Nom invàlid");
      return;
    }
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/nom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validacio.data),
      });
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No s'ha pogut desar el nom");
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
    <VistaNomEquip nom={nom} error={error} enviant={enviant} onNomChange={setNom} onSubmit={desar} />
  );
}
