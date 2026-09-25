/**
 * Composició de "soroll" del cartell de Foc: molts números i símbols
 * alquímics de colors i un sol número en vermell (la resposta de la fita).
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
}

export interface Soroll {
  amplada: number;
  alcada: number;
  peces: PecaSoroll[];
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
  return estil === "imatge" ? { alcada: alcadaSoroll(estil), espai: 26 } : { alcada: alcadaSoroll(estil) };
}

export const VERMELL_OBJECTIU = "#d0021b";

/** Colors del soroll: variats i vius, però cap que es pugui confondre amb el vermell. */
const COLORS_SOROLL = [
  "#1d6fd6", // blau
  "#0e9bb8", // turquesa
  "#1f7a3a", // verd fosc
  "#5b8a1e", // verd oliva
  "#8b3fb5", // lila
  "#d4a106", // daurat
  "#1b1511", // tinta
  "#6b4a2b", // marró
  "#2b3a8c", // indi
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
  espai = 4,
}: {
  resposta: string;
  llavor?: number;
  amplada?: number;
  alcada?: number;
  /** Separació mínima entre peces: més gran, menys dens (a sobre d'una il·lustració, que s'hi vegi). */
  espai?: number;
}): Soroll {
  const r = prng(llavor);
  const entre = (min: number, max: number) => min + r() * (max - min);
  const tria = <T,>(llista: T[]) => llista[Math.floor(r() * llista.length)];

  const peces: PecaSoroll[] = [];
  const marge = 40;

  // Radi aproximat que ocupa una peça, per no encavalcar-les.
  const radi = (p: Pick<PecaSoroll, "mida">) => p.mida * 0.42;
  const hiCap = (p: PecaSoroll) =>
    peces.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > radi(p) + radi(q) + espai);

  // Primer la resposta: mida normal i lluny de les vores, perquè no destaqui
  // per la posició ni per la mida, només pel color.
  peces.push({
    x: entre(amplada * 0.25, amplada * 0.75),
    y: entre(alcada * 0.25, alcada * 0.75),
    mida: 78,
    rotacio: entre(-18, 18),
    color: VERMELL_OBJECTIU,
    xifra: resposta,
    objectiu: true,
  });

  // Després el soroll, de més gran a més petit, amb mostreig per rebuig:
  // omple el full dens però sense que res tapi res.
  const mides = [96, 84, 72, 62, 52, 44, 36, 30, 24];
  for (const mida of mides) {
    let fallades = 0;
    while (fallades < 400) {
      const esXifra = r() < 0.62;
      const peca: PecaSoroll = {
        x: entre(marge, amplada - marge),
        y: entre(marge, alcada - marge),
        mida: mida * entre(0.9, 1.1),
        rotacio: entre(-35, 35),
        color: tria(COLORS_SOROLL),
        ...(esXifra ? { xifra: String(Math.floor(r() * 10)) } : { simbol: tria(SIMBOLS) }),
      };
      if (hiCap(peca)) {
        peces.push(peca);
        fallades = 0;
      } else {
        fallades++;
      }
    }
  }

  return { amplada, alcada, peces };
}
