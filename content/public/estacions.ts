/**
 * Estacions — contingut públic (narrativa, coordenades, imatges).
 * Res d'aquest fitxer és una solució: es pot enviar al client sense risc.
 * Les respostes correctes viuen a content/private/solucions.ts.
 */

export type TipusJoc = "text" | "especial";

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

/** `color` és el mateix que la variable CSS de l'element (app/globals.css). */
export const ELEMENTS: Record<Element, { nom: string; icona: string; color: string }> = {
  aigua: { nom: "Aigua", icona: "/images/elements/aigua.webp", color: "#1d6fd6" },
  terra: { nom: "Terra", icona: "/images/elements/terra.webp", color: "#5b8a1e" },
  foc: { nom: "Foc", icona: "/images/elements/foc.webp", color: "#e8541f" },
  aire: { nom: "Aire", icona: "/images/elements/aire.webp", color: "#0e9bb8" },
  anima: { nom: "Ànima", icona: "/images/elements/anima.webp", color: "#8b3fb5" },
};

export const ESTACIONS: Estacio[] = [
  {
    id: "font-ferro",
    ordre: 1,
    nom: "Font del Ferro",
    situacio: "Al Carrer del Call.",
    entrada: "Desveleu el secret ocult en el paper.",
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
    situacio: "Al Camí de Planes Bones.",
    entrada: "Cerqueu on guardava els elements l'alquimista.",
    imatge: "/images/planes-bones.webp",
    latitud: 41.912256,
    longitud: 2.233469,
    tipus: "text",
    disponible: true,
    element: "terra",
  },
  {
    // El poema del cartell físic encara és PENDENT a docs/fites-nova.md, però no es mostra a l'app.
    id: "foc",
    ordre: 3,
    nom: "Entrada del poble",
    situacio: "A la Carretera de la Guixa.",
    entrada: "Desveleu el número amagat enmig del soroll de colors.",
    imatge: "/images/entrada-poble.webp",
    latitud: 41.915765,
    longitud: 2.231385,
    tipus: "text",
    disponible: true,
    element: "foc",
  },
  {
    id: "aire",
    ordre: 4,
    nom: "Creu del Pujolar",
    situacio: "A la Creu del Pujolar.",
    entrada: "Només l'aire pot desvelar el secret amagat.",
    imatge: "/images/creu-pujolar.webp",
    latitud: 41.910894,
    longitud: 2.224434,
    tipus: "text",
    disponible: true,
    element: "aire",
  },
  {
    id: "anima",
    ordre: 5,
    nom: "Dunes d'asfalt",
    situacio: "Al camí de Malla a la Guixa.",
    entrada: "La llum de la veritat desvelarà el secret ocult.",
    imatge: "/images/pista-skate.webp",
    latitud: 41.91034,
    longitud: 2.230023,
    tipus: "text",
    disponible: true,
    element: "anima",
  },
  {
    // Ritual final "El Gresol dels Cinc Elements" (docs/historia-nova.md, docs/fites-nova.md § Estació central).
    // Ordre dels elements i codi/símbol final encara PENDENT de tancar: /final és un placeholder
    // fins que es defineixi el ritual exacte.
    id: "gresol",
    ordre: 6,
    nom: "Pla del Masset",
    situacio: "Al Pla del Masset.",
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
