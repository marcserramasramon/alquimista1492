'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameProps } from '@/components/gameTypes'

interface GameState {
  currentScreen: 'menu' | 'intro' | 'regles' | 'joc' | 'result'
  visitedCells: number[]
  totalMinutes: number
  isSubmitting: boolean
}

const CELLS: Record<number, { id: number; name: string; type: string; row: number; col: number; isDestination?: boolean; isStart?: boolean }> = {
  1: { id: 1, name: 'Camí Vic', type: 'location', row: 0, col: 0 },
  2: { id: 2, name: '', type: 'empty', row: 0, col: 1 },
  3: { id: 3, name: 'Farga', type: 'location', row: 0, col: 2, isDestination: true },
  4: { id: 4, name: 'Bosc', type: 'prohibit', row: 0, col: 3 },
  5: { id: 5, name: 'Hostal', type: 'location', row: 1, col: 0 },
  6: { id: 6, name: 'Pou', type: 'location', row: 1, col: 1 },
  7: { id: 7, name: 'Era', type: 'location', row: 1, col: 2 },
  8: { id: 8, name: 'Bosc', type: 'prohibit', row: 1, col: 3 },
  9: { id: 9, name: 'Escola', type: 'location', row: 2, col: 0 },
  10: { id: 10, name: 'Rectoria', type: 'location', row: 2, col: 1 },
  11: { id: 11, name: 'Hort', type: 'location', row: 2, col: 2 },
  12: { id: 12, name: 'Font', type: 'location', row: 2, col: 3 },
  13: { id: 13, name: 'Cementiri', type: 'prohibit', row: 3, col: 0 },
  14: { id: 14, name: 'Plaça', type: 'location', row: 3, col: 1, isStart: true },
  15: { id: 15, name: 'Paller', type: 'location', row: 3, col: 2 },
  16: { id: 16, name: 'Riera', type: 'prohibit', row: 3, col: 3 },
}

export function PlaneBonesGame(props: GameProps) {
  const router = useRouter()
  const [state, setState] = useState<GameState>(() => {
    const saved = props.sharedState as GameState | undefined
    return saved || {
      currentScreen: 'menu',
      visitedCells: [14], // Start at Plaça
      totalMinutes: 0,
      isSubmitting: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleCellClick = (cellId: number) => {
    if (state.visitedCells.includes(cellId)) return

    const cell = CELLS[cellId as keyof typeof CELLS]
    if (cell.type === 'prohibit') return

    setState(prev => ({
      ...prev,
      visitedCells: [...prev.visitedCells, cellId],
      totalMinutes: prev.totalMinutes + 15,
    }))
  }

  const handleSubmit = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      await props.submit({
        visitedCells: state.visitedCells,
        totalMinutes: state.totalMinutes,
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

      {state.currentScreen === 'regles' && (
        <ReglesScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'joc' && (
        <JocScreen
          visitedCells={state.visitedCells}
          totalMinutes={state.totalMinutes}
          onCellClick={handleCellClick}
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
      <h1 className="text-4xl font-bold text-center mb-8">PLANES BONES</h1>
      <h2 className="text-xl text-center mb-8 text-amber-900">La Ronda de la Patrulla</h2>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('intro')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [1] INTRODUCCIÓ
        </button>
        <button
          onClick={() => onNavigate('regles')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [2] REGLES
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
        <h2 className="text-2xl font-bold mb-6">PLANES BONES</h2>
        <p className="text-base leading-relaxed text-amber-900">
          "El traginer va espiar la ronda de la patrulla des del paller i en va memoritzar les regles.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          La nit del 15 de maig, la patrulla surt de la Plaça a les deu (22:00). Cada quart d'hora avança un tram.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          El ferrer diu que la nit del 15 estava a la Farga. Marca el camí que va seguir la patrulla."
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
        >
          [CONTINUAR]
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

function ReglesScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">REGLES DE LA PATRULLA</h2>

        <div className="bg-amber-100 border-2 border-amber-900 p-4 mb-6 text-sm text-amber-900 space-y-2">
          <p>✓ Surt de la Plaça a les 22:00</p>
          <p>✓ Cada casella = +1 quart (15 min)</p>
          <p>✗ NO pot entrar: Bosc, Riera, Cementiri</p>
          <p>✗ NO repetir caselles</p>
        </div>

        <h3 className="font-bold text-amber-900 mb-3">MAPA (4×4):</h3>
        <div className="grid grid-cols-4 gap-1 text-xs text-center">
          {Object.values(CELLS).map(cell => (
            <div
              key={cell.id}
              className={`p-2 border ${
                cell.type === 'prohibit' ? 'bg-red-200 border-red-400' : 'bg-white border-amber-900'
              }`}
            >
              {cell.name || '-'}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 mt-6">
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
  visitedCells,
  totalMinutes,
  onCellClick,
  onSubmit,
  onNavigate,
  isSubmitting,
}: {
  visitedCells: number[]
  totalMinutes: number
  onCellClick: (cellId: number) => void
  onSubmit: () => void
  onNavigate: (screen: GameState['currentScreen']) => void
  isSubmitting: boolean
}) {
  const hours = 22 + Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-4">TRAÇA EL CAMÍ</h2>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-1 mb-6 bg-amber-100 p-2">
          {Object.values(CELLS).map(cell => (
            <button
              key={cell.id}
              onClick={() => onCellClick(cell.id)}
              disabled={
                visitedCells.includes(cell.id) || cell.type === 'prohibit' || isSubmitting
              }
              className={`p-2 text-xs font-bold border-2 ${
                visitedCells.includes(cell.id)
                  ? 'bg-green-500 text-white border-green-700'
                  : cell.type === 'prohibit'
                    ? 'bg-red-300 text-red-800 border-red-600 cursor-not-allowed'
                    : 'bg-white text-amber-900 border-amber-900 hover:bg-amber-50 disabled:opacity-50'
              }`}
            >
              {cell.name ? cell.name.slice(0, 3) : '-'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white border-2 border-amber-900 p-4 mb-6 text-sm">
          <div className="mb-2">
            <span className="font-bold text-amber-900">Temps total: </span>
            <span className="text-amber-900">{totalMinutes} min</span>
          </div>
          <div className="mb-2">
            <span className="font-bold text-amber-900">Hora actual: </span>
            <span className="text-amber-900">
              {hours}:{String(mins).padStart(2, '0')}
            </span>
          </div>
          <div>
            <span className="font-bold text-amber-900">Visitats: </span>
            <span className="text-amber-900">
              {visitedCells.map(id => CELLS[id].name || '-').join(' → ')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold disabled:opacity-50"
        >
          {isSubmitting ? '[ENVIANT...]' : '[VALIDAR]'}
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
