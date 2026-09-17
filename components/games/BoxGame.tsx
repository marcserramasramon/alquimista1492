'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  zoomVariants,
} from '@/lib/animations/useAnimations'

interface BoxGameState {
  currentPart: 1 | 2 | 3
  currentScreen: 'intro' | 'input' | 'open' | 'cards' | 'card_detail' | 'emissari' | 'moral' | 'result'
  part1Code: string
  part1Attempts: number
  part2SelectedDate: string | null
  part2StolenCards: string[]
  part2SelectedCard: string | null
  part3Password: string
  part3Choice: 'A' | 'B' | null
  part3TimeRemaining: number
  isCorrect: boolean
}

const CARD_DATES = ['14-05', '15-05', '16-05', '17-05', '13-05', '18-05']
const CORRECT_DATE = '16-05'
const EMISSARI_PASSWORD = "L'ALBA VE DE VIC"

const CARD_DETAILS: Record<string, { signature: string; seal: string; desc: string; correct: boolean }> = {
  '14-05': { signature: 'Jaume', seal: '✓✓', desc: 'Signatura dubtosa', correct: false },
  '15-05': { signature: 'Bernat', seal: '◆✓', desc: 'Segell irregular', correct: false },
  '16-05': { signature: 'Bernat', seal: '✓✓', desc: 'Carta original', correct: true },
  '17-05': { signature: 'Anton', seal: '✓✓', desc: 'Data posterior', correct: false },
  '13-05': { signature: 'Jaume', seal: '◆', desc: 'Segell incomplet', correct: false },
  '18-05': { signature: 'Anton', seal: '◆◆', desc: 'Segell falsificat', correct: false },
}

/**
 * Joc 7: Caixa de les Almoines (Parts 1-3)
 * Part 1: Obrir caixa (codi 4231)
 * Part 2: Substitució carta (data 16-05)
 * Part 3: Sometent + Decisió moral
 */
export function BoxGame(props: GameProps) {
  const { play } = useAudio()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [state, setState] = useState<BoxGameState>(() => {
    const saved = props.sharedState as BoxGameState | undefined
    if (saved && 'currentPart' in saved) {
      return saved
    }
    return {
      currentPart: 1,
      currentScreen: 'intro',
      part1Code: '',
      part1Attempts: 0,
      part2SelectedDate: null,
      part2StolenCards: [],
      part2SelectedCard: null,
      part3Password: '',
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
    if (!state.part1Code.trim()) {
      setError('Introdueix la contrasenya')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: '1',
          answer: state.part1Code,
        }),
      })

      const data = await res.json()

      if (data.success) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          currentScreen: 'open',
        }))
      } else {
        play('buzzer')
        setError(data.message || 'Contrasenya incorrecta')
        setState(prev => ({ ...prev, part1Attempts: prev.part1Attempts + 1, part1Code: '' }))
      }
    } catch (err) {
      play('buzzer')
      setError('Error en la validació')
    } finally {
      setLoading(false)
    }
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
      const newStolen = prev.part2StolenCards.includes(date)
        ? prev.part2StolenCards.filter(d => d !== date)
        : [...prev.part2StolenCards, date]
      return { ...prev, part2StolenCards: newStolen }
    })
  }

  const handlePart2Submit = async () => {
    if (!state.part2SelectedDate) {
      setError('Selecciona una data')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: '2',
          answer: state.part2SelectedDate,
        }),
      })

      const data = await res.json()

      if (data.success) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          currentPart: 3,
          currentScreen: 'emissari',
        }))
      } else {
        play('buzzer')
        setError(data.message || 'Data incorrecta')
        setState(prev => ({
          ...prev,
          part2SelectedDate: null,
          part2SelectedCard: null,
        }))
      }
    } catch (err) {
      play('buzzer')
      setError('Error en la validació')
    } finally {
      setLoading(false)
    }
  }

  const handlePart3Password = async () => {
    if (state.part3Password.toUpperCase().trim() !== EMISSARI_PASSWORD) {
      play('buzzer')
      setError('Contrasenya incorrecta')
      return
    }

    play('evidence-unlock')
    setState(prev => ({
      ...prev,
      currentScreen: 'moral',
    }))
  }

  const handlePart3Choice = async (choice: 'A' | 'B') => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: '3',
          answer: { choice, timeRemaining: state.part3TimeRemaining },
        }),
      })

      const data = await res.json()

      setState(prev => ({
        ...prev,
        part3Choice: choice,
        currentScreen: 'result',
      }))

      play('evidence-unlock')
    } catch (err) {
      setError('Error en registrar la decisió')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-red-100 border border-red-600 text-red-700 p-3 rounded mb-4 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

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
      {state.currentPart === 2 && (state.currentScreen === 'cards' || state.currentScreen === 'card_detail') && (
        <>
          <Part2CardsScreen
            dates={CARD_DATES}
            stolenCards={new Set(state.part2StolenCards)}
            selectedDate={state.part2SelectedDate}
            selectedCard={state.part2SelectedCard}
            onSelectCard={date => setState(prev => ({ ...prev, part2SelectedCard: date }))}
            onToggleCard={toggleStolenCard}
            onSelectDate={val => setState(prev => ({ ...prev, part2SelectedDate: val }))}
            onSubmit={handlePart2Submit}
            loading={loading}
            error={error}
          />
          <AnimatePresence>
            {state.part2SelectedCard && state.currentScreen === 'cards' && (
              <CardDetailModal
                date={state.part2SelectedCard}
                details={CARD_DETAILS[state.part2SelectedCard]}
                isStolen={state.part2StolenCards.includes(state.part2SelectedCard)}
                onRob={() => {
                  toggleStolenCard(state.part2SelectedCard!)
                  play('bell-ding')
                }}
                onClose={() => setState(prev => ({ ...prev, part2SelectedCard: null }))}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Part 3: Sometent + Decisió moral */}
      {state.currentPart === 3 && state.currentScreen === 'emissari' && (
        <Part3EmissariScreen
          password={state.part3Password}
          onPasswordChange={val => setState(prev => ({ ...prev, part3Password: val }))}
          onSubmit={handlePart3Password}
          error={error}
          loading={loading}
        />
      )}

      {state.currentPart === 3 && state.currentScreen === 'moral' && (
        <Part3MoralScreen timeRemaining={state.part3TimeRemaining} onChoose={handlePart3Choice} />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen choice={state.part3Choice} />
      )}
    </motion.div>
  )
}

function Part1IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-3xl font-bold text-center mb-4">CAIXA DE LES ALMOINES</h1>

      <div className="bg-amber-100 p-4 rounded-lg text-center mb-2">
        <p className="text-2xl mb-2">🔒</p>
        <p className="font-bold mb-2">La caixa està segellada amb cadenat</p>
        <p className="text-sm text-amber-800">Necessites la contrasenya dels 4 elements</p>
      </div>

      <div className="bg-blue-100 p-3 rounded-lg text-center mb-4">
        <p className="font-bold mb-2 text-sm">4 Elements = 4 Números:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <p>🔥 CIM (Serrat) = <span className="font-bold">4</span></p>
          <p>💧 FONT = <span className="font-bold">2</span></p>
          <p>🌍 PLA (Planes) = <span className="font-bold">3</span></p>
          <p>⛰️ PEDRA (Cementiri) = <span className="font-bold">1</span></p>
        </div>
      </div>

      <motion.button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 rounded transition"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        OBRIR CADENAT
      </motion.button>
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
  const digits = code.padEnd(4, '0').slice(0, 4).split('')

  const handleDigitChange = (index: number, value: string) => {
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1) || '0'
    onCodeChange(newDigits.join(''))
  }

  const isCorrect = code.replace(/[\s-]/g, '') === '4231'

  return (
    <div className="flex flex-col justify-center flex-1 gap-6">
      <h2 className="text-2xl font-bold text-center">GIRAR LES RODES</h2>

      <div className="bg-amber-100 p-6 rounded-lg">
        <p className="text-center text-sm mb-4 text-amber-800">Introdueix: 4-2-3-1</p>

        <div className="flex gap-3 justify-center">
          {[0, 1, 2, 3].map(index => (
            <DialWheel
              key={index}
              value={parseInt(digits[index] || '0')}
              onChange={val => handleDigitChange(index, String(val))}
            />
          ))}
        </div>
      </div>

      {attempts > 0 && (
        <motion.div
          className="bg-red-100 p-3 rounded border border-red-600 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-red-600">❌ Intent {attempts}/3</p>
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={!isCorrect}
        className={`w-full p-4 font-bold text-lg border-2 transition rounded ${
          isCorrect
            ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
        }`}
        whileHover={isCorrect ? { scale: 1.02 } : {}}
        whileTap={isCorrect ? { scale: 0.98 } : {}}
      >
        🔓 OBRIR
      </motion.button>
    </div>
  )
}

function DialWheel({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={() => onChange((value + 1) % 10)}
        className="w-12 h-8 bg-amber-800 text-amber-50 font-bold text-lg rounded hover:bg-amber-700"
        whileTap={{ scale: 0.9 }}
      >
        ▲
      </motion.button>

      <motion.div
        className="w-14 h-16 bg-amber-900 border-4 border-amber-800 rounded flex items-center justify-center text-3xl font-bold text-amber-50 shadow-lg"
        animate={{ rotateX: value * 36 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {value}
      </motion.div>

      <motion.button
        onClick={() => onChange((value - 1 + 10) % 10)}
        className="w-12 h-8 bg-amber-800 text-amber-50 font-bold text-lg rounded hover:bg-amber-700"
        whileTap={{ scale: 0.9 }}
      >
        ▼
      </motion.button>
    </div>
  )
}

function Part1OpenScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      className="flex flex-col justify-center flex-1 gap-6 relative overflow-hidden"
      initial={{ rotateZ: 0 }}
      animate={{ rotateZ: [0, -5, 5, -3, 3, 0] }}
      transition={{ duration: 2, ease: 'easeInOut' }}
    >
      {/* Background rotation effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-100 pointer-events-none"
        initial={{ rotateZ: 0 }}
        animate={{ rotateZ: 360 }}
        transition={{ duration: 3, ease: 'linear' }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-center mb-2">🔓 OBRINT LA CAIXA...</h2>

        <motion.div
          className="bg-white border-4 border-amber-900 p-8 rounded-lg text-center shadow-xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.8, repeat: 3 }}
        >
          <motion.p
            className="text-5xl mb-4"
            animate={{ rotateZ: 360 }}
            transition={{ duration: 2, ease: 'linear' }}
          >
            🗝️
          </motion.p>
          <p className="font-bold text-amber-900">Girant el cadenat...</p>
        </motion.div>

        <motion.div
          className="bg-green-100 border-2 border-green-600 p-5 rounded-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <p className="font-bold text-green-700 text-lg">✓ OBERTA!</p>
          <p className="text-sm text-green-600 mt-2">Dins la caixa trobes:</p>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="bg-white p-2 rounded">📬<br />Sobre original</div>
            <div className="bg-white p-2 rounded">📄<br />6 Cartes</div>
            <div className="bg-white p-2 rounded">📝<br />Nota Capità</div>
          </div>
        </motion.div>

        <motion.button
          onClick={onContinue}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 rounded transition"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          CONTINUAR A LA PART 2 →
        </motion.button>
      </div>
    </motion.div>
  )
}

function Part2CardsScreen({
  dates,
  stolenCards,
  selectedDate,
  selectedCard,
  onSelectCard,
  onToggleCard,
  onSelectDate,
  onSubmit,
  loading,
  error,
}: {
  dates: string[]
  stolenCards: Set<string>
  selectedDate: string | null
  selectedCard: string | null
  onSelectCard: (date: string | null) => void
  onToggleCard: (date: string) => void
  onSelectDate: (date: string | null) => void
  onSubmit: () => void
  loading: boolean
  error: string
}) {
  return (
    <div className="flex flex-col flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-2">DINS LA CAIXA</h2>

      <motion.div
        className="bg-blue-100 p-4 rounded-lg text-center mb-2 cursor-pointer hover:bg-blue-150 transition"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-3xl mb-2">📬</p>
        <p className="font-bold">SOBRE (original de Bernat)</p>
        <p className="text-sm">Data: 16-05-1705</p>
      </motion.div>

      <p className="text-center font-bold text-sm mb-2">6 CARTES SOLTES:</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {dates.map(date => (
          <motion.button
            key={date}
            onClick={() => onSelectCard(date)}
            className={`p-4 rounded border-2 transition flex flex-col items-center justify-center min-h-24 ${
              stolenCards.has(date)
                ? 'bg-green-200 border-green-600 opacity-60'
                : selectedCard === date
                  ? 'bg-blue-200 border-blue-600'
                  : 'bg-amber-50 border-amber-300 hover:bg-amber-100'
            }`}
            whileHover={!stolenCards.has(date) ? { scale: 1.05 } : {}}
            whileTap={!stolenCards.has(date) ? { scale: 0.95 } : {}}
          >
            <div className="text-3xl mb-2">📄</div>
            <div className="text-sm font-bold text-amber-900">{date}</div>
            {stolenCards.has(date) && <div className="text-xs text-green-700 mt-1">✓ Robada</div>}
          </motion.button>
        ))}
      </div>

      {stolenCards.size > 0 && (
        <motion.div
          className="bg-green-100 border border-green-600 p-4 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-center font-bold text-sm mb-3">Cartes robades: {stolenCards.size}/6</p>
          <p className="text-center font-bold text-sm mb-3">Quina substitueixes a l'sobre?</p>
          <select
            value={selectedDate || ''}
            onChange={e => onSelectDate(e.target.value || null)}
            className="w-full p-3 border-2 border-amber-900 rounded"
          >
            <option value="">Selecciona data...</option>
            {Array.from(stolenCards).map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={!selectedDate || loading}
        className={`w-full p-4 font-bold text-lg border-2 transition ${
          selectedDate && !loading
            ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
        }`}
        whileHover={selectedDate && !loading ? { scale: 1.02 } : {}}
        whileTap={selectedDate && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Validant...' : 'SUBSTITUIR'}
      </motion.button>
    </div>
  )
}

function Part3EmissariScreen({
  password,
  onPasswordChange,
  onSubmit,
  error,
  loading,
}: {
  password: string
  onPasswordChange: (val: string) => void
  onSubmit: () => void
  error: string
  loading: boolean
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">PORTA DEL CAMPANAR</h2>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4">
        <p className="text-lg mb-4">L'Emissari està aquí, amb fanal</p>
        <p className="font-bold italic">"Qui va? On aneu?"</p>
      </div>

      <motion.input
        type="text"
        placeholder='Introdueix la contrasenya...'
        value={password}
        onChange={e => onPasswordChange(e.target.value)}
        className="w-full p-4 border-2 border-amber-900 text-center font-bold rounded text-lg uppercase"
        whileFocus={{ scale: 1.02 }}
      />

      <p className="text-center text-xs text-amber-700">
        💡 Pista: "L'ALBA..."
      </p>

      {error && (
        <motion.div
          className="bg-red-100 border border-red-600 text-red-700 p-3 rounded text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={loading || !password.trim()}
        className={`w-full p-4 font-bold text-lg border-2 transition ${
          password.trim() && !loading
            ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
        }`}
        whileHover={password.trim() && !loading ? { scale: 1.02 } : {}}
        whileTap={password.trim() && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Validant...' : 'ENTREGAR CARTA'}
      </motion.button>
    </div>
  )
}

function CardDetailModal({
  date,
  details,
  isStolen,
  onRob,
  onClose,
}: {
  date: string
  details: { signature: string; seal: string; desc: string; correct: boolean }
  isStolen: boolean
  onRob: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-amber-50 border-4 border-amber-900 rounded-lg p-6 max-w-sm w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-center mb-4">CARTA</h3>

        <div className="bg-white border-2 border-amber-900 p-4 rounded mb-4">
          <p className="text-center text-sm text-amber-700 mb-2">📜</p>
          <p className="text-center font-bold mb-2">Data: {date}-1705</p>
          <p className="text-center text-sm mb-3">Signatura: {details.signature}</p>
          <p className="text-center text-sm mb-3">Segell: {details.seal}</p>
          <p className="text-center italic text-xs text-amber-600">{details.desc}</p>
        </div>

        {details.correct && (
          <div className="bg-green-100 border border-green-600 p-2 rounded mb-4">
            <p className="text-center text-xs font-bold text-green-700">✓ AQUESTA SEMBLA CORRECTA</p>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-300 text-gray-800 font-bold border-2 border-gray-400 hover:bg-gray-400 transition rounded"
            whileTap={{ scale: 0.95 }}
          >
            TANCAR
          </motion.button>

          <motion.button
            onClick={() => {
              onRob()
              onClose()
            }}
            disabled={isStolen}
            className={`flex-1 p-3 font-bold border-2 rounded transition ${
              isStolen
                ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
                : 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            }`}
            whileTap={!isStolen ? { scale: 0.95 } : {}}
          >
            {isStolen ? '✓ ROBADA' : '🏴 ROBAR'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Part3MoralScreen({
  timeRemaining,
  onChoose,
}: {
  timeRemaining: number
  onChoose: (choice: 'A' | 'B') => void
}) {
  const isTimeWarning = timeRemaining < 15

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-2">DECISIÓ MORAL</h2>

      <div className="bg-amber-100 p-4 rounded-lg text-center mb-4">
        <p className="italic mb-2 text-sm">Bernat espera la resposta...</p>
        <p className="font-bold">"Vosaltres... què hauríeu fet?"</p>
      </div>

      <div className="flex-1 space-y-3 mb-4">
        <motion.button
          onClick={() => onChoose('A')}
          className="w-full p-4 bg-blue-100 border-2 border-blue-600 hover:bg-blue-200 transition text-left rounded"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="font-bold text-blue-900">A: COMPASSIÓ</p>
          <p className="text-sm text-blue-700 mt-2">Deixa que fugis a buscar el teu fill.</p>
        </motion.button>

        <motion.button
          onClick={() => onChoose('B')}
          className="w-full p-4 bg-red-100 border-2 border-red-600 hover:bg-red-200 transition text-left rounded"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="font-bold text-red-900">B: JUSTICIA</p>
          <p className="text-sm text-red-700 mt-2">No. Bernat, estás detingut.</p>
        </motion.button>
      </div>

      <motion.div
        className={`text-center font-bold p-3 rounded ${
          isTimeWarning
            ? 'bg-red-200 text-red-800 animate-pulse'
            : 'bg-amber-100 text-amber-800'
        }`}
        animate={isTimeWarning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: isTimeWarning ? Infinity : 0, duration: 1 }}
      >
        ⏱️ TEMPS: {timeRemaining} seg
      </motion.div>
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
