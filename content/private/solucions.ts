import "server-only";

/**
 * Solucions — NOMÉS accessible des de codi de servidor.
 * Respostes i pistes de les cinc fites segons docs/fites-nova.md.
 */

export interface Solucio {
  /** Totes les formes acceptades (majúscules/minúscules i accents es normalitzen igualment). */
  respostesAcceptades: string[];
  pistes: string[];
}

export const SOLUCIONS: Record<string, Solucio> = {
  // Cada número és la posició de l'element a la recepta del Gresol:
  // Aigua 1 · Foc 2 · Terra 3 · Aire 4 · Ànima 5.

  // AIGUA — Font del Ferro. Cera d'espelma + aigua tintada revela el número.
  "font-ferro": {
    respostesAcceptades: ["1"],
    pistes: [
      "El que brolla revela el secret.",
      "Mulla el paper amb aigua per desvelar el número.",
      "El número és 1.",
    ],
  },

  // TERRA — Planes Bones. Hi ha 6 àmfores al lloc; cal comptar-les totes i
  // dividir-les per la meitat (6 ÷ 2 = 3) per arribar a la resposta.
  "planes-bones": {
    respostesAcceptades: ["3"],
    pistes: [
      "Busca on guarda els elixirs l'alquimista.",
      "Compta les àmfores i parteix-les per la meitat.",
      "El número és el 3.",
    ],
  },

  // FOC — Entrada del poble. El "paper de foc" (cel·lofana vermella) deixa
  // llegir el número escrit en verd enmig del soroll de colors.
  foc: {
    respostesAcceptades: ["2"],
    pistes: [
      "El vidre de foc desvela el secret.",
      "Posa el paper vermell davant.",
      "El número és el 2.",
    ],
  },

  // AIRE — Creu del Pujolar. El número apareix bafant sobre el vidre ensabonat.
  aire: {
    respostesAcceptades: ["4"],
    pistes: [
      "El secret es desvelarà amb l'aire del teu alè.",
      "Bufa l'alè calent sobre el vidre.",
      "El número és 4.",
    ],
  },

  // ÀNIMA — Dunes d'asfalt. Tinta UV al punt més alt de la pista.
  anima: {
    respostesAcceptades: ["5"],
    pistes: [
      "El que busques és sota els teus peus.",
      "Il·lumina el terra amb la llanterna.",
      "El número és 5.",
    ],
  },
};

export function getSolucio(estacioId: string): Solucio | undefined {
  return SOLUCIONS[estacioId];
}

export function normalitzaText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim()
    .replace(/[.,;:!?'"«»·\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function comparaResposta(solucio: Solucio, resposta: string): boolean {
  const normalitzada = normalitzaText(resposta);
  return solucio.respostesAcceptades.some((r) => normalitzaText(r) === normalitzada);
}
