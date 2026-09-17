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
      className="w-full max-w-md mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded mb-4 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer at top */}
      <div className="text-right text-xs font-mono text-[#8C6D53] mb-2 font-sans">
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
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1">
          CAIXA DE LES ALMOINES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic">
          "El cadenat protegeix secrets del Pacte dels Vigatans"
        </p>
      </header>

      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm p-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-3xl mb-2">🔒</p>
        <p className="font-bold text-[#2B2118] mb-1">La caixa està segellada</p>
        <p className="text-xs text-[#5C4533]">Necessites la contrasenya</p>
      </motion.div>

      <div className="bg-[#F0EAE3] border border-[#D8CCAE] rounded-xl p-3">
        <p className="font-bold text-xs text-[#2B2118] mb-2 text-center font-sans">4 ELEMENTS = 4 NÚMEROS:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded border border-[#8C6D53]">
            <p className="font-bold text-[#1D3557]">🔥 FOC</p>
            <p className="text-[#5C4533]">CIM (Serrat) = <span className="font-bold">4</span></p>
          </div>
          <div className="bg-white p-2 rounded border border-[#8C6D53]">
            <p className="font-bold text-[#1D3557]">💧 AIGUA</p>
            <p className="text-[#5C4533]">FONT Ferro = <span className="font-bold">2</span></p>
          </div>
          <div className="bg-white p-2 rounded border border-[#8C6D53]">
            <p className="font-bold text-[#1D3557]">🌍 TERRA</p>
            <p className="text-[#5C4533]">PLA Bones = <span className="font-bold">3</span></p>
          </div>
          <div className="bg-white p-2 rounded border border-[#8C6D53]">
            <p className="font-bold text-[#1D3557]">⛰️ PEDRA</p>
            <p className="text-[#5C4533]">Cementiri = <span className="font-bold">1</span></p>
          </div>
        </div>
      </div>

      <motion.button
        onClick={onContinue}
        className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold text-sm border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        OBRIR CADENAT →
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
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">GIRAR LES RODES</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans">Contrasenya: 4-2-3-1</p>
      </header>

      <motion.div
        className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-center text-sm mb-4 text-[#5C4533] font-sans font-bold">Selecciona els 4 números:</p>

        <div className="flex gap-4 justify-center">
          {[0, 1, 2, 3].map(index => (
            <DialWheel
              key={index}
              value={parseInt(digits[index] || '0')}
              onChange={val => handleDigitChange(index, String(val))}
            />
          ))}
        </div>
      </motion.div>

      {attempts > 0 && (
        <motion.div
          className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-lg text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-bold font-sans">❌ Intent {attempts}/3</p>
          <p className="text-xs">Revisa els 4 elements</p>
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={!isCorrect}
        className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
          isCorrect
            ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={isCorrect ? { scale: 1.02 } : {}}
        whileTap={isCorrect ? { scale: 0.98 } : {}}
      >
        🔓 OBRIR CADENAT
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
    <div className="flex flex-col items-center gap-1">
      <motion.button
        onClick={() => onChange((value + 1) % 10)}
        className="w-12 h-8 bg-[#8C6D53] text-[#EAE0CA] font-bold text-lg rounded hover:bg-[#6B5244] transition"
        whileTap={{ scale: 0.9 }}
      >
        ▲
      </motion.button>

      <motion.div
        className="w-14 h-16 bg-[#D8CCAE] border-4 border-[#8C6D53] rounded flex items-center justify-center text-3xl font-bold text-[#2B2118] shadow-lg"
        animate={{ rotateX: value * 36 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {value}
      </motion.div>

      <motion.button
        onClick={() => onChange((value - 1 + 10) % 10)}
        className="w-12 h-8 bg-[#8C6D53] text-[#EAE0CA] font-bold text-lg rounded hover:bg-[#6B5244] transition"
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
        <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
          <h2 className="text-2xl font-bold text-[#2B2118]">🔓 OBRINT...</h2>
        </header>

        <motion.div
          className="bg-[#F0EAE3] border-4 border-[#8C6D53] p-8 rounded-xl text-center shadow-lg"
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
          <p className="font-bold text-[#2B2118] text-sm font-sans">Girant el cadenat...</p>
        </motion.div>

        <motion.div
          className="bg-[#E8F8F5] border-2 border-[#16A085] p-5 rounded-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <p className="font-bold text-[#117A65] text-lg">✓ CAIXA OBERTA!</p>
          <p className="text-sm text-[#16A085] mt-2 font-sans">Dins la caixa trobes:</p>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="bg-white p-2 rounded border border-[#8C6D53]">
              <p>📬</p>
              <p className="font-bold text-[#5C4533]">Sobre</p>
            </div>
            <div className="bg-white p-2 rounded border border-[#8C6D53]">
              <p>📄</p>
              <p className="font-bold text-[#5C4533]">6 Cartes</p>
            </div>
            <div className="bg-white p-2 rounded border border-[#8C6D53]">
              <p>📝</p>
              <p className="font-bold text-[#5C4533]">Nota</p>
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={onContinue}
          className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold text-sm border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          PART 2: CANVI DE CARTA →
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
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">DINS LA CAIXA</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans">Substitució de la carta</p>
      </header>

      <motion.div
        className="bg-[#EAE0CA] border-2 border-[#8C6D53] p-4 rounded-xl text-center cursor-pointer hover:bg-[#F0EAE3] transition"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-3xl mb-2">📬</p>
        <p className="font-bold text-[#2B2118] text-sm">SOBRE ORIGINAL</p>
        <p className="text-xs text-[#5C4533] font-sans">De Bernat · 16-05-1705</p>
      </motion.div>

      <div className="mt-2">
        <p className="text-center font-bold text-sm text-[#2B2118] mb-3 font-sans">6 CARTES SOLTES:</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {dates.map(date => (
            <motion.button
              key={date}
              onClick={() => onSelectCard(date)}
              className={`p-4 rounded-lg border-2 transition flex flex-col items-center justify-center min-h-24 ${
                stolenCards.has(date)
                  ? 'bg-[#D5F4E6] border-[#16A085] opacity-60'
                  : selectedCard === date
                    ? 'bg-[#D6EAF8] border-[#1D3557]'
                    : 'bg-[#F0EAE3] border-[#D8CCAE] hover:bg-[#EAE0CA]'
              }`}
              whileHover={!stolenCards.has(date) ? { scale: 1.05 } : {}}
              whileTap={!stolenCards.has(date) ? { scale: 0.95 } : {}}
            >
              <div className="text-3xl mb-2">📄</div>
              <div className="text-sm font-bold text-[#2B2118]">{date}</div>
              {stolenCards.has(date) && <div className="text-xs text-[#16A085] mt-1 font-bold">✓ Robada</div>}
            </motion.button>
          ))}
        </div>
      </div>

      {stolenCards.size > 0 && (
        <motion.div
          className="bg-[#E8F8F5] border border-[#16A085] p-4 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-center font-bold text-sm text-[#117A65] mb-2 font-sans">Cartes robades: {stolenCards.size}/6</p>
          <p className="text-center font-bold text-xs text-[#16A085] mb-2 font-sans">Quina substitueixes?</p>
          <select
            value={selectedDate || ''}
            onChange={e => onSelectDate(e.target.value || null)}
            className="w-full p-3 border-2 border-[#8C6D53] rounded bg-white text-[#2B2118] text-sm"
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
        className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
          selectedDate && !loading
            ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={selectedDate && !loading ? { scale: 1.02 } : {}}
        whileTap={selectedDate && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Validant...' : '✓ SUBSTITUIR'}
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

      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] p-4 rounded-lg text-center mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-[#2B2118] mb-2">L'Emissari està aquí, amb fanal</p>
        <p className="font-bold italic text-[#5C4533] text-sm">"Qui va? On aneu?"</p>
      </motion.div>

      <motion.input
        type="text"
        placeholder='Introdueix la contrasenya...'
        value={password}
        onChange={e => onPasswordChange(e.target.value)}
        className="w-full p-3 border-2 border-[#8C6D53] text-center font-bold rounded-lg text-sm uppercase bg-[#F0EAE3] text-[#2B2118]"
        whileFocus={{ scale: 1.02 }}
      />

      <p className="text-center text-xs text-[#8C6D53] font-sans">
        💡 Pista: "L'ALBA..."
      </p>

      {error && (
        <motion.div
          className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-lg text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={loading || !password.trim()}
        className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
          password.trim() && !loading
            ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={password.trim() && !loading ? { scale: 1.02 } : {}}
        whileTap={password.trim() && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Validant...' : '📜 ENTREGAR CARTA'}
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
        className="bg-[#F0EAE3] border-4 border-[#8C6D53] rounded-lg p-6 max-w-sm w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-center mb-4 text-[#2B2118]">CARTA</h3>

        <div className="bg-white border-2 border-[#8C6D53] p-4 rounded-lg mb-4">
          <p className="text-center text-2xl mb-2">📜</p>
          <p className="text-center font-bold mb-2 text-[#2B2118] text-sm">Data: {date}-1705</p>
          <p className="text-center text-sm mb-2 text-[#5C4533]">Signatura: {details.signature}</p>
          <p className="text-center text-sm mb-3 text-[#5C4533]">Segell: {details.seal}</p>
          <p className="text-center italic text-xs text-[#8C6D53]">{details.desc}</p>
        </div>

        {details.correct && (
          <div className="bg-[#E8F8F5] border border-[#16A085] p-2 rounded-lg mb-4">
            <p className="text-center text-xs font-bold text-[#117A65]">✓ AQUESTA SEMBLA CORRECTA</p>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            onClick={onClose}
            className="flex-1 p-3 bg-[#D8CCAE] text-[#2B2118] font-bold border-2 border-[#8C6D53] hover:bg-[#C9BDAA] transition rounded-lg text-sm"
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
            className={`flex-1 p-3 font-bold border-2 rounded-lg text-sm transition ${
              isStolen
                ? 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
                : 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
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
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">DECISIÓ MORAL</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans">Bernat espera la resposta</p>
      </header>

      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] p-4 rounded-xl text-center mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="italic text-sm text-[#5C4533]">"Vosaltres... què hauríeu fet?"</p>
      </motion.div>

      <div className="flex-1 space-y-3 mb-4">
        <motion.button
          onClick={() => onChoose('A')}
          className="w-full p-4 bg-[#D5F4E6] border-2 border-[#16A085] hover:bg-[#C9EDE3] transition text-left rounded-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="font-bold text-[#117A65]">A: COMPASSIÓ</p>
          <p className="text-sm text-[#16A085] mt-2">Deixa que fugis a buscar el teu fill.</p>
        </motion.button>

        <motion.button
          onClick={() => onChoose('B')}
          className="w-full p-4 bg-[#FADBD8] border-2 border-[#E74C3C] hover:bg-[#F5CCC5] transition text-left rounded-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="font-bold text-[#C0392B]">B: JUSTICIA</p>
          <p className="text-sm text-[#E74C3C] mt-2">No. Bernat, estás detingut.</p>
        </motion.button>
      </div>

      <motion.div
        className={`text-center font-bold p-3 rounded-lg text-sm ${
          isTimeWarning
            ? 'bg-[#FADBD8] text-[#C0392B] animate-pulse'
            : 'bg-[#EAE0CA] text-[#8C6D53]'
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
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">🔔 CAMPANA DE L'ALBA</h2>
      </header>

      <motion.div
        className="bg-[#EAE0CA] p-6 rounded-lg text-center mb-3 border border-[#8C6D53]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.5, repeat: 3 }}
      >
        <motion.p
          className="text-5xl mb-2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          🔔
        </motion.p>
        <p className="font-bold text-[#2B2118] text-sm font-sans">DONG... DONG... DONG...</p>
      </motion.div>

      {choice === 'A' ? (
        <div className="bg-[#D5F4E6] border-2 border-[#16A085] p-4 rounded-lg">
          <p className="font-bold text-[#117A65] mb-2 text-sm font-sans">OPCIÓ A: COMPASSIÓ</p>
          <p className="text-sm text-[#16A085]">
            Bernat i Jaume es reuniren a l'estiu. No tornaren mai més a la Guixa.
          </p>
          <p className="text-sm text-[#16A085] mt-2">Però els conjurats van salvos.</p>
        </div>
      ) : (
        <div className="bg-[#FADBD8] border-2 border-[#E74C3C] p-4 rounded-lg">
          <p className="font-bold text-[#C0392B] mb-2 text-sm font-sans">OPCIÓ B: JUSTICIA</p>
          <p className="text-sm text-[#E74C3C]">
            Jaume surt de presó tardor. Busca el seu pare a l'escola. No el troba.
          </p>
          <p className="text-sm text-[#E74C3C] mt-2">Els conjurats es salvaren.</p>
        </div>
      )}

      <div className="bg-[#F0EAE3] p-4 rounded-lg text-center border border-[#8C6D53]">
        <p className="text-sm text-[#5C4533] italic font-sans">
          "Aquella nit els vau salvar. La història no els va salvar per sempre."
        </p>
      </div>

      <p className="text-center font-bold text-lg text-[#2B2118] mt-4 font-sans">
        ✓ +100 punts
      </p>
    </div>
  )
}
