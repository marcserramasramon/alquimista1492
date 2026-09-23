/**
 * Ou de Pasqua a /gresol: joc d'alquímia per als nens, independent de l'escape room.
 * Es comença amb els cinc elements i, ajuntant-los, se'n descobreixen de nous.
 * Les receptes són a content/private/alquimia.ts; aquí només hi ha el que pot veure el client.
 */

export interface ElementAlquimia {
  nom: string;
  emoji: string;
}

export type ResultatMescla =
  | { tipus: "nou" | "conegut"; element: ElementAlquimia }
  | { tipus: "res" }
  | { tipus: "error" };

export const ELEMENTS_INICIALS: readonly ElementAlquimia[] = [
  { nom: "Aigua", emoji: "💧" },
  { nom: "Terra", emoji: "🌍" },
  { nom: "Foc", emoji: "🔥" },
  { nom: "Aire", emoji: "🌬️" },
  { nom: "Ànima", emoji: "✨" },
];

/** Peces que caben alhora a la taula; la novena fa fora la més antiga. */
export const MAX_PECES = 8;
