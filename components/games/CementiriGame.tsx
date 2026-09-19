'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, scaleVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeDocTab: 'historia' | 'carta' | 'registre' | 'secret' | 'lapides'
  selectedLapida: number | null
  attempts: number
  solved: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

const LAPIDES = [
  { id: 1, name: 'Corminas', year: 1698, isCorrectTarget: true },
  { id: 2, name: 'Corbella', year: 1705, isCorrectTarget: false },
  { id: 3, name: 'Mas', year: 1700, isCorrectTarget: false },
  { id: 4, name: 'Coromines', year: 1702, isCorrectTarget: false },
  { id: 5, name: 'Corminelles', year: 1697, isCorrectTarget: false },
  { id: 6, name: 'Carrió', year: 1704, isCorrectTarget: false },
  { id: 7, name: 'Solà', year: 1699, isCorrectTarget: false },
  { id: 8, name: 'Puig', year: 1703, isCorrectTarget: false },
  { id: 9, name: 'Molí', year: 1701, isCorrectTarget: false },
  { id: 10, name: 'Vila', year: 1696, isCorrectTarget: false },
  { id: 11, name: 'Bosch', year: 1706, isCorrectTarget: false },
  { id: 12, name: 'Ferrer', year: 1708, isCorrectTarget: false },
]

const REGISTRY = [
  { year: 1689, name: 'Anna Vilar', note: 'Difunta' },
  { year: 1691, name: 'Ramon Puigdomènech', note: 'Difunt' },
  { year: 1693, name: 'Isabel Font', note: 'Difunta' },
  { year: 1696, name: 'Marià Vila', note: 'Difunt' },
  { year: 1697, name: 'Joan Corminelles', note: 'Difunt' },
  { year: 1698, name: 'Joseph Coromines', note: 'Nom canònic oficial' },
  { year: 1699, name: 'Miquel Solà', note: 'Difunt' },
  { year: 1700, name: 'Pere Mas', note: 'Difunt' },
  { year: 1701, name: 'Gabriel Molí', note: 'Difunt' },
  { year: 1702, name: 'Maria Coromines', note: 'Difunta' },
  { year: 1703, name: 'Antoni Puig', note: 'Difunt' },
  { year: 1704, name: 'Jaume Carrió', note: 'Difunt' },
  { year: 1705, name: 'Jaume Corbella', note: 'Difunt' },
  { year: 1706, name: 'Teresa Bosch', note: 'Difunta' },
  { year: 1708, name: 'Narcís Ferrer', note: 'Difunt' },
]

export function CementiriGame(props: GameProps) {
  const { play } = useAudio()
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

    const isCorrect =
      state.selectedLapida === 1 ||
      selectedLapidaObj?.isCorrectTarget === true

    if (!isCorrect) {
      play('buzzer')
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastFeedback: {
          type: 'error',
          message: `La làpida de "${selectedLapidaObj?.name}" no és la que coincideix amb la signatura errada de la carta. Revisa la carta i el registre!`,
        },
      }))

      try {
        await props.submit({
          lapidaId: state.selectedLapida,
          lapisaId: state.selectedLapida,
          answer: state.selectedLapida,
        })
      } catch (err) {
        // silent
      }
      return
    }

    try {
      await props.submit({
        lapidaId: state.selectedLapida,
        lapisaId: state.selectedLapida,
        answer: state.selectedLapida,
      })

      play('evidence-unlock')
      setState(prev => ({
        ...prev,
        solved: true,
        lastFeedback: {
          type: 'success',
          message: "Enigma resolt! Has identificat l'errada del picapedrer.",
        },
      }))
    } catch (err) {
      console.error('Error enviant resposta:', err)
      play('evidence-unlock')
      setState(prev => ({
        ...prev,
        solved: true,
        lastFeedback: {
          type: 'success',
          message: "Enigma resolt! Has identificat l'errada del picapedrer.",
        },
      }))
    }
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Capçalera històrica */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 4 · Cementiri
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          LA SIGNATURA DEL DIFUNT
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "La carta secreta trobada al paller va signada amb el nom d'un difunt. Compara la carta amb el registre parroquial i les làpides per descobrir d'on van copiar la signatura."
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md mb-4 bg-stone-950">
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
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'historia' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              activeDocTab === 'historia'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
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
                className="bg-[#F4EBD9] border border-[#8C6D53] p-3.5 rounded-lg text-xs sm:text-sm text-[#2B2118] space-y-2 leading-relaxed"
              >
			<h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif mb-1">
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
                className="bg-[#F8F3E6] border-2 border-dashed border-[#8C6D53] p-4 rounded-lg shadow-inner relative"
              >
                <div className="absolute top-2 right-3 text-[10px] font-sans uppercase font-bold text-[#8C6D53] tracking-widest">
                  Fragment Trobat
                </div>
				
				 <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif mb-1">
			  L'Esborrany del Traïdor
			  </h3>
                <div className="text-xs text-[#5C4533] font-bold mb-2">
                  15 de maig de 1705 — Esborrany trobat al paller
                </div>
                <p className="italic text-sm sm:text-base leading-relaxed text-[#2B2118] border-l-2 border-[#8C6D53] pl-3 my-2">
                  "...en testimoni del tracte secret amb la guarnició de Vic, per a la seguretat dels homes de Sentfores... Qui busqui la veritat trobarà la fi del Pacte dels Vigatans abans de l'alba..."
                </p>
                <div className="mt-4 pt-3 border-t border-[#8C6D53]/40 flex items-baseline justify-between">
                  <span className="text-xs text-[#5C4533]">Signat:</span>
                  <span className="text-xl sm:text-2xl font-bold font-signature text-[#7A1F26]">
                    Corminas
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
                className="bg-[#FAF5E9] border border-[#8C6D53] p-3 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1D3557] font-sans uppercase tracking-wide">
                    Llibre Parroquial de Defuncions (Sentfores)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                  {REGISTRY.map(r => (
                    <div
                      key={r.year}
                      className="p-2 rounded border flex justify-between items-center bg-white/70 border-[#D8CCAE]"
                    >
                      <span className="font-mono text-xs text-[#8C6D53]">{r.year}</span>
                      <span className="font-serif">{r.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#5C4533] mt-2 italic text-center">
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
                className="bg-[#F4EBD9] border border-[#8C6D53] p-3.5 rounded-lg text-xs sm:text-sm text-[#2B2118] space-y-2 leading-relaxed"
              >
                <div className="font-bold text-[#1D3557] font-sans text-xs uppercase tracking-wide">
                  Pista de l'Emissari sobre el Cementiri:
                </div>
                <p>
                  Els picapedrers locals del segle XVIII sovint no sabien gaire de lletra i <strong>cometien faltes d'ortografia greus</strong> en cisellar les làpides de pedra.
                </p>
                <p className="italic text-[#5C4533]">
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
                  <h2 className="text-base sm:text-lg font-bold text-[#2B2118] font-serif flex items-center gap-1.5">
                    <span>⚰️</span>
                    <span>Les 12 Làpides del Cementiri</span>
                  </h2>
                  <span className="text-xs text-[#5C4533] font-sans">
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
                            ? 'bg-[#F4EBD9] border-[#C99E32] ring-2 ring-[#C99E32] shadow-md -translate-y-1'
                            : 'bg-[#DCD5C6] border-[#8C6D53] hover:bg-[#E8E2D5] hover:border-[#735A42]'
                        } ${state.solved && lapida.isCorrectTarget ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500' : ''}`}
                      >
                        {/* Icona funerària en relleu */}
                        <span className="text-xs opacity-50 mb-1">✝</span>
                        <span
                          className={`font-bold font-serif text-xs sm:text-sm tracking-wide ${
                            isSelected ? 'text-[#1D3557]' : 'text-[#2B2118]'
                          }`}
                        >
                          {lapida.name}
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-[#5C4533] mt-0.5">
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
      <section className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-5 shadow-md">
        {!state.solved ? (
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold text-[#2B2118] font-serif mb-1">
                Quina làpida conté l'errada que coincideix amb la signatura de la carta?
              </label>
              <p className="text-xs text-[#5C4533] font-sans">
                Compara la signatura de la carta amb les làpides del cementiri i el registre de defuncions:
              </p>
            </div>

            {/* Selector de la làpida */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#5C4533] uppercase tracking-wide font-sans">
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
                className="w-full p-2.5 sm:p-3 border-2 border-[#8C6D53] rounded-lg bg-[#FAF5E9] text-[#1D3557] font-serif font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner"
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
              <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 rounded text-xs font-sans flex items-center gap-2">
                <span>⚠️</span>
                <span>{state.lastFeedback.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!state.selectedLapida}
              className="w-full py-3 px-4 bg-[#1D3557] hover:bg-[#152740] disabled:opacity-40 disabled:hover:bg-[#1D3557] text-white font-sans font-bold text-sm tracking-wide rounded-lg shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
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
            <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-lg text-emerald-950 shadow-inner">
              <div className="flex items-center gap-2 text-base font-bold font-serif text-emerald-900 mb-1">
                <span>✓</span>
                <span>Enigma del Cementiri Resolt: Làpida nº 1, Corminas (1698)!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 leading-relaxed">
                El picapedrer va gravar <strong>"Corminas"</strong> a la pedra, però al registre parroquial l'Escolà va anotar oficialment <strong>"Joseph Coromines"</strong>. Només qui consultava el registre sabia la diferència... i podia copiar la falta d'ortografia a propòsit per inculpar algú altre.
              </p>
            </div>

            {/* DESCOBERTA D'EVIDÈNCIA I SOSPITÓS IMPLICAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidència */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53]">
                  ⚰️ Nova Evidència Desbloquejada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#1D3557] mt-0.5">
                  Fragment de la Carta i Làpides
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  La signatura de la carta coincideix, lletra per lletra, amb l'errada gravada a la làpida nº 1.
                </p>
              </div>

              {/* Sospitós Implicat */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#7A1F26]">
                  ⚠️ Sospitós Implicat
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2B2118] mt-0.5">
                  Anton, l'Escolà
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  Ell va escriure el registre de defuncions: tenia accés al nom correcte i podia copiar l'errada a propòsit.
                </p>
              </div>
            </div>

            {/* XIFRA DE L'ELEMENT AIRE */}
            <div className="p-3.5 bg-[#1D3557] text-[#FAF5E9] rounded-lg border-2 border-[#C99E32] shadow text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C99E32]">
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
