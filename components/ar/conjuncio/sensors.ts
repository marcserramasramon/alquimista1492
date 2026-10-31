"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { baseDesAngles, suavitza, type Base } from "@/lib/conjuncio/cel";

/**
 * Sensors del mòbil per al prototip: orientació completa (cap a on mira la càmera i com està girada).
 * La lectura viu en un ref perquè canvia 60 cops per segon. `demanar()` s'ha de cridar des d'un gest de
 * l'usuari (iOS no deixa llegir els sensors sense permís). Si en 2,5 s no arriba cap lectura, no hi ha
 * sensors (ordinador) i `estat` passa a «no-disponible».
 */
export type EstatSensors = "inactiu" | "actiu" | "denegat" | "no-disponible";

interface EventOrientacio extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

type DeviceOrientationConPermis = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export function useSensorsCel() {
  const base = useRef<Base | null>(null);
  const [estat, setEstat] = useState<EstatSensors>("inactiu");
  const [escoltant, setEscoltant] = useState(false);

  const demanar = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setEstat("no-disponible");
      return;
    }
    const Ctor = window.DeviceOrientationEvent as DeviceOrientationConPermis;
    if (typeof Ctor.requestPermission === "function") {
      try {
        if ((await Ctor.requestPermission()) !== "granted") {
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
        // Android sense lectura absoluta: s'espera la 'deviceorientationabsolute'.
        return;
      }
      if (alfa === null) return;
      rebut = true;
      setEstat("actiu");
      const nova = baseDesAngles(alfa, beta, gamma);
      // Filtre passabaixos: treu la tremolor de la brúixola sense endarrerir el gir.
      base.current = base.current ? suavitza(base.current, nova, 0.3) : nova;
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

  return { base, estat, demanar };
}
