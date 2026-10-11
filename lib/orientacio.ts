"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type EstatOrientacio = "inactiu" | "actiu" | "denegat" | "no-disponible";

export interface Mirada {
  /** Cap al qual apunta la càmera del darrere, en graus des del nord (0-360, sentit horari). */
  rumb: number;
  /** Inclinació de la càmera: 0 = horitzontal, positiu = mirant amunt. */
  elevacio: number;
}

interface EventOrientacio extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

type DeviceOrientationConPermis = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const RAD = Math.PI / 180;

/** Direcció de la càmera del darrere a partir dels angles del mòbil (W3C: Z·X'·Y''). */
function miradaDesAngles(alpha: number, beta: number, gamma: number): Mirada {
  const cA = Math.cos(alpha * RAD);
  const sA = Math.sin(alpha * RAD);
  const cB = Math.cos(beta * RAD);
  const sB = Math.sin(beta * RAD);
  const cG = Math.cos(gamma * RAD);
  const sG = Math.sin(gamma * RAD);
  // Eix -Z del mòbil al món (X = est, Y = nord, Z = amunt).
  const est = -(cA * sG + sA * sB * cG);
  const nord = -(sA * sG - cA * sB * cG);
  const amunt = -(cB * cG);
  const rumb = (Math.atan2(est, nord) / RAD + 360) % 360;
  const elevacio = Math.asin(Math.max(-1, Math.min(1, amunt))) / RAD;
  return { rumb, elevacio };
}

/** Diferència angular curta entre dos rumbs, en (-180, 180]. */
export function diferenciaRumb(a: number, b: number): number {
  const d = (((a - b) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

/**
 * Brúixola i inclinació del mòbil. La lectura viu en un ref (no en estat de React) perquè canvia
 * 60 cops per segon i només la fa servir el bucle de dibuix. `demanar()` s'ha de cridar des d'un
 * gest de l'usuari: iOS no deixa llegir els sensors sense permís explícit.
 * Si el mòbil no té sensors (ordinador), `estat` queda en "no-disponible" i la mirada la mou qui
 * cridi amb arrossegar (veure EscenaUlls).
 */
export function useOrientacio() {
  const mirada = useRef<Mirada | null>(null);
  const [estat, setEstat] = useState<EstatOrientacio>("inactiu");
  const [escoltant, setEscoltant] = useState(false);

  const demanar = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setEstat("no-disponible");
      return;
    }
    const Ctor = window.DeviceOrientationEvent as DeviceOrientationConPermis;
    if (typeof Ctor.requestPermission === "function") {
      try {
        const resposta = await Ctor.requestPermission();
        if (resposta !== "granted") {
          setEstat("denegat");
          return;
        }
      } catch {
        setEstat("denegat");
        return;
      }
    }
    setEscoltant(true);
  }, []);

  useEffect(() => {
    if (!escoltant) return;

    let rebut = false;
    // Si en un parell de segons no ha arribat cap lectura, no hi ha sensors (ordinador).
    const temps = setTimeout(() => {
      if (!rebut) setEstat((actual) => (actual === "actiu" ? actual : "no-disponible"));
    }, 2500);

    function alRebre(event: EventOrientacio, absolut: boolean) {
      const { alpha, beta, gamma } = event;
      if (beta === null || gamma === null) return;
      let alfa = alpha;
      if (typeof event.webkitCompassHeading === "number") {
        // iOS: l'alfa és relatiu; la brúixola real arriba a part.
        alfa = 360 - event.webkitCompassHeading;
      } else if (!absolut && !event.absolute) {
        // Android sense lectura absoluta: millor esperar la 'deviceorientationabsolute'.
        return;
      }
      if (alfa === null) return;
      rebut = true;
      setEstat("actiu");
      const nova = miradaDesAngles(alfa, beta, gamma);
      const anterior = mirada.current;
      if (!anterior) {
        mirada.current = nova;
        return;
      }
      // Filtre passabaixos: treu la tremolor de la brúixola sense endarrerir el gir.
      const k = 0.25;
      mirada.current = {
        rumb: (anterior.rumb + diferenciaRumb(nova.rumb, anterior.rumb) * k + 360) % 360,
        elevacio: anterior.elevacio + (nova.elevacio - anterior.elevacio) * k,
      };
    }

    const absoluta = (e: Event) => alRebre(e as EventOrientacio, true);
    const relativa = (e: Event) => alRebre(e as EventOrientacio, false);
    window.addEventListener("deviceorientationabsolute", absoluta, true);
    window.addEventListener("deviceorientation", relativa, true);
    return () => {
      clearTimeout(temps);
      window.removeEventListener("deviceorientationabsolute", absoluta, true);
      window.removeEventListener("deviceorientation", relativa, true);
    };
  }, [escoltant]);

  return { mirada, estat, demanar };
}
