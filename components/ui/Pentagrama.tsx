"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ELEMENTS, type Element } from "@/content/public/estacions";
import { disposarRunesCercle } from "./runes";

export interface NodePentagrama {
  id: string;
  element: Element;
  resolt: boolean;
  disponible: boolean;
}

export interface PentagramaProps {
  /** Les cinc fites elementals, en qualsevol ordre: es col·loquen segons ORDRE. */
  nodes?: NodePentagrama[];
  /** El Gresol del centre s'encén quan totes les fites estan resoltes. */
  centreActiu?: boolean;
  /** Anell exterior girant (decoratiu). */
  girar?: boolean;
  seleccionatId?: string | null;
  onTriar?: (id: string) => void;
  /** Elements amb color encara que no estiguin resolts (ús decoratiu). */
  vius?: boolean;
  /** Força les espurnes sobre la gemma central encara que `centreActiu` sigui fals (ús decoratiu, p. ex. la Benvinguda). */
  espurnes?: boolean;
  className?: string;
  /**
   * Cada quants segons passa un reflex de llum (en color) pels símbols dels elements; 0 el desactiva.
   * Passa per grups: primer per les fites resoltes i, `reflexCada` segons després, per les pendents.
   */
  reflexCada?: number;
  /** Per als cartells impresos: estrella contínua d'aquest color i gruix, i text de l'anell més gran i fosc. */
  imprès?: { colorLinies: string; gruixLinies: number; midaText: number };
}

const MIDA = 300;
const C = MIDA / 2;
const R_NODE = 100;
const R_ANELL = 136;
const MIDA_NODE = 27;

/** Amplada de la banda entre l'anell exterior i l'interior, on hi viu la inscripció de runes. */
const R_ANELL_INTERIOR = R_ANELL - 24;
const MARGE_RUNES = 2;
const ALCADA_RUNES_BASE = R_ANELL - R_ANELL_INTERIOR - 2 * MARGE_RUNES;
const R_RUNES = R_ANELL_INTERIOR + MARGE_RUNES;
const SEPARACIO_RUNES = 2;
/** `imprès.midaText` (per defecte 13) escala l'alçada de les runes igual que abans escalava el `fontSize`. */
const MIDA_TEXT_BASE = 13;

/** Posició de cada element a l'estrella: comença per la punta de dalt i va en sentit horari. */
const ORDRE: Element[] = ["foc", "terra", "anima", "aire", "aigua"];
const DECORATIU: NodePentagrama[] = ORDRE.map((element) => ({
  id: element,
  element,
  resolt: false,
  disponible: true,
}));

function vertex(i: number, r = R_NODE) {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return { x: C + r * Math.cos(angle), y: C + r * Math.sin(angle) };
}

// Ou de Pasqua: cinc tocs seguits (un per element) al centre obren el joc d'alquímia (/gresol).
const TOCS_OU_DE_PASQUA = 5;
const MAX_ENTRE_TOCS_MS = 800;

/** Opacitat del Gresol central amb 0 fites resoltes. */
const OPACITAT_GRESOL_MIN = 0.35;
/** Opacitat amb totes les fites menys una: el salt fins a 1 marca l'estrella completa. */
const OPACITAT_GRESOL_QUASI = 0.8;

/**
 * El símbol central és gairebé transparent i guanya opacitat amb cada fita
 * resolta; només és del tot visible quan les cinc estan resoltes.
 */
function opacitatGresol(resolts: number, total: number, sempreVisible: boolean) {
  if (sempreVisible || total === 0 || resolts >= total) return 1;
  const fraccio = resolts / Math.max(total - 1, 1);
  return OPACITAT_GRESOL_MIN + (OPACITAT_GRESOL_QUASI - OPACITAT_GRESOL_MIN) * fraccio;
}

/** Nombre màxim de reintents si una icona no arriba a carregar (xarxa mòbil al carrer). */
const MAX_REINTENTS_ICONA = 3;

/** Espurnes blanques sobre la gemma central quan està del tot encesa (posició en % de la caixa 56×56). */
const ESPURNES_GEMMA = [
  { cx: 0.26, cy: 0.18, r: 2.2, retard: "0s" },
  { cx: 0.7, cy: 0.6, r: 1.7, retard: "0.6s" },
  { cx: 0.3, cy: 0.7, r: 2.6, retard: "1.2s" },
  { cx: 0.68, cy: 0.3, r: 1.9, retard: "1.8s" },
  { cx: 0.48, cy: 0.45, r: 1.4, retard: "0.3s" },
];

/**
 * Icona SVG amb reintent: si la imatge no carrega (xarxa inestable jugant al carrer), el
 * navegador no en torna a provar sol perquè l'`href` no canvia. Cada error demana la
 * mateixa imatge amb un paràmetre nou perquè el navegador la torni a sol·licitar.
 */
function IconaAmbReintent({ href, ...props }: React.SVGProps<SVGImageElement> & { href: string }) {
  const [reintent, setReintent] = useState(0);
  return (
    <image
      {...props}
      href={reintent === 0 ? href : `${href}?r=${reintent}`}
      onError={() => {
        if (reintent < MAX_REINTENTS_ICONA) {
          setTimeout(() => setReintent((n) => n + 1), 600 * (reintent + 1));
        }
      }}
    />
  );
}

/**
 * El pentagrama dels cinc elements al voltant del Pla del Masset: fa de segell
 * de l'app i de marcador de progrés. Cada fita resolta pren el seu color i,
 * quan dues puntes veïnes de l'estrella estan resoltes, la línia s'encén d'or.
 */
export function Pentagrama({
  nodes: nodesDonats = DECORATIU,
  centreActiu = false,
  girar = false,
  seleccionatId = null,
  onTriar,
  vius = false,
  espurnes = false,
  reflexCada = 8,
  className = "",
  imprès,
}: PentagramaProps) {
  // Sempre es dibuixen les cinc puntes en posició fixa: si una fita encara no s'ha revelat
  // (p. ex. l'Aire, amagat fins que l'equip obre el seu pas previ — app/api/estat/route.ts),
  // hi surt igualment (sense resoldre, contorn continu) en el seu lloc en lloc de desaparèixer.
  // Si desapareixés, `vertex(i)` (que sempre reparteix 360° en cinc trossos de 72°) encongiria
  // l'estrella en una creu. `disponible: true` perquè el contorn no surti discontinu com un
  // "properament": la fita hi és, només que encara no s'ha revelat.
  const nodes: NodePentagrama[] = ORDRE.map(
    (element) => nodesDonats.find((n) => n.element === element) ?? { id: element, element, resolt: false, disponible: true },
  );
  const punts = nodes.map((_, i) => vertex(i));
  const resolts = nodes.filter((n) => n.resolt).length;
  const opacitatCentre = opacitatGresol(resolts, nodes.length, vius || centreActiu);
  // El reflex va per grups (resoltes / pendents): cada grup té la seva passada, una darrere l'altra.
  // Si només n'hi ha un, la passada és d'aquell grup cada `reflexCada` segons.
  const grupsReflex = Number(nodes.some((n) => n.resolt)) + Number(nodes.some((n) => !n.resolt));
  // Prefix únic: si hi ha dos pentagrames al DOM, les màscares i el degradat del reflex no s'han de confondre.
  const uid = useId().replace(/:/g, "");
  const router = useRouter();
  const tocs = useRef({ n: 0, darrer: 0 });
  const alcadaRunes = imprès ? (ALCADA_RUNES_BASE * (imprès.midaText ?? MIDA_TEXT_BASE)) / MIDA_TEXT_BASE : ALCADA_RUNES_BASE;
  const runesAnell = useMemo(
    () => disposarRunesCercle(C, C, R_RUNES, alcadaRunes, { separacio: SEPARACIO_RUNES }),
    [alcadaRunes],
  );

  function tocarCentre() {
    const ara = Date.now();
    const t = tocs.current;
    t.n = ara - t.darrer <= MAX_ENTRE_TOCS_MS ? t.n + 1 : 1;
    t.darrer = ara;
    if (t.n >= TOCS_OU_DE_PASQUA) {
      t.n = 0;
      router.push("/gresol");
    }
  }

  return (
    <svg
      viewBox={`0 0 ${MIDA} ${MIDA}`}
      className={`block ${className}`}
      role="img"
      aria-label={`Pentagrama: ${nodes.filter((n) => n.resolt).length} de ${nodes.length} elements`}
    >
      <defs>
        <radialGradient id="brillantor">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="espurna-blanca">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        {/* Banda del reflex: transparent als costats i clara al mig (s'usa dins les màscares dels nodes). */}
        <linearGradient id={`reflex-banda-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="gris">
          <feColorMatrix type="saturate" values="0" />
        </filter>
        {/* Efecte guix: vora una mica irregular i gra que deixa petits buits (regió en unitats de l'SVG
            perquè una línia horitzontal o vertical, amb alçada 0, no sigui descartada pel filtre). */}
        <filter id="guix" filterUnits="userSpaceOnUse" x={0} y={0} width={MIDA} height={MIDA}>
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={2} seed={4} result="vora" />
          <feDisplacementMap in="SourceGraphic" in2="vora" scale={3} xChannelSelector="R" yChannelSelector="G" result="aspra" />
          <feTurbulence type="fractalNoise" baseFrequency="2.8" numOctaves={1} seed={9} result="gra" />
          <feColorMatrix
            in="gra"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.95"
            result="forats"
          />
          <feComposite in="aspra" in2="forats" operator="in" />
        </filter>
      </defs>

      {/* Anell exterior amb la inscripció de runes (mateix alfabet que components/ui/MarcRunes.tsx) */}
      <g className={girar ? "animate-girar" : undefined} style={{ transformOrigin: `${C}px ${C}px` }}>
        <circle cx={C} cy={C} r={R_ANELL} fill="none" stroke="#1b1511" strokeWidth={3} />
        <circle cx={C} cy={C} r={R_ANELL - 24} fill="none" stroke="#1b1511" strokeWidth={1.5} />
        <g fill={imprès ? "#1b1511" : "#5a4a3c"} opacity={0.9}>
          {runesAnell.map((r) => (
            <path key={r.key} d={r.d} transform={r.transform} />
          ))}
        </g>
      </g>

      {centreActiu && <circle cx={C} cy={C} r={110} fill="url(#brillantor)" />}

      {/* Estrella: cada punta es connecta amb la de dues posicions més enllà */}
      {punts.map((p, i) => {
        const j = (i + 2) % punts.length;
        const q = punts[j];
        const encesa = nodes[i].resolt && nodes[j].resolt;
        return (
          <line
            key={`l${i}`}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke={encesa ? "#eab308" : (imprès?.colorLinies ?? "#1b1511")}
            strokeWidth={encesa ? 6 : (imprès?.gruixLinies ?? 3.5)}
            strokeOpacity={encesa || imprès ? 1 : 0.38}
            strokeLinecap="round"
            filter={encesa || imprès ? undefined : "url(#guix)"}
          />
        );
      })}

      {/* Gresol central: la gemma del logo (pentàgon robí, app/pantalles/logo/LogoPentagrama.tsx) */}
      <g style={{ opacity: opacitatCentre, transition: "opacity 1.2s ease" }}>
        <circle cx={C} cy={C} r={29} fill={centreActiu ? "#eab308" : "#e9d5a6"} />
        <IconaAmbReintent href="/images/logo/pentagon-robi.webp" x={C - 28} y={C - 28} width={56} height={56} />
        {(espurnes || centreActiu) &&
          !imprès &&
          ESPURNES_GEMMA.map((e, i) => (
            <circle
              key={i}
              cx={C - 28 + e.cx * 56}
              cy={C - 28 + e.cy * 56}
              r={e.r}
              fill="url(#espurna-blanca)"
              className="animate-parpelleig"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: e.retard }}
            />
          ))}
      </g>
      {/* Zona de toc del centre, més gran que el gresol perquè s'encerti amb el dit. */}
      <circle cx={C} cy={C} r={42} fill="transparent" onClick={tocarCentre} />


      {/* Puntes elementals */}
      {nodes.map((node, i) => {
        const { x, y } = punts[i];
        const element = ELEMENTS[node.element];
        const seleccionat = node.id === seleccionatId;
        const clicable = Boolean(onTriar);
        const viu = node.resolt || vius;
        const reflex = !imprès && reflexCada > 0;
        // Icona sobre la qual passa el reflex: la mateixa que es veu a sota (mida i posició).
        const mida = node.resolt ? (MIDA_NODE + 3) * 2 : 34;
        const maskId = `reflex-${uid}-${node.id}`;
        const classeGrup = grupsReflex > 1 ? " reflex-grup-2" : "";
        // Torn del reflex: 1r les resoltes; 2n (reflexCada després) les pendents.
        const estilReflex = {
          animationDuration: `${reflexCada * grupsReflex}s`,
          animationDelay: `${1 + (grupsReflex > 1 && !node.resolt ? reflexCada : 0)}s`,
        };
        return (
          <g
            key={node.id}
            onClick={clicable ? () => onTriar?.(node.id) : undefined}
            onKeyDown={
              clicable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") onTriar?.(node.id);
                  }
                : undefined
            }
            role={clicable ? "button" : undefined}
            tabIndex={clicable ? 0 : undefined}
            aria-label={clicable ? `${element.nom}${node.resolt ? ", resolta" : ""}` : undefined}
            // Sense el requadre de focus en tocar amb el dit; amb teclat (focus-visible) sí que surt.
            className="[&:focus:not(:focus-visible)]:outline-none"
            style={{ cursor: clicable ? "pointer" : undefined }}
          >
            {seleccionat && (
              <circle cx={x} cy={y} r={MIDA_NODE + 9} fill="none" stroke="#eab308" strokeWidth={5} />
            )}
            {node.resolt ? (
              // Fita resolta: medalló del símbol alquímic (porta el segell ✓)
              <IconaAmbReintent
                href={element.iconaResolta}
                x={x - MIDA_NODE - 3}
                y={y - MIDA_NODE - 3}
                width={(MIDA_NODE + 3) * 2}
                height={(MIDA_NODE + 3) * 2}
              />
            ) : (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={MIDA_NODE}
                  fill={viu ? "#fffdf7" : "#f3e5c4"}
                  stroke={viu ? element.color : "#1b1511"}
                  strokeWidth={viu ? 6 : 3}
                  strokeDasharray={node.disponible ? undefined : "4 4"}
                />
                <IconaAmbReintent
                  href={element.icona}
                  x={x - 17}
                  y={y - 17}
                  width={34}
                  height={34}
                  opacity={viu ? 1 : node.disponible ? 0.55 : 0.3}
                  filter={viu ? undefined : "url(#gris)"}
                />
              </>
            )}
            {reflex && (
              <>
                <mask id={maskId} maskUnits="userSpaceOnUse" x={x - mida} y={y - mida} width={mida * 2} height={mida * 2}>
                  {/* Banda en coordenades absolutes del pentagrama: creua d'esquerra a dreta. Cada element hi
                      participa només en el torn del seu grup (resoltes o pendents), no tots a la vegada. */}
                  <g className={`reflex-banda${classeGrup}`} style={estilReflex}>
                    <rect
                      x={-9}
                      y={-60}
                      width={18}
                      height={MIDA + 120}
                      fill={`url(#reflex-banda-${uid})`}
                      transform={`rotate(22 0 ${C})`}
                    />
                  </g>
                </mask>
                {/* Resolta/viva: la mateixa icona, més lluminosa. Sense resoldre: la mateixa icona, però en color. */}
                <image
                  href={node.resolt ? element.iconaResolta : element.icona}
                  x={x - mida / 2}
                  y={y - mida / 2}
                  width={mida}
                  height={mida}
                  mask={`url(#${maskId})`}
                  // Amagada per defecte i només visible durant la seva passada: si la màscara fallés,
                  // la capa de color no es quedaria mai sobre la icona.
                  className={`reflex-icona${classeGrup}`}
                  style={viu ? { ...estilReflex, filter: "brightness(1.7) saturate(1.2)" } : estilReflex}
                  pointerEvents="none"
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
