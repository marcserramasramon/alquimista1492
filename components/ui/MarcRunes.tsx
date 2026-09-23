"use client";

import { useEffect, useRef, useState } from "react";
import { GLIFS_RUNES, INSCRIPCIO_RUNES } from "./runes";

const ALCADA_PX = 15;
// El camí passa pel mig de la banda de runes, a aquesta distància de la vora interior.
const DISTANCIA_VORA_PX = 12;
const SEPARACIO_PX = 4;
const VELOCITAT_PX_S = 22;

/** Amplada de la banda de runes per defecte: el contingut de la caixa no hauria de tapar-la. */
export const BANDA_RUNES_PX = DISTANCIA_VORA_PX * 2;

/**
 * Inscripció de runes que dona voltes pel contorn de la caixa que la conté (cal que sigui
 * `relative`). Cada runa segueix el camí amb `offset-path`; amb "reduir moviment" queden quietes.
 * La banda fa `distanciaVora * 2` d'amplada.
 */
export function MarcRunes({
  brillant = false,
  alcada = ALCADA_PX,
  distanciaVora = DISTANCIA_VORA_PX,
  invers = false,
}: {
  brillant?: boolean;
  alcada?: number;
  distanciaVora?: number;
  /** Gira en sentit antihorari. */
  invers?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mida, setMida] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(() => setMida({ w: el.clientWidth, h: el.clientHeight }));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const runes = mida ? disposar(mida.w, mida.h, alcada, distanciaVora) : null;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 transition-[filter] duration-500 ${
        brillant ? "drop-shadow-[0_0_5px_rgb(234_179_8)] brightness-125" : ""
      }`}
    >
      {runes?.glifs.map((g, i) => (
        <svg
          // Chrome no reaplica un offset-path nou a una animació en marxa: si canvia la mida,
          // cal crear les runes de nou o seguirien el camí vell i se sobreposarien.
          key={`${mida?.w}x${mida?.h}-${i}`}
          width={g.amplada}
          height={alcada}
          viewBox={`0 -100 ${g.ampladaGlif} 100`}
          className="absolute top-0 left-0 overflow-visible fill-gold-deep opacity-85 motion-safe:animate-[voltar_var(--durada)_linear_infinite]"
          style={
            {
              "--durada": `${runes.durada}s`,
              offsetPath: `path("${runes.cami}")`,
              offsetRotate: "auto",
              offsetAnchor: "50% 50%",
              offsetDistance: `${g.posicio}%`,
              // En sentit invers l'animació va de 100 % a 0 %: cal el retard complementari.
              animationDelay: `${-((invers ? 100 - g.posicio : g.posicio) / 100) * runes.durada}s`,
              animationDirection: invers ? "reverse" : "normal",
            } as React.CSSProperties
          }
        >
          <path d={g.d} />
        </svg>
      ))}
    </div>
  );
}

/** Camí del rectangle arrodonit (en sentit horari) i la posició de cada runa, repetint la inscripció. */
function disposar(w: number, h: number, alcada: number, m: number) {
  const r = m + 2;
  const [x0, y0, x1, y1] = [m, m, w - m, h - m];
  const cami =
    `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}` +
    `H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  const llargada = 2 * (x1 - x0 + (y1 - y0)) - 8 * r + 2 * Math.PI * r;

  const escala = alcada / 100;
  const frase = [...INSCRIPCIO_RUNES].map((ch) => GLIFS_RUNES[ch]);
  const llargadaFrase = frase.reduce((s, g) => s + g.amplada * escala + SEPARACIO_PX, 0);
  const repeticions = Math.max(1, Math.round(llargada / llargadaFrase));
  // Estira una mica els espais perquè la inscripció tanqui el cercle sense forat.
  const estirar = llargada / (repeticions * llargadaFrase);

  const glifs: { d: string; amplada: number; ampladaGlif: number; posicio: number }[] = [];
  let s = 0;
  for (let i = 0; i < repeticions; i++) {
    for (const g of frase) {
      const pas = (g.amplada * escala + SEPARACIO_PX) * estirar;
      glifs.push({ d: g.d, amplada: g.amplada * escala, ampladaGlif: g.amplada, posicio: ((s + pas / 2) / llargada) * 100 });
      s += pas;
    }
  }
  return { cami, glifs, durada: llargada / VELOCITAT_PX_S };
}
