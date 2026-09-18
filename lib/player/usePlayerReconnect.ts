'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/db'

export type ReconnectStatus = 'checking' | 'valid' | 'invalid'

/**
 * Comprova si l'aparell ja té una sessió de jugador desada (Supabase la
 * persisteix sola al navegador). Si l'equip d'aquella sessió ja no està
 * actiu (partida acabada / reiniciada pel màster), es considera invàlida.
 */
export function usePlayerReconnect() {
  const [status, setStatus] = useState<ReconnectStatus>('checking')

  useEffect(() => {
    let cancelled = false

    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) setStatus('invalid')
        return
      }

      const { data: player, error } = await supabase
        .from('players')
        .select('id, teams(is_active)')
        .eq('user_id', user.id)
        .single()

      if (cancelled) return

      const team = player
        ? Array.isArray(player.teams)
          ? player.teams[0]
          : player.teams
        : null

      if (error || !player || !team || !team.is_active) {
        setStatus('invalid')
        return
      }

      setStatus('valid')
    }

    check()

    return () => {
      cancelled = true
    }
  }, [])

  return status
}
