/**
 * Textos narratius i d'interfície que veuen els jugadors (docs/textos-nova.md).
 * Cap text és una solució: es pot enviar al client sense risc.
 *
 * `audio` és la ruta del fitxer gravat amb la veu de Fra Francesc (public/audio/).
 * L'àudio ha de dir exactament els `paragrafs`: si se'n canvia un, cal regenerar-lo.
 */

import type { Element } from "@/content/public/estacions";

export interface TextNarratiu {
  /** Les arribades no en porten: la pantalla ja mostra el nom de la fita. */
  titol?: string;
  paragrafs: string[];
  audio?: string;
}

// 1. Introducció — el missatge secret
export const MISSATGE_SECRET: TextNarratiu & { signatura: string } = {
  titol: "Un missatge per a vosaltres",
  paragrafs: [
    "Sentfores, any de Nostre Senyor de 1472.",
    "Si llegiu aquestes línies, és que us he triat.",
    "Em dic Fra Francesc de Sentfores. Tota la vida he servit l'Orde del Testament, que guarda una recepta més antiga que les pedres del castell: el camí per obtenir la Pedra Filosofal.",
    "La guerra ho ha capgirat tot. El castell de Sentfores ha caigut, i amb ell la nostra casa. Hi ha gent que cobeja la recepta per fer-ne mal ús, i el Sant Ofici persegueix tothom qui gosa practicar l'art de la transmutació.",
    "Per això vaig partir la Gran Obra en cinc fragments — Aigua, Terra, Foc, Aire i Ànima — i els vaig amagar al voltant del poble. Trobeu-los. Demostreu que sou dignes de guardar-los.",
    "Aquestes pàgines us guiaran: us diran on anar i guardaran cada fragment que trobeu.",
    "Aneu amb compte: un home del Sant Ofici ronda per aquests carrers. Si se us acosta, no us deixeu espantar i seguiu el camí.",
    "Que el foc de l'Atanor us guiï.",
  ],
  signatura: "— Fra F.",
  audio: "/audio/intro.mp3",
};

// 2.1 Arribada a cada fita (es mostra en obrir-la)
export const ARRIBADES: Record<Element, TextNarratiu> = {
  aigua: {
    paragrafs: [
      "Escolteu. Sentiu l'aigua? Aquesta font ha donat de beure al poble des de sempre, i ningú no s'ha preguntat mai què més hi porta. Busqueu el meu escrit: és mut fins que l'Aigua el toca.",
    ],
    audio: "/audio/arribada-aigua.mp3",
  },
  terra: {
    paragrafs: [
      "Heu arribat a Planes Bones. Aquí, uns guardians de fang vetllen la matèria des de fa molt de temps. La Terra no regala res i no parla amb fórmules: obriu bé els ulls, trobeu on reposen i digueu-me quants són.",
    ],
    audio: "/audio/arribada-terra.mp3",
  },
  foc: {
    paragrafs: [
      "Aquesta és la porta del poble: tothom hi passa i ningú no s'hi atura. Per això hi vaig amagar el Foc. Un foc que no crema ni fa fum, però que ho veu tot. Mireu a través d'ell, i el soroll callarà.",
    ],
    audio: "/audio/arribada-foc.mp3",
  },
  aire: {
    paragrafs: [
      "Heu pujat fins a la creu. Aquí dalt el vent no para mai i s'emporta les paraules abans que ningú les senti. L'Aire hi amaga un número que l'ull no veu. Només el vostre alè el farà visible.",
    ],
    audio: "/audio/arribada-aire.mp3",
  },
  anima: {
    paragrafs: [
      "Aquest lloc és ple de pujades i caigudes. Qui hi ve cau, s'aixeca i torna a provar-ho, com l'alquimista davant del gresol. L'Ànima no es mostra a la llum del dia: porteu la vostra llum porpra i busqueu-la allà on s'arriba més amunt.",
    ],
    audio: "/audio/arribada-anima.mp3",
  },
};

// 2.2 Fragment de cada fita (es desbloqueja en resoldre-la)
export const FRAGMENTS: Record<Element, TextNarratiu> = {
  aigua: {
    titol: "El fragment de l'Aigua",
    paragrafs: [
      "L'Aigua és el primer element que vaig aprendre a escoltar. Tot el que brolla porta alguna cosa de dins la terra, i res no s'hi pot amagar gaire temps.",
      "Per això hi vaig deixar un fragment: l'Aigua dissol, neteja i revela. Qui sap mirar-la ja ha començat el camí.",
    ],
    audio: "/audio/fragment-aigua.mp3",
  },
  terra: {
    titol: "El fragment de la Terra",
    paragrafs: [
      "Sofre, mercuri i sal: els tres principis que tota cosa porta a dins. L'Orde els guardava en gerres de fang, perquè la terra és pacient i no delata ningú.",
      "Les heu hagut de buscar una a una per trobar aquest fragment, i així ha de ser: qui vol entendre la matèria, primer l'ha de saber veure. La Terra és el cos de totes les coses.",
    ],
    audio: "/audio/fragment-terra.mp3",
  },
  foc: {
    titol: "El fragment del Foc",
    paragrafs: [
      "Em van prohibir treballar amb foc. Em van prendre els forns i els alambins. Però el foc no s'apaga perquè ho mani un tribunal: el vaig tancar dins d'un vidre, i ara és ell qui mira per mi.",
      "Qui entra al poble passa per aquí sense veure res. Vosaltres, amb el foc als ulls, heu vist el que s'amagava enmig del soroll.",
    ],
    audio: "/audio/fragment-foc.mp3",
  },
  aire: {
    titol: "El fragment de l'Aire",
    paragrafs: [
      "Dalt del serrat, el vent ho escampa tot: les paraules, les cendres, els rumors. L'Aire és l'únic element que no es pot tancar en cap gerra.",
      "El vaig deixar al peu de la creu, on la gent ve a pregar, perquè ningú no sospita d'un lloc sant. I recordeu-ho: el vostre alè també és Aire. Mentre respireu, la Gran Obra és viva.",
    ],
    audio: "/audio/fragment-aire.mp3",
  },
  anima: {
    titol: "El fragment de l'Ànima",
    paragrafs: [
      "Aigua, Terra, Foc i Aire fan el món. Però en falta un que els uneixi: la Quinta Essència, l'Ànima.",
      "L'Ànima no es troba a la vall ni al pla tranquil. S'amaga allà on s'ha pujat més amunt, i per arribar-hi cal caure i tornar-se a aixecar. Així es fa la Gran Obra: cada caiguda és una prova, i cada vegada que us aixequeu, us transformeu una mica. Com la meva vida. Com la vostra, si seguiu aquest camí.",
    ],
    audio: "/audio/fragment-anima.mp3",
  },
};

const CONTRASENYA =
  "Quan hi arribeu, algú us dirà: «El temps es consumeix.» Si sou dignes, sabreu respondre: «Però el foc de l'Atanor es manté.»";

// 3. Totes les fites completades
export const ESTRELLA_COMPLETA: TextNarratiu = {
  titol: "L'estrella és completa",
  paragrafs: [
    "Els cinc fragments són vostres.",
    "Mireu el mapa: Aigua, Terra, Foc, Aire i Ànima dibuixen una estrella de cinc puntes. És el signe de l'Orde del Testament: els quatre elements units sota la Quinta Essència. No és cap casualitat. La vaig traçar jo, pas a pas, sobre la terra del poble.",
    "I tota estrella té un cor. Les seves línies es creuen al Pla de Masset.",
    "Aneu-hi. Allà s'acaba el camí… i allà trobareu qui us ha vigilat tota la nit.",
    CONTRASENYA,
  ],
  audio: "/audio/estrella.mp3",
};

// 3b. S'acaba el temps
export const TEMPS_CONSUMIT: TextNarratiu = {
  titol: "El temps s'ha consumit",
  paragrafs: [
    "El temps s'ha consumit. Els astres ja no estan alineats i la Gran Obra no pot esperar més.",
    "Deixeu el que estigueu fent i aneu al Pla de Masset, al cor de l'estrella. Porteu els fragments que hàgiu trobat. Allà us espera qui us ha vigilat tota la nit.",
    CONTRASENYA,
  ],
  audio: "/audio/temps.mp3",
};

// 4a. Pla de Masset, en arribar (abans del desemmascarament; sense àudio)
export const GRESOL_ARRIBADA: TextNarratiu = {
  titol: "El cor de l'estrella",
  // Parteix del text de docs/textos-nova.md § 4a, sense fets nous ni desvelar qui és l'Inquisidor.
  paragrafs: [
    "Sou al cor de l'estrella. Aquí es creuen les cinc línies que heu seguit, de l'Aigua fins a l'Ànima. Aquí s'acaba el camí i comença la Gran Obra.",
    "Reuniu tot l'equip, guardeu bé els fragments que porteu i espereu aquí. No marxeu.",
    "Algú vindrà a trobar-vos: qui us ha vigilat tota la nit. Us dirà: «El temps es consumeix.»",
    "Si sou dignes, respondreu sense dubtar: «Però el foc de l'Atanor es manté.» Llavors tot tindrà sentit.",
  ],
};

/** 4a → 4b amb GRESOL_CONFIG.transicio = "boto-equip" (PENDENT, content/public/gresol.ts). */
export const GRESOL_BOTO_RITUAL = {
  avis: "Premeu-lo només quan us hagin dit «El temps es consumeix» i hàgiu respost.",
  boto: "Hem respost la contrasenya",
};

// 4b. El ritual: Fra Francesc els ensenya la recepta i aboquen els cinc líquids (docs/fites-nova.md)
export const GRESOL_RITUAL: TextNarratiu = {
  titol: "El Gresol dels Cinc Elements",
  paragrafs: [
    "Davant vostre hi ha el gresol i cinc recipients, un per cada element que heu recollit: l'Aigua de Lluna, la Cendra de la Creació, l'Espurna de Rubí, l'Alè d'Eòl i la Quinta Essència.",
    "Fra Francesc us ensenyarà la recepta de la Pedra Filosofal. Uniu els cinc elements tal com us indiqui i observeu bé el gresol: quan hi entri l'Ànima, la matèria parlarà.",
  ],
};

/**
 * 4b. Què han de fer, pas a pas. Text provisional d'interfície (no és a docs/textos-nova.md):
 * no diu què revela el Gresol, que és PENDENT a docs/fites-nova.md (l'ordre el mostra la llista de recipients).
 */
export const GRESOL_PASSOS = {
  titol: "Què heu de fer",
  passos: [
    "No toqueu res fins que Fra Francesc us ho digui.",
    "Afegiu cada element al gresol quan us l'indiqui, un darrere l'altre i sense pressa.",
    "Quan hi entri la Quinta Essència, mireu bé el gresol: la matèria parlarà.",
  ],
  seguretat: "Res del que hi ha a la taula es beu ni es tasta.",
  recipients: "Els cinc recipients",
};

// 5. Pantalla final
export const GUARDIANS: TextNarratiu & { lema: string; traduccioLema: string } = {
  titol: "Guardians del Secret",
  paragrafs: [
    "La matèria ha parlat, i Fra Francesc ha vist el que havia de veure.",
    "Heu reunit l'Aigua, la Terra, el Foc, l'Aire i l'Ànima. Heu sentit l'amenaça i no us heu aturat. Heu confiat els uns en els altres.",
    "Des d'avui sou Guardians del Secret de Sentfores i l'Orde del Testament viu en vosaltres. La fórmula de la Pedra Filosofal és vostra: guardeu-la i no la doneu mai a qui en voldria fer mal ús.",
  ],
  lema: "Veritas et Materia in unum vertuntur.",
  traduccioLema: "La Veritat i la Matèria es fan una de sola.",
};

// 6. Textos d'interfície
export const BENVINGUDA = {
  frase: "Sentfores, 1472. Un secret us espera.",
  installar: "Tingueu-la a mà: us acompanyarà tota la nit.",
};

export const RESPOSTA_CORRECTA = "Fragment trobat!";

export const CORRECTE_PER_ELEMENT: Record<Element, string> = {
  aigua: "L'Aigua us ha revelat el seu secret.",
  terra: "La Terra us ha confiat el seu secret.",
  foc: "El Foc us ha mostrat el seu secret.",
  aire: "L'Aire us ha xiuxiuejat el seu secret.",
  anima: "L'Ànima us ha obert el seu secret.",
};

/** Es van alternant a cada intent fallat. */
export const RESPOSTES_INCORRECTES = [
  "La matèria no respon. Torneu-ho a provar.",
  "Encara no. Mireu-ho amb més calma.",
  "Aquest no és el secret. L'element encara calla.",
];

/** Resposta enviada abans que passin ESPERA_ENTRE_INTENTS_MS de l'anterior. */
export const RESPOSTA_MASSA_RAPIDA = "Espereu un moment abans de tornar-ho a provar.";

export const PISTES = {
  titol: "Necessiteu ajuda?",
  subtitol: "Fra Francesc va deixar tres ajudes per a cada fragment. S'obren d'una en una.",
  confirmacio: "Segur que voleu veure la resposta? Us donarà el fragment, però no l'haureu descobert vosaltres.",
  cancelar: "No, seguim buscant",
  confirmar: "Sí, mostra-la",
};
