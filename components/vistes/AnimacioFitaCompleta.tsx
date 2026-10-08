"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ELEMENTS, type Element } from "@/content/public/estacions";

export interface AnimacioFitaCompletaProps {
  /** Element de la fita que s'acaba de resoldre. */
  element: Element;
  /**
   * Elements ja resolts (la fita actual s'hi afegeix sempre). Sense valor, es demanen a /api/estat;
   * si falla (sense sessió, galeria de dev), només es veu encesa la fita actual.
   */
  resolts?: Element[];
}

const ORDRE: Element[] = ["aigua", "terra", "foc", "aire", "anima"];

type Moviment = "ascendir" | "caure" | "derivar";
type Forma = "punt" | "bombolla" | "estel" | "linia";

/** Partícules de fons de cada element: què són i cap a on es mouen. */
const PARTICULES: Record<Element, { moviment: Moviment; forma: Forma }> = {
  foc: { moviment: "ascendir", forma: "punt" },
  aigua: { moviment: "ascendir", forma: "bombolla" },
  terra: { moviment: "caure", forma: "punt" },
  aire: { moviment: "derivar", forma: "linia" },
  anima: { moviment: "ascendir", forma: "estel" },
};

const N_PARTICULES = 16;
/** Deterministes: el servidor i el client pinten el mateix. */
const POSICIONS = Array.from({ length: N_PARTICULES }, (_, i) => ({
  pos: (i * 37 + 11) % 100,
  retard: ((i * 0.47) % 4).toFixed(2),
  durada: (3.2 + (i % 4) * 0.9).toFixed(1),
  mida: 6 + (i % 4) * 3,
}));

/** Espurnes que surten del segell un cop, quan toca terra. */
const ESPURNES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 + (i % 2) * 11) * (Math.PI / 180);
  const distancia = 110 + (i % 3) * 34;
  return { dx: Math.round(Math.cos(angle) * distancia), dy: Math.round(Math.sin(angle) * distancia), mida: 6 + (i % 3) * 3 };
});

/**
 * Animació de "fita completada" que s'ensenya després del vídeo (VideoFita): la medalla de l'element
 * cau com un segell sobre l'últim fotograma, hi ha un esclat i unes ones, i d'allà fins que s'acaba
 * s'hi queda "respirant" amb partícules de l'element. Sota, el pentagrama de progrés (cinc medalles).
 * No sap quant dura: VideoFita la deixa el temps que calgui (mínim 4 s, fins que s'acabi la veu).
 */
export function AnimacioFitaCompleta({ element, resolts }: AnimacioFitaCompletaProps) {
  const { nom, iconaResolta, color } = ELEMENTS[element];
  const [resoltsApi, setResoltsApi] = useState<Element[] | null>(null);

  useEffect(() => {
    if (resolts) return;
    fetch("/api/estat")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { estacions?: { element?: Element; progres?: { resolta: boolean } }[] } | null) => {
        const llista = data?.estacions?.filter((e) => e.element && e.progres?.resolta).map((e) => e.element as Element);
        if (llista) setResoltsApi(llista);
      })
      .catch(() => {});
  }, [resolts]);

  const encesos = new Set<Element>([...(resolts ?? resoltsApi ?? []), element]);
  const { moviment, forma } = PARTICULES[element];

  return (
    <div
      role="status"
      aria-label={`Fita completada: ${nom}`}
      className="absolute inset-0 flex flex-col items-center justify-center gap-7 overflow-hidden px-6 text-center"
      style={{
        animation: "fosa 0.6s ease-out both",
        background: `radial-gradient(circle at 50% 45%, rgb(0 0 0 / 0.45) 0%, rgb(0 0 0 / 0.8) 100%)`,
      }}
    >
      {/* Partícules de l'element, de fons i en bucle */}
      {POSICIONS.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={fonsParticula(moviment, forma, color, p)}
        >
          {forma === "estel" ? "✦" : null}
        </span>
      ))}

      <div className="relative">
        {/* Esclat i ones quan el segell toca terra */}
        <div aria-hidden className="absolute inset-0 animate-esclat rounded-full bg-white [animation-delay:350ms]" />
        {[380, 660].map((retard) => (
          <div
            key={retard}
            aria-hidden
            className="absolute inset-0 animate-ona rounded-full border-[5px]"
            style={{ borderColor: color, animationDelay: `${retard}ms` }}
          />
        ))}
        {ESPURNES.map((e, i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 animate-espurna rounded-full"
            style={
              {
                "--dx": `${e.dx}px`,
                "--dy": `${e.dy}px`,
                animationDelay: `${320 + (i % 4) * 40}ms`,
                width: e.mida,
                height: e.mida,
                background: i % 2 ? "var(--gold)" : color,
                boxShadow: `0 0 ${e.mida}px ${i % 2 ? "var(--gold)" : color}`,
              } as CSSProperties
            }
          />
        ))}

        {/* La medalla: cau, s'assenta i es queda respirant amb el halo de l'element */}
        <div className="animate-segellar">
          <div
            className="animate-resplendir rounded-full [animation-delay:1100ms]"
            style={{ "--c": color } as CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconaResolta} alt="" className="h-44 w-44" />
          </div>
        </div>
      </div>

      <div className="relative animate-entrar [animation-delay:700ms]">
        <p className="font-display text-4xl font-extrabold leading-none text-[#fffdf7]">Fita completada</p>
        <p className="etiqueta mt-3 text-lg text-[#fffdf7]" style={{ textShadow: `0 0 12px ${color}, 0 0 4px ${color}` }}>
          ✦ {nom} ✦
        </p>
      </div>

      {/* Pentagrama de progrés: una medalla per fita, encesa si ja és resolta */}
      <div className="relative flex animate-entrar flex-col items-center gap-2 [animation-delay:1200ms]">
        <ul className="flex items-center gap-2.5" aria-label={`${encesos.size} de 5 fites resoltes`}>
          {ORDRE.map((id) => {
            const resolta = encesos.has(id);
            const actual = id === element;
            return (
              <li key={id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolta ? ELEMENTS[id].iconaResolta : ELEMENTS[id].icona}
                  alt=""
                  className={`h-11 w-11 object-contain ${resolta ? "" : "opacity-35 grayscale"}`}
                  style={actual ? { filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 14px ${color})`, transform: "scale(1.2)" } : undefined}
                />
              </li>
            );
          })}
        </ul>
        <p className="etiqueta text-sm text-[#fffdf7]/80">{encesos.size} de 5</p>
      </div>
    </div>
  );
}

function fonsParticula(
  moviment: Moviment,
  forma: Forma,
  color: string,
  p: { pos: number; retard: string; durada: string; mida: number }
): CSSProperties {
  const base: CSSProperties = {
    animation: `${moviment} ${p.durada}s linear ${p.retard}s infinite both`,
    color,
    opacity: 0,
  };
  if (moviment === "derivar") {
    return { ...base, top: `${p.pos}%`, left: 0, width: p.mida * 4, height: 2, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}` };
  }
  const vertical: CSSProperties = moviment === "caure" ? { top: 0 } : { bottom: 0 };
  const comuns = { ...base, ...vertical, left: `${p.pos}%` };
  if (forma === "estel") return { ...comuns, fontSize: p.mida * 2, lineHeight: 1, textShadow: `0 0 10px ${color}` };
  if (forma === "bombolla") return { ...comuns, width: p.mida * 1.6, height: p.mida * 1.6, borderRadius: "50%", border: `2px solid ${color}`, background: "rgb(255 255 255 / 0.12)" };
  return { ...comuns, width: p.mida, height: p.mida, borderRadius: "50%", background: color, boxShadow: `0 0 ${p.mida}px ${color}` };
}
