/**
 * Extres de realitat augmentada — contingut públic.
 *
 * Són un divertimento: no compten per a res del joc (ni progrés, ni punts, ni pistes) i el
 * servidor no en sap res. Cada extra té un punt GPS propi, a prop d'una fita però diferent del
 * punt de la fita, i quan l'equip hi arriba l'app li ofereix mirar-lo.
 * Res d'aquí és una solució: es pot enviar al client sense risc.
 */

export type EscenaAr = "ulls-siluetes";

export interface PuntGps {
  latitud: number;
  longitud: number;
}

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
  /** Punt GPS on s'ofereix l'extra. */
  latitud: number;
  longitud: number;
  /**
   * Direcció del camí que fa el jugador, de `des` cap a `cap`. La figura apareix en aquesta
   * direcció (al davant) o a la contrària (al darrere), la que quedi més a prop d'on mira el jugador.
   * Sense camí, apareix on mira el mòbil.
   */
  cami?: { des: PuntGps; cap: PuntGps };
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
    // Pas 1 de l'Aire: 41°54'41.4"N 2°13'34.7"E, a uns 47 m de la Creu del Pujolar.
    latitud: 41.9115,
    longitud: 2.226306,
    // El camí va cap al WSW (rumb ≈ 250°): de 41°54'41.4"N 2°13'34.7"E a 41°54'40.7"N 2°13'32.1"E.
    cami: {
      des: { latitud: 41.9115, longitud: 2.226306 },
      cap: { latitud: 41.911306, longitud: 2.225583 },
    },
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

/** Rumb (graus des del nord, sentit horari) del camí d'un extra, o null si no en té. */
export function rumbCami(extra: ExtraAr): number | null {
  if (!extra.cami) return null;
  const RAD = Math.PI / 180;
  const { des, cap } = extra.cami;
  const dLng = (cap.longitud - des.longitud) * RAD;
  const y = Math.sin(dLng) * Math.cos(cap.latitud * RAD);
  const x =
    Math.cos(des.latitud * RAD) * Math.sin(cap.latitud * RAD) -
    Math.sin(des.latitud * RAD) * Math.cos(cap.latitud * RAD) * Math.cos(dLng);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}
