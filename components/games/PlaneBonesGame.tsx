'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, shakeVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeTab: 'historia' | 'regles' | 'mapa' | 'joc'
  currentTurn: number // 0: 22:00, 1: 22:15, 2: 22:30, 3: 22:45, 4: 23:00
  playerHex: number
  playerPath: number[]
  attempts: number
  solved: boolean
  isAlerted: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

interface HexNode {
  id: number
  cx: number
  cy: number
  name: string
  subtitle: string
  icon: string
  type: 'cami' | 'edifici' | 'farga' | 'escola' | 'lloc' | 'prohibit'
  neighbors: number[]
}

const HEX_RADIUS = 38

// Definició matemàtica dels 16 hexàgons en relleu cartogràfic
const HEX_GRID: Record<number, HexNode> = {
  // Fila 0
  1: { id: 1, cx: 65, cy: 50, name: 'Camí de Vic', subtitle: 'Sortida Nord', icon: '🛤️', type: 'cami', neighbors: [2, 5] },
  2: { id: 2, cx: 145, cy: 50, name: 'Molí Fariner', subtitle: 'Rec del molí', icon: '⚙️', type: 'edifici', neighbors: [1, 3, 5, 6] },
  3: { id: 3, cx: 225, cy: 50, name: 'La Farga', subtitle: 'Taller d’Isidre', icon: '⚒️', type: 'farga', neighbors: [2, 4, 6, 7] },
  4: { id: 4, cx: 305, cy: 50, name: 'Bosc Espès', subtitle: 'Camí tancat', icon: '🌲', type: 'prohibit', neighbors: [3, 7, 8] },

  // Fila 1 (desplaçada +40px)
  5: { id: 5, cx: 105, cy: 120, name: 'Hostal del Sol', subtitle: 'Parada de traginers', icon: '🏠', type: 'edifici', neighbors: [1, 2, 6, 9, 10] },
  6: { id: 6, cx: 185, cy: 120, name: 'Pou Comunal', subtitle: 'Cruïlla central', icon: '🪣', type: 'lloc', neighbors: [2, 3, 5, 7, 10, 11] },
  7: { id: 7, cx: 265, cy: 120, name: "L'Era Gran", subtitle: 'Espai obert', icon: '🌾', type: 'lloc', neighbors: [3, 4, 6, 8, 11, 12] },
  8: { id: 8, cx: 345, cy: 120, name: 'Bosc Fosc', subtitle: 'Intransitable', icon: '🌲', type: 'prohibit', neighbors: [4, 7, 12] },

  // Fila 2
  9: { id: 9, cx: 65, cy: 190, name: "L'Escola", subtitle: 'Aula de Bernat', icon: '📚', type: 'escola', neighbors: [5, 10, 13] },
  10: { id: 10, cx: 145, cy: 190, name: 'La Rectoria', subtitle: 'Casa rectoral', icon: '⛪', type: 'edifici', neighbors: [5, 6, 9, 11, 13, 14] },
  11: { id: 11, cx: 225, cy: 190, name: 'Hort de Feixes', subtitle: 'Conreus', icon: '🥬', type: 'lloc', neighbors: [6, 7, 10, 12, 14, 15] },
  12: { id: 12, cx: 305, cy: 190, name: 'Font del Torrent', subtitle: 'Aigua fresca', icon: '💧', type: 'lloc', neighbors: [7, 8, 11, 15, 16] },

  // Fila 3 (desplaçada +40px)
  13: { id: 13, cx: 105, cy: 260, name: 'Cementiri Vell', subtitle: 'Sagrat (Prohibit)', icon: '🪦', type: 'prohibit', neighbors: [9, 10, 14] },
  14: { id: 14, cx: 185, cy: 260, name: 'Plaça Major', subtitle: 'Inici patrulla', icon: '🏛️', type: 'lloc', neighbors: [10, 11, 13, 15] },
  15: { id: 15, cx: 265, cy: 260, name: 'El Paller', subtitle: 'Inici de Joan', icon: '🛖', type: 'lloc', neighbors: [11, 12, 14, 16] },
  16: { id: 16, cx: 345, cy: 260, name: 'Riera Brava', subtitle: 'Gual perillós', icon: '🌊', type: 'prohibit', neighbors: [12, 15] },
}

// Història i posicions a cada torn (22:00 a 23:00)
interface TurnStory {
  time: string
  patrolHex: number
  shadowHex: number | null // L'ombra misteriosa (Bernat)
  schoolLit: boolean
  forgeLit: boolean
  narrativeText: string
}

const TURNS: TurnStory[] = [
  {
    time: '22:00',
    patrolHex: 14, // Plaça Major
    shadowHex: null, // Encara és a dins l'escola
    schoolLit: true, // Llum encès a l'escola
    forgeLit: true, // Foc a la farga
    narrativeText:
      'La patrulla comença la ronda a la Plaça amb les torxes. S’albira un llum encès a l’Escola. A la Farga es veu el foc de la forja.',
  },
  {
    time: '22:15',
    patrolHex: 10, // La Rectoria
    shadowHex: null,
    schoolLit: true,
    forgeLit: true,
    narrativeText:
      'La patrulla puja cap a la Rectoria. El llum de l’escola continua encès. Mou-te amb compte per les ombres!',
  },
  {
    time: '22:30',
    patrolHex: 6, // Pou Comunal
    shadowHex: 5, // L'ombra surt de l'escola cap a l'Hostal!
    schoolLit: false, // S'apaga el llum de l'escola
    forgeLit: true,
    narrativeText:
      'ALERTA! S’apaga el llum de l’escola i una silueta amb capa surt d’amagat cap a l’Hostal aprofitant que la guàrdia és al Pou!',
  },
  {
    time: '22:45',
    patrolHex: 2, // Molí Fariner
    shadowHex: 1, // L'ombra fuig cap al Camí de Vic
    schoolLit: false,
    forgeLit: true,
    narrativeText:
      'La patrulla vigila el rec del Molí. La silueta encaputxada corre cap al Camí de Vic amb un pergamí sota el braç!',
  },
  {
    time: '23:00',
    patrolHex: 3, // La Farga
    shadowHex: null, // Ha escapat pel bosc
    schoolLit: false,
    forgeLit: true,
    narrativeText:
      'La patrulla arriba a La Farga! Trobem Isidre el ferrer martellejant ferro roent davant de la forja. Té coartada indiscutible!',
  },
]

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
      activeTab: saved.activeTab || 'historia',
      currentTurn: typeof saved.currentTurn === 'number' ? saved.currentTurn : 0,
      playerHex: typeof saved.playerHex === 'number' ? saved.playerHex : 15, // Inici al Paller
      playerPath: saved.playerPath && saved.playerPath.length > 0 ? saved.playerPath : [15],
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      isAlerted: false,
      lastFeedback: null,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const currentStory = TURNS[state.currentTurn]

  const handleHexClick = (hexId: number) => {
    if (state.solved) return
    const target = HEX_GRID[hexId]
    if (!target) return

    if (target.type === 'prohibit') {
      play('buzzer')
      setState(prev => ({
        ...prev,
        lastFeedback: {
          type: 'error',
          message: `Zona prohibida: No pots entrar a ${target.name} (terreny perillós o vetat).`,
        },
      }))
      return
    }

    // Comprovar si és adjacent a la posició actual del jugador
    const currentHex = HEX_GRID[state.playerHex]
    if (!currentHex.neighbors.includes(hexId) && hexId !== state.playerHex) {
      play('buzzer')
      setState(prev => ({
        ...prev,
        lastFeedback: {
          type: 'error',
          message: 'Només pots moure’t a hexàgons adjacents a la teva posició.',
        },
      }))
      return
    }

    // Avançar de torn
    const nextTurn = state.currentTurn + 1
    if (nextTurn >= TURNS.length) {
      // Ja s'ha completat la ronda de les 23:00
      return
    }

    const nextStory = TURNS[nextTurn]
    // Comprovar si entra directament a la casella de la patrulla
    const isCaught = hexId === nextStory.patrolHex

    if (isCaught) {
      play('buzzer')
      setState(prev => ({
        ...prev,
        isAlerted: true,
        lastFeedback: {
          type: 'error',
          message: `ALERTA! La torxa de la patrulla t'ha enxampat a ${target.name}! Prem Desfer o Reiniciar per tornar a intentar-ho.`,
        },
      }))
      return
    }

    const nextPath = [...state.playerPath, hexId]
    const isFinalTurn = nextTurn === 4

    setState(prev => ({
      ...prev,
      currentTurn: nextTurn,
      playerHex: hexId,
      playerPath: nextPath,
      isAlerted: false,
      lastFeedback: null,
    }))

    // Si arriba amb èxit al torn 4 (23:00) sense ser enxampat
    if (isFinalTurn) {
      handleSuccessfulInfiltration(hexId, nextPath)
    }
  }

  const handleSuccessfulInfiltration = async (finalHex: number, path: number[]) => {
    play('evidence-unlock')
    setState(prev => ({
      ...prev,
      solved: true,
      lastFeedback: {
        type: 'success',
        message: 'Missió de sigil completada! Has presenciat els esdeveniments de la nit del 15 de maig.',
      },
    }))

    try {
      await props.submit({
        location: 'FARGA',
        destination: 'FARGA',
        visitedCells: path,
        totalMinutes: 60,
        answer: 'FARGA',
      })
    } catch (err) {
      console.error('Error enviant resolució:', err)
    }
  }

  const handleUndo = () => {
    if (state.playerPath.length <= 1) return
    const prevPath = state.playerPath.slice(0, -1)
    const prevHex = prevPath[prevPath.length - 1]
    const prevTurn = prevPath.length - 1

    setState(prev => ({
      ...prev,
      currentTurn: prevTurn,
      playerHex: prevHex,
      playerPath: prevPath,
      isAlerted: false,
      lastFeedback: null,
    }))
  }

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      currentTurn: 0,
      playerHex: 15,
      playerPath: [15],
      isAlerted: false,
      lastFeedback: null,
    }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-8 font-serif">
      {/* CAPÇALERA HISTÒRICA */}
      <header className="text-center py-4 px-3 bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl shadow-md">
        <div className="inline-block px-3 py-0.5 mb-1.5 text-xs font-mono tracking-widest text-[#1D3557] bg-[#D8CCAE] rounded-full border border-[#8C6D53]/40">
          ESTACIÓ III · EL SIGIL DE PLANES BONES
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2118] tracking-wide">
          PLANES BONES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] italic mt-0.5">
          La Ronda de Nit, l'Ombra del Delator i la Forja del Ferrer
        </p>
      </header>

      {/* PESTANYES D'INVESTIGACIÓ */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden">
        {/* Barra superior de pestanyes */}
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex flex-wrap">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'historia' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'historia'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>📜</span>
            <span>La Ronda de Nit</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'regles' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'regles'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>🧭</span>
            <span>Regles de Sigil</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'mapa' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'mapa'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>🗺️</span>
            <span>Plànol del Terme</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'joc' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'joc'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>👣</span>
            <span>Joc Hexagonal</span>
          </button>
        </div>

        {/* Contingut de les pestanyes */}
        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {/* PESTANYA 1: HISTÒRIA */}
            {state.activeTab === 'historia' && (
              <motion.div
                key="historia"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#2B2118]"
              >
                <div className="p-3.5 bg-[#F4EBD9] border-l-4 border-[#8C6D53] rounded-r shadow-inner">
                  <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif mb-1">
                    La Nit del 15 de Maig: Què va passar realment?
                  </h3>
                  <p>
                    Mentre la majoria del poble dormia, tres fets van transcórrer a la Guixa la mateixa nit de la carta traïdora:
                  </p>
                </div>

                <ul className="space-y-2.5 text-[#4A3728]">
                  <li className="flex items-start gap-2">
                    <span className="text-base">🏮</span>
                    <div>
                      <strong>La Patrulla del Sometent:</strong> Surt de la Plaça Major a les <strong>22:00</strong> armada amb torxes fent la ronda per prevenir aldarulls.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-base">🕯️</span>
                    <div>
                      <strong>El Misteri de l'Escola:</strong> A les 22:00 hi ha un llum estrany a la finestra de l'aula del mestre Bernat... i a les 22:30 una figura amb capa s'escapa per l'ombra!
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-base">⚒️</span>
                    <div>
                      <strong>La Forja d'Isidre:</strong> El ferrer al·lega que a les 23:00 en punt era a la Farga forjant eines. Si la patrulla el va veure, tindrà una coartada indestructible.
                    </div>
                  </li>
                </ul>

                <div className="bg-[#DFD4BC]/70 p-3 rounded border border-[#8C6D53]/40 flex items-start gap-2.5 text-xs text-[#5C4533] font-sans">
                  <span className="text-lg">💡</span>
                  <div>
                    <strong>El teu paper:</strong> Ets en <strong>Joan el traginer</strong>, observant des del paller. Has de moure't d'amagat pel mapa hexagonal seguint els esdeveniments de la nit sense ser vist per la patrulla!
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 2: REGLES */}
            {state.activeTab === 'regles' && (
              <motion.div
                key="regles"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-lg p-4 sm:p-5 shadow-inner">
                  <div className="text-center pb-3 border-b border-[#8C6D53]/40 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6D53]">
                      Instruccions de Moviment i Sigil
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1D3557] font-serif">
                      Com Jugar al Mapa Hexagonal
                    </h3>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#4A3728] font-sans">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">1.</span>
                      <span><strong>Inici al Paller (22:00):</strong> Comences amagat al Paller. A cada torn de 15 minuts pots clicar a un hexàgon adjacent per avançar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">2.</span>
                      <span><strong>La Torxa de la Patrulla:</strong> La guàrdia porta torxes 🔥 i es mou automàticament. No entris mai al seu hexàgon en el mateix torn!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">3.</span>
                      <span><strong>Zones Prohibides:</strong> Bosc Espès, Bosc Fosc, Cementiri Vell i Riera Brava són intransitables.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">4.</span>
                      <span><strong>Objectiu final:</strong> Arribar a les <strong>23:00</strong> observant com la patrulla arriba a La Farga sense que t'hagin detectat.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 3: PLÀNOL */}
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
                    Llocs Clau del Terme de la Guixa
                  </h3>
                  <span className="text-xs text-[#5C4533] font-sans">Any de 1705</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                  <div className="p-2.5 bg-[#FAF5E9] rounded border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1">
                      <span>🏛️</span> <span>Plaça Major (Hex 14)</span>
                    </div>
                    <p className="text-[#5C4533] mt-0.5">Punt de trobada i sortida de la patrulla armada a les 22:00.</p>
                  </div>

                  <div className="p-2.5 bg-[#FAF5E9] rounded border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1">
                      <span>🛖</span> <span>El Paller (Hex 15)</span>
                    </div>
                    <p className="text-[#5C4533] mt-0.5">On en Joan el traginer es refugia i comença a espiar la nit.</p>
                  </div>

                  <div className="p-2.5 bg-[#FAF5E9] rounded border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1">
                      <span>📚</span> <span>L'Escola (Hex 9)</span>
                    </div>
                    <p className="text-[#5C4533] mt-0.5">Casa del mestre Bernat. Té un llum misteriós a les 22:00.</p>
                  </div>

                  <div className="p-2.5 bg-[#FAF5E9] rounded border border-[#8C6D53]/40">
                    <div className="font-bold text-[#1D3557] flex items-center gap-1">
                      <span>⚒️</span> <span>La Farga (Hex 3)</span>
                    </div>
                    <p className="text-[#5C4533] mt-0.5">Taller de ferrer on Isidre afirma que treballava a les 23:00.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 4: TAULELL HEXAGONAL INTERACTIU */}
            {state.activeTab === 'joc' && (
              <motion.div
                key="joc"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Marcador temporal i controls */}
                <div className="p-3 bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-inner">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#8C6D53]">Hora de la nit</div>
                    <div className="text-2xl font-bold font-mono text-[#1D3557] flex items-center gap-1.5">
                      <span>🕰️</span>
                      <span>{currentStory.time}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px] text-xs font-sans text-[#4A3728] bg-[#EAE0CA] p-2 rounded border border-[#8C6D53]/30">
                    <strong>Esdeveniment:</strong> {currentStory.narrativeText}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={state.playerPath.length <= 1 || state.solved}
                      className="px-2.5 py-1 text-xs font-sans font-bold bg-[#EAE0CA] hover:bg-[#D8CCAE] disabled:opacity-40 text-[#4A3728] rounded border border-[#8C6D53]/40 transition-colors"
                      title="Desfer pas"
                    >
                      ↩ Desfer
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2.5 py-1 text-xs font-sans font-bold bg-amber-200 hover:bg-amber-300 text-amber-950 rounded border border-amber-400 transition-colors"
                    >
                      ↺ Reiniciar
                    </button>
                  </div>
                </div>

                {/* TAULELL HEXAGONAL SVG */}
                <div className="w-full overflow-x-auto flex justify-center bg-[#152332] p-3 sm:p-4 rounded-xl border-2 border-[#8C6D53] shadow-xl relative">
                  {/* Fons nocturn amb textura */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0B131D] to-[#1E1710] opacity-90 pointer-events-none rounded-xl" />

                  <svg
                    viewBox="0 0 410 320"
                    className="w-full max-w-[440px] h-auto relative z-10 select-none"
                  >
                    {/* Renderitzar cada hexàgon */}
                    {Object.values(HEX_GRID).map(node => {
                      const isPatrol = currentStory.patrolHex === node.id
                      const isPlayer = state.playerHex === node.id
                      const isShadow = currentStory.shadowHex === node.id
                      const isVisitedByPlayer = state.playerPath.includes(node.id)
                      const isForbidden = node.type === 'prohibit'
                      const isReachable =
                        HEX_GRID[state.playerHex].neighbors.includes(node.id) &&
                        !isForbidden &&
                        !state.solved

                      // Colors dels hexàgons
                      let fillColor = '#2A3B4E'
                      let strokeColor = '#8C6D53'
                      let strokeWidth = 1.5

                      if (isForbidden) {
                        fillColor = '#3A2022'
                        strokeColor = '#7F1D1D'
                      } else if (isPatrol) {
                        fillColor = '#854D0E' // Llum de torxa daurada
                        strokeColor = '#F59E0B'
                        strokeWidth = 3
                      } else if (isPlayer) {
                        fillColor = '#166534' // Verd esmeralda de Joan
                        strokeColor = '#4ADE80'
                        strokeWidth = 2.5
                      } else if (isReachable) {
                        fillColor = '#2F4858'
                        strokeColor = '#C99E32'
                        strokeWidth = 2
                      } else if (isVisitedByPlayer) {
                        fillColor = '#1F3A2E'
                        strokeColor = '#22C55E'
                      }

                      return (
                        <g
                          key={node.id}
                          onClick={() => handleHexClick(node.id)}
                          className={isReachable ? 'cursor-pointer group' : isForbidden ? 'cursor-not-allowed' : ''}
                        >
                          {/* Polígon hexagonal */}
                          <polygon
                            points={getHexPolygon(node.cx, node.cy)}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            className="transition-all duration-300 filter drop-shadow-sm"
                          />

                          {/* Llum radiant si la patrulla hi és */}
                          {isPatrol && (
                            <circle
                              cx={node.cx}
                              cy={node.cy}
                              r={HEX_RADIUS + 4}
                              fill="none"
                              stroke="#FBBF24"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                              className="animate-pulse opacity-75 pointer-events-none"
                            />
                          )}

                          {/* Icona central del lloc */}
                          <text
                            x={node.cx}
                            y={node.cy - 8}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="17"
                            className="pointer-events-none"
                          >
                            {node.icon}
                          </text>

                          {/* Nom del lloc */}
                          <text
                            x={node.cx}
                            y={node.cy + 10}
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="bold"
                            fill="#F4EBD9"
                            fontFamily="sans-serif"
                            className="pointer-events-none"
                          >
                            {node.name}
                          </text>

                          {/* Indicadors de personatges sobre l'hexàgon */}
                          <g className="pointer-events-none">
                            {isPatrol && (
                              <g transform={`translate(${node.cx - 24}, ${node.cy - 26})`}>
                                <circle cx="8" cy="8" r="9" fill="#B45309" stroke="#FEF08A" strokeWidth="1.5" />
                                <text x="8" y="11" textAnchor="middle" fontSize="10">🔥</text>
                              </g>
                            )}

                            {isPlayer && (
                              <g transform={`translate(${node.cx + 10}, ${node.cy - 26})`}>
                                <circle cx="8" cy="8" r="9" fill="#15803D" stroke="#BBF7D0" strokeWidth="1.5" />
                                <text x="8" y="11" textAnchor="middle" fontSize="10">👤</text>
                              </g>
                            )}

                            {isShadow && (
                              <g transform={`translate(${node.cx}, ${node.cy - 26})`}>
                                <circle cx="0" cy="8" r="9" fill="#1E1B4B" stroke="#A5B4FC" strokeWidth="1.5" />
                                <text x="0" y="11" textAnchor="middle" fontSize="10">🦹</text>
                              </g>
                            )}

                            {/* Llum a l'escola si està encesa */}
                            {node.id === 9 && currentStory.schoolLit && (
                              <text x={node.cx + 20} y={node.cy + 18} fontSize="12">🕯️</text>
                            )}

                            {/* Foc a la farga */}
                            {node.id === 3 && currentStory.forgeLit && (
                              <text x={node.cx + 20} y={node.cy + 18} fontSize="12">✨</text>
                            )}
                          </g>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Llegenda explicativa */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#4A3728] font-sans bg-[#FAF5E9] p-2.5 rounded-lg border border-[#8C6D53]/40 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-600 border border-amber-300" />
                    <span>🔥 <strong>Patrulla:</strong> Ronda amb torxa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-emerald-600 border border-emerald-300" />
                    <span>👤 <strong>Tu (Joan):</strong> Mou-te a hexàgons contigus</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-indigo-950 border border-indigo-300" />
                    <span>🦹 <strong>Silueta:</strong> L'ombra de l'escola</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-900 border border-red-400" />
                    <span>🌲 <strong>Vedat:</strong> Terreny prohibit</span>
                  </div>
                </div>

                {state.lastFeedback && state.lastFeedback.type === 'error' && (
                  <motion.div
                    animate="shake"
                    variants={shakeVariants}
                    className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-lg text-xs font-sans flex items-center justify-between gap-2"
                  >
                    <span>⚠️ {state.lastFeedback.message}</span>
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="px-2 py-1 bg-red-700 text-white rounded font-bold text-xs"
                    >
                      Desfer
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* RESULTAT I DESCOBERTA D'EVIDÈNCIES */}
      {state.solved && (
        <section className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 sm:p-5 shadow-md">
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-lg text-emerald-950 shadow-inner">
              <div className="flex items-center gap-2 text-base font-bold font-serif text-emerald-900 mb-1">
                <span>✓</span>
                <span>Missió de Sigil Completada: Has presenciat la nit del 15!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 leading-relaxed">
                Has seguit la nit sense ser vist. A les 23:00 has presenciat com la patrulla arribava a La Farga i veia treballar <strong>Isidre el ferrer</strong> davant del foc.
              </p>
            </div>

            {/* DESCOBERTA D'EVIDÈNCIA I DESCART */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidència */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53]">
                  🕯️ Nova Evidència Desbloquejada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#1D3557] mt-0.5">
                  Llum a l'Escola a les 22:00
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  Mentre el poble dormia, algú redactava una carta a l'aula d'en Bernat i va fugir d'amagat a les 22:30.
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
                  La patrulla el va veure a la forja a les 23:00 en punt. Té coartada i queda <strong>100% descartat</strong>.
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
        </section>
      )}
    </div>
  )
}
