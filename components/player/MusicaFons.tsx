"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { escoltarEstatSo, iniciarMusica, soActiu, type NomMusica } from "@/lib/so";

/**
 * Quina música sona a cada pantalla. Les rutes que no hi són van en silenci; les que
 * porten la veu de Fra Francesc (missatge, fites...) no han de dur música.
 */
const PISTES: Record<string, NomMusica> = {
  "/": "musica-entrada",
  "/ubicacio": "musica-entrada",
  "/equips": "musica-entrada",
  "/espera": "musica-entrada",
};

/**
 * Música de fons de l'entrada. Es munta una sola vegada al layout arrel: mentre la
 * pista no canvia (benvinguda → ubicació → equips → espera) continua sonant sense
 * tallar-se, i fora d'aquestes pantalles s'apaga. Dura 15 s com a màxim (lib/so.ts);
 * després el botó la pot tornar a engegar.
 * Els mòbils no deixen sonar res fins al primer toc: llavors comença sola.
 */
export function MusicaFons() {
  const ruta = usePathname() ?? "";
  const pista = PISTES[ruta] ?? null;
  const [volguda, setVolguda] = useState(true);
  const actiu = useSyncExternalStore(escoltarEstatSo, soActiu, () => false);

  useEffect(() => {
    if (!pista || !volguda) return;
    return iniciarMusica(pista, () => setVolguda(false));
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
