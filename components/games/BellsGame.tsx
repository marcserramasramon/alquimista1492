'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  slideUpVariants,
  scaleVariants,
  pulseVariants,
  shakeVariants,
} from '@/lib/animations/useAnimations'

interface BellsGameState {
  currentScreen: 'intro' | 'moral' | 'listen' | 'play' | 'final'
  moralChoice: 'A' | 'B' | null
  moralTimer: number
  bellSequence: number[] // The sequence to play (8 bells)
  playerSequence: number[] // What the player has entered
  attempts: number
  hasListenedOnce: boolean
  finalChoice: 'A' | 'B' | null
  isReviewing: boolean
  playbackCount: number // For final screen (plays 3 times)
}

// 8-bell sequence for the Sometent (representing the calling of the conjurats)
const BELL_SEQUENCE = [1, 2, 1, 2, 3, 1, 3, 2]

/**
 * Joc 8: Sometent — Campanar (Bell Ringing Game)
 *
 * Screen flow:
 * 1. Intro - Narrative introduction
 * 2. Moral Decision - 60 sec countdown, auto-select B if timeout
 * 3. Listen - Play bell sequence once
 * 4. Play - 4 buttons to recreate sequence, infinite attempts
 * 5. Final - Plays sequence 3 times + epilogue + ranking
 */
export function BellsGame(props: GameProps) {
  const { play, stopAll } = useAudio()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timerDisplay, setTimerDisplay] = useState('12:34:56')

  const [state, setState] = useState<BellsGameState>(() => {
    const saved = props.sharedState as BellsGameState | undefined
    if (saved && 'currentScreen' in saved) {
      return saved
    }
    return {
      currentScreen: 'intro',
      moralChoice: null,
      moralTimer: 60,
      bellSequence: BELL_SEQUENCE,
      playerSequence: [],
      attempts: 0,
      hasListenedOnce: false,
      finalChoice: null,
      isReviewing: false,
      playbackCount: 0,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Moral decision timer - auto select B after 60 seconds
  useEffect(() => {
    if (state.currentScreen !== 'moral' || state.moralChoice !== null) return

    const timer = setInterval(() => {
      setState(prev => {
        const newTimer = prev.moralTimer - 1
        if (newTimer <= 0) {
          // Auto-select B (Rebutjar tracte / Justice)
          return { ...prev, moralChoice: 'B', moralTimer: 0 }
        }
        return { ...prev, moralTimer: newTimer }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state.currentScreen, state.moralChoice])

  // Play single bell sound
  const playBell = (bellNumber: number) => {
    switch (bellNumber) {
      case 1:
        play('bell-ding')
        break
      case 2:
        play('bell-ring')
        break
      case 3:
        play('bell-ding')
        break
      default:
        play('bell-ding')
    }
  }

  // Play full sequence
  const playFullSequence = async () => {
    stopAll()
    for (let i = 0; i < state.bellSequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400))
      playBell(state.bellSequence[i])
    }
  }

  // Handle bell button press in play screen
  const handleBellPress = async (bellNumber: number) => {
    playBell(bellNumber)

    const newSequence = [...state.playerSequence, bellNumber]
    setState(prev => ({ ...prev, playerSequence: newSequence }))

    // Check if player sequence matches bell sequence so far
    if (newSequence[newSequence.length - 1] !== state.bellSequence[newSequence.length - 1]) {
      // Wrong bell
      play('buzzer')
      setError('Campana incorrecta. Intenta de nou.')
      setState(prev => ({
        ...prev,
        playerSequence: [],
        attempts: prev.attempts + 1,
      }))
      return
    }

    // Check if complete sequence matches
    if (newSequence.length === state.bellSequence.length) {
      // Correct!
      play('evidence-unlock')
      setState(prev => ({
        ...prev,
        currentScreen: 'final',
        playbackCount: 0,
      }))
    }
  }

  // Handle moral choice
  const handleMoralChoice = async (choice: 'A' | 'B') => {
    setState(prev => ({ ...prev, moralChoice: choice }))

    // Move to listen screen after moral choice
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentScreen: 'listen',
        playerSequence: [],
        attempts: 0,
      }))
      playFullSequence()
    }, 500)
  }

  // Handle listen to sequence again
  const handleListenAgain = async () => {
    await playFullSequence()
  }

  // Handle submission
  const handleSubmitFinal = async () => {
    if (!state.moralChoice) {
      setError('Escollixi una opció moral.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await props.submit({
        moralChoice: state.moralChoice,
        attempts: state.attempts,
        bellsCorrect: true,
      })

      if (!result.correct) {
        play('buzzer')
        setError(result.message || 'Error en la validació')
      } else {
        play('evidence-unlock')
      }
    } catch (err) {
      play('buzzer')
      setError('Error en la validació')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto pb-12 flex flex-col font-serif text-[#2B2118] min-h-screen"
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
        {timerDisplay}
      </div>

      {/* Intro Screen */}
      {state.currentScreen === 'intro' && (
        <BellsIntroScreen
          onContinue={() => setState(prev => ({ ...prev, currentScreen: 'moral', moralTimer: 60 }))}
        />
      )}

      {/* Moral Decision Screen */}
      {state.currentScreen === 'moral' && (
        <MoralDecisionScreen
          moralTimer={state.moralTimer}
          onChoiceA={() => handleMoralChoice('A')}
          onChoiceB={() => handleMoralChoice('B')}
        />
      )}

      {/* Listen Screen */}
      {state.currentScreen === 'listen' && (
        <SometentListenScreen
          hasListened={state.hasListenedOnce}
          onContinue={() => {
            setState(prev => ({
              ...prev,
              currentScreen: 'play',
              hasListenedOnce: true,
            }))
          }}
          onListenAgain={handleListenAgain}
        />
      )}

      {/* Play Screen */}
      {state.currentScreen === 'play' && (
        <SometentPlayScreen
          playerSequence={state.playerSequence}
          attempts={state.attempts}
          bellSequence={state.bellSequence}
          onBellPress={handleBellPress}
          onListenAgain={handleListenAgain}
          loading={loading}
        />
      )}

      {/* Final Screen */}
      {state.currentScreen === 'final' && (
        <FinalResultScreen
          moralChoice={state.moralChoice}
          onSubmit={handleSubmitFinal}
          loading={loading}
        />
      )}
    </motion.div>
  )
}

function BellsIntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 8 · Campanar
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          LA CAMPANA DE L'ALBA
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "Els Conjurats senten el senyal dels dòmus"
        </p>
      </header>

      {/* Narrative */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-[#2B2118] leading-relaxed">
          La Porta del Campanar. L'Emissari us espera en la foscor, amb la carta segellada.
        </p>
        <p className="text-sm text-[#2B2118] leading-relaxed mt-2">
          <span className="font-bold">Bernat</span> us ofereix un tracte: saber el camí segur pels dragons a canvi de deixar-lo anar buscar el seu fill.
        </p>
        <p className="text-sm text-[#2B2118] leading-relaxed mt-2 italic">
          "Vosaltres... quin fate en doni al traïdor?"
        </p>
      </motion.div>

      {/* Bell animation */}
      <motion.div
        className="flex justify-center"
        animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-6xl drop-shadow-md select-none">🔔</span>
      </motion.div>

      {/* Hint */}
      <motion.div
        className="bg-[#F0EAE3] border border-[#D8CCAE] rounded-xl p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-bold text-xs text-[#2B2118] mb-2 text-center font-sans">
          ⏱️ TEMPS PER DECIDIR: 60 SEGONS
        </p>
        <p className="text-xs text-[#5C4533] text-center">
          Vosaltres decidireu si acceptar o rebutjar el tracte de Bernat.
        </p>
      </motion.div>

      <motion.button
        onClick={onContinue}
        className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold text-sm border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        ARRIBAR A LA PORTA →
      </motion.button>
    </div>
  )
}

function MoralDecisionScreen({
  moralTimer,
  onChoiceA,
  onChoiceB,
}: {
  moralTimer: number
  onChoiceA: () => void
  onChoiceB: () => void
}) {
  const isTimeRunning = moralTimer > 0

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">LA DECISIÓ MORAL</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans italic">
          Bernat ofereix un tracte desesperadament
        </p>
      </header>

      {/* Bernat's offer */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-[#2B2118] leading-relaxed italic font-serif">
          "Sé per on vénen els dragoons. Els puc portar pel camí fals, far que arribin tard. Us deixaré anar als conjurats, tots salvos.
        </p>
        <p className="text-sm text-[#2B2118] leading-relaxed mt-2 italic font-serif">
          Però... deixeu que fugui a buscar el meu fill.
        </p>
        <p className="text-sm text-[#2B2118] leading-relaxed mt-2 font-bold text-center">
          Accepteu el tracte?"
        </p>
      </motion.div>

      {/* Timer */}
      <motion.div
        className={`text-center p-3 rounded-lg border-2 font-sans font-bold ${
          moralTimer > 20
            ? 'bg-[#F0EAE3] border-[#8C6D53] text-[#2B2118]'
            : moralTimer > 10
            ? 'bg-[#FFF3CD] border-[#E6A000] text-[#856404]'
            : 'bg-[#FADBD8] border-[#E74C3C] text-[#C0392B]'
        }`}
        animate={moralTimer <= 10 ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <p className="text-xs mb-1">⏱️ TEMPS PER DECIDIR:</p>
        <p className="text-2xl font-mono">{moralTimer}s</p>
      </motion.div>

      {/* Option A */}
      <motion.button
        onClick={onChoiceA}
        className="w-full p-4 bg-[#D5F4E6] border-2 border-[#16A085] text-[#117A65] font-bold rounded-lg hover:bg-[#C0EFE0] transition"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-sm font-bold mb-1">OPCIÓ A — COMPASSIÓ</p>
        <p className="text-xs leading-tight">
          "Acceptem. Deixem que Bernat fugi a buscar el seu fill."
        </p>
      </motion.button>

      {/* Option B */}
      <motion.button
        onClick={onChoiceB}
        className="w-full p-4 bg-[#E8D5E8] border-2 border-[#7B1A7B] text-[#5C1A5C] font-bold rounded-lg hover:bg-[#D9C0D9] transition"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <p className="text-sm font-bold mb-1">OPCIÓ B — JUSTÍCIA</p>
        <p className="text-xs leading-tight">
          "No. Bernat está detingut. Toquem el sometent sense tenir certesa."
        </p>
      </motion.button>

      {/* Auto-select hint */}
      {moralTimer <= 5 && (
        <motion.div
          className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-lg text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Si no escolliu, l'opció B serà seleccionada automàticament...
        </motion.div>
      )}
    </div>
  )
}

function SometentListenScreen({
  hasListened,
  onContinue,
  onListenAgain,
}: {
  hasListened: boolean
  onContinue: () => void
  onListenAgain: () => void
}) {
  useEffect(() => {
    // Automatically play the sequence when component mounts
    const timer = setTimeout(() => {
      onListenAgain()
    }, 500)
    return () => clearTimeout(timer)
  }, [onListenAgain])

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">ESCOLTI LA CAMPANA</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans italic">
          La seqüència de la campana que heu de recordar
        </p>
      </header>

      {/* Bell visual */}
      <motion.div
        className="flex justify-center"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-6xl select-none">🔔</span>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm p-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-[#2B2118] leading-relaxed">
          Els conjurats de Sant Sebastià escolten la campana a la foscor.
        </p>
        <p className="text-sm text-[#2B2118] leading-relaxed mt-2">
          <span className="font-bold">Escolteu la seqüència</span> — Heu de recordar-la per tocar el campanar.
        </p>
      </motion.div>

      {/* Status */}
      {!hasListened && (
        <motion.div
          className="bg-[#E8F8F5] border border-[#16A085] text-[#117A65] p-3 rounded-lg text-center font-sans text-sm font-bold"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔊 Reproduint la seqüència...
        </motion.div>
      )}

      {hasListened && (
        <motion.div
          className="bg-[#E8F8F5] border border-[#16A085] text-[#117A65] p-3 rounded-lg text-center font-sans text-sm font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ Seqüència completada
        </motion.div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={onListenAgain}
          disabled={!hasListened}
          className="flex-1 p-3 bg-[#D8CCAE] text-[#2B2118] font-bold border-2 border-[#8C6D53] rounded-lg hover:bg-[#C9BDAA] transition font-sans text-sm disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          🔊 ESCOLTAR ALTRA VEZ
        </motion.button>
        <motion.button
          onClick={onContinue}
          disabled={!hasListened}
          className={`flex-1 p-3 font-bold border-2 rounded-lg transition font-sans text-sm ${
            hasListened
              ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
              : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
          }`}
          whileTap={hasListened ? { scale: 0.95 } : {}}
        >
          CONTINUAR →
        </motion.button>
      </div>
    </div>
  )
}

function SometentPlayScreen({
  playerSequence,
  attempts,
  bellSequence,
  onBellPress,
  onListenAgain,
  loading,
}: {
  playerSequence: number[]
  attempts: number
  bellSequence: number[]
  onBellPress: (bellNumber: number) => void
  onListenAgain: () => void
  loading: boolean
}) {
  const progress = (playerSequence.length / bellSequence.length) * 100

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">TOQUEU EL CAMPANAR</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans italic">
          Reproduïu la seqüència que acabeu d'escoltar
        </p>
      </header>

      {/* Progress bar */}
      <motion.div className="w-full h-2 bg-[#D8CCAE] rounded-full overflow-hidden border border-[#8C6D53]">
        <motion.div
          className="h-full bg-[#16A085]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Status */}
      <motion.div className="text-center bg-[#EAE0CA] border border-[#8C6D53] rounded-lg p-3">
        <p className="text-sm font-bold text-[#2B2118] font-sans">
          {playerSequence.length} / {bellSequence.length}
        </p>
        <p className="text-xs text-[#5C4533] font-sans">
          Clica les campanades en el mateix ordre
        </p>
      </motion.div>

      {/* Bell buttons (2x2 grid) */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(bellNumber => (
          <motion.button
            key={bellNumber}
            onClick={() => onBellPress(bellNumber)}
            disabled={loading}
            className="aspect-square flex flex-col items-center justify-center p-4 bg-[#D8CCAE] text-[#2B2118] font-bold border-3 border-[#8C6D53] rounded-lg hover:bg-[#C9BDAA] transition text-xl disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
          >
            <span className="text-2xl mb-1">🔔</span>
            <span className="text-xs font-sans">Campana {bellNumber}</span>
          </motion.button>
        ))}
      </div>

      {/* Attempts counter */}
      {attempts > 0 && (
        <motion.div
          className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-lg text-center text-sm font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-bold">❌ Intent {attempts}</p>
          <p className="text-xs">Seqüència incorrect. Intenta de nou.</p>
        </motion.div>
      )}

      {/* Listen again button */}
      <motion.button
        onClick={onListenAgain}
        disabled={loading}
        className="w-full p-3 bg-[#F5EFE0] text-[#2B2118] font-bold border-2 border-[#8C6D53] rounded-lg hover:bg-[#EAE0CA] transition font-sans text-sm disabled:opacity-50"
        whileTap={{ scale: 0.95 }}
      >
        🔊 ESCOLTAR LA SEQÜÈNCIA ALTRE VEZ
      </motion.button>
    </div>
  )
}

function FinalResultScreen({
  moralChoice,
  onSubmit,
  loading,
}: {
  moralChoice: 'A' | 'B' | null
  onSubmit: () => void
  loading: boolean
}) {
  const isCompassion = moralChoice === 'A'

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">✅ CAMPANADA CORRECTA</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans italic">
          Els conjurats escolten el senyal
        </p>
      </header>

      {/* Success animation */}
      <motion.div
        className="flex justify-center"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-6xl select-none">🔔</span>
      </motion.div>

      {/* Narrative */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-[#2B2118] leading-relaxed font-serif mb-3">
          Les campanades sonen a la nit. Els conjurats de Sant Sebastià escolten el senyal.
        </p>

        {isCompassion ? (
          <>
            <p className="text-sm text-[#2B2118] leading-relaxed font-serif italic mb-2">
              <span className="font-bold">Opció A (Compassió):</span> Deixeu que Bernat fugui.
            </p>
            <p className="text-sm text-[#5C4533] leading-relaxed">
              Els dragoons arriben tard. Els conjurats fugen pel camí segur que Bernat els indica. Es reuneixen a l'estiu. Però no tornen mai més a la Guixa.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[#2B2118] leading-relaxed font-serif italic mb-2">
              <span className="font-bold">Opció B (Justícia):</span> Bernat queda detingut.
            </p>
            <p className="text-sm text-[#5C4533] leading-relaxed">
              Els dragoons arriben ràpid, però els conjurats se'n surten pels pèls. Jaume surt de presó. Busca el seu pare a l'escola. No el troba.
            </p>
          </>
        )}
      </motion.div>

      {/* Decision badge */}
      <motion.div
        className={`p-4 rounded-lg border-2 text-center ${
          isCompassion
            ? 'bg-[#D5F4E6] border-[#16A085]'
            : 'bg-[#E8D5E8] border-[#7B1A7B]'
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className={`text-xs font-sans font-bold uppercase ${
          isCompassion ? 'text-[#117A65]' : 'text-[#5C1A5C]'
        }`}>
          {isCompassion ? '❤️ Compassió' : '⚖️ Justícia'}
        </p>
        <p className={`text-sm font-serif mt-1 ${
          isCompassion ? 'text-[#117A65]' : 'text-[#5C1A5C]'
        }`}>
          {isCompassion
            ? '"Aquella nit els vau salvar."'
            : '"La història no els va salvar per sempre."'
          }
        </p>
      </motion.div>

      {/* Points */}
      <motion.div
        className="bg-[#F9F7F3] border border-[#D8CCAE] p-4 rounded-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-2xl mb-2 font-bold">🔔 + 150 PUNTS</p>
        <p className="text-xs text-[#8C6D53] font-sans">Compartida per tots l'equip</p>
      </motion.div>

      {/* Submit button */}
      <motion.button
        onClick={onSubmit}
        disabled={loading || !moralChoice}
        className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
          !loading && moralChoice
            ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={!loading && moralChoice ? { scale: 1.02 } : {}}
        whileTap={!loading && moralChoice ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Finalitzant...' : '✓ FINALITZAR PARTIDA'}
      </motion.button>
    </div>
  )
}
