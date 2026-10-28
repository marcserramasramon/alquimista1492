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
  // Cada fita dona un símbol alquímic (triat al teclat de la resposta): Aigua 🜄 · Foc 🜂 · Terra 🜃 · Aire 🜁 · Ànima 🜔 (SALT).

  // AIGUA — Font del Lleó. Cera d'espelma + aigua tintada revela el número.
  "font-ferro": {
    respostesAcceptades: ["\u{1F704}"], // 🜄 WATER
    pistes: [
      "El que brolla revela el secret.",
      "Mulla el paper amb aigua per desvelar el símbol.",
      "El símbol és 🜄.",
    ],
  },

  // TERRA — Planes Bones. Hi ha 6 àmfores al lloc; la xifra 6 repetida
  // tres cops dona 666 (el nombre d'àmfores, tres cops).
  "planes-bones": {
    respostesAcceptades: ["\u{1F703}"], // 🜃 EARTH
    pistes: [
      "Busca on guarda els elixirs l'alquimista.",
      "Compta les àmfores i escriu aquest nombre tres cops.", // PENDENT: la mecànica de les àmfores ha canviat
      "El símbol és 🜃.",
    ],
  },

  // FOC — Serrat del Caçador. Enmig d'un mar de xifres i símbols vermells,
  // el "paper de foc" (cel·lofana vermella) els dissol i hi destaca el
  // número blau: la resposta.
  foc: {
    respostesAcceptades: ["\u{1F702}"], // 🜂 FIRE
    pistes: [
      "El vidre de foc desvela el secret.",
      "Posa el paper vermell davant.",
      "El símbol és 🜂.",
    ],
  },

  // AIRE — Creu del Pujolar. El número apareix bafant sobre el vidre ensabonat.
  aire: {
    respostesAcceptades: ["\u{1F701}"], // 🜁 AIR
    pistes: [
      "El secret es desvelarà amb l'aire del teu alè.",
      "Bufa l'alè calent sobre el vidre.",
      "El símbol és 🜁.",
    ],
  },

  // ÀNIMA — Dunes d'asfalt. Tinta UV al punt més alt de la pista.
  anima: {
    respostesAcceptades: ["\u{1F714}"], // 🜔 SALT (símbol de l'Ànima)
    pistes: [
      "El que busques és sota els teus peus.",
      "Il·lumina el terra amb la llanterna.",
      "El símbol és 🜔.",
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
