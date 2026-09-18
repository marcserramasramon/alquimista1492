import 'server-only'

import { getServiceRoleClient } from '@/lib/db'

export type GameStatus = 'pending' | 'active' | 'finished'

export interface GameClock {
  status: GameStatus
  durationMinutes: number | null
  startedAt: string | null
  expiresAt: string | null
}

const DEFAULT_CLOCK: GameClock = {
  status: 'pending',
  durationMinutes: null,
  startedAt: null,
  expiresAt: null,
}

/**
 * Reads the single shared game clock. There is only ever one row (id = 1).
 */
export async function getGameClock(): Promise<GameClock> {
  const serviceClient = getServiceRoleClient()

  const { data } = await serviceClient
    .from('game_config')
    .select('status, duration_minutes, started_at, expires_at')
    .eq('id', 1)
    .maybeSingle()

  if (!data) {
    return DEFAULT_CLOCK
  }

  return {
    status: data.status as GameStatus,
    durationMinutes: data.duration_minutes,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
  }
}

/**
 * The game is over once the master has explicitly rung the bell, or once
 * the countdown has run out — whichever comes first. Before the master
 * starts the game (status "pending"), it is never over.
 */
export function isGameOver(clock: GameClock, now: Date = new Date()): boolean {
  if (clock.status === 'finished') return true
  if (clock.status === 'active' && clock.expiresAt) {
    return now.getTime() >= new Date(clock.expiresAt).getTime()
  }
  return false
}
