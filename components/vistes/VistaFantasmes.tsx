"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EscenaFantasmes, type ControlFantasmes } from "@/components/ar/EscenaFantasmes";
import type { EsdevenimentFantasma } from "@/components/ar/fantasmes/mon";
import { IntroduccioExtraAr } from "@/components/vistes/IntroduccioExtraAr";
import type { ExtraAr } from "@/content/public/extres";
import { useOrientacio } from "@/lib/orientacio";
import { aturarMicroAr, iniciarMicroAr, nivellMicroAr } from "@/lib/microAr";
import { aturarSoFantasmes, iniciarSoFantasmes, silenciarFantasmes, sonarFantasma } from "@/lib/sorollFantasmes";

export interface VistaFantasmesProps {
  extra: ExtraAr;
  /** Torna a la partida. */
  onTornar: () => void;
  /** Galeria de pantalles: comença directament a l'escena, sense demanar càmera ni sensors. */
  directa?: boolean;
}

type EstatCamera = "esperant" | "activa" | "no-disponible";

/** Fantasmes que hi ha alhora (els que es dissolen tornen més tard). */
const QUANTITAT = 3;
/** Temps de recàrrega del flaix (ms). */
const RECARREGA_FLAIX_MS = 2500;

/**
 * Extra de les ànimes (fita d'Ànima): càmera de fons i, a sobre, onze fantasmes al voltant del
 * jugador. És un divertimento: no desa res ni arriba al servidor. Un botó a baix a la dreta fa un
 * flaix, cridar els fa marxar, i quan un s'acosta o s'en enfoca un de prop, sona una veu.
 */
export function VistaFantasmes({ extra, onTornar, directa = false }: VistaFantasmesProps) {
  const [iniciat, setIniciat] = useState(directa);
  const [camera, setCamera] = useState<EstatCamera>("esperant");
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const { mirada, estat: estatSensors, demanar } = useOrientacio();
  const control = useRef<ControlFantasmes | null>(null);
  const alControl = useCallback((c: ControlFantasmes | null) => {
    control.current = c;
  }, []);
  const [silenci, setSilenci] = useState(false);
  const [micro, setMicro] = useState<"esperant" | "actiu" | "no">("esperant");
  const nivellMicro = useCallback(() => nivellMicroAr(), []);
  const [errorEscena, setErrorEscena] = useState(false);
  // Flaix: blanc de la pantalla un instant, recàrrega i cartell amb el resultat.
  const [blanc, setBlanc] = useState(false);
  const [recarregant, setRecarregant] = useState(false);
  const [cartell, setCartell] = useState<string | null>(null);
  const temporitzadors = useRef<ReturnType<typeof setTimeout>[]>([]);

  const alEsdeveniment = useCallback((e: EsdevenimentFantasma) => {
    sonarFantasma(e.pan);
  }, []);

  function programa(fn: () => void, ms: number) {
    temporitzadors.current.push(setTimeout(fn, ms));
  }

  // Els sensors, la càmera, el micròfon i el so es demanen en tocar el botó (iOS i Android ho exigeixen).
  async function començar() {
    iniciarSoFantasmes();
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
    // El micròfon, després de la càmera (cada un demana el seu permís).
    setMicro((await iniciarMicroAr()) ? "actiu" : "no");
  }

  function dispararFlaix() {
    if (recarregant) return;
    setRecarregant(true);
    programa(() => setRecarregant(false), RECARREGA_FLAIX_MS);
    setBlanc(true);
    programa(() => setBlanc(false), 420);
    try {
      navigator.vibrate?.(40);
    } catch {
      // Sense vibració: no passa res.
    }
    const n = control.current?.flaix() ?? 0;
    setCartell(n === 0 ? "El flaix no ha trobat res." : n === 1 ? "📷 Has captat una ànima." : `📷 Has captat ${n} ànimes.`);
    programa(() => setCartell(null), 2800);
  }

  useEffect(() => {
    if (camera === "activa" && video.current && flux.current) {
      video.current.srcObject = flux.current;
      video.current.play().catch(() => {});
    }
  }, [camera]);

  useEffect(() => {
    const t = temporitzadors.current;
    return () => {
      t.forEach(clearTimeout);
      flux.current?.getTracks().forEach((p) => p.stop());
      aturarMicroAr();
      aturarSoFantasmes();
    };
  }, []);

  const sensorsFallen = estatSensors === "no-disponible" || estatSensors === "denegat";
  // Sense WebGL, MonFantasmes falla en crear-se i l'escena avisa amb onError.
  const sensePantalla = errorEscena;

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black text-paper">
      {camera === "activa" && (
        <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full object-cover" />
      )}

      {iniciat && !sensePantalla && (
        <EscenaFantasmes
          mirada={mirada}
          arrossegar={estatSensors !== "actiu"}
          nivellMicro={micro === "actiu" ? nivellMicro : null}
          quantitat={QUANTITAT}
          alEsdeveniment={alEsdeveniment}
          alControl={alControl}
          onError={() => setErrorEscena(true)}
        />
      )}

      {blanc && <div aria-hidden className="pointer-events-none absolute inset-0 animate-esvair bg-white" />}

      {iniciat && (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 pr-24 pl-5 pt-[max(1rem,env(safe-area-inset-top))]">
          {sensePantalla && (
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
          {cartell && (
            <p role="status" className="animate-entrar rounded-xl bg-black/75 px-4 py-2 text-center text-base font-bold">
              {cartell}
            </p>
          )}
        </div>
      )}

      {iniciat && !directa && (
        <button
          type="button"
          aria-pressed={silenci}
          onClick={() => {
            silenciarFantasmes(!silenci);
            setSilenci(!silenci);
          }}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex h-12 min-w-12 items-center justify-center rounded-full border-2 border-paper-3/60 bg-black/60 px-4 text-lg font-bold"
        >
          {silenci ? "🔇 Sense so" : "🔊 So"}
        </button>
      )}

      {iniciat && micro === "no" && !directa && (
        <div className="absolute inset-x-0 bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+5.25rem)] mx-auto w-full max-w-md px-4">
          <button type="button" onClick={() => control.current?.crida()} className="btn btn-primari">
            📣 Cridar!
          </button>
        </div>
      )}

      {iniciat ? (
        <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] mx-auto flex w-full max-w-md items-center gap-3 px-4">
          <button type="button" onClick={onTornar} className="btn btn-fosc flex-1">
            Tornar al joc
          </button>
          <button
            type="button"
            onClick={dispararFlaix}
            disabled={recarregant}
            aria-label="Fer un flaix"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[3px] border-paper bg-white/15 text-3xl backdrop-blur-sm transition-opacity active:scale-95 disabled:opacity-40"
          >
            📷
          </button>
        </div>
      ) : (
        <IntroduccioExtraAr intro={extra.introduccio} onComençar={començar} onTornar={onTornar} />
      )}
    </div>
  );
}
