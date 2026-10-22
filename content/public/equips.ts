/**
 * Els 25 equips de la partida. Cada mòbil n'agafa un tocant-ne la icona.
 *
 * `id` és el `slug` de la taula v2_teams (migració 20260924000015): si se'n
 * canvia un, cal una migració nova. El `nom` d'aquí és el que es mostra.
 * Les imatges de public/images/equips/ són PROVISIONALS.
 */

export interface Equip {
  id: string;
  nom: string;
  imatge: string;
}

export const EQUIPS = [
  { id: "crisol-fosc", nom: "L'Orde del Crisol Fosc", imatge: "/images/equips/crisol-fosc.svg" },
  { id: "corbs-mercuri", nom: "Els Corbs de Mercuri", imatge: "/images/equips/corbs-mercuri.svg" },
  { id: "alambi-negre", nom: "La Germandat de l'Alambí Negre", imatge: "/images/equips/alambi-negre.svg" },
  { id: "forjadors-plom", nom: "Forjadors de Plom", imatge: "/images/equips/forjadors-plom.svg" },
  { id: "ouroboros", nom: "El Cercle de l'Ouroboros", imatge: "/images/equips/ouroboros.svg" },
  { id: "sang-sofre", nom: "Sang i Sofre", imatge: "/images/equips/sang-sofre.svg" },
  { id: "magnum-opus", nom: "Custodis del Magnum Opus", imatge: "/images/equips/magnum-opus.svg" },
  { id: "homuncles-cendra", nom: "Els Homuncles de Cendra", imatge: "/images/equips/homuncles-cendra.svg" },
  { id: "sol-negre", nom: "Els Fills del Sol Negre", imatge: "/images/equips/sol-negre.svg" },
  { id: "lluna-plata", nom: "La Confraria de la Lluna de Plata", imatge: "/images/equips/lluna-plata.svg" },
  { id: "estrella-sal", nom: "Els Guardians de la Sal", imatge: "/images/equips/estrella-sal.svg" },
  { id: "clau-secreta", nom: "La Clau del Secret", imatge: "/images/equips/clau-secreta.svg" },
  { id: "pedra-filosofal", nom: "Els Cercadors de la Pedra", imatge: "/images/equips/pedra-filosofal.svg" },
  { id: "ampolla-verda", nom: "L'Ampolla Verda", imatge: "/images/equips/ampolla-verda.svg" },
  { id: "llibre-tancat", nom: "El Llibre Tancat", imatge: "/images/equips/llibre-tancat.svg" },
  { id: "corona-cendra", nom: "La Corona de Cendra", imatge: "/images/equips/corona-cendra.svg" },
  { id: "espasa-quieta", nom: "Els Guardians de l'Espasa Quieta", imatge: "/images/equips/espasa-quieta.svg" },
  { id: "ancora-fosca", nom: "L'Àncora Fosca", imatge: "/images/equips/ancora-fosca.svg" },
  { id: "fulla-tres", nom: "Les Tres Fulles", imatge: "/images/equips/fulla-tres.svg" },
  { id: "torre-vigia", nom: "La Torre de Vigia", imatge: "/images/equips/torre-vigia.svg" },
  { id: "corretja-ferro", nom: "Els Ferrers de la Corretja", imatge: "/images/equips/corretja-ferro.svg" },
  { id: "flama-blava", nom: "La Flama Blava", imatge: "/images/equips/flama-blava.svg" },
  { id: "arbre-ocult", nom: "L'Arbre Ocult", imatge: "/images/equips/arbre-ocult.svg" },
  { id: "ull-clar", nom: "L'Ull Clar", imatge: "/images/equips/ull-clar.svg" },
  { id: "llum-ferit", nom: "El Llum Ferit", imatge: "/images/equips/llum-ferit.svg" },
] as const satisfies readonly Equip[];

export type EquipId = (typeof EQUIPS)[number]["id"];

export const EQUIP_IDS = EQUIPS.map((e) => e.id) as [EquipId, ...EquipId[]];

export function getEquip(id: string | null | undefined): Equip | undefined {
  return EQUIPS.find((e) => e.id === id);
}
