'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRScanner } from './QRScanner'
import type { Station } from '@/content/public/stations'
import type { TeamStationRow } from '@/lib/realtime/useTeamState'

interface StationModalProps {
  isOpen: boolean
  onClose: () => void
  station: Station | null
  teamStation: TeamStationRow | null
  teamId?: string
}

export function StationModal({
  isOpen,
  onClose,
  station,
  teamStation,
  teamId,
}: StationModalProps) {
  const router = useRouter()
  const [showScanner, setShowScanner] = useState(false)
  const [isLoadingToken, setIsLoadingToken] = useState(false)

  const handlePlayGame = async () => {
    if (!station || !teamId) return

    try {
      setIsLoadingToken(true)
      const response = await fetch('/api/game/get-station-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: station.id,
          teamId,
        }),
      })

      if (!response.ok) {
        console.error('Failed to get token:', response.statusText)
        return
      }

      const data = await response.json()
      router.push(`/s/${data.token}`)
    } catch (err) {
      console.error('Error getting token:', err)
    } finally {
      setIsLoadingToken(false)
    }
  }

  if (!isOpen || !station) return null

  const visited = !!teamStation
  const solved = teamStation?.solved ?? false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-900 to-amber-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              {station.elementImage ? (
                <img src={station.elementImage} alt={station.catalan} className="w-8 h-8 object-contain drop-shadow" />
              ) : (
                <span>{station.icon}</span>
              )}
              <span>{station.catalan}</span>
            </h2>
            <p className="text-amber-200 text-sm mt-1">
              {station.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-amber-950/40 hover:bg-amber-950/80 flex items-center justify-center text-xl transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Station Image if available */}
        {station.image && (
          <div className="relative w-full aspect-[16/9] bg-stone-900 overflow-hidden border-b border-amber-300/40">
            <img
              src={station.image}
              alt={station.catalan}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 text-white/90 text-xs italic drop-shadow-md">
              "{station.narrativeHook}"
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Difficulty Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Dificultat:{' '}
              {station.difficulty === 'facil'
                ? '🟢 Fàcil'
                : station.difficulty === 'mig'
                  ? '🟡 Mitjà'
                  : '🔴 Difícil'}
            </span>
          </div>

          {/* Status Section */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            {!visited ? (
              <div className="text-center">
                <p className="text-sm text-amber-900 font-semibold mb-3">
                  🔒 Estació no visitada
                </p>
                <p className="text-xs text-amber-700 mb-4">
                  Escaneja el codi QR per accedir a aquesta estació i resoldre el joc.
                </p>
              </div>
            ) : solved ? (
              <div className="text-center">
                <p className="text-sm text-green-700 font-semibold mb-2">
                  ✅ Estació completada
                </p>
                <p className="text-xs text-green-600">
                  Joc resolt en {teamStation?.attempts ?? 1} intent
                  {(teamStation?.attempts ?? 1) !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-amber-900 font-semibold mb-2">
                  ⏳ Estació en progres
                </p>
                <p className="text-xs text-amber-700">
                  Intents: {teamStation?.attempts ?? 1}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {station.id.includes('campanar') || station.id.includes('sometent') ? (
              // Campanar: direct play button once unlocked
              <button
                onClick={handlePlayGame}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoadingToken}
              >
                {isLoadingToken ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Carregant el Campanar...
                  </>
                ) : (
                  <>
                    <span>🔔</span>
                    Pujar al Campanar (Obrir Joc)
                  </>
                )}
              </button>
            ) : !visited ? (
              // Not visited: Show QR Scanner button
              <button
                onClick={() => setShowScanner(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                Escaneja QR
              </button>
            ) : solved ? (
              // Solved: Show view-only button
              <button
                onClick={handlePlayGame}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoadingToken}
              >
                {isLoadingToken ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Carregant...
                  </>
                ) : (
                  <>
                    <span>👁️</span>
                    Veure Joc (Completat)
                  </>
                )}
              </button>
            ) : (
              // Visited, not solved: Show play button
              <button
                onClick={handlePlayGame}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isLoadingToken}
              >
                {isLoadingToken ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Carregant...
                  </>
                ) : (
                  <>
                    <span>🎮</span>
                    Torna al Joc
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg transition-colors"
            >
              Tancar
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal - when user clicks "Escaneja QR" */}
      {showScanner && (
        <QRScanner
          onClose={() => {
            setShowScanner(false)
            // QRScanner will redirect on successful scan
          }}
        />
      )}
    </div>
  )
}
