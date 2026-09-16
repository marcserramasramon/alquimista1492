'use client'

import { useState, useEffect } from 'react'
import { GameProps } from '@/components/gameTypes'

interface BoxGameState {
  currentPart: 1 | 2 | 3
  currentScreen: 'intro' | 'input' | 'open' | 'cards' | 'substitute' | 'emissari' | 'moral' | 'result'
  part1Code: string
  part1Attempts: number
  part2SelectedDate: string | null
  part2StolenCards: Set<string>
  part3Choice: 'A' | 'B' | null
  part3TimeRemaining: number
  isCorrect: boolean
}

const CARD_DATES = ['14-05', '15-05', '16-05', '17-05', '13-05', '18-05']
const CORRECT_DATE = '16-05'
const EMISSARI_PASSWORD = "L'ALBA VE DE VIC"

/**
 * Joc 7: Caixa de les Almoines (Parts 1-3)
 * Part 1: Obrir caixa (codi 4231)
 * Part 2: Substitució carta (data 16-05)
 * Part 3: Sometent + Decisió moral
 */
export function BoxGame(props: GameProps) {
  const [state, setState] = useState<BoxGameState>(() => {
    const saved = props.sharedState as BoxGameState | undefined
    return saved || {
      currentPart: 1,
      currentScreen: 'intro',
      part1Code: '',
      part1Attempts: 0,
      part2SelectedDate: null,
      part2StolenCards: new Set(),
      part3Choice: null,
      part3TimeRemaining: 60,
      isCorrect: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Part 3 timer
  useEffect(() => {
    if (state.currentScreen === 'moral' && state.part3TimeRemaining > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          part3TimeRemaining: prev.part3TimeRemaining - 1,
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [state.currentScreen, state.part3TimeRemaining])

  const handlePart1Submit = async () => {
    const normalized = state.part1Code.replace(/[\s-]/g, '')
    if (normalized !== '4231') {
      setState(prev => ({ ...prev, part1Attempts: prev.part1Attempts + 1 }))
      return
    }

    setState(prev => ({
      ...prev,
      currentScreen: 'open',
    }))
  }

  const handlePart1Correct = () => {
    setState(prev => ({
      ...prev,
      currentPart: 2,
      currentScreen: 'cards',
    }))
  }

  const toggleStolenCard = (date: string) => {
    setState(prev => {
      const newStolen = new Set(prev.part2StolenCards)
      if (newStolen.has(date)) {
        newStolen.delete(date)
      } else {
        newStolen.add(date)
      }
      return { ...prev, part2StolenCards: newStolen }
    })
  }

  const handlePart2Submit = async () => {
    if (!state.part2SelectedDate) return

    const isCorrect = state.part2SelectedDate === CORRECT_DATE

    const result = await props.submit({
      part: 2,
      selectedDate: state.part2SelectedDate,
      isCorrect,
    })

    if (isCorrect) {
      setState(prev => ({
        ...prev,
        currentPart: 3,
        currentScreen: 'emissari',
      }))
    } else {
      setState(prev => ({
        ...prev,
        currentScreen: 'cards',
        part2SelectedDate: null,
      }))
    }
  }

  const handlePart3Choice = async (choice: 'A' | 'B') => {
    setState(prev => ({
      ...prev,
      part3Choice: choice,
      currentScreen: 'result',
    }))

    await props.submit({
      part: 3,
      choice,
      timeRemaining: state.part3TimeRemaining,
    })
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col">
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-600 mb-4">
        12:34:56
      </div>

      {/* Part 1: Obrir caixa */}
      {state.currentPart === 1 && state.currentScreen === 'intro' && (
        <Part1IntroScreen onContinue={() => setState(prev => ({ ...prev, currentScreen: 'input' }))} />
      )}

      {state.currentPart === 1 && state.currentScreen === 'input' && (
        <Part1InputScreen
          code={state.part1Code}
          onCodeChange={val => setState(prev => ({ ...prev, part1Code: val }))}
          onSubmit={handlePart1Submit}
          attempts={state.part1Attempts}
        />
      )}

      {state.currentPart === 1 && state.currentScreen === 'open' && (
        <Part1OpenScreen onContinue={handlePart1Correct} />
      )}

      {/* Part 2: Substitució carta */}
      {state.currentPart === 2 && state.currentScreen === 'cards' && (
        <Part2CardsScreen
          dates={CARD_DATES}
          stolenCards={state.part2StolenCards}
          selectedDate={state.part2SelectedDate}
          onToggleCard={toggleStolenCard}
          onSelectDate={val => setState(prev => ({ ...prev, part2SelectedDate: val }))}
          onSubmit={handlePart2Submit}
        />
      )}

      {/* Part 3: Sometent + Decisió moral */}
      {state.currentPart === 3 && state.currentScreen === 'emissari' && (
        <Part3EmissariScreen onContinue={() => setState(prev => ({ ...prev, currentScreen: 'moral' }))} />
      )}

      {state.currentPart === 3 && state.currentScreen === 'moral' && (
        <Part3MoralScreen timeRemaining={state.part3TimeRemaining} onChoose={handlePart3Choice} />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen choice={state.part3Choice} />
      )}
    </div>
  )
}

function Part1IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-3xl font-bold text-center mb-6">CAIXA DE LES ALMOINES</h1>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4">
        <p className="text-lg font-bold mb-4">🔒</p>
        <p className="mb-4">La caixa està segellada amb cadenat.</p>
        <p>Necessites la CONTRASENYA dels 4 elements.</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <p className="font-bold mb-3 text-sm">Recorda els 4 elements de les estacions:</p>
        <p className="text-sm">CIM (Serrat) = 4 (FOC)</p>
        <p className="text-sm">FONT (Font Ferro) = 2 (AIGUA)</p>
        <p className="text-sm">PLA (Planes Bones) = 3 (TERRA)</p>
        <p className="text-sm">PEDRA (Cementiri) = 1 (PEDRA)</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        CONTINUAR
      </button>
    </div>
  )
}

function Part1InputScreen({
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
      <h2 className="text-2xl font-bold text-center mb-4">CONTRASENYA (4 xifres)</h2>

      <input
        type="text"
        value={code}
        onChange={e => onCodeChange(e.target.value)}
        placeholder="Ex: 4231 o 4-2-3-1"
        className="w-full p-4 text-2xl text-center font-bold border-2 border-amber-900"
      />

      <p className="text-center text-sm text-amber-800">Forma: 4231 o 4 2 3 1</p>

      {attempts > 0 && (
        <div className="bg-red-100 p-3 rounded border border-red-600">
          <p className="text-sm text-red-600">−10 punts • Intent {attempts}/3</p>
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
        OBRIR
      </button>
    </div>
  )
}

function Part1OpenScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-6">
      <h2 className="text-3xl font-bold text-center mb-4">🔓 OBRINT LA CAIXA...</h2>

      <div className="bg-amber-100 p-8 rounded-lg text-center animate-pulse">
        <p className="text-6xl mb-4">🔑</p>
        <p className="font-bold">Animació d'obertura...</p>
      </div>

      <div className="bg-green-100 border-2 border-green-600 p-4 rounded-lg text-center">
        <p className="font-bold text-green-700">✓ CORRECTE!</p>
        <p className="text-sm text-green-600 mt-2">La caixa s'ha obert.</p>
        <p className="text-sm mt-2">Dins trobes:</p>
        <p className="text-sm">📜 Carta original de Bernat</p>
        <p className="text-sm">📜 Carta falsa del Rector</p>
        <p className="text-sm">📝 Nota del Capità</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        CONTINUAR A LA PART 2
      </button>
    </div>
  )
}

function Part2CardsScreen({
  dates,
  stolenCards,
  selectedDate,
  onToggleCard,
  onSelectDate,
  onSubmit,
}: {
  dates: string[]
  stolenCards: Set<string>
  selectedDate: string | null
  onToggleCard: (date: string) => void
  onSelectDate: (date: string | null) => void
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-2">DINS LA CAIXA</h2>

      <div className="bg-blue-100 p-4 rounded-lg text-center mb-2">
        <p className="font-bold">📬 SOBRE (original de Bernat)</p>
        <p className="text-sm">Data: 16-05-1705</p>
      </div>

      <p className="text-center font-bold text-sm mb-2">6 CARTES SOLTES:</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => onToggleCard(date)}
            className={`p-3 font-bold rounded border-2 transition ${
              stolenCards.has(date)
                ? 'bg-amber-900 text-amber-50 border-amber-900'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-150'
            }`}
          >
            📄<br />
            {date}
          </button>
        ))}
      </div>

      {stolenCards.size > 0 && (
        <>
          <p className="text-center font-bold text-sm">Quina carta substitueixes la del sobre?</p>
          <select
            value={selectedDate || ''}
            onChange={e => onSelectDate(e.target.value || null)}
            className="w-full p-3 border-2 border-amber-900"
          >
            <option value="">Selecciona data...</option>
            {Array.from(stolenCards).map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </>
      )}

      <button
        onClick={onSubmit}
        disabled={!selectedDate}
        className={`w-full p-4 font-bold text-lg border-2 transition ${
          selectedDate
            ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
        }`}
      >
        SUBSTITUIR
      </button>
    </div>
  )
}

function Part3EmissariScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">PORTA DEL CAMPANAR</h2>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4">
        <p className="text-lg mb-4">L'Emissari està aquí, amb fanal</p>
        <p className="font-bold italic">"Qui va? On aneu?"</p>
      </div>

      <input
        type="text"
        placeholder='Ex: "L\'ALBA VE DE VIC"'
        disabled
        className="w-full p-4 border-2 border-amber-900 bg-gray-100 text-center font-bold"
      />

      <p className="text-center text-sm text-amber-800">
        Contrasenya: L'ALBA VE DE VIC
      </p>

      <div className="bg-green-100 border-2 border-green-600 p-4 rounded-lg">
        <p className="text-center font-bold text-green-700">✓ Carta acceptada</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        CONTINUAR
      </button>
    </div>
  )
}

function Part3MoralScreen({
  timeRemaining,
  onChoose,
}: {
  timeRemaining: number
  onChoose: (choice: 'A' | 'B') => void
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">DECISIÓ MORAL</h2>

      <div className="bg-amber-100 p-4 rounded-lg text-center mb-4">
        <p className="italic mb-4">Bernat espera la resposta...</p>
        <p className="font-bold">"Vosaltres... què hauríeu fet?"</p>
      </div>

      <div className="flex-1 space-y-3 mb-4">
        <button
          onClick={() => onChoose('A')}
          className="w-full p-4 bg-blue-100 border-2 border-blue-600 hover:bg-blue-150 transition text-left"
        >
          <p className="font-bold text-blue-900">OPCIÓ A: ACCEPTAR TRACTE</p>
          <p className="text-sm text-blue-700 mt-2">Deixa que fugis a buscar el teu fill.</p>
        </button>

        <button
          onClick={() => onChoose('B')}
          className="w-full p-4 bg-red-100 border-2 border-red-600 hover:bg-red-150 transition text-left"
        >
          <p className="font-bold text-red-900">OPCIÓ B: REBUTJAR TRACTE</p>
          <p className="text-sm text-red-700 mt-2">No. Bernat, estás detingut.</p>
        </button>
      </div>

      <div className="text-center font-bold text-red-600">
        ⏱️ TEMPS: {timeRemaining} seg
      </div>
    </div>
  )
}

function ResultScreen({ choice }: { choice: 'A' | 'B' | null }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">🔔 CAMPANA DE L'ALBA 🔔</h2>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4 animate-bounce">
        <p className="text-4xl mb-2">🔔</p>
        <p className="font-bold">DONG... DONG... DONG...</p>
      </div>

      {choice === 'A' ? (
        <div className="bg-blue-100 border-2 border-blue-600 p-4 rounded-lg">
          <p className="font-bold text-blue-900 mb-2">OPCIÓ A: COMPASSIÓ</p>
          <p className="text-sm text-blue-700">
            Bernat i Jaume es reuniren a l'estiu. No tornaren mai més a la Guixa.
          </p>
          <p className="text-sm text-blue-700 mt-2">Però els conjurats van salvos.</p>
        </div>
      ) : (
        <div className="bg-red-100 border-2 border-red-600 p-4 rounded-lg">
          <p className="font-bold text-red-900 mb-2">OPCIÓ B: JUSTICIA</p>
          <p className="text-sm text-red-700">
            Jaume surt de presó tardor. Busca el seu pare a l'escola. No el troba.
          </p>
          <p className="text-sm text-red-700 mt-2">Els conjurats es salvaren.</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-700">
          "Aquella nit els vau salvar. La història no els va salvar per sempre."
        </p>
      </div>

      <p className="text-center font-bold text-lg text-amber-900 mt-4">
        +100 punts
      </p>
    </div>
  )
}
