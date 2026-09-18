'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  zoomVariants,
} from '@/lib/animations/useAnimations'

interface BoxGameState {
  currentPart: 1 | 2 | 3
  currentScreen: 'cards' | 'card_detail' | 'seal' | 'seal_detail' | 'sealed' | 'complete'
  part1Tab: 'historia' | 'pistes' | 'cadenat' | 'cofre'
  part1Code: string
  part1Attempts: number
  part1Solved: boolean
  part2SelectedDate: string | null
  part2StolenCards: string[]
  part2SelectedCard: string | null
  part3SelectedSeal: string | null
  isCorrect: boolean
}


const CORRECT_DATE = '16-05'
const CORRECT_SEAL = 'bernat' // El segell correcte és el de Bernat

const SEAL_OPTIONS = [
  { id: 'bernat', label: 'Àncora Vermella', icon: '🔴', desc: 'Segell de Bernat - filigrana de l\'àncora' },
  { id: 'anton', label: 'Creu Negra', icon: '✕', desc: 'Segell de l\'Anton - creu simple' },
  { id: 'jaume', label: 'Estrelles', icon: '✦', desc: 'Segell de Jaume - dues estrelles' },
  { id: 'capitan', label: 'Lleo Reial', icon: '🦁', desc: 'Segell del Capità - lleó reial' },
]

const CARD_DETAILS: Record<string, {
  signature: string;
  seal: string;
  date: string;
  from: string;
  content: string;
  analysis: string;
  correct: boolean
}> = {
  '14-05': {
    signature: 'Jaume Sala',
    seal: '◆✓',
    date: '14 de maig de 1705',
    from: 'Jaume (fill de Bernat)',
    content: 'Pare, la carta és a la rectoria com es va acordar. He parlat amb els homes del paller i diuen que el rector està en perill. No podem esperar més.\n\n— J.S.',
    analysis: 'Signatura jove, insegura. Podria ser del fill, però la lletra no coincideix amb mostres d\'escrit juvenil.',
    correct: false
  },
  '15-05': {
    signature: 'Bernat Sala',
    seal: '◆✓',
    date: '15 de maig de 1705',
    from: 'Bernat Sala (Mestre escola)',
    content: 'He retornat de Vic. Tot està acordat. Els noms estan dins el sobre, segellat. Es lliura demà a l\'alba. Que Déu ens protegeixi.\n\n— B.S.',
    analysis: 'Segell irregular, manca precisió. La filigrana no és consistent amb els escrits de Bernat.',
    correct: false
  },
  '16-05': {
    signature: 'Bernat Sala',
    seal: '✓✓',
    date: '16 de maig de 1705',
    from: 'Bernat Sala (Mestre escola)',
    content: 'Mossèn Ramon,\n\nEnviament dels noms dels signants per al Pacte. Els homes de Sant Sebastià han estat seleccionats. Es presenten a l\'alba. El rector ha de guardar aquesta carta fins a l\'últim moment.\n\nEl mestre ha fet la seva part.\n\n— B.S.',
    analysis: 'Segell perfecte i consistent. Filigrana de l\'àncora coincideix. Aquesta és l\'original.',
    correct: true
  },
  '17-05': {
    signature: 'Anton Sala',
    seal: '✓✓',
    date: '17 de maig de 1705',
    from: 'Anton (Escolà)',
    content: 'Bernat, no possis la carta del 16 al sobre. He sabut que l\'Emissari ronda pels camps. Millor no arribar. Els signants ja saben el lloc.\n\n— A.S.',
    analysis: 'Data posterior al dia dels fets. Lletra clara però l\'Anton no sap de tinta. Impossible.',
    correct: false
  },
  '13-05': {
    signature: 'Jaume',
    seal: '◆',
    date: '13 de maig de 1705',
    from: 'Jaume (sense vincle clar)',
    content: 'He rebut el missatge. Els dragó es mouen cap a Manlleu. Déu meu, si ho descobreixen...\n\n— J.',
    analysis: 'Signatura incompleta, imprecisa. Segell fragmentat i mal format. No sembla autèntica.',
    correct: false
  },
  '18-05': {
    signature: 'Anton de Manlleu',
    seal: '◆◆',
    date: '18 de maig de 1705',
    from: 'Anton (foraster)',
    content: 'Els conjurats han marxat. La carta no arribarà a Vic. Bernat ha dit que fugirà cap al nord. Que no el trobin.\n\n— A.M.',
    analysis: 'Segell clarament falsificat: dues marques idèntiques, innaturals. Letra posterior als fets.',
    correct: false
  },
}

const BOX_ITEMS = [
  { id: 'sobre', type: 'sobre' as const, label: 'Carta Segellada', emoji: '📬' },
  { id: '14-05', type: 'carta' as const, label: 'Carta 1', emoji: '📄' },
  { id: '15-05', type: 'carta' as const, label: 'Carta 2', emoji: '📄' },
  { id: '16-05', type: 'carta' as const, label: 'Carta 3', emoji: '📄' },
  { id: '17-05', type: 'carta' as const, label: 'Carta 4', emoji: '📄' },
  { id: '13-05', type: 'carta' as const, label: 'Carta 5', emoji: '📄' },
  { id: '18-05', type: 'carta' as const, label: 'Carta 6', emoji: '📄' },
  { id: 'nota', type: 'nota' as const, label: 'Nota', emoji: '📝' },
]

/**
 * Joc 7: Caixa de les Almoines (Parts 1-3)
 * Part 1: Obrir caixa (codi 4231)
 * Part 2: Substitució carta (data 16-05)
 * Part 3: Sometent + Decisió moral
 */
export function BoxGame(props: GameProps) {
  const { play } = useAudio()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [state, setState] = useState<BoxGameState>(() => {
    const saved = props.sharedState as BoxGameState | undefined
    if (saved && 'currentPart' in saved) {
      return saved
    }
    return {
      currentPart: 1,
      currentScreen: 'cards',
      part1Tab: 'historia',
      part1Code: '',
      part1Attempts: 0,
      part1Solved: false,
      part2SelectedDate: null,
      part2StolenCards: [],
      part2SelectedCard: null,
      part3SelectedSeal: null,
      isCorrect: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handlePart1Submit = async () => {
    if (!state.part1Code.trim()) {
      setError('Introdueix la contrasenya')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: '1',
          answer: state.part1Code,
        }),
      })

      const data = await res.json()

      if (data.success) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          part1Solved: true,
          part1Tab: 'cofre',
        }))
      } else {
        play('buzzer')
        setError(data.message || 'Contrasenya incorrecta')
        setState(prev => ({ ...prev, part1Attempts: prev.part1Attempts + 1, part1Code: '' }))
      }
    } catch (err) {
      play('buzzer')
      setError('Error en la validació')
    } finally {
      setLoading(false)
    }
  }

  const handlePart2Submit = async () => {
    if (!state.part2SelectedDate) {
      setError('Selecciona una data')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: '2',
          answer: state.part2SelectedDate,
        }),
      })

      const data = await res.json()

      if (data.success) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          currentPart: 3,
          currentScreen: 'seal',
        }))
      } else {
        play('buzzer')
        setError(data.message || 'Data incorrecta')
        setState(prev => ({
          ...prev,
          part2SelectedDate: null,
          part2SelectedCard: null,
        }))
      }
    } catch (err) {
      play('buzzer')
      setError('Error en la validació')
    } finally {
      setLoading(false)
    }
  }

  const handlePart3Seal = async () => {
    if (!state.part3SelectedSeal) {
      setError('Selecciona un segell')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/game/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: '3',
          answer: state.part3SelectedSeal,
        }),
      })

      const data = await res.json()

      if (data.success) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          currentScreen: 'sealed',
        }))
      } else {
        play('buzzer')
        setError('Segell incorrecte. El segell de Bernat és el correcte.')
        setState(prev => ({
          ...prev,
          part3SelectedSeal: null,
        }))
      }
    } catch (err) {
      play('buzzer')
      setError('Error en validar el segell')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded mb-4 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer at top */}
      <div className="text-right text-xs font-mono text-[#8C6D53] mb-2 font-sans">
        12:34:56
      </div>

      {/* Part 1: Obrir caixa */}
      {state.currentPart === 1 && (
        <Part1WithMenu
          tab={state.part1Tab}
          onTabChange={tab => setState(prev => ({ ...prev, part1Tab: tab }))}
          code={state.part1Code}
          onCodeChange={val => setState(prev => ({ ...prev, part1Code: val }))}
          onSubmit={handlePart1Submit}
          attempts={state.part1Attempts}
          solved={state.part1Solved}
          onContinueToPart2={() => setState(prev => ({
            ...prev,
            currentPart: 2,
            currentScreen: 'cards',
          }))}
        />
      )}

      {/* Part 2: La Carta Segellada */}
      {state.currentPart === 2 && (state.currentScreen === 'cards' || state.currentScreen === 'card_detail') && (
        <>
          <Part2CardsScreen
            stolenCards={new Set(state.part2StolenCards)}
            selectedDate={state.part2SelectedDate}
            onSelectCard={id => setState(prev => ({ ...prev, part2SelectedCard: id }))}
            onRobarCarta={() => {
              setState(prev => ({
                ...prev,
                part2StolenCards: prev.part2StolenCards.includes('sobre')
                  ? prev.part2StolenCards
                  : [...prev.part2StolenCards, 'sobre'],
              }))
              play('bell-ding')
            }}
            onSubmit={handlePart2Submit}
            loading={loading}
          />
          <AnimatePresence>
            {state.part2SelectedCard && (
              <BoxItemModal
                itemId={state.part2SelectedCard}
                stolenCards={new Set(state.part2StolenCards)}
                selectedDate={state.part2SelectedDate}
                onRobarCarta={() => {
                  setState(prev => ({
                    ...prev,
                    part2StolenCards: prev.part2StolenCards.includes('sobre')
                      ? prev.part2StolenCards
                      : [...prev.part2StolenCards, 'sobre'],
                  }))
                  play('bell-ding')
                }}
                onSubstituir={date => {
                  setState(prev => ({ ...prev, part2SelectedDate: date }))
                  play('bell-ding')
                }}
                onClose={() => setState(prev => ({ ...prev, part2SelectedCard: null }))}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Part 3: Segellar la carta */}
      {state.currentPart === 3 && state.currentScreen === 'seal' && (
        <Part3SealScreen
          selectedSeal={state.part3SelectedSeal}
          onSelectSeal={id => setState(prev => ({ ...prev, part3SelectedSeal: id }))}
          onSubmit={handlePart3Seal}
          error={error}
          loading={loading}
        />
      )}

      {state.currentScreen === 'sealed' && (
        <Part4CompleteScreen />
      )}
    </motion.div>
  )
}

function Part1WithMenu({
  tab,
  onTabChange,
  code,
  onCodeChange,
  onSubmit,
  attempts,
  solved,
  onContinueToPart2,
}: {
  tab: 'historia' | 'pistes' | 'cadenat' | 'cofre'
  onTabChange: (tab: 'historia' | 'pistes' | 'cadenat' | 'cofre') => void
  code: string
  onCodeChange: (val: string) => void
  onSubmit: () => void
  attempts: number
  solved: boolean
  onContinueToPart2: () => void
}) {
  const digits = code.padEnd(4, '0').slice(0, 4).split('')

  const handleDigitChange = (index: number, value: string) => {
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1) || '0'
    onCodeChange(newDigits.join(''))
  }

  const isCorrect = code.replace(/[\s-]/g, '') === '4231'

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Header */}
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          CAIXA DE LES ALMOINES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "El cadenat protegeix secrets del Pacte dels Vigatans"
        </p>
      </header>

      {/* Menu de pestanyes */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          {/* Historia */}
          <button
            type="button"
            onClick={() => onTabChange('historia')}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              tab === 'historia'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>📖</span>
            <span>Historia</span>
          </button>

          {/* Pistes */}
          <button
            type="button"
            onClick={() => onTabChange('pistes')}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              tab === 'pistes'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>💡</span>
            <span>Pistes</span>
          </button>

          {/* Cadenat */}
          <button
            type="button"
            onClick={() => onTabChange('cadenat')}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              tab === 'cadenat'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
            }`}
          >
            <span>🔒</span>
            <span>Cadenat</span>
          </button>

          {/* Cofre (desabled si no resolt) */}
          <button
            type="button"
            onClick={() => solved && onTabChange('cofre')}
            disabled={!solved}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              tab === 'cofre'
                ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                : solved
                  ? 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8] cursor-pointer'
                  : 'text-[#A9A09A] cursor-not-allowed'
            }`}
          >
            <span>🏺</span>
            <span>Cofre</span>
          </button>
        </div>

        {/* Contingut de les pestanyes */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Historia */}
            {tab === 'historia' && (
              <motion.div
                key="historia"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div
                  className="bg-[#F5EFE0] border border-[#8C6D53] rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-[#2B2118] leading-relaxed mb-3">
                    La <strong>Caixa de les Almoines</strong> de la Rectoria de la Guixa amaga el
                    testament secret dels conjurats. En Bernat Sala t'ha fet arribar la clau i la
                    paraula d'ordre. Obre-la, substitueix la carta comprometedora per una
                    d'inofensiva i tanca-la de nou — abans que no arribi el correu reial.
                  </p>
                </motion.div>

                {/* Padlock — floating animation */}
                <motion.div
                  className="flex justify-center"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-5xl drop-shadow-md select-none">🔒</span>
                </motion.div>
              </motion.div>
            )}

            {/* Pistes */}
            {tab === 'pistes' && (
              <motion.div
                key="pistes"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-[#F0EAE3] border border-[#D8CCAE] rounded-lg p-3 shadow-inner">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {/* FOC */}
                    <div className="group relative bg-gradient-to-b from-orange-50 to-white p-2.5 rounded-lg border border-amber-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="text-2xl sm:text-3xl animate-bounce [animation-duration:2.5s]">
                        🔥
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-amber-900 uppercase">
                        Foc
                      </div>
                      <div className="mt-1.5 text-[9px] text-amber-800 font-bold">4</div>
                    </div>

                    {/* AIGUA */}
                    <div className="group relative bg-gradient-to-b from-blue-50 to-white p-2.5 rounded-lg border border-sky-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="text-2xl sm:text-3xl animate-pulse [animation-duration:2s]">
                        💧
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-sky-900 uppercase">
                        Aigua
                      </div>
                      <div className="mt-1.5 text-[9px] text-sky-800 font-bold">2</div>
                    </div>

                    {/* TERRA */}
                    <div className="group relative bg-gradient-to-b from-emerald-50 to-white p-2.5 rounded-lg border border-emerald-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="text-2xl sm:text-3xl animate-bounce [animation-duration:3s]">
                        🌍
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-emerald-900 uppercase">
                        Terra
                      </div>
                      <div className="mt-1.5 text-[9px] text-emerald-800 font-bold">3</div>
                    </div>

                    {/* PEDRA */}
                    <div className="group relative bg-gradient-to-b from-stone-50 to-white p-2.5 rounded-lg border border-stone-400 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <div className="text-2xl sm:text-3xl animate-pulse [animation-duration:2.8s]">
                        ⛰️
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-stone-900 uppercase">
                        Pedra
                      </div>
                      <div className="mt-1.5 text-[9px] text-stone-800 font-bold">1</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cadenat */}
            {tab === 'cadenat' && (
              <motion.div
                key="cadenat"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div
                  className="bg-gradient-to-b from-[#8C6D53] via-[#6B5244] to-[#5C4533] border-4 border-[#3D3428] rounded-xl p-6 shadow-2xl relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#A0795A] to-[#8C6D53] border-b-2 border-[#3D3428]"></div>
                  <div className="absolute top-6 right-4 text-2xl opacity-80">🔒</div>

                  <div className="mt-6 mb-2">
                    <p className="text-center text-xs text-[#EAE0CA] font-sans font-bold mb-4 uppercase tracking-wider">
                      Gira les rodes
                    </p>

                    <motion.div
                      className="bg-[#D8CCAE] border-4 border-[#5C4533] rounded-lg p-4 mb-4 shadow-inner"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex gap-4 justify-center">
                        {[0, 1, 2, 3].map((index, idx) => (
                          <div key={index} className="flex flex-col items-center">
                            <DialWheel
                              value={parseInt(digits[index] || '0')}
                              onChange={val => handleDigitChange(index, String(val))}
                            />
                            <div className="mt-2 text-center">
                              <p className="text-xs text-[#5C4533] font-sans font-bold">{['FOC', 'AIGUA', 'TERRA', 'PEDRA'][idx]}</p>
                             
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {attempts > 0 && (
                  <motion.div
                    className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-lg text-center text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="font-bold font-sans">❌ Intent {attempts}/3</p>
                    <p className="text-xs">Revisa les pistes dels 4 elements</p>
                  </motion.div>
                )}

                <motion.button
                  onClick={onSubmit}
                  disabled={!isCorrect}
                  className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
                    isCorrect
                      ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
                      : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
                  }`}
                  whileHover={isCorrect ? { scale: 1.02 } : {}}
                  whileTap={isCorrect ? { scale: 0.98 } : {}}
                >
                  🔓 OBRIR CADENAT
                </motion.button>
              </motion.div>
            )}

            {/* Cofre */}
            {tab === 'cofre' && solved && (
              <motion.div
                key="cofre"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div
                  className="bg-[#D5F4E6] border-2 border-[#16A085] p-6 rounded-lg shadow-lg text-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <motion.p
                    className="text-5xl mb-3"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    🏺
                  </motion.p>
                  <p className="font-bold text-[#117A65] text-sm">COFRE OBERT!</p>
                  <p className="text-xs text-[#16A085] mt-2">El cadenat s'ha obrit correctament</p>
                </motion.div>

                <p className="text-xs text-[#5C4533] italic text-center">
                  La caixa de les almoines està oberta. Passa a la Part 2 per examinar el seu contingut.
                </p>

                <motion.button
                  onClick={onContinueToPart2}
                  className="w-full p-3 bg-[#2B2118] text-[#EAE0CA] font-bold text-sm border-2 border-[#2B2118] hover:bg-[#1D3557] rounded-lg transition font-sans"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CONTINUAR A LA PART 2 →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}


function DialWheel({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  const [direction, setDirection] = useState<1 | -1>(1)

  const handleNext = () => {
    setDirection(1)
    onChange((value + 1) % 10)
  }

  const handlePrev = () => {
    setDirection(-1)
    onChange((value - 1 + 10) % 10)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        type="button"
        onClick={handleNext}
        className="w-12 h-8 bg-[#8C6D53] text-[#EAE0CA] font-bold text-lg rounded hover:bg-[#6B5244] transition flex items-center justify-center cursor-pointer shadow-sm"
        whileTap={{ scale: 0.9 }}
      >
        ▲
      </motion.button>

      <div className="w-14 h-16 bg-[#D8CCAE] border-4 border-[#8C6D53] rounded flex items-center justify-center text-3xl font-bold text-[#2B2118] shadow-lg relative overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.span
            key={value}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                y: dir > 0 ? 30 : -30,
                opacity: 0,
              }),
              center: {
                y: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                y: dir > 0 ? -30 : 30,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="select-none font-franklin font-extrabold tracking-tight"
            style={{ fontFamily: '"Franklin Gothic Medium", "Franklin Gothic", "Libre Franklin", sans-serif' }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={handlePrev}
        className="w-12 h-8 bg-[#8C6D53] text-[#EAE0CA] font-bold text-lg rounded hover:bg-[#6B5244] transition flex items-center justify-center cursor-pointer shadow-sm"
        whileTap={{ scale: 0.9 }}
      >
        ▼
      </motion.button>
    </div>
  )
}

function Part2CardsScreen({
  stolenCards,
  selectedDate,
  onSelectCard,
  onRobarCarta,
  onSubmit,
  loading,
}: {
  stolenCards: Set<string>
  selectedDate: string | null
  onSelectCard: (id: string) => void
  onRobarCarta: () => void
  onSubmit: () => void
  loading: boolean
}) {
  const [activeTab, setActiveTab] = useState<'sobre' | 'cartes' | 'nota'>('sobre')
  const [sobreObert, setSobreObert] = useState(false)
  const sobreRobat = stolenCards.has('sobre')
  const cartesIds = ['14-05', '15-05', '16-05', '17-05', '13-05', '18-05']

  const TABS = [
    { id: 'sobre' as const, label: 'El Sobre', emoji: '📬' },
    { id: 'cartes' as const, label: 'Les Cartes', emoji: '📄' },
    { id: 'nota' as const, label: 'La Nota', emoji: '📝' },
  ]
  return (
    <div className="flex flex-col flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          LA CARTA SEGELLADA
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "Examina el contingut de la caixa i substitueix la carta correcta"
        </p>
      </header>

      {/* Tab bar */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                  : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {/* ── El Sobre ── */}
          {activeTab === 'sobre' && (
            <AnimatePresence mode="wait">
              {!sobreObert ? (
                <motion.div
                  key="tancat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  <div
                    className="relative bg-gradient-to-br from-[#E8DCC8] via-[#E5D9C3] to-[#D8CCAE] border-2 border-[#8C6D53] p-6 text-center rounded-sm shadow-xl overflow-hidden"
                    style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,109,83,0.04) 3px, rgba(139,109,83,0.04) 6px),repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(139,109,83,0.04) 3px, rgba(139,109,83,0.04) 6px)` }}
                  >
                    <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none">
                      <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-t-[40px] border-l-transparent border-r-transparent border-t-[#C9BDAA] opacity-60" />
                    </div>

                    <div className="relative z-10 pt-4">
                      <p className="text-xs text-[#8C6D53] uppercase tracking-widest font-bold font-sans mb-1">Sobre Segellat</p>
                      <p className="text-xs text-[#5C4533] font-sans mb-6">
                        Bernat Sala · 16 de maig de 1705
                      </p>

                      <motion.button
                        onClick={() => !sobreRobat && setSobreObert(true)}
                        className="mx-auto mb-5 flex flex-col items-center gap-2 group"
                        whileHover={!sobreRobat ? { scale: 1.1 } : {}}
                        whileTap={!sobreRobat ? { scale: 0.92 } : {}}
                      >
                        <div className={`w-20 h-20 rounded-full border-4 shadow-2xl flex items-center justify-center transition-all ${
                          sobreRobat
                            ? 'bg-gray-400 border-gray-500 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-br from-red-700 via-red-600 to-red-900 border-red-900 group-hover:shadow-red-900/60 cursor-pointer'
                        }`}>
                          <span className="text-3xl select-none">{sobreRobat ? '💔' : '⚓'}</span>
                        </div>
                        <span className="text-xs font-sans italic text-[#8C6D53]">
                          {sobreRobat ? 'Carta destruïda' : 'Clica el segell per obrir'}
                        </span>
                      </motion.button>

                      <p className="text-xs text-[#5C4533] italic">Segell intacte · Filigrana: Àncora</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="obert"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="relative bg-[#F5EFE0] border-2 border-[#8C6D53] p-5 rounded-sm shadow-lg mb-4"
                    style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(139,109,83,0.03) 2px,rgba(139,109,83,0.03) 4px)' }}
                  >
                    <div className="absolute top-3 right-3 opacity-30 transform rotate-12 text-2xl select-none">🔴</div>

                    <p className="text-xs text-[#8C6D53] uppercase tracking-widest font-bold font-sans mb-1">📅 16 de maig de 1705</p>
                    <p className="text-xs text-[#5C4533] italic font-sans mb-4">De: Bernat Sala, Mestre d'Escola</p>

                    <div className="bg-white/60 p-4 rounded border border-[#D8CCAE] mb-3">
                      <p className="text-xs text-[#2B2118] leading-relaxed whitespace-pre-wrap font-serif">
                        {CARD_DETAILS['16-05'].content}
                      </p>
                    </div>

                    <div className="bg-[#FFF9F0] border border-[#D8CCAE] p-3 rounded">
                      <p className="text-xs text-[#5C4533] italic">
                        <span className="font-bold">Observació:</span> {CARD_DETAILS['16-05'].analysis}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setSobreObert(false)}
                      className="flex-1 p-3 bg-[#D8CCAE] text-[#2B2118] font-bold border-2 border-[#8C6D53] rounded-lg text-sm font-sans hover:bg-[#C9BDAA] transition"
                      whileTap={{ scale: 0.95 }}
                    >
                      Tancar
                    </motion.button>
                    <motion.button
                      onClick={() => { onRobarCarta(); setSobreObert(false) }}
                      disabled={sobreRobat}
                      className={`flex-1 p-3 font-bold border-2 rounded-lg text-sm transition font-sans ${
                        sobreRobat
                          ? 'bg-[#FADBD8] text-[#C0392B] border-[#E74C3C] cursor-default'
                          : 'bg-[#7B1A1A] text-[#F5EFE0] border-[#5C1010] hover:bg-[#5C1010]'
                      }`}
                      whileTap={!sobreRobat ? { scale: 0.95 } : {}}
                    >
                      {sobreRobat ? '✓ Carta destruïda' : '🔥 Destruir la carta'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ── Les Cartes ── */}
          {activeTab === 'cartes' && (
            <div className="flex flex-col gap-3">
              {selectedDate ? (
                <div className="bg-[#E8F8F5] border border-[#16A085] rounded p-2 text-center">
                  <p className="text-xs font-bold text-[#117A65]">✓ Carta seleccionada: {selectedDate}</p>
                </div>
              ) : (
                <p className="text-xs text-[#8C6D53] text-center italic font-sans">
                  Clica una carta per veure els detalls i substituir-la
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {cartesIds.map(date => {
                  const isSelected = selectedDate === date
                  const item = BOX_ITEMS.find(i => i.id === date)!
                  const details = CARD_DETAILS[date]
                  return (
                    <motion.button
                      key={date}
                      onClick={() => onSelectCard(date)}
                      className={`flex flex-col items-center justify-center p-3 border-2 rounded-sm min-h-[80px] text-center transition shadow-sm ${
                        isSelected
                          ? 'bg-[#D5F4E6] border-[#16A085] shadow-md'
                          : 'bg-[#F5EFE0] border-[#D8CCAE] hover:bg-[#EAE0CA] hover:border-[#8C6D53] hover:shadow-md'
                      }`}
                      style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(139,109,83,0.02) 2px,rgba(139,109,83,0.02) 4px)' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="text-xl mb-1">📄</span>
                      <span className={`text-xs font-bold font-sans leading-tight ${isSelected ? 'text-[#117A65]' : 'text-[#2B2118]'}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-[#8C6D53] font-sans mt-0.5">{details?.signature}</span>
                      {isSelected && <span className="text-xs text-[#16A085] font-bold mt-1">✓ triada</span>}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── La Nota ── */}
          {activeTab === 'nota' && (
            <div
              className="relative bg-[#F5EFE0] border-2 border-[#8C6D53] p-5 rounded-sm shadow-lg"
              style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(139,109,83,0.03) 2px,rgba(139,109,83,0.03) 4px)' }}
            >
              <div className="absolute top-2 right-3 text-xs text-[#8C6D53] font-bold uppercase font-sans">Del Capità</div>
              <div className="mt-6">
                <p className="text-xs text-[#2B2118] leading-relaxed mb-3 italic font-serif">
                  "Els noms arribar a trenc d'alba. I el vostre fill dorm a casa de la guarnició."
                </p>
                <div className="border-l-4 border-[#8C6D53] pl-3 my-3">
                  <p className="text-xs text-[#2B2118] font-bold font-sans">Contrasenya (qui la porta):</p>
                  <p className="text-xs text-[#5C4533] italic mt-1 font-serif">"L'alba ve de Vic"</p>
                </div>
                <p className="text-xs text-[#2B2118] mt-3 leading-relaxed font-serif">
                  Si la carteta arriba intacta amb aquesta contrasenya, l'Emissari sap que és cosa de Bernat.
                </p>
                <p className="text-xs text-[#8C6D53] italic mt-3 text-right font-sans">— De la guarnició de Vic</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <motion.button
        onClick={onSubmit}
        disabled={!selectedDate || loading}
        className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
          selectedDate && !loading
            ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={selectedDate && !loading ? { scale: 1.02 } : {}}
        whileTap={selectedDate && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Validant...' : '✓ SUBSTITUIR CARTA'}
      </motion.button>
    </div>
  )
}

function Part3SealScreen({
  selectedSeal,
  onSelectSeal,
  onSubmit,
  error,
  loading,
}: {
  selectedSeal: string | null
  onSelectSeal: (id: string) => void
  onSubmit: () => void
  error: string
  loading: boolean
}) {
  return (
    <div className="flex flex-col flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] mt-1 font-serif">
          EL SEGELL DE TRAÏDOR
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          Tria el segell correcte de Bernat
        </p>
      </header>

      {/* Context */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-sm p-3 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-[#2B2118] leading-relaxed">
          Dins la caixa hi ha diversos segells de cera. Ha de ser el de Bernat per que l'Emissari la reconegui.
        </p>
      </motion.div>

      {/* Grid de segells */}
      <div className="grid grid-cols-2 gap-3">
        {SEAL_OPTIONS.map(seal => {
          const isSelected = selectedSeal === seal.id
          return (
            <motion.button
              key={seal.id}
              onClick={() => onSelectSeal(seal.id)}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-sm transition ${
                isSelected
                  ? 'bg-[#D5F4E6] border-[#16A085] shadow-lg'
                  : 'bg-[#F5EFE0] border-[#D8CCAE] hover:bg-[#EAE0CA] hover:border-[#8C6D53]'
              }`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-4xl mb-2">{seal.icon}</span>
              <span className={`text-xs font-bold font-sans text-center ${
                isSelected ? 'text-[#117A65]' : 'text-[#2B2118]'
              }`}>
                {seal.label}
              </span>
              {isSelected && (
                <span className="text-xs text-[#16A085] mt-2 font-sans">✓ triat</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Descripció del segell seleccionat */}
      {selectedSeal && (
        <motion.div
          className="bg-[#FFF9F0] border border-[#D8CCAE] p-3 rounded-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xs text-[#5C4533] italic">
            {SEAL_OPTIONS.find(s => s.id === selectedSeal)?.desc}
          </p>
        </motion.div>
      )}

      {error && (
        <motion.div
          className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-sm text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={!selectedSeal || loading}
        className={`w-full p-3 font-bold text-sm border-2 transition rounded-lg font-sans ${
          selectedSeal && !loading
            ? 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={selectedSeal && !loading ? { scale: 1.02 } : {}}
        whileTap={selectedSeal && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Segellant...' : '🔴 SEGELLAR CARTA'}
      </motion.button>
    </div>
  )
}

function BoxItemModal({
  itemId,
  stolenCards,
  selectedDate,
  onRobarCarta,
  onSubstituir,
  onClose,
}: {
  itemId: string
  stolenCards: Set<string>
  selectedDate: string | null
  onRobarCarta: () => void
  onSubstituir: (date: string) => void
  onClose: () => void
}) {
  const item = BOX_ITEMS.find(i => i.id === itemId)
  if (!item) return null

  const isRobat = stolenCards.has(itemId)
  const isSelected = item.type === 'carta' && selectedDate === itemId
  const details = item.type === 'carta' ? CARD_DETAILS[itemId] : null

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#F0EAE3] border-4 border-[#8C6D53] rounded-xl p-6 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <p className="text-4xl mb-1">{item.emoji}</p>
          <h3 className="text-xl font-bold text-[#2B2118]">{item.label.toUpperCase()}</h3>
        </div>

        {/* Sobre */}
        {item.type === 'sobre' && (
          <div
            className="relative bg-gradient-to-br from-[#E8DCC8] via-[#E5D9C3] to-[#D8CCAE] border-3 border-[#8C6D53] p-6 mb-4 text-center rounded-sm shadow-xl overflow-hidden"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139, 109, 83, 0.04) 3px, rgba(139, 109, 83, 0.04) 6px),
                repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(139, 109, 83, 0.04) 3px, rgba(139, 109, 83, 0.04) 6px)
              `,
            }}
          >
            <div className="absolute top-2 left-2 text-2xl opacity-20">✉️</div>
            <div className="absolute bottom-2 right-2 text-2xl opacity-20">🔴</div>

            <div className="relative z-10">
              <div className="h-0.5 bg-[#8C6D53] mb-4 opacity-30"></div>

              <p className="text-sm font-bold text-[#2B2118] mb-3 font-serif">Sobre Segellat</p>

              <div className="bg-white/40 backdrop-blur-sm border border-[#8C6D53]/30 rounded p-3 mb-3">
                <p className="text-xs text-[#5C4533] mb-1">
                  <span className="font-bold">De:</span> Bernat Sala, Mestre d'Escola
                </p>
                <p className="text-xs text-[#8C6D53]">
                  <span className="font-bold">Data:</span> 16 de maig de 1705
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="flex-1 h-px bg-[#8C6D53] opacity-40"></div>
                <span className="text-sm text-[#8C6D53]">🔴</span>
                <div className="flex-1 h-px bg-[#8C6D53] opacity-40"></div>
              </div>

              <p className="text-xs text-[#5C4533] italic mb-2">Segell intacte · Original</p>
              <p className="text-xs text-[#8C6D53] font-mono text-center">Filigrana: Àncora</p>

              <div className="h-0.5 bg-[#8C6D53] mt-4 opacity-30"></div>
            </div>
          </div>
        )}

        {/* Carta */}
        {item.type === 'carta' && details && (
          <div className="relative">
            <div
              className="relative bg-[#F5EFE0] border-3 border-[#8C6D53] p-5 mb-4 rounded-sm shadow-lg"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 109, 83, 0.03) 2px, rgba(139, 109, 83, 0.03) 4px),
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 109, 83, 0.03) 2px, rgba(139, 109, 83, 0.03) 4px)
                `,
              }}
            >
              <div className="absolute top-3 right-4 text-2xl opacity-40 transform -rotate-12">
                {details.seal === '✓✓' ? '🔴' : '✕'}
              </div>

              <div className="pr-12">
                <p className="text-xs text-[#8C6D53] mb-2 uppercase tracking-widest font-bold font-sans">📅 {details.date}</p>
                <p className="text-xs text-[#5C4533] mb-3 italic font-sans">De: {details.from}</p>

                <div className="bg-white/50 p-4 rounded border border-[#D8CCAE] mb-3">
                  <p className="text-xs text-[#2B2118] leading-relaxed whitespace-pre-wrap font-serif">
                    {details.content}
                  </p>
                </div>

                <div className="bg-[#FFF9F0] border border-[#D8CCAE] p-3 rounded">
                  <p className="text-xs text-[#5C4533] italic">
                    <span className="font-bold">Observació:</span> {details.analysis}
                  </p>
                </div>

                {details.correct && (
                  <div className="mt-3 bg-[#E8F8F5] border-2 border-[#16A085] p-2 rounded">
                    <p className="text-center text-xs font-bold text-[#117A65]">✓ ORIGINAL — SEGELL AUTÈNTIC</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nota */}
        {item.type === 'nota' && (
          <div
            className="relative bg-[#F5EFE0] border-3 border-[#8C6D53] p-5 mb-4 rounded-sm shadow-lg"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 109, 83, 0.03) 2px, rgba(139, 109, 83, 0.03) 4px),
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 109, 83, 0.03) 2px, rgba(139, 109, 83, 0.03) 4px)
              `,
            }}
          >
            <div className="absolute top-2 right-3 text-xs text-[#8C6D53] font-bold uppercase">Del Capità</div>
            <div className="mt-6">
              <p className="text-xs text-[#2B2118] leading-relaxed mb-3 italic font-serif">
                "Els noms arribar a trenc d'alba. I el vostre fill dorm a casa de la guarnició."
              </p>
              <div className="border-l-4 border-[#8C6D53] pl-3 my-3">
                <p className="text-xs text-[#2B2118] font-bold">Contrasenya (qui la porta):</p>
                <p className="text-xs text-[#5C4533] italic mt-1">
                  "L'alba ve de Vic"
                </p>
              </div>
              <p className="text-xs text-[#2B2118] mt-3 leading-relaxed">
                Si la carteta arriba intacta amb aquesta contrasenya, l'Emissari sap que és cosa de Bernat.
              </p>
              <p className="text-xs text-[#8C6D53] italic mt-3 text-right">
                — De la guarnició de Vic
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            onClick={onClose}
            className="flex-1 p-3 bg-[#D8CCAE] text-[#2B2118] font-bold border-2 border-[#8C6D53] hover:bg-[#C9BDAA] transition rounded-lg text-sm font-sans"
            whileTap={{ scale: 0.95 }}
          >
            Tancar
          </motion.button>

          {item.type === 'sobre' && (
            <motion.button
              onClick={() => { onRobarCarta(); onClose() }}
              disabled={isRobat}
              className={`flex-1 p-3 font-bold border-2 rounded-lg text-sm transition font-sans ${
                isRobat
                  ? 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
                  : 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
              }`}
              whileTap={!isRobat ? { scale: 0.95 } : {}}
            >
              {isRobat ? '✓ Robada' : 'Robar carta'}
            </motion.button>
          )}

          {item.type === 'carta' && (
            <motion.button
              onClick={() => { onSubstituir(itemId); onClose() }}
              className={`flex-1 p-3 font-bold border-2 rounded-lg text-sm transition font-sans ${
                isSelected
                  ? 'bg-[#D5F4E6] text-[#117A65] border-[#16A085]'
                  : 'bg-[#2B2118] text-[#EAE0CA] border-[#2B2118] hover:bg-[#1D3557]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isSelected ? '✓ Seleccionada' : 'Substituir amb aquesta'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Part4CompleteScreen() {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">✅ PROVA SUPERADA</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans">Carta segellada correctament</p>
      </header>

      <motion.div
        className="bg-[#D5F4E6] border-2 border-[#16A085] p-6 rounded-sm shadow-lg text-center"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.p
          className="text-6xl mb-3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          🔴
        </motion.p>
        <p className="font-bold text-[#117A65] text-sm">SEGELL AUTÈNTIC DE BERNAT</p>
        <p className="text-xs text-[#16A085] mt-2">Filigrana de l'àncora confirmada</p>
      </motion.div>

      {/* Info de la carta segellada */}
      <motion.div
        className="bg-[#F5EFE0] border-2 border-[#8C6D53] p-4 rounded-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-2 text-xs text-[#2B2118]">
          <p><span className="font-bold">Carta:</span> Falsa amb noms inventats</p>
          <p><span className="font-bold">Segell:</span> Autèntic de Bernat ✓✓</p>
          <p><span className="font-bold">Destinatari:</span> L'Emissari</p>
          <p><span className="font-bold">Contrasenya:</span> "L'alba ve de Vic"</p>
        </div>
      </motion.div>

      {/* Instruccions */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] p-4 rounded-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs font-bold text-[#2B2118] mb-2">SEGÜENT MISSIÓ:</p>
        <p className="text-xs text-[#5C4533] leading-relaxed">
          Porteu la carta segellada al Pla de Masset. L'Emissari us hi espera a la porta del campanar. Presenteu-vos com a enviats del mestre, dieu la contrasenya i lliureu la carta.
        </p>
      </motion.div>

      <div className="bg-[#F9F7F3] border border-[#D8CCAE] p-4 rounded-sm text-center">
        <p className="text-2xl mb-2">⏱️ + 100 PUNTS</p>
        <p className="text-xs text-[#8C6D53] font-sans">Compartida per tots l'equip</p>
      </div>
    </div>
  )
}