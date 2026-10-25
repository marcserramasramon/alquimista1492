"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import { VistaEntradaEquip, type ModeEntradaEquip } from "@/components/vistes/VistaEntradaEquip";

// La càmera i el lector de QR només existeixen al navegador, i pesen: es carreguen en obrir l'escàner.
const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((m) => m.Scanner), {
  ssr: false,
  loading: () => <p className="flex h-full items-center justify-center text-lg text-paper">Obrint la càmera...</p>,
});

const ERRORS_CAMERA: Partial<Record<IScannerError["kind"], string>> = {
  "permission-denied": "No tenim permís per fer servir la càmera. Entreu el codi manualment.",
  "no-camera": "Aquest mòbil no té càmera. Entreu el codi manualment.",
  "in-use": "Una altra aplicació fa servir la càmera. Tanqueu-la o entreu el codi manualment.",
};

/** El QR porta una URL `/e/CODI`; també s'accepta el codi tal qual. */
function extreuCodi(text: string): string {
  const coincidencia = text.match(/\/e\/([A-Za-z0-9]+)\/?$/);
  return (coincidencia?.[1] ?? text).trim().toUpperCase();
}

export interface SeleccioEquipProps {
  /** Codi de la URL `/e/CODI` (si el mòbil ha escanejat el QR amb la càmera del sistema). */
  codiInicial?: string;
}

export function SeleccioEquip({ codiInicial }: SeleccioEquipProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ModeEntradaEquip>("camera");
  const [codi, setCodi] = useState("");
  const [enviant, setEnviant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = useCallback(
    async (text: string) => {
      setEnviant(true);
      setError(null);
      try {
        const res = await fetch("/api/equips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codi: extreuCodi(text) }),
        });
        if (res.ok) {
          router.replace("/espera");
          return;
        }
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No s'ha pogut entrar a l'equip");
      } catch {
        setError("Error de connexió. Torna-ho a provar.");
      } finally {
        setEnviant(false);
      }
    },
    [router]
  );

  // Si el mòbil ja té equip (p.ex. ha tornat enrere), va directament a l'espera.
  useEffect(() => {
    fetch("/api/equips", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const data: { meu: string | null } = await res.json();
        if (data.meu) router.replace("/espera");
      })
      .catch(() => {});
  }, [router]);

  // Des del QR de la URL: el codi ja hi és, s'entra sense fer res més.
  useEffect(() => {
    if (!codiInicial) return;
    const inicial = setTimeout(() => void entrar(codiInicial), 0);
    return () => clearTimeout(inicial);
  }, [codiInicial, entrar]);

  return (
    <VistaEntradaEquip
      mode={mode}
      codi={codi}
      enviant={enviant}
      error={error}
      onCodiChange={(nou) => {
        setCodi(nou);
        setError(null);
      }}
      onEnviarCodi={() => void entrar(codi)}
      onMode={(nou) => {
        setMode(nou);
        setError(null);
      }}
      camera={
        mode === "camera" ? (
          <Scanner
            onScan={(codis: IDetectedBarcode[]) => {
              const valor = codis[0]?.rawValue;
              if (valor && !enviant) void entrar(valor);
            }}
            onError={(e: IScannerError) => setError(ERRORS_CAMERA[e.kind] ?? "No s'ha pogut obrir la càmera. Entreu el codi manualment.")}
            constraints={{ facingMode: "environment" }}
            formats={["qr_code"]}
            paused={enviant}
            sound={false}
            components={{ finder: true }}
            styles={{ container: { width: "100%", height: "100%" }, video: { objectFit: "cover" } }}
          />
        ) : null
      }
    />
  );
}
