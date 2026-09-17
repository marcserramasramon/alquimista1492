'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, shakeVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeTab: 'coartada' | 'pistes' | 'personatges' | 'mapa'
  selectedSuspects: string[] // Ex: ['joan', 'pere']
  textAnswer: string
  attempts: number
  solved: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

interface HexNode {
  id: number
  cx: number
  cy: number
  name: string
  subtitle: string
  icon: string
  character?: { id: string; name: string; role: string; time?: string }
  type: 'cami' | 'edifici' | 'farga' | 'lloc' | 'prohibit'
}

const HEX_RADIUS = 38

// Xarxa hexagonal 4x4
const HEX_GRID: Record<number, HexNode> = {
  1: { id: 1, cx: 65, cy: 50, name: 'Camí de Vic', subtitle: 'Nord', icon: '🛤️', type: 'cami' },
  2: { id: 2, cx: 145, cy: 50, name: 'Molí Fariner', subtitle: 'Pere del Molí', icon: '⚙️', type: 'edifici', character: { id: 'pere', name: 'Pere del Molí', role: 'Moliner', time: '22:40' } },
  3: { id: 3, cx: 225, cy: 50, name: 'La Farga', subtitle: 'Destí 23:00', icon: '⚒️', type: 'farga', character: { id: 'isidre', name: 'Isidre (Forja)', role: 'Ferrer', time: '23:00' } },
  4: { id: 4, cx: 305, cy: 50, name: 'Bosc Espès', subtitle: 'Vedat', icon: '🌲', type: 'prohibit' },

  5: { id: 5, cx: 105, cy: 120, name: 'Hostal del Sol', subtitle: 'Marianna', icon: '🏠', type: 'edifici', character: { id: 'marianna', name: 'Marianna', role: 'Hostalera' } },
  6: { id: 6, cx: 185, cy: 120, name: 'Pou Comunal', subtitle: 'Carrer Gran', icon: '🪣', type: 'lloc' },
  7: { id: 7, cx: 265, cy: 120, name: "L'Era", subtitle: 'Espai obert', icon: '🌾', type: 'lloc' },
  8: { id: 8, cx: 345, cy: 120, name: 'Bosc Fosc', subtitle: 'Vedat', icon: '🌲', type: 'prohibit' },

  9: { id: 9, cx: 65, cy: 190, name: "L'Escola", subtitle: 'Aula de Bernat', icon: '📚', type: 'edifici' },
  10: { id: 10, cx: 145, cy: 190, name: 'La Rectoria', subtitle: 'Església', icon: '⛪', type: 'edifici' },
  11: { id: 11, cx: 225, cy: 190, name: 'Hort de Feixes', subtitle: 'Conreus', icon: '🥬', type: 'lloc' },
  12: { id: 12, cx: 305, cy: 190, name: 'Font del Torrent', subtitle: 'Aigua', icon: '💧', type: 'lloc' },

  13: { id: 13, cx: 105, cy: 260, name: 'Cementiri Vell', subtitle: 'Prohibit', icon: '🪦', type: 'prohibit' },
  14: { id: 14, cx: 185, cy: 260, name: 'Plaça Major', subtitle: 'Sortida 22:00', icon: '🏛️', type: 'lloc' },
  15: { id: 15, cx: 265, cy: 260, name: 'El Paller', subtitle: 'Joan el traginer', icon: '🛖', type: 'lloc', character: { id: 'joan', name: 'Joan el traginer', role: 'Traginer', time: '22:20' } },
  16: { id: 16, cx: 345, cy: 260, name: 'Riera Brava', subtitle: 'Gual d’aigua', icon: '🌊', type: 'prohibit' },
}

function getHexPolygon(cx: number, cy: number, r: number = HEX_RADIUS): string {
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`)
  }
  return points.join(' ')
}

export function PlaneBonesGame(props: GameProps) {
  const { play } = useAudio()
  const [state, setState] = useState<GameState>(() => {
    const saved =
      props.sharedState && typeof props.sharedState === 'object'
        ? (props.sharedState as Partial<GameState>)
        : {}

    return {
      activeTab: saved.activeTab || 'coartada',
      selectedSuspects: Array.isArray(saved.selectedSuspects) ? saved.selectedSuspects : [],
      textAnswer: saved.textAnswer || '',
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      lastFeedback: null,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const toggleSuspect = (suspectId: string) => {
    setState(prev => {
      const exists = prev.selectedSuspects.includes(suspectId)
      let updated: string[]
      if (exists) {
        updated = prev.selectedSuspects.filter(s => s !== suspectId)
      } else {
        if (prev.selectedSuspects.length >= 2) {
          updated = [prev.selectedSuspects[1], suspectId]
        } else {
          updated = [...prev.selectedSuspects, suspectId]
        }
      }

      const namesMap: Record<string, string> = {
        joan: 'Joan el traginer',
        pere: 'Pere del Molí',
        marianna: "Marianna de l'Hostal",
      }
      const newText = updated.map(id => namesMap[id] || id).join(' i ')

      return {
        ...prev,
        selectedSuspects: updated,
        textAnswer: newText,
        lastFeedback: null,
      }
    })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const raw = state.textAnswer.toUpperCase().trim()
    const clean = raw.replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    const compact = clean.replace(/\s+/g, '')

    // La solució correcta és visitar en Joan i en Pere
    const hasJoan = clean.includes('JOAN') || state.selectedSuspects.includes('joan')
    const hasPere = clean.includes('PERE') || state.selectedSuspects.includes('pere')
    const hasMarianna = clean.includes('MARIANNA') || clean.includes('HOSTAL') || state.selectedSuspects.includes('marianna')

    const isCorrect = (hasJoan && hasPere && !hasMarianna) || clean.includes('FARGA')

    if (!isCorrect) {
      play('buzzer')
      let hintMsg = "Resposta incorrecta. Revisa bé les 5 pistes per determinar quins 2 personatges va visitar abans de les 23:00."
      if (hasMarianna) {
        hintMsg = "Recorda la Pista 2: La patrulla era davant de l'Hostal abans de les 22:30, per tant el ferrer no va poder parlar amb Marianna."
      }
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastFeedback: {
          type: 'error',
          message: hintMsg,
        },
      }))
      return
    }

    play('evidence-unlock')
    setState(prev => ({
      ...prev,
      solved: true,
      lastFeedback: {
        type: 'success',
        message: 'Coartada corroborada! Isidre va visitar en Joan al paller i en Pere al molí abans d’arribar a la Farga a les 23:00.',
      },
    }))

    try {
      await props.submit({
        suspects: ['joan', 'pere'],
        answer: 'JOAN I PERE',
        destination: 'FARGA',
        time: '23:00',
      })
    } catch (err) {
      console.error('Error enviant resolució:', err)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-8 font-serif">
      {/* CAPÇALERA HISTÒRICA */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 3 · PLANES BONES
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          PLANES BONES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "La Coartada del Ferrer i els Testimonis de la Nit"
        </p>
      </header>

      {/* PESTANYES D'INVESTIGACIÓ */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden">
        {/* Barra superior de pestanyes */}
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex flex-wrap">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'coartada' }))}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'coartada'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>📜</span>
            <span>La Coartada</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'pistes' }))}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'pistes'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>🔍</span>
            <span>Les 5 Pistes</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'personatges' }))}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'personatges'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>👥</span>
            <span>Els 3 Veïns</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'mapa' }))}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'mapa'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>🗺️</span>
            <span>Mapa Hexagonal</span>
          </button>
        </div>

        {/* Contingut de les pestanyes */}
        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {/* PESTANYA 1: LA COARTADA */}
            {state.activeTab === 'coartada' && (
              <motion.div
                key="coartada"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#2B2118]"
              >
                <div className="p-3.5 bg-[#F4EBD9] border-l-4 border-[#8C6D53] rounded-r shadow-inner">
                  <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif mb-1">
                    La Declaració d'Isidre el Ferrer
                  </h3>
                  <p>
                    «La nit del 15 de maig no vaig escriure cap carta ni vaig trair ningú. Vaig sortir de la <strong>Plaça a les 22:00</strong> per anar cap a <strong>La Farga</strong> a treballar. Pel camí em vaig aturar a parlar i recollir encàrrecs amb <strong>dos veïns del poble</strong>, i vaig arribar a la farga a les <strong>23:00 en punt</strong>, on un pagès i la patrulla armada em van veure forjant eines.»
                  </p>
                </div>

                <div className="space-y-2 text-[#4A3728]">
                  <p>
                    Hi ha <strong>tres veïns</strong> que eren als seus llocs aquella nit: en <strong>Pere del Molí</strong>, en <strong>Joan el traginer</strong> i la <strong>Marianna de l'Hostal</strong>.
                  </p>
                  <p>
                    Però Isidre només va tenir temps de passar per <strong>dos d'ells</strong> abans de les 23:00. Si descobrim exactament quins dos personatges va visitar gràcies a les 5 pistes, la seva coartada quedarà demostrada... o desmuntada per sempre!
                  </p>
                </div>

                <div className="bg-[#DFD4BC]/70 p-3 rounded border border-[#8C6D53]/40 flex items-start gap-2.5 text-xs text-[#5C4533] font-sans">
                  <span className="text-lg">💡</span>
                  <div>
                    <strong>Objectiu:</strong> Consulta la pestanya <em>Les 5 Pistes</em> per deduir quins 2 personatges va visitar i descartar el tercer.
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 2: LES 5 PISTES */}
            {state.activeTab === 'pistes' && (
              <motion.div
                key="pistes"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="border-b border-[#8C6D53]/40 pb-2 flex justify-between items-center">
                  <h3 className="text-sm sm:text-base font-bold text-[#1D3557] font-serif">
                    Els 5 Testimonis i Deduccions Lògiques
                  </h3>
                  <span className="text-xs text-[#8C6D53] font-mono">Nit del 15 de Maig</span>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm font-sans">
                  {/* Pista 1 */}
                  <div className="p-3 bg-[#FAF5E9] rounded-lg border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1.5 mb-0.5">
                      <span className="w-5 h-5 rounded-full bg-[#D8CCAE] text-[#1D3557] flex items-center justify-center text-xs font-mono">1</span>
                      <span>Cadència del Camí (Horaris)</span>
                    </div>
                    <p className="text-[#4A3728] pl-6.5">
                      El ferrer va sortir de la Plaça Major a les <strong>22:00 en punt</strong>. Cada tram de camí pel poble d'un punt al següent li costa exactament <strong>20 minuts</strong> (22:00 ➔ 22:20 ➔ 22:40 ➔ 23:00 a La Farga).
                    </p>
                  </div>

                  {/* Pista 2 */}
                  <div className="p-3 bg-[#FAF5E9] rounded-lg border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1.5 mb-0.5">
                      <span className="w-5 h-5 rounded-full bg-[#D8CCAE] text-[#1D3557] flex items-center justify-center text-xs font-mono">2</span>
                      <span>La Ronda davant de l'Hostal</span>
                    </div>
                    <p className="text-[#4A3728] pl-6.5">
                      La patrulla armada va vigilar la porta de l'Hostal entre les 22:15 i les 22:30. Si el ferrer hagués anat a l'Hostal amb la Marianna, l'haurien interceptat allà mateix, cosa que mai va passar.
                    </p>
                  </div>

                  {/* Pista 3 */}
                  <div className="p-3 bg-[#FAF5E9] rounded-lg border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1.5 mb-0.5">
                      <span className="w-5 h-5 rounded-full bg-[#D8CCAE] text-[#1D3557] flex items-center justify-center text-xs font-mono">3</span>
                      <span>Testimoni del Traginer</span>
                    </div>
                    <p className="text-[#4A3728] pl-6.5">
                      En <strong>Joan el traginer</strong> confirma que va rebre el ferrer al Paller just en sentir sonar el primer quart d'onze (<strong>22:20</strong>), quan enllestia les selles de les mules.
                    </p>
                  </div>

                  {/* Pista 4 */}
                  <div className="p-3 bg-[#FAF5E9] rounded-lg border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1.5 mb-0.5">
                      <span className="w-5 h-5 rounded-full bg-[#D8CCAE] text-[#1D3557] flex items-center justify-center text-xs font-mono">4</span>
                      <span>Ordre de les Visites</span>
                    </div>
                    <p className="text-[#4A3728] pl-6.5">
                      El ferrer va passar pel Molí <strong>després</strong> de visitar el Paller (mai abans), ja que necessitava el comprovant que en Joan li havia lliurat al paller.
                    </p>
                  </div>

                  {/* Pista 5 */}
                  <div className="p-3 bg-[#FAF5E9] rounded-lg border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1.5 mb-0.5">
                      <span className="w-5 h-5 rounded-full bg-[#D8CCAE] text-[#1D3557] flex items-center justify-center text-xs font-mono">5</span>
                      <span>La Confirmació del Moliner</span>
                    </div>
                    <p className="text-[#4A3728] pl-6.5">
                      A les <strong>22:40</strong> en <strong>Pere del Molí</strong> va acomiadar el ferrer després de donar-li les peces de ferro esmolades, i el va veure marxar directe cap a La Farga, on va arribar just a les <strong>23:00</strong>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 3: ELS 3 VEÏNS */}
            {state.activeTab === 'personatges' && (
              <motion.div
                key="personatges"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="border-b border-[#8C6D53]/40 pb-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#1D3557] font-serif">
                    Els 3 Personatges de la Ruta
                  </h3>
                  <p className="text-xs text-[#5C4533] font-sans">
                    Fes clic sobre un personatge per seleccionar-lo com a part de la coartada:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Joan */}
                  <div
                    onClick={() => toggleSuspect('joan')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      state.selectedSuspects.includes('joan')
                        ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-400'
                        : 'bg-[#FAF5E9] border-[#8C6D53]/40 hover:bg-[#EAE0CA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🛖</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-sans font-bold ${
                          state.selectedSuspects.includes('joan')
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#D8CCAE] text-[#1D3557]'
                        }`}
                      >
                        {state.selectedSuspects.includes('joan') ? '✓ Seleccionat' : '+ Triar'}
                      </span>
                    </div>
                    <div className="font-bold text-[#2B2118] font-serif mt-2">Joan el traginer</div>
                    <div className="text-[11px] text-[#5C4533] font-sans">Lloc: El Paller</div>
                    <p className="text-xs text-[#4A3728] mt-2 font-sans">
                      Afirma haver vist el ferrer a les <strong>22:20</strong> amb el sac de claus.
                    </p>
                  </div>

                  {/* Pere */}
                  <div
                    onClick={() => toggleSuspect('pere')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      state.selectedSuspects.includes('pere')
                        ? 'bg-emerald-50 border-emerald-600 shadow-md ring-2 ring-emerald-400'
                        : 'bg-[#FAF5E9] border-[#8C6D53]/40 hover:bg-[#EAE0CA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">⚙️</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-sans font-bold ${
                          state.selectedSuspects.includes('pere')
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#D8CCAE] text-[#1D3557]'
                        }`}
                      >
                        {state.selectedSuspects.includes('pere') ? '✓ Seleccionat' : '+ Triar'}
                      </span>
                    </div>
                    <div className="font-bold text-[#2B2118] font-serif mt-2">Pere del Molí</div>
                    <div className="text-[11px] text-[#5C4533] font-sans">Lloc: Molí Fariner</div>
                    <p className="text-xs text-[#4A3728] mt-2 font-sans">
                      Treballava de nit al molí. Va atendre el ferrer a les <strong>22:40</strong>.
                    </p>
                  </div>

                  {/* Marianna */}
                  <div
                    onClick={() => toggleSuspect('marianna')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      state.selectedSuspects.includes('marianna')
                        ? 'bg-red-50 border-red-500 shadow-md ring-2 ring-red-300'
                        : 'bg-[#FAF5E9] border-[#8C6D53]/40 hover:bg-[#EAE0CA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🏠</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-sans font-bold ${
                          state.selectedSuspects.includes('marianna')
                            ? 'bg-red-700 text-white'
                            : 'bg-[#D8CCAE] text-[#1D3557]'
                        }`}
                      >
                        {state.selectedSuspects.includes('marianna') ? 'Triat' : '+ Triar'}
                      </span>
                    </div>
                    <div className="font-bold text-[#2B2118] font-serif mt-2">Marianna de l'Hostal</div>
                    <div className="text-[11px] text-[#5C4533] font-sans">Lloc: Hostal del Sol</div>
                    <p className="text-xs text-[#4A3728] mt-2 font-sans">
                      Tancava la taverna. La patrulla armada va vigilar la seva porta fins a les 22:30.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 4: MAPA HEXAGONAL */}
            {state.activeTab === 'mapa' && (
              <motion.div
                key="mapa"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-[#1D3557] font-serif">
                    Plànol Hexagonal de la Ruta
                  </h3>
                  <span className="text-xs text-[#5C4533] font-sans">Terme de la Guixa (1705)</span>
                </div>

                <div className="w-full overflow-x-auto flex justify-center bg-[#152332] p-3 rounded-xl border-2 border-[#8C6D53] shadow-inner relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0B131D] to-[#1E1710] opacity-90 pointer-events-none rounded-xl" />

                  <svg viewBox="0 0 410 320" className="w-full max-w-[420px] h-auto relative z-10 select-none">
                    {Object.values(HEX_GRID).map(node => {
                      const isFarga = node.id === 3
                      const isPlaca = node.id === 14
                      const isPaller = node.id === 15
                      const isMoli = node.id === 2
                      const isHostal = node.id === 5
                      const isForbidden = node.type === 'prohibit'

                      let fillColor = '#2A3B4E'
                      let strokeColor = '#8C6D53'
                      let strokeWidth = 1.5

                      if (isForbidden) {
                        fillColor = '#3A2022'
                        strokeColor = '#7F1D1D'
                      } else if (isFarga) {
                        fillColor = '#854D0E'
                        strokeColor = '#F59E0B'
                        strokeWidth = 3
                      } else if (isPlaca) {
                        fillColor = '#1D3557'
                        strokeColor = '#93C5FD'
                        strokeWidth = 2.5
                      } else if (isPaller || isMoli) {
                        fillColor = '#166534'
                        strokeColor = '#4ADE80'
                        strokeWidth = 2.5
                      } else if (isHostal) {
                        fillColor = '#374151'
                        strokeColor = '#9CA3AF'
                      }

                      return (
                        <g key={node.id} className="transition-all">
                          <polygon
                            points={getHexPolygon(node.cx, node.cy)}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            className="filter drop-shadow-sm"
                          />

                          <text x={node.cx} y={node.cy - 7} textAnchor="middle" fontSize="16">
                            {node.icon}
                          </text>

                          <text x={node.cx} y={node.cy + 11} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#F4EBD9" fontFamily="sans-serif">
                            {node.name}
                          </text>

                          {node.character?.time && (
                            <text x={node.cx} y={node.cy + 22} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FBBF24" fontFamily="monospace">
                              {node.character.time}
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Llegenda */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#4A3728] font-sans bg-[#FAF5E9] p-2.5 rounded-lg border border-[#8C6D53]/40 gap-2">
                  <span>🏛️ <strong>22:00:</strong> Plaça Major (Inici)</span>
                  <span>🛖 <strong>22:20:</strong> El Paller (Joan)</span>
                  <span>⚙️ <strong>22:40:</strong> Molí Fariner (Pere)</span>
                  <span>⚒️ <strong>23:00:</strong> La Farga (Isidre)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FORMULARI DE VALIDACIÓ I DEDUCCIÓ */}
      <section className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-5 shadow-md">
        {!state.solved ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#2B2118] font-serif mb-1">
                Quins dos personatges va visitar Isidre el ferrer abans d'arribar a La Farga a les 23:00?
              </label>
              <p className="text-xs text-[#5C4533] font-sans">
                Tria els dos veïns a la pestanya o escriu els seus noms per verificar la coartada:
              </p>
            </div>

            {/* Selectors ràpids dels 3 veïns */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => toggleSuspect('joan')}
                className={`py-2 px-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                  state.selectedSuspects.includes('joan')
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow ring-2 ring-emerald-400'
                    : 'bg-[#FAF5E9] text-[#2B2118] border-[#8C6D53]/40 hover:bg-[#EAE0CA]'
                }`}
              >
                🛖 Joan el traginer
              </button>

              <button
                type="button"
                onClick={() => toggleSuspect('pere')}
                className={`py-2 px-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                  state.selectedSuspects.includes('pere')
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow ring-2 ring-emerald-400'
                    : 'bg-[#FAF5E9] text-[#2B2118] border-[#8C6D53]/40 hover:bg-[#EAE0CA]'
                }`}
              >
                ⚙️ Pere del Molí
              </button>

              <button
                type="button"
                onClick={() => toggleSuspect('marianna')}
                className={`py-2 px-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                  state.selectedSuspects.includes('marianna')
                    ? 'bg-red-700 text-white border-red-800 shadow ring-2 ring-red-400'
                    : 'bg-[#FAF5E9] text-[#2B2118] border-[#8C6D53]/40 hover:bg-[#EAE0CA]'
                }`}
              >
                🏠 Marianna de l'Hostal
              </button>
            </div>

            <motion.div
              animate={state.lastFeedback?.type === 'error' ? 'shake' : 'initial'}
              variants={shakeVariants}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={state.textAnswer}
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    textAnswer: e.target.value,
                    lastFeedback: null,
                  }))
                }
                className="flex-1 p-3 border-2 border-[#8C6D53] rounded-lg bg-[#FAF5E9] text-[#1D3557] font-mono font-bold text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner"
              />

              <button
                type="submit"
                disabled={!state.textAnswer.trim()}
                className="py-3 px-6 bg-[#C99E32] hover:bg-amber-500 disabled:opacity-50 text-[#121E2B] font-bold font-sans rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Validar Coartada</span>
                <span>➔</span>
              </button>
            </motion.div>

            {state.lastFeedback && state.lastFeedback.type === 'error' && (
              <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 rounded text-xs font-sans flex items-center gap-2">
                <span>⚠️</span>
                <span>{state.lastFeedback.message}</span>
              </div>
            )}
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
                <span>Coartada Verificada: En Joan i en Pere confirmen el pas d'Isidre!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 leading-relaxed">
                La línia temporal quadra al mil·límetre: Plaça Major (22:00) ➔ Joan al Paller (22:20) ➔ Pere al Molí (22:40) ➔ Arribada a La Farga a les 23:00 hores.
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
                  Ruta de la Coartada del Ferrer
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  Els dos veïns corroboren que Isidre feia camí cap al seu taller. La patrulla el va veure a la forja a les 23:00.
                </p>
              </div>

              {/* Sospitós Descartat */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                  🚫 Sospitós Descartat
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2B2118] mt-0.5">
                  Isidre el Ferrer
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  Té coartada irrefutable i verificada. Queda <strong>100% descartat</strong> com a traïdor.
                </p>
              </div>
            </div>

            {/* XIFRA DE L'ELEMENT TERRA */}
            <div className="p-3.5 bg-[#1D3557] text-[#FAF5E9] rounded-lg border-2 border-[#C99E32] shadow text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C99E32]">
                XIFRA DE L'ELEMENT DESCOBERTA
              </div>
              <div className="text-xl sm:text-2xl font-bold font-serif mt-0.5">
                🌍 TERRA = 3
              </div>
              <div className="text-[11px] text-[#FAF5E9]/80 font-sans mt-0.5">
                Anota aquesta xifra al teu quadern d'equip!
              </div>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  )
}
