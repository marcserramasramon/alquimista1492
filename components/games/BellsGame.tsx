'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants } from '@/lib/animations/useAnimations'

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
  const router = useRouter()
  const { play } = useAudio()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const teamCode = ((props.content as Record<string, unknown>)?.teamCode as string) || 'EQUIP1'
  const [letterValidated, setLetterValidated] = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

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

  // Comprovar si l'Emissari ha validat la carta (pol·ling mentre no estigui validada)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    let isMounted = true

    const checkLetterStatus = async () => {
      try {
        const res = await fetch(`/api/emissari/validate-letter?teamCode=${teamCode}`)
        if (res.ok) {
          const data = await res.json()
          if (data.isLetterValidated && isMounted) {
            setLetterValidated(true)
            return true
          }
        }
      } catch (err) {
        console.error('Error comprovant la carta a BellsGame:', err)
      }
      return false
    }

    checkLetterStatus().then(validated => {
      if (!validated && isMounted) {
        interval = setInterval(async () => {
          const isNowValidated = await checkLetterStatus()
          if (isNowValidated) {
            play('evidence-unlock')
            setState(prev => {
              if (prev.currentTab === 'porta') {
                return { ...prev, currentTab: 'decisio', moralTimer: 60 }
              }
              return prev
            })
            if (interval) clearInterval(interval)
          }
        }, 2500)
      }
    })

    return () => {
      isMounted = false
      if (interval) clearInterval(interval)
    }
  }, [teamCode, play])

  // Generar QR de la carta perquè l'Emissari la pugui escanejar
  useEffect(() => {
    if (!qrCanvasRef.current || letterValidated) return
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const qrTargetUrl = `${origin}/emissari/carta/${teamCode}`

    QRCode.toCanvas(
      qrCanvasRef.current,
      qrTargetUrl,
      {
        width: 150,
        margin: 1,
        color: {
          dark: '#2B2118',
          light: '#F4EBD9',
        },
      },
      err => {
        if (err) console.error('Error generant QR a BellsGame:', err)
      }
    )
  }, [teamCode, state.currentTab, letterValidated])

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
      const res = await fetch('/api/game/bells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moralChoice: state.moralChoice,
        }),
      })

      const result = await res.json()
      console.log('Bell sequence API response:', result)

      const seq = (result.bellSequence || result.sequence)
      if (Array.isArray(seq)) {
        setState(prev => ({ ...prev, bellSequence: seq }))
        // Play the sequence after it's stored
        setTimeout(async () => {
          await playFullSequence()
          setLoading(false)
        }, 100)
      } else {
        console.error('No sequence in API response:', result)
        setError('No es pot obtenir la seqüència de campanades')
        setLoading(false)
      }
    } catch {
      play('buzzer')
      setError('Error en obtenir la seqüència')
      setLoading(false)
    }
  }

  const playBellSound = (bellNumber: number) => {
    const bellClips = ['bell-do', 'bell-re', 'bell-mi', 'bell-fa'] as const
    const clip = bellClips[bellNumber]
    if (clip) {
      play(clip)
    }
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
      const res = await fetch('/api/game/bells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moralChoice: state.moralChoice,
          bellSequence: sequence,
        }),
      })

      const result = await res.json()

      if (result.success || result.correct) {
        play('evidence-unlock')
        const dp = result.decisionPercentage
        const stats = dp
          ? {
              optionA: dp.accept ?? dp.optionA ?? 50,
              optionB: dp.reject ?? dp.optionB ?? 50,
            }
          : null

        setState(prev => ({
          ...prev,
          currentTab: 'result',
          isCorrect: true,
          epilogue: result.epilogue || '',
          decisionStats: stats,
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
    } catch {
      play('buzzer')
      setError('Error en la validació')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
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
      <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-[#8C6D53] pb-2 mb-3 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 8 · Campanar
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2118] mt-0.5 font-serif">
          EL SOMETENT
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          &ldquo;Les campanades de l&apos;alba alertaran els conjurats&rdquo;
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md mb-4 bg-stone-950">
        <img
          src="/images/scenes/sometent.webp"
          alt="Campanar de Sant Sebastià - El Sometent"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          🔔 Campanar de Sant Sebastià · El toc de sometent a l&apos;alba
        </div>
      </div>

      {/* Tabs Menu */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          {[
            { key: 'porta', label: 'La porta', emoji: '🚪', locked: false },
            { key: 'decisio', label: 'Decisió', emoji: '⚖️', locked: !letterValidated },
            { key: 'pista', label: 'Pista sonora', emoji: '🎵', locked: !letterValidated || state.moralChoice === null },
            { key: 'senyal', label: 'La senyal', emoji: '📻', locked: !letterValidated || state.moralChoice === null },
          ].map(tab => (
            <motion.button
              key={tab.key}
              onClick={() => !tab.locked && setState(prev => ({ ...prev, currentTab: tab.key as BellsGameState['currentTab'] }))}
              disabled={tab.locked || state.currentTab === 'result'}
              className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                state.currentTab === tab.key
                  ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                  : tab.locked || state.currentTab === 'result'
                    ? 'text-[#A9A09A] opacity-60 cursor-not-allowed'
                    : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
              }`}
              whileHover={!tab.locked && state.currentTab !== 'result' ? { scale: 1.02 } : {}}
              whileTap={!tab.locked && state.currentTab !== 'result' ? { scale: 0.98 } : {}}
            >
              <span>{tab.locked ? '🔒' : tab.emoji}</span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* La Porta */}
        {state.currentTab === 'porta' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            {!letterValidated ? (
              <motion.div
                className="bg-[#FFF9F0] border-2 border-amber-700/70 rounded-xl p-4 shadow-md space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 border-b border-amber-700/30 pb-2">
                  <span className="text-2xl">⚔️</span>
                  <div>
                    <h3 className="font-bold text-[#7B1A1A] text-sm sm:text-base font-serif">
                      Pas Barrat per l&apos;Emissari al Pla de Masset
                    </h3>
                    <p className="text-[11px] text-amber-900 font-sans">
                      Control reial a la porta del campanar
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed font-serif">
                  L&apos;Emissari reial custodia el Pla de Masset i no us deixarà accedir al campanar de Sant Sebastià fins que no rebi la carta que espera.
                </p>

                <div className="bg-[#EAE0CA] p-3 rounded-lg border border-[#8C6D53] text-xs text-[#2B2118] space-y-1 font-serif">
                  <p className="font-bold font-sans text-[#1D3557] uppercase text-[11px]">
                    Instruccions per als jugadors:
                  </p>
                  <p>1. Aneu al Pla de Masset i trobeu l&apos;Emissari.</p>
                  <p>2. Dieu la contrasenya de viva veu: <strong>«L&apos;alba ve de Vic»</strong>.</p>
                  <p>3. Mostreu-li aquest codi QR de la carta segellada perquè l&apos;escanegi amb el seu dispositiu.</p>
                </div>

                {/* Codi QR de la carta */}
                <div className="bg-[#F4EBD9] border border-[#8C6D53] p-3 rounded-xl flex flex-col items-center text-center">
                  <p className="text-xs font-bold text-[#8C6D53] uppercase font-sans mb-2">
                    Codi QR de la Carta Falsa
                  </p>
                  <div className="bg-white p-2 rounded border border-[#8C6D53]/40 shadow-inner">
                    <canvas ref={qrCanvasRef} />
                  </div>
                  <p className="text-[10px] font-mono text-[#8C6D53] mt-2 font-bold">
                    Equip: {teamCode}
                  </p>
                </div>

                {/* Indicador d'espera */}
                <div className="p-3 bg-amber-100/80 border border-amber-300 rounded-lg text-center font-sans text-xs text-amber-900 font-medium flex items-center justify-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Esperant que l&apos;Emissari escanegi i validi la carta...</span>
                </div>

                {/* Botó de simulador per a proves */}
                <button
                  onClick={async () => {
                    await fetch('/api/emissari/validate-letter', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ teamCode, action: 'accept' }),
                    })
                    setLetterValidated(true)
                    play('evidence-unlock')
                    setState(prev => ({ ...prev, currentTab: 'decisio', moralTimer: 60 }))
                  }}
                  className="w-full py-2 text-[11px] text-stone-500 hover:text-stone-800 underline font-sans text-center transition"
                >
                  ⚙️ (Mode Prova / Simulador) Simular validació de la carta
                </button>
              </motion.div>
            ) : (
              <motion.div
                className="bg-[#D5F4E6] border-2 border-[#16A085] rounded-xl p-4 shadow-md space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 border-b border-[#16A085]/40 pb-2">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h3 className="font-bold text-[#117A65] text-sm sm:text-base font-serif">
                      L&apos;Emissari ha marxat enganyat!
                    </h3>
                    <p className="text-[11px] text-[#16A085] font-sans">
                      La carta falsa ha estat lliurada amb èxit
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed font-serif">
                  L&apos;Emissari ha acceptat la carta amb la contrasenya i ha emprès el camí cap a Vic a galop. El pas al campanar de Sant Sebastià és lliure.
                </p>

                <motion.button
                  onClick={() => setState(prev => ({ ...prev, currentTab: 'decisio', moralTimer: 60 }))}
                  className="w-full p-3.5 bg-[#2B2118] text-[#EAE0CA] font-bold border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  PASSAR A LA DECISIÓ MORAL →
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Decisió */}
        {state.currentTab === 'decisio' && (
          <div className="flex flex-col justify-center flex-1 gap-4">
            {/* Text B: Narrativa de la Decisió Moral */}
            <motion.div
              className="bg-[#F5EFE0] border-2 border-[#8C6D53] p-4 rounded-xl shadow-sm text-left space-y-2.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 border-b border-[#8C6D53]/30 pb-2 mb-1">
                <span className="text-xl">⚖️</span>
                <h3 className="text-xs uppercase tracking-wider text-[#8C6D53] font-sans font-bold">
                  Dilema Moral · Pla de Masset
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed font-serif">
                L&apos;Emissari fuig enganyat cap a Vic amb la carta falsa entre les mans. El pla ha funcionat!
              </p>
              <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed font-serif">
                De sobte, d&apos;entre els arbres del Pla de Masset, sorgeix la figura d&apos;en <strong>Bernat Mas</strong>, tremolós i amb llàgrimes als ulls:
              </p>
              <div className="border-l-4 border-[#8C6D53] pl-3 py-1 bg-[#EAE0CA]/60 rounded-r text-xs sm:text-sm text-[#5C4533] italic font-serif leading-relaxed">
                «Per favor... el meu fill Jaume és presoner a Vic... Només volia salvar-li la vida. Deixeu-me fugir pel bosc abans que no arribin els dragons!»
              </div>
              <p className="text-xs sm:text-sm text-[#2B2118] font-bold text-center pt-1 font-serif">
                Vosaltres... què hauríeu fet amb el mestre d&apos;escola?
              </p>
            </motion.div>

            <div className="flex items-center justify-between text-xs font-sans text-[#5C4533] px-1">
              <span>Trieu sàviament</span>
              <span className="font-mono font-bold bg-[#EAE0CA] px-2 py-0.5 rounded border border-[#8C6D53]">
                ⏱️ {state.moralTimer} seg
              </span>
            </div>

            <motion.button
              onClick={() => handleMoralChoice('A')}
              disabled={state.moralChoice !== null}
              className={`p-4 border-2 transition text-left rounded-xl ${
                state.moralChoice === 'A'
                  ? 'bg-[#D5F4E6] border-[#16A085] ring-2 ring-[#16A085]'
                  : 'bg-[#E8F8F5] border-[#16A085]/60 hover:bg-[#D5F4E6]'
              } disabled:opacity-50`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-bold text-[#117A65] font-sans text-sm">A: COMPASSIÓ</p>
              <p className="text-xs sm:text-sm text-[#16A085] mt-1 font-serif italic">
                «Fuig, Bernat, busca el teu fill i no tornis mai més a la Guixa.»
              </p>
            </motion.button>

            <motion.button
              onClick={() => handleMoralChoice('B')}
              disabled={state.moralChoice !== null}
              className={`p-4 border-2 transition text-left rounded-xl ${
                state.moralChoice === 'B'
                  ? 'bg-[#FADBD8] border-[#E74C3C] ring-2 ring-[#E74C3C]'
                  : 'bg-[#FDEDEC] border-[#E74C3C]/60 hover:bg-[#FADBD8]'
              } disabled:opacity-50`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="font-bold text-[#C0392B] font-sans text-sm">B: JUSTÍCIA</p>
              <p className="text-xs sm:text-sm text-[#C0392B] mt-1 font-serif italic">
                «No, Bernat. Has venut el poble i els conjurats. Rendeix-te al Sometent.»
              </p>
            </motion.button>

            {state.moralChoice && (
              <motion.button
                onClick={() => setState(prev => ({ ...prev, currentTab: 'pista' }))}
                className="w-full p-3.5 bg-[#2B2118] text-[#EAE0CA] font-bold border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans mt-2 shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                PUJAR AL CAMPANAR I PREPARAR EL SENYAL →
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

            {/* Imatge de desenllaç (ENDING) */}
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md bg-stone-950">
              <img
                src="/images/scenes/ending.webp"
                alt="El Desenllaç de la Conjuració"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute bottom-2 left-3 right-3 text-amber-100 text-xs font-serif italic drop-shadow">
                ⚔️ El Sometent ha sonat · El Desenllaç de la Conjuració
              </div>
            </div>

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
              <p className="text-xs text-[#8C6D53] font-sans">Compartida per tots l&apos;equip</p>
            </div>

            <motion.button
              type="button"
              onClick={() => router.push('/results')}
              className="w-full py-3.5 px-4 bg-[#1D3557] hover:bg-[#15273f] text-[#FAF5E9] font-bold border-2 border-[#C99E32] rounded-lg transition font-sans shadow-md flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer mt-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Veure Resultats de l&apos;Equip</span>
              <span>➔</span>
            </motion.button>
          </div>
        )}
        </div>
      </section>
    </motion.div>
  )
}
