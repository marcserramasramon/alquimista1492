'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, scaleVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeDocTab: 'carta' | 'registre' | 'secret'
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
]

const REGISTRY = [
  { year: 1697, name: 'Joan Corminelles', note: 'Difunt' },
  { year: 1698, name: 'Joseph Coromines', note: 'Nom canònic oficial' },
  { year: 1699, name: 'Miquel Solà', note: 'Difunt' },
  { year: 1700, name: 'Pere Mas', note: 'Difunt' },
  { year: 1701, name: 'Gabriel Molí', note: 'Difunt' },
  { year: 1702, name: 'Maria Coromines', note: 'Difunta' },
  { year: 1703, name: 'Antoni Puig', note: 'Difunt' },
  { year: 1704, name: 'Jaume Carrió', note: 'Difunt' },
  { year: 1705, name: 'Jaume Corbella', note: 'Difunt' },
]

export function CementiriGame(props: GameProps) {
  const { play } = useAudio()
  const [state, setState] = useState<GameState>(() => {
    const saved = props.sharedState as GameState | undefined
    return (
      saved || {
        activeDocTab: 'carta',
        selectedLapida: null,
        attempts: 0,
        solved: props.solved || false,
        lastFeedback: null,
      }
    )
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const selectedLapidaObj = LAPIDES.find(l => l.id === state.selectedLapida)

  const handleSubmit = async () => {
    if (!state.selectedLapida) return

    const result = await props.submit({
      lapidaId: state.selectedLapida,
      lapisaId: state.selectedLapida,
      answer: state.selectedLapida,
    })

    if (result.correct) {
      play('evidence-unlock')
      setState(prev => ({
        ...prev,
        solved: true,
        lastFeedback: {
          type: 'success',
          message: 'Enigma resolt! Has identificat l\'errada del picapedrer.',
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
          Estació 4 · Cementiri de la Guixa
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          La Signatura del Difunt
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "La carta secreta trobada al paller va signada amb el nom d'un difunt. Compara la carta amb el registre parroquial i les làpides per descobrir d'on van copiar la signatura."
        </p>
      </header>

      {/* PUNT 1: PESTANYES DE DOCUMENTACIÓ I PISTES */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'carta' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'carta'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>📜</span>
            <span>La Carta del Traïdor</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeDocTab: 'registre' }))}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeDocTab === 'registre'
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
              state.activeDocTab === 'secret'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>🔍</span>
            <span>El Secret</span>
          </button>
        </div>

        {/* Contingut de les pestanyes de consulta */}
        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {state.activeDocTab === 'carta' && (
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
                <div className="text-xs text-[#5C4533] font-bold mb-2">
                  15 de maig de 1705 — Paller de la rectoria
                </div>
                <p className="italic text-sm sm:text-base leading-relaxed text-[#2B2118] border-l-2 border-[#8C6D53] pl-3 my-2">
                  "Si el Pacte cau, els homes de Sentfoses hauran de fugir. Només l'Emissari pot salvar-nos si li donem la clau de la Rectoria. Els conjurats sabran qui ha triat deixar morir el Pacte..."
                </p>
                <div className="mt-4 pt-3 border-t border-[#8C6D53]/40 flex items-baseline justify-between">
                  <span className="text-xs text-[#5C4533]">Signatura manuscrita:</span>
                  <span className="text-lg sm:text-xl font-bold font-serif text-[#7A1F26] underline decoration-wavy decoration-[#C99E32]">
                    Corminas
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-[#7A1F26] font-sans font-semibold text-right">
                  ⚠️ Atenció: Fixa't bé en com està escrit el cognom a la signatura!
                </div>
              </motion.div>
            )}

            {state.activeDocTab === 'registre' && (
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
                  <span className="text-[10px] text-[#5C4533] font-sans italic">
                    Escriu: L'Escolà de la parròquia
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                  {REGISTRY.map(r => (
                    <div
                      key={r.year}
                      className={`p-2 rounded border flex justify-between items-center ${
                        r.year === 1698
                          ? 'bg-[#F2E5C8] border-[#C99E32] font-bold text-[#1D3557]'
                          : 'bg-white/70 border-[#D8CCAE]'
                      }`}
                    >
                      <span className="font-mono text-[11px] text-[#8C6D53]">{r.year}</span>
                      <span className="font-serif">{r.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#5C4533] mt-2 italic text-center">
                  El registre parroquial té els noms canònics ben transcrits per l'Escolà.
                </p>
              </motion.div>
            )}

            {state.activeDocTab === 'secret' && (
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
          </AnimatePresence>
        </div>
      </section>

      {/* PUNT 2: LES 9 LÀPIDES INTEGRADES DIRECTAMENT AMB SELECCIÓ */}
      <section className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#2B2118] font-serif flex items-center gap-1.5">
            <span>⚰️</span>
            <span>Les 9 Làpides del Cementiri</span>
          </h2>
          <span className="text-xs text-[#5C4533] font-sans">
            Tria quina tomba té la signatura copiada
          </span>
        </div>

        {/* Graella visual de les 9 làpides */}
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

        {/* Panell de decisió i validació */}
        <div className="mt-4 pt-4 border-t border-[#8C6D53]/30">
          {!state.solved ? (
            <div className="space-y-3">
              <div className="bg-[#DFD4BC] p-2.5 rounded-lg text-xs flex items-center justify-between">
                <span className="text-[#5C4533]">Làpida seleccionada:</span>
                <span className="font-bold text-sm text-[#1D3557] font-serif">
                  {selectedLapidaObj ? (
                    `${selectedLapidaObj.name} (${selectedLapidaObj.year})`
                  ) : (
                    <span className="text-[#8C6D53] italic">Cap làpida triada</span>
                  )}
                </span>
              </div>

              {state.lastFeedback && state.lastFeedback.type === 'error' && (
                <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 rounded text-xs font-sans">
                  ⚠️ {state.lastFeedback.message}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!state.selectedLapida}
                className="w-full py-3 px-4 bg-[#1D3557] hover:bg-[#152740] disabled:opacity-40 disabled:hover:bg-[#1D3557] text-white font-sans font-bold text-sm tracking-wide rounded-lg shadow transition-colors flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>Validar aquesta Làpida</span>
              </button>
            </div>
          ) : (
            /* PANORAMA D'ÈXIT */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-xl text-center space-y-3"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold font-sans uppercase">
                <span>✓</span>
                <span>Enigma del Cementiri Resolt!</span>
              </div>

              <h3 className="text-lg font-bold text-emerald-950 font-serif">
                Has descobert la pista de la làpida nº 1: Corminas (1698)
              </h3>

              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed max-w-md mx-auto">
                El picapedrer va gravar <strong>"Corminas"</strong> a la pedra, però al registre parroquial l'Escolà va anotar oficialment <strong>"Joseph Coromines"</strong>.
                <br />
                Només qui consultava el registre sabia la diferència... i podia copiar la falta d'ortografia a propòsit per inculpar algú altre!
              </p>

              <div className="bg-amber-100 border-2 border-[#C99E32] p-3 rounded-lg text-[#2B2118] font-bold text-sm flex items-center justify-center gap-2">
                <span>🪨</span>
                <span>XIFRA DE L'ELEMENT DESBLOQUEJADA: <strong>PEDRA = 1</strong></span>
              </div>

              <div className="text-xs font-sans font-bold text-emerald-700">
                +100 punts sumats al marcador de l'equip
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
