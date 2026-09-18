'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameClock, type GameClockState } from './useGameClock'

export interface GameClockAlerts extends GameClockState {
  /** Game is over: bell rung manually, or the countdown ran out. */
  isOver: boolean
  showStartedPopup: boolean
  showBellPopup: boolean
  dismissStartedPopup: () => void
}

/**
 * Wraps useGameClock and detects the two transitions players must be told
 * about exactly once: "pending -> active" (game just started) and
 * "-> over" (bell rung or time ran out). Popups are driven by these edges,
 * not recomputed every tick, so dismissing one sticks.
 */
export function useGameClockAlerts(): GameClockAlerts {
  const clock = useGameClock()
  const prevStatusRef = useRef<GameClockState['status'] | null>(null)

  const [showStartedPopup, setShowStartedPopup] = useState(false)
  const [isOverByTime, setIsOverByTime] = useState(false)

  // Detect "pending -> active" while this component stays mounted.
  useEffect(() => {
    if (clock.loading) return

    const prev = prevStatusRef.current
    if (prev === 'pending' && clock.status === 'active') {
      setShowStartedPopup(true)
    }
    prevStatusRef.current = clock.status
  }, [clock.loading, clock.status])

  // The countdown can run out without the master explicitly ringing the
  // bell, so also watch the clock locally rather than relying only on
  // status === 'finished'.
  useEffect(() => {
    if (clock.status !== 'active' || !clock.expiresAt) {
      setIsOverByTime(false)
      return
    }

    const target = new Date(clock.expiresAt).getTime()

    const tick = () => {
      setIsOverByTime(Date.now() >= target)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [clock.status, clock.expiresAt])

  const isOver = clock.status === 'finished' || isOverByTime
  const hasPlayedBellRef = useRef(false)

  useEffect(() => {
    if (isOver && !hasPlayedBellRef.current) {
      hasPlayedBellRef.current = true
      playBellSound()
    }
  }, [isOver])

  return {
    ...clock,
    isOver,
    showStartedPopup,
    showBellPopup: isOver,
    dismissStartedPopup: () => setShowStartedPopup(false),
  }
}

function playBellSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    // Rich church-like bell tone with harmonics
    const frequencies = [440, 880, 1320, 1760]
    const now = ctx.currentTime

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      const volume = 0.2 / (idx + 1)
      gain.gain.setValueAtTime(volume, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 3.5)
    })
  } catch (e) {
    console.warn('Audio play error:', e)
  }
}
