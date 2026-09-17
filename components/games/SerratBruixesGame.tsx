'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameProps } from '@/components/gameTypes'

interface GameState {
  currentScreen: 'menu' | 'intro' | 'tabla' | 'joc' | 'result'
  answer: string
  isSubmitting: boolean
}

export function SerratBruixesGame(props: GameProps) {
  const router = useRouter()
  const [state, setState] = useState<GameState>(() => {
    const saved = props.sharedState as GameState | undefined
    return saved || {
      currentScreen: 'menu',
      answer: '',
      isSubmitting: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSubmit = async () => {
    if (!state.answer.trim()) return

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      await props.submit({
        answer: state.answer,
      })
      // Validation happens server-side; redirect to hub
      router.push(`/joc/hub`)
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const navigateTo = (screen: GameState['currentScreen']) => {
    setState(prev => ({ ...prev, currentScreen: screen }))
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col">
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-600 mb-4">
        12:34:56
      </div>

      {state.currentScreen === 'menu' && (
        <MenuScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'intro' && (
        <IntroScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'tabla' && (
        <TablaScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'joc' && (
        <JocScreen
          answer={state.answer}
          onAnswerChange={val => setState(prev => ({ ...prev, answer: val }))}
          onSubmit={handleSubmit}
          onNavigate={navigateTo}
          isSubmitting={state.isSubmitting}
        />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen />
      )}
    </div>
  )
}

function MenuScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-4xl font-bold text-center mb-8">SERRAT DE LES BRUIXES</h1>
      <h2 className="text-xl text-center mb-8 text-amber-900">El Codi de Fogueres</h2>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('intro')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [1] INTRODUCCIÓ
        </button>
        <button
          onClick={() => onNavigate('tabla')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [2] TAULA DE FOGUERES
        </button>
        <button
          onClick={() => onNavigate('joc')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [4] EL JOC
        </button>
      </div>
    </div>
  )
}

function IntroScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">SERRAT DE LES BRUIXES</h2>
        <p className="text-base leading-relaxed text-amber-900">
          "Els vigies dels turons de vigilància parlen de nit amb fogueres quan no es pot enviar ningú.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          La nit del 15 de maig, els vigies van veure un missatge des de Vic. Nadie sap com llegir-lo.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          Un informador secret diu que la carta del delator és de mà pròpia: el delator sap escriure."
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
        >
          [ENTENENT]
        </button>
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function TablaScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">SENYALS DE FOC DE LA PLANA</h2>

        <div className="mb-6">
          <p className="text-sm text-amber-900 mb-3">Fogueres a l'esquerra = FILA</p>
          <p className="text-sm text-amber-900 mb-6">Fogueres a la dreta = COLUMNA</p>

          <div className="font-mono text-sm leading-relaxed bg-amber-100 p-4 border-2 border-amber-900">
            <div className="grid grid-cols-6 gap-2 text-center">
              <div></div>
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>

              <div>1</div>
              <div>A</div>
              <div>B</div>
              <div>C</div>
              <div>D</div>
              <div>E</div>

              <div>2</div>
              <div>F</div>
              <div>G</div>
              <div>H</div>
              <div>I</div>
              <div>J</div>

              <div>3</div>
              <div>L</div>
              <div>M</div>
              <div>N</div>
              <div>O</div>
              <div>P</div>

              <div>4</div>
              <div>Q</div>
              <div>R</div>
              <div>S</div>
              <div>T</div>
              <div>U</div>

              <div>5</div>
              <div>V</div>
              <div>X</div>
              <div>Z</div>
              <div>Ç</div>
              <div>·</div>
            </div>
          </div>
          <p className="text-xs text-amber-900 mt-2">· = espai</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
        >
          [ENTENENT]
        </button>
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function JocScreen({
  answer,
  onAnswerChange,
  onSubmit,
  onNavigate,
  isSubmitting,
}: {
  answer: string
  onAnswerChange: (val: string) => void
  onSubmit: () => void
  onNavigate: (screen: GameState['currentScreen']) => void
  isSubmitting: boolean
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">DESXIFRA EL MISSATGE</h2>

        <p className="text-sm text-amber-900 mb-6">
          "Vistes la nit del 15 des del Serrat."
        </p>

        <p className="text-sm text-amber-900 font-bold mb-3">
          Què diuen les fogueres?
        </p>
        <input
          type="text"
          value={answer}
          onChange={e => onAnswerChange(e.target.value.toUpperCase())}
          disabled={isSubmitting}
          className="w-full p-3 border-2 border-amber-900 text-amber-900 font-mono text-lg mb-6 disabled:opacity-50"
          placeholder="..."
        />
      </div>

      <div className="space-y-3">
        <button
          onClick={onSubmit}
          disabled={!answer.trim() || isSubmitting}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold disabled:opacity-50"
        >
          {isSubmitting ? 'ENVIANT...' : '[VALIDAR]'}
        </button>
        <button
          onClick={() => onNavigate('menu')}
          disabled={isSubmitting}
          className="w-full p-3 text-left text-amber-900 font-bold disabled:opacity-50"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function ResultScreen() {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <div className="text-center">
        <p className="text-lg text-amber-900">Processant resposta...</p>
      </div>
    </div>
  )
}
