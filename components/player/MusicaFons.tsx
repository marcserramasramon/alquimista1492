"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { escoltarEstatSo, iniciarMusica, soActiu, type NomMusica } from "@/lib/so";

/** Quina música sona a cada pantalla. Les rutes que no hi són van en silenci. */
const PISTES: Record<string, NomMusica> = {
  "/": "musica-entrada",
  "/ubicacio": "musica-entrada",
  "/equips": "musica-entrada",
  "/espera": "musica-entrada",
  "/missatge": "musica-missatge",
};

/**
 * Música de fons de l'entrada i del missatge secret. Es munta una sola vegada al
 * layout arrel: mentre la pista no canvia (benvinguda → ubicació → equips → espera)
 * continua sonant sense tallar-se; en arribar al missatge secret fa un encadenat
 * cap a l'altra música, i fora d'aquestes pantalles s'apaga.
 * Els mòbils no deixen sonar res fins al primer toc: llavors comença sola.
 */
export function MusicaFons() {
  const ruta = usePathname() ?? "";
  // Tornar a llegir el missatge des del mapa (?tornada=1) no porta música: només la primera vegada.
  const tornada = useSearchParams().get("tornada") === "1";
  const pista = tornada ? null : (PISTES[ruta] ?? null);
  const [volguda, setVolguda] = useState(true);
  const actiu = useSyncExternalStore(escoltarEstatSo, soActiu, () => false);

  useEffect(() => {
    if (!pista || !volguda) return;
    return iniciarMusica(pista);
  }, [pista, volguda]);

  if (!pista) return null;
  const sonant = volguda && actiu;

  return (
    <button
      type="button"
      onClick={() => setVolguda(!sonant)}
      aria-pressed={sonant}
      aria-label={sonant ? "Aturar la música" : "Engegar la música"}
      className="btn btn-secundari btn-rodo fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40"
    >
      <span aria-hidden>{sonant ? "🔊" : "🔇"}</span>
    </button>
  );
}
