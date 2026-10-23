"use client";

import { useEffect, useRef, useState } from "react";
import {
  DISTANCIA_PROVA_FORAT_M,
  EscenaTerra,
  estatTerra,
  PUNT_FORAT,
  RADI_AMFORES,
  type PosicioEquip,
} from "@/components/ar/EscenaTerra";
import { distanciaMetres } from "@/lib/ubicacio";
import { IntroduccioExtraAr } from "@/components/vistes/IntroduccioExtraAr";
import { rumbCami, type ExtraAr } from "@/content/public/extres";
import { diferenciaRumb, useOrientacio } from "@/lib/orientacio";

export interface VistaTerraProps {
  /** L'extra (content/public/extres.ts): `cami` és de la fita a les àmfores. */
  extra: ExtraAr;
  /** Torna a la partida. */
  onTornar: () => void;
  /** Galeria de pantalles: comença directament a l'escena, sense demanar càmera, sensors ni ubicació. */
  directa?: boolean;
}

type EstatCamera = "esperant" | "activa" | "no-disponible";

/** A partir de quants graus de desviació s'avisa de girar-se cap a les àmfores. */
const MARGE_GRAUS = 40;

/** Frase que diu on és l'equip respecte el camí, i cap a on girar-se si les àmfores no són a la vista. */
interface Guia {
  missatge: string;
  girar: "dreta" | "esquerra" | null;
}

/**
 * La Terra (Planes Bones): càmera de fons i, a sobre, l'esquerda de llum que porta de la fita fins a
 * les àmfores, amb les runes i la brúixola. És un extra: no desa res ni arriba al servidor. Demana la
 * ubicació només per saber on és l'equip; no s'envia enlloc.
 */
export function VistaTerra({ extra, onTornar, directa = false }: VistaTerraProps) {
  const cami = extra.cami;
  const rumb = rumbCami(extra) ?? 0;
  const [iniciat, setIniciat] = useState(directa);
  const [camera, setCamera] = useState<EstatCamera>("esperant");
  const [guia, setGuia] = useState<Guia>({ missatge: "📍 Esperant la ubicació…", girar: null });
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const posicio = useRef<PosicioEquip>(null);
  // Motiu pel qual no hi ha ubicació (permís, GPS...), perquè es vegi a la pantalla.
  const ubicacioError = useRef<string | null>(null);
  const { mirada, estat: estatSensors, demanar } = useOrientacio();

  // Els sensors, la càmera i la ubicació es demanen en tocar el botó (iOS i Android ho exigeixen).
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

  // Ubicació contínua: només cal mentre l'extra és obert. A la galeria, l'equip és a la fita.
  useEffect(() => {
    if (directa && cami) {
      // A la galeria, l'equip és a DISTANCIA_PROVA_FORAT_M metres del monticle, cap a la fita.
      const f = PUNT_FORAT;
      const dist = distanciaMetres({ lat: f.latitud, lng: f.longitud }, { lat: cami.des.latitud, lng: cami.des.longitud });
      const k = Math.min(1, DISTANCIA_PROVA_FORAT_M / Math.max(1, dist));
      posicio.current = {
        lat: f.latitud + (cami.des.latitud - f.latitud) * k,
        lng: f.longitud + (cami.des.longitud - f.longitud) * k,
      };
      return;
    }
    if (!iniciat) return;
    if (!navigator.geolocation) {
      ubicacioError.current = "📍 Aquest navegador no té ubicació.";
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        posicio.current = { lat: p.coords.latitude, lng: p.coords.longitude };
        ubicacioError.current = null;
      },
      (error) => {
        // Codi 1: permís denegat; 2: posició no disponible; 3: temps esgotat (es torna a provar sola).
        ubicacioError.current =
          error.code === 1
            ? "📍 No hi ha permís de ubicació: permeteu-la al navegador i recarregueu."
            : error.code === 2
              ? "📍 El navegador no pot trobar la ubicació (GPS no disponible)."
              : null;
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [iniciat, directa]);

  // Missatge de guia: es recalcula cada 400 ms (no cada fotograma).
  useEffect(() => {
    if (!iniciat || !cami) return;
    const id = setInterval(() => {
      const e = estatTerra(posicio.current, cami.des, cami.cap);
      if (!e) {
        return setGuia({ missatge: ubicacioError.current ?? "📍 Esperant la ubicació: cal que el mòbil us localitzi.", girar: null });
      }
      const lectura = mirada.current;
      const dif = lectura ? diferenciaRumb(e.rumbAmfores, lectura.rumb) : 0;
      const girar = !lectura || Math.abs(dif) < MARGE_GRAUS ? null : dif > 0 ? "dreta" : "esquerra";
      const missatge =
        e.distanciaAmfores < RADI_AMFORES
          ? "📍 Ja sou al lloc: mireu a terra."
          : e.ressonancia >= 0.6
            ? "🌊 Bé: seguiu la brúixola cap al lloc."
            : e.ressonancia >= 0.25
              ? "✨ Acosteu-vos al camí: el triangle vibra quan hi sou."
              : "🌀 Torneu al camí: la brúixola s'apaga quan us en separeu.";
      setGuia({ missatge, girar });
    }, 400);
    return () => clearInterval(id);
  }, [iniciat, cami, mirada]);

  useEffect(() => {
    return () => flux.current?.getTracks().forEach((p) => p.stop());
  }, []);

  if (!cami) return null;
  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && (
        <EscenaTerra
          mirada={mirada}
          posicio={posicio}
          arrossegar={estatSensors !== "actiu"}
          rumb={rumb}
          fita={cami.des}
          amfores={cami.cap}
        />
      )}

      {iniciat && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {camera === "no-disponible" && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              No hi ha càmera: només es veu el camí sobre la foscor.
            </p>
          )}
          {sensorsFallen && (
            <p className="rounded-xl bg-black/60 px-3 py-2 text-center text-sm font-bold">
              {estatSensors === "denegat"
                ? "Sense permís per a la brúixola: arrossegueu el dit per mirar al voltant."
                : "Arrossegueu el dit per mirar al voltant."}
            </p>
          )}
          <p role="status" className="rounded-xl bg-black/70 px-4 py-2 text-center text-base font-bold">
            {guia.missatge}
          </p>
          {guia.girar && (
            <p className="rounded-xl bg-black/60 px-3 py-1.5 text-center text-sm font-bold">
              {guia.girar === "dreta" ? "➡️ Gireu-vos cap a la dreta per veure les àmfores" : "⬅️ Gireu-vos cap a l'esquerra per veure les àmfores"}
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
