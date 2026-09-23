/**
 * Els 8 equips de la partida. Cada mòbil n'agafa un tocant-ne la icona.
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
] as const satisfies readonly Equip[];

export type EquipId = (typeof EQUIPS)[number]["id"];

export const EQUIP_IDS = EQUIPS.map((e) => e.id) as [EquipId, ...EquipId[]];

export function getEquip(id: string | null | undefined): Equip | undefined {
  return EQUIPS.find((e) => e.id === id);
}
