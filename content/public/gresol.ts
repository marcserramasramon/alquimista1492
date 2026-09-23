/**
 * Configuració del ritual del Gresol dels Cinc Elements (Pla de Masset).
 * docs/fites-nova.md § Estació central i docs/textos-nova.md § 4.
 *
 * Tot el que hi ha aquí és públic: cap valor és una solució. Si mai l'app ha de demanar
 * el resultat del Gresol, la resposta anirà a content/private/ i es validarà al servidor.
 */

import type { Element } from "@/content/public/estacions";

/** Manifestació alquímica de cada element al ritual (docs/fites-nova.md, taula del Gresol). */
export const RECIPIENTS: Record<Element, string> = {
  terra: "Cendra de la Creació",
  foc: "Espurna de Rubí",
  aire: "Alè d'Eòl",
  aigua: "Aigua de Lluna",
  anima: "Quinta Essència",
};

/**
 * Color del líquid de cada recipient (decidit el 2026-09-23). Només el transparent (l'Ànima,
 * l'últim) porta sal: fa de conductor entre dos fils i encén el LED de la pedra amagada al gresol.
 * `mostra` és el color amb què es pinta el líquid a la pantalla (null = transparent).
 */
export const LIQUIDS: Record<Element, { nom: string; mostra: string | null }> = {
  aigua: { nom: "blau", mostra: "#1d6fd6" },
  terra: { nom: "verd", mostra: "#3f8a2a" },
  foc: { nom: "vermell", mostra: "#c8231b" },
  aire: { nom: "groc", mostra: "#f2c318" },
  anima: { nom: "transparent", mostra: null },
};

/**
 * Com es passa de 4a (arribada) a 4b (ritual).
 * - "boto-equip": l'equip prem un botó quan ja ha respost la contrasenya (actual).
 * - "una-pantalla": les dues parts una sota l'altra, sense botó.
 * PENDENT (docs/textos-nova.md § 4b): també es parla d'un botó del màster o d'un codi;
 * cap dels dos està implementat (caldria estat al servidor o una solució a content/private).
 */
export type TransicioGresol = "boto-equip" | "una-pantalla";

export const GRESOL_CONFIG: {
  transicio: TransicioGresol;
  /** Ordre en què s'aboquen els 5 líquids (docs/fites-nova.md). La pantalla numera els recipients així. */
  ordreElements: Element[];
} = {
  transicio: "boto-equip",
  ordreElements: ["aigua", "foc", "terra", "aire", "anima"],
};

// Quan s'encén el LED, Fra Francesc consagra l'equip des del màster i el mòbil passa a Guardians
// (components/player/Gresol.tsx). El número de cada fita és la posició del seu element en aquest ordre.
// PENDENT (idea de l'usuari, 2026-09-23): una "fórmula màgica" matemàtica en aquesta pantalla on
// s'hagin de posar els números trobats. Si es fa, la solució anirà a content/private/ i es validarà
// al servidor amb una API nova.
