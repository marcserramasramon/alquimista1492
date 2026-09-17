import 'server-only';

import { selectRandomCoartada, distributeFrags, type Coartada } from '@/content/private/coartadas';

export interface CoartadaAssignment {
  coartada: Coartada;
  assignments: number[];
  frases: string[];
}

/**
 * Assigns a coartada to a team by distributing its frases among players.
 *
 * @param teamId - The team identifier (currently unused, reserved for future use)
 * @param playerCount - Number of players on the team
 * @returns Object containing the coartada, player-to-frase assignments, and frase content
 *
 * @example
 * // For 4 players
 * const result = assignCoartadaToTeam('team-123', 4);
 * // {
 * //   coartada: { type: 'llevadora', frases: [...] },
 * //   assignments: [0, 1, 2, 3],
 * //   frases: ['frase1...', 'frase2...', 'frase3...', 'frase4...']
 * // }
 */
export function assignCoartadaToTeam(
  teamId: string,
  playerCount: number,
): CoartadaAssignment {
  // Select a random coartada
  const coartada = selectRandomCoartada();

  // Distribute frases among players (cycles through 0, 1, 2, 3)
  const assignments = distributeFrags(coartada, playerCount);

  // Extract actual frase content
  const frases = coartada.frases;

  return {
    coartada,
    assignments,
    frases: Array.from(frases),
  };
}
