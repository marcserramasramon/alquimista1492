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

export interface IntroduccioAr {
  titol: string;
  /** Una línia sota el títol, abans dels passos. */
  entrada: string;
  /** Com funciona, en poques línies, cadascuna amb la seva icona. */
  passos: { icona: string; text: string }[];
  /** Què demanarà el mòbil i per què, perquè els avisos del navegador no sorprenguin ningú. */
  permisos: { titol: string; items: { icona: string; text: string }[]; nota: string };
  consells: string[];
  /** Línia final: l'extra no afecta la partida. */
  nota: string;
  boto: string;
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
  /** Pantalla d'entrada de l'extra, abans de demanar càmera i sensors: explica com funciona. */
  introduccio: IntroduccioAr;
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
      entrada: "Hi ha algú que us vigila. Això és el que heu de fer:",
      passos: [
        { icona: "👀", text: "Aixequeu el mòbil i gireu-lo a poc a poc al vostre voltant." },
        { icona: "🔴", text: "Quan una vora de la pantalla es posa vermella, gireu-vos cap a aquell costat." },
        { icona: "📣", text: "Si s'acosta massa, crideu perquè marxi." },
      ],
      permisos: {
        titol: "El mòbil us demanarà permís per a:",
        items: [
          { icona: "📷", text: "Càmera: per veure el que teniu al davant." },
          { icona: "🧭", text: "Moviment i brúixola: per saber cap a on mireu." },
          { icona: "🎤", text: "Micròfon: només mesura el volum del crit. No es grava res ni s'envia enlloc." },
        ],
        nota: "Si no en voleu donar algun, es pot jugar igualment: arrossegueu el dit per mirar i toqueu «Cridar!».",
      },
      consells: [
        "Mireu on trepitgeu: no camineu mentre mireu la pantalla.",
        "Si hi ha gent a prop, parleu baix. El botó 🔊 de dalt silencia el so.",
      ],
      nota: "És només un extra: no canvia res de la partida.",
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
