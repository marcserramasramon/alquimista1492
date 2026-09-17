'use client'

import { useEffect, useState } from 'react'
import type { PassRow } from '@/lib/realtime/useTeamState'

interface SalconduitTabProps {
  passes: PassRow[]
}

export function SalconduitTab({ passes }: SalconduitTabProps) {
  const [displayIndex, setDisplayIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)

  const activePasses = passes.filter((p) => !p.used_at)
  const currentPass = activePasses[displayIndex]

  // Rotate pass every 30 seconds
  useEffect(() => {
    if (activePasses.length === 0) return

    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % activePasses.length)
      setTimeLeft(30)
    }, 30000)

    return () => clearInterval(interval)
  }, [activePasses.length])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full flex flex-col h-full">
      {/* Title */}
      <div className="px-6 py-4 border-b border-amber-200">
        <h2 className="text-xl font-bold text-amber-900">Salconduit</h2>
        <p className="text-sm text-amber-700 mt-1">
          Pass per passar els controls
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {activePasses.length === 0 ? (
          // No passes
          <div className="text-center">
            <div className="text-5xl mb-4">⛔</div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              Cap Salconduit Disponible
            </h3>
            <p className="text-amber-700">
              Ja has utilitzat tots els salconduits
            </p>
          </div>
        ) : currentPass ? (
          // Display pass
          <div className="w-full max-w-xs">
            {/* Pass Card */}
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8 shadow-2xl border-4 border-amber-700 mb-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 text-6xl">🔱</div>
                <div className="absolute bottom-0 right-0 text-6xl">🔱</div>
              </div>

              {/* Content */}
              <div className="relative text-center">
                <div className="text-3xl mb-3">📜</div>

                <h3 className="font-bold text-amber-900 text-sm mb-4">
                  SALCONDUIT OFICIAL
                </h3>

                {/* Token Display */}
                <div className="bg-white rounded-lg p-4 mb-4 border-2 border-amber-700">
                  <p className="text-xs text-amber-700 mb-1 font-semibold">
                    CODI D'ACCÉS
                  </p>
                  <p className="font-mono text-lg font-bold text-amber-900 break-all">
                    {currentPass.pass_token}
                  </p>
                </div>

                {/* Instructions */}
                <p className="text-xs text-amber-800 mb-3">
                  Mostra aquest codi a l'Emissari per passar el control
                </p>

                {/* Pass Counter */}
                <div className="text-xs text-amber-700">
                  Salconduit {displayIndex + 1} de {activePasses.length}
                </div>
              </div>
            </div>

            {/* Rotation Info */}
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-900">
                Canvi automàtic en {timeLeft}s
              </p>
              <div className="flex gap-1 justify-center mt-3">
                {activePasses.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 rounded-full transition-all ${
                      idx === displayIndex ? 'bg-amber-700 w-4' : 'bg-amber-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Used Passes Info */}
        {passes.some((p) => p.used_at) && (
          <div className="mt-8 w-full max-w-xs p-4 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700">
              Salconduits usats: {passes.filter((p) => p.used_at).length}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
