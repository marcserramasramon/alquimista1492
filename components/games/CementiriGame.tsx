'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeDocTab: 'historia' | 'carta' | 'registre' | 'secret' | 'lapides'
  selectedLapida: number | null
  attempts: number
  solved: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

interface Lapida {
  id: number
  name: string
  year: number
  isCorrectTarget: boolean
}

interface RegistryEntry {
  year: number
  name: string
  note: string
}

// Per variant (docs/joc-4-cementiri-dev.md § Solucions per Variant, i dades
// addicionals de les 9 làpides/registre per B i C construïdes seguint el
// mateix patró que la variant A: la làpida nº1 porta sempre l'errada del
// picapedrer que coincideix amb la signatura de la carta; una altra làpida
// (la "trampa") porta el cognom ben escrit però un any diferent).
const LAPIDES_BY_VARIANT: Record<string, Lapida[]> = {
  A: [
    { id: 1, name: 'Corminas', year: 1698, isCorrectTarget: true },
    { id: 2, name: 'Corbella', year: 1705, isCorrectTarget: false },
    { id: 3, name: 'Mas', year: 1700, isCorrectTarget: false },
    { id: 4, name: 'Coromines', year: 1702, isCorrectTarget: false },
    { id: 5, name: 'Corminelles', year: 1697, isCorrectTarget: false },
    { id: 6, name: 'Carrió', year: 1704, isCorrectTarget: false },
    { id: 7, name: 'Solà', year: 1699, isCorrectTarget: false },
    { id: 8, name: 'Puig', year: 1703, isCorrectTarget: false },
    { id: 9, name: 'Molí', year: 1701, isCorrectTarget: false },
  ],
  B: [
    { id: 1, name: 'Sarrat', year: 1701, isCorrectTarget: true },
    { id: 2, name: 'Corbella', year: 1705, isCorrectTarget: false },
    { id: 3, name: 'Mas', year: 1700, isCorrectTarget: false },
    { id: 4, name: 'Serrat', year: 1704, isCorrectTarget: false },
    { id: 5, name: 'Sarratell', year: 1697, isCorrectTarget: false },
    { id: 6, name: 'Carrió', year: 1703, isCorrectTarget: false },
    { id: 7, name: 'Solà', year: 1699, isCorrectTarget: false },
    { id: 8, name: 'Puig', year: 1702, isCorrectTarget: false },
    { id: 9, name: 'Molí', year: 1698, isCorrectTarget: false },
  ],
  C: [
    { id: 1, name: 'Puch', year: 1695, isCorrectTarget: true },
    { id: 2, name: 'Corbella', year: 1700, isCorrectTarget: false },
    { id: 3, name: 'Mas', year: 1698, isCorrectTarget: false },
    { id: 4, name: 'Puig', year: 1699, isCorrectTarget: false },
    { id: 5, name: 'Puchell', year: 1693, isCorrectTarget: false },
    { id: 6, name: 'Carrió', year: 1701, isCorrectTarget: false },
    { id: 7, name: 'Solà', year: 1697, isCorrectTarget: false },
    { id: 8, name: 'Molí', year: 1696, isCorrectTarget: false },
    { id: 9, name: 'Ferrer', year: 1694, isCorrectTarget: false },
  ],
}

const REGISTRY_BY_VARIANT: Record<string, RegistryEntry[]> = {
  A: [
    { year: 1697, name: 'Joan Corminelles', note: 'Difunt' },
    { year: 1698, name: 'Joseph Coromines', note: 'Nom canònic oficial' },
    { year: 1699, name: 'Miquel Solà', note: 'Difunt' },
    { year: 1700, name: 'Pere Mas', note: 'Difunt' },
    { year: 1701, name: 'Gabriel Molí', note: 'Difunt' },
    { year: 1702, name: 'Maria Coromines', note: 'Difunta' },
    { year: 1703, name: 'Antoni Puig', note: 'Difunt' },
    { year: 1704, name: 'Jaume Carrió', note: 'Difunt' },
    { year: 1705, name: 'Jaume Corbella', note: 'Difunt' },
  ],
  B: [
    { year: 1697, name: 'Bartomeu Sarratell', note: 'Difunt' },
    { year: 1698, name: 'Ignasi Molí', note: 'Difunt' },
    { year: 1699, name: 'Miquel Solà', note: 'Difunt' },
    { year: 1700, name: 'Pere Mas', note: 'Difunt' },
    { year: 1701, name: 'Maria Serrat', note: 'Nom canònic oficial' },
    { year: 1702, name: 'Antoni Puig', note: 'Difunt' },
    { year: 1703, name: 'Jaume Carrió', note: 'Difunt' },
    { year: 1704, name: 'Elisenda Serrat', note: 'Difunta' },
    { year: 1705, name: 'Jaume Corbella', note: 'Difunt' },
  ],
  C: [
    { year: 1693, name: 'Bernadeta Puchell', note: 'Difunta' },
    { year: 1694, name: 'Narcís Ferrer', note: 'Difunt' },
    { year: 1695, name: 'Antoni Puig', note: 'Nom canònic oficial' },
    { year: 1696, name: 'Gabriel Molí', note: 'Difunt' },
    { year: 1697, name: 'Miquel Solà', note: 'Difunt' },
    { year: 1698, name: 'Pere Mas', note: 'Difunt' },
    { year: 1699, name: 'Elisenda Puig', note: 'Difunta' },
    { year: 1700, name: 'Jaume Corbella', note: 'Difunt' },
    { year: 1701, name: 'Jaume Carrió', note: 'Difunt' },
  ],
}

const SIGNATURE_BY_VARIANT: Record<string, string> = { A: 'Corminas', B: 'Sarrat', C: 'Puch' }
const CORRECT_NAME_BY_VARIANT: Record<string, string> = {
  A: 'Joseph Coromines',
  B: 'Maria Serrat',
  C: 'Antoni Puig',
}
const CORRECT_YEAR_BY_VARIANT: Record<string, number> = { A: 1698, B: 1701, C: 1695 }

export function CementiriGame(props: GameProps) {
  const { play } = useAudio()
  const variant = (props.content?.variant as string) || 'A'
  const LAPIDES = LAPIDES_BY_VARIANT[variant] || LAPIDES_BY_VARIANT.A
  const REGISTRY = REGISTRY_BY_VARIANT[variant] || REGISTRY_BY_VARIANT.A
  const signatureError = SIGNATURE_BY_VARIANT[variant] || SIGNATURE_BY_VARIANT.A
  const correctName = CORRECT_NAME_BY_VARIANT[variant] || CORRECT_NAME_BY_VARIANT.A
  const correctYear = CORRECT_YEAR_BY_VARIANT[variant] || CORRECT_YEAR_BY_VARIANT.A
  const [state, setState] = useState<GameState>(() => {
    const saved =
      props.sharedState && typeof props.sharedState === 'object'
        ? (props.sharedState as Partial<GameState>)
        : {}

    return {
      activeDocTab: saved.activeDocTab || 'historia',
      selectedLapida: saved.selectedLapida ?? null,
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      lastFeedback: saved.lastFeedback || null,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const activeDocTab = state.activeDocTab || 'historia'

  const selectedLapidaObj = LAPIDES.find(l => l.id === state.selectedLapida)

  const handleSubmit = async () => {
    if (!state.selectedLapida) return

    try {
      const result = await props.submit({
        lapidaId: state.selectedLapida,
        lapisaId: state.selectedLapida,
        answer: state.selectedLapida,
      })

      // El servidor és l'única autoritat sobre la correcció de la resposta.
      if (result.correct === true) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          solved: true,
          lastFeedback: {
            type: 'success',
            message: "Enigma resolt! Has identificat l'errada del picapedrer.",
          },
        }))
      } else {
        play('buzzer')
        setState(prev => ({
          ...prev,
          attempts: prev.attempts + 1,
          lastFeedback: {
            type: 'error',
            message: `La làpida de "${selectedLapidaObj?.name}" no és la que coincideix amb la signatura errada de la carta. Revisa la carta i el registre!`,
          },
        }))
      }
    } catch (err) {
      console.error('Error enviant resposta:', err)
      play('buzzer')
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastFeedback: {
          type: 'error',
          message: 'Error enviant la resposta. Torna-ho a intentar.',
        },
      }))
    }
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118] dark:text-[#f3ebd8]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Capçalera històrica */}
      <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-[#8C6D53] dark:border-[#8C6D53]/40 pb-2 mb-3 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] dark:text-[#c2a68e] font-sans font-bold">
          Estació 4 · Cementiri
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2118] dark:text-[#f3ebd8] mt-0.5 font-serif">
          LA SIGNATURA DEL DIFUNT
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] dark:text-[#c2a68e] mt-1 italic max-w-md mx-auto">
          "La carta secreta trobada al paller va signada amb el nom d'un difunt. Compara la carta amb el registre parroquial i les làpides per descobrir d'on van copiar la signatura."
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] dark:border-[#8C6D53]/40 shadow-md mb-4 bg-stone-950">
        <img
          src="/images/scenes/cementiri.webp"
          alt="Cementiri de la Guixa a la nit"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          🌙 Cementiri de la Guixa · Nit del 15 de maig de 1705
        </div>
      </div>

      {/* PUNT 1: PESTANYES DE DOCUMENTACIÓ I PISTES */}
      <section className="bg-[#EAE0CA] dark:bg-[#1a130e] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] dark:bg-[#221a14] border-b border-[#8C6D53] dark:border-[#8C6D53]/40 flex">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'historia' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeDocTab === 'historia'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>📜</span>
            <span>La Història</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'carta' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeDocTab === 'carta'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>🧩</span>
            <span>La Prova</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'registre' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeDocTab === 'registre'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>📖</span>
            <span>Registre Parroquial</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'secret' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeDocTab === 'secret'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>🔍</span>
            <span>El Secret</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'lapides' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeDocTab === 'lapides'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>⚰️</span>
            <span>Làpides</span>
          </button>
        </div>

        {/* Contingut de les pestanyes de consulta */}
        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {activeDocTab === 'historia' && (
              <motion.div
                key="historia"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#F4EBD9] dark:bg-[#221a14] border border-[#8C6D53] dark:border-[#8C6D53]/40 p-3.5 rounded-lg text-xs sm:text-sm text-[#2B2118] dark:text-[#f3ebd8] space-y-2 leading-relaxed"
              >
			<h3 className="font-bold text-[#1D3557] dark:text-[#8bb2e8] text-sm sm:text-base font-serif mb-1">
            La Signatura falsificada
			</h3>
                <p className="italic">
                  "La carta va signada amb el nom d'un mort fa sis anys. Només qui consulta el registre de difunts podia saber aquell nom.
                </p>
                <p className="italic">
                  Els picapedrers fan errors: alguns noms a les làpides no van escrits tal com es van enterrar.
                </p>
                <p className="italic">
                  Compareu la signatura errada de la carta amb les làpides fictícies. Descobrireu qui tenia accés al registre real."
                </p>
              </motion.div>
            )}

            {activeDocTab === 'carta' && (
              <motion.div
                key="carta"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#F8F3E6] dark:bg-[#1f1711] border-2 border-dashed border-[#8C6D53] dark:border-[#8C6D53]/40 p-4 rounded-lg shadow-inner relative"
              >
                <div className="absolute top-2 right-3 text-[10px] font-sans uppercase font-bold text-[#8C6D53] dark:text-[#c2a68e] tracking-widest">
                  Fragment Trobat
                </div>

				 <h3 className="font-bold text-[#1D3557] dark:text-[#8bb2e8] text-sm sm:text-base font-serif mb-1">
			  L'Esborrany del Traïdor
			  </h3>
                <div className="text-xs text-[#5C4533] dark:text-[#c2a68e] font-bold mb-2">
                  15 de maig de 1705 — Esborrany trobat al paller
                </div>
                <p className="italic text-sm sm:text-base leading-relaxed text-[#2B2118] dark:text-[#f3ebd8] border-l-2 border-[#8C6D53] dark:border-[#8C6D53]/40 pl-3 my-2">
                  "...en testimoni del tracte secret amb la guarnició de Vic, per a la seguretat dels homes de Sentfores... Qui busqui la veritat trobarà la fi del Pacte dels Vigatans abans de l'alba..."
                </p>
                <div className="mt-4 pt-3 border-t border-[#8C6D53]/40 dark:border-[#8C6D53]/30 flex items-baseline justify-between">
                  <span className="text-xs text-[#5C4533] dark:text-[#c2a68e]">Signat:</span>
                  <span className="text-xl sm:text-2xl font-bold font-signature text-[#7A1F26] dark:text-[#f87171]">
                    {signatureError}
                  </span>
                </div>

              </motion.div>
            )}

            {activeDocTab === 'registre' && (
              <motion.div
                key="registre"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#FAF5E9] dark:bg-[#1f1711] border border-[#8C6D53] dark:border-[#8C6D53]/40 p-3 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1D3557] dark:text-[#8bb2e8] font-sans uppercase tracking-wide">
                    Llibre Parroquial de Defuncions (Sentfores)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                  {REGISTRY.map(r => (
                    <div
                      key={r.year}
                      className="p-2 rounded border flex justify-between items-center bg-white/70 dark:bg-[#2c221a] border-[#D8CCAE] dark:border-[#8C6D53]/30"
                    >
                      <span className="font-mono text-xs text-[#8C6D53] dark:text-[#c2a68e]">{r.year}</span>
                      <span className="font-serif dark:text-[#f3ebd8]">{r.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] mt-2 italic text-center">
                  El registre parroquial té els noms canònics ben transcrits per l'Escolà.
                </p>
              </motion.div>
            )}

            {activeDocTab === 'secret' && (
              <motion.div
                key="secret"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-[#F4EBD9] dark:bg-[#221a14] border border-[#8C6D53] dark:border-[#8C6D53]/40 p-3.5 rounded-lg text-xs sm:text-sm text-[#2B2118] dark:text-[#f3ebd8] space-y-2 leading-relaxed"
              >
                <div className="font-bold text-[#1D3557] dark:text-[#8bb2e8] font-sans text-xs uppercase tracking-wide">
                  Pista de l'Emissari sobre el Cementiri:
                </div>
                <p>
                  Els picapedrers locals del segle XVIII sovint no sabien gaire de lletra i <strong>cometien faltes d'ortografia greus</strong> en cisellar les làpides de pedra.
                </p>
                <p className="italic text-[#5C4533] dark:text-[#c2a68e]">
                  "Qui va signar la carta secreta va copiar literalment el nom d'una d'aquestes làpides del cementiri, sense saber que al llibre oficial de l'església s'escrivia d'una altra manera..."
                </p>
              </motion.div>
            )}

            {activeDocTab === 'lapides' && (
              <motion.div
                key="lapides"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-[#2B2118] dark:text-[#f3ebd8] font-serif flex items-center gap-1.5">
                    <span>⚰️</span>
                    <span>Les {LAPIDES.length} Làpides del Cementiri</span>
                  </h2>
                  <span className="text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans">
                    Tria quina tomba té la signatura copiada
                  </span>
                </div>

                {/* Graella visual de les 12 làpides */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 my-3">
                  {LAPIDES.map(lapida => {
                    const isSelected = state.selectedLapida === lapida.id
                    return (
                      <motion.button
                        key={lapida.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (state.solved) return
                          setState(prev => ({
                            ...prev,
                            selectedLapida: lapida.id,
                            lastFeedback: null,
                          }))
                        }}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-t-2xl rounded-b-md border-2 transition-all shadow-sm ${
                          isSelected
                            ? 'bg-[#F4EBD9] dark:bg-[#281e16] border-[#C99E32] dark:border-[#e5a93c] ring-2 ring-[#C99E32] dark:ring-[#e5a93c] shadow-md -translate-y-1'
                            : 'bg-[#DCD5C6] dark:bg-[#1f1711] border-[#8C6D53] dark:border-[#8C6D53]/40 hover:bg-[#E8E2D5] dark:hover:bg-[#2c221a] hover:border-[#735A42] dark:hover:border-[#8C6D53]/60'
                        } ${state.solved && lapida.isCorrectTarget ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500' : ''}`}
                      >
                        {/* Icona funerària en relleu */}
                        <span className="text-xs opacity-50 mb-1">✝</span>
                        <span
                          className={`font-bold font-serif text-xs sm:text-sm tracking-wide ${
                            isSelected ? 'text-[#1D3557] dark:text-[#e5a93c]' : 'text-[#2B2118] dark:text-[#f3ebd8]'
                          }`}
                        >
                          {lapida.name}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-[#5C4533] dark:text-[#c2a68e] mt-0.5">
                          {lapida.year}
                        </span>

                        {/* Marcador de selecció */}
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#C99E32] text-[#2B2118] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                            ✓
                          </span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FORMULARI DE VALIDACIÓ I DEDUCCIÓ (SEMPRE VISIBLE A SOTA) */}
      <section className="bg-[#EAE0CA] dark:bg-[#1a130e] border-2 border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-xl p-4 sm:p-5 shadow-md">
        {!state.solved ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-[#2B2118] dark:text-[#f3ebd8] font-serif mb-1">
                Quina làpida conté l'errada que coincideix amb la signatura de la carta?
              </label>
              <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans">
                Compara la signatura de la carta amb les làpides del cementiri i el registre de defuncions:
              </p>
            </div>

            {/* Selector de la làpida */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C4533] dark:text-[#c2a68e] uppercase tracking-wide font-sans">
                Tria la làpida:
              </label>
              <select
                value={state.selectedLapida ?? ''}
                onChange={e => {
                  const val = e.target.value ? Number(e.target.value) : null
                  setState(prev => ({
                    ...prev,
                    selectedLapida: val,
                    lastFeedback: null,
                  }))
                }}
                className="w-full p-2.5 sm:p-3 border-2 border-[#8C6D53] dark:border-[#8C6D53]/60 rounded-lg bg-[#FAF5E9] dark:bg-[#14100c] text-[#1D3557] dark:text-[#8bb2e8] font-serif font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner"
              >
                <option value="">-- Tria una làpida (o fes clic a la pestanya Làpides) --</option>
                {LAPIDES.map(l => (
                  <option key={l.id} value={l.id}>
                    Làpida nº {l.id}: {l.name} ({l.year})
                  </option>
                ))}
              </select>
            </div>

           

            {state.lastFeedback && state.lastFeedback.type === 'error' && (
              <div className="p-2.5 bg-red-100 dark:bg-[#2c1515] border border-red-300 dark:border-red-700/60 text-red-900 dark:text-red-200 rounded text-xs font-sans flex items-center gap-2">
                <span>⚠️</span>
                <span>{state.lastFeedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!state.selectedLapida}
              className="w-full py-3 px-4 bg-[#1D3557] hover:bg-[#152740] dark:bg-[#c99e32] dark:hover:bg-[#e5a93c] disabled:opacity-40 disabled:hover:bg-[#1D3557] dark:disabled:hover:bg-[#c99e32] text-white dark:text-[#14100c] font-sans font-bold text-sm tracking-wide rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>🔍</span>
              <span>Validar aquesta Làpida</span>
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
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-500 rounded-lg text-emerald-950 dark:text-emerald-100 shadow-inner">
              <div className="flex items-center gap-2 text-base font-bold font-serif text-emerald-900 dark:text-emerald-300 mb-1">
                <span>✓</span>
                <span>Enigma del Cementiri Resolt: Làpida nº 1, {signatureError} ({correctYear})!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 dark:text-emerald-200 leading-relaxed">
                El picapedrer va gravar <strong>"{signatureError}"</strong> a la pedra, però al registre parroquial l'Escolà va anotar oficialment <strong>"{correctName}"</strong>. Només qui consultava el registre sabia la diferència... i podia copiar la falta d'ortografia a propòsit per inculpar algú altre.
              </p>
            </div>

            {/* DESCOBERTA D'EVIDÈNCIA I SOSPITÓS IMPLICAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidència */}
              <div className="p-3.5 bg-[#FAF5E9] dark:bg-[#1a130e] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53] dark:text-[#c2a68e]">
                  ⚰️ Nova Evidència Desbloquejada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#1D3557] dark:text-[#8bb2e8] mt-0.5">
                  Fragment de la Carta i Làpides
                </h4>
                <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] mt-1 font-sans">
                  La signatura de la carta coincideix, lletra per lletra, amb l'errada gravada a la làpida nº 1.
                </p>
              </div>

              {/* Sospitós Implicat */}
              <div className="p-3.5 bg-[#FAF5E9] dark:bg-[#1a130e] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#7A1F26] dark:text-[#f87171]">
                  ⚠️ Sospitós Implicat
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2B2118] dark:text-[#f3ebd8] mt-0.5">
                  Anton, l'Escolà
                </h4>
                <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] mt-1 font-sans">
                  Ell va escriure el registre de defuncions: tenia accés al nom correcte i podia copiar l'errada a propòsit.
                </p>
              </div>
            </div>

            {/* XIFRA DE L'ELEMENT AIRE */}
            <div className="p-3.5 bg-[#1D3557] dark:bg-[#1a2332] text-[#FAF5E9] rounded-lg border-2 border-[#C99E32] dark:border-[#e5a93c] shadow text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C99E32] dark:text-[#e5a93c]">
                XIFRA DE L'ELEMENT DESCOBERTA
              </div>
              <div className="text-xl sm:text-2xl font-bold font-serif mt-1 flex items-center justify-center gap-2.5">
                <img src="/images/elements/aire.webp" alt="Aire" className="w-8 h-8 object-contain drop-shadow" />
                <span>AIRE = 1</span>
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
