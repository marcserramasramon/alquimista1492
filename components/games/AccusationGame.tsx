'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { useGameNavigation } from '@/lib/context/GameNavigationContext'
import {
  fadeInVariants,
  containerVariants,
  itemVariants,
  shakeVariants,
} from '@/lib/animations/useAnimations'

interface AccusationGameState {
  currentScreen: 'intro' | 'suspect_select' | 'evidence_select' | 'giro' | 'result' | 'incorrect'
  selectedSuspect: string | null
  selectedEvidence: string[] // Serialitzable com array
  attempts: number
  hasSeenGiro: boolean
  isCorrect: boolean
}

const SUSPECTS = [
  {
    id: 'anton',
    name: "Anton l'Escolà",
    role: "Escolà de la Parròquia",
    desc: "Ajudant de missa i confiança de la rectoria. Sempre a prop del rector.",
    icon: '🕯️',
  },
  {
    id: 'bernat',
    name: "Bernat Mestre d'Escola",
    role: "Mestre de la Guixa",
    desc: "Instruït, sap de lletra i redacta documents per al poble. Coordina els conjurats.",
    icon: '📜',
  },
]

const DISCARDED_SUSPECTS = [
  { id: 'pere', name: 'Pere del Molí', station: 'Joc 1: Serrat', reason: 'No sap de lletra (analfabet)' },
  { id: 'joan', name: 'Joan el traginer', station: 'Joc 1: Serrat', reason: 'No sap de lletra (analfabet)' },
  { id: 'marianna', name: "Marianna de l'Hostal", station: 'Joc 2: Font del Ferro', reason: 'Coartada del registre de càntirs (dia 12)' },
  { id: 'isidre', name: 'Isidre el ferrer', station: 'Joc 3: Planes Bones', reason: 'Coartada del paller i del molí fins a les 23:00' },
]

const ALL_EVIDENCE = [
  { id: 'seal', name: 'Segell de cera amb ploma i clau', source: 'Joc 4: Cementiri', detail: 'Trobat al pergamí ocult de la tomba del canonge.' },
  { id: 'light', name: 'Llum encesa a l’escola la nit del 15', source: 'Joc 3: Planes Bones', detail: 'Els veïns van veure llum de llàntia a l’aula a deshores.' },
  { id: 'cantirs', name: 'Dos càntirs a l’escola el dia 12', source: 'Joc 2: Font del Ferro', detail: 'Registre notarial de recollida de tinta ferrogàl·lica.' },
  { id: 'literacy', name: 'Capacitat d’escriure i redactar (sap de lletra)', source: 'Joc 1: Serrat de les Bruixes', detail: 'La carta al Virrei està redactada amb sintaxi culta.' },
  { id: 'caligraphia', name: 'Plana de cal·ligrafia amb noms de conjurats', source: 'Quadern d’investigació', detail: 'Mateix traç que la llista enviada a la guarnició de Vic.' },
  { id: 'filigrana', name: 'Paper amb filigrana d’àncora idèntica', source: 'Joc 4: Cementiri', detail: 'Reserva exclusiva de paper del mestre d’escola.' },
]

export function AccusationGame(props: GameProps) {
  const router = useRouter()
  const { play } = useAudio()
  const { clearActiveGame } = useGameNavigation()

  const [state, setState] = useState<AccusationGameState>(() => {
    const saved =
      props.sharedState && typeof props.sharedState === 'object'
        ? (props.sharedState as Partial<AccusationGameState>)
        : {}

    return {
      currentScreen: saved.currentScreen || 'intro',
      selectedSuspect: saved.selectedSuspect || null,
      selectedEvidence: Array.isArray(saved.selectedEvidence) ? saved.selectedEvidence : [],
      attempts: saved.attempts || 0,
      hasSeenGiro: saved.hasSeenGiro || false,
      isCorrect: props.solved || saved.isCorrect || false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSuspectSelect = (suspectId: string) => {
    setState(prev => ({
      ...prev,
      selectedSuspect: suspectId,
      currentScreen: 'evidence_select',
      selectedEvidence: [], // Reset proves en canviar de sospitós
    }))
  }

  const handleBackToSuspects = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'suspect_select',
    }))
  }

  const handleBackToIntro = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'intro',
    }))
  }

  const handleBackFromResults = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'suspect_select',
      isCorrect: false,
    }))
  }

  const toggleEvidence = (evidenceId: string) => {
    setState(prev => {
      const exists = prev.selectedEvidence.includes(evidenceId)
      let updated: string[]
      if (exists) {
        updated = prev.selectedEvidence.filter(id => id !== evidenceId)
      } else {
        if (prev.selectedEvidence.length >= 3) {
          // Reemplaça el més antic o no permet més de 3
          updated = [...prev.selectedEvidence.slice(1), evidenceId]
        } else {
          updated = [...prev.selectedEvidence, evidenceId]
        }
      }
      return { ...prev, selectedEvidence: updated }
    })
  }

  const handleSubmitAccusation = async () => {
    if (!state.selectedSuspect || state.selectedEvidence.length !== 3) return

    try {
      const result = await props.submit({
        suspect: state.selectedSuspect,
        evidence: state.selectedEvidence,
      })

      if (result.correct) {
        if ((state.selectedSuspect === 'anton' || (result as any)?.isGiro) && !state.hasSeenGiro) {
          play('buzzer')
          setState(prev => ({
            ...prev,
            currentScreen: 'giro',
            hasSeenGiro: true,
            attempts: prev.attempts + 1,
          }))
        } else {
          play('bell-ring')
          setState(prev => ({
            ...prev,
            currentScreen: 'result',
            isCorrect: true,
          }))
        }
      } else {
        play('buzzer')
        setState(prev => ({
          ...prev,
          currentScreen: 'incorrect',
          attempts: prev.attempts + 1,
        }))
      }
    } catch (err) {
      console.error('Error enviant acusació:', err)
    }
  }

  const handleRetryAfterGiro = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'suspect_select',
      selectedSuspect: null,
      selectedEvidence: [],
    }))
  }

  const handleRetryIncorrect = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'evidence_select',
    }))
  }

  const currentSuspectObj = SUSPECTS.find(s => s.id === state.selectedSuspect)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-8 font-serif">
      {/* CAPÇALERA HISTÒRICA */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 6 · PLA DE MASSET
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          L'ACUSACIÓ FINAL
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "Assenyala el traïdor de la Guixa i aporta les 3 proves concloents"
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md mb-4 bg-stone-950">
        <img
          src="/images/scenes/acusacio.webp"
          alt="L'Acusació - Pla de Masset"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          ⚖️ Pla de Masset · La Nit de la Veritat i l'Acusació Final
        </div>
      </div>

      {/* CONTINGUT PRINCIPAL DEL JOC */}
      <main className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-6 shadow-md">
        <AnimatePresence mode="wait">
          {/* PANTALLA 1: INTRODUCCIÓ I RESUM DEL CAS */}
          {state.currentScreen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <div className="p-4 bg-[#F4EBD9] border-l-4 border-[#8C6D53] rounded-r shadow-inner">
                <h2 className="font-bold text-[#1D3557] text-base font-serif mb-1.5">
                  La Nit de la Veritat
                </h2>
                
				
				
				
				
				
				
				<div className="text-xs sm:text-sm leading-relaxed text-[#2B2118] space-y-4">
  <p>
    <strong>L'Alba Ve de Vic</strong>, les fogueres s'han apagat.<strong> Els dragons</strong> ja sellen les portes de Vic.
  </p>

  <p>
    Heu recorregut el <strong>terme de la Guixa</strong> com qui busca una ombra dins la nit. Els <strong>quatre elements ancestrals</strong> us han donat els seus secrets. Els vostres passos han descalçat <strong>quatre sospitosos</strong>.
  </p>

  <p>
    Però <strong>la carta encara respira</strong>. I <strong>el traïdor</strong> respira amb ella. Entre els sis del poble <strong>en queda un</strong>: el traïdor que ha escrit la carta, el que va negociar amb Vic, el que va <strong>condemnar els conjurats</strong>.
  </p>

  <p>
    <strong>Nomenau el delator</strong>. Portau les <strong>tres proves</strong> que no permeten dubte. La història us escolta.<br />
    La nit espera la vostra <strong>resposta</strong>.
  </p>
</div>
				
				
				
				
				
				
		
				
				
				
				
				
              </div>

              {/* Sospitosos descartats */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#5C4533] font-bold">
                  Sospitosos Descartats al Llarg de la Recerca (4 de 6):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DISCARDED_SUSPECTS.map(s => (
                    <div
                      key={s.id}
                      className="p-2.5 bg-[#FAF5E9] border border-[#8C6D53]/40 rounded-lg text-xs flex items-start gap-2 text-[#4A3728]"
                    >
                      <span className="text-emerald-700 font-bold">✓</span>
                      <div>
                        <strong className="text-[#2B2118]">{s.name}</strong> ({s.station})
                        <p className="text-[11px] text-[#5C4533]">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Els dos finalistes */}
              <div className="p-4 bg-[#D8CCAE]/70 rounded-xl border border-[#8C6D53] text-center space-y-1">
                <span className="text-xs font-mono uppercase text-[#1D3557] font-bold">
                  Només resten 2 sospitosos al poble:
                </span>
                <div className="text-base sm:text-lg font-bold text-[#2B2118] font-serif">
                  Anton l'Escolà &nbsp;o&nbsp; Bernat Mestre d'Escola
                </div>
                <p className="text-xs text-[#5C4533]">
                  Haureu de triar a qui assenyaleu i justificar-ho amb 3 proves clares del vostre quadern.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setState(prev => ({ ...prev, currentScreen: 'suspect_select' }))}
                className="w-full py-3.5 px-4 bg-[#C99E32] hover:bg-amber-500 text-[#121E2B] font-bold font-sans rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
              >
                <span>Procedir a l'Acusació</span>
                <span>➔</span>
              </button>
            </motion.div>
          )}

          {/* PANTALLA 2: TRIAR SOSPITÓS */}
          {state.currentScreen === 'suspect_select' && (
            <motion.div
              key="suspect_select"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Botó de tornar enrere a la intro */}
              <div className="flex items-center justify-between border-b border-[#8C6D53]/40 pb-2">
                <button
                  type="button"
                  onClick={handleBackToIntro}
                  className="px-3 py-1.5 text-xs font-bold text-[#1D3557] bg-[#FAF5E9] hover:bg-[#D8CCAE] border border-[#8C6D53] rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>←</span>
                  <span>Tornar al sumari</span>
                </button>
                <span className="text-xs text-[#5C4533] font-mono">Pas 1 de 2: Qui és?</span>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1D3557] font-serif">
                  Qui és el Traïdor?
                </h2>
                <p className="text-xs sm:text-sm text-[#5C4533] font-sans">
                  Fes clic sobre la persona que vols acusar formalment:
                </p>
              </div>

              {/* Llista de sospitosos a acusar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {SUSPECTS.map(suspect => {
                  const isAntonAfterGiro = suspect.id === 'anton' && state.hasSeenGiro
                  return (
                    <button
                      key={suspect.id}
                      type="button"
                      disabled={isAntonAfterGiro}
                      onClick={() => handleSuspectSelect(suspect.id)}
                      className={`p-4 border-2 rounded-xl text-left shadow-sm transition-all flex flex-col justify-between ${
                        isAntonAfterGiro
                          ? 'bg-gray-100/80 border-gray-300 opacity-60 cursor-not-allowed'
                          : 'bg-[#FAF5E9] hover:bg-[#F4EBD9] border-[#8C6D53] hover:border-[#1D3557] hover:shadow-md cursor-pointer group'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{suspect.icon}</span>
                          <span
                            className={`text-xs font-bold font-sans px-2 py-0.5 rounded transition-colors ${
                              isAntonAfterGiro
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-[#D8CCAE] text-[#1D3557] group-hover:bg-[#1D3557] group-hover:text-white'
                            }`}
                          >
                            {isAntonAfterGiro ? '✓ Innocent provat' : 'Acusar ➔'}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-[#2B2118] font-serif">
                          {suspect.name}
                        </h3>
                        <span className="text-xs font-bold text-[#8C6D53] block font-sans">
                          {suspect.role}
                        </span>
                        <p className="text-xs text-[#4A3728] mt-2 font-sans leading-relaxed">
                          {isAntonAfterGiro
                            ? 'Coartada confirmada: vetllava el mossèn ferit a la rectoria tota la nit.'
                            : suspect.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Acordió / info dels descartats */}
              <div className="mt-4 pt-4 border-t border-[#8C6D53]/40">
                <details className="text-xs text-[#5C4533] cursor-pointer">
                  <summary className="font-bold hover:text-[#1D3557] transition">
                    Veure els 4 sospitosos ja descartats
                  </summary>
                  <div className="mt-2 pl-2 space-y-1 font-sans text-[11px]">
                    <p>• Pere del Molí — Descartat al Serrat (Analfabet)</p>
                    <p>• Joan el traginer — Descartat al Serrat (Analfabet)</p>
                    <p>• Marianna de l'Hostal — Descartada a la Font del Ferro (Càntirs)</p>
                    <p>• Isidre el ferrer — Descartat a Planes Bones (Coartada a La Farga)</p>
                  </div>
                </details>
              </div>
            </motion.div>
          )}

          {/* PANTALLA 3: SELECCIÓ DE PROVES (UN COP HAS ACUSAT) */}
          {state.currentScreen === 'evidence_select' && currentSuspectObj && (
            <motion.div
              key="evidence_select"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* BARRA SUPERIOR AMB BOTÓ CLAR DE TORNAR ENRERE / CANVIAR SOSPITÓS */}
              <div className="flex items-center justify-between border-b border-[#8C6D53]/40 pb-2">
                <button
                  type="button"
                  onClick={handleBackToSuspects}
                  className="px-3 py-1.5 text-xs font-bold text-[#1D3557] bg-[#FAF5E9] hover:bg-[#D8CCAE] border border-[#8C6D53] rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>←</span>
                  <span>Canviar de sospitós / Tornar enrere</span>
                </button>

                <span className="text-xs font-mono font-bold text-[#8C6D53]">
                  {state.selectedEvidence.length}/3 proves
                </span>
              </div>

              {/* Targeta del sospitós seleccionat */}
              <div className="p-3.5 bg-[#FAF5E9] border-2 border-[#1D3557] rounded-xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentSuspectObj.icon}</span>
                  <div>
                    <div className="text-[11px] font-mono uppercase font-bold text-[#8C6D53]">
                      Has acusat com a traïdor:
                    </div>
                    <div className="text-base sm:text-lg font-bold text-[#1D3557] font-serif">
                      {currentSuspectObj.name}
                    </div>
                    <div className="text-xs text-[#5C4533] font-sans">
                      {currentSuspectObj.role}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBackToSuspects}
                  className="text-xs text-[#8C6D53] hover:text-[#1D3557] underline font-sans cursor-pointer"
                >
                  Canviar
                </button>
              </div>

              {/* Indicacions */}
              <div>
                <h3 className="text-sm font-bold text-[#2B2118] font-serif">
                  Aporta exactament 3 proves vàlides del Quadern d'Investigació:
                </h3>
                <p className="text-xs text-[#5C4533] font-sans mt-0.5">
                  Marca les proves que incriminen directament aquest sospitós:
                </p>
              </div>

              {/* Llista de proves seleccionables */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {ALL_EVIDENCE.map(ev => {
                  const isSelected = state.selectedEvidence.includes(ev.id)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => toggleEvidence(ev.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-600 shadow-sm ring-2 ring-amber-300'
                          : 'bg-[#FAF5E9] border-[#8C6D53]/40 hover:bg-[#F4EBD9]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Gestionat pel div contenidor
                        className="mt-1 h-4 w-4 text-amber-600 rounded border-[#8C6D53] focus:ring-amber-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-[#2B2118] font-serif">
                            {ev.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#D8CCAE] rounded text-[#1D3557]">
                            {ev.source}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#5C4533] font-sans mt-0.5">
                          {ev.detail}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Botons d'acció inferiors */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleBackToSuspects}
                  className="py-3 px-4 bg-[#FAF5E9] hover:bg-[#D8CCAE] border border-[#8C6D53] text-[#1D3557] font-bold font-sans rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm"
                >
                  <span>←</span>
                  <span>Canviar de sospitós</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAccusation}
                  disabled={state.selectedEvidence.length !== 3}
                  className={`flex-1 py-3 px-4 font-bold font-sans rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base ${
                    state.selectedEvidence.length === 3
                      ? 'bg-[#C99E32] hover:bg-amber-500 text-[#121E2B]'
                      : 'bg-gray-300 text-gray-600 border border-gray-400 cursor-not-allowed opacity-70'
                  }`}
                >
                  <span>Validar Acusació ({state.selectedEvidence.length}/3)</span>
                  <span>➔</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* PANTALLA 4: GIR NARRATIU (QUAN ACUSEN ANTON PRIMER) */}
          {state.currentScreen === 'giro' && (
            <motion.div
              key="giro"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-red-50 border-2 border-red-600 rounded-xl text-center space-y-2 shadow-inner">
                <span className="text-2xl">⚡</span>
                <h2 className="text-lg sm:text-xl font-bold text-red-900 font-serif">
                  «El Rector! L'han ferit!»
                </h2>
                <p className="text-xs sm:text-sm italic text-red-800 font-serif">
                  «Jo no he sortit de la rectoria en tota la nit del 15 de maig! Vaig estar vetllant el mossèn i sostenint-li el cap fins que va arribar el metge!»
                </p>
                <div className="inline-block px-3 py-1 bg-red-200/90 text-red-900 font-mono text-xs font-bold rounded-md mt-1 border border-red-300">
                  ⚠️ Sospitós erroni: Anton és innocent (−10 punts)
                </div>
              </div>

              {/* Noves revelacions */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg space-y-2 text-xs font-sans">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                  📜 Testimoni Notarial del Rector
                </span>
                <p className="text-[#2B2118]">
                  El rector ferit confirma la coartada: l'Anton l'Escolà va estar amb ell tota la nit sense separar-se del seu llit.
                </p>
                <div className="pt-2 border-t border-[#8C6D53]/30">
                  <p className="font-bold text-[#1D3557]">
                    Anton és innocent. Per tant... només queda una persona possible!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleRetryAfterGiro}
                  className="flex-1 py-3.5 px-4 bg-[#C99E32] hover:bg-amber-500 text-[#121E2B] font-bold font-sans rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <span>Tornar a acusar ➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => setState(prev => ({ ...prev, currentScreen: 'evidence_select' }))}
                  className="py-3 px-4 bg-[#FAF5E9] hover:bg-[#D8CCAE] border border-[#8C6D53] text-[#1D3557] font-bold font-sans rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>← Revisar proves d'Anton</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* PANTALLA 5: INCORRECTE (PROVES NO VÀLIDES) */}
          {state.currentScreen === 'incorrect' && (
            <motion.div
              key="incorrect"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-red-100 border-2 border-red-500 rounded-xl text-center space-y-2">
                <span className="text-2xl">⚠️</span>
                <h2 className="text-lg sm:text-xl font-bold text-red-900 font-serif">
                  Acusació Desestimada
                </h2>
                <p className="text-xs sm:text-sm text-red-800 font-sans leading-relaxed">
                  Les proves seleccionades no corresponen a aquest sospitós o no són prou concloents per formular una acusació ferma.
                </p>
                <div className="inline-block px-3 py-1 bg-red-200/80 rounded font-mono text-xs text-red-900 font-bold mt-1">
                  Intent {state.attempts} registrat (−10 punts)
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleRetryIncorrect}
                  className="flex-1 py-3 px-4 bg-[#C99E32] hover:bg-amber-500 text-[#121E2B] font-bold font-sans rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm font-bold"
                >
                  <span>Revisar les proves seleccionades</span>
                  <span>➔</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToSuspects}
                  className="py-3 px-4 bg-[#FAF5E9] hover:bg-[#D8CCAE] border border-[#8C6D53] text-[#1D3557] font-bold font-sans rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>← Canviar de sospitós</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* PANTALLA 6: RESULTAT CORRECTE (BERNAT ACUSAT AMB ÈXIT) */}
          {state.currentScreen === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-xl text-emerald-950 shadow-inner">
                <div className="flex items-center gap-2 text-base sm:text-lg font-bold font-serif text-emerald-900 mb-1">
                  <span>✓</span>
                  <span>Acusació Demostrada: Bernat Mestre d'Escola és el Traïdor!</span>
                </div>
                <p className="text-xs sm:text-sm font-sans text-emerald-800 leading-relaxed">
                  Totes les proves coincideixen: el paper d'àncora, el segell notarial, la llum a l'escola a deshores i la seva capacitat d'escriure la carta dirigida a Vic.
                </p>
              </div>

              {/* El Motiu de la Traïció */}
              <div className="p-4 bg-[#FAF5E9] border border-[#8C6D53] rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53]">
                  Confessió i Motiu de la Traïció
                </span>
                <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed">
                  En Jaume, el fill únic d'en Bernat, està empresonat pel Virrei a la guarnició de Vic. El capità reial li va prometre l'indult i la llibertat a canvi dels noms de tots els conjurats de la Guixa.
                </p>
              </div>

              {/* Elements desbloquejats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1D3557]">
                    🔑 Ubicació de la Clau
                  </span>
                  <p className="text-xs text-[#5C4533] mt-1 font-sans">
                    Mossèn Ramon va aconseguir llençar la clau a la foscor, entre el Pla de Masset i el porxo de la Rectoria, abans de quedar inconscient. Busqueu-la abans que l'Emissari la trobi!
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#1D3557]">
                    📜 La Rima del Codi
                  </span>
                  <p className="text-xs text-[#5C4533] mt-1 font-sans">
                    «Del cim baixa l'avís, la font en dóna el secret, la terra obre el pas i la pedra tanca el destí.»
                  </p>
                </div>
              </div>

              {/* Recompensa */}
              <div className="p-3 bg-[#1D3557] text-[#FAF5E9] rounded-lg border-2 border-[#C99E32] text-center font-serif">
                <span className="text-xs font-mono uppercase text-[#C99E32] font-bold">
                  ENIGMA COMPLETAT AMB ÈXIT
                </span>
                <div className="text-xl font-bold mt-0.5">+100 Punts d'Equip</div>
              </div>

              {/* BOTÓ DE TANCAR I TORNAR AL HUB */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    clearActiveGame()
                    router.push('/joc')
                  }}
                  className="w-full py-3.5 px-4 bg-[#1D3557] hover:bg-[#2B4C7E] text-white font-bold font-sans rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>✕</span>
                  <span>Tancar i Tornar al Menú</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackFromResults}
                  className="w-full py-2 px-3 text-[#8C6D53] hover:text-[#5C4533] font-medium font-sans text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                >
                  <span>← Revisar o modificar l'acusació</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
