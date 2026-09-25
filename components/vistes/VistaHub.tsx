"use client";

import { useEffect, useRef, useState } from "react";
import { MapaEquip, type EstacioMapa, type MarcadorMapa } from "@/components/player/MapaEquip";
import { BarraFranja, useMostrarAFranja } from "@/components/player/FranjaPartida";
import { Pentagrama, type NodePentagrama } from "@/components/ui/Pentagrama";
import { Narracio } from "@/components/ui/Narracio";
import { ELEMENTS } from "@/content/public/estacions";
import { ESTRELLA_COMPLETA } from "@/content/public/textos";

export interface VistaHubProps {
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

export function VistaHub({
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

  // La fitxa surt on hi ha el pentagrama: si es tria una fita des de més avall, s'hi torna.
  const zonaRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (seleccionadaId) zonaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [seleccionadaId]);

  // Els elements aconseguits van a la franja de dalt, al costat del compte enrere.
  const casella = <CasellaElements resoltes={resoltes} total={elementals.length} />;
  const rellotge = useMostrarAFranja(casella, [resoltes, elementals.length]);

  return (
    <main
      className={`mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pt-2 ${
        totesResoltes ? "pb-32" : "pb-10"
      }`}
    >
      {/* Sense compte enrere, la casella dels elements fa ella sola la franja de dalt. */}
      {rellotge === "no" && (
        <BarraFranja className="-mx-4 -mt-2">{casella}</BarraFranja>
      )}

      {/* Progrés: el pentagrama s'encén a mesura que es resolen les fites. La fitxa de la fita
          triada n'ocupa el lloc, amb la mateixa alçada. */}
      <section
        ref={zonaRef}
        className="targeta relative -mx-1 animate-entrar scroll-mt-10 overflow-hidden px-1 pb-2 pt-0 [animation-delay:80ms]"
      >
        <div className={seleccionada ? "invisible" : undefined}>
          <Pentagrama
            nodes={nodes}
            centreActiu={totesResoltes}
            girar
            seleccionatId={seleccionadaId}
            onTriar={setSeleccionadaId}
            className="mx-auto w-[92%]"
          />
          {/* Amb totes resoltes, just a sota ve el text de l'estrella completa. */}
          {!totesResoltes && (
            <p className="text-center text-[0.95rem] text-ink-soft">Toqueu un element per veure on és.</p>
          )}
        </div>
        {seleccionada && (
          <FitxaFita
            key={seleccionada.id}
            estacio={seleccionada}
            acabadaDarribar={seleccionada.id === fitaArribadaId}
            onTancar={() => setSeleccionadaId(null)}
            onAnar={() => onAnarEstacio(seleccionada)}
          />
        )}
      </section>

      {totesResoltes && <Narracio text={ESTRELLA_COMPLETA} etiqueta="fra francesc" className="animate-entrar" />}

      <section className="-mx-2 animate-entrar [animation-delay:160ms]">
        <h2 className="etiqueta mb-1 px-2 text-base normal-case">Mapa de Sentfores</h2>
        <MapaEquip
          estacions={estacions}
          totesResoltes={totesResoltes}
          seleccionadaId={seleccionadaId}
          onSeleccionar={(e) => setSeleccionadaId(e.id)}
          marcadors={marcadors}
        />
        {marcadors && marcadors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 px-2 text-sm text-ink-soft">
            {marcadors.some((m) => m.tipus === "jo") && (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-[#2563eb] ring-1 ring-ink/30" /> Vosaltres
              </span>
            )}
            {marcadors.some((m) => m.tipus === "master") && (
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] leading-none" aria-hidden>
                  🧙
                </span>{" "}
                L&apos;organització
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
                    <span className="etiqueta block text-xs">{element?.nom ?? "Ritual final"}</span>
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
              ⚗️ Anar al Pla del Masset
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/** Elements aconseguits sobre el total: mateixa alçada i forma que el compte enrere. */
function CasellaElements({ resoltes, total }: { resoltes: number; total: number }) {
  return (
    <p aria-label={`${resoltes} de ${total} elements`} className="flex items-baseline gap-1.5 leading-5">
      <span className="font-display text-lg font-extrabold leading-5 tabular-nums">
        {resoltes}/{total}
      </span>
      <span className="etiqueta text-[0.7rem] leading-5 text-current opacity-80">elements</span>
    </p>
  );
}

/**
 * Fitxa de la fita triada, al lloc del pentagrama. El nom i el botó hi són sempre; si el text
 * del mig no hi cap, es desplaça per dins.
 */
function FitxaFita({
  estacio,
  acabadaDarribar,
  onTancar,
  onAnar,
}: {
  estacio: EstacioMapa;
  acabadaDarribar: boolean;
  onTancar: () => void;
  onAnar: () => void;
}) {
  const element = estacio.element ? ELEMENTS[estacio.element] : null;
  const color = element?.color ?? "var(--gold)";
  const resolta = estacio.progres.resolta;

  return (
    <div role="region" aria-label={estacio.nom} className="absolute inset-0 flex animate-entrar flex-col bg-paper">
      {/* La franja de color de dalt fa d'avís quan el GPS acaba d'obrir la fita. */}
      {acabadaDarribar && !resolta ? (
        <p
          role="status"
          className="shrink-0 px-4 py-0.5 text-center text-base font-extrabold leading-6 text-white"
          style={{ background: color }}
        >
          <span aria-hidden className="inline-block motion-safe:animate-bounce">📍</span> Heu arribat! La fita s&apos;ha obert.
        </p>
      ) : (
        <div className="h-3 shrink-0" style={{ background: color }} />
      )}
      <div className="flex shrink-0 items-start gap-3 px-4 pt-2.5">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-[#fffdf7] shadow-[0_4px_0_var(--ink)]"
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
            {element?.nom ?? "Ritual final"}
          </p>
          <h3 className="text-[1.75rem] font-extrabold leading-[1.1]">{estacio.nom}</h3>
        </div>
        <button type="button" onClick={onTancar} aria-label="Tancar" className="btn btn-secundari btn-rodo shrink-0 text-xl">
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-1">
        {/* El que cal fer en arribar-hi és el protagonista; on és, en segon pla. */}
        <div
          className="mt-2 rounded-2xl border-[3px] border-ink bg-[#fffdf7] px-3.5 py-2 shadow-[0_3px_0_var(--ink)]"
          style={{ borderLeftWidth: 10, borderLeftColor: color }}
        >
          <p className="etiqueta mb-0.5 text-xs">què heu de fer</p>
          <p className="text-xl font-extrabold leading-snug">{estacio.entrada}</p>
        </div>
        {estacio.situacio && (
          <p className="mt-2 flex gap-1.5 text-base leading-snug text-ink-soft">
            <span aria-hidden>📍</span>
            <span>
              <span className="sr-only">On és: </span>
              {estacio.situacio}
            </span>
          </p>
        )}
      </div>

      {/* El botó, sempre a la vista. */}
      <div className="shrink-0 px-4 pb-3 pt-1.5">
        <button onClick={onAnar} disabled={!estacio.disponible} className="btn btn-primari">
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
  );
}
