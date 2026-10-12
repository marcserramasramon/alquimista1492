"use client";

import { useEffect, useRef, useState } from "react";
import { EscenaAigua } from "@/components/ar/EscenaAigua";
import { precarregaContorn, type EstatContorn } from "@/components/ar/foc/contorn";
import { IntroduccioExtraAr } from "@/components/vistes/IntroduccioExtraAr";
import { rumbCami, type ExtraAr } from "@/content/public/extres";
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
  const [sense3d, setSense3d] = useState(false);
  // Calibratge de la direcció del riu: el jugador mira al llarg del carrer i toca «Aquí».
  const [calibrat, setCalibrat] = useState(false);
  const [rumbCalibrat, setRumbCalibrat] = useState<number | null>(null);

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

  // Amb brúixola, abans de l'escena es demana calibrar (la brúixola pot errar 10-20°). Sense sensors,
  // l'escena usa el rumb del carrer de la configuració i es mira arrossegant el dit.
  const volCalibrar =
    !directa && !!extra.calibratge && estatSensors !== "no-disponible" && estatSensors !== "denegat";
  const esperant = iniciat && volCalibrar && !calibrat;
  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && !esperant && (
        <EscenaAigua
          mirada={mirada}
          arrossegar={estatSensors !== "actiu"}
          video={video}
          alEstatContorn={setContorn}
          alError={() => setSense3d(true)}
          rumbRiu={rumbCalibrat ?? rumbCami(extra)}
          ampleRiu={extra.ampleRiu}
          explanada={extra.explanada}
        />
      )}

      {iniciat && !esperant && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 pr-24 pl-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {sense3d && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              Aquest mòbil no pot dibuixar l'aigua en 3D.
            </p>
          )}
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

      {esperant && (
        <>
          {estatSensors === "actiu" && (
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-0 border-l-2 border-dashed border-paper/80" />
          )}
          <div className="absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] mx-auto w-full max-w-md pr-24 pl-4">
            <div className="rounded-2xl bg-black/70 px-4 py-3 text-center">
              {estatSensors === "actiu" ? (
                <>
                  <p className="text-lg font-extrabold">Centrar el riu</p>
                  <p className="mt-1 text-base">{extra.calibratge?.indicacio}</p>
                </>
              ) : (
                <p className="text-base font-bold">Preparant la brúixola…</p>
              )}
            </div>
          </div>
          {estatSensors === "actiu" && (
            <div className="absolute inset-x-0 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+4.5rem)] mx-auto flex w-full max-w-md flex-col gap-2 px-4">
              <button
                type="button"
                className="btn btn-primari"
                onClick={() => {
                  if (!mirada.current) return;
                  setRumbCalibrat(mirada.current.rumb);
                  setCalibrat(true);
                }}
              >
                Aquí
              </button>
              <button type="button" className="btn btn-secundari" onClick={() => setCalibrat(true)}>
                Saltar (usa la direcció del mapa)
              </button>
            </div>
          )}
        </>
      )}

      {iniciat && !esperant && volCalibrar && (
        <button
          type="button"
          onClick={() => {
            setRumbCalibrat(null);
            setCalibrat(false);
          }}
          className="absolute top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] right-4 z-10 flex h-10 items-center justify-center rounded-full border-2 border-paper-3/60 bg-black/60 px-3 text-sm font-bold"
        >
          🧭 Centrar el riu
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
