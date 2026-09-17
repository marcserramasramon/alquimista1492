'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, scaleVariants } from '@/lib/animations/useAnimations'

interface ControlGameState {
  currentScreen: 'intro' | 'waiting' | 'result'
  passed: boolean
  salconduitLost: number
  frase?: string
  coartadaType?: string
  playerRole?: string
}

interface CoartadaResponse {
  frases: Array<{
    number: number
    content: string
  }>
}

/**
 * Plantilles de coartades per a mode Preview i fallback offline
 */
const PREVIEW_COARTADES = [
  {
    id: 'A',
    name: 'La Llevadora (Mas de la Carmeta)',
    type: 'llevadora',
    frases: [
      'En Josep va portar aiguardent i draps nets al mas de la Carmeta durant la nit quan va arribar la llevadora.',
      'La matrona Miquel va entrar al mas quan els crits de la parturienta es sentien des del camí públic.',
      'En Ricard va estar tota la nit fora del mas portant aigua freda i brasa pel foc que escalfava l\'aigua.',
      'Els veïns propers juren que van veure moviment continu a la casa: anar i venir de dones amb pans i roba blanca.',
    ],
  },
  {
    id: 'B',
    name: 'El Medicament (Pagès de la Farga)',
    type: 'medicament',
    frases: [
      'La Josepa estava malalta de calentura alta, i en Josep va córrer fins al Pare Miquel que guarda les herbes medicinals a la rectoria.',
      'En Tomàs va ser vist per quatre persones distintes carregant una bossa amb tònica de sàlvia i mel comprada a la casa de l\'Esteve.',
      'A la finestra de la casa hi havia una carteta clavada amb la recepta escrita pel Pare Miquel per curar la malaltia.',
      'L\'home del molí pot jurar que en Miquel va passar per la riera portant una ampoleta de líquid vermellós lligada a la cinta.',
    ],
  },
  {
    id: 'C',
    name: 'Avisar el Rector (Difunt Josep)',
    type: 'rector',
    frases: [
      'El Pare Miquel va cridar en Joan pel sacrament per anar a visitar un moribund al mas de Sots que estava morint de febres.',
      'En Valentí pot certificar-ho: era ell qui portava la llàntia blanca, l\'aigua beneïda i el santcrist del rector pel camí de serena.',
      'Els infants del poble van veure el sacerdot i el seu ajudant pujant cap a la capella de Sant Jaume amb les vestidures.',
      'El rector escriu al llibre de defuncions que va administrar els olis sants aquella nit a tres cases del terme.',
    ],
  },
  {
    id: 'D',
    name: 'Persona Perduda (Al bosc)',
    type: 'personaPerduda',
    frases: [
      'L\'oncle de la Fada va desaparèixer al capvespre, i la seva mare va cridar desesperada a tot el poble demanant gent per buscar-lo.',
      'Més de deu homes es van reunir amb torxes per cercar pels camps foscos, inclòs en Pau i en Miquel, fins ben entrada la matinada.',
      'Van trobar el fugitiu adormit sota el paller de l\'Esteve, confós i desorientat per la foscor i la soledat.',
      'Per això tots aquells homes de la partida van estar junts aquella nit sencera, sota les estrelles, buscant pels marges i les passeres.',
    ],
  },
  {
    id: 'E',
    name: 'El Mestre d\'Obres (Gotera urgent)',
    type: 'mestre',
    frases: [
      'El mestre havia deixat tancat l\'estudi per pujar a la rectoria portant els comptes de les obres que el Pare Miquel li demanava urgentment.',
      'Els nens que aprenen lletres van declarar que en Jaume el mestre va arribar tard aquell dia, tot suant i assedegat de la pujada.',
      'En Josep, el fill del carnisser, va veure el mestre baixant ràpidament del camí de la rectoria amb papers a la mà i cara de preocupació.',
      'L\'ajudant del mestre, una noia del poble, va haver de tancar ella mateixa els portals de l\'estudi perquè el mestre no tornava aquella tarda.',
    ],
  },
]

/**
 * Joc 5: Control de l'Emissari (Pla de Masset)
 * L'Emissari interroga el grup en viu sobre la coartada
 * Cada jugador rep una frase secreta que ha de sostenir
 */
export function ControlGame(props: GameProps) {
  const { play } = useAudio()

  // Detectar si estem en mode preview / explorador
  const isPreview =
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('/preview') || !props.teamId || props.teamId === 'preview')

  const [previewTemplateIndex, setPreviewTemplateIndex] = useState(0)
  const [previewFraseIndex, setPreviewFraseIndex] = useState(0)

  const [state, setState] = useState<ControlGameState>(() => {
    const saved = props.sharedState as ControlGameState | undefined
    if (saved && 'currentScreen' in saved) {
      return saved
    }
    return {
      currentScreen: 'intro',
      passed: false,
      salconduitLost: 0,
    }
  })

  const [fraseLoading, setFraseLoading] = useState(true)
  const [fraseError, setFraseError] = useState<string | null>(null)
  const [showPeekModal, setShowPeekModal] = useState(false)

  // Carregar coartada o carregar mock si és preview / sense sessió
  useEffect(() => {
    const fetchCoartada = async () => {
      // Si és preview, no cal fer fetch d'autenticació
      if (isPreview) {
        const tpl = PREVIEW_COARTADES[previewTemplateIndex]
        setState(prev => ({
          ...prev,
          frase: tpl.frases[previewFraseIndex],
          coartadaType: tpl.name,
          playerRole: `Jugador ${previewFraseIndex + 1}`,
        }))
        setFraseLoading(false)
        setFraseError(null)
        return
      }

      try {
        setFraseLoading(true)
        setFraseError(null)

        const response = await fetch('/api/game/coartada')

        if (!response.ok) {
          // Fallback elegant si no hi ha dades de sessió
          const tpl = PREVIEW_COARTADES[0]
          setState(prev => ({
            ...prev,
            frase: tpl.frases[0],
            coartadaType: tpl.name,
            playerRole: 'Jugador 1',
          }))
          setFraseLoading(false)
          return
        }

        const data = (await response.json()) as CoartadaResponse

        if (data.frases && data.frases.length > 0) {
          const frase = data.frases[0].content
          setState(prev => ({
            ...prev,
            frase,
            playerRole: `Frase ${data.frases[0].number}`,
          }))
        }
      } catch (err) {
        console.error('Failed to fetch coartada:', err)
        // Fallback de seguretat per no bloquejar el jugador
        const tpl = PREVIEW_COARTADES[0]
        setState(prev => ({
          ...prev,
          frase: tpl.frases[0],
          coartadaType: tpl.name,
          playerRole: 'Jugador 1',
        }))
      } finally {
        setFraseLoading(false)
      }
    }

    fetchCoartada()
  }, [isPreview, previewTemplateIndex, previewFraseIndex])

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleConfirmMemory = () => {
    if (!state.frase) return
    play('bell-ding')
    setState(prev => ({ ...prev, currentScreen: 'waiting' }))
  }

  const handleMasterValidation = async (passedClean: boolean) => {
    if (passedClean) {
      play('evidence-unlock')
      await props.submit({
        type: 'control_validation',
        passed: true,
        salconduitLost: 0,
        timestamp: new Date().toISOString(),
      })
      setState(prev => ({
        ...prev,
        currentScreen: 'result',
        passed: true,
        salconduitLost: 0,
      }))
    } else {
      play('buzzer')
      await props.submit({
        type: 'control_validation',
        passed: true, // No bloqueja, però penalitza
        salconduitLost: 1,
        timestamp: new Date().toISOString(),
      })
      setState(prev => ({
        ...prev,
        currentScreen: 'result',
        passed: true,
        salconduitLost: 1,
      }))
    }
  }

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'intro',
      passed: false,
      salconduitLost: 0,
    }))
  }

  return (
    <motion.div
      className="w-full max-w-xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Capçalera històrica oficial */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 5 · Pla de Masset
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          CONTROL DE L'EMISSARI
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "L'agent del Capità de Vic barra el pas cap a la Rectoria. Sostingueu la vostra coartada sense titubejar ni contradir-vos."
        </p>
      </header>

      {/* Selector per al mode Preview (canviar coartada o jugador) */}
      {isPreview && (
        <div className="mb-4 p-3 bg-[#EAE0CA] border border-[#8C6D53] rounded-xl text-xs font-sans text-[#5C4533] flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold text-[#1D3557]">
            <span>🔍 Panell d'Explorador (Preview)</span>
            <span className="bg-[#D8CCAE] px-2 py-0.5 rounded text-[11px]">Mode Simulació</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-[#8C6D53] mb-1">
                Plantilla de Coartada:
              </label>
              <select
                value={previewTemplateIndex}
                onChange={e => {
                  setPreviewTemplateIndex(Number(e.target.value))
                  if (state.currentScreen !== 'intro') handleReset()
                }}
                className="w-full p-1.5 bg-[#F4EBD9] border border-[#8C6D53] rounded text-xs font-serif text-[#2B2118]"
              >
                {PREVIEW_COARTADES.map((t, idx) => (
                  <option key={t.id} value={idx}>
                    {t.id}: {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8C6D53] mb-1">
                Jugador simulador:
              </label>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <button
                    key={i}
                    onClick={() => {
                      setPreviewFraseIndex(i)
                      if (state.currentScreen !== 'intro') handleReset()
                    }}
                    className={`flex-1 py-1 text-xs rounded border font-bold ${
                      previewFraseIndex === i
                        ? 'bg-[#1D3557] text-white border-[#1D3557]'
                        : 'bg-[#F4EBD9] text-[#5C4533] border-[#8C6D53] hover:bg-[#D8CCAE]'
                    }`}
                  >
                    J{i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla 1: Intro / Memorització de la frase */}
      {state.currentScreen === 'intro' && (
        <IntroScreen
          frase={state.frase}
          role={state.playerRole || `Jugador ${previewFraseIndex + 1}`}
          loading={fraseLoading}
          error={fraseError}
          onContinue={handleConfirmMemory}
        />
      )}

      {/* Pantalla 2: Esperant l'interrogatori de l'Emissari */}
      {state.currentScreen === 'waiting' && (
        <WaitingScreen
          frase={state.frase}
          isPreview={isPreview}
          onValidate={handleMasterValidation}
          onPeek={() => setShowPeekModal(true)}
        />
      )}

      {/* Pantalla 3: Resultat del control */}
      {state.currentScreen === 'result' && (
        <ResultScreen
          passed={state.passed}
          salconduitLost={state.salconduitLost}
          onReset={handleReset}
          isPreview={isPreview}
        />
      )}

      {/* Modal emergent per tornar a mirar la frase en cas de dubte extrem */}
      <AnimatePresence>
        {showPeekModal && state.frase && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPeekModal(false)}
          >
            <motion.div
              className="bg-[#F4EBD9] border-2 border-[#8C6D53] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-2xl mb-2">🤫</div>
              <h3 className="font-bold text-[#1D3557] uppercase text-xs tracking-wider mb-2 font-sans">
                Recordatori discret de la teva frase
              </h3>
              <div className="bg-[#EAE0CA] border border-[#8C6D53] p-4 rounded-xl mb-4 text-[#2B2118] font-serif italic text-base leading-relaxed">
                «{state.frase}»
              </div>
              <p className="text-xs text-[#8C6D53] mb-4">
                Guarda el mòbil abans que l'Emissari us comenci a interrogar!
              </p>
              <button
                onClick={() => setShowPeekModal(false)}
                className="w-full py-2 bg-[#1D3557] text-white rounded-lg font-sans font-bold text-sm shadow hover:bg-[#162740] transition"
              >
                Entès, tancar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Pantalla 1: Presentació de la coartada individual
 */
function IntroScreen({
  frase,
  role,
  loading,
  error,
  onContinue,
}: {
  frase?: string
  role?: string
  loading: boolean
  error: string | null
  onContinue: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Targeta Principal d'Alerta Secreta */}
      <div className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-2xl shadow-md p-6 sm:p-7 relative overflow-hidden">
        {/* Marca d'aigua de fons */}
        <div className="absolute top-2 right-3 text-7xl opacity-5 select-none pointer-events-none">
          🛡️
        </div>

        <div className="flex items-center justify-between mb-4 border-b border-[#8C6D53]/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#1D3557]">
              Salvaconducte de l'Emissari
            </span>
          </div>
          <span className="bg-[#D8CCAE] text-[#5C4533] border border-[#8C6D53]/60 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold">
            {role || 'Confidencial'}
          </span>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#2B2118] font-serif">
            Memorització de la Coartada
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4533] italic mt-0.5">
            Aquesta és la teva part del jurament. Cap altre company té la mateixa frase.
          </p>
        </div>

        {/* Caixa de la Frase Secreta */}
        <div className="bg-[#F4EBD9] border-2 border-[#B8860B] rounded-xl p-5 sm:p-6 shadow-inner text-center min-h-[130px] flex items-center justify-center my-2">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin text-3xl">⏳</div>
              <p className="text-xs font-sans text-[#8C6D53]">Consultant el registre...</p>
            </div>
          ) : error ? (
            <p className="text-sm font-bold text-red-700">⚠️ {error}</p>
          ) : frase ? (
            <p className="text-base sm:text-lg font-bold font-serif leading-relaxed text-[#2B2118] italic">
              «{frase}»
            </p>
          ) : (
            <p className="text-sm text-[#8C6D53]">No s'ha trobat cap frase assignada.</p>
          )}
        </div>

        {/* Instruccions de conducta */}
        <div className="mt-5 bg-[#FDFBF7] border border-[#C2B299] rounded-xl p-4 text-xs sm:text-sm text-[#5C4533] space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-amber-700 font-bold">⚠️</span>
            <span>
              <strong>No la canviis ni improvisis:</strong> L'Emissari us farà preguntes ràpides i compararà les vostres respostes.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-700 font-bold">🤫</span>
            <span>
              <strong>No l'ensenyis als altres:</strong> Cada membre de l'equip ha de saber la seva sense mirar la dels altres.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold">✓</span>
            <span>
              <strong>Si tots manteniu la coherència:</strong> Passareu el control sense perdre cap dels vostres 3 salconduits.
            </span>
          </div>
        </div>
      </div>

      {/* Botó de Confirmació de Memòria */}
      <motion.button
        onClick={onContinue}
        disabled={loading || !frase}
        className="w-full py-4 px-6 bg-[#1D3557] hover:bg-[#162740] active:scale-98 text-white rounded-xl font-sans font-bold text-base sm:text-lg shadow-lg border-2 border-[#1D3557] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={!loading && frase ? { scale: 1.01 } : {}}
        whileTap={!loading && frase ? { scale: 0.98 } : {}}
      >
        <span>📜</span>
        <span>HE MEMORITZAT LA FRASE</span>
      </motion.button>
    </div>
  )
}

/**
 * Pantalla 2: Estat d'espera i interrogatori
 */
function WaitingScreen({
  frase,
  isPreview,
  onValidate,
  onPeek,
}: {
  frase?: string
  isPreview: boolean
  onValidate: (clean: boolean) => void
  onPeek: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-2xl shadow-md p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Icona i il·luminació medieval */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-[#D8CCAE] border-2 border-[#8C6D53] flex items-center justify-center shadow-inner">
          <span className="text-3xl sm:text-4xl animate-pulse">🕯️</span>
        </div>

        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold block mb-1">
          Control Actiu
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1D3557] font-serif mb-2">
          ESPERANT L'INTERROGATORI...
        </h2>
        <p className="text-xs sm:text-sm text-[#5C4533] italic max-w-md mx-auto mb-6">
          "L'Emissari és davant vostre. Guardeu silenci fins que us pregunti directament i responeu amb seguretat."
        </p>

        <div className="bg-[#F4EBD9] border border-[#8C6D53] rounded-xl p-4 text-xs text-[#5C4533] text-left space-y-2 mb-6">
          <p className="font-bold text-[#1D3557] font-sans">
            Com actuar davant de l'Emissari:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Mantingueu la mirada ferma i no mostreu dubtes.</li>
            <li>Quan l'Emissari us demani el motiu del vostre pas, digueu la vostra frase.</li>
            <li>El Màster / Emissari avaluarà la coherència del grup a la seva consola.</li>
          </ul>
        </div>

        {/* Botó discret per consultar de nou la frase si s'ha oblidat */}
        {frase && (
          <button
            type="button"
            onClick={onPeek}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold text-[#5C4533] bg-[#D8CCAE] hover:bg-[#C8BA99] border border-[#8C6D53]/60 rounded-lg transition shadow-sm"
          >
            <span>👁️</span>
            <span>Recordar la meva frase discretament</span>
          </button>
        )}
      </div>

      {/* Si estem en Preview, oferim els botons de simulació del Màster per poder testejar el flux sencer */}
      {isPreview && (
        <div className="bg-[#D8CCAE] border-2 border-[#8C6D53] rounded-xl p-4 text-center">
          <p className="text-xs font-sans font-bold text-[#1D3557] uppercase tracking-wider mb-3">
            👑 Accions del Màster (Simulació per a proves)
          </p>
          <p className="text-xs text-[#5C4533] mb-4">
            A la partida real, aquests botons els prem el Màster des del seu panell en avaluar l'interrogatori:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onValidate(true)}
              className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-sans font-bold text-sm shadow transition flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>Validar: Pas Net (0 penalització)</span>
            </button>
            <button
              onClick={() => onValidate(false)}
              className="flex-1 py-3 px-4 bg-[#842029] hover:bg-[#6c1720] text-white rounded-xl font-sans font-bold text-sm shadow transition flex items-center justify-center gap-2"
            >
              <span>✗</span>
              <span>Dubte / Error (−1 Salconduit)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Pantalla 3: Resolució de l'interrogatori
 */
function ResultScreen({
  passed,
  salconduitLost,
  onReset,
  isPreview,
}: {
  passed: boolean
  salconduitLost: number
  onReset: () => void
  isPreview: boolean
}) {
  return (
    <div className="flex flex-col gap-6">
      <div
        className={`border-2 rounded-2xl shadow-lg p-6 sm:p-8 text-center ${
          salconduitLost > 0
            ? 'bg-[#F8D7DA] border-[#842029] text-[#842029]'
            : 'bg-[#D1E7DD] border-[#0F5132] text-[#0F5132]'
        }`}
      >
        <div className="text-5xl mb-3">{salconduitLost > 0 ? '⚠️' : '🎖️'}</div>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
          {salconduitLost > 0 ? '−1 SALCONDUIT' : 'COARTADA ACCEPTADA'}
        </h2>

        <p className="text-sm sm:text-base font-sans font-semibold mb-4">
          {salconduitLost > 0
            ? "L'Emissari ha detectat contradiccions o vacil·lacions en el vostre relat."
            : "L'Emissari ha donat per bona la vostra declaració col·lectiva."}
        </p>

        <div className="bg-white/60 rounded-xl p-4 text-xs sm:text-sm font-serif italic mb-6 leading-relaxed">
          {salconduitLost > 0 ? (
            <p>
              "Se us retira un dels tres salconduits reials per ordre de la guàrdia. Podeu continuar avançant cap al Pla de Masset, però vigileu bé les vostres passes."
            </p>
          ) : (
            <p>
              "Cap esquerda en la vostra història. L'Emissari us fa un senyal displicent i us obre el pas cap al Pla de Masset i la Rectoria sense cap penalització."
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isPreview && (
            <button
              onClick={onReset}
              className="py-2.5 px-5 bg-white/80 hover:bg-white text-[#2B2118] border border-current rounded-xl text-xs font-sans font-bold transition shadow-sm"
            >
              🔄 Provar una altra vegada (Preview)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
