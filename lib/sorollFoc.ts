/**
 * Composició de "soroll" del cartell de Foc: un mar saturat de números i
 * símbols alquímics en vermell, sobreposats entre ells i per sobre d'un
 * número blau gran i centrat (la resposta de la fita). Sense el "paper de
 * foc" (cel·lofana vermella) el blau ha de quedar prou camuflat sota el
 * vermell que li passa per sobre; mirant-ho a través del filtre, el vermell
 * es dissol i el blau hi destaca sencer.
 *
 * És determinista: la mateixa llavor dona sempre el mateix full, així el que
 * s'imprimeix es pot tornar a generar igual. No importa res de
 * content/private: qui la crida li passa el número.
 */

export type FormaSimbol = "foc" | "aigua" | "aire" | "terra" | "sol" | "lluna" | "sofre" | "sal" | "estrella";

export interface PecaSoroll {
  x: number;
  y: number;
  /** Mida (alçada de la xifra o diàmetre del símbol), en unitats del viewBox. */
  mida: number;
  rotacio: number;
  color: string;
  /** Una xifra o bé un símbol dibuixat amb SVG. */
  xifra?: string;
  simbol?: FormaSimbol;
  /** Només la peça de la resposta. */
  objectiu?: boolean;
  /** Només peces de soroll: si va per sota de la resposta (la resposta la tapa a ella) en lloc de per sobre. */
  sotaObjectiu?: boolean;
}

/** Un punt de la trama halftone del número de la resposta. */
export interface PuntHalftone {
  x: number;
  y: number;
  r: number;
  color: string;
}

export interface Soroll {
  amplada: number;
  alcada: number;
  peces: PecaSoroll[];
  /** Trama de punts (halftone) del número de la resposta (components/cartells/SorollFocSvg.tsx la clipa a la seva forma). */
  puntsObjectiu: PuntHalftone[];
}

/**
 * Alçada del soroll (amb amplada 1000) segons l'estil del cartell:
 * - `imatge`: va a sobre de la il·lustració horitzontal del Foc (1500×837), amb la mateixa proporció.
 * - `fons`: va en un requadre blanc sota el text.
 */
export function alcadaSoroll(estil: "imatge" | "fons"): number {
  return estil === "imatge" ? Math.round((1000 * 837) / 1500) : 400;
}

/** Opcions de generaSoroll segons l'estil del cartell. */
export function opcionsSoroll(estil: "imatge" | "fons") {
  return { alcada: alcadaSoroll(estil), quantitat: estil === "imatge" ? 1100 : 840 };
}

/** Proporció de l'alçada del cartell que ocupa el número de la resposta (60% de l'1,9 original). */
const PROPORCIO_MIDA_OBJECTIU = 1.14;

/** Fracció de les xifres vermelles originals que es dibuixen. */
const PROPORCIO_VERMELLS = 1;

/** Color de la resposta: un blau mitjà, l'únic blau del cartell. */
export const BLAU_OBJECTIU = "#2f63c0";

/** Radi dels punts de la trama de la resposta. */
export const RADI_PUNTS_OBJECTIU = 2.7;

/** Colors del soroll: vermells, taronges i grocs vius (es dissolen a través del "paper de foc"; sense tons foscos, que quedarien foscos sota el filtre), cap que es pugui confondre amb el blau de la resposta. */
const COLORS_SOROLL = [
  "#d0021b", // vermell viu
  "#e13c2b", // vermell taronja
  "#e8561f", // taronja vermellós
  "#f07a1a", // taronja
  "#f59b1c", // taronja clar
  "#f7b500", // ambre
  "#f5c800", // groc daurat
  "#f2dc1e", // groc
];

const SIMBOLS: FormaSimbol[] = ["foc", "aigua", "aire", "terra", "sol", "lluna", "sofre", "sal", "estrella"];

/** PRNG mulberry32: petit i prou bo per a una composició. */
function prng(llavor: number) {
  let a = llavor >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generaSoroll({
  resposta,
  llavor = 1472,
  amplada = 1000,
  alcada = 440,
  quantitat = 300,
  midaObjectiu,
  colorObjectiu = BLAU_OBJECTIU,
  radiPunts = RADI_PUNTS_OBJECTIU,
}: {
  resposta: string;
  llavor?: number;
  amplada?: number;
  alcada?: number;
  /** Nombre aproximat de peces de soroll: com més, més saturat i sobreposat (i més ben tapada la resposta). */
  quantitat?: number;
  /** Mida de la resposta (per defecte proporcional a `alcada`, veure PROPORCIO_MIDA_OBJECTIU). */
  midaObjectiu?: number;
  /** Color del número de la resposta i dels seus punts (per defecte BLAU_OBJECTIU). */
  colorObjectiu?: string;
  /** Radi dels punts de la trama del número (per defecte RADI_PUNTS_OBJECTIU). */
  radiPunts?: number;
}): Soroll {
  const r = prng(llavor);
  const entre = (min: number, max: number) => min + r() * (max - min);
  const tria = <T,>(llista: T[]) => llista[Math.floor(r() * llista.length)];

  const peces: PecaSoroll[] = [];

  // La resposta va primera: en SVG, qui es dibuixa abans queda per sota de
  // qui ve després, així el soroll vermell la va tapant per sobre. Gran i
  // centrada perquè ni la posició ni la mida ajudin a distingir-la a ull nu.
  const xObjectiu = amplada / 2;
  const yObjectiu = alcada / 2 - 50;
  const midaObjectiuFinal = midaObjectiu ?? alcada * PROPORCIO_MIDA_OBJECTIU;
  peces.push({
    x: xObjectiu,
    y: yObjectiu,
    mida: midaObjectiuFinal,
    rotacio: 0,
    color: colorObjectiu,
    xifra: resposta,
    objectiu: true,
  });

  // Trama de punts (halftone) de la resposta: graella de cercles (clipats a
  // la seva forma pel component), tots de la mateixa mida i del blau de la
  // resposta.
  const pasHalftone = 9;
  const radiHalftone = radiPunts;
  const margeHalftone = midaObjectiuFinal * 0.65;
  const minXHalftone = Math.max(0, xObjectiu - margeHalftone);
  const maxXHalftone = Math.min(amplada, xObjectiu + margeHalftone);
  const minYHalftone = Math.max(0, yObjectiu - margeHalftone);
  const maxYHalftone = Math.min(alcada, yObjectiu + margeHalftone);
  const puntsObjectiu: PuntHalftone[] = [];
  for (let y = minYHalftone; y <= maxYHalftone; y += pasHalftone) {
    for (let x = minXHalftone; x <= maxXHalftone; x += pasHalftone) {
      puntsObjectiu.push({ x, y, r: radiHalftone, color: colorObjectiu });
    }
  }

  // Soroll: una quadrícula amb gasiva (jitter) per cel·la, en lloc de punts
  // purament aleatoris — el mostreig uniforme pur tendeix a deixar clústers
  // (masses de peces juntes) i buits (espais en blanc) perquè no reparteix
  // l'atzar de manera uniforme per l'espai. Cada cel·la aporta una peça
  // desplaçada prou lluny del seu centre perquè es sobreposi amb les veïnes
  // (i amb la resposta, si la cel·la hi cau a sobre), però sense els forats
  // ni les acumulacions del mostreig uniforme.
  const columnes = Math.max(1, Math.round(Math.sqrt((quantitat * amplada) / alcada)));
  const files = Math.max(1, Math.round(quantitat / columnes));
  const ampladaCella = amplada / columnes;
  const alcadaCella = alcada / files;
  const mides = [90, 78, 68, 58, 50, 42, 36, 30, 25, 20];
  for (let fila = 0; fila < files; fila++) {
    for (let columna = 0; columna < columnes; columna++) {
      const cx = (columna + 0.5) * ampladaCella;
      const cy = (fila + 0.5) * alcadaCella;
      const esXifra = r() < 0.62;
      // Només es queda el 75% de les xifres vermelles que hi havia (la resta de cel·les queden buides).
      if (esXifra && r() >= PROPORCIO_VERMELLS) continue;
      // Xifres i símbols tenen la mateixa paleta càlida (COLORS_SOROLL): només
      // la resposta és blava.
      const color = tria(COLORS_SOROLL);
      peces.push({
        x: cx + entre(-ampladaCella * 0.7, ampladaCella * 0.7),
        y: cy + entre(-alcadaCella * 0.7, alcadaCella * 0.7),
        mida: tria(mides) * entre(0.9, 1.1),
        rotacio: entre(-35, 35),
        color,
        // Un 8% queda per sota de la resposta (la resposta la tapa a ells) en
        // lloc de per sobre, perquè el camuflatge no sigui una simple pila plana.
        sotaObjectiu: r() < 0.08,
        ...(esXifra ? { xifra: String(Math.floor(r() * 10)) } : { simbol: tria(SIMBOLS) }),
      });
    }
  }

  return { amplada, alcada, peces, puntsObjectiu };
}
