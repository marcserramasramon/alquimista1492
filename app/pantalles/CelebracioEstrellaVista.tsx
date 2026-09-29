"use client";

import { useState } from "react";
import { CelebracioEstrella } from "@/components/vistes/CelebracioEstrella";
import type { ReactNode } from "react";

/**
 * Perquè la galeria pugui ensenyar el cicle sencer (animació → mode de reserva sense el
 * vídeo → tornada al hub de sota): un `useState` cal un component client a part, com
 * HubVideoVist.tsx (pantalles.tsx no té "use client").
 */
export function CelebracioEstrellaVista({ hubDeSota }: { hubDeSota: ReactNode }) {
  const [mostrar, setMostrar] = useState(true);
  return (
    <>
      {hubDeSota}
      {mostrar && <CelebracioEstrella onAcabat={() => setMostrar(false)} />}
    </>
  );
}
