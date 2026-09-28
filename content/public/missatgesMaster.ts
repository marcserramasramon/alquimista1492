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
 *
 * `video`: ruta a public/video/ per als missatges amb vídeo. Sense el fitxer,
 * el pop-up cau en un missatge només de text.
 *
 * `geofence`: si hi és, el missatge s'envia sol —sense que el màster toqui
 * res— la primera vegada que un equip (amb la ubicació activada) passa a
 * `radiMetres` d'aquest punt, sempre que la partida ja hagi començat
 * (app/api/ubicacio/route.ts). Sense `geofence`, el missatge només s'envia
 * a mà des del panell del màster.
 */

/**
 * Guió del vídeo de l'Inquisidor (content/public/missatgesMaster.ts, clau
 * "inquisidor-alerta"). A diferència de la resta, aquesta NO és la veu de Fra
 * Francesc: és l'Inquisidor mateix, amenaçador — per això no viu a textos.ts
 * ni es genera amb scripts/generate-audio.py, sinó amb
 * scripts/generate-veu-inquisidor.py (veu més greu, més lenta i amb eco).
 * Si es canvia el text, cal tornar a executar aquell script.
 */
const ALERTA_INQUISIDOR = {
  titol: "Us ha sentit",
  paragrafs: [
    "Sé que rondeu per aquest poble.",
    "Heretgia! La sento a l'aire, com fum de foguera.",
    "El Sant Ofici no oblida ni perdona.",
    "Qui toca l'obra de l'alquimista, crema amb ella.",
    "Qui hi ha aquí?",
  ],
};

export interface MissatgeMaster {
  id: string;
  titol: string;
  text: string;
  video?: string;
  geofence?: { lat: number; lng: number; radiMetres: number };
  /** El vídeo té una marca d'aigua (generat amb IA) a la cantonada inferior dreta:
   *  VistaMissatgeVideo hi dibuixa un cercle negre a sobre per tapar-la. */
  tapaMarcaAigua?: boolean;
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
  /** Es dispara sol al cementiri, pel camí cap al pas previ `aire-pas` (Creu del Pujolar).
   *  Veure textos.ts pel guió/àudio. */
  {
    id: "inquisidor-alerta",
    titol: ALERTA_INQUISIDOR.titol,
    text: ALERTA_INQUISIDOR.paragrafs.join(" "),
    video: "/video/alerta-inquisidor.mp4",
    geofence: { lat: 41.912569, lng: 2.227555, radiMetres: 40 },
    tapaMarcaAigua: true,
  },
  {
    id: "inquisidor-pregunta",
    titol: "Pregunta per vosaltres",
    text: "M'han dit que l'Inquisidor pregunta per vosaltres. Seguiu endavant, però amb els ulls ben oberts.",
  },
  /** Es dispara sol pel camí cap a/des de Font del Lleó (Aigua), a l'església del poble.
   *  Vídeo generat amb IA (element espectacular, no una amenaça): l'Aigua s'alça, fa
   *  una cabriola i continua el seu camí. Narració muntada amb scripts/generate-audio-ambient.py. */
  {
    id: "aigua-esglesia",
    titol: "L'aigua ha passat",
    text: "Heu vist l'Aigua alçar-se i tornar a caure. Reconeix qui s'hi acosta. Continueu.",
    video: "/video/aigua-esglesia.mp4",
    geofence: { lat: 41.91377776075638, lng: 2.227906392940557, radiMetres: 30 },
  },
  /** Es dispara sol pel camí cap a Planes Bones (Terra), a l'altura de l'entrada del Mas
   *  Vinyals. Vídeo generat amb IA: arbres i plantes creixen al costat del camí, seguint
   *  els seus passos. Narració muntada amb scripts/generate-audio-ambient.py. */
  {
    id: "terra-vinyals",
    titol: "La Terra ha florit",
    text: "Heu vist créixer la Terra al vostre pas. Fins i tot ella sap que us acosteu al que busca.",
    video: "/video/terra-planes-bones.mp4",
    geofence: { lat: 41.9136, lng: 2.232721, radiMetres: 30 },
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
