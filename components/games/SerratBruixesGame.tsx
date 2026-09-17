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
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

// Seqüència de fogueres: Fila (Esquerra) - Columna (Dreta) per a "SAP DE LLETRA"
const FIRE_SIGNALS = [
  // S - A - P
  { id: 1, left: 4, right: 3, letter: 'S', word: 1 },
  { id: 2, left: 1, right: 1, letter: 'A', word: 1 },
  { id: 3, left: 3, right: 5, letter: 'P', word: 1 },
  // D - E
  { id: 4, left: 1, right: 4, letter: 'D', word: 2 },
  { id: 5, left: 1, right: 5, letter: 'E', word: 2 },
  // L - L - E - T - R - A
  { id: 6, left: 3, right: 1, letter: 'L', word: 3 },
  { id: 7, left: 3, right: 1, letter: 'L', word: 3 },
  { id: 8, left: 1, right: 5, letter: 'E', word: 3 },
  { id: 9, left: 4, right: 4, letter: 'T', word: 3 },
  { id: 10, left: 4, right: 2, letter: 'R', word: 3 },
  { id: 11, left: 1, right: 1, letter: 'A', word: 3 },
]

// Taula de Polibi 5x5
const POLIBIUS_GRID = [
  { row: 1, letters: ['A', 'B', 'C', 'D', 'E'] },
  { row: 2, letters: ['F', 'G', 'H', 'I', 'J'] },
  { row: 3, letters: ['L', 'M', 'N', 'O', 'P'] },
  { row: 4, letters: ['Q', 'R', 'S', 'T', 'U'] },
  { row: 5, letters: ['V', 'X', 'Z', 'Ç', '·'] },
]

export function SerratBruixesGame(props: GameProps) {
  const { play } = useAudio()
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
    }))
  }

  const handlePauseSequence = () => {
    setState(prev => ({ ...prev, isPlayingSequence: false }))
  }

  const handleNextSignal = () => {
    setState(prev => ({
      ...prev,
      isPlayingSequence: false,
      currentSignalIndex: (prev.currentSignalIndex + 1) % FIRE_SIGNALS.length,
    }))
  }

  const handlePrevSignal = () => {
    setState(prev => ({
      ...prev,
      isPlayingSequence: false,
      currentSignalIndex:
        prev.currentSignalIndex === 0 ? FIRE_SIGNALS.length - 1 : prev.currentSignalIndex - 1,
    }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const raw = state.answer.trim().toUpperCase()
    const cleanAnswer = raw.replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (!cleanAnswer) return

    const compact = cleanAnswer.replace(/\s+/g, '')

    // Permetem totes les variants legítimes de la frase
    const isValidLocally =
      cleanAnswer === 'SAP DE LLETRA' ||
      cleanAnswer === 'SAP LLETRA' ||
      cleanAnswer === 'SAP DE LETRA' ||
      cleanAnswer === 'SAP LETRA' ||
      cleanAnswer === 'SAB DE LLETRA' ||
      cleanAnswer === 'SAB LLETRA' ||
      cleanAnswer === 'SAP DE LLETRES' ||
      cleanAnswer === 'SAP LLETRES' ||
      cleanAnswer === 'ESCRIU' ||
      cleanAnswer === 'LLEGEIX' ||
      compact === 'SAPDELLETRA' ||
      compact === 'SAPLLETRA' ||
      compact === 'SAPLETRA' ||
      compact === 'SAPDELETRA' ||
      compact === 'SABDELLETRA' ||
      compact === 'SABLLETRA' ||
      (compact.includes('SAP') && (compact.includes('LLETRA') || compact.includes('LETRA')))

    const result = await props.submit({
      answer: cleanAnswer,
    })

    const isCorrect = result?.correct || isValidLocally

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
      className="w-full max-w-xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Capçalera històrica */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 1 · SERRAT DE LES BRUIXES
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          El Codi de Fogueres
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "La nit del 15 de maig, els vigies dels turons es van transmetre un missatge de foc que ningú al poble ha sabut llegir. Desxifra què diuen les fogueres de la plana."
        </p>
      </header>

      {/* PUNT 1: PESTANYES DE DOCUMENTACIÓ I PISTES */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'historia' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'historia'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>📜</span>
            <span>L'Alerta dels Vigies</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'sospitosos' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'sospitosos'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                  <span className="text-[#5C4533] italic text-[11px] text-center sm:text-left">
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
                <div className="text-[11px] font-sans uppercase font-bold text-[#8C6D53] tracking-wider">
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
                className="bg-[#FAF5E9] border border-[#8C6D53] p-3.5 rounded-lg text-xs space-y-2 font-sans"
              >
                <div className="font-bold text-[#1D3557] text-xs uppercase tracking-wide">
                  Nivell d'alfabetització al poble:
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 bg-white/80 rounded border border-[#8C6D53]/30 flex justify-between items-center">
                    <span><strong>Bernat Mas</strong> (Mestre)</span>
                    <span className="text-emerald-700 font-bold">Sap escriure</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded border border-[#8C6D53]/30 flex justify-between items-center">
                    <span><strong>Mossèn Carrió</strong> (Rector)</span>
                    <span className="text-emerald-700 font-bold">Sap escriure</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded border border-[#8C6D53]/30 flex justify-between items-center">
                    <span><strong>Anton</strong> (Escolà)</span>
                    <span className="text-emerald-700 font-bold">Sap escriure</span>
                  </div>
                  <div className="p-2 bg-amber-100/80 rounded border border-amber-300 flex justify-between items-center">
                    <span><strong>Pere del Molí</strong></span>
                    <span className="text-amber-800 font-bold">Signa amb una creu (Analfabet)</span>
                  </div>
                  <div className="p-2 bg-amber-100/80 rounded border border-amber-300 flex justify-between items-center">
                    <span><strong>Joan el traginer</strong></span>
                    <span className="text-amber-800 font-bold">Signa amb una creu (Analfabet)</span>
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
                className="bg-[#121E2B] text-[#F4EBD9] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden"
              >
                {/* Cel nocturn i turons decoratius de fons */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B131D] via-[#16273A] to-[#1D1711] opacity-90 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#8C6D53]/50 mb-3">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
                        <span>🔥</span>
                        <span>Visualitzador de Senyals de Nit</span>
                      </h2>
                      <p className="text-xs text-amber-300/80 font-sans">
                        Senyal actual: {state.currentSignalIndex + 1} de {FIRE_SIGNALS.length}
                      </p>
                    </div>

                    {/* Controls de reproducció */}
                    <div className="flex items-center gap-1.5 mt-2 sm:mt-0 font-sans">
                      <button
                        type="button"
                        onClick={handlePrevSignal}
                        className="p-1.5 px-2 bg-[#233549] hover:bg-[#314863] text-amber-200 rounded text-xs transition-colors"
                        title="Senyal anterior"
                      >
                        ◀
                      </button>

                      {state.isPlayingSequence ? (
                        <button
                          type="button"
                          onClick={handlePauseSequence}
                          className="p-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-xs transition-colors flex items-center gap-1"
                        >
                          <span>⏸</span> Pausar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartSequence}
                          className="p-1.5 px-3 bg-[#C99E32] hover:bg-amber-400 text-[#121E2B] font-bold rounded text-xs transition-colors flex items-center gap-1 shadow"
                        >
                          <span>▶</span> Reprodueix Seqüència
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleNextSignal}
                        className="p-1.5 px-2 bg-[#233549] hover:bg-[#314863] text-amber-200 rounded text-xs transition-colors"
                        title="Següent senyal"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  {/* L'ESCENA DELS DOS TURONS AMB LES FOGUERES */}
                  <div className="grid grid-cols-2 gap-4 py-6 px-2 my-2 bg-black/40 rounded-lg border border-amber-900/40 relative">
                    {/* Turó Esquerre: Fila */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#182330]/80 border border-amber-500/20">
                      <span className="text-[11px] font-sans uppercase font-bold text-amber-400 tracking-wider mb-2">
                        Turó Esquerre · Fila ({activeSignal.left})
                      </span>
                      <div className="flex items-center justify-center gap-2 min-h-[48px] flex-wrap">
                        {Array.from({ length: activeSignal.left }).map((_, i) => (
                          <motion.div
                            key={`left-${i}`}
                            animate={{ scale: [1, 1.15, 0.95, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.2 + i * 0.2 }}
                            className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                          >
                            🔥
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 mt-2 bg-black/50 px-2 py-0.5 rounded">
                        {activeSignal.left} foc{activeSignal.left > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Turó Dret: Columna */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#182330]/80 border border-amber-500/20">
                      <span className="text-[11px] font-sans uppercase font-bold text-amber-400 tracking-wider mb-2">
                        Turó Dret · Columna ({activeSignal.right})
                      </span>
                      <div className="flex items-center justify-center gap-2 min-h-[48px] flex-wrap">
                        {Array.from({ length: activeSignal.right }).map((_, i) => (
                          <motion.div
                            key={`right-${i}`}
                            animate={{ scale: [1, 1.1, 0.9, 1.15, 1] }}
                            transition={{ repeat: Infinity, duration: 1.1 + i * 0.25 }}
                            className="text-2xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                          >
                            🔥
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300 mt-2 bg-black/50 px-2 py-0.5 rounded">
                        {activeSignal.right} foc{activeSignal.right > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
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
                <span>Missatge Desxifrat: "SAP DE LLETRA"!</span>
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
              <div className="text-xl sm:text-2xl font-bold font-serif mt-0.5">
                🔥 FOC = 4
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
