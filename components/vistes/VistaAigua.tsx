"use client";

import { useEffect, useRef, useState } from "react";
import { EscenaAigua } from "@/components/ar/EscenaAigua";
import { precarregaContorn, type EstatContorn } from "@/components/ar/foc/contorn";
import { IntroduccioExtraAr } from "@/components/vistes/IntroduccioExtraAr";
import type { ExtraAr } from "@/content/public/extres";
import { useOrientacio } from "@/lib/orientacio";
import { aturarSoAigua, iniciarSoAigua, silenciarAigua } from "@/lib/sorollArAigua";

export interface VistaAiguaProps {
  extra: ExtraAr;
  /** Torna a la partida. */
  onTornar: () => void;
  /** Galeria de pantalles: comença directament a l'escena, sense demanar càmera ni sensors. */
  directa?: boolean;
}

type EstatCamera = "esperant" | "activa" | "no-disponible";

/**
 * Extra de l'aigua (fita de l'Aigua): càmera de fons i, a sobre, uns ràpids de riu que passen pels peus,
 * amb les persones per damunt de l'aigua. És un divertimento: no desa res ni arriba al servidor.
 */
export function VistaAigua({ extra, onTornar, directa = false }: VistaAiguaProps) {
  const [iniciat, setIniciat] = useState(directa);
  const [camera, setCamera] = useState<EstatCamera>("esperant");
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const { mirada, estat: estatSensors, demanar } = useOrientacio();
  const [silenci, setSilenci] = useState(false);
  const [contorn, setContorn] = useState<EstatContorn>("carregant");

  // Els sensors, la càmera i el so es demanen en tocar el botó (iOS i Android ho exigeixen).
  async function començar() {
    iniciarSoAigua();
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

  // Mentre es llegeix la introducció, ja es baixa el model dels contorns.
  useEffect(() => {
    precarregaContorn();
  }, []);

  useEffect(() => {
    if (camera === "activa" && video.current && flux.current) {
      video.current.srcObject = flux.current;
      video.current.play().catch(() => {});
    }
  }, [camera]);

  useEffect(() => {
    return () => {
      flux.current?.getTracks().forEach((p) => p.stop());
      aturarSoAigua();
    };
  }, []);

  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && (
        <EscenaAigua
          mirada={mirada}
          arrossegar={estatSensors !== "actiu"}
          video={video}
          alEstatContorn={setContorn}
        />
      )}

      {iniciat && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 pr-24 pl-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {camera === "no-disponible" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              No hi ha càmera: només es veu l'aigua.
            </p>
          )}
          {camera === "activa" && contorn === "carregant" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">Preparant l'aigua…</p>
          )}
          {camera === "activa" && contorn === "no" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              Aquest mòbil no pot separar les persones (o no hi ha xarxa): l'aigua us passarà per damunt.
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

      {iniciat && !directa && (
        <button
          type="button"
          aria-pressed={silenci}
          onClick={() => {
            silenciarAigua(!silenci);
            setSilenci(!silenci);
          }}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex h-12 min-w-12 items-center justify-center rounded-full border-2 border-paper-3/60 bg-black/60 px-4 text-lg font-bold"
        >
          {silenci ? "🔇 Sense so" : "🔊 So"}
        </button>
      )}

      {iniciat ? (
        <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] mx-auto w-full max-w-md px-4">
          <button type="button" onClick={onTornar} className="btn btn-fosc">
            Tornar al joc
          </button>
        </div>
      ) : (
        <IntroduccioExtraAr intro={extra.introduccio} onComençar={començar} onTornar={onTornar} />
      )}
    </div>
  );
}
