"use client";

import { useMemo, useState } from "react";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { GLIFS_RUNES, INSCRIPCIO_RUNES } from "@/components/ui/runes";

type EstatNode = "esperant" | "volant" | "fusionat";

const MIDA = 580;
const C = MIDA / 2;
/** Mateixes proporcions que `components/ui/Pentagrama.tsx`: els elements a les puntes de l'estrella, dins l'anell. */
const R_NODE = 209;
const R_ANELL = 263;
const R_RUNES = R_ANELL - 12;
const ALCADA_RUNES = 28;
const SEPARACIO_RUNES = 5;
const MIDA_NODE = 50;

/** Mateix ordre i patró que `components/ui/Pentagrama.tsx`: la punta de dalt i sentit horari. */
const ORDRE: Element[] = ["foc", "terra", "anima", "aire", "aigua"];

function vertex(i: number, r = R_NODE) {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return { x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) };
}

/** Camí en espiral des d'un vèrtex fins al centre: hi vola l'element en tocar-lo. */
function espiral(desti: { x: number; y: number }, mostres = 26, voltes = 1.2) {
  const distancia = Math.hypot(desti.x - C, desti.y - C);
  const angleBase = Math.atan2(desti.y - C, desti.x - C);
  const trams: string[] = [];
  for (let k = 0; k <= mostres; k++) {
    const t = k / mostres;
    const r = (1 - t) * distancia;
    const angle = angleBase + t * voltes * 2 * Math.PI;
    const x = C + r * Math.cos(angle);
    const y = C + r * Math.sin(angle);
    trams.push(`${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return trams.join(" ");
}

/**
 * Disposa la inscripció de runes (mateixos glifs que `components/ui/MarcRunes.tsx`)
 * al llarg d'un cercle de radi `radi`, repetint-la fins tancar la volta sencera.
 */
function disposarRunesCercle(radi: number, alcada: number) {
  const escala = alcada / 100;
  const frase = [...INSCRIPCIO_RUNES].map((ch) => GLIFS_RUNES[ch]);
  const circumferencia = 2 * Math.PI * radi;
  const llargadaFrase = frase.reduce((s, g) => s + g.amplada * escala + SEPARACIO_RUNES, 0);
  const repeticions = Math.max(1, Math.round(circumferencia / llargadaFrase));
  const estirar = circumferencia / (repeticions * llargadaFrase);
  const glifs: { key: string; d: string; transform: string }[] = [];
  let s = 0;
  let idx = 0;
  for (let i = 0; i < repeticions; i++) {
    for (const g of frase) {
      const pas = (g.amplada * escala + SEPARACIO_RUNES) * estirar;
      const angle = ((s + pas / 2) / circumferencia) * 360;
      const transform =
        `rotate(${angle.toFixed(2)} ${C} ${C}) ` +
        `translate(${C} ${(C - radi).toFixed(2)}) ` +
        `scale(${escala.toFixed(3)}) ` +
        `translate(${(-g.amplada / 2).toFixed(2)} 0)`;
      glifs.push({ key: `r${idx++}`, d: g.d, transform });
      s += pas;
    }
  }
  return glifs;
}

function estatInicial(): Record<Element, EstatNode> {
  return { aigua: "esperant", terra: "esperant", foc: "esperant", aire: "esperant", anima: "esperant" };
}

/**
 * Adaptació decorativa, per a la landing (`/anunci`), del pentagrama del joc real
 * (`components/ui/Pentagrama.tsx`): mateixa disposició de les cinc puntes dins l'anell,
 * amb un anell de runes girant. Es toquen els elements en qualsevol ordre; cada un vola
 * en espiral cap al centre i s'hi fon amb els anteriors; quan els cinc s'han fos, el
 * Gresol real del joc queda del tot encès. Purament visual — no forma part del joc ni
 * en revela cap mecànica, ordre ni resposta.
 */
export function MiniJocElements() {
  const [estats, setEstats] = useState<Record<Element, EstatNode>>(estatInicial);
  const punts = useMemo(() => ORDRE.map((_, i) => vertex(i)), []);
  const camins = useMemo(() => punts.map((p) => espiral(p)), [punts]);
  const runesAnell = useMemo(() => disposarRunesCercle(R_RUNES, ALCADA_RUNES), []);

  const fusionats = ORDRE.filter((e) => estats[e] === "fusionat").length;
  const complet = fusionats === ORDRE.length;

  function tocar(element: Element) {
    if (estats[element] !== "esperant") return;
    setEstats((prev) => ({ ...prev, [element]: "volant" }));
  }

  function arribar(element: Element) {
    setEstats((prev) => ({ ...prev, [element]: "fusionat" }));
  }

  function reiniciar() {
    setEstats(estatInicial());
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center gap-3 px-6">
      <svg
        viewBox={`0 0 ${MIDA} ${MIDA}`}
        className="mx-auto aspect-square w-full max-w-[560px]"
        role="img"
        aria-label={`El Gresol dels Cinc Elements: ${fusionats} de ${ORDRE.length} fosos`}
      >
        <defs>
          <radialGradient id="anunci-brillantor">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Anell exterior de runes, girant sense parar */}
        <g className="animate-girar" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r={R_ANELL} fill="none" stroke="#1b1511" strokeWidth={6} />
          <circle cx={C} cy={C} r={R_ANELL - 24} fill="none" stroke="#1b1511" strokeWidth={3} />
          <g fill="#5a4a3c" opacity={0.9}>
            {runesAnell.map((r) => (
              <path key={r.key} d={r.d} transform={r.transform} />
            ))}
          </g>
        </g>

        {complet && <circle cx={C} cy={C} r={150} fill="url(#anunci-brillantor)" />}

        {/* Centre: el Gresol real del joc, sempre ben visible. */}
        <g>
          <circle cx={C} cy={C} r={55} fill={complet ? "#eab308" : "#e9d5a6"} style={{ transition: "fill 0.6s ease" }} />
          <image href="/images/gresol.webp" x={C - 50} y={C - 50} width={100} height={100} />
        </g>

        {/* Puntes elementals: es toquen en qualsevol ordre */}
        {ORDRE.map((element, i) => {
          const { x, y } = punts[i];
          const info = ELEMENTS[element];
          const estat = estats[element];
          const clicable = estat === "esperant";
          return (
            <g key={element}>
              {estat !== "volant" && (
                <g
                  onClick={clicable ? () => tocar(element) : undefined}
                  onKeyDown={
                    clicable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") tocar(element);
                        }
                      : undefined
                  }
                  role={clicable ? "button" : undefined}
                  tabIndex={clicable ? 0 : undefined}
                  aria-label={clicable ? `Afegeix ${info.nom} al Gresol` : `${info.nom}, ja fos`}
                  style={{ cursor: clicable ? "pointer" : "default" }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={MIDA_NODE}
                    fill={estat === "fusionat" ? "#f3e5c4" : "#fffdf7"}
                    stroke={info.color}
                    strokeWidth={estat === "fusionat" ? 5 : 8}
                    strokeOpacity={estat === "fusionat" ? 0.4 : 1}
                  />
                  <image
                    href={info.icona}
                    x={x - 32}
                    y={y - 32}
                    width={64}
                    height={64}
                    opacity={estat === "fusionat" ? 0.35 : 1}
                  />
                </g>
              )}
              {estat === "volant" && (
                <g
                  className="animate-fusionar"
                  style={{ offsetPath: `path('${camins[i]}')`, offsetRotate: "0deg" }}
                  onAnimationEnd={() => arribar(element)}
                >
                  <image href={info.icona} x={-32} y={-32} width={64} height={64} />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <p className="text-center text-sm italic text-ink-soft">
        {complet ? "Els cinc elements, fosos en un de sol." : "Toqueu els cinc elements, en l'ordre que vulgueu."}
      </p>

      {complet && (
        <button
          type="button"
          onClick={reiniciar}
          className="text-sm font-bold text-gold-deep underline underline-offset-4"
        >
          ↻ Torna-ho a fer
        </button>
      )}
    </div>
  );
}
