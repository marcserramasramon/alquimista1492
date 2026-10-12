"use client";

import { useEffect, useRef, useState } from "react";
import { EscenaGuies } from "@/components/ar/EscenaGuies";
import { IntroduccioExtraAr } from "@/components/vistes/IntroduccioExtraAr";
import { rumbCami, type ExtraAr } from "@/content/public/extres";
import { diferenciaRumb, useOrientacio } from "@/lib/orientacio";

export interface VistaGuiesAnimesProps {
  /** L'extra (content/public/extres.ts): en surten el camí i l'explicació. */
  extra: ExtraAr;
  /** Torna a la partida. */
  onTornar: () => void;
  /** Galeria de pantalles: comença directament a l'escena, sense demanar càmera ni sensors. */
  directa?: boolean;
}

type EstatCamera = "esperant" | "activa" | "no-disponible";

/** Ànimes que volen camí avall alhora. */
const QUANTITAT = 7;
/** A partir de quants graus de desviació s'avisa de girar-se. */
const MARGE_GRAUS = 40;

/**
 * Les ànimes guia (Camí de Malla, cap a la fita d'Ànima): càmera de fons i, a sobre, ànimes petites
 * que surten d'entre els jugadors i volen en línia recta pel camí perquè els segueixin. Una primera
 * pantalla ho explica. És un extra: no desa res ni arriba al servidor.
 */
export function VistaGuiesAnimes({ extra, onTornar, directa = false }: VistaGuiesAnimesProps) {
  const rumb = rumbCami(extra) ?? 0;
  const [iniciat, setIniciat] = useState(directa);
  const [camera, setCamera] = useState<EstatCamera>("esperant");
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const { mirada, estat: estatSensors, demanar } = useOrientacio();
  const [errorEscena, setErrorEscena] = useState(false);
  // Cap a on s'ha de girar el jugador per veure el camí (null si ja hi mira o no hi ha brúixola).
  const [girar, setGirar] = useState<"dreta" | "esquerra" | null>(null);

  // Els sensors i la càmera es demanen en tocar el botó (iOS i Android ho exigeixen).
  async function començar() {
    setIniciat(true);
    await demanar();
    try {
      flux.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCamera("activa");
    } catch {
      setCamera("no-disponible");
    }
  }

  useEffect(() => {
    if (camera === "activa" && video.current && flux.current) {
      video.current.srcObject = flux.current;
      video.current.play().catch(() => {});
    }
  }, [camera]);

  useEffect(() => {
    if (!iniciat) return;
    const id = setInterval(() => {
      const lectura = mirada.current;
      if (!lectura) return setGirar(null);
      const dif = diferenciaRumb(rumb, lectura.rumb);
      setGirar(Math.abs(dif) < MARGE_GRAUS ? null : dif > 0 ? "dreta" : "esquerra");
    }, 400);
    return () => clearInterval(id);
  }, [iniciat, rumb, mirada]);

  useEffect(() => {
    return () => flux.current?.getTracks().forEach((p) => p.stop());
  }, []);

  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && !errorEscena && (
        <EscenaGuies
          mirada={mirada}
          arrossegar={estatSensors !== "actiu"}
          rumb={rumb}
          quantitat={QUANTITAT}
          onError={() => setErrorEscena(true)}
        />
      )}

      {iniciat && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {errorEscena && (
            <p className="rounded-xl bg-black/70 px-3 py-2 text-center text-sm font-bold">
              Aquest mòbil no pot mostrar les ànimes (falta WebGL).
            </p>
          )}
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
          {!errorEscena && (
            <p role="status" className="rounded-xl bg-black/70 px-4 py-2 text-center text-base font-bold">
              {girar === "dreta"
                ? "Gireu-vos cap a la dreta ➡️ per veure les ànimes"
                : girar === "esquerra"
                  ? "⬅️ Gireu-vos cap a l'esquerra per veure les ànimes"
                  : "👻 Seguiu les ànimes pel camí"}
            </p>
          )}
        </div>
      )}

      {iniciat ? (
        <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] mx-auto w-full max-w-md px-4">
          <button type="button" onClick={onTornar} className="btn btn-fosc w-full">
            Tornar al joc
          </button>
        </div>
      ) : (
        <IntroduccioExtraAr intro={extra.introduccio} onComençar={començar} onTornar={onTornar} />
      )}
    </div>
  );
}
