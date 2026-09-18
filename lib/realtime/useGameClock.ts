'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/db'
import type { Database } from '@/lib/db.types'

export type GameStatus = Database['public']['Tables']['game_config']['Row']['status']

export interface GameClockState {
  status: GameStatus
  durationMinutes: number | null
  startedAt: string | null
  expiresAt: string | null
  loading: boolean
}

const INITIAL_STATE: GameClockState = {
  status: 'pending',
  durationMinutes: null,
  startedAt: null,
  expiresAt: null,
  loading: true,
}

/**
 * Realtime view of the single shared game clock (one row in game_config).
 * The countdown is never derived from team/session timestamps — only from
 * this row, which the master controls explicitly.
 */
export function useGameClock(): GameClockState {
  const [state, setState] = useState<GameClockState>(INITIAL_STATE)

  const fetchClock = useCallback(async () => {
    const { data } = await supabase
      .from('game_config')
      .select('status, duration_minutes, started_at, expires_at')
      .eq('id', 1)
      .maybeSingle()

    setState({
      status: data?.status ?? 'pending',
      durationMinutes: data?.duration_minutes ?? null,
      startedAt: data?.started_at ?? null,
      expiresAt: data?.expires_at ?? null,
      loading: false,
    })
  }, [])

  useEffect(() => {
    fetchClock()

    const channel = supabase
      .channel('game-config')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_config' },
        (payload) => {
          const row = payload.new as Database['public']['Tables']['game_config']['Row'] | undefined
          if (!row) return
          setState({
            status: row.status,
            durationMinutes: row.duration_minutes,
            startedAt: row.started_at,
            expiresAt: row.expires_at,
            loading: false,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchClock])

  return state
}
