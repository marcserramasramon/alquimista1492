'use client'

import { useEffect, useState } from 'react'
import type { GameStatus } from '@/lib/realtime/useGameClock'

interface PlayerTimerProps {
  status: GameStatus
  expiresAt?: string | null
}

/**
 * Small countdown badge in the header. Purely presentational: the
 * "game started" / "bell rung" popups and their one-time trigger logic
 * live in useGameClockAlerts, not here.
 */
export function PlayerTimer({ status, expiresAt }: PlayerTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (status !== 'active' || !expiresAt) {
      setSecondsRemaining(null)
      return
    }

    const targetMs = new Date(expiresAt).getTime()

    const updateCountdown = () => {
      const diffSec = Math.floor((targetMs - Date.now()) / 1000)
      setSecondsRemaining(Math.max(0, diffSec))
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [status, expiresAt])

  if (status === 'pending') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold shadow-sm bg-vellum text-leather border border-leather">
        <span>⏳</span>
        <span>Esperant l&apos;inici</span>
      </div>
    )
  }

  if (status === 'finished' || secondsRemaining === null || secondsRemaining <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-serif font-bold tracking-wide shadow-sm bg-cochineal text-parchment">
        <span>🔔</span>
        <span>00:00</span>
      </div>
    )
  }

  const hours = Math.floor(secondsRemaining / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
  const seconds = secondsRemaining % 60

  const isCritical = secondsRemaining <= 600 // < 10 mins

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-serif font-bold tracking-wide shadow-sm transition-all border ${
        isCritical
          ? 'bg-cochineal text-parchment border-cochineal animate-pulse'
          : 'bg-vellum text-ink border-leather'
      }`}
      title="Temps restant de la partida"
    >
      <span>{secondsRemaining === 0 ? '🔔' : '⌛'}</span>
      <span>
        {hours > 0 && `${String(hours).padStart(2, '0')}:`}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
