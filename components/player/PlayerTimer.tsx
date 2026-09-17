'use client'

import { useEffect, useState, useRef } from 'react'

interface PlayerTimerProps {
  expiresAt?: string | null
  startedAt?: string | null
  totalMinutesFallback?: number
  onTimeExpired?: () => void
}

export function PlayerTimer({
  expiresAt,
  startedAt,
  totalMinutesFallback = 90,
  onTimeExpired,
}: PlayerTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const [bellTriggered, setBellTriggered] = useState(false)
  const hasPlayedAudioRef = useRef(false)

  // Web Audio Bell Sound Generator
  const playBellSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()

      // Create rich church-like bell tone with harmonics
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

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      let targetMs: number | null = null

      if (expiresAt) {
        targetMs = new Date(expiresAt).getTime()
      } else if (startedAt) {
        targetMs = new Date(startedAt).getTime() + totalMinutesFallback * 60 * 1000
      }

      if (!targetMs) {
        setSecondsRemaining(null)
        return
      }

      const diffSec = Math.floor((targetMs - now) / 1000)

      if (diffSec <= 0) {
        setSecondsRemaining(0)
        setBellTriggered(true)

        if (!hasPlayedAudioRef.current) {
          hasPlayedAudioRef.current = true
          playBellSound()
          if (onTimeExpired) {
            onTimeExpired()
          }
        }
      } else {
        setSecondsRemaining(diffSec)
        setBellTriggered(false)
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [expiresAt, startedAt, totalMinutesFallback, onTimeExpired])

  if (secondsRemaining === null) {
    return null
  }

  const hours = Math.floor(secondsRemaining / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
  const seconds = secondsRemaining % 60

  const isCritical = secondsRemaining <= 600 // < 10 mins
  const isWarning = secondsRemaining <= 1500 // < 25 mins

  return (
    <>
      {/* Timer Badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider shadow-sm transition-all ${
          secondsRemaining === 0
            ? 'bg-red-700 text-white animate-bounce shadow-red-300'
            : isCritical
              ? 'bg-red-600 text-white animate-pulse shadow-red-200'
              : isWarning
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
        }`}
        title={secondsRemaining === 0 ? 'La campana ha tocat!' : 'Temps restant de la partida'}
      >
        <span>{secondsRemaining === 0 ? '🔔' : '⏱️'}</span>
        <span>
          {hours > 0 && `${String(hours).padStart(2, '0')}:`}
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>

      {/* Bell Triggered Alarm Overlay */}
      {bellTriggered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-red-600 animate-scaleUp">
            <div className="text-5xl mb-3 animate-bounce">🔔</div>
            <h2 className="text-2xl font-black text-red-900 mb-2">
              LA CAMPANA HA TOCAT!
            </h2>
            <p className="text-stone-700 text-sm mb-4 leading-relaxed">
              El temps s'ha esgotat. L'alerta ha sonat a tota la Guixa. Correu a formular l'acusació final o reviseu els resultats!
            </p>
            <button
              onClick={() => setBellTriggered(false)}
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow transition"
            >
              Entès
            </button>
          </div>
        </div>
      )}
    </>
  )
}
