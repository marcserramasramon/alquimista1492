/** Durada de la partida: límits i opcions ràpides del selector del màster (com a l'app antiga). */
export const DURADA_MINIMA_MIN = 5;
export const DURADA_MAXIMA_MIN = 300;
export const DURADES_RAPIDES_MIN = [60, 75, 90, 105, 120] as const;
export const DURADA_PER_DEFECTE_MIN = 90;

/** Ajustos de temps que el màster pot fer amb un toc un cop la partida corre. */
export const AJUSTOS_MIN = [-5, 5, 10] as const;

/** Temps mínim entre dues respostes d'un equip a la mateixa fita (el servidor el fa complir). */
export const ESPERA_ENTRE_INTENTS_MS = 3_000;

/** Per sota d'aquests minuts el compte enrere es posa en alerta. */
export const MINUTS_ALERTA = 10;

/** Temps restant en ms a partir de `endsAt` i de la diferència entre el rellotge del servidor i el del mòbil. */
export function tempsRestantMs(endsAt: string, desfasamentMs: number, ara = Date.now()): number {
  return Math.max(0, Date.parse(endsAt) - (ara + desfasamentMs));
}

/** "1:05:09" o "05:09". */
export function formatTemps(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}
