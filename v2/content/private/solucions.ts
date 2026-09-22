import "server-only";

/**
 * Solucions — NOMÉS accessible des de codi de servidor.
 * Respostes i pistes de font-ferro/planes-bones/aire/anima confirmades a
 * docs/fites-nova.md. L'estació "foc" encara no hi és: el seu contingut
 * (poema, resposta) és allà PENDENT, i "foc" té disponible:false a
 * content/public/estacions.ts fins que es tanqui.
 */

export interface SolucioText {
  tipus: "text";
  /** Totes les formes acceptades (majúscules/minúscules i accents es normalitzen igualment). */
  respostesAcceptades: string[];
  pistes: string[];
}

export interface SolucioImatge {
  tipus: "imatge";
  opcions: { id: string; imatge: string; etiqueta: string }[];
  correctaId: string;
  pistes: string[];
}

export type Solucio = SolucioText | SolucioImatge;

export const SOLUCIONS: Record<string, Solucio> = {
  // AIGUA — Font del Ferro. Cera d'espelma + aigua tintada revela un número;
  // la manovella té 4 radis, el número revelat n'és el doble.
  "font-ferro": {
    tipus: "text",
    respostesAcceptades: ["8"],
    pistes: [
      "El que brolla revela el secret.",
      "Mulla el paper amb aigua per desvelar el número.",
      "El número és 8.",
    ],
  },

  // TERRA — Planes Bones. Cola blanca + fang revela el missatge; la resposta
  // és el nombre d'àmfores del lloc.
  "planes-bones": {
    tipus: "text",
    respostesAcceptades: ["3"],
    pistes: [
      "Busca on guarda els elixirs l'alquimista.",
      "Compta les àmfores.",
      "El número és el 3.",
    ],
  },

  // AIRE — Creu del Pujolar. Número gravat a la creu (1246) menys el número
  // que apareix bafant sobre el vidre ensabonat (1239).
  aire: {
    tipus: "text",
    respostesAcceptades: ["7"],
    pistes: [
      "El primer número aguanta la creu, el segon número es desvelarà amb l'aire del teu halè.",
      "Al peu de la creu trobaràs el primer secret, tira el teu halè al vidre.",
      "1246 − 1239 = 7.",
    ],
  },

  // ÀNIMA — Pista skate. Tinta UV al punt més alt de la pista.
  anima: {
    tipus: "text",
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

/** Versió sense la resposta correcta: l'única part d'una SolucioImatge que es pot enviar al client. */
export function getSolucioPublica(estacioId: string) {
  const solucio = getSolucio(estacioId);
  if (!solucio) return undefined;
  if (solucio.tipus === "text") return { tipus: "text" as const };
  return {
    tipus: "imatge" as const,
    opcions: solucio.opcions.map(({ id, imatge, etiqueta }) => ({ id, imatge, etiqueta })),
  };
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

export function comparaResposta(solucio: SolucioText, resposta: string): boolean {
  const normalitzada = normalitzaText(resposta);
  return solucio.respostesAcceptades.some((r) => normalitzaText(r) === normalitzada);
}
