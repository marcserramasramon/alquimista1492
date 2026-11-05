"use client";

import { Pantalla } from "@/components/ui/Pantalla";
import { SegellCera } from "@/components/ui/SegellCera";
import { MISSATGE_SECRET, PROVA_CARTA } from "@/content/public/textos";

/** Document amb la instal·lació i els permisos (public/configuracio.html). */
const URL_CONFIGURACIO = "/configuracio.html";

/** 1. Ha arribat una carta: explica la prova i demana els permisos en tocar el botó. */
export function VistaCartaArribada({ onBuscar, onSaltar }: { onBuscar: () => void; onSaltar: () => void }) {
  return (
    <Pantalla>
      <div className="flex flex-1 animate-entrar flex-col items-center justify-center gap-6 text-center">
        <SegellCera className="w-36 -rotate-12 animate-segellar" />
        <h1 className="text-5xl font-bold">{PROVA_CARTA.arribada.titol}</h1>
        {PROVA_CARTA.arribada.paragrafs.map((p) => (
          <p key={p} className="text-lg text-ink-soft">
            {p}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-4 pt-6">
        <button type="button" onClick={onBuscar} className="btn btn-primari">
          {PROVA_CARTA.arribada.boto}
        </button>
        <button type="button" onClick={onSaltar} className="min-h-12 text-center font-bold text-ink-soft underline">
          {PROVA_CARTA.arribada.saltar}
        </button>
      </div>
    </Pantalla>
  );
}

/** 2. Rètols sobre la càmera mentre busquen la carta. */
export function VistaCartaCerca({
  fugida,
  arrossegar,
  potRendirSe,
  onRendirSe,
}: {
  fugida: boolean;
  arrossegar: boolean;
  potRendirSe: boolean;
  onRendirSe: () => void;
}) {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="rounded-xl bg-black/65 px-4 py-2 text-center text-lg font-bold text-paper">
          {fugida ? PROVA_CARTA.cerca.fugida : PROVA_CARTA.cerca.inici}
        </p>
        {arrossegar && (
          <p className="rounded-xl bg-black/65 px-3 py-2 text-center text-sm font-bold text-paper">
            {PROVA_CARTA.cerca.arrossegar}
          </p>
        )}
      </div>
      {potRendirSe && (
        <div className="absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] mx-auto w-full max-w-md px-4">
          <button type="button" onClick={onRendirSe} className="btn btn-fosc">
            {PROVA_CARTA.cerca.noLaTrobo}
          </button>
        </div>
      )}
    </>
  );
}

const ESQUERDES = [
  "M60 8 L54 34 L66 50 L56 70",
  "M56 70 L34 88 L26 110",
  "M66 50 L92 62 L112 56",
  "M56 70 L72 92 L68 114",
];

export type EstatMicroCarta = "esperant" | "demanant" | "actiu" | "no";

/** 3. La carta atrapada: el segell s'esquerda a mesura que criden el nom del poble. */
export function VistaCartaSegell({
  progres,
  nivell = 0,
  micro,
  trencat = false,
  potTrencarAMa,
  onTocarSegell,
  onTrencarAMa,
}: {
  /** Quant s'ha esquerdat el segell (0-1). */
  progres: number;
  /** Volum actual del crit (0-1): fa tremolar el segell. */
  nivell?: number;
  micro: EstatMicroCarta;
  trencat?: boolean;
  potTrencarAMa: boolean;
  onTocarSegell: () => void;
  onTrencarAMa: () => void;
}) {
  const tremolor = Math.min(1, nivell * 4) * 7;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-black/55 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onTocarSegell}
        disabled={micro !== "esperant"}
        aria-label={PROVA_CARTA.segell.tocar}
        className="relative flex aspect-[3/2] w-full max-w-sm animate-segellar items-center justify-center rounded-2xl border-[3px] border-ink bg-[#ead9b0] shadow-[0_6px_0_var(--ink)]"
      >
        <span
          className={`relative block w-36 transition-opacity duration-500 ${trencat ? "scale-125 opacity-0" : ""}`}
          style={{ transform: trencat ? undefined : `translate(${Math.sin(progres * 90) * tremolor}px, ${Math.cos(progres * 70) * tremolor * 0.6}px)` }}
        >
          <SegellCera className="w-full" />
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
            {ESQUERDES.map((d, i) => {
              const tram = Math.max(0, Math.min(1, progres * ESQUERDES.length - i));
              return (
                <path
                  key={d}
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="#1b0604"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="1"
                  strokeDashoffset={1 - tram}
                />
              );
            })}
          </svg>
        </span>
      </button>

      <p className="text-center text-3xl font-bold text-paper">{PROVA_CARTA.segell.titol}</p>
      <p aria-live="polite" className="min-h-14 text-center text-lg font-bold text-paper">
        {micro === "esperant" && PROVA_CARTA.segell.tocar}
        {micro === "demanant" && PROVA_CARTA.segell.demanant}
        {micro === "actiu" && PROVA_CARTA.segell.cridar}
        {micro === "no" && PROVA_CARTA.segell.senseMicro}
      </p>

      {potTrencarAMa && !trencat && (
        <button type="button" onClick={onTrencarAMa} className="btn btn-primari max-w-md">
          {PROVA_CARTA.segell.trencarAMa}
        </button>
      )}
    </div>
  );
}

/** 4. La carta oberta: només un tast; el missatge sencer el llegiran després d'entrar a l'equip. */
export function VistaCartaOberta({ onContinuar }: { onContinuar: () => void }) {
  return (
    <Pantalla className="justify-center gap-8">
      <div className="targeta flex animate-segellar flex-col gap-6 bg-[#fffdf7] p-6 text-center">
        {PROVA_CARTA.oberta.map((p) => (
          <p key={p} className="font-display text-3xl font-bold leading-snug">
            {p}
          </p>
        ))}
        <p className="text-right font-display text-3xl font-extrabold italic">{MISSATGE_SECRET.signatura}</p>
      </div>
      <button type="button" onClick={onContinuar} className="btn btn-primari animate-entrar [animation-delay:500ms]">
        Continuar →
      </button>
    </Pantalla>
  );
}

/** 5. Final de la prova: el telèfon ja s'ha provat, i si alguna cosa no va, el document de configuració. */
export function VistaTelefonValidat({
  fallades,
  comprovant = false,
  onContinuar,
  onRepetir,
}: {
  /** Noms del que no ha funcionat en aquest mòbil. */
  fallades: string[];
  /** Encara s'està comprovant alguna cosa en segon pla. */
  comprovant?: boolean;
  onContinuar: () => void;
  onRepetir: () => void;
}) {
  return (
    <Pantalla>
      <div className="flex flex-1 animate-entrar flex-col justify-center gap-5 text-center">
        <h1 className="text-5xl font-bold">{PROVA_CARTA.validat.titol}</h1>
        <p className="text-lg text-ink-soft">{PROVA_CARTA.validat.siNoVa}</p>
        <a href={URL_CONFIGURACIO} target="_blank" rel="noopener noreferrer" className="btn btn-secundari">
          {PROVA_CARTA.validat.document}
        </a>

        {fallades.length > 0 && (
          <div role="alert" className="targeta bg-[#fffdf7] p-4 text-left">
            <p className="etiqueta mb-2">{PROVA_CARTA.validat.fallades}</p>
            <ul className="flex flex-col gap-1 text-lg font-bold">
              {fallades.map((f) => (
                <li key={f}>✗ {f}</li>
              ))}
            </ul>
          </div>
        )}
        {comprovant && <p className="text-base text-ink-soft">{PROVA_CARTA.validat.comprovant}</p>}
        <p className="text-base text-ink-soft">{PROVA_CARTA.validat.so}</p>
      </div>

      <div className="flex flex-col gap-4 pt-6">
        <button type="button" onClick={onContinuar} className="btn btn-primari">
          {PROVA_CARTA.validat.continuar}
        </button>
        {fallades.length > 0 && (
          <button type="button" onClick={onRepetir} className="btn btn-secundari">
            {PROVA_CARTA.validat.repetir}
          </button>
        )}
      </div>
    </Pantalla>
  );
}
