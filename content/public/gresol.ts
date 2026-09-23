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
  ordreElements: ["aigua", "terra", "foc", "aire", "anima"],
};

// PENDENT (docs/fites-nova.md): què revela el Gresol i si l'app demana cap codi. No hi ha cap
// camp de resposta: quan es decideixi, caldrà una API (app/api/) i la solució a content/private/.
