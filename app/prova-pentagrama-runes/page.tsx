"use client";

import { useMemo, useState } from "react";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { disposarRunesCercle } from "@/components/ui/runes";

/**
 * Pàgina de prova independent: comprova dues coses abans de tocar
 * components/ui/Pentagrama.tsx —
 * 1) que l'anell de runes pugui girar SOL, sense arrossegar els dos cercles negres.
 * 2) que la banda entre els dos cercles negres es pugui omplir amb un fons
 *    (perquè les runes es llegeixin per sobre d'una il·lustració).
 */

const MIDA = 300;
const C = MIDA / 2;
const R_NODE = 100;
const R_ANELL = 136;
const R_ANELL_INTERIOR = R_ANELL - 24;
const MARGE_RUNES = 2;
const ALCADA_RUNES = 13;
const R_RUNES = R_ANELL_INTERIOR + MARGE_RUNES;
const SEPARACIO_RUNES = 2;
const MIDA_NODE = 27;

const ORDRE: Element[] = ["foc", "terra", "anima", "aire", "aigua"];

const FONS_BANDA = [
  { nom: "Transparent", valor: "transparent" },
  { nom: "Pergamí", valor: "#f3e5c4" },
  { nom: "Crema", valor: "#fbf4e4" },
  { nom: "Negre", valor: "#1b1511" },
  { nom: "Blau nit", valor: "#0b132b" },
];

const FONS_PAGINA = [
  { id: "quadres", nom: "Quadres", valor: "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 20px 20px" },
  { id: "clar", nom: "Clar", valor: "#fbf4e4" },
  { id: "fosc", nom: "Fosc", valor: "#111625" },
] as const;
type FonsPaginaId = (typeof FONS_PAGINA)[number]["id"];

function vertex(i: number, r = R_NODE) {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return { x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) };
}

/** Cercle complet expressat com a `d` de <path>, per poder-lo combinar amb fillRule evenodd. */
function cerclePath(cx: number, cy: number, r: number) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}

export default function ProvaPentagramaRunesPage() {
  const [girar, setGirar] = useState(true);
  const [invers, setInvers] = useState(false);
  const [durada, setDurada] = useState(60);
  const [fonsBanda, setFonsBanda] = useState<string>(FONS_BANDA[1].valor);
  const [fonsPagina, setFonsPagina] = useState<FonsPaginaId>("quadres");

  const runesAnell = useMemo(
    () => disposarRunesCercle(C, C, R_RUNES, ALCADA_RUNES, { separacio: SEPARACIO_RUNES }),
    [],
  );
  const punts = useMemo(() => ORDRE.map((_, i) => vertex(i)), []);
  const fonsPaginaValor = FONS_PAGINA.find((f) => f.id === fonsPagina)!.valor;

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Prova: runes giratòries + fons a la banda</h1>
      <p className="text-center text-sm opacity-70">
        Prova independent (no toca el pentagrama real): els dos cercles negres es queden
        fixos i només gira l&apos;anell de runes. La banda entre els cercles es pot omplir amb
        un fons, per si a sota hi ha d&apos;anar una il·lustració.
      </p>

      <div
        className="grid aspect-square w-full max-w-sm place-items-center overflow-hidden rounded-3xl border-[3px] border-ink"
        style={{ background: fonsPaginaValor }}
      >
        <svg viewBox={`0 0 ${MIDA} ${MIDA}`} className="block w-full" role="img" aria-label="Pentagrama de prova">
          {/* 1) Fons de la banda entre els dos cercles negres: forat al mig amb fillRule evenodd */}
          {fonsBanda !== "transparent" && (
            <path
              fillRule="evenodd"
              fill={fonsBanda}
              d={`${cerclePath(C, C, R_ANELL)} ${cerclePath(C, C, R_ANELL_INTERIOR)}`}
            />
          )}

          {/* 2) Anell de runes: gira sol, independent dels cercles */}
          <g
            className={girar ? "animate-girar" : undefined}
            style={{
              transformOrigin: `${C}px ${C}px`,
              animationDuration: girar ? `${durada}s` : undefined,
              animationDirection: invers ? "reverse" : "normal",
            }}
          >
            <g fill="#5a4a3c" opacity={0.9}>
              {runesAnell.map((r) => (
                <path key={r.key} d={r.d} transform={r.transform} />
              ))}
            </g>
          </g>

          {/* Cercles negres, fixos (no giren) */}
          <circle cx={C} cy={C} r={R_ANELL} fill="none" stroke="#1b1511" strokeWidth={3} />
          <circle cx={C} cy={C} r={R_ANELL_INTERIOR} fill="none" stroke="#1b1511" strokeWidth={1.5} />

          {/* Estrella, només decorativa aquí */}
          {punts.map((p, i) => {
            const q = punts[(i + 2) % punts.length];
            return (
              <line
                key={i}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="#1b1511"
                strokeWidth={2}
                strokeOpacity={0.35}
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            );
          })}

          {/* Gresol central */}
          <circle cx={C} cy={C} r={29} fill="#e9d5a6" />
          <image href="/images/logo/pentagon-robi.webp" x={C - 28} y={C - 28} width={56} height={56} />

          {/* Puntes elementals */}
          {punts.map(({ x, y }, i) => {
            const element = ELEMENTS[ORDRE[i]];
            return (
              <g key={ORDRE[i]}>
                <circle cx={x} cy={y} r={MIDA_NODE} fill="#fffdf7" stroke={element.color} strokeWidth={6} />
                <image href={element.icona} x={x - 17} y={y - 17} width={34} height={34} />
              </g>
            );
          })}
        </svg>
      </div>

      <fieldset className="flex w-full flex-col gap-4 text-lg">
        <label className="flex min-h-12 items-center justify-between gap-4">
          Runes que giren
          <input
            type="checkbox"
            className="size-6"
            checked={girar}
            onChange={(e) => setGirar(e.target.checked)}
          />
        </label>

        {girar && (
          <>
            <label className="flex items-center justify-between gap-4">
              Velocitat ({durada}s per volta)
              <input
                type="range"
                min={5}
                max={120}
                value={durada}
                onChange={(e) => setDurada(+e.target.value)}
              />
            </label>
            <label className="flex min-h-12 items-center justify-between gap-4">
              Sentit invers
              <input
                type="checkbox"
                className="size-6"
                checked={invers}
                onChange={(e) => setInvers(e.target.checked)}
              />
            </label>
          </>
        )}

        <div className="flex flex-col gap-2 border-t-2 border-ink/15 pt-3">
          <span>Fons de la banda entre els cercles:</span>
          <div className="flex flex-wrap items-center gap-2">
            {FONS_BANDA.map((o) => (
              <button
                key={o.valor}
                type="button"
                title={o.nom}
                aria-label={o.nom}
                aria-pressed={fonsBanda === o.valor}
                onClick={() => setFonsBanda(o.valor)}
                className={`size-12 rounded-lg border-2 ${
                  fonsBanda === o.valor ? "border-ink ring-4 ring-amber-400" : "border-ink/40"
                }`}
                style={{
                  background:
                    o.valor === "transparent"
                      ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0 / 12px 12px"
                      : o.valor,
                }}
              />
            ))}
            <label className="flex min-h-12 items-center gap-2 text-base">
              Altre
              <input
                type="color"
                value={fonsBanda === "transparent" ? "#f3e5c4" : fonsBanda}
                onChange={(e) => setFonsBanda(e.target.value)}
                className="h-12 w-14 cursor-pointer rounded-lg border-2 border-ink/40"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-ink/15 pt-3">
          <span>Fons de la pàgina (per veure si la banda queda transparent de veritat):</span>
          <div className="flex gap-2">
            {FONS_PAGINA.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFonsPagina(f.id)}
                aria-pressed={fonsPagina === f.id}
                className={`btn ${fonsPagina === f.id ? "btn-primari" : "btn-secundari"}`}
              >
                {f.nom}
              </button>
            ))}
          </div>
        </div>
      </fieldset>
    </main>
  );
}
