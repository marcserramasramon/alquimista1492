"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EscenaUlls } from "@/components/ar/EscenaUlls";
import { estatFigura3DInicial, Figura3D, webglDisponible } from "@/components/ar/Figura3D";
import type { ExtraAr } from "@/content/public/extres";
import { useOrientacio } from "@/lib/orientacio";
import { aturarSoAr, iniciarSoAr, sonarPassesAr } from "@/lib/sorollAr";

export interface VistaExtraArProps {
  extra: ExtraAr;
  /** Torna a la partida. */
  onTornar: () => void;
  /** Galeria de pantalles: comença directament a l'escena, sense demanar càmera ni sensors. */
  directa?: boolean;
}

type EstatCamera = "esperant" | "activa" | "no-disponible";

/**
 * Extra de realitat augmentada: càmera de fons i, a sobre, l'escena de l'extra. És un
 * divertimento: no desa res ni arriba al servidor. Si no hi ha càmera o brúixola, l'escena
 * continua amb fons negre i, sense brúixola, es mira arrossegant el dit.
 */
export function VistaExtraAr({ extra, onTornar, directa = false }: VistaExtraArProps) {
  const [iniciat, setIniciat] = useState(directa);
  const [camera, setCamera] = useState<EstatCamera>("esperant");
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const { mirada, estat: estatSensors, demanar } = useOrientacio();
  const [figura3D, setFigura3D] = useState(false);
  const estatFigura = useRef(estatFigura3DInicial());
  // ?debug=1 a l'adreça: mostra a la pantalla l'estat de la figura i de la mirada.
  const depuracio = useRef("");
  const [textDepuracio, setTextDepuracio] = useState<string | null>(null);
  const alPasses = useCallback((pan: number, duradaMs: number) => sonarPassesAr(pan, duradaMs), []);

  // Els sensors, la càmera i el so es demanen en tocar el botó (iOS i Android ho exigeixen).
  async function començar() {
    iniciarSoAr();
    // Figura en 3D si l'extra ho demana, no s'ha forçat la plana (?figura=plana) i el mòbil pot.
    const forcadaPlana = new URLSearchParams(window.location.search).get("figura") === "plana";
    setFigura3D(extra.figura === "3d" && !forcadaPlana && webglDisponible());
    if (new URLSearchParams(window.location.search).get("debug") === "1") setTextDepuracio("");
    setIniciat(true);
    await demanar();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      flux.current = stream;
      setCamera("activa");
    } catch {
      setCamera("no-disponible");
    }
  }

  // Galeria de pantalles: comença directament a l'escena, així que la decisió es pren en muntar-se.
  useEffect(() => {
    if (!directa) return;
    queueMicrotask(() => setFigura3D(extra.figura === "3d" && webglDisponible()));
  }, [directa, extra.figura]);

  const depuracioActiva = textDepuracio !== null;
  useEffect(() => {
    if (!depuracioActiva) return;
    const interval = setInterval(() => setTextDepuracio(depuracio.current), 200);
    return () => clearInterval(interval);
  }, [depuracioActiva]);

  useEffect(() => {
    if (camera === "activa" && video.current && flux.current) {
      video.current.srcObject = flux.current;
      video.current.play().catch(() => {});
    }
  }, [camera]);

  useEffect(() => {
    return () => {
      flux.current?.getTracks().forEach((t) => t.stop());
      aturarSoAr();
    };
  }, []);

  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && <EscenaUlls
          mirada={mirada}
          arrossegar={estatSensors !== "actiu"}
          figura3D={figura3D ? estatFigura : null}
          depuracio={textDepuracio === null ? null : depuracio}
          alPasses={alPasses}
        />}

      {textDepuracio !== null && (
        <pre className="pointer-events-none absolute inset-x-2 bottom-24 z-10 rounded-lg bg-black/70 p-2 font-mono text-xs leading-tight text-lime-300">
          {textDepuracio}
        </pre>
      )}

      {iniciat && figura3D && <Figura3D estat={estatFigura} onError={() => setFigura3D(false)} />}

      {iniciat && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {camera === "no-disponible" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              No hi ha càmera: només es veu la foscor.
            </p>
          )}
          {sensorsFallen && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              {estatSensors === "denegat"
                ? "Sense permís per a la brúixola: arrossegueu el dit per mirar al voltant."
                : "Arrossegueu el dit per mirar al voltant."}
            </p>
          )}
        </div>
      )}

      {iniciat ? (
        <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] mx-auto w-full max-w-md px-4">
          <button type="button" onClick={onTornar} className="btn btn-fosc">
            Tornar al joc
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex w-full max-w-md flex-col items-center gap-5 text-center">
            <p className="font-display text-5xl font-extrabold text-paper">{extra.introduccio.titol}</p>
            <p className="text-lg leading-snug text-paper-3">{extra.introduccio.text}</p>
            <p className="text-sm text-paper-3/80">
              És només un extra per divertir-vos: no canvia res de la partida.
            </p>
            <button type="button" onClick={començar} className="btn btn-primari w-full">
              {extra.introduccio.boto}
            </button>
            <button type="button" onClick={onTornar} className="btn btn-fosc w-full">
              Tornar al joc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
