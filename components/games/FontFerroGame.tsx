'use client'

import { useState, useEffect } from 'react'
import { GameProps } from '@/components/gameTypes'

interface GameState {
  currentScreen: 'menu' | 'intro' | 'recepta' | 'torns' | 'joc' | 'result'
  selectedDate: string
  attempts: number
}

export function FontFerroGame(props: GameProps) {
  const [state, setState] = useState<GameState>(() => {
    const saved = props.sharedState as GameState | undefined
    return saved || {
      currentScreen: 'menu',
      selectedDate: '',
      attempts: 0,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSubmit = async () => {
    if (!state.selectedDate) return

    const result = await props.submit({
      date: state.selectedDate,
    })

    if (result.correct) {
      setState(prev => ({ ...prev, currentScreen: 'result' }))
    } else {
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        selectedDate: '',
      }))
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

      {state.currentScreen === 'recepta' && (
        <ReceptaScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'torns' && (
        <TornsScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'joc' && (
        <JocScreen
          selectedDate={state.selectedDate}
          onDateSelect={date => setState(prev => ({ ...prev, selectedDate: date }))}
          onSubmit={handleSubmit}
          onNavigate={navigateTo}
          attempts={state.attempts}
        />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen solved={props.solved} />
      )}
    </div>
  )
}

function MenuScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-4xl font-bold text-center mb-8">FONT DEL FERRO</h1>
      <h2 className="text-xl text-center mb-8 text-amber-900">Tinta i Torns d'Aigua</h2>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('intro')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [1] INTRODUCCIÓ
        </button>
        <button
          onClick={() => onNavigate('recepta')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [2] RECEPTA DE TINTA
        </button>
        <button
          onClick={() => onNavigate('torns')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [3] TORNS DE LA FONT
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
  onNavigate: (screen: string) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">FONT DEL FERRO</h2>
        <p className="text-base leading-relaxed text-amber-900">
          "Aquesta font és l'única del terme que porta ferro natural. La tinta de gales es fa remullant tres dies senceres.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          Qui va venir a buscar aigua el dia que es va preparar la tinta que va escriure la carta?"
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

function ReceptaScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">RECEPTA DE TINTA</h2>
        <p className="text-sm text-amber-900 font-semibold mb-4">De la manera dels notaris</p>

        <div className="bg-amber-100 border-2 border-amber-900 p-4 text-sm text-amber-900 leading-relaxed">
          <p>
            "Esclafeu gales de roure. Poseu-les en remull amb aigua rovellada d'aquesta font, TRES DIES SENCERES, fins que l'aigua es torni negra i violàcia.
          </p>
          <p className="mt-3">
            Coleu-ho i afegiu-hi goma."
          </p>
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

function TornsScreen({
  onNavigate,
}: {
  onNavigate: (screen: string) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">TORNS DE LA FONT</h2>
        <p className="text-sm font-bold text-amber-900 mb-4">10–16 de maig de 1705</p>

        <div className="bg-amber-100 border-2 border-amber-900 p-4 text-sm text-amber-900 space-y-2">
          <div>DIA 10: Hostalera, Ferrer</div>
          <div>DIA 11: Moliner, Escolà, Benat</div>
          <div>DIA 12: Escolà, Ferrer, Benat</div>
          <div>DIA 13: Moliner, Ferrer, Benat</div>
          <div>DIA 14: Hostalera, Traginer</div>
          <div>DIA 15: Hostalera, Escolà</div>
          <div>DIA 16: Hostalera, Benat</div>
        </div>

        <p className="text-xs text-amber-900 mt-4">
          ⚠️ El dia 12 hi havia mercat a Vic. L'Hostal no va venir.
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

function JocScreen({
  selectedDate,
  onDateSelect,
  onSubmit,
  onNavigate,
  attempts,
}: {
  selectedDate: string
  onDateSelect: (date: string) => void
  onSubmit: () => void
  onNavigate: (screen: string) => void
  attempts: number
}) {
  const dates = ['10', '11', '12', '13', '14', '15', '16']

  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">EL JOC: TORNS DE LA FONT</h2>

        <p className="text-sm text-amber-900 mb-6">
          "La tinta es va fer el 15 de maig. Es remulla 3 dies. L'aigua es va recollir 3 dies abans.
        </p>
        <p className="text-sm text-amber-900 mb-6">
          Clica al dia per marcar qui va recollir l'aigua AQUELL dia."
        </p>

        <div className="bg-amber-100 border-2 border-amber-900 p-4 mb-6">
          <div className="grid grid-cols-4 gap-2">
            {dates.map(day => (
              <button
                key={day}
                onClick={() => onDateSelect(day)}
                className={`p-3 font-bold text-sm border-2 ${
                  selectedDate === day
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-amber-900 border-amber-900'
                }`}
              >
                Dia {day}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="bg-blue-50 border-2 border-blue-900 p-4 mb-6 text-sm">
            <p className="text-blue-900 font-bold mb-2">
              Dia {selectedDate} - Qui va venir:
            </p>
            {selectedDate === '12' && (
              <div className="text-blue-900">
                <p>✓ Escolà</p>
                <p>✓ Ferrer</p>
                <p>✓ Benat</p>
              </div>
            )}
            {selectedDate !== '12' && (
              <p className="text-blue-900">Selecciona el dia correcte...</p>
            )}
          </div>
        )}

        {attempts > 0 && (
          <p className="text-red-600 text-sm mb-4">
            Intent {attempts}/3 - Data incorrecta
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={onSubmit}
          disabled={!selectedDate}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold disabled:opacity-50"
        >
          [CONFIRMAR DIA {selectedDate || '?'}]
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

function ResultScreen({ solved }: { solved: boolean }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      {solved ? (
        <>
          <h2 className="text-3xl font-bold text-center mb-4">✓ CORRECTE!</h2>
          <p className="text-center text-amber-900 font-bold mb-4">
            DIA 12 DE MAIG ✓
          </p>
          <p className="text-center text-amber-900 mb-4">
            Els qui van recollir l'aigua:
          </p>
          <div className="bg-amber-100 border-2 border-amber-900 p-4">
            <p className="text-amber-900">✓ ANTON l'escolà</p>
            <p className="text-amber-900">✓ ISIDRE el ferrer</p>
            <p className="text-amber-900">✓ BERNAT el mestre</p>
          </div>
          <p className="text-center text-amber-900 mt-4">
            MARIANNA de l'Hostal estava al Mercat de Vic.
          </p>
          <p className="text-center text-amber-900 font-bold">✓ DESCARTADA</p>
          <div className="bg-amber-100 border-2 border-amber-900 p-4 text-center">
            <p className="font-bold text-amber-900">🔑 XIFRA DESCOBERTA: AIGUA = 2</p>
          </div>
          <p className="text-center text-green-600 font-bold">+100 punts</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center mb-4">✗ INCORRECTE</h2>
          <p className="text-center text-amber-900">
            La tinta es va fer el 15. Calcula −3 dies.
          </p>
        </>
      )}
    </div>
  )
}
