/**
 * Extres de realitat augmentada — contingut públic.
 *
 * Són un divertimento: no compten per a res del joc (ni progrés, ni punts, ni pistes) i el
 * servidor no en sap res. S'activen amb un botó a la fitxa del pas previ d'una fita.
 * Res d'aquí és una solució: es pot enviar al client sense risc.
 */

export type EscenaAr = "ulls-siluetes";

export interface PuntGps {
  latitud: number;
  longitud: number;
}

export interface ExtraAr {
  id: string;
  /**
   * Pas previ (check-in) de la fita on s'activa l'extra: a la fitxa d'aquest pas, un cop obert,
   * surt un botó per començar-lo (components/vistes/VistaHub.tsx, FitxaFita). No s'activa per GPS.
   */
  fitaId: string;
  escena: EscenaAr;
  /**
   * Com es dibuixa la figura: en "3d" amb el model GLB (components/ar/Figura3D) i, si el mòbil no
   * pot, amb la imatge plana; en "plana", sempre la imatge. Amb `?figura=plana` a l'adreça es
   * força la plana per provar.
   */
  figura: "3d" | "plana";
  /**
   * Direcció del camí que fa el jugador, de `des` cap a `cap`. La figura apareix en aquesta
   * direcció (al davant) o a la contrària (al darrere), la que quedi més a prop d'on mira el jugador.
   * Sense camí, apareix on mira el mòbil.
   */
  cami?: { des: PuntGps; cap: PuntGps };
  /** Text del botó de la fitxa del pas. */
  boto: string;
  /** Pantalla d'entrada de l'extra, abans de demanar càmera i sensors. */
  introduccio: { titol: string; text: string; boto: string };
}

export const EXTRES_AR: ExtraAr[] = [
  {
    id: "aire-ulls",
    fitaId: "aire-pas",
    escena: "ulls-siluetes",
    figura: "3d",
    // El camí va cap al WSW (rumb ≈ 250°): de 41°54'41.4"N 2°13'34.7"E a 41°54'40.7"N 2°13'32.1"E.
    cami: {
      des: { latitud: 41.9115, longitud: 2.226306 },
      cap: { latitud: 41.911306, longitud: 2.225583 },
    },
    boto: "👁 Mirar la foscor",
    introduccio: {
      titol: "Ulls en la foscor",
      text: "Aixequeu el mòbil i girau-lo a poc a poc al vostre voltant. Hi ha qui us segueix. Si s'acosta massa, crideu perquè marxi: us demanarem el micròfon.",
      boto: "Obrir els ulls",
    },
  },
];

export function getExtraAr(id: string): ExtraAr | undefined {
  return EXTRES_AR.find((e) => e.id === id);
}

/** L'extra que s'activa des de la fitxa d'un pas previ, si en té. */
export function getExtraArDelPas(pasId: string): ExtraAr | undefined {
  return EXTRES_AR.find((e) => e.fitaId === pasId);
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
