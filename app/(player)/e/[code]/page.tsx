'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PlayerNameInput } from '@/components/player/PlayerNameInput'
import { usePlayerSignIn } from '@/lib/player/useSignIn'

export default function PlayerEntryPage() {
  const params = useParams()
  const code = (params.code as string) || ''

  const [playerName, setPlayerName] = useState('')
  const { signIn, isLoading, error } = usePlayerSignIn()

  // Derive code error from code value (no setState in effect)
  const codeError =
    !code || code.length !== 6
      ? 'Codi d\'equip no vàlid'
      : null

  const handleSubmit = async () => {
    if (!code || code.length !== 6) {
      return
    }

    if (playerName.length < 2 || playerName.length > 30) {
      return
    }

    await signIn(code, playerName)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            El Traïdor de la Guixa
          </h1>
          <p className="text-lg text-amber-700 mb-1">
            Entrada de Jugador
          </p>
          {code && code.length === 6 && (
            <p className="text-sm text-amber-600 font-mono tracking-widest">
              Equip: {code.toUpperCase()}
            </p>
          )}
        </div>

        {/* Entry Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-amber-200">
          {codeError ? (
            // Error state if code is invalid
            <div className="text-center py-8">
              <div className="mb-6 text-6xl">⚠️</div>
              <p className="text-red-800 font-semibold mb-2">Codi Invàlid</p>
              <p className="text-sm text-amber-700 mb-8">
                {codeError}
              </p>
              <p className="text-xs text-amber-600">
                Verifica el codi QR i intenta-ho de nou
              </p>
            </div>
          ) : (
            // Normal form
            <>
              <div className="mb-6 text-center">
                <p className="text-sm text-amber-700">
                  Introdueix el teu nom per entrar al joc
                </p>
              </div>

              <PlayerNameInput
                value={playerName}
                onChange={setPlayerName}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error || undefined}
                disabled={codeError !== null}
              />

              {/* Help Text */}
              <div className="mt-8 pt-6 border-t border-amber-100">
                <p className="text-xs text-center text-amber-600">
                  Webapp de joc per a l'escapada "El Traïdor de la Guixa"
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl" />
      </div>
    </div>
  )
}
