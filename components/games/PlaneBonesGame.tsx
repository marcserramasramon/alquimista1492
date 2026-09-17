'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, shakeVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeTab: 'historia' | 'regles' | 'mapa' | 'joc'
  visitedCells: number[]
  totalMinutes: number
  selectedAnswer: string
  attempts: number
  solved: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

interface GridCell {
  id: number
  name: string
  type: 'inici' | 'desti' | 'lloc' | 'edifici' | 'prohibit'
  row: number
  col: number
  desc: string
  icon: string
}

const CELLS: Record<number, GridCell> = {
  1: { id: 1, name: 'Camí de Vic', type: 'lloc', row: 0, col: 0, desc: 'Sortida nord del poble cap a la plana', icon: '🛤️' },
  2: { id: 2, name: 'Molí de la Guixa', type: 'edifici', row: 0, col: 1, desc: 'Molí fariner tocant al rec', icon: '⚙️' },
  3: { id: 3, name: 'La Farga', type: 'desti', row: 0, col: 2, desc: "Taller del ferrer. S'hi sent el martell des de lluny", icon: '⚒️' },
  4: { id: 4, name: 'Bosc Espès', type: 'prohibit', row: 0, col: 3, desc: 'Camí tancat de roures i heures (Prohibit)', icon: '🌲' },
  5: { id: 5, name: "Hostal del Sol", type: 'edifici', row: 1, col: 0, desc: "L'hostal on fan parada traginers i viatgers", icon: '🏠' },
  6: { id: 6, name: 'Pou Comunal', type: 'lloc', row: 1, col: 1, desc: "Boca d'aigua dolça al centre del carrer", icon: '🪣' },
  7: { id: 7, name: "L'Era", type: 'lloc', row: 1, col: 2, desc: 'Espai obert per batre el blat', icon: '🌾' },
  8: { id: 8, name: 'Bosc Fosc', type: 'prohibit', row: 1, col: 3, desc: 'Zona boscana intransitable de nit (Prohibida)', icon: '🌲' },
  9: { id: 9, name: "L'Escola", type: 'edifici', row: 2, col: 0, desc: "Aula del mestre Bernat", icon: '📚' },
  10: { id: 10, name: 'Rectoria', type: 'edifici', row: 2, col: 1, desc: 'Casa rectoral tocant a la paret del temple', icon: '⛪' },
  11: { id: 11, name: "L'Hort", type: 'lloc', row: 2, col: 2, desc: 'Feixes de conreu amb séquies', icon: '🥬' },
  12: { id: 12, name: 'La Font', type: 'lloc', row: 2, col: 3, desc: 'Punt de pas del camí del torrent', icon: '💧' },
  13: { id: 13, name: 'Cementiri Vell', type: 'prohibit', row: 3, col: 0, desc: 'Terreny sagrat. La guàrdia no hi entra (Prohibit)', icon: '🪦' },
  14: { id: 14, name: 'Plaça Major', type: 'inici', row: 3, col: 1, desc: 'Punt de trobada i sortida de la patrulla a les 22:00', icon: '🏛️' },
  15: { id: 15, name: 'El Paller', type: 'lloc', row: 3, col: 2, desc: "Paller d'on el traginer vigilava la ronda", icon: '🛖' },
  16: { id: 16, name: 'Riera Brava', type: 'prohibit', row: 3, col: 3, desc: 'Corrent d’aigua perillós de nit (Prohibit)', icon: '🌊' },
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
      visitedCells: saved.visitedCells && saved.visitedCells.length > 0 ? saved.visitedCells : [14],
      totalMinutes: typeof saved.totalMinutes === 'number' ? saved.totalMinutes : 0,
      selectedAnswer: saved.selectedAnswer || '',
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      lastFeedback: null,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Validació de si una casella és adjacent a l'última visitada
  const isAdjacent = (cellId: number): boolean => {
    if (state.visitedCells.length === 0) return cellId === 14
    const lastId = state.visitedCells[state.visitedCells.length - 1]
    const lastCell = CELLS[lastId]
    const targetCell = CELLS[cellId]
    if (!lastCell || !targetCell) return false

    const dRow = Math.abs(lastCell.row - targetCell.row)
    const dCol = Math.abs(lastCell.col - targetCell.col)
    // Moviment ortogonal: 1 pas en fila O 1 pas en columna, mai en diagonal
    return (dRow === 1 && dCol === 0) || (dRow === 0 && dCol === 1)
  }

  const handleCellClick = (cellId: number) => {
    const cell = CELLS[cellId]
    if (!cell || cell.type === 'prohibit') {
      play('buzzer')
      setState(prev => ({
        ...prev,
        lastFeedback: {
          type: 'error',
          message: `La patrulla no pot entrar a "${cell?.name || 'aquesta zona'}" (és una zona prohibida!).`,
        },
      }))
      return
    }

    // Si ja està visitada, no permetre repetir
    if (state.visitedCells.includes(cellId)) {
      // Si és l'última casella, permetre desfer
      if (cellId === state.visitedCells[state.visitedCells.length - 1] && state.visitedCells.length > 1) {
        handleUndoStep()
      }
      return
    }

    // Comprovar si és adjacent a la darrera
    if (!isAdjacent(cellId)) {
      play('buzzer')
      setState(prev => ({
        ...prev,
        lastFeedback: {
          type: 'error',
          message: 'La patrulla només pot avançar a caselles adjacents (NORD, EST, OEST, SUD), mai en diagonal ni saltant caselles.',
        },
      }))
      return
    }

    const nextVisited = [...state.visitedCells, cellId]
    const nextMinutes = (nextVisited.length - 1) * 15

    setState(prev => ({
      ...prev,
      visitedCells: nextVisited,
      totalMinutes: nextMinutes,
      selectedAnswer: cell.name,
      lastFeedback: null,
    }))
  }

  const handleUndoStep = () => {
    if (state.visitedCells.length <= 1) return
    const nextVisited = state.visitedCells.slice(0, -1)
    const nextMinutes = (nextVisited.length - 1) * 15
    const lastCell = CELLS[nextVisited[nextVisited.length - 1]]

    setState(prev => ({
      ...prev,
      visitedCells: nextVisited,
      totalMinutes: nextMinutes,
      selectedAnswer: lastCell?.name || '',
      lastFeedback: null,
    }))
  }

  const handleResetRoute = () => {
    setState(prev => ({
      ...prev,
      visitedCells: [14],
      totalMinutes: 0,
      selectedAnswer: '',
      lastFeedback: null,
    }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanAnswer = state.selectedAnswer.trim().toUpperCase()
    if (!cleanAnswer) {
      setState(prev => ({
        ...prev,
        lastFeedback: {
          type: 'error',
          message: "Indica o selecciona on arriba la patrulla a les 23:00 hores.",
        },
      }))
      return
    }

    const isLocallyCorrect =
      cleanAnswer === 'FARGA' ||
      cleanAnswer === 'LA FARGA' ||
      cleanAnswer === '3' ||
      cleanAnswer.includes('FARGA')

    try {
      const result = await props.submit({
        location: cleanAnswer,
        answer: cleanAnswer,
        visitedCells: state.visitedCells,
        totalMinutes: state.totalMinutes,
      })

      if (result.correct || isLocallyCorrect) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          solved: true,
          lastFeedback: {
            type: 'success',
            message: 'Ruta confirmada! A les 23:00 la patrulla arriba a La Farga i confirma la coartada del ferrer Isidre.',
          },
        }))
      } else {
        play('buzzer')
        setState(prev => ({
          ...prev,
          attempts: prev.attempts + 1,
          lastFeedback: {
            type: 'error',
            message:
              result.message ||
              "Lloc incorrecte. Segueix la prioritat NORD → EST → OEST → SUD des de la Plaça durant 60 minuts (4 passos).",
          },
        }))
      }
    } catch (err) {
      console.error('Error validant ruta:', err)
      if (isLocallyCorrect) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          solved: true,
          lastFeedback: {
            type: 'success',
            message: 'Ruta confirmada! La patrulla arriba a La Farga.',
          },
        }))
      }
    }
  }

  const currentHour = 22 + Math.floor(state.totalMinutes / 60)
  const currentMins = state.totalMinutes % 60
  const formattedTime = `${currentHour}:${String(currentMins).padStart(2, '0')}`

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 pb-8 font-serif">
      {/* CAPÇALERA HISTÒRICA */}
      <header className="text-center py-4 px-3 bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl shadow-md">
        <div className="inline-block px-3 py-0.5 mb-1.5 text-xs font-mono tracking-widest text-[#1D3557] bg-[#D8CCAE] rounded-full border border-[#8C6D53]/40">
          ESTACIÓ III · COARTADES I RUTES
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B2118] tracking-wide">
          PLANES BONES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] italic mt-0.5">
          La Ronda Nocturna del Sometent i la Coartada del Ferrer
        </p>
      </header>

      {/* PESTANYES DE CONSULTA I RECORREGUT */}
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
            <span>Regles de la Guàrdia</span>
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
            <span>Mapa del Terme</span>
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
            <span>Traçador de Ronda</span>
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
                    L'Espia del Paller i la Guàrdia del Sometent
                  </h3>
                  <p>
                    La nit del 15 de maig —la mateixa nit en què es va redactar la carta traïdora— la patrulla armada del sometent vigilava el poble per evitar infiltrats borbònics.
                  </p>
                </div>

                <div className="space-y-2 text-[#4A3728]">
                  <p>
                    En Joan el traginer, amagat dalt del paller, va passar la nit vigilant els seus moviments i va anotar el patró exacte que segueix la guàrdia cada quart d'hora.
                  </p>
                  <p>
                    D'altra banda, <strong>Isidre el ferrer</strong> afirma que té una coartada perfecta: assegura que a les <strong>23:00 hores</strong> en punt estava treballant a la seva farga forjant eines, i que la patrulla el va veure en passar per davant del taller.
                  </p>
                  <p>
                    Hem de reconstruir el camí exacte que va fer la patrulla des de la seva sortida per comprovar si realment va arribar a la farga a les 23:00.
                  </p>
                </div>

                <div className="bg-[#DFD4BC]/70 p-3 rounded border border-[#8C6D53]/40 flex items-start gap-2.5 text-xs text-[#5C4533] font-sans">
                  <span className="text-lg">💡</span>
                  <div>
                    <strong>Pista:</strong> Consulta les <em>Regles de la Guàrdia</em> per saber l'ordre de prioritat del pas i segueix la patrulla durant 60 minuts (4 trams de 15 minuts).
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 2: REGLES DE LA GUÀRDIA */}
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
                      Instruccions del Sometent de la Plana
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1D3557] font-serif">
                      Normes Estrictes de la Ronda
                    </h3>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#4A3728] font-sans">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">1.</span>
                      <span><strong>Hora i punt de sortida:</strong> La patrulla surt sempre de la <strong>Plaça Major</strong> a les <strong>22:00 hores</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">2.</span>
                      <span><strong>Cadència temporal:</strong> Cada casella avançada requereix exactament <strong>15 minuts</strong> (+1 quart d'hora).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">3.</span>
                      <div>
                        <strong>Ordre estricte de prioritat:</strong> Si la guàrdia pot avançar cap a diversos camins oberts, tria sempre en aquest ordre:
                        <div className="mt-1 font-mono font-bold text-xs bg-[#EAE0CA] py-1 px-2.5 rounded border border-[#8C6D53]/30 text-[#1D3557]">
                          1r NORD ➔ 2n EST ➔ 3r OEST ➔ 4t SUD
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-700 font-bold">4.</span>
                      <span><strong>Zones prohibides:</strong> Mai no entren a zones fosques o perilloses: <strong>Bosc</strong>, <strong>Riera</strong> ni <strong>Cementiri</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-700 font-bold">5.</span>
                      <span><strong>Sense retrocessos:</strong> Mai no repeteixen caselles ni van en diagonal.</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 3: MAPA DEL TERME */}
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
                    Plànol del Poble de la Guixa (4×4)
                  </h3>
                  <span className="text-xs text-[#5C4533] font-sans">Any de 1705</span>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-[#FAF5E9] p-3 rounded-lg border border-[#8C6D53]">
                  {Object.values(CELLS).map(cell => {
                    const isForbidden = cell.type === 'prohibit'
                    const isStart = cell.id === 14
                    const isDest = cell.id === 3

                    return (
                      <div
                        key={cell.id}
                        className={`p-2 rounded border text-center text-xs flex flex-col justify-between min-h-[72px] ${
                          isForbidden
                            ? 'bg-red-100/70 border-red-300 text-red-900'
                            : isStart
                            ? 'bg-amber-200/80 border-amber-500 font-bold text-[#1D3557]'
                            : isDest
                            ? 'bg-blue-100/80 border-blue-400 font-bold text-[#1D3557]'
                            : 'bg-white border-[#8C6D53]/30 text-[#4A3728]'
                        }`}
                      >
                        <div className="text-base">{cell.icon}</div>
                        <div className="font-sans font-bold leading-tight text-[11px] mt-0.5">
                          {cell.name}
                        </div>
                        <div className="text-[9px] text-[#8C6D53] font-mono">
                          {isForbidden ? 'Prohibit' : isStart ? 'Inici 22:00' : isDest ? 'Destí' : `Casella ${cell.id}`}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="p-2.5 bg-amber-50 rounded border border-amber-300 text-xs text-amber-900 font-sans flex items-center justify-between">
                  <span>🏛️ <strong>Plaça:</strong> Sortida 22:00</span>
                  <span>🌲 <strong>Bosc / Riera:</strong> Vetats</span>
                  <span>⚒️ <strong>La Farga:</strong> Casella 3</span>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 4: TRAÇADOR INTERACTIU */}
            {state.activeTab === 'joc' && (
              <motion.div
                key="joc"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Marcador de temps i passos */}
                <div className="p-3 bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-inner">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#8C6D53]">Hora de la ronda</div>
                    <div className="text-2xl font-bold font-mono text-[#1D3557] flex items-center gap-1.5">
                      <span>🕰️</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#8C6D53]">Temps transcorregut</div>
                    <div className="text-sm font-bold font-mono text-[#2B2118]">
                      {state.totalMinutes} minuts ({state.visitedCells.length - 1} passos)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndoStep}
                      disabled={state.visitedCells.length <= 1}
                      className="px-2.5 py-1 text-xs font-sans font-bold bg-[#EAE0CA] hover:bg-[#D8CCAE] disabled:opacity-40 text-[#4A3728] rounded border border-[#8C6D53]/40 transition-colors"
                      title="Desfer darrer pas"
                    >
                      ↩ Desfer
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRoute}
                      className="px-2.5 py-1 text-xs font-sans font-bold bg-amber-200 hover:bg-amber-300 text-amber-950 rounded border border-amber-400 transition-colors"
                    >
                      ↺ Reiniciar
                    </button>
                  </div>
                </div>

                {/* Mapa interactiu 4x4 */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {Object.values(CELLS).map(cell => {
                    const stepIndex = state.visitedCells.indexOf(cell.id)
                    const isVisited = stepIndex !== -1
                    const isCurrent = state.visitedCells[state.visitedCells.length - 1] === cell.id
                    const isForbidden = cell.type === 'prohibit'

                    return (
                      <button
                        key={cell.id}
                        type="button"
                        onClick={() => handleCellClick(cell.id)}
                        disabled={isForbidden}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col justify-between min-h-[76px] sm:min-h-[84px] relative ${
                          isForbidden
                            ? 'bg-red-100/60 border-red-300 text-red-800 opacity-60 cursor-not-allowed'
                            : isCurrent
                            ? 'bg-[#1D3557] text-[#FAF5E9] border-[#1D3557] ring-2 ring-[#C99E32] shadow-lg font-bold'
                            : isVisited
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow font-bold'
                            : 'bg-[#FAF5E9] text-[#2B2118] border-[#8C6D53]/40 hover:bg-[#E2D6B8]'
                        }`}
                      >
                        {isVisited && (
                          <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#C99E32] text-[#121E2B] font-mono text-[10px] font-bold flex items-center justify-center shadow">
                            {stepIndex === 0 ? '0' : stepIndex}
                          </span>
                        )}

                        <div className="text-lg">{cell.icon}</div>
                        <div className="text-[11px] sm:text-xs font-sans font-bold leading-tight">
                          {cell.name}
                        </div>
                        <div className="text-[9px] font-mono opacity-80">
                          {isForbidden
                            ? '🚫 Vedat'
                            : isVisited
                            ? `${22 + Math.floor((stepIndex * 15) / 60)}:${String((stepIndex * 15) % 60).padStart(2, '0')}`
                            : `Casella ${cell.id}`}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Ruta recorreguda fins ara */}
                <div className="p-3 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg text-xs font-sans space-y-1">
                  <div className="font-bold text-[#1D3557]">Itinerari de la Patrulla:</div>
                  <div className="text-[#4A3728] leading-relaxed">
                    {state.visitedCells.map((id, idx) => {
                      const c = CELLS[id]
                      const timeStr = `${22 + Math.floor((idx * 15) / 60)}:${String((idx * 15) % 60).padStart(2, '0')}`
                      return (
                        <span key={id}>
                          {idx > 0 && ' ➔ '}
                          <strong className={idx === state.visitedCells.length - 1 ? 'text-[#1D3557]' : ''}>
                            {c.name} ({timeStr})
                          </strong>
                        </span>
                      )
                    })}
                  </div>
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
                A quin lloc arriba la patrulla a les 23:00 hores (després de 60 minuts de ronda)?
              </label>
              <p className="text-xs text-[#5C4533] font-sans">
                Avança pel mapa seguint la prioritat (NORD → EST → OEST → SUD) o escriu el nom de la casella:
              </p>
            </div>

            <motion.div
              animate={state.lastFeedback?.type === 'error' ? 'shake' : 'initial'}
              variants={shakeVariants}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={state.selectedAnswer}
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    selectedAnswer: e.target.value,
                    lastFeedback: null,
                  }))
                }
                className="flex-1 p-3 border-2 border-[#8C6D53] rounded-lg bg-[#FAF5E9] text-[#1D3557] font-mono font-bold text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner"
              />

              <button
                type="submit"
                disabled={!state.selectedAnswer.trim()}
                className="py-3 px-6 bg-[#C99E32] hover:bg-amber-500 disabled:opacity-50 text-[#121E2B] font-bold font-sans rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Validar Lloc</span>
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
                <span>Ruta Confirmada: Arribada a La Farga a les 23:00!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 leading-relaxed">
                La patrulla ha completat la seva ronda per la Guixa i ha arribat puntualment a <strong>La Farga</strong> a les 23:00 hores.
              </p>
            </div>

            {/* DESCOBERTA D'EVIDÈNCIA I DESCART */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidència */}
              <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53]">
                  🗺️ Nova Evidència Desbloquejada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#1D3557] mt-0.5">
                  Ruta de la Patrulla Nocturna
                </h4>
                <p className="text-xs text-[#5C4533] mt-1 font-sans">
                  La guàrdia va passar per davant del taller a les 23:00 i va veure treballar el ferrer.
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
                  Té una coartada sòlida i verificada per la patrulla. Queda <strong>100% descartat</strong>.
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
