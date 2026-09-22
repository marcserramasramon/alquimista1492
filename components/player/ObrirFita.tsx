"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import { VistaObrirFita, type ModeObrirFita } from "@/components/vistes/VistaObrirFita";

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

export interface ObrirFitaProps {
  /** El servidor ha obert la fita (pot ser una altra, si el QR és d'una altra fita). */
  onOberta: (estacioId: string) => void;
  onTancar: () => void;
}

/** Escàner del QR del cartell i entrada manual del codi. El servidor és qui obre la fita. */
export function ObrirFita({ onOberta, onTancar }: ObrirFitaProps) {
  const [mode, setMode] = useState<ModeObrirFita>("camera");
  const [codi, setCodi] = useState("");
  const [enviant, setEnviant] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function obrir(text: string, via: "qr" | "codi") {
    if (enviant) return;
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/obrir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codi: text, via }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.estacioId === "string") {
        onOberta(data.estacioId);
        return;
      }
      setError(data.error ?? "No s'ha pogut obrir la fita");
    } catch {
      setError("Error de connexió. Torneu-ho a provar.");
    } finally {
      setEnviant(false);
    }
  }

  return (
    <VistaObrirFita
      mode={mode}
      codi={codi}
      enviant={enviant}
      error={error}
      onCodiChange={(nou) => {
        setCodi(nou);
        setError(null);
      }}
      onEnviarCodi={() => obrir(codi, "codi")}
      onMode={(nou) => {
        setMode(nou);
        setError(null);
      }}
      onTancar={onTancar}
      camera={
        <Scanner
          onScan={(codis: IDetectedBarcode[]) => {
            const valor = codis[0]?.rawValue;
            if (valor) obrir(valor, "qr");
          }}
          onError={(e: IScannerError) => setError(ERRORS_CAMERA[e.kind] ?? "No s'ha pogut obrir la càmera. Entreu el codi manualment.")}
          constraints={{ facingMode: "environment" }}
          formats={["qr_code"]}
          paused={enviant}
          sound={false}
          components={{ finder: true }}
          styles={{ container: { width: "100%", height: "100%" }, video: { objectFit: "cover" } }}
        />
      }
    />
  );
}
