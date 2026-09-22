/**
 * Estacions — contingut públic (narrativa, coordenades, imatges).
 * Res d'aquest fitxer és una solució: es pot enviar al client sense risc.
 * Les respostes correctes viuen a content/private/solucions.ts.
 */

export type TipusJoc = "text" | "imatge" | "especial";

/** Element alquímic de la fita (docs/fites-nova.md). Sense valor = estació no elemental. */
export type Element = "aigua" | "terra" | "foc" | "aire" | "anima";

export interface Estacio {
  id: string;
  ordre: number;
  nom: string;
  situacio: string;
  entrada: string;
  imatge?: string;
  latitud: number;
  longitud: number;
  tipus: TipusJoc;
  /** Estacions marcades com a no disponible encara no tenen el joc decidit: es mostra "properament". */
  disponible: boolean;
  element?: Element;
}

export const ELEMENTS: Record<Element, { nom: string; icona: string }> = {
  aigua: { nom: "Aigua", icona: "/images/elements/aigua.webp" },
  terra: { nom: "Terra", icona: "/images/elements/terra.webp" },
  foc: { nom: "Foc", icona: "/images/elements/foc.webp" },
  aire: { nom: "Aire", icona: "/images/elements/aire.webp" },
  anima: { nom: "Ànima", icona: "/images/elements/anima.webp" },
};

export const ESTACIONS: Estacio[] = [
  {
    id: "font-ferro",
    ordre: 1,
    nom: "Font del Ferro",
    situacio: "A la font, on gira la maneta amb el cap de lleó.",
    entrada: "Gireu la maneta perquè brolli aigua i mulleu el paper perquè hi aparegui un número.",
    imatge: "/images/font-ferro.webp",
    latitud: 41.914816,
    longitud: 2.227479,
    tipus: "text",
    disponible: true,
    element: "aigua",
  },
  {
    id: "planes-bones",
    ordre: 2,
    nom: "Planes Bones",
    situacio: "A Planes Bones, al costat de les àmfores.",
    entrada: "Freguen terra o fang sobre el full per fer aparèixer el missatge amagat.",
    imatge: "/images/planes-bones.webp",
    latitud: 41.912256,
    longitud: 2.233469,
    tipus: "text",
    disponible: true,
    element: "terra",
  },
  {
    // Contingut encara pendent de tancar a docs/fites-nova.md (poema/full de "paper de foc" no escrits).
    id: "foc",
    ordre: 3,
    nom: "Entrada del poble",
    situacio: "A l'entrada del poble, vora el pal vell de telèfon.",
    entrada: "Contingut encara en preparació.",
    latitud: 41.915765,
    longitud: 2.231385,
    tipus: "text",
    disponible: false,
    element: "foc",
  },
  {
    id: "aire",
    ordre: 4,
    nom: "Creu del Pujolar",
    situacio: "A la Creu del Pujolar, dalt del serrat.",
    entrada:
      "Al peu de la creu hi ha un número gravat. Després, alena sobre el vidre entelat per fer-ne aparèixer un altre.",
    imatge: "/images/serrat-bruixes.webp",
    latitud: 41.910894,
    longitud: 2.224434,
    tipus: "text",
    disponible: true,
    element: "aire",
  },
  {
    id: "anima",
    ordre: 5,
    nom: "Pista skate",
    situacio: "Al Camí Antic de Malla, al punt més alt de la pista.",
    entrada: "Puja fins al punt més alt de la pista i passa-hi la llanterna ultraviolada pel terra.",
    latitud: 41.91034,
    longitud: 2.230023,
    tipus: "text",
    disponible: true,
    element: "anima",
  },
  {
    // Ritual final "El Gresol dels Cinc Elements" (docs/historia-nova.md, docs/fites-nova.md § Estació central).
    // Ordre dels elements i codi/símbol final encara PENDENT de tancar: CampanarFinal.tsx és un placeholder
    // heretat de l'antic tancament amb sometent i cal refer-lo quan es defineixi el ritual exacte.
    id: "gresol",
    ordre: 6,
    nom: "Pla de Masset",
    situacio: "Al Pla de Masset, centre del poble.",
    entrada: "Amb els cinc fragments recollits, és hora del ritual del Gresol dels Cinc Elements.",
    latitud: 41.91313,
    longitud: 2.229789,
    tipus: "especial",
    disponible: true,
  },
];

export function getEstacio(id: string): Estacio | undefined {
  return ESTACIONS.find((e) => e.id === id);
}

export function getEstacionsOrdenades(): Estacio[] {
  return [...ESTACIONS].sort((a, b) => a.ordre - b.ordre);
}

/** Estacions que compten per desbloquejar el ritual final del Gresol. */
export function getEstacionsJugables(): Estacio[] {
  return ESTACIONS.filter((e) => e.tipus !== "especial");
}
