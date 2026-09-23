import "server-only";

import { ELEMENTS_INICIALS, type ElementAlquimia } from "@/content/public/alquimia";

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
];

const clau = (a: string, b: string) => (a < b ? `${a}+${b}` : `${b}+${a}`);

const PER_CLAU = new Map(RECEPTES.map(([a, b, resultat]) => [clau(a, b), resultat]));

export const TOTAL_ELEMENTS = ELEMENTS_INICIALS.length + Object.keys(EMOJIS).length;

export function combinar(a: string, b: string): ElementAlquimia | null {
  const nom = PER_CLAU.get(clau(a, b));
  return nom ? { nom, emoji: EMOJIS[nom] } : null;
}
