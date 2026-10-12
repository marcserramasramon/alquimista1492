/**
 * Extres de realitat augmentada — contingut públic.
 *
 * Són un divertimento: no compten per a res del joc (ni progrés, ni punts, ni pistes) i el
 * servidor no en sap res. S'activen amb un botó a la pantalla de la fita (o del seu pas previ).
 * Res d'aquí és una solució: es pot enviar al client sense risc.
 */

export type EscenaAr = "ulls-siluetes" | "fantasmes" | "foc";

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
   * Fita (o pas previ d'una fita) on s'activa l'extra: a la seva pantalla (components/vistes/
   * VistaEstacio.tsx) surt un botó per començar-lo. No s'activa per GPS.
   */
  fitaId: string;
  escena: EscenaAr;
  /**
   * Només per a "ulls-siluetes": com es dibuixa la figura. En "3d", amb el model GLB (components/ar/
   * Figura3D) i, si el mòbil no pot, amb la imatge plana; en "plana", sempre la imatge. Amb
   * `?figura=plana` a l'adreça es força la plana per provar.
   */
  figura?: "3d" | "plana";
  /**
   * Direcció del camí que fa el jugador, de `des` cap a `cap`. La figura apareix en aquesta
   * direcció (al davant) o a la contrària (al darrere), la que quedi més a prop d'on mira el jugador.
   * Sense camí, apareix on mira el mòbil.
   */
  cami?: { des: PuntGps; cap: PuntGps };
  /** Només per a "fantasmes": el punt de llum (portal) es col·loca a aquesta posició GPS; si no es pot, davant del jugador. */
  puntLlum?: PuntGps;
  /** Text del botó de la pantalla de la fita (o del pas). */
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
  // Extra de la pista de skate (fita d'Ànima): fantasmes grans, ànimes petites i portals de llum. No té res a veure amb el mode guia del Camí de Malla (altre extra).
  {
    id: "anima-fantasmes",
    fitaId: "anima",
    escena: "fantasmes",
    puntLlum: { latitud: 41.910375056093535, longitud: 2.2300781047600005 },
    boto: "👻 Mirar les ànimes",
    introduccio: {
      titol: "Ànimes a la foscor",
      entrada: "A la pista hi ha fantasmes i ànimes errants. Això és el que veureu i podreu fer:",
      passos: [
        { icona: "👀", text: "Aixequeu el mòbil i gireu-lo a poc a poc: els fantasmes us observen des de lluny." },
        { icona: "🌀", text: "Els portals de llum són per on surten els fantasmes grans, que caçaran les ànimes petites i se les enduran." },
        { icona: "📷", text: "Toqueu el botó de la càmera (a baix a la dreta) per fer un flaix: els fantasmes grans que il·lumini es dissoldran." },
        { icona: "📣", text: "Si en voleu fer marxar, crideu." },
      ],
      permisos: {
        titol: "El mòbil us demanarà permís per a:",
        items: [
          { icona: "📷", text: "Càmera: per veure el que teniu al davant." },
          { icona: "🧭", text: "Moviment i brúixola: per saber cap a on mireu." },
          { icona: "🎤", text: "Micròfon: només mesura el volum del crit. No es grava res ni s'envia enlloc." },
          { icona: "📍", text: "Ubicació: per posar el punt de llum al seu lloc. No es desa ni s'envia enlloc." },
        ],
        nota: "Si no en voleu donar algun, es pot jugar igualment: arrossegueu el dit per mirar i toqueu «Cridar!».",
      },
      consells: [
        "Mireu on trepitgeu: no camineu mentre mireu la pantalla.",
        "Si hi ha gent a prop, parleu baix. El botó 🔊 de dalt silencia el so.",
        "Això no té res a veure amb la prova de la fita: no hi trobareu cap pista.",
      ],
      nota: "És només un extra: no canvia res de la partida.",
      boto: "Obrir els ulls",
    },
  },
  {
    id: "foc-flames",
    fitaId: "foc",
    escena: "foc",
    boto: "🔥 Mirar a través del foc",
    introduccio: {
      titol: "Foc a la foscor",
      entrada: "El foc us envolta. Això és el que veureu:",
      passos: [
        { icona: "👀", text: "Aixequeu el mòbil i gireu-lo a poc a poc al vostre voltant." },
        { icona: "🔥", text: "Arcs de flames surten de terra i hi tornen a entrar, com dofins." },
        { icona: "🧍", text: "Enfoqueu els companys: el foc els dibuixarà un contorn vermell." },
      ],
      permisos: {
        titol: "El mòbil us demanarà permís per a:",
        items: [
          { icona: "📷", text: "Càmera: per veure el que teniu al davant. La imatge no es grava ni s'envia enlloc." },
          { icona: "🧭", text: "Moviment i brúixola: per saber cap a on mireu." },
        ],
        nota: "Si no en voleu donar algun, es pot veure igualment: arrossegueu el dit per mirar. Sense càmera no hi ha contorns.",
      },
      consells: [
        "Mireu on trepitgeu: no camineu mentre mireu la pantalla.",
        "Cal xarxa: els contorns es calculen amb un model que es baixa en obrir l'extra.",
        "Això no té res a veure amb la prova de la fita: no hi trobareu cap pista.",
      ],
      nota: "És només un extra: no canvia res de la partida.",
      boto: "Encendre el foc",
    },
  },
];

export function getExtraAr(id: string): ExtraAr | undefined {
  return EXTRES_AR.find((e) => e.id === id);
}

/** L'extra que s'activa des de la pantalla d'una fita o d'un pas previ, si en té. */
export function getExtraArDeFita(fitaId: string): ExtraAr | undefined {
  return EXTRES_AR.find((e) => e.fitaId === fitaId);
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
