"use client";

import { useEffect, useRef, useState } from "react";
import { EscenaAura } from "@/components/ar/EscenaAura";
import { precarregaContorn, type EstatContorn } from "@/components/ar/aura/contorn";
import { IntroduccioExtraAr } from "@/components/vistes/IntroduccioExtraAr";
import type { ExtraAr } from "@/content/public/extres";

export interface VistaAuraProps {
  extra: ExtraAr;
  /** Torna a la partida. */
  onTornar: () => void;
  /** Galeria de pantalles: comença directament a l'escena, sense demanar càmera. */
  directa?: boolean;
}

type EstatCamera = "esperant" | "activa" | "no-disponible";

/**
 * Extra de la llum (fita de Foc): càmera de fons i, sobre les persones, un filtre difús taronja-vermell
 * que realça els nuclis del cos. No hi ha res més a l'escena. És un divertimento: no desa res ni arriba
 * al servidor.
 */
export function VistaAura({ extra, onTornar, directa = false }: VistaAuraProps) {
  const [iniciat, setIniciat] = useState(directa);
  const [camera, setCamera] = useState<EstatCamera>("esperant");
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const [contorn, setContorn] = useState<EstatContorn>("carregant");

  // ?debug=1 a l'adreça: mostra a la pantalla l'estat del model.
  const depuracio = useRef("");
  const [textDepuracio, setTextDepuracio] = useState<string | null>(null);

  // La càmera es demana en tocar el botó (iOS i Android ho exigeixen).
  async function començar() {
    if (new URLSearchParams(window.location.search).get("debug") === "1") setTextDepuracio("");
    setIniciat(true);
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

  const depuracioActiva = textDepuracio !== null;
  useEffect(() => {
    if (!depuracioActiva) return;
    const interval = setInterval(() => setTextDepuracio(depuracio.current), 300);
    return () => clearInterval(interval);
  }, [depuracioActiva]);

  // Mentre es llegeix la introducció, ja es baixa el model.
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
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && <EscenaAura video={video} alEstatContorn={setContorn} depuracio={depuracioActiva ? depuracio : null} />}

      {textDepuracio !== null && (
        <pre className="pointer-events-none absolute inset-x-2 bottom-24 z-10 whitespace-pre-wrap rounded-lg bg-black/70 p-2 font-mono text-xs leading-tight text-lime-300">
          {textDepuracio}
        </pre>
      )}

      {iniciat && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {camera === "no-disponible" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              No hi ha càmera: no hi ha res a il·luminar.
            </p>
          )}
          {camera === "activa" && contorn === "carregant" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">Encenent la llum…</p>
          )}
          {camera === "activa" && contorn === "no" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              Aquest mòbil no pot detectar les persones (o no hi ha xarxa).
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
        <IntroduccioExtraAr intro={extra.introduccio} onComençar={començar} onTornar={onTornar} />
      )}
    </div>
  );
}
