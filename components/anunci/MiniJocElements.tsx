"use client";

import { useEffect, useMemo, useState } from "react";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { disposarRunesCercle } from "@/components/ui/runes";

type EstatNode = "esperant" | "volant" | "fusionat";

const MIDA = 620;
const C = MIDA / 2;
/** Mateixes proporcions que `components/ui/Pentagrama.tsx`: els elements a les puntes de l'estrella, dins l'anell. */
const R_NODE = 209;
const R_ANELL = 290;
/** Distància entre el cercle gruixut (exterior) i el prim (interior): les runes hi han de cabre senceres al mig. */
const GAP_ANELL = 46;
const R_ANELL_INTERIOR = R_ANELL - GAP_ANELL;
/** Marge dins la banda perquè cap runa toqui els cercles. */
const MARGE_RUNES = 4;
const ALCADA_RUNES = GAP_ANELL - 2 * MARGE_RUNES;
/** Radi on comença (la base de) cada runa: creixen cap enfora, cap al cercle gruixut. */
const R_RUNES = R_ANELL_INTERIOR + MARGE_RUNES;
const SEPARACIO_RUNES = 5;
const MIDA_NODE = 50;
/** Temps que el flaix cobreix el Gresol abans de revelar la gemma (ha de quedar per sota de 0.9s, la durada de l'`esclat`). */
const RETARD_REVELACIO_MS = 350;

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
  const [revelat, setRevelat] = useState(false);
  const [fumActiu, setFumActiu] = useState(false);
  const punts = useMemo(() => ORDRE.map((_, i) => vertex(i)), []);
  const camins = useMemo(() => punts.map((p) => espiral(p)), [punts]);
  const runesAnell = useMemo(
    () => disposarRunesCercle(C, C, R_RUNES, ALCADA_RUNES, { separacio: SEPARACIO_RUNES }),
    [],
  );

  const fusionats = ORDRE.filter((e) => estats[e] === "fusionat").length;
  const complet = fusionats === ORDRE.length;

  // Quan es fon el cinquè element: un flaix cobreix el Gresol i, en apagar-se, hi apareix la gemma.
  useEffect(() => {
    if (!complet) return;
    const temporitzador = setTimeout(() => setRevelat(true), RETARD_REVELACIO_MS);
    return () => clearTimeout(temporitzador);
  }, [complet]);

  // El fum acompanya el flaix i s'esvaeix una mica després que aparegui la gemma.
  useEffect(() => {
    if (!complet) {
      setFumActiu(false);
      return;
    }
    setFumActiu(true);
    const temporitzador = setTimeout(() => setFumActiu(false), 1200);
    return () => clearTimeout(temporitzador);
  }, [complet]);

  function tocar(element: Element) {
    if (estats[element] !== "esperant") return;
    setEstats((prev) => ({ ...prev, [element]: "volant" }));
  }

  function arribar(element: Element) {
    setEstats((prev) => ({ ...prev, [element]: "fusionat" }));
  }

  function reiniciar() {
    setEstats(estatInicial());
    setRevelat(false);
    setFumActiu(false);
  }

  return (
    <div className="mx-auto flex w-full flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${MIDA} ${MIDA}`}
        className="mx-auto aspect-square max-w-[560px] rounded-full bg-paper/90 shadow-[0_6px_0_var(--ink)]"
        style={{ width: "min(100%, 34vh)" }}
        role="img"
        aria-label={`El Gresol dels Cinc Elements: ${fusionats} de ${ORDRE.length} fosos`}
      >
        <defs>
          <radialGradient id="anunci-brillantor">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>
          <filter id="anunci-fum-difuminat" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* Anell exterior de runes, girant sense parar */}
        <g className="animate-girar" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r={R_ANELL} fill="none" stroke="#1b1511" strokeWidth={6} />
          <circle cx={C} cy={C} r={R_ANELL_INTERIOR} fill="none" stroke="#1b1511" strokeWidth={3} />
          <g fill="#5a4a3c" opacity={0.9}>
            {runesAnell.map((r) => (
              <path key={r.key} d={r.d} transform={r.transform} />
            ))}
          </g>
        </g>

        {complet && <circle cx={C} cy={C} r={175} fill="url(#anunci-brillantor)" />}

        {/* Centre: el Gresol real del joc; en fondre's el cinquè element, un flaix el substitueix per la gemma. */}
        <g>
          <circle cx={C} cy={C} r={138} fill={complet ? "#eab308" : "#e9d5a6"} style={{ transition: "fill 0.6s ease" }} />
          <image
            href="/images/gresol.webp"
            x={C - 125}
            y={C - 125}
            width={250}
            height={250}
            style={{ opacity: revelat ? 0 : 1, transition: "opacity 0.5s ease" }}
          />
          {revelat && (
            <image
              href="/images/logo/pentagon-robi.webp"
              x={C - 125}
              y={C - 125}
              width={250}
              height={250}
              className="animate-gemma-girar"
              style={{ transformOrigin: `${C}px ${C}px`, transformBox: "view-box" }}
            />
          )}
          {complet && !revelat && (
            <circle cx={C} cy={C} r={95} fill="#fff8e1" className="animate-esclat" />
          )}
          {fumActiu && (
            <g filter="url(#anunci-fum-difuminat)" opacity={0.8}>
              <circle
                cx={C}
                cy={C}
                r={46}
                fill="#f5f2e9"
                className="animate-fum"
                style={{ transformOrigin: `${C}px ${C}px`, transformBox: "view-box" }}
              />
              <circle
                cx={C - 24}
                cy={C + 14}
                r={32}
                fill="#e9e3d3"
                className="animate-fum"
                style={{ transformOrigin: `${C - 24}px ${C + 14}px`, transformBox: "view-box", animationDelay: "120ms" }}
              />
              <circle
                cx={C + 28}
                cy={C - 10}
                r={36}
                fill="#efe9da"
                className="animate-fum"
                style={{ transformOrigin: `${C + 28}px ${C - 10}px`, transformBox: "view-box", animationDelay: "260ms" }}
              />
            </g>
          )}
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

      <p className="px-6 text-center text-sm italic text-paper">
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
