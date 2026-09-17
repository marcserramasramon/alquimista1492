'use client'

import { useEffect, useState } from 'react'

interface GameTimerProps {
  startTime?: Date | null
  endTime?: Date | null
  totalMinutes?: number
  onAdjustBell?: (params: { addMinutes?: number; triggerNow?: boolean; setDurationMinutes?: number }) => Promise<unknown>
}

export function GameTimer({
  startTime,
  endTime,
  totalMinutes = 90,
  onAdjustBell,
}: GameTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [status, setStatus] = useState<'active' | 'warning' | 'critical' | 'ended'>('active')
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [confirmBell, setConfirmBell] = useState(false)

  useEffect(() => {
    const calculateRemaining = () => {
      const now = new Date()
      const targetTime = endTime
        ? endTime
        : startTime
          ? new Date(startTime.getTime() + totalMinutes * 60 * 1000)
          : null

      if (!targetTime) {
        setTimeRemaining(null)
        return
      }

      const diffMs = targetTime.getTime() - now.getTime()
      const seconds = Math.max(0, Math.floor(diffMs / 1000))
      setTimeRemaining(seconds)

      const totalMs = totalMinutes * 60 * 1000
      const percentRemaining = (diffMs / totalMs) * 100

      if (seconds === 0) {
        setStatus('ended')
      } else if (percentRemaining <= 10 || seconds <= 600) {
        setStatus('critical')
      } else if (percentRemaining <= 25 || seconds <= 1500) {
        setStatus('warning')
      } else {
        setStatus('active')
      }
    }

    calculateRemaining()
    const timer = setInterval(calculateRemaining, 1000)
    return () => clearInterval(timer)
  }, [startTime, endTime, totalMinutes])

  if (timeRemaining === null) {
    return (
      <div className="rounded-xl p-6 border-2 border-stone-200 bg-stone-50 text-center text-stone-500">
        <p className="text-sm">Cronòmetre no iniciat. Inicia una partida per activar el compte enrere.</p>
      </div>
    )
  }

  const hours = Math.floor(timeRemaining / 3600)
  const minutes = Math.floor((timeRemaining % 3600) / 60)
  const seconds = timeRemaining % 60

  const statusStyles = {
    active: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    warning: 'bg-amber-50 text-amber-950 border-amber-300',
    critical: 'bg-red-50 text-red-950 border-red-400 animate-pulse',
    ended: 'bg-stone-200 text-stone-900 border-stone-400',
  }

  const handleAddMinutes = async (mins: number) => {
    if (!onAdjustBell || isAdjusting) return
    setIsAdjusting(true)
    try {
      await onAdjustBell({ addMinutes: mins })
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleTriggerBellNow = async () => {
    if (!onAdjustBell || isAdjusting) return
    setIsAdjusting(true)
    try {
      await onAdjustBell({ triggerNow: true })
      setConfirmBell(false)
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <div className={`rounded-2xl p-6 border-2 shadow-md transition-colors ${statusStyles[status]}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left / Center: Big Timer Display */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-xl">⏱️</span>
            <p className="text-xs uppercase font-bold tracking-widest opacity-80">
              Compte Enrere · Durada de la Partida
            </p>
          </div>

          <div className="text-5xl md:text-6xl font-extrabold font-mono tracking-wider">
            {hours > 0 && <span>{String(hours).padStart(2, '0')}:</span>}
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <p className="text-xs font-semibold mt-2 opacity-80">
            {status === 'ended'
              ? '🔔 CAMPANA SONADA · Temps finalitzat!'
              : status === 'critical'
                ? '⚠️ FASE CRÍTICA! Menys de 10 minuts'
                : status === 'warning'
                  ? '⏳ Últims 25 minuts'
                  : '🟢 Partida en curs'}
            {endTime && (
              <span className="ml-2 font-normal opacity-70">
                (Hora límit: {new Date(endTime).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })})
              </span>
            )}
          </p>
        </div>

        {/* Right: Quick Action Controls for Game Master */}
        {onAdjustBell && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleAddMinutes(5)}
              disabled={isAdjusting}
              className="px-3 py-2 text-xs font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg shadow-sm transition"
              title="Afegir 5 minuts al temps de la partida"
            >
              +5 min
            </button>
            <button
              onClick={() => handleAddMinutes(10)}
              disabled={isAdjusting}
              className="px-3 py-2 text-xs font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg shadow-sm transition"
              title="Afegir 10 minuts al temps de la partida"
            >
              +10 min
            </button>
            <button
              onClick={() => handleAddMinutes(-5)}
              disabled={isAdjusting || timeRemaining <= 300}
              className="px-3 py-2 text-xs font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg shadow-sm transition"
              title="Restar 5 minuts al temps de la partida"
            >
              -5 min
            </button>

            {!confirmBell ? (
              <button
                onClick={() => setConfirmBell(true)}
                disabled={isAdjusting || status === 'ended'}
                className="px-4 py-2 text-xs font-bold text-white bg-red-800 hover:bg-red-900 rounded-lg shadow transition flex items-center gap-1.5"
                title="Fer sonar la campana i finalitzar immediatament"
              >
                <span>🔔</span> Tocar Campana Ara
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-red-100 p-1 rounded-lg border border-red-300 animate-fadeIn">
                <span className="text-[11px] font-bold text-red-900 px-1">Segur?</span>
                <button
                  onClick={handleTriggerBellNow}
                  disabled={isAdjusting}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded transition"
                >
                  Sí, tocar!
                </button>
                <button
                  onClick={() => setConfirmBell(false)}
                  className="px-2 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
