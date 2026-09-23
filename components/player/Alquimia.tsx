"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VistaAlquimia } from "@/components/vistes/VistaAlquimia";
import { VistaReceptesAlquimia } from "@/components/vistes/VistaReceptesAlquimia";
import type { ElementAlquimia, ReceptaAlquimia, ResultatMescla } from "@/content/public/alquimia";

// Ou de Pasqua fora de la partida: el progrés només es guarda en aquest navegador.
const CLAU = "sentfores:alquimia:v1";

function llegirDesats(): ElementAlquimia[] {
  try {
    const dades: unknown = JSON.parse(window.localStorage.getItem(CLAU) ?? "[]");
    if (!Array.isArray(dades)) return [];
    return dades
      .filter(
        (d): d is ElementAlquimia =>
          typeof d === "object" && d !== null && typeof d.nom === "string" && typeof d.emoji === "string",
      )
      .slice(0, 200);
  } catch {
    return [];
  }
}

export function Alquimia({ inicials, total }: { inicials: readonly ElementAlquimia[]; total: number }) {
  const [descoberts, setDescoberts] = useState<readonly ElementAlquimia[]>(inicials);
  const [carregat, setCarregat] = useState(false);
  const noms = useRef(new Set(inicials.map((e) => e.nom)));

  useEffect(() => {
    const nous = llegirDesats().filter((e) => !noms.current.has(e.nom));
    for (const e of nous) noms.current.add(e.nom);
    // localStorage només existeix al client: cal llegir-lo després de muntar.
    if (nous.length) setDescoberts((prev) => [...prev, ...nous]);
    setCarregat(true);
  }, []);

  useEffect(() => {
    if (!carregat) return;
    try {
      window.localStorage.setItem(CLAU, JSON.stringify(descoberts.slice(inicials.length)));
    } catch {
      // Sense emmagatzematge (navegació privada): es juga igual, però no es desa.
    }
  }, [descoberts, carregat, inicials.length]);

  const combinar = useCallback(async (a: ElementAlquimia, b: ElementAlquimia): Promise<ResultatMescla> => {
    try {
      const resposta = await fetch("/api/alquimia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: a.nom, b: b.nom }),
      });
      if (!resposta.ok) return { tipus: "error" };
      const { resultat } = (await resposta.json()) as { resultat: ElementAlquimia | null };
      if (!resultat) return { tipus: "res" };
      if (noms.current.has(resultat.nom)) return { tipus: "conegut", element: resultat };
      noms.current.add(resultat.nom);
      setDescoberts((prev) => [...prev, resultat]);
      return { tipus: "nou", element: resultat };
    } catch {
      return { tipus: "error" };
    }
  }, []);

  const router = useRouter();
  const tornar = useCallback(() => {
    // Si s'hi ha arribat pel pentagrama, enrere torna a la pantalla del joc; si no, a l'inici.
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

  // El llibre de receptes s'obre per sobre del joc perquè les peces de la taula no es perdin.
  const [llibreObert, setLlibreObert] = useState(false);
  const [receptes, setReceptes] = useState<ReceptaAlquimia[] | null>(null);
  const [errorReceptes, setErrorReceptes] = useState(false);

  const obrirLlibre = useCallback(async () => {
    setLlibreObert(true);
    if (receptes) return;
    setErrorReceptes(false);
    try {
      const resposta = await fetch("/api/alquimia/receptes");
      if (!resposta.ok) throw new Error();
      setReceptes(((await resposta.json()) as { receptes: ReceptaAlquimia[] }).receptes);
    } catch {
      setErrorReceptes(true);
    }
  }, [receptes]);

  return (
    <>
      <VistaAlquimia
        descoberts={descoberts}
        total={total}
        onCombinar={combinar}
        onTornar={tornar}
        onReceptes={obrirLlibre}
      />
      {llibreObert && (
        <VistaReceptesAlquimia receptes={receptes} error={errorReceptes} onTancar={() => setLlibreObert(false)} />
      )}
    </>
  );
}
