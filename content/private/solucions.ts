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
  // Cada fita dona un nombre de tres xifres: Aigua 127 · Foc 233 · Terra 666 · Aire 431 · Ànima 773.

  // AIGUA — Font del Lleó. Cera d'espelma + aigua tintada revela el número.
  "font-ferro": {
    respostesAcceptades: ["127"],
    pistes: [
      "El que brolla revela el secret.",
      "Mulla el paper amb aigua per desvelar el número.",
      "El número és 127.",
    ],
  },

  // TERRA — Planes Bones. Hi ha 6 àmfores al lloc; la xifra 6 repetida
  // tres cops dona 666 (el nombre d'àmfores, tres cops).
  "planes-bones": {
    respostesAcceptades: ["666"],
    pistes: [
      "Busca on guarda els elixirs l'alquimista.",
      "Compta les àmfores i escriu aquest nombre tres cops.",
      "El número és el 666.",
    ],
  },

  // FOC — Serrat del Caçador. Enmig d'un mar de xifres i símbols vermells,
  // el "paper de foc" (cel·lofana vermella) els dissol i hi destaca el
  // número blau: la resposta.
  foc: {
    respostesAcceptades: ["233"],
    pistes: [
      "El vidre de foc desvela el secret.",
      "Posa el paper vermell davant.",
      "El número és el 233.",
    ],
  },

  // AIRE — Creu del Pujolar. El número apareix bafant sobre el vidre ensabonat.
  aire: {
    respostesAcceptades: ["431"],
    pistes: [
      "El secret es desvelarà amb l'aire del teu alè.",
      "Bufa l'alè calent sobre el vidre.",
      "El número és 431.",
    ],
  },

  // ÀNIMA — Dunes d'asfalt. Tinta UV al punt més alt de la pista.
  anima: {
    respostesAcceptades: ["773"],
    pistes: [
      "El que busques és sota els teus peus.",
      "Il·lumina el terra amb la llanterna.",
      "El número és 773.",
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
