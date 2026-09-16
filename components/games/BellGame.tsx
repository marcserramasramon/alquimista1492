'use client'

import { useState, useEffect } from 'react'
import { GameProps } from '@/components/gameTypes'

interface BellGameState {
  currentScreen: 'intro' | 'input' | 'result'
  code: string
  attempts: number
  isCorrect: boolean
}

const CORRECT_CODE = '1234' // foc=1, aigua=2, aire=3, terra=4

/**
 * Joc 8: Sometent — Campanar
 * Input 4 digits per tocar el campanar
 * Validació: ordre correcta (element codes)
 * Correcte: som campana + +100 punts
 */
export function BellGame(props: GameProps) {
  const [state, setState] = useState<BellGameState>(() => {
    const saved = props.sharedState as BellGameState | undefined
    return saved || {
      currentScreen: 'intro',
      code: '',
      attempts: 0,
      isCorrect: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSubmit = async () => {
    const normalized = state.code.replace(/[\s-]/g, '')

    if (normalized.length !== 4 || !/^\d{4}$/.test(normalized)) {
      setState(prev => ({ ...prev, attempts: prev.attempts + 1 }))
      return
    }

    const isCorrect = normalized === CORRECT_CODE

    const result = await props.submit({
      code: normalized,
      isCorrect,
    })

    setState(prev => ({
      ...prev,
      isCorrect: result.correct || isCorrect,
      attempts: prev.attempts + 1,
      currentScreen: 'result',
    }))
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col">
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-600 mb-4">
        12:34:56
      </div>

      {state.currentScreen === 'intro' && (
        <IntroScreen onContinue={() => setState(prev => ({ ...prev, currentScreen: 'input' }))} />
      )}

      {state.currentScreen === 'input' && (
        <InputScreen
          code={state.code}
          onCodeChange={val => setState(prev => ({ ...prev, code: val }))}
          onSubmit={handleSubmit}
          attempts={state.attempts}
        />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen isCorrect={state.isCorrect} attempts={state.attempts} />
      )}
    </div>
  )
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-3xl font-bold text-center mb-6">PORTA DEL CAMPANAR</h1>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4">
        <p className="text-5xl mb-4">🔔</p>
        <p className="text-lg font-bold">El Sometent final</p>
        <p className="text-sm mt-2 text-amber-800">Els conjurats de Sant Sebastià senten el senyal.</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <p className="font-bold mb-3 text-sm">CODI DELS 4 ELEMENTS:</p>
        <p className="text-sm">FOC = 1</p>
        <p className="text-sm">AIGUA = 2</p>
        <p className="text-sm">AIRE = 3</p>
        <p className="text-sm">TERRA = 4</p>
      </div>

      <p className="text-center text-sm text-amber-800 mb-4">
        Introduir la seqüència correcta per tocar el campanar.
      </p>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        CONTINUAR
      </button>
    </div>
  )
}

function InputScreen({
  code,
  onCodeChange,
  onSubmit,
  attempts,
}: {
  code: string
  onCodeChange: (val: string) => void
  onSubmit: () => void
  attempts: number
}) {
  const isValid = code.replace(/[\s-]/g, '').length === 4

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">CODI DEL CAMPANAR (4 dígits)</h2>

      <div className="bg-amber-100 p-8 rounded-lg text-center mb-4">
        <p className="text-5xl mb-4">🔔</p>
      </div>

      <input
        type="text"
        value={code}
        onChange={e => onCodeChange(e.target.value)}
        placeholder="Ex: 1234 o 1-2-3-4"
        className="w-full p-4 text-2xl text-center font-bold border-2 border-amber-900 tracking-widest"
        maxLength="7"
      />

      <p className="text-center text-sm text-amber-800">Forma: 1234 o 1-2-3-4</p>

      {attempts > 0 && (
        <div className="bg-red-100 p-3 rounded border border-red-600">
          <p className="text-sm text-red-600">Intents: {attempts}</p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!isValid}
        className={`w-full p-4 font-bold text-lg border-2 transition ${
          isValid
            ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
        }`}
      >
        TOCAR EL CAMPANAR
      </button>
    </div>
  )
}

function ResultScreen({ isCorrect, attempts }: { isCorrect: boolean; attempts: number }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-6">
      {isCorrect ? (
        <>
          <h2 className="text-3xl font-bold text-center text-green-600 mb-2">✓ CORRECTE!</h2>

          <div className="bg-green-50 border-2 border-green-600 p-8 rounded-lg text-center animate-bounce">
            <p className="text-6xl mb-4">🔔</p>
            <p className="font-bold text-green-700 text-lg">DONG... DONG... DONG...</p>
            <p className="text-sm text-green-600 mt-2">El campanar sona!</p>
          </div>

          <div className="bg-amber-100 p-4 rounded-lg text-center">
            <p className="text-base mb-2">Els conjurats de Sant Sebastià senten el senyal.</p>
            <p className="text-sm text-amber-800">I comencen a moure's cap a la seguretat.</p>
          </div>

          <p className="text-center font-bold text-lg text-green-600">+100 punts</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center text-red-600 mb-4">✗ CODI INCORRECTE</h2>

          <div className="bg-red-100 border-2 border-red-600 p-6 rounded-lg text-center">
            <p className="text-lg mb-2">El codi que has entrat no és correcte.</p>
            <p className="text-sm text-red-700">Repassa els 4 elements.</p>
            <p className="text-sm font-bold mt-4">Intents: {attempts}</p>
          </div>
        </>
      )}
    </div>
  )
}
