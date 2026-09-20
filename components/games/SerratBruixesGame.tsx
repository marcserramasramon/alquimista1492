'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, shakeVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeDocTab: 'historia' | 'sospitosos' | 'taula' | 'senyals'
  answer: string
  attempts: number
  solved: boolean
  currentSignalIndex: number
  isPlayingSequence: boolean
  sequenceStarted: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

// Seqüències de fogueres per variant (docs/joc-1-serrat-bruixes.md § Solucions per Variant).
// Fila (Esquerra) - Columna (Dreta) al quadrat de Polibi.
const FIRE_SIGNALS_BY_VARIANT: Record<string, { id: number; left: number; right: number; letter: string; word: number }[]> = {
  // "SAP DE LLETRA"
  A: [
    { id: 1, left: 4, right: 3, letter: 'S', word: 1 },
    { id: 2, left: 1, right: 1, letter: 'A', word: 1 },
    { id: 3, left: 3, right: 5, letter: 'P', word: 1 },
    { id: 4, left: 1, right: 4, letter: 'D', word: 2 },
    { id: 5, left: 1, right: 5, letter: 'E', word: 2 },
    { id: 6, left: 3, right: 1, letter: 'L', word: 3 },
    { id: 7, left: 3, right: 1, letter: 'L', word: 3 },
    { id: 8, left: 1, right: 5, letter: 'E', word: 3 },
    { id: 9, left: 4, right: 4, letter: 'T', word: 3 },
    { id: 10, left: 4, right: 2, letter: 'R', word: 3 },
    { id: 11, left: 1, right: 1, letter: 'A', word: 3 },
  ],
  // "ESCRIU": 1-5 · 4-3 · 1-3 · 4-2 · 2-4 · 4-5
  B: [
    { id: 1, left: 1, right: 5, letter: 'E', word: 1 },
    { id: 2, left: 4, right: 3, letter: 'S', word: 1 },
    { id: 3, left: 1, right: 3, letter: 'C', word: 1 },
    { id: 4, left: 4, right: 2, letter: 'R', word: 1 },
    { id: 5, left: 2, right: 4, letter: 'I', word: 1 },
    { id: 6, left: 4, right: 5, letter: 'U', word: 1 },
  ],
  // "LLEGEIX": 3-1 · 3-1 · 1-5 · 2-2 · 1-5 · 2-4 · 5-2
  C: [
    { id: 1, left: 3, right: 1, letter: 'L', word: 1 },
    { id: 2, left: 3, right: 1, letter: 'L', word: 1 },
    { id: 3, left: 1, right: 5, letter: 'E', word: 1 },
    { id: 4, left: 2, right: 2, letter: 'G', word: 1 },
    { id: 5, left: 1, right: 5, letter: 'E', word: 1 },
    { id: 6, left: 2, right: 4, letter: 'I', word: 1 },
    { id: 7, left: 5, right: 2, letter: 'X', word: 1 },
  ],
}

const ANSWER_BY_VARIANT: Record<string, string> = {
  A: 'SAP DE LLETRA',
  B: 'ESCRIU',
  C: 'LLEGEIX',
}

// Estels del cel nocturn (posicions fixes per evitar diferències entre servidor i client)
const NIGHT_STARS = [
  { x: 6, y: 12, size: 2, o: 0.9 },
  { x: 14, y: 28, size: 1.5, o: 0.6 },
  { x: 22, y: 8, size: 2, o: 0.8 },
  { x: 30, y: 20, size: 1.5, o: 0.5 },
  { x: 38, y: 10, size: 2.5, o: 0.9 },
  { x: 46, y: 24, size: 1.5, o: 0.6 },
  { x: 53, y: 6, size: 2, o: 0.7 },
  { x: 60, y: 16, size: 1.5, o: 0.5 },
  { x: 67, y: 28, size: 2, o: 0.8 },
  { x: 74, y: 10, size: 1.5, o: 0.6 },
  { x: 10, y: 40, size: 1.5, o: 0.4 },
  { x: 25, y: 36, size: 1.5, o: 0.5 },
  { x: 42, y: 38, size: 1.5, o: 0.4 },
  { x: 56, y: 34, size: 1.5, o: 0.5 },
  { x: 88, y: 14, size: 2, o: 0.7 },
  { x: 94, y: 26, size: 1.5, o: 0.5 },
  { x: 3, y: 22, size: 1.5, o: 0.5 },
  { x: 80, y: 30, size: 1.5, o: 0.4 },
]

// Distribueix les flames al llarg de la corba el·líptica del turó (tangents al pendent, no en línia recta)
const FLAME_SPREAD = 0.5
function getFlameOffsets(count: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [0]
  return Array.from(
    { length: count },
    (_, i) => -FLAME_SPREAD + (2 * FLAME_SPREAD) * (i / (count - 1))
  )
}
function flamePosition(t: number): { left: string; top: string } {
  const topPct = 100 * (1 - Math.sqrt(1 - t * t))
  const leftPct = 50 + t * 50
  return { left: `${leftPct}%`, top: `${topPct}%` }
}

// Taula de Polibi 5x5
const POLIBIUS_GRID = [
  { row: 1, letters: ['A', 'B', 'C', 'D', 'E'] },
  { row: 2, letters: ['F', 'G', 'H', 'I', 'J'] },
  { row: 3, letters: ['L', 'M', 'N', 'O', 'P'] },
  { row: 4, letters: ['Q', 'R', 'S', 'T', 'U'] },
  { row: 5, letters: ['V', 'X', 'Z', 'Ç', '·'] },
]

export function SerratBruixesGame(props: GameProps) {
  const { play, stop } = useAudio()
  const variant = (props.content?.variant as string) || 'A'
  const FIRE_SIGNALS = FIRE_SIGNALS_BY_VARIANT[variant] || FIRE_SIGNALS_BY_VARIANT.A
  const expectedAnswer = ANSWER_BY_VARIANT[variant] || ANSWER_BY_VARIANT.A
  const [state, setState] = useState<GameState>(() => {
    const saved =
      props.sharedState && typeof props.sharedState === 'object'
        ? (props.sharedState as Partial<GameState>)
        : {}
    const initialIndex =
      typeof saved.currentSignalIndex === 'number' &&
      saved.currentSignalIndex >= 0 &&
      saved.currentSignalIndex < FIRE_SIGNALS.length
        ? saved.currentSignalIndex
        : 0

    return {
      activeDocTab: saved.activeDocTab || 'historia',
      answer: saved.answer || '',
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      currentSignalIndex: initialIndex,
      isPlayingSequence: false,
      sequenceStarted: saved.sequenceStarted || false,
      lastFeedback: null,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Reproductor automàtic de la seqüència de fogueres
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (state.isPlayingSequence) {
      timer = setTimeout(() => {
        setState(prev => {
          const nextIdx = (prev.currentSignalIndex ?? 0) + 1
          if (nextIdx >= FIRE_SIGNALS.length) {
            return { ...prev, isPlayingSequence: false }
          }
          return { ...prev, currentSignalIndex: nextIdx }
        })
      }, 2200) // cada 2.2 segons canvia de senyal
    }
    return () => clearTimeout(timer)
  }, [state.isPlayingSequence, state.currentSignalIndex])

  // So de nit: sona mentre es reprodueix la seqüència, es para en pausar-la o en acabar-se
  useEffect(() => {
    if (state.isPlayingSequence) {
      play('night-signals')
    } else {
      stop('night-signals')
    }
  }, [state.isPlayingSequence, play, stop])

  useEffect(() => {
    return () => stop('night-signals')
  }, [stop])

  const safeIndex =
    typeof state.currentSignalIndex === 'number' &&
    state.currentSignalIndex >= 0 &&
    state.currentSignalIndex < FIRE_SIGNALS.length
      ? state.currentSignalIndex
      : 0
  const activeSignal = FIRE_SIGNALS[safeIndex] || FIRE_SIGNALS[0]

  const handleStartSequence = () => {
    setState(prev => ({
      ...prev,
      currentSignalIndex: 0,
      isPlayingSequence: true,
      sequenceStarted: true,
    }))
  }

  const handlePauseSequence = () => {
    setState(prev => ({ ...prev, isPlayingSequence: false }))
  }

  const handleToggleSequence = () => {
    if (state.isPlayingSequence) {
      handlePauseSequence()
    } else {
      handleStartSequence()
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const raw = state.answer.trim().toUpperCase()
    const cleanAnswer = raw.replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!cleanAnswer) return

    const result = await props.submit({
      answer: cleanAnswer,
    })

    // El servidor és l'única autoritat: mai marquem la fita com a resolta
    // localment si el servidor no ho confirma (evita falsos "èxit" quan la
    // resposta no coincideix amb la variant real de l'equip).
    const isCorrect = result?.correct === true

    if (isCorrect) {
      play('evidence-unlock')
      setState(prev => ({
        ...prev,
        solved: true,
        lastFeedback: {
          type: 'success',
          message: 'Missatge desxifrat amb èxit!',
        },
      }))
    } else {
      play('buzzer')
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastFeedback: {
          type: 'error',
          message: `"${cleanAnswer}" no és el que deien les fogueres. Revisa bé els parells a la taula de Polibi.`,
        },
      }))
    }
  }

  const handleLetterClick = (char: string) => {
    if (state.solved) return
    setState(prev => {
      const toAdd = char === '·' ? ' ' : char
      // Avoid double space
      if (toAdd === ' ' && (!prev.answer || prev.answer.endsWith(' '))) {
        return prev
      }
      return {
        ...prev,
        answer: (prev.answer + toAdd).toUpperCase(),
        lastFeedback: null,
      }
    })
  }

  const handleBackspace = () => {
    if (state.solved) return
    setState(prev => ({
      ...prev,
      answer: prev.answer.slice(0, -1),
      lastFeedback: null,
    }))
  }

  const handleClearAnswer = () => {
    if (state.solved) return
    setState(prev => ({
      ...prev,
      answer: '',
      lastFeedback: null,
    }))
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Capçalera històrica */}
      <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-[#8C6D53] pb-2 mb-3 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 1 · SERRAT DE LES BRUIXES
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2118] mt-0.5 font-serif">
          EL CODI DE FOGUERES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "La nit del 15 de maig, els vigies dels turons es van transmetre un missatge de foc que ningú al poble ha sabut llegir. Desxifra què diuen les fogueres de la plana."
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md mb-4 bg-stone-950">
        <img
          src="/images/scenes/serrat-bruixes.webp"
          alt="Serrat de les Bruixes - Creu de terme i fogueres de nit"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          🔥 Serrat de les Bruixes · Creu de ferro i fogueres a l'horitzó
        </div>
      </div>

      {/* PUNT 1: PESTANYES DE DOCUMENTACIÓ I PISTES */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'historia' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'historia'
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
            }`}
          >
            <span>📜</span>
            <span>La Història</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'sospitosos' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'sospitosos'
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
            }`}
          >
            <span>👥</span>
            <span>Sospitosos</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'taula' }))}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'taula'
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
            }`}
          >
            <span>🔤</span>
            <span>Taula de Polibi</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'senyals' }))}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'senyals'
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
            }`}
          >
            <span>🔥</span>
            <span>Senyals de Foc</span>
          </button>
        </div>

        {/* Contingut de les pestanyes de consulta */}
        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {state.activeDocTab === 'taula' && (
              <motion.div
                key="taula"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="text-xs sm:text-sm text-[#5C4533] font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>
                    <strong>Fogueres esquerra:</strong> Fila (1–5)
                  </span>
                  <span>
                    <strong>Fogueres dreta:</strong> Columna (1–5)
                  </span>
                </div>

                {/* Taula de Polibi com a teclat tàctil */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse font-serif text-sm bg-white/90 rounded-lg border border-[#8C6D53] shadow-sm">
                    <thead>
                      <tr className="bg-[#DFD4BC] text-xs font-mono text-[#5C4533]">
                        <th className="p-2 border border-[#8C6D53]/40">F \ C</th>
                        <th className="p-2 border border-[#8C6D53]/40">1</th>
                        <th className="p-2 border border-[#8C6D53]/40">2</th>
                        <th className="p-2 border border-[#8C6D53]/40">3</th>
                        <th className="p-2 border border-[#8C6D53]/40">4</th>
                        <th className="p-2 border border-[#8C6D53]/40">5</th>
                      </tr>
                    </thead>
                    <tbody>
                      {POLIBIUS_GRID.map(r => (
                        <tr key={r.row}>
                          <td className="p-2 font-mono font-bold bg-[#DFD4BC]/60 text-[#8C6D53] border border-[#8C6D53]/40">
                            {r.row}
                          </td>
                          {r.letters.map((char, colIndex) => (
                            <td
                              key={colIndex}
                              onClick={() => handleLetterClick(char)}
                              className="p-2.5 sm:p-3 font-bold text-base sm:text-lg border border-[#8C6D53]/40 cursor-pointer select-none bg-white text-[#2B2118] hover:bg-[#F2E5C8] hover:text-[#1D3557] active:bg-[#C99E32] active:scale-95 transition-all"
                              title={`Prem per afegir "${char === '·' ? 'Espai' : char}"`}
                            >
                              {char}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Barra d'eines del teclat tàctil */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 font-sans text-xs">
                  <span className="text-[#5C4533] italic text-xs text-center sm:text-left">
                    💡 Clica directament sobre les lletres per escriure (· = espai)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBackspace}
                      disabled={!state.answer || state.solved}
                      className="px-2.5 py-1 rounded bg-[#DFD4BC] hover:bg-[#D0C3A5] text-[#2B2118] font-bold disabled:opacity-40 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>⌫</span> Esborrar
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAnswer}
                      disabled={!state.answer || state.solved}
                      className="px-2 py-1 rounded text-[#8C6D53] hover:text-red-700 disabled:opacity-40 transition-colors"
                    >
                      Netejar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {state.activeDocTab === 'historia' && (
              <motion.div
                key="historia"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#F8F3E6] border-2 border-dashed border-[#8C6D53] p-4 rounded-lg shadow-inner space-y-2 text-xs sm:text-sm leading-relaxed"
              >
                  <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif mb-1">
			  L'Alerta dels Vigies
			  </h3>
                <div className="text-xs font-sans uppercase font-bold text-[#8C6D53] tracking-wider">
                  Informe confidencial dels Vigatans
                </div>
                <p>
                  "Així parlen els serrats de nit quan no es pot enviar cap emissari pel camí ral. La nit del 15 de maig de 1705, des del Serrat de les Bruixes van albirar senyals de foc procedents de la Plana."
                </p>
                <p>
                  "Un informador secret de dins de Vic ens ha advertit: <strong>la carta que delata el Pacte està escrita de mà pròpia</strong>. Això vol dir que qui ens ha traït no és analfabet: sap llegir i escriure."
                </p>
              </motion.div>
            )}

            {state.activeDocTab === 'sospitosos' && (
              <motion.div
                key="sospitosos"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#FAF5E9] dark:bg-[#1f1711] border border-[#8C6D53] dark:border-[#8C6D53]/40 p-3.5 rounded-lg text-xs space-y-2 font-sans"
              >
                <div className="font-bold text-[#1D3557] dark:text-[#8BB2E8] text-xs uppercase tracking-wide">
                  Nivell d'alfabetització al poble:
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 bg-white/80 dark:bg-[#140F0B] rounded border border-[#8C6D53]/30 dark:border-[#C2A68E]/20 flex justify-between items-center text-[#2B2118] dark:text-[#F3EBD8]">
                    <span><strong className="text-ink">Bernat Mas</strong> <span className="text-[#5C4533] dark:text-[#C2A68E]">(Mestre)</span></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Sap escriure</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-[#140F0B] rounded border border-[#8C6D53]/30 dark:border-[#C2A68E]/20 flex justify-between items-center text-[#2B2118] dark:text-[#F3EBD8]">
                    <span><strong className="text-ink">Mossèn Ramon</strong> <span className="text-[#5C4533] dark:text-[#C2A68E]">(Rector)</span></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Sap escriure</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-[#140F0B] rounded border border-[#8C6D53]/30 dark:border-[#C2A68E]/20 flex justify-between items-center text-[#2B2118] dark:text-[#F3EBD8]">
                    <span><strong className="text-ink">Anton</strong> <span className="text-[#5C4533] dark:text-[#C2A68E]">(Escolà)</span></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Sap escriure</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-[#140F0B] rounded border border-[#8C6D53]/30 dark:border-[#C2A68E]/20 flex justify-between items-center text-[#2B2118] dark:text-[#F3EBD8]">
                    <span><strong className="text-ink">Pere del Molí</strong></span>
                    <span className="text-amber-800 dark:text-amber-400 font-bold">Signa amb una creu (Analfabet)</span>
                  </div>
                  <div className="p-2 bg-white/80 dark:bg-[#140F0B] rounded border border-[#8C6D53]/30 dark:border-[#C2A68E]/20 flex justify-between items-center text-[#2B2118] dark:text-[#F3EBD8]">
                    <span><strong className="text-ink">Joan el traginer</strong></span>
                    <span className="text-amber-800 dark:text-amber-400 font-bold">Signa amb una creu (Analfabet)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {state.activeDocTab === 'senyals' && (
              <motion.div
                key="senyals"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="-mx-4 sm:-mx-5 -mb-4 sm:-mb-5"
              >
                  {/* L'ESCENA DELS DOS TURONS AMB LES FOGUERES */}
                  <div className="relative h-72 sm:h-[28rem] overflow-hidden rounded-b-xl bg-gradient-to-b from-[#060B14] via-[#101E30] to-[#1B2A1F]">
                    {/* Número de senyal, sobre el cel a l'esquerra */}
                    {state.sequenceStarted && (
                      <span className="absolute top-3 left-4 z-10 text-sm sm:text-base font-mono font-bold text-amber-200/90">
                        {state.currentSignalIndex + 1}
                      </span>
                    )}

                    {/* Estels */}
                    {NIGHT_STARS.map((s, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                          left: `${s.x}%`,
                          top: `${s.y}%`,
                          width: `${s.size}px`,
                          height: `${s.size}px`,
                          opacity: s.o,
                        }}
                      />
                    ))}

                    {/* Lluna */}
                    <div
                      className="absolute top-3 right-6 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#F4ECD8]"
                      style={{ boxShadow: '0 0 20px 7px rgba(244,236,216,0.28)' }}
                    />

                    {/* Turó Dret (al fons) · Columna */}
                    <div
                      className="absolute bottom-0 right-[-8%] w-[62%] h-28 sm:h-36 bg-gradient-to-b from-[#26301F] to-[#0D110A]"
                      style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
                    >
                      {state.sequenceStarted && (
                        <>
                          {/* Resplendor sobre la carena */}
                          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-14 bg-amber-500/25 blur-xl rounded-full pointer-events-none" />

                          {/* Flames tangents a la corba del turó */}
                          {getFlameOffsets(activeSignal.right).map((t, i) => (
                            <div
                              key={`right-${i}`}
                              className="absolute"
                              style={{ ...flamePosition(t), transform: 'translate(-50%, -65%)' }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.1, 0.9, 1.15, 1] }}
                                transition={{ repeat: Infinity, duration: 1.1 + i * 0.25 }}
                                className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                              >
                                🔥
                              </motion.div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Turó Esquerre (davant) · Fila */}
                    <div
                      className="absolute bottom-0 left-[-8%] w-[66%] h-32 sm:h-40 bg-gradient-to-b from-[#1E2B1A] to-[#0A0D07] z-10"
                      style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }}
                    >
                      {state.sequenceStarted && (
                        <>
                          {/* Resplendor sobre la carena */}
                          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-14 bg-amber-500/25 blur-xl rounded-full pointer-events-none" />

                          {/* Flames tangents a la corba del turó */}
                          {getFlameOffsets(activeSignal.left).map((t, i) => (
                            <div
                              key={`left-${i}`}
                              className="absolute"
                              style={{ ...flamePosition(t), transform: 'translate(-50%, -65%)' }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.15, 0.95, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2 + i * 0.2 }}
                                className="text-xl sm:text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                              >
                                🔥
                              </motion.div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Boira a l'horitzó */}
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-20" />

                    {/* Botó de reproducció: cercle centrat entre els dos turons */}
                    <motion.button
                      type="button"
                      onClick={handleToggleSequence}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#C99E32] hover:bg-amber-400 text-[#121E2B] flex items-center justify-center shadow-lg border-2 border-amber-200/60 font-sans"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      title={state.isPlayingSequence ? 'Pausar seqüència' : 'Reprodueix seqüència'}
                    >
                      <span className="text-lg sm:text-xl">
                        {state.isPlayingSequence ? '⏸' : '▶'}
                      </span>
                    </motion.button>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* PUNT 3: FORMULARI DE VALIDACIÓ DE RESPOSTA */}
      <section className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-5 shadow-md">
        {!state.solved ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm font-bold text-[#2B2118] font-serif">
              Quina frase han transmès les fogueres?
            </label>
            <p className="text-xs text-[#5C4533] font-sans">
              Introdueix les lletres desxifrades amb la taula de Polibi:
            </p>

            <motion.div
              animate={state.lastFeedback?.type === 'error' ? 'shake' : 'initial'}
              variants={shakeVariants}
            >
              <input
                type="text"
                value={state.answer}
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    answer: e.target.value.toUpperCase(),
                    lastFeedback: null,
                  }))
                }
                className="w-full p-3 border-2 border-[#8C6D53] rounded-lg bg-[#FAF5E9] text-[#1D3557] font-mono text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner"
              />
            </motion.div>

            {state.lastFeedback && state.lastFeedback.type === 'error' && (
              <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 rounded text-xs font-sans">
                ⚠️ {state.lastFeedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={!state.answer.trim()}
              className="w-full py-3 px-4 bg-[#1D3557] hover:bg-[#152740] disabled:opacity-40 text-white font-sans font-bold text-sm tracking-wide rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              <span>Validar Resposta</span>
            </button>
          </form>
        ) : (
          /* PANTALLA D'ÈXIT I DESCOBERTA D'EVIDÈNCIES */
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-lg text-emerald-950 shadow-inner">
              <div className="flex items-center gap-2 text-base font-bold font-serif text-emerald-900 mb-1">
                <span>✓</span>
                <span>Missatge Desxifrat: "{expectedAnswer}"!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 leading-relaxed">
                Les fogueres dels turons han revelat el codi delator: qui va escriure la carta <strong>sap llegir i escriure</strong> pergamins de mà pròpia.
              </p>
            </div>

            {/* DESCOBERTA D'EVIDÈNCIA I DESCART */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidència */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53]">
                  📜 Nova Evidència Desbloquejada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#1D3557] mt-0.5">
                  Alfabetització del Traïdor
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  El delator no necessita ningú per escriure: domina la lletra i el codi notarial.
                </p>
              </div>

              {/* Sospitosos Descartats */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                  🚫 Sospitosos Descartats
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2B2118] mt-0.5">
                  Pere del Molí i Joan el traginer
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  Tots dos són analfabets i signen amb una creu. Queden <strong>immediatament descartats</strong>.
                </p>
              </div>
            </div>

            {/* XIFRA DE L'ELEMENT FOC */}
            <div className="p-3.5 bg-[#1D3557] text-[#FAF5E9] rounded-lg border-2 border-[#C99E32] shadow text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C99E32]">
                XIFRA DE L'ELEMENT DESCOBERTA
              </div>
              <div className="text-xl sm:text-2xl font-bold font-serif mt-1 flex items-center justify-center gap-2.5">
                <img src="/images/elements/foc.webp" alt="Foc" className="w-8 h-8 object-contain drop-shadow" />
                <span>FOC = 4</span>
              </div>
              <div className="text-[11px] text-[#FAF5E9]/80 font-sans mt-0.5">
                Anota aquesta xifra al teu quadern d'equip!
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </motion.div>
  )
}
