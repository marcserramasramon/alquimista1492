'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  scaleVariants,
} from '@/lib/animations/useAnimations'

interface BellsGameState {
  currentTab: 'porta' | 'decisio' | 'pista' | 'senyal' | 'result'
  moralChoice: 'A' | 'B' | null
  moralTimer: number
  playerSequence: number[]
  attempts: number
  isCorrect: boolean
  epilogue: string
  decisionStats: { optionA: number; optionB: number } | null
  bellSequence: number[]
}

/**
 * Joc 8: Sometent — Campanares
 *
 * Estructura de tabs (com BoxGame):
 * 1. La porta — Intro narrativa
 * 2. Decisió — Escollit A/B (60 seg timer, auto-select B)
 * 3. Pista sonora — Escoltar seqüència (UNA vegada)
 * 4. La senyal — Tocar 4 campanades (infinits intents)
 * 5. Result — Epíleg + ranking
 */
export function BellsGame(props: GameProps) {
  const { play } = useAudio()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [state, setState] = useState<BellsGameState>(() => {
    const saved = props.sharedState as BellsGameState | undefined
    if (saved && 'currentTab' in saved) {
      return saved
    }
    return {
      currentTab: 'porta',
      moralChoice: null,
      moralTimer: 60,
      playerSequence: [],
      attempts: 0,
      isCorrect: false,
      epilogue: '',
      decisionStats: null,
      bellSequence: [],
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Moral timer
  useEffect(() => {
    if (state.currentTab !== 'decisio' || state.moralChoice !== null) return

    const timer = setInterval(() => {
      setState(prev => {
        const newTimer = prev.moralTimer - 1
        if (newTimer <= 0) {
          return { ...prev, moralChoice: 'B', moralTimer: 0 }
        }
        return { ...prev, moralTimer: newTimer }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [state.currentTab, state.moralChoice])

  const handleMoralChoice = async (choice: 'A' | 'B') => {
    setState(prev => ({ ...prev, moralChoice: choice }))
    play('bell-ding')
    setTimeout(() => {
      setState(prev => ({ ...prev, currentTab: 'pista' }))
    }, 300)
  }

  const fetchBellSequence = async () => {
    if (state.bellSequence.length > 0) {
      // Already fetched, just play it
      setLoading(true)
      await playFullSequence()
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await props.submit({
        moralChoice: state.moralChoice,
      })

      console.log('Bell sequence API response:', result)

      if ((result.bellSequence || result.sequence) && Array.isArray(result.bellSequence || result.sequence)) {
        setState(prev => ({ ...prev, bellSequence: result.bellSequence || result.sequence }))
        // Play the sequence after it's stored
        // Use setTimeout to ensure state is updated before playing
        setTimeout(async () => {
          await playFullSequence()
          setLoading(false)
        }, 100)
      } else {
        console.error('No sequence in API response:', { bellSequence: result.bellSequence, sequence: result.sequence, isArray: Array.isArray(result.bellSequence || result.sequence) })
        setError('No es pot obtenir la seqüència de campanades')
        setLoading(false)
      }
    } catch (err) {
      play('buzzer')
      setError('Error en obtenir la seqüència')
      setLoading(false)
    }
  }

  const handlePlayPista = async () => {
    setState(prev => ({ ...prev, currentTab: 'senyal' }))
  }

  const playBellSound = (bellNumber: number) => {
    const bellNames = ['do', 're', 'mi', 'fa']
    play(`bell-${bellNames[bellNumber]}`)
  }

  const handleBellPress = (bellNumber: number) => {
    if (state.bellSequence.length === 0) {
      setError('Cal escoltar la pista sonora primer')
      return
    }

    playBellSound(bellNumber)
    const newSequence = [...state.playerSequence, bellNumber]
    setState(prev => ({ ...prev, playerSequence: newSequence }))

    // Local validation: compare first 4 bells
    if (newSequence.length === 4) {
      // Check if the 4 bells match the first 4 of the bell sequence
      const matches = newSequence.every((bell, idx) => bell === state.bellSequence[idx])

      if (matches) {
        // Validation passed, submit to server
        handleSubmitBells(newSequence)
      } else {
        // Validation failed
        play('buzzer')
        setError('Campanades incorrectes. Reprova.')
        setState(prev => ({
          ...prev,
          playerSequence: [],
          attempts: prev.attempts + 1,
        }))
      }
    }
  }

  const playFullSequence = async () => {
    if (!state.bellSequence || state.bellSequence.length === 0) return

    for (const bellNum of state.bellSequence) {
      playBellSound(bellNum)
      await new Promise(resolve => setTimeout(resolve, 1200))
    }
  }

  const handleSubmitBells = async (sequence: number[]) => {
    setLoading(true)
    setError('')

    try {
      const result = await props.submit({
        moralChoice: state.moralChoice,
        bellSequence: sequence,
        attempts: state.attempts,
      })

      if (result.correct) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          currentTab: 'result',
          isCorrect: true,
          epilogue: result.epilogue || '',
          decisionStats: result.decisionPercentage || null,
        }))
      } else {
        play('buzzer')
        setError('Campanades incorrectes. Reprova.')
        setState(prev => ({
          ...prev,
          playerSequence: [],
          attempts: prev.attempts + 1,
        }))
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

      {/* Header */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 8 · Campanar
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          EL SOMETENT
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "Les campanades de l'alba alertaran els conjurats"
        </p>
      </header>

      {/* Tabs Menu */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          {[
            { key: 'porta', label: 'La porta', emoji: '🚪' },
            { key: 'decisio', label: 'Decisió', emoji: '🤔' },
            { key: 'pista', label: 'Pista sonora', emoji: '🎵' },
            { key: 'senyal', label: 'La senyal', emoji: '📻' },
          ].map(tab => (
            <motion.button
              key={tab.key}
              onClick={() => setState(prev => ({ ...prev, currentTab: tab.key as any }))}
              disabled={state.currentTab === 'result'}
              className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                state.currentTab === tab.key
                  ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                  : state.currentTab === 'result'
                    ? 'text-[#A9A09A] cursor-not-allowed'
                    : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
              }`}
              whileHover={state.currentTab !== 'result' ? { scale: 1.02 } : {}}
              whileTap={state.currentTab !== 'result' ? { scale: 0.98 } : {}}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* La Porta */}
        {state.currentTab === 'porta' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            <motion.div
              className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
                <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif mb-1">
                    El Sometent
                  </h3>             
			 <p className="text-sm text-[#2B2118] leading-relaxed">
                Les campanades del campanar són l'últim senyal. Els conjurats de Sant Sebastià esperen aquest soroll per fugir pel camí segur.
              </p>
              <p className="text-sm text-[#5C4533] mt-3 italic">
                &quot;La carta és a l'Emissari. Ahora, una decisió final: compassió o justícia?&quot;
              </p>
            </motion.div>
            <motion.button
              onClick={() => setState(prev => ({ ...prev, currentTab: 'decisio', moralTimer: 60 }))}
              className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              CONTINUAR →
            </motion.button>
          </div>
        )}

        {/* Decisió */}
        {state.currentTab === 'decisio' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2B2118] mb-2">VOSALTRES... QUÈ HAURÍEU FET?</p>
              <p className="text-sm text-[#5C4533] mb-4">Bernat ofereix el camí segur. Temps: {state.moralTimer} seg</p>
            </div>

            <motion.button
              onClick={() => handleMoralChoice('A')}
              disabled={state.moralChoice !== null}
              className="p-4 bg-[#D5F4E6] border-2 border-[#16A085] hover:bg-[#C9EDE3] transition text-left rounded-lg disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-bold text-[#117A65]">A: COMPASSIÓ</p>
              <p className="text-sm text-[#16A085] mt-1">Deixa que fugis a buscar el teu fill.</p>
            </motion.button>

            <motion.button
              onClick={() => handleMoralChoice('B')}
              disabled={state.moralChoice !== null}
              className="p-4 bg-[#FADBD8] border-2 border-[#E74C3C] hover:bg-[#F5CCC5] transition text-left rounded-lg disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-bold text-[#C0392B]">B: JUSTÍCIA</p>
              <p className="text-sm text-[#E74C3C] mt-1">No. Bernat, estàs detingut.</p>
            </motion.button>

            {state.moralChoice && (
              <motion.button
                onClick={() => setState(prev => ({ ...prev, currentTab: 'pista' }))}
                className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                SEGUIR →
              </motion.button>
            )}
          </div>
        )}

        {/* Pista Sonora */}
        {state.currentTab === 'pista' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            <div className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl p-6 text-center">
              <p className="text-sm text-[#5C4533] mb-4">Escolta la seqüència de campanades...</p>
              <motion.button
                onClick={fetchBellSequence}
                disabled={loading}
                className="mx-auto block text-6xl mb-4 hover:scale-110 transition disabled:opacity-50"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                🔔
              </motion.button>
              <p className="text-xs text-[#8C6D53] mb-4">{loading ? 'Carregant...' : 'Presiona per sentir les campanades'}</p>
            </div>
            <motion.button
              onClick={() => setState(prev => ({ ...prev, currentTab: 'senyal' }))}
              className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              TOCAR LES CAMPANADES →
            </motion.button>
          </div>
        )}

        {/* La Senyal */}
        {state.currentTab === 'senyal' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-[#2B2118] mb-2">TOCA LES 4 CAMPANADES</p>
              <p className="text-sm text-[#5C4533] mb-4">Sequència ({state.playerSequence.length}/4)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { num: 0, name: 'Do', color: '#4A4A4A', size: '120px' },
                { num: 1, name: 'Re', color: '#5C5C5C', size: '100px' },
                { num: 2, name: 'Mi', color: '#6E6E6E', size: '80px' },
                { num: 3, name: 'Fa', color: '#7F7F7F', size: '60px' },
              ].map(bell => (
                <motion.button
                  key={bell.num}
                  onClick={() => handleBellPress(bell.num)}
                  disabled={loading}
                  className="rounded-lg font-bold text-white transition disabled:opacity-50"
                  style={{ backgroundColor: bell.color, height: bell.size }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm">{bell.name}</span>
                </motion.button>
              ))}
            </div>

            <div className="bg-[#F0EAE3] border border-[#8C6D53] rounded-lg p-3 text-center">
              <p className="text-xs text-[#5C4533] mb-2">Partitura:</p>
              <div className="flex items-end justify-center gap-1 h-20">
                {state.playerSequence.map((bell, i) => {
                  const heights = ['h-4', 'h-8', 'h-12', 'h-16']
                  return (
                    <div
                      key={i}
                      className={`w-4 ${heights[bell]} rounded-sm transition-all`}
                      style={{
                        backgroundColor: ['#4A4A4A', '#5C5C5C', '#6E6E6E', '#7F7F7F'][bell],
                      }}
                    />
                  )
                })}
              </div>
            </div>

            {loading && (
              <div className="text-center text-sm text-[#5C4533]">Validant...</div>
            )}
          </div>
        )}

        {/* Result */}
        {state.currentTab === 'result' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            {/* Header */}
            <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
              <h2 className="text-2xl font-bold text-[#2B2118]">✅ ESTACIÓ SUPERADA</h2>
              <p className="text-xs text-[#5C4533] mt-1 font-sans">Campanades correctes</p>
            </header>

            {/* Campanada animada */}
            <motion.div
              className="bg-[#D5F4E6] border-2 border-[#16A085] p-6 rounded-sm shadow-lg text-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.p
                className="text-6xl mb-3"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🔔
              </motion.p>
              <p className="font-bold text-[#117A65] text-sm">SOMETENT SONAT</p>
              <p className="text-xs text-[#16A085] mt-2">La seqüència de campanades ha estat correcta</p>
            </motion.div>

            {/* Epíleg de la história */}
            <motion.div
              className="bg-[#F5EFE0] border-2 border-[#8C6D53] p-4 rounded-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-xs text-[#2B2118] leading-relaxed space-y-2">
                <p className="font-bold text-[#8C6D53] mb-2">EPÍLEG:</p>
                <p>{state.epilogue}</p>
              </div>
            </motion.div>

            {/* Estadístiques del grup */}
            {state.decisionStats && (
              <motion.div
                className="bg-[#EAE0CA] border border-[#8C6D53] p-4 rounded-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs uppercase tracking-widest text-[#8C6D53] font-bold mb-3 text-center">
                  Decisió del Grup
                </p>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#5C4533]">Compassió (A)</span>
                      <span className="text-xs font-bold text-[#16A085]">{state.decisionStats.optionA}%</span>
                    </div>
                    <div className="bg-[#D5F4E6] rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-[#16A085] h-4 rounded-full transition-all"
                        style={{ width: `${state.decisionStats.optionA}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#5C4533]">Justícia (B)</span>
                      <span className="text-xs font-bold text-[#E74C3C]">{state.decisionStats.optionB}%</span>
                    </div>
                    <div className="bg-[#FADBD8] rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-[#E74C3C] h-4 rounded-full transition-all"
                        style={{ width: `${state.decisionStats.optionB}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Punts finals */}
            <div className="bg-[#F9F7F3] border border-[#D8CCAE] p-4 rounded-sm text-center">
              <p className="text-2xl mb-2">⏱️ + 100 PUNTS</p>
              <p className="text-xs text-[#8C6D53] font-sans">Compartida per tots l'equip</p>
            </div>
          </div>
        )}
        </div>
      </section>
    </motion.div>
  )
}
