import { BLAU_OBJECTIU } from "@/lib/sorollFoc";

/** Els 3 blaus del número secret i les 3 proporcions del soroll de la prova de colors del cartell de Foc. */
export const BLAUS = [
  { nom: "Actual", color: BLAU_OBJECTIU },
  { nom: "Blau fosc", color: "#2f63c0" },
  { nom: "Blau més clar que l'actual", color: "#8fbcf7" },
];

export const TARONJA_FOSC = "#e8590c";
export const TARONJA_CLAR = "#f59b1c";
export const GROC = "#f5c800";

/** Taronja fosc : taronja clar : groc. Un color repetit pesa més en l'escollida del soroll. */
export const PROPORCIONS = [
  { nom: "1:1:1", pesos: [1, 1, 1] },
  { nom: "1:2:2", pesos: [1, 2, 2] },
  { nom: "1:1:2", pesos: [1, 1, 2] },
];

export const colorsDe = (pesos: number[]) =>
  [TARONJA_FOSC, TARONJA_CLAR, GROC].flatMap((c, i) => Array<string>(pesos[i]).fill(c));

/** Colors invertits (experiment): soroll en 3 blaus i número en taronja o groc. */
export const BLAU_FORT = "#2f63c0";
export const BLAU_MIG = "#4d8ae3";
export const BLAU_CLAR = "#8fbcf7";

/** Blau fort : blau mig : blau clar; un color repetit pesa més en l'escollida del soroll. */
export const colorsBlaus = (pesos: number[]) =>
  [BLAU_FORT, BLAU_MIG, BLAU_CLAR].flatMap((c, i) => Array<string>(pesos[i]).fill(c));

export const NUMEROS_INVERTITS = [
  { nom: "Taronja", color: "#f07a1a" },
  { nom: "Groc", color: "#f5c800" },
];

/** Densitat de la trama del número (respecte a la del cartell) i quantitat de soroll (respecte a la del cartell). */
export const DENSITAT_SOROLL_INVERTIT = 3.33;
