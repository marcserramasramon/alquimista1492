"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VistaUbicacio } from "@/components/vistes/VistaUbicacio";
import { desarDecisioUbicacio } from "@/lib/ubicacio";

/**
 * Demana el permís de GPS només després que l'equip hagi acceptat. Si el
 * navegador el denega (o no n'hi ha), es desa "no" i el joc continua igual.
 */
export function ConsentimentUbicacio() {
  const router = useRouter();
  const [demanant, setDemanant] = useState(false);

  function acabar(decisio: "si" | "no") {
    desarDecisioUbicacio(decisio);
    router.push("/joc");
  }

  function acceptar() {
    if (!navigator.geolocation) {
      acabar("no");
      return;
    }
    setDemanant(true);
    navigator.geolocation.getCurrentPosition(
      () => acabar("si"),
      (error) => acabar(error.code === error.PERMISSION_DENIED ? "no" : "si"),
      { enableHighAccuracy: true, timeout: 20_000 }
    );
  }

  return <VistaUbicacio demanant={demanant} onAcceptar={acceptar} onRebutjar={() => acabar("no")} />;
}
