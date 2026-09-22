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
  // AIGUA — Font del Ferro. Cera d'espelma + aigua tintada revela un número;
  // la manovella té 4 radis, el número revelat n'és el doble.
  "font-ferro": {
    respostesAcceptades: ["8"],
    pistes: [
      "El que brolla revela el secret.",
      "Mulla el paper amb aigua per desvelar el número.",
      "El número és 8.",
    ],
  },

  // TERRA — Planes Bones. Cal buscar i comptar les àmfores del lloc; el
  // recompte és directament la resposta.
  "planes-bones": {
    respostesAcceptades: ["3"],
    pistes: [
      "Busca on guarda els elixirs l'alquimista.",
      "Compta les àmfores.",
      "El número és el 3.",
    ],
  },

  // FOC — Entrada del poble. El "paper de foc" (cel·lofana vermella) deixa
  // llegir el número escrit en verd enmig del soroll de colors. El 8 és un
  // placeholder a docs/fites-nova.md: si canvia el full imprès, cal canviar-lo aquí.
  foc: {
    respostesAcceptades: ["8"],
    pistes: [
      "El vidre de foc desvela el secret.",
      "Posa el paper vermell davant.",
      "El número és el 8.",
    ],
  },

  // AIRE — Creu del Pujolar. Número gravat a la creu (1246) menys el número
  // que apareix bafant sobre el vidre ensabonat (1239).
  aire: {
    respostesAcceptades: ["7"],
    pistes: [
      "El primer número aguanta la creu, el segon número es desvelarà amb l'aire del teu halè.",
      "Al peu de la creu trobaràs el primer secret, tira el teu halè al vidre.",
      "1246 − 1239 = 7.",
    ],
  },

  // ÀNIMA — Pista skate. Tinta UV al punt més alt de la pista.
  anima: {
    respostesAcceptades: ["4"],
    pistes: [
      "El que busques és sota els teus peus.",
      "Il·lumina el terra amb la llanterna.",
      "El número és 4.",
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
