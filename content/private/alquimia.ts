import "server-only";

import { ELEMENTS_INICIALS, type ElementAlquimia, type ReceptaAlquimia } from "@/content/public/alquimia";

/** Cada emoji és únic: a la taula no es veuen els noms, només l'emoji. */
const EMOJIS: Record<string, string> = {
  Mar: "🌊",
  Muntanya: "⛰️",
  Sol: "☀️",
  Remolí: "🌪️",
  Amor: "❤️",
  Fang: "🟤",
  Vapor: "♨️",
  Núvol: "☁️",
  Peix: "🐟",
  Lava: "🌋",
  Sorra: "🏜️",
  Llavor: "🌱",
  Energia: "⚡",
  Drac: "🐉",
  Ocell: "🐦",
  Pluja: "🌧️",
  Tempesta: "⛈️",
  Boira: "🌫️",
  "Arc de Sant Martí": "🌈",
  Neu: "❄️",
  Riu: "🏞️",
  Planta: "🌿",
  Blat: "🌾",
  Pa: "🍞",
  Arbre: "🌳",
  Bosc: "🌲",
  Flor: "🌻",
  Pedra: "🪨",
  Metall: "⚙️",
  Or: "🪙",
  Espasa: "🗡️",
  "Bola de vidre": "🔮",
  "Rellotge de sorra": "⏳",
  Sal: "🧂",
  Balena: "🐳",
  Granota: "🐸",
  Ou: "🥚",
  Papallona: "🦋",
  Fantasma: "👻",
  Follet: "🧚",
  Unicorn: "🦄",
  Golem: "🗿",
  Persona: "🧑",
  Casa: "🏠",
  "Ninot de neu": "⛄",
  Cavaller: "🛡️",
  Castell: "🏰",
  "Sant Jordi": "🌹",
  Alquimista: "🧙",
  Poció: "🧪",
  Alambí: "⚗️",
  "Pedra filosofal": "💎",
  // Cel i nit
  Lluna: "🌙",
  Estel: "⭐",
  Nit: "🌌",
  Llamp: "🌩️",
  "Estel fugaç": "🌠",
  Cometa: "☄️",
  Planeta: "🪐",
  // Terra, mar i plantes
  Gel: "🧊",
  Illa: "🏝️",
  Platja: "🏖️",
  Palmera: "🌴",
  Cactus: "🌵",
  Bolet: "🍄",
  Poma: "🍎",
  Raïm: "🍇",
  Vi: "🍷",
  Castanya: "🌰",
  Carbassa: "🎃",
  // Bèsties
  Abella: "🐝",
  Mel: "🍯",
  Llop: "🐺",
  Cavall: "🐎",
  Serp: "🐍",
  Aranya: "🕷️",
  "Rat-penat": "🦇",
  Mussol: "🦉",
  Cargol: "🐌",
  Tortuga: "🐢",
  Pop: "🐙",
  Cranc: "🦀",
  Gat: "🐈",
  Gos: "🐕",
  Dinosaure: "🦕",
  // Oficis i objectes
  Espelma: "🕯️",
  Pergamí: "📜",
  Grimori: "📖",
  Mapa: "🗺️",
  Brúixola: "🧭",
  Clau: "🗝️",
  Tresor: "💰",
  Anell: "💍",
  Destral: "🪓",
  "Arc i fletxes": "🏹",
  Ferrer: "⚒️",
  Mur: "🧱",
  Vaixell: "⛵",
  Campana: "🔔",
  Església: "⛪",
  Sopa: "🍲",
  Música: "🎵",
  Somni: "💤",
  // Gent i llegendes
  Corona: "👑",
  Rei: "🤴",
  Reina: "👸",
  Sirena: "🧜",
  Ogre: "👹",
  Esquelet: "💀",
  Diable: "😈",
  Correfoc: "🎆",
  Tió: "🪵",
};

/** [ingredient, ingredient, resultat]. L'ordre dels ingredients no importa. */
const RECEPTES: readonly (readonly [string, string, string])[] = [
  // Els cinc elements entre ells
  ["Aigua", "Aigua", "Mar"],
  ["Terra", "Terra", "Muntanya"],
  ["Foc", "Foc", "Sol"],
  ["Aire", "Aire", "Remolí"],
  ["Ànima", "Ànima", "Amor"],
  ["Aigua", "Terra", "Fang"],
  ["Aigua", "Foc", "Vapor"],
  ["Aigua", "Aire", "Núvol"],
  ["Aigua", "Ànima", "Peix"],
  ["Terra", "Foc", "Lava"],
  ["Terra", "Aire", "Sorra"],
  ["Terra", "Ànima", "Llavor"],
  ["Foc", "Aire", "Energia"],
  ["Foc", "Ànima", "Drac"],
  ["Aire", "Ànima", "Ocell"],

  // Cel i aigua
  ["Núvol", "Aigua", "Pluja"],
  ["Vapor", "Aire", "Núvol"],
  ["Núvol", "Energia", "Tempesta"],
  ["Remolí", "Aigua", "Tempesta"],
  ["Núvol", "Terra", "Boira"],
  ["Pluja", "Sol", "Arc de Sant Martí"],
  ["Muntanya", "Núvol", "Neu"],
  ["Muntanya", "Aigua", "Riu"],
  ["Mar", "Sol", "Sal"],

  // Plantes
  ["Llavor", "Aigua", "Planta"],
  ["Llavor", "Pluja", "Planta"],
  ["Llavor", "Terra", "Blat"],
  ["Blat", "Foc", "Pa"],
  ["Planta", "Terra", "Arbre"],
  ["Arbre", "Arbre", "Bosc"],
  ["Planta", "Sol", "Flor"],

  // Pedres i metalls
  ["Lava", "Aigua", "Pedra"],
  ["Lava", "Aire", "Pedra"],
  ["Pedra", "Foc", "Metall"],
  ["Metall", "Sol", "Or"],
  ["Metall", "Pedra", "Espasa"],
  ["Sorra", "Foc", "Bola de vidre"],
  ["Sorra", "Bola de vidre", "Rellotge de sorra"],

  // Criatures (l'Ànima dona vida)
  ["Mar", "Ànima", "Balena"],
  ["Peix", "Terra", "Granota"],
  ["Ocell", "Ocell", "Ou"],
  ["Flor", "Ànima", "Papallona"],
  ["Núvol", "Ànima", "Fantasma"],
  ["Bosc", "Ànima", "Follet"],
  ["Arc de Sant Martí", "Ànima", "Unicorn"],
  ["Fang", "Ànima", "Golem"],

  // Persones i llegendes
  ["Golem", "Amor", "Persona"],
  ["Pedra", "Persona", "Casa"],
  ["Neu", "Persona", "Ninot de neu"],
  ["Persona", "Espasa", "Cavaller"],
  ["Casa", "Cavaller", "Castell"],
  ["Cavaller", "Drac", "Sant Jordi"],

  // L'alquimista
  ["Persona", "Ànima", "Alquimista"],
  ["Alquimista", "Aigua", "Poció"],
  ["Alquimista", "Foc", "Alambí"],
  ["Alquimista", "Or", "Pedra filosofal"],

  // Cel i nit
  ["Sol", "Pedra", "Lluna"],
  ["Sol", "Sol", "Estel"],
  ["Lluna", "Estel", "Nit"],
  ["Tempesta", "Energia", "Llamp"],
  ["Estel", "Aire", "Estel fugaç"],
  ["Estel", "Foc", "Cometa"],
  ["Lluna", "Terra", "Planeta"],

  // Terra, mar i plantes
  ["Aigua", "Neu", "Gel"],
  ["Mar", "Terra", "Illa"],
  ["Mar", "Sorra", "Platja"],
  ["Planta", "Sorra", "Palmera"],
  ["Llavor", "Sorra", "Cactus"],
  ["Llavor", "Boira", "Bolet"],
  ["Arbre", "Flor", "Poma"],
  ["Arbre", "Sol", "Raïm"],
  ["Raïm", "Aigua", "Vi"],
  ["Arbre", "Foc", "Castanya"],
  ["Planta", "Nit", "Carbassa"],

  // Bèsties
  ["Flor", "Aire", "Abella"],
  ["Abella", "Flor", "Mel"],
  ["Bosc", "Lluna", "Llop"],
  ["Remolí", "Ànima", "Cavall"],
  ["Sorra", "Ànima", "Serp"],
  ["Nit", "Ànima", "Aranya"],
  ["Nit", "Ocell", "Rat-penat"],
  ["Ocell", "Bosc", "Mussol"],
  ["Pluja", "Terra", "Cargol"],
  ["Mar", "Pedra", "Tortuga"],
  ["Peix", "Pedra", "Pop"],
  ["Platja", "Ànima", "Cranc"],
  ["Nit", "Amor", "Gat"],
  ["Llop", "Persona", "Gos"],
  ["Drac", "Terra", "Dinosaure"],

  // Oficis i objectes
  ["Mel", "Foc", "Espelma"],
  ["Arbre", "Pedra", "Pergamí"],
  ["Pergamí", "Alquimista", "Grimori"],
  ["Pergamí", "Muntanya", "Mapa"],
  ["Metall", "Estel", "Brúixola"],
  ["Metall", "Casa", "Clau"],
  ["Or", "Or", "Tresor"],
  ["Or", "Lava", "Anell"],
  ["Metall", "Arbre", "Destral"],
  ["Espasa", "Ocell", "Arc i fletxes"],
  ["Metall", "Persona", "Ferrer"],
  ["Pedra", "Pedra", "Mur"],
  ["Arbre", "Mar", "Vaixell"],
  ["Metall", "Aire", "Campana"],
  ["Casa", "Campana", "Església"],
  ["Pa", "Vapor", "Sopa"],
  ["Ocell", "Amor", "Música"],
  ["Nit", "Persona", "Somni"],

  // Gent i llegendes
  ["Or", "Metall", "Corona"],
  ["Corona", "Persona", "Rei"],
  ["Rei", "Amor", "Reina"],
  ["Peix", "Persona", "Sirena"],
  ["Muntanya", "Golem", "Ogre"],
  ["Fantasma", "Persona", "Esquelet"],
  ["Foc", "Fantasma", "Diable"],
  ["Diable", "Energia", "Correfoc"],
  ["Arbre", "Amor", "Tió"],
];

const clau = (a: string, b: string) => (a < b ? `${a}+${b}` : `${b}+${a}`);

const PER_CLAU = new Map(RECEPTES.map(([a, b, resultat]) => [clau(a, b), resultat]));

export const TOTAL_ELEMENTS = ELEMENTS_INICIALS.length + Object.keys(EMOJIS).length;

/** Per a cada element, les parelles d'ingredients que el formen (en l'ordre de RECEPTES). */
const INGREDIENTS = new Map<string, (readonly [string, string])[]>();
for (const [a, b, resultat] of RECEPTES) {
  INGREDIENTS.set(resultat, [...(INGREDIENTS.get(resultat) ?? []), [a, b]]);
}

/** Si `compost` es forma amb `ingredient`, torna l'altre ingredient (el desfà). */
function desfer(compost: string, ingredient: string): string | null {
  for (const [a, b] of INGREDIENTS.get(compost) ?? []) {
    if (a === ingredient) return b;
    if (b === ingredient) return a;
  }
  return null;
}

const elementDe = (nom: string): ElementAlquimia =>
  ({ nom, emoji: EMOJIS[nom] ?? ELEMENTS_INICIALS.find((e) => e.nom === nom)!.emoji });

/**
 * Una recepta té prioritat; si no n'hi ha i un dels dos es forma amb l'altre, es desfà i en
 * surt l'altre ingredient (Vapor + Aigua → Foc).
 */
export function combinar(a: string, b: string): ElementAlquimia | null {
  const nom = PER_CLAU.get(clau(a, b)) ?? desfer(a, b) ?? desfer(b, a);
  return nom ? elementDe(nom) : null;
}

/** Totes les receptes per a la pantalla de receptes: a l'ou de Pasqua no són cap secret de la partida. */
export function totesLesReceptes(): ReceptaAlquimia[] {
  return RECEPTES.map(([a, b, resultat]) => ({ a: elementDe(a), b: elementDe(b), resultat: elementDe(resultat) }));
}
