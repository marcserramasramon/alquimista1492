/**
 * Extres de realitat augmentada — contingut públic.
 *
 * Són un divertimento: no compten per a res del joc (ni progrés, ni punts, ni pistes) i el
 * servidor no en sap res. Cada extra té un punt GPS propi, a prop d'una fita però diferent del
 * punt de la fita, i quan l'equip hi arriba l'app li ofereix mirar-lo.
 * Res d'aquí és una solució: es pot enviar al client sense risc.
 */

export type EscenaAr = "ulls-siluetes";

export interface ExtraAr {
  id: string;
  /** Fita (o pas previ) a prop de la qual viu l'extra; només és informatiu. */
  fitaId: string;
  escena: EscenaAr;
  /**
   * Com es dibuixa la figura: en "3d" amb el model GLB (components/ar/Figura3D) i, si el mòbil no
   * pot, amb la imatge plana; en "plana", sempre la imatge. Amb `?figura=plana` a l'adreça es
   * força la plana per provar.
   */
  figura: "3d" | "plana";
  /** PROVISIONAL: cal substituir-lo pel punt GPS definitiu. */
  latitud: number;
  longitud: number;
  /** A menys d'aquesta distància (m) l'app ofereix l'extra. */
  radiM: number;
  /** Targeta que surt al hub en arribar-hi. */
  targeta: { titol: string; text: string; boto: string; descartar: string };
  /** Pantalla d'entrada de l'extra, abans de demanar càmera i sensors. */
  introduccio: { titol: string; text: string; boto: string };
}

export const EXTRES_AR: ExtraAr[] = [
  {
    id: "aire-ulls",
    fitaId: "aire-pas",
    escena: "ulls-siluetes",
    figura: "3d",
    // PROVISIONAL: uns 45 m al nord de la Creu del Pujolar (pas previ de l'Aire, 41.911628, 2.226846).
    latitud: 41.912033,
    longitud: 2.226846,
    radiM: 30,
    targeta: {
      titol: "Algú us vigila",
      text: "Sentiu que no esteu sols. Voleu mirar què hi ha entre les ombres?",
      boto: "Mirar la foscor",
      descartar: "Ara no",
    },
    introduccio: {
      titol: "Ulls en la foscor",
      text: "Aixequeu el mòbil i girau-lo a poc a poc al vostre voltant. Hi ha qui us segueix, però no li agrada que el mirin.",
      boto: "Obrir els ulls",
    },
  },
];

export function getExtraAr(id: string): ExtraAr | undefined {
  return EXTRES_AR.find((e) => e.id === id);
}
