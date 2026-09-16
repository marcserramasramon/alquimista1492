'use client'

import { useState, useEffect } from 'react'
import { GameProps } from '@/components/gameTypes'

interface MoralChoiceGameState {
  currentScreen: 'intro' | 'choice' | 'result'
  choice: 'A' | 'B' | null
  timeRemaining: number
}

/**
 * Joc 9: Decisió Moral
 * Bernat's choice: Acceptar tracte vs Rebutjar
 * NO scoring (neutre) - tracks percentage for final
 */
export function MoralChoiceGame(props: GameProps) {
  const [state, setState] = useState<MoralChoiceGameState>(() => {
    const saved = props.sharedState as MoralChoiceGameState | undefined
    return saved || {
      currentScreen: 'intro',
      choice: null,
      timeRemaining: 60,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Timer
  useEffect(() => {
    if (state.currentScreen === 'choice' && state.timeRemaining > 0 && !state.choice) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }

    // Auto-select option B if time runs out
    if (state.timeRemaining === 0 && !state.choice) {
      handleChoice('B')
    }
  }, [state.currentScreen, state.timeRemaining, state.choice])

  const handleChoice = async (choice: 'A' | 'B') => {
    setState(prev => ({
      ...prev,
      choice,
      currentScreen: 'result',
    }))

    await props.submit({
      choice,
      timeRemaining: state.timeRemaining,
      type: 'moral_choice',
    })
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col">
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-600 mb-4">
        12:34:56
      </div>

      {state.currentScreen === 'intro' && (
        <IntroScreen onContinue={() => setState(prev => ({ ...prev, currentScreen: 'choice' }))} />
      )}

      {state.currentScreen === 'choice' && (
        <ChoiceScreen
          timeRemaining={state.timeRemaining}
          onChoose={handleChoice}
        />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen choice={state.choice} />
      )}
    </div>
  )
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-3xl font-bold text-center mb-6">LA DECISIÓ FINAL</h1>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4 border-2 border-amber-900">
        <p className="text-lg italic mb-4">
          "Sé per on vénen els dragons. Us ho dic si em deixeu anar a buscar el meu fill."
        </p>
        <p className="font-bold text-xl mt-4">
          "Vosaltres... què hauríeu fet?"
        </p>
      </div>

      <p className="text-center text-sm text-amber-800 mb-4">
        Bernat espera la vostra resposta. No hi ha resposta correcta o incorrecta.
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

function ChoiceScreen({
  timeRemaining,
  onChoose,
}: {
  timeRemaining: number
  onChoose: (choice: 'A' | 'B') => void
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">DECISIÓ MORAL</h2>

      <div className="bg-amber-100 p-4 rounded-lg text-center mb-4 border-2 border-amber-900">
        <p className="italic">Bernat espera la resposta...</p>
      </div>

      <div className="flex-1 space-y-3">
        <button
          onClick={() => onChoose('A')}
          className="w-full p-6 bg-blue-100 border-2 border-blue-600 hover:bg-blue-150 transition text-left rounded-lg"
        >
          <p className="font-bold text-blue-900 text-lg">OPCIÓ A</p>
          <p className="text-blue-900 font-bold mt-2">ACCEPTAR TRACTE</p>
          <p className="text-sm text-blue-700 mt-2">
            "Dons el camí als dragons. Deixa que fugis a buscar el teu fill."
          </p>
          <div className="mt-3 text-xs text-blue-600 space-y-1">
            <p>→ Els conjurats fugen salvos</p>
            <p>→ Bernat fuig amb Jaume</p>
            <p>→ FINAL: Compassió</p>
          </div>
        </button>

        <button
          onClick={() => onChoose('B')}
          className="w-full p-6 bg-red-100 border-2 border-red-600 hover:bg-red-150 transition text-left rounded-lg"
        >
          <p className="font-bold text-red-900 text-lg">OPCIÓ B</p>
          <p className="text-red-900 font-bold mt-2">REBUTJAR TRACTE</p>
          <p className="text-sm text-red-700 mt-2">
            "No. Toquem el sometent sense saber el camí segur. Bernat, estás detingut."
          </p>
          <div className="mt-3 text-xs text-red-600 space-y-1">
            <p>→ Els conjurats fugen pels pèls</p>
            <p>→ Bernat queda tancat</p>
            <p>→ FINAL: Justicia</p>
          </div>
        </button>
      </div>

      <div className="text-center">
        <p className={`font-bold text-lg ${timeRemaining <= 10 ? 'text-red-600' : 'text-amber-600'}`}>
          ⏱️ TEMPS: {timeRemaining} seg
        </p>
      </div>
    </div>
  )
}

function ResultScreen({ choice }: { choice: 'A' | 'B' | null }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-3xl font-bold text-center mb-4">🔔 CAMPANA DE L'ALBA 🔔</h2>

      <div className="bg-amber-100 p-8 rounded-lg text-center mb-4 animate-bounce">
        <p className="text-5xl mb-2">🔔</p>
        <p className="font-bold text-lg">DONG... DONG... DONG...</p>
      </div>

      {choice === 'A' ? (
        <div className="bg-blue-100 border-2 border-blue-600 p-6 rounded-lg">
          <p className="font-bold text-blue-900 text-lg mb-3">COMPASIÓ</p>
          <p className="text-sm text-blue-700 leading-relaxed mb-3">
            Els dragoons arriben tard. Els conjurats fugen pel camí segur que Bernat els ha indicat.
          </p>
          <div className="border-t border-blue-300 pt-3 mt-3">
            <p className="italic text-sm text-blue-700">
              "Bernat i Jaume es reuniren a l'estiu. No tornaren mai més a la Guixa.
              <br/>
              Però els conjurats van salvos."
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border-2 border-red-600 p-6 rounded-lg">
          <p className="font-bold text-red-900 text-lg mb-3">JUSTICIA</p>
          <p className="text-sm text-red-700 leading-relaxed mb-3">
            Els dragoons arriben ràpid. Els conjurats se'n surten pels pèls. Bernat queda tancat al mas.
          </p>
          <div className="border-t border-red-300 pt-3 mt-3">
            <p className="italic text-sm text-red-700">
              "Jaume surt de presó tardor. Busca el seu pare a l'escola. No el troba.
              <br/>
              Els conjurats es salvaren. Però al preu de la familia de Bernat."
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg text-center border-2 border-gray-400">
        <p className="text-sm text-gray-700 italic">
          "Aquella nit els vau salvar. La història no els va salvar per sempre."
        </p>
      </div>

      <div className="text-center font-bold text-lg text-amber-900 mt-4">
        FINAL DE LA PARTIDA
      </div>
    </div>
  )
}
