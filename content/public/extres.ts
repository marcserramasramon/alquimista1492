/**
 * Extres de realitat augmentada — contingut públic.
 *
 * Són un divertimento: no compten per a res del joc (ni progrés, ni punts, ni pistes) i el
 * servidor no en sap res. S'activen amb un botó a la pantalla de la fita (o del seu pas previ).
 * Res d'aquí és una solució: es pot enviar al client sense risc.
 */

export type EscenaAr = "ulls-siluetes" | "fantasmes" | "foc" | "guies" | "aigua" | "terra";

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
   * VistaEstacio.tsx) surt un botó per començar-lo. No s'activa per GPS. Sense `fitaId`, l'extra
   * s'obre des d'un altre lloc (p. ex. el botó d'un vídeo del màster, vegeu `ar` a
   * content/public/missatgesMaster.ts), cap a /joc/ar/{id}.
   */
  fitaId?: string;
  escena: EscenaAr;
  /**
   * Només per a "ulls-siluetes": com es dibuixa la figura. En "3d", amb el model GLB (components/ar/
   * Figura3D) i, si el mòbil no pot, amb la imatge plana; en "plana", sempre la imatge. Amb
   * `?figura=plana` a l'adreça es força la plana per provar.
   */
  figura?: "3d" | "plana";
  /**
   * Només per a "ulls-siluetes", "guies", "aigua" i "terra". En "ulls-siluetes": direcció del camí que fa el jugador, de `des` cap a `cap`. La figura apareix en aquesta
   * direcció (al davant) o a la contrària (al darrere), la que quedi més a prop d'on mira el jugador.
   * Sense camí, apareix on mira el mòbil. En "terra": de la fita (`des`) cap a les àmfores (`cap`).
   */
  cami?: { des: PuntGps; cap: PuntGps };
  /**
   * Només per a "terra" (o qualsevol extra amb `fitaId`): el botó surt a la pantalla d'arribada de la fita
   * (la narració de Fra Francesc, abans de la prova), en lloc de sortir quan la prova és resolta.
   */
  arribada?: boolean;
  /**
   * Només per a "aigua": ample del riu en metres (3 per defecte). El riu corre en el sentit de `cami`
   * (si n'hi ha: el carrer on som) i passa pels peus del jugador.
   */
  ampleRiu?: number;
  /**
   * Només per a "aigua": abans de l'escena, el jugador mira al llarg del carrer i toca «Aquí»: la
   * direcció del riu és la que marca la brúixola en aquell moment (corregeix el seu error de 10-20°).
   * `indicacio` diu cap a on mirar. Sense sensors, o si es salta, es fa servir `cami`.
   */
  calibratge?: { indicacio: string };
  /**
   * Només per a "aigua": aigües amunt (darrere del jugador, contra el corrent) el riu s'obre en una
   * bassa: comença `distancia` m darrere seu i té `radi` m de semiample. Sense, el riu és sempre estret.
   */
  explanada?: { distancia: number; radi: number };
  /** Només per a "fantasmes": el punt de llum (portal) es col·loca a aquesta posició GPS; si no es pot, davant del jugador. */
  puntLlum?: PuntGps;
  /** Text del botó de la pantalla de la fita (o del pas), o del vídeo del màster que hi porta. */
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
        { icona: "💥", text: "Toqueu el botó 💥 (a baix a la dreta) per fer un flaix: els fantasmes grans que il·lumini es dissoldran." },
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
  {
    // Ràpids de riu que passen pels peus: s'activa un cop resolta la fita de la Font del Lleó.
    id: "aigua-rapids",
    fitaId: "font-ferro",
    escena: "aigua",
    ampleRiu: 3,
    // Carrer del Call: el riu baixa pel carrer (rumb ≈ 148°, cap al SE, cap al Carrer Major) i els
    // jugadors són a dalt (41°54'53.1"N 2°13'39.1"E). Darrere seu, al final del carrer, hi ha una
    // explanada que queda plena d'aigua: la distància i el radi són estimats, es retoquen aquí.
    cami: {
      des: { latitud: 41.91474257278738, longitud: 2.227530891604852 },
      cap: { latitud: 41.914111267352745, longitud: 2.2280573189292294 },
    },
    explanada: { distancia: 6, radi: 12 },
    calibratge: { indicacio: "Mireu cap avall del carrer, cap al Carrer Major, amb el mòbil dret, i toqueu «Aquí»." },
    boto: "🌊 Mirar l'aigua als peus",
    introduccio: {
      titol: "Ràpids als peus",
      entrada: "L'aigua us corre pels peus. Això és el que veureu:",
      passos: [
        { icona: "👇", text: "Abaixeu el mòbil cap als peus i gireu-lo a poc a poc al vostre voltant." },
        { icona: "🌊", text: "Un riu de ràpids d'uns 3 metres d'ample us passa pels peus: ones, escuma i esquitxades." },
        { icona: "🧍", text: "Els companys es queden per damunt de l'aigua, com si hi caminessin." },
        { icona: "🦁", text: "Quan una vora de la pantalla es posa blava, gireu-vos cap a aquell costat: un lleó d'aigua hi sortirà. Vindrà dues vegades, des de dos costats oposats." },
      ],
      permisos: {
        titol: "El mòbil us demanarà permís per a:",
        items: [
          { icona: "📷", text: "Càmera: per veure el que teniu al davant. La imatge no es grava ni s'envia enlloc." },
          { icona: "🧭", text: "Moviment i brúixola: per saber cap a on mireu." },
        ],
        nota: "Si no en voleu donar algun, es pot veure igualment: arrossegueu el dit per mirar. Sense càmera no es distingeixen les persones.",
      },
      consells: [
        "Mireu on trepitgeu: no camineu mentre mireu la pantalla.",
        "Activeu el so: sense ell, els ràpids perden la meitat de la gràcia.",
        "Cal xarxa: les persones es separen de l'aigua amb un model que es baixa en obrir l'extra.",
        "Això no té res a veure amb la prova de la fita: no hi trobareu cap pista.",
      ],
      nota: "És només un extra: no canvia res de la partida.",
      boto: "Deixar córrer l'aigua",
    },
  },
  {
    // Les ànimes guia del Camí de Malla, cap a la fita d'Ànima: ànimes petites que volen en línia recta
    // pel camí perquè els jugadors les segueixin. S'hi arriba des del botó del vídeo «anima-cami-malla».
    // No té res a veure amb l'extra «anima-fantasmes» (pista de skate).
    id: "anima-guies",
    escena: "guies",
    // El camí és recte: les ànimes volen de `des` cap a `cap` (rumb ≈ 166°).
    cami: {
      des: { latitud: 41.91204496697212, longitud: 2.229078742596555 },
      cap: { latitud: 41.91042050733091, longitud: 2.2296204391033148 },
    },
    boto: "👻 Veure les ànimes guiar-nos",
    introduccio: {
      titol: "Les ànimes us guien",
      entrada: "Les ànimes d'aquest camí saben on és la fita i us hi acompanyen. Això és el que veureu:",
      passos: [
        { icona: "👻", text: "Unes ànimes petites sorgeixen al vostre voltant i volen camí avall, cap a la fita d'Ànima." },
        { icona: "🚶", text: "Seguiu-les: el camí és recte i us hi duen." },
        { icona: "🧭", text: "Aixequeu el mòbil i gireu-lo a poc a poc. Si no en veieu cap, un avís us dirà cap a on mirar." },
      ],
      permisos: {
        titol: "El mòbil us demanarà permís per a:",
        items: [
          { icona: "📷", text: "Càmera: per veure el camí amb les ànimes al damunt. La imatge no es grava ni s'envia enlloc." },
          { icona: "🧭", text: "Moviment i brúixola: per saber cap a on mireu." },
        ],
        nota: "Si no en voleu donar algun, es pot veure igualment: arrossegueu el dit per mirar al voltant.",
      },
      consells: [
        "Mireu on trepitgeu: no camineu mentre mireu la pantalla. Atureu-vos per mirar i després seguiu.",
        "Si hi ha gent a prop, parleu baix.",
      ],
      nota: "És només un extra: no canvia res de la partida.",
      boto: "Veure les ànimes",
    },
  },
  {
    // Esquerda de llum i runes de la Terra: des de la fita de Planes Bones fins a les àmfores, que cal comptar.
    // Surt a la pantalla d'arribada de la fita (`arribada`), no quan la prova està resolta.
    id: "terra-cami",
    fitaId: "planes-bones",
    arribada: true,
    escena: "terra",
    // La fita (des) i les àmfores (cap): ~180 m cap a l'est-sud-est (rumb ≈ 107°).
    cami: {
      des: { latitud: 41.91227654730743, longitud: 2.2334459962925832 },
      cap: { latitud: 41.91180905920371, longitud: 2.235562619810543 },
    },
    boto: "🧭 Seguiu la Terra",
    introduccio: {
      titol: "La Terra us guia",
      entrada: "El terra mateix us guiarà fins al lloc. Això és el que veureu:",
      passos: [
        { icona: "🌊", text: "El terra és una malla de punts de llum que oneja suaument. Des de la vostra posició surt una ona que avança cap al lloc final." },
        { icona: "🧭", text: "La brúixola de baix a la dreta marca cap al lloc. Quan sou sobre el camí, el triangle de la Terra vibra amb guspires daurades." },
        { icona: "📍", text: "Quan hi arribeu, mireu a terra." },
      ],
      permisos: {
        titol: "El mòbil us demanarà permís per a:",
        items: [
          { icona: "📷", text: "Càmera: per veure el que teniu al davant. La imatge no es grava ni s'envia enlloc." },
          { icona: "🧭", text: "Moviment i brúixola: per saber cap a on mireu." },
          { icona: "📍", text: "Ubicació: per saber on sou i guiar-vos. No es desa ni s'envia enlloc." },
        ],
        nota: "Sense ubicació no hi ha camí que mostrar. Si no en voleu donar la càmera, es pot seguir igualment: arrossegueu el dit per mirar.",
      },
      consells: [
        "Mireu on trepitgeu: no camineu mentre mireu la pantalla. Atureu-vos per mirar i després seguiu.",
        "El GPS pot trigar uns segons a trobar-vos. Si el camí no apareix, espereu i sortiu a l'aire lliure.",
      ],
      nota: "És només un extra: no canvia res de la partida.",
      boto: "Començar",
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
