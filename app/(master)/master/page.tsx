'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMasterDashboard, TeamData } from '@/lib/master/useDashboard'
import { TeamsTable } from '@/components/master/TeamsTable'
import { GameTimer } from '@/components/master/GameTimer'
import { EquipsQRModal } from '@/components/master/EquipsQRModal'
import { EmissariScannerModal } from '@/components/master/EmissariScannerModal'
import Link from 'next/link'

export default function MasterDashboard() {
  const router = useRouter()
  const {
    teams,
    sessionStartTime,
    sessionEndTime,
    gameStatus,
    durationMinutes,
    isLoading,
    error,
    refetch,
    resetGame,
    startGame,
    adjustBell,
    isResetting,
    isStarting,
  } = useMasterDashboard()

  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isEmissariScannerOpen, setIsEmissariScannerOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(90)

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('master_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/master-logout', {
        method: 'POST',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('master_token')
      router.push('/login')
    }
  }

  const handleConfirmReset = async () => {
    try {
      await resetGame(selectedDuration)
      setShowResetConfirm(false)
      // Automatically open the QR modal so the master can immediately show QR codes to players
      setIsQRModalOpen(true)
    } catch (err) {
      alert('Error reiniciant la partida. Revisa la consola.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">👑</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-amber-950">
                Control del Màster
              </h1>
            </div>
            <p className="text-amber-800 text-sm mt-1">
              Partida Única · Monitoratge dels 8 Equips en Viu
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Botó Escàner Emissari (Salvos) */}
            <button
              onClick={() => setIsEmissariScannerOpen(true)}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-red-800 hover:bg-red-900 rounded-lg shadow transition-colors flex items-center gap-2 border border-red-600"
            >
              <span>⚔️</span> Escanejar Salvos (Emissari)
            </button>

            {/* Botó Central QR */}
            <Link
              href="/master/qr"
              className="px-4 py-2.5 text-sm font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow transition-colors flex items-center gap-2 border border-amber-700"
            >
              <span>📍</span> Codis QR (Estacions + Equips)
            </Link>

            {/* Botó Codis QR i Manuals Modal */}
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-4 py-2.5 text-sm font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <span>📱</span> Codis QR i Manuals
            </button>

            {/* Botó Nova Partida / Reiniciar */}
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={isResetting}
              className="px-4 py-2.5 text-sm font-semibold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>🔄</span> {isResetting ? 'Reiniciant...' : 'Nova Partida'}
            </button>

            {/* Veure Resultats */}
            <Link
              href="/master/results"
              className="px-4 py-2.5 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <span>🏆</span> Resultats
            </Link>

            {/* Tancar sessió */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 text-sm font-medium text-amber-900 hover:text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors"
              title="Tancar sessió"
            >
              Sortir
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-900 flex items-center justify-between">
            <div>
              <p className="font-semibold">Error carregant dades:</p>
              <p className="text-sm mt-0.5">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs bg-red-200 hover:bg-red-300 font-bold rounded"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Preparation Banner when game is in 'pending' status */}
        {gameStatus === 'pending' && (
          <div className="mb-6 p-5 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-2 border-amber-400 rounded-2xl shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="text-2xl">📢</span>
                  <h2 className="text-lg sm:text-xl font-bold text-amber-950">
                    Fase 1: Creació de Grups i Preparació
                  </h2>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">
                  Ensenya els <strong>codis QR</strong> als participants perquè entrin i formin els grups. Veuràs els jugadors connectats a la taula inferior en temps real.
                </p>
                <p className="text-sm text-amber-950 font-semibold mt-1">
                  Quan tothom estigui a punt, prem el botó verd per <strong>iniciar el compte enrere</strong>!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-4 py-3 text-sm font-bold text-amber-950 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-xl shadow transition flex items-center gap-2"
                >
                  <span>📱</span> Ensenyar QR als Participants
                </button>

                <button
                  onClick={async () => {
                    try {
                      await startGame(durationMinutes)
                    } catch (e) {
                      alert('Error iniciant el temps.')
                    }
                  }}
                  disabled={isStarting}
                  className="px-6 py-3 text-base font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isStarting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Iniciant...</span>
                    </>
                  ) : (
                    <>
                      <span>▶️</span> Iniciar el Temps ({durationMinutes} min)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timer Section */}
        <div className="mb-8">
          <GameTimer
            startTime={sessionStartTime}
            endTime={sessionEndTime}
            totalMinutes={durationMinutes}
            gameStatus={gameStatus}
            onAdjustBell={adjustBell}
          />
        </div>

        {/* Teams Table */}
        <TeamsTable
          teams={teams}
          isLoading={isLoading}
          onOpenQR={() => setIsQRModalOpen(true)}
        />

        {/* Footer Info */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-700 gap-2">
          <p>
            ℹ️ Cada codi QR és únic per a un equip i el comparteixen tots els seus integrants.
          </p>
          <p>Última actualització: {new Date().toLocaleTimeString('ca-ES')}</p>
        </div>
      </div>

      {/* Modal QR per als 8 equips */}
      <EquipsQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        teams={teams}
      />

      {/* Modal de confirmació de reinici de partida amb selector de durada */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-amber-300 text-stone-800">
            <h3 className="text-xl font-bold text-amber-950 flex items-center gap-2 mb-2">
              <span>⚠️</span> Iniciar Nova Partida?
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              Aquesta acció <strong>restablirà els 8 equips a zero</strong> per començar una nova partida única:
            </p>

            {/* Selector de Durada */}
            <div className="mb-4 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                ⏱️ Durada de la Partida (Compte Enrere):
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[60, 75, 90, 105, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setSelectedDuration(mins)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      selectedDuration === mins
                        ? 'bg-amber-800 text-white border-amber-900 shadow-sm'
                        : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200/60">
                <span className="text-xs text-amber-800">O minuts personalitzats:</span>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2 py-1 bg-white border border-amber-300 rounded text-center text-xs font-bold"
                />
                <span className="text-xs text-amber-700">min</span>
              </div>
            </div>

            <ul className="text-xs text-stone-600 list-disc list-inside space-y-1 mb-6 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <li>S'esborraran els jugadors anteriors dels 8 equips.</li>
              <li>Tots els salconduits es restauraran a 3.</li>
              <li>Les estacions superades i la puntuació tornaran a 0.</li>
              <li>La campana sonarà automàticament en acabar els {selectedDuration} minuts.</li>
            </ul>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                disabled={isResetting}
              >
                Cancel·lar
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-5 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow transition-colors flex items-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reiniciant...</span>
                  </>
                ) : (
                  <span>Sí, iniciar nova partida</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Escàner Emissari */}
      <EmissariScannerModal
        isOpen={isEmissariScannerOpen}
        onClose={() => {
          setIsEmissariScannerOpen(false)
          refetch()
        }}
        teams={teams}
      />
    </div>
  )
}
