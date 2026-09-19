'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, shakeVariants } from '@/lib/animations/useAnimations'
import {
  HEX_MAP_NODES,
  CORRECT_PATH_SEQUENCE,
  WITNESS_CLUES,
  isValidClauKey,
  HexNodeData,
} from '@/content/public/planesBonesData'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { supabase } from '@/lib/db'

interface GameState {
  activeTab: 'historia' | 'mapa' | 'interrogatori' | 'troballa'
  selectedWitnessId: number // 1 a 4
  pathProgress: string[] // IDs de nodes connectats en ordre
  manualCode: string
  attempts: number
  solved: boolean
  lastFeedback: { type: 'success' | 'error' | 'hint'; message: string } | null
}

const HEX_RADIUS = 36

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
      selectedWitnessId: saved.selectedWitnessId || 1,
      pathProgress: Array.isArray(saved.pathProgress) ? saved.pathProgress : ['malla'],
      manualCode: saved.manualCode || '',
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      lastFeedback: null,
    }
  })

  const [showScannerModal, setShowScannerModal] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [shakeNodeId, setShakeNodeId] = useState<string | null>(null)

  // Intentar assignar automàticament el testimoni segons el jugador connectat
  useEffect(() => {
    async function detectPlayerIndex() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Cercar la posició del jugador al seu equip
        const { data: player } = await supabase
          .from('players')
          .select('id, team_id, created_at')
          .eq('user_id', user.id)
          .maybeSingle()

        if (player?.team_id) {
          const { data: teamPlayers } = await supabase
            .from('players')
            .select('id, created_at')
            .eq('team_id', player.team_id)
            .order('created_at', { ascending: true })

          if (teamPlayers && teamPlayers.length > 0) {
            const myIndex = teamPlayers.findIndex((p) => p.id === player.id)
            if (myIndex >= 0) {
              const assignedWitness = (myIndex % 4) + 1
              setState((prev) => ({ ...prev, selectedWitnessId: assignedWitness }))
            }
          }
        }
      } catch {
        // En cas de manca de connexió, manté el testimoni per defecte
      }
    }

    detectPlayerIndex()
  }, [])

  // Sincronització d'estat amb els companys d'equip
  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  // Comprovar si el camí complet s'ha traçat
  const isPathComplete = useMemo(() => {
    if (state.pathProgress.length !== CORRECT_PATH_SEQUENCE.length) return false
    return CORRECT_PATH_SEQUENCE.every((id, idx) => state.pathProgress[idx] === id)
  }, [state.pathProgress])

  // Comprovar si ja han arribat a Can Vinyals al camí
  const hasReachedCanVinyals = useMemo(() => {
    return state.pathProgress.includes('can-vinyals')
  }, [state.pathProgress])

  // Seleccionar un node al mapa per traçar la ruta
  const handleNodeClick = (node: HexNodeData) => {
    if (state.solved) return

    const currentIndex = state.pathProgress.length

    // Si el mapa ja està complet, permet seleccionar el node de Can Vinyals per anar a validar
    if (isPathComplete) {
      if (node.id === 'can-vinyals') {
        setState((prev) => ({ ...prev, activeTab: 'troballa' }))
      }
      return
    }

    const expectedNextId = CORRECT_PATH_SEQUENCE[currentIndex]

    // Si toquen el node esperat
    if (node.id === expectedNextId) {
      play('bell-ding')
      const updated = [...state.pathProgress, node.id]
      const justCompleted = updated.length === CORRECT_PATH_SEQUENCE.length

      setState((prev) => ({
        ...prev,
        pathProgress: updated,
        lastFeedback: justCompleted
          ? {
              type: 'success',
              message:
                '🎉 Camí reproduït amb èxit! Tots els testimonis coincideixen: Isidre va perdre la clau a l’entrecreuament de Can Vinyals vora les nogueres!',
            }
          : {
              type: 'hint',
              message: `Molt bé! Pas ${updated.length} de ${CORRECT_PATH_SEQUENCE.length}: ${node.name}. Quin és el següent punt segons els testimonis?`,
            },
      }))

      if (justCompleted) {
        play('evidence-unlock')
      }
      return
    }

    // Si toquen un node que ja formava part del camí (volen recular fins aquí)
    if (state.pathProgress.includes(node.id)) {
      const idx = state.pathProgress.indexOf(node.id)
      const pruned = state.pathProgress.slice(0, idx + 1)
      play('bell-ding')
      setState((prev) => ({
        ...prev,
        pathProgress: pruned,
        lastFeedback: {
          type: 'hint',
          message: `Has reculat fins a ${node.name}. Continua la ruta des d'aquest punt.`,
        },
      }))
      return
    }

    // Si toquen un node erroni que no toca
    play('buzzer')
    setShakeNodeId(node.id)
    setTimeout(() => setShakeNodeId(null), 600)

    setState((prev) => ({
      ...prev,
      lastFeedback: {
        type: 'error',
        message: `El ferrer no va passar per «${node.name}». Parla amb els companys d'equip per seguir les indicacions exactes dels testimonis!`,
      },
    }))
  }

  // Desfer l'últim pas
  const handleUndo = () => {
    if (state.pathProgress.length <= 1) return
    play('bell-ding')
    setState((prev) => ({
      ...prev,
      pathProgress: prev.pathProgress.slice(0, -1),
      lastFeedback: null,
    }))
  }

  // Reiniciar camí a Malla
  const handleReset = () => {
    play('bell-ding')
    setState((prev) => ({
      ...prev,
      pathProgress: ['malla'],
      lastFeedback: null,
    }))
  }

  // Validació de la Clau de la Forja (Manual o QR)
  const handleValidateCode = async (submittedText: string) => {
    const raw = submittedText.trim()
    if (!raw) return

    const isValid = isValidClauKey(raw)

    if (!isValid) {
      play('buzzer')
      setState((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastFeedback: {
          type: 'error',
          message:
            'Codi incorrecte. Assegura’t que estàs a la pedra gran de Can Vinyals i revisa el codi de reserva imprès sota el QR.',
        },
      }))
      return
    }

    // Èxit en trobar la clau
    play('evidence-unlock')
    setState((prev) => ({
      ...prev,
      solved: true,
      activeTab: 'troballa',
      lastFeedback: {
        type: 'success',
        message: 'Clau mestra recuperada amb èxit! La coartada d’Isidre queda plenament confirmada.',
      },
    }))

    try {
      await props.submit({
        key: 'CLAU-FORJA',
        code: 'CLAU-FORJA',
        answer: 'CLAU-FORJA',
        destination: 'CAN-VINYALS',
        pedra: 'PEDRA-GRAN',
      })
    } catch (err) {
      console.error('Error enviant resolució de Planes Bones:', err)
    }
  }

  // Escaneig de Codi QR amb la càmera
  const handleQRScan = useCallback(
    (detected: IDetectedBarcode[]) => {
      if (!detected || detected.length === 0) return
      const text = detected[0]?.rawValue
      if (!text) return

      setShowScannerModal(false)
      handleValidateCode(text)
    },
    []
  )

  // Generació de línia daurada del camí
  const pathPointsString = useMemo(() => {
    return state.pathProgress
      .map((id) => {
        const node = HEX_MAP_NODES[id]
        return node ? `${node.cx},${node.cy}` : ''
      })
      .filter(Boolean)
      .join(' ')
  }, [state.pathProgress])

  const myWitness = useMemo(() => {
    return (
      WITNESS_CLUES.find((w) => w.id === state.selectedWitnessId) ||
      WITNESS_CLUES[0]
    )
  }, [state.selectedWitnessId])

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-8 font-serif">
      {/* CAPÇALERA HISTÒRICA */}
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 3 · TERME DE PLANES BONES
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-0.5 font-serif">
          LA RUTA DEL FERRER I LA CLAU PERDUDA
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-lg mx-auto">
          «Reconstruïu el camí d'Isidre des de Malla fins a La Guixa per trobar l'objecte que va perdre.»
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md bg-stone-950">
        <img
          src="/images/scenes/planes-bones.jpg"
          alt="Planes Bones - La cruïlla nocturna"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          🌲 Planes Bones · El camí vell de Malla a La Guixa en la foscor
        </div>
      </div>

      {/* TARGETA D'INTERROGATORI EXCLUSIU (PER AQUEST JUGADOR) */}
      <section className="bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#8C6D53]/30 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{myWitness.icon}</span>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-[#D8CCAE] text-[#1D3557] px-2 py-0.5 rounded">
                El teu testimoni assignat
              </span>
              <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif">
                {myWitness.title}
              </h3>
            </div>
          </div>

          {/* Selector de testimoni de socors per si són menys jugadors */}
          <div className="flex items-center gap-1 text-xs font-sans text-[#5C4533]">
            <span className="text-[11px] hidden sm:inline">Canviar testimoni:</span>
            {WITNESS_CLUES.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, selectedWitnessId: w.id }))}
                className={`w-6 h-6 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                  state.selectedWitnessId === w.id
                    ? 'bg-[#1D3557] text-white ring-2 ring-[#C99E32]'
                    : 'bg-[#E2D6B8] text-[#5C4533] hover:bg-[#D8CCAE]'
                }`}
                title={w.title}
              >
                {w.id}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed italic bg-white/60 p-3 rounded-lg border border-[#8C6D53]/20 shadow-inner">
          {myWitness.text}
        </p>

        <div className="mt-2 text-[11px] text-[#8C6D53] font-sans flex items-center justify-between flex-wrap gap-2">
          <span>📍 Informant: <strong>{myWitness.witness}</strong> ({myWitness.location})</span>
          <span className="font-bold text-[#1D3557]">🗣️ No mostris la pantalla: explica-ho als teus companys!</span>
        </div>
      </section>

      {/* PESTANYES DE NAVEGACIÓ */}
      <div className="bg-[#D8CCAE] border border-[#8C6D53] rounded-t-xl flex flex-wrap overflow-hidden">
        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, activeTab: 'historia' }))}
          className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            state.activeTab === 'historia'
              ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
              : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
          }`}
        >
          <span>📜</span>
          <span>La Història</span>
        </button>

        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, activeTab: 'mapa' }))}
          className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            state.activeTab === 'mapa'
              ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
              : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
          }`}
        >
          <span>🗺️</span>
          <span>Mapa del Camí</span>
        </button>

        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, activeTab: 'interrogatori' }))}
          className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            state.activeTab === 'interrogatori'
              ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
              : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
          }`}
        >
          <span>👥</span>
          <span>Tots els Testimonis</span>
        </button>

        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, activeTab: 'troballa' }))}
          className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
            state.activeTab === 'troballa'
              ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
              : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
          } ${hasReachedCanVinyals && !state.solved ? 'animate-pulse text-amber-900 font-extrabold' : ''}`}
        >
          <span>{state.solved ? '✓' : '🔍'}</span>
          <span>Troballa de la Clau</span>
        </button>
      </div>

      {/* CONTINGUT DE LES PESTANYES */}
      <div className="bg-[#EAE0CA] border-x border-b border-[#8C6D53] rounded-b-xl p-3.5 sm:p-5 shadow-sm">
        <AnimatePresence mode="wait">
          {/* PESTANYA 0: LA HISTÒRIA */}
          {state.activeTab === 'historia' && (
            <motion.div
              key="tab-historia"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#2B2118]"
            >
              <div className="p-4 bg-[#FAF5E9] border-l-4 border-[#8C6D53] rounded-r-xl shadow-inner space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#8C6D53] block">
                  La Declaració d'Isidre el Ferrer
                </span>
                <h3 className="font-bold text-[#1D3557] text-base sm:text-lg font-serif">
                  «No vaig participar en cap conspiració: tornava cansat de Malla i vaig perdre la clau»
                </h3>
                <p className="text-[#3A2A1D] italic">
                  «La gent de la Guixa em mira amb recel perquè aquella nit em van veure caminant sol de nit pels camins de Planes Bones. Diuen que em vaig trobar amb traïdors a l'Hostal o al bosc, però és fals! Vaig sortir de Malla al capvespre carregat amb peces de ferro i eines per a la forja. Pel camí vaig passar per davant de masies, vaig travessar la riera i vaig aturar-me a beure aigua.»
                </p>
                <p className="text-[#3A2A1D] italic">
                  «En arribar a La Guixa vaig voler obrir el taller i em vaig adonar esverat que la clau mestra de la forja havia caigut pel camí! Si recupereu la clau que vaig perdre, tothom sabrà que deia la veritat i que la meva coartada és indiscutible.»
                </p>
              </div>

              <div className="p-3.5 bg-[#DFD4BC]/60 border border-[#8C6D53]/40 rounded-xl space-y-2 font-sans">
                <div className="font-bold text-[#1D3557] text-sm flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>Com funciona aquesta estació cooperativa:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#4A3728]">
                  <li>
                    <strong>Informació fragmentada:</strong> Cada membre de l'equip té assignat al seu telèfon el testimoni d'un veí diferent del terme (Malla, la Riera, Can Vinyals, el Pou).
                  </li>
                  <li>
                    <strong>Treball en equip:</strong> No us ensenyeu les pantalles. Expliqueu en veu alta què ha vist el vostre informant.
                  </li>
                  <li>
                    <strong>Reproduir la ruta al mapa:</strong> Aneu a la pestanya <em>Mapa del Camí</em> i connecteu les caselles per on va passar Isidre seguint les declaracions.
                  </li>
                  <li>
                    <strong>Cerca física al carrer:</strong> Un cop deduït on va caure la clau, aneu físicament a la <em>Pedra Gran de Can Vinyals</em> i escanegeu el codi QR (o introduïu el codi <code>CLAU-FORJA</code>).
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, activeTab: 'mapa' }))}
                  className="py-3 px-6 bg-[#1D3557] hover:bg-[#152740] text-white font-sans font-bold text-sm rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Anar al Mapa per Traçar el Camí</span>
                  <span>➔</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* PESTANYA 1: MAPA HEXAGONAL INTERACTIU */}
          {state.activeTab === 'mapa' && (
            <motion.div
              key="tab-mapa"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#8C6D53]/40 pb-2">
                <div>
                  <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif">
                    Plànol Cartogràfic de Planes Bones (1705)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5C4533] font-sans">
                    Toca les caselles en ordre per connectar el camí que va fer el ferrer.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={state.pathProgress.length <= 1 || state.solved}
                    className="py-1 px-2.5 bg-[#FAF5E9] hover:bg-white text-stone-700 disabled:opacity-40 border border-[#8C6D53]/40 rounded text-xs font-sans font-bold flex items-center gap-1 transition"
                  >
                    <span>↩</span> Desfer pas
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={state.pathProgress.length <= 1 || state.solved}
                    className="py-1 px-2.5 bg-[#FAF5E9] hover:bg-white text-stone-700 disabled:opacity-40 border border-[#8C6D53]/40 rounded text-xs font-sans font-bold transition"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>

              {/* CONTENIDOR DEL MAPA SVG */}
              <div className="w-full overflow-x-auto flex justify-center bg-[#4A3B2C] p-2 sm:p-4 rounded-xl border-2 border-[#8C6D53] shadow-inner relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#382B1E] via-[#4A3B2C] to-[#2E2217] opacity-95 pointer-events-none rounded-xl" />

                <svg
                  viewBox="0 0 495 285"
                  className="w-full max-w-[650px] h-auto relative z-10 select-none drop-shadow-md"
                >
                  <defs>
                    <filter id="hexGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Línia daurada del camí connectat */}
                  {pathPointsString && (
                    <polyline
                      points={pathPointsString}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="4"
                      strokeDasharray="6 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300 filter drop-shadow"
                    />
                  )}

                  {/* Renderització de les 24 caselles hexagonals */}
                  {Object.values(HEX_MAP_NODES).map((node) => {
                    const isSelected = state.pathProgress.includes(node.id)
                    const selectedIndex = state.pathProgress.indexOf(node.id)
                    const isShaking = shakeNodeId === node.id
                    const isCanVinyals = node.id === 'can-vinyals'
                    const isMalla = node.id === 'malla'
                    const isGuixa = node.id === 'la-guixa'

                    let fillColor = '#604F3D'
                    let strokeColor = '#8C6D53'
                    let strokeWidth = 1.2

                    // Colors segons tipologia de terreny
                    if (node.type === 'camp') {
                      fillColor = '#524332'
                      strokeColor = '#7A644D'
                    } else if (node.type === 'bosc') {
                      fillColor = '#2F3E2B'
                      strokeColor = '#4B5E45'
                    } else if (node.type === 'aigua') {
                      fillColor = '#284454'
                      strokeColor = '#48718A'
                    } else if (node.type === 'perill') {
                      fillColor = '#4A2A28'
                      strokeColor = '#7A3F3B'
                    } else if (node.type === 'masia') {
                      fillColor = '#6E583F'
                      strokeColor = '#A38460'
                    }

                    // Destacat si està seleccionat en el camí
                    if (isSelected) {
                      fillColor = '#1D3557'
                      strokeColor = '#38BDF8'
                      strokeWidth = 2.5
                    }

                    // Destacat especial si és Can Vinyals i s'ha arribat o resolt
                    if (isCanVinyals && hasReachedCanVinyals) {
                      fillColor = '#854D0E'
                      strokeColor = '#F59E0B'
                      strokeWidth = 3.5
                    }

                    // Punts d'inici i final
                    if (isMalla && !isSelected) {
                      strokeColor = '#10B981'
                      strokeWidth = 2
                    }

                    return (
                      <g
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className={`cursor-pointer transition-all duration-200 ${
                          isShaking ? 'animate-bounce' : ''
                        }`}
                        filter={isSelected ? 'url(#hexGlow)' : undefined}
                      >
                        <polygon
                          points={getHexPolygon(node.cx, node.cy, HEX_RADIUS)}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          className="hover:brightness-125 transition-all"
                        />

                        {/* Indicador numèric de pas traçat */}
                        {isSelected && (
                          <circle
                            cx={node.cx - 20}
                            cy={node.cy - 18}
                            r="8"
                            fill="#F59E0B"
                            stroke="#78350F"
                            strokeWidth="1"
                          />
                        )}
                        {isSelected && (
                          <text
                            x={node.cx - 20}
                            y={node.cy - 15}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill="#1E293B"
                            fontFamily="monospace"
                          >
                            {selectedIndex + 1}
                          </text>
                        )}

                        {/* Icona */}
                        <text
                          x={node.cx}
                          y={node.cy - 7}
                          textAnchor="middle"
                          fontSize="17"
                          className="pointer-events-none"
                        >
                          {node.icon}
                        </text>

                        {/* Nom de la casella */}
                        <text
                          x={node.cx}
                          y={node.cy + 12}
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="bold"
                          fill={isSelected ? '#F8FAFC' : '#E2D6B8'}
                          fontFamily="sans-serif"
                          className="pointer-events-none tracking-tight"
                        >
                          {node.name}
                        </text>

                        {/* Subtítol abreujat */}
                        <text
                          x={node.cx}
                          y={node.cy + 22}
                          textAnchor="middle"
                          fontSize="6.5"
                          fill={isSelected ? '#BAE6FD' : '#A89278'}
                          fontFamily="sans-serif"
                          className="pointer-events-none"
                        >
                          {node.subtitle}
                        </text>

                        {/* Halo radiant a Can Vinyals si s'ha deduït la pèrdua */}
                        {isCanVinyals && hasReachedCanVinyals && (
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={HEX_RADIUS + 4}
                            fill="none"
                            stroke="#FBBF24"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            className="animate-spin pointer-events-none"
                            style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                          />
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Feedback dinàmic */}
              {state.lastFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs sm:text-sm font-sans flex items-start gap-2 ${
                    state.lastFeedback.type === 'error'
                      ? 'bg-red-100 border-red-300 text-red-900'
                      : state.lastFeedback.type === 'success'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                      : 'bg-[#F4EBD9] border-[#8C6D53]/40 text-[#4A3728]'
                  }`}
                >
                  <span className="text-base">
                    {state.lastFeedback.type === 'error'
                      ? '⚠️'
                      : state.lastFeedback.type === 'success'
                      ? '✓'
                      : '💡'}
                  </span>
                  <div className="flex-1">{state.lastFeedback.message}</div>
                </div>
              )}

              {/* ALERTA DE LOCALITZACIÓ DE LA PEDRA GRAN */}
              {hasReachedCanVinyals && !state.solved && (
                <div className="p-3.5 bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-500 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🪨</span>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-amber-950">
                        Objectiu localitzat: Pedra Gran de Can Vinyals!
                      </h4>
                      <p className="text-xs text-amber-900 font-sans mt-0.5">
                        La clau de la forja va caure vora les nogueres. Aneu físicament a la pedra gran a buscar el QR o el codi!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, activeTab: 'troballa' }))}
                    className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <span>🔍 Validar Troballa</span>
                    <span>➔</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* PESTANYA 2: TOTS ELS TESTIMONIS */}
          {state.activeTab === 'interrogatori' && (
            <motion.div
              key="tab-testimonis"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3.5"
            >
              <div className="border-b border-[#8C6D53]/40 pb-2">
                <h3 className="font-bold text-[#1D3557] text-sm sm:text-base font-serif">
                  Les 4 Declaracions dels Veïns Interrogats
                </h3>
                <p className="text-xs text-[#5C4533] font-sans">
                  Cada membre de l'equip hauria d'haver rebut un testimoni diferent per telèfon. Aquí podeu consultar la visió general:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WITNESS_CLUES.map((witness) => (
                  <div
                    key={witness.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      state.selectedWitnessId === witness.id
                        ? 'bg-[#FAF5E9] border-[#1D3557] shadow ring-2 ring-[#C99E32]'
                        : 'bg-[#F4EBD9] border-[#8C6D53]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-lg">{witness.icon}</span>
                      <span className="text-[10px] font-mono font-bold uppercase bg-[#D8CCAE] text-[#1D3557] px-2 py-0.5 rounded">
                        {witness.location}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[#2B2118]">
                      {witness.title}
                    </h4>
                    <p className="text-[11px] text-[#8C6D53] font-sans mt-0.5">
                      Informant: <strong>{witness.witness}</strong>
                    </p>

                    <p className="text-xs text-[#4A3728] mt-2 font-serif italic bg-white/70 p-2.5 rounded border border-[#8C6D53]/20">
                      {witness.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PESTANYA 3: TROBALLA DE LA CLAU I VALIDACIÓ */}
          {state.activeTab === 'troballa' && (
            <motion.div
              key="tab-troballa"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {!state.solved ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-xl shadow-sm">
                    <h3 className="font-bold text-[#1D3557] text-base font-serif flex items-center gap-2 mb-1">
                      <span>🪨</span>
                      <span>La Pedra Gran de Can Vinyals</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3728] leading-relaxed font-sans">
                      A l'entrecreuament cap al camí de Can Vinyals, sota l'ombra de les nogueres, hi ha una gran pedra que marca el camí.
                      Busqueu-hi l'objecte d'Isidre o el codi QR enganxat per validar la vostra deducció:
                    </p>

                    {/* BOTÓ GRAN PER OBRIR CÀMERA */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setScannerError(null)
                          setShowScannerModal(true)
                        }}
                        className="flex-1 py-3 px-4 bg-[#1D3557] hover:bg-[#152740] text-white font-sans font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="text-lg">📷</span>
                        <span>Obrir Càmera per Escanejar el QR</span>
                      </button>
                    </div>
                  </div>

                  {/* FORMULARI ALTERNATIU AMB CODI MANUAL DE RESERVA */}
                  <div className="p-4 bg-[#FAF5E9] border border-[#8C6D53] rounded-xl">
                    <h4 className="font-serif font-bold text-sm text-[#2B2118] mb-1">
                      O bé introdueix el codi de seguretat manual:
                    </h4>
                    <p className="text-xs text-[#5C4533] font-sans mb-3">
                      Si la càmera té dificultats o hi ha reflexos de llum, escriu el codi de reserva imprès sota el QR:
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleValidateCode(state.manualCode)
                      }}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="text"
                        value={state.manualCode}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            manualCode: e.target.value,
                            lastFeedback: null,
                          }))
                        }
                        placeholder="Ex: CLAU-FORJA"
                        className="flex-1 p-3 border-2 border-[#8C6D53] rounded-lg bg-white text-[#1D3557] font-mono font-bold text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner uppercase"
                      />

                      <button
                        type="submit"
                        disabled={!state.manualCode.trim()}
                        className="py-3 px-6 bg-[#C99E32] hover:bg-amber-500 disabled:opacity-50 text-[#121E2B] font-bold font-sans rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Validar Codi</span>
                        <span>➔</span>
                      </button>
                    </form>
                  </div>

                  {state.lastFeedback && state.lastFeedback.type === 'error' && (
                    <div className="p-2.5 bg-red-100 border border-red-300 text-red-900 rounded text-xs font-sans flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{state.lastFeedback.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* PANTALLA D'ÈXIT I DESCOBERTA D'EVIDÈNCIA */
                <motion.div
                  variants={fadeInVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-xl text-emerald-950 shadow-inner">
                    <div className="flex items-center gap-2 text-base font-bold font-serif text-emerald-900 mb-1">
                      <span>✓</span>
                      <span>Clau Mestra Recuperada a Can Vinyals!</span>
                    </div>
                    <p className="text-xs sm:text-sm font-sans text-emerald-800 leading-relaxed">
                      Heu reproduït el camí exacte que va fer Isidre des de Malla fins a La Guixa i heu localitzat la clau que va perdre en descansar a la gran pedra sota les nogueres.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Evidència */}
                    <div className="p-3.5 bg-[#FAF5E9] border border-[#8C6D53] rounded-lg shadow-sm">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53]">
                        📜 Nova Evidència Desbloquejada
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#1D3557] mt-0.5">
                        La Clau Mestra de la Forja
                      </h4>
                      <p className="text-xs text-[#5C4533] mt-1 font-sans">
                        La recuperació de la clau a Can Vinyals demostra que Isidre deia la veritat i tornava de treballar a Malla.
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
                        La seva coartada és indiscutible. Queda <strong>100% descartat</strong> com a traïdor.
                      </p>
                    </div>
                  </div>

                  {/* XIFRA DE L'ELEMENT TERRA */}
                  <div className="p-4 bg-[#1D3557] text-[#FAF5E9] rounded-xl border-2 border-[#C99E32] shadow text-center">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[#C99E32] font-bold">
                      XIFRA DE L'ELEMENT DESCOBERTA
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold font-serif mt-1">
                      🌍 TERRA = 3
                    </div>
                    <div className="text-xs text-[#FAF5E9]/80 font-sans mt-1">
                      Anota aquesta xifra al quadern del teu equip!
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL DE CÀMERA PER ESCANEJAR EL QR DE LA PEDRA */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#1D3557] text-white p-3 flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Escaneja el QR de la Pedra</span>
              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded bg-white/20 hover:bg-white/30 text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#8C6D53] bg-black">
                <Scanner
                  onScan={handleQRScan}
                  onError={(err) => {
                    console.error('Camera scanner error:', err)
                    setScannerError('No s’ha pogut accedir a la càmera. Utilitza el codi manual de reserva.')
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                  }}
                />
              </div>

              {scannerError ? (
                <div className="p-2 bg-amber-100 border border-amber-300 text-amber-900 rounded text-xs font-sans">
                  ⚠️ {scannerError}
                </div>
              ) : (
                <p className="text-xs text-center text-[#5C4533] font-sans">
                  Apunta la càmera directament al codi QR de la pedra gran.
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowScannerModal(false)}
                className="w-full py-2 bg-[#D8CCAE] hover:bg-[#C99E32] text-[#2B2118] font-bold text-xs rounded transition font-sans"
              >
                Tancar Càmera i Escriure Codi Manual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
