'use client'

import { useState, useEffect } from 'react'
import { GameProps } from '@/components/gameTypes'

interface ControlGameState {
  currentScreen: 'intro' | 'waiting' | 'result'
  passed: boolean
  salconduitLost: number
}

/**
 * Joc 5: Control de l'Emissari
 * L'Emissari interroga el grup sobre la coartada
 * Validació manual del màster
 */
export function ControlGame(props: GameProps) {
  const [state, setState] = useState<ControlGameState>(() => {
    const saved = props.sharedState as ControlGameState | undefined
    return saved || {
      currentScreen: 'intro',
      passed: false,
      salconduitLost: 0,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleConfirmMemory = async () => {
    // Move to waiting screen (master validates)
    setState(prev => ({ ...prev, currentScreen: 'waiting' }))

    // Submit to server for validation
    const result = await props.submit({
      type: 'control_acknowledge',
      timestamp: new Date().toISOString(),
    })

    if (result.correct) {
      setState(prev => ({
        ...prev,
        currentScreen: 'result',
        passed: true,
        salconduitLost: 0,
      }))
    } else {
      // Master marked as incorrect (lost salconduit)
      setState(prev => ({
        ...prev,
        currentScreen: 'result',
        passed: true, // always passes (not blocking)
        salconduitLost: 1,
      }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen bg-blue-950 text-amber-50 flex flex-col">
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-500 mb-4">
        12:34:56
      </div>

      {state.currentScreen === 'intro' && (
        <IntroScreen onContinue={handleConfirmMemory} />
      )}

      {state.currentScreen === 'waiting' && (
        <WaitingScreen />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen passed={state.passed} salconduitLost={state.salconduitLost} />
      )}
    </div>
  )
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SALVACONDUCTE DE L'EMISSARI</h1>
        <h2 className="text-lg text-amber-200">Memòria la teva frase exactament</h2>
      </div>

      <div className="bg-blue-900 border-2 border-amber-200 p-6 rounded-lg text-center">
        <p className="text-lg font-bold leading-relaxed text-amber-100">
          "Memòria la teva frase exactament per a la validació de l'Emissari"
        </p>
      </div>

      <div className="text-sm space-y-2 text-amber-100">
        <p>Quan l'Emissari et pregunti,</p>
        <p>respon amb aquesta frase.</p>
        <br />
        <p className="font-bold">No la canviis, no la tradueixis,</p>
        <p className="font-bold">i no la passis a ningú.</p>
        <br />
        <p>Si tots diu el mateix, passareu.</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-600 text-blue-950 font-bold text-lg border-2 border-amber-200 hover:bg-amber-500 transition"
      >
        HE MEMÒRIA
      </button>
    </div>
  )
}

function WaitingScreen() {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">ESPERANT L'EMISSARI...</h2>

      <div className="bg-blue-900 border-2 border-amber-200 p-6 rounded-lg text-center">
        <p className="text-lg mb-4">L'Emissari us interrogarà.</p>
        <p className="text-base text-amber-100 mb-4">Respondeu amb la frase que heu memoritzat.</p>
        <div className="animate-pulse text-3xl">⏳</div>
      </div>
    </div>
  )
}

function ResultScreen({
  passed,
  salconduitLost,
}: {
  passed: boolean
  salconduitLost: number
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-6">
      <div className="text-center">
        {salconduitLost > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-4">−1 SALCONDUCTE</h2>
            <p className="text-lg text-amber-100 mb-4">L'Emissari no va validar les vostres respostes.</p>
            <p className="text-base text-amber-200">Però passareu igualment al Pla de Masset.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-amber-300 mb-4">✓ CORRECTE</h2>
            <p className="text-lg text-amber-100 mb-4">L'Emissari va validar les vostres respostes.</p>
            <p className="text-base text-amber-200">Passareu sense penalització.</p>
          </>
        )}
      </div>

      <div className="bg-blue-900 border-2 border-amber-200 p-6 rounded-lg">
        <p className="text-center font-bold">Seguiu al Pla de Masset</p>
      </div>
    </div>
  )
}
