/**
 * Configuració de la pantalla final del Pla del Masset (arribada i ritual).
 * docs/textos-nova.md § 4.
 *
 * El ritual físic del Gresol (recipients, líquids i LED) ha quedat substituït per l'AR de
 * «La Conjunció dels Astres» (components/ar/conjuncio). Tot el que hi ha aquí és públic.
 */

/**
 * Com es passa de 4a (arribada) a 4b (ritual).
 * - "boto-equip": l'equip prem un botó quan ja ha respost la contrasenya (actual).
 * - "una-pantalla": les dues parts una sota l'altra, sense botó.
 * PENDENT (docs/textos-nova.md § 4b): també es parla d'un botó del màster o d'un codi;
 * cap dels dos està implementat (caldria estat al servidor o una solució a content/private).
 */
export type TransicioGresol = "boto-equip" | "una-pantalla";

export const GRESOL_CONFIG: { transicio: TransicioGresol } = {
  transicio: "boto-equip",
};
