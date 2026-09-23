/**
 * Missatges que el màster pot enviar als equips (pop-up al mòbil de l'equip).
 *
 * ESBORRANY — PENDENT de revisió per l'usuari: textos d'exemple redactats per
 * l'app, no validats. Es poden canviar, afegir o treure lliurement; l'única
 * condició és que cada `id` sigui únic (és el que viatja a l'API i es desa a
 * v2_missatges.clau). Un missatge ja enviat conserva el text amb què es va enviar.
 *
 * És contingut PÚBLIC (el màster el veu al seu panell): cap missatge ha de
 * contenir solucions ni pistes de les fites. Per a això hi ha els botons de pista.
 *
 * Veu: n'hi ha de Fra Francesc (que adverteix de l'home del Sant Ofici, com el
 * missatge secret; la ironia es descobreix al final) i d'operatius, neutres.
 * Cap no fa servir la contrasenya de l'Orde, per no esguerrar-ne el moment.
 */

export interface MissatgeMaster {
  id: string;
  titol: string;
  text: string;
}

export const MISSATGES_MASTER: readonly MissatgeMaster[] = [
  {
    id: "queden-15",
    titol: "Queden 15 minuts",
    text: "Queden quinze minuts. Acabeu la fita on sou i poseu-vos en camí cap al Pla del Masset.",
  },
  {
    id: "queden-5",
    titol: "Queden 5 minuts",
    text: "Només queden cinc minuts. Aneu cap al Pla del Masset sense entretenir-vos.",
  },
  {
    id: "pla-masset",
    titol: "Torneu al Pla del Masset",
    text: "Deixeu el que feu i torneu al Pla del Masset. Us hi esperen.",
  },
  {
    id: "inquisidor-vigila",
    titol: "L'Inquisidor us vigila",
    text: "L'home del Sant Ofici ronda a prop. Parleu baix, no us separeu i no li doneu cap motiu per aturar-vos.",
  },
  {
    id: "inquisidor-pregunta",
    titol: "Pregunta per vosaltres",
    text: "M'han dit que l'Inquisidor pregunta per vosaltres. Seguiu endavant, però amb els ulls ben oberts.",
  },
  {
    id: "bon-cami",
    titol: "Aneu per bon camí",
    text: "Aneu per bon camí. L'Orde del Testament us observa amb bons ulls.",
  },
  {
    id: "no-separeu",
    titol: "No us separeu",
    text: "Mantingueu l'equip unit: ningú no ha d'anar sol, i tothom ha de poder veure el mòbil.",
  },
  {
    id: "carretera",
    titol: "Compte amb els cotxes",
    text: "Si heu de caminar per la carretera, aneu en fila i pel costat. La Gran Obra pot esperar un moment.",
  },
  {
    id: "tot-be",
    titol: "Tot en ordre?",
    text: "Fa estona que no avanceu. Si teniu cap problema, truqueu al màster.",
  },
  {
    id: "truqueu",
    titol: "Truqueu al màster",
    text: "Necessitem parlar amb vosaltres. Truqueu al màster tan aviat com pugueu.",
  },
];

/** Títol del pop-up quan el màster escriu un text lliure. PENDENT de revisió. */
export const TITOL_TEXT_LLIURE = "Un missatge per a vosaltres";

/** Longitud màxima del text lliure del màster (la BD n'admet fins a 500). */
export const MAX_TEXT_LLIURE = 300;

export function getMissatgeMaster(id: string): MissatgeMaster | undefined {
  return MISSATGES_MASTER.find((m) => m.id === id);
}
