"use client";

import { useState } from "react";
import { MapaEquip, type EstacioMapa, type MarcadorMapa } from "@/components/player/MapaEquip";
import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import { Narracio } from "@/components/ui/Narracio";
import { ELEMENTS } from "@/content/public/estacions";
import { ESTRELLA_COMPLETA } from "@/content/public/textos";

export interface VistaHubProps {
  nomEquip: string;
  estacions: EstacioMapa[];
  totesResoltes: boolean;
  onAnarEstacio: (estacio: EstacioMapa) => void;
  onAnarFinal: () => void;
  /** Tornar a llegir el missatge secret de l'inici. */
  onLlegirMissatge: () => void;
  /** Fita seleccionada en obrir la vista (mostra la seva fitxa). */
  seleccionadaInicialId?: string | null;
  /** Posició del màster (si la comparteix) i la del mateix equip. */
  marcadors?: MarcadorMapa[];
  /** Fita que el GPS acaba d'obrir en arribar-hi: se'n mostra la fitxa amb l'avís. */
  fitaArribadaId?: string | null;
}

const ROMANS = ["I", "II", "III", "IV", "V", "VI"];

export function VistaHub({
  nomEquip,
  estacions,
  totesResoltes,
  onAnarEstacio,
  onAnarFinal,
  onLlegirMissatge,
  seleccionadaInicialId = null,
  marcadors,
  fitaArribadaId = null,
}: VistaHubProps) {
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(seleccionadaInicialId ?? fitaArribadaId);
  // Quan el GPS obre una fita nova, se'n mostra la fitxa encara que n'hi hagués una altra de triada.
  const [arribadaVista, setArribadaVista] = useState(fitaArribadaId);
  if (fitaArribadaId !== arribadaVista) {
    setArribadaVista(fitaArribadaId);
    if (fitaArribadaId) setSeleccionadaId(fitaArribadaId);
  }

  const elementals = estacions.filter((e) => e.element);
  const resoltes = elementals.filter((e) => e.progres.resolta).length;
  const nodes: NodePentagrama[] = elementals.map((e) => ({
    id: e.id,
    element: e.element!,
    resolt: e.progres.resolta,
    disponible: e.disponible,
  }));
  const visibles = estacions.filter((e) => e.tipus !== "especial" || totesResoltes);
  const seleccionada = estacions.find((e) => e.id === seleccionadaId) ?? null;

  return (
    <main
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] ${
        totesResoltes ? "pb-32" : "pb-10"
      }`}
    >
      <header className="flex animate-entrar items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="etiqueta">el vostre equip</p>
          <h1 className="truncate text-4xl font-extrabold">{nomEquip}</h1>
        </div>
        <div className="shrink-0 rounded-2xl border-[3px] border-ink bg-gold px-3 py-1 text-center shadow-[0_4px_0_var(--ink)]">
          <p className="font-display text-3xl font-extrabold leading-none">
            {resoltes}
            <span className="text-xl">/{elementals.length}</span>
          </p>
          <p className="etiqueta text-[0.65rem] text-ink">elements</p>
        </div>
      </header>

      {/* Progrés: el pentagrama s'encén a mesura que es resolen les fites */}
      <section className="targeta relative animate-entrar overflow-hidden px-4 pb-3 pt-4 [animation-delay:80ms]">
        <Pentagrama
          nodes={nodes}
          centreActiu={totesResoltes}
          girar
          seleccionatId={seleccionadaId}
          onTriar={setSeleccionadaId}
          className="mx-auto w-full max-w-[18rem]"
        />
        {/* Amb totes resoltes, just a sota ve el text de l'estrella completa. */}
        {!totesResoltes && (
          <p className="mt-1 text-center text-base text-ink-soft">Toqueu un element per veure on és.</p>
        )}
      </section>

      {totesResoltes && <Narracio text={ESTRELLA_COMPLETA} etiqueta="fra francesc" className="animate-entrar" />}

      <section className="animate-entrar [animation-delay:160ms]">
        <h2 className="etiqueta mb-2 text-base">mapa de sentfores</h2>
        <MapaEquip
          estacions={estacions}
          totesResoltes={totesResoltes}
          seleccionadaId={seleccionadaId}
          onSeleccionar={(e) => setSeleccionadaId(e.id)}
          marcadors={marcadors}
        />
        {marcadors && marcadors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
            {marcadors.some((m) => m.tipus === "jo") && (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-[#2563eb] ring-1 ring-ink/30" /> Vosaltres
              </span>
            )}
            {marcadors.some((m) => m.tipus === "master") && (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blood ring-2 ring-ink" /> L&apos;organització
              </span>
            )}
          </div>
        )}
      </section>

      <section className="animate-entrar [animation-delay:240ms]">
        <h2 className="etiqueta mb-2 text-base">les fites</h2>
        <ul className="flex flex-col gap-3">
          {visibles.map((estacio) => {
            const element = estacio.element ? ELEMENTS[estacio.element] : null;
            const resolta = estacio.progres.resolta;
            const index = estacions.indexOf(estacio);
            return (
              <li key={estacio.id}>
                <button
                  type="button"
                  onClick={() => setSeleccionadaId(estacio.id)}
                  className={`flex min-h-[4.5rem] w-full items-center gap-3 rounded-2xl border-[3px] p-2 pr-3 text-left transition active:translate-y-0.5 ${
                    estacio.id === seleccionadaId
                      ? "border-ink bg-[#fffdf7] shadow-[0_4px_0_var(--ink)]"
                      : "border-ink/25 bg-paper-2/60"
                  } ${estacio.disponible ? "" : "opacity-60"}`}
                >
                  <span
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-ink"
                    style={{ background: resolta ? element?.color ?? "var(--gold)" : "#fffdf7" }}
                  >
                    {element ? (
                      <img
                        src={element.icona}
                        alt=""
                        className={`h-9 w-9 object-contain ${resolta ? "brightness-0 invert" : ""}`}
                      />
                    ) : (
                      <span className="text-2xl">⚗️</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="etiqueta block text-xs">
                      fita {ROMANS[index] ?? index + 1}
                      {element && ` · ${element.nom}`}
                    </span>
                    <span className="block truncate text-xl font-extrabold leading-tight">{estacio.nom}</span>
                  </span>
                  <span className="shrink-0">
                    {resolta ? (
                      <span className="rounded-full border-2 border-ok bg-ok px-2.5 py-0.5 text-sm font-extrabold text-white">
                        ✓
                      </span>
                    ) : !estacio.disponible ? (
                      <span className="text-xl" aria-label="Properament">
                        🔒
                      </span>
                    ) : (
                      <span className="text-2xl font-extrabold" aria-hidden>
                        ›
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <button type="button" onClick={onLlegirMissatge} className="btn btn-secundari animate-entrar [animation-delay:320ms]">
        📜 Tornar a llegir el missatge
      </button>

      {totesResoltes && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 [background:linear-gradient(to_top,var(--paper)_60%,transparent)]">
          <div className="animate-bategar rounded-2xl">
            <button onClick={onAnarFinal} className="btn btn-fosc text-xl">
              ⚗️ Anar al Pla de Masset
            </button>
          </div>
        </div>
      )}

      {seleccionada && (
        <FitxaFita
          estacio={seleccionada}
          numero={ROMANS[estacions.indexOf(seleccionada)] ?? ""}
          acabadaDarribar={seleccionada.id === fitaArribadaId}
          onTancar={() => setSeleccionadaId(null)}
          onAnar={() => onAnarEstacio(seleccionada)}
        />
      )}
    </main>
  );
}

/** Fitxa inferior (bottom sheet) de la fita triada: a l'abast del polze. */
function FitxaFita({
  estacio,
  numero,
  acabadaDarribar,
  onTancar,
  onAnar,
}: {
  estacio: EstacioMapa;
  numero: string;
  acabadaDarribar: boolean;
  onTancar: () => void;
  onAnar: () => void;
}) {
  const element = estacio.element ? ELEMENTS[estacio.element] : null;
  const color = element?.color ?? "var(--gold)";
  const resolta = estacio.progres.resolta;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={estacio.nom}>
      <button type="button" aria-label="Tancar" onClick={onTancar} className="absolute inset-0 animate-entrar bg-ink/45" />
      <div className="relative w-full max-w-md animate-pujar overflow-hidden rounded-t-[2rem] border-x-[3px] border-t-[3px] border-ink bg-paper">
        <div className="h-3" style={{ background: color }} />
        <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/20" />
          <div className="flex items-start gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-[#fffdf7] shadow-[0_4px_0_var(--ink)]"
              style={{ borderColor: resolta ? color : undefined }}
            >
              {element ? (
                <img src={element.icona} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <span className="text-3xl">⚗️</span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="etiqueta" style={{ color: element ? color : undefined }}>
                fita {numero}
                {element && ` · ${element.nom}`}
              </p>
              <h3 className="text-4xl font-extrabold">{estacio.nom}</h3>
            </div>
            <button type="button" onClick={onTancar} aria-label="Tancar" className="btn btn-secundari btn-rodo shrink-0 text-xl">
              ✕
            </button>
          </div>

          {acabadaDarribar && !resolta && (
            <p
              role="status"
              className="mt-4 animate-bategar rounded-2xl border-[3px] border-ink px-4 py-3 text-lg font-extrabold text-white"
              style={{ background: color }}
            >
              📍 Heu arribat! La fita s&apos;ha obert.
            </p>
          )}

          {estacio.situacio && (
            <p className="mt-4 flex gap-2 text-lg font-bold">
              <span aria-hidden>📍</span>
              {estacio.situacio}
            </p>
          )}
          <p className="mt-2 text-lg text-ink-soft">{estacio.entrada}</p>

          <button onClick={onAnar} disabled={!estacio.disponible} className="btn btn-primari mt-5">
            {!estacio.disponible
              ? "🔒 Properament"
              : resolta
                ? "✓ Ja resolta · Tornar-hi"
                : estacio.tipus === "especial"
                  ? "Començar el ritual →"
                  : estacio.oberta === false
                    ? "Hi som! Obrir la fita →"
                    : "Entrar a la fita →"}
          </button>
        </div>
      </div>
    </div>
  );
}
