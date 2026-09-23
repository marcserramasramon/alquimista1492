"use client";

import { useState, useSyncExternalStore } from "react";
import { VistaFinal } from "@/components/vistes/VistaFinal";

/** Si el mòbil recarrega la pàgina enmig del ritual, no torna a la pantalla d'espera. */
const CLAU_RITUAL = "sentfores:gresol-ritual";

function llegirRitualGuardat(): boolean {
  try {
    return sessionStorage.getItem(CLAU_RITUAL) === "1";
  } catch {
    // Sense emmagatzematge (navegació privada...): es comença per l'arribada.
    return false;
  }
}

const senseSubscripcio = () => () => {};

export function Gresol() {
  const guardat = useSyncExternalStore(senseSubscripcio, llegirRitualGuardat, () => false);
  const [comencat, setComencat] = useState(false);

  function comencarRitual() {
    setComencat(true);
    try {
      sessionStorage.setItem(CLAU_RITUAL, "1");
    } catch {
      // Només és una comoditat.
    }
    window.scrollTo({ top: 0 });
  }

  return <VistaFinal ritual={comencat || guardat} onComencarRitual={comencarRitual} />;
}
