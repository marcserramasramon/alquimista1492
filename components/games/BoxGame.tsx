'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { useGameNavigation } from '@/lib/context/GameNavigationContext'
import { fadeInVariants } from '@/lib/animations/useAnimations'
import { ALL_SEALS, getTeamCorrectSeal, type SealOption } from '@/content/public/seals'

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

const CORRECT_DATE = '15-05'

const CARD_DETAILS: Record<string, {
  signature: string;
  seal: string;
  date: string;
  from: string;
  content: string;
  analysis: string;
  correct: boolean
}> = {
  '15-05': {
    signature: 'Bernat Mas',
    seal: '✓✓',
    date: '15 de maig de 1705',
    from: 'Bernat Mas (Mestre d\'Escola)',
    content: 'Al Capità de la Guarnició de Vic,\n\nCompleixo el tracte acordat per salvar la vida del meu fill Jaume. Aquests són els noms dels conjurats que signaran el pacte a l\'ermita de Sant Sebastià a trenc d\'alba: Antoni de Peguera, Bac de Roda, Jaume Puig i la resta de vigatans.\n\nExigeixo l\'alliberament immediat del meu fill segons la vostra paraula.\n\n— Bernat Mas, Mestre',
    analysis: '',
    correct: true
  },
  '16-05': {
    signature: 'Bernat Mas',
    seal: '✓✓',
    date: '15 de maig de 1705',
    from: 'Bernat Mas (Mestre d\'Escola)',
    content: 'Al Capità de la Guarnició de Vic,\n\nCompleixo el tracte acordat per salvar la vida del meu fill Jaume. Aquests són els noms dels conjurats que signaran el pacte a l\'ermita de Sant Sebastià a trenc d\'alba: Antoni de Peguera, Bac de Roda, Jaume Puig i la resta de vigatans.\n\nExigeixo l\'alliberament immediat del meu fill segons la vostra paraula.\n\n— Bernat Mas, Mestre',
    analysis: '',
    correct: true
  },
  '14-05': {
    signature: 'Jaume Mas',
    seal: '◆✓',
    date: '14 de maig de 1705',
    from: 'Jaume Mas (fill de Bernat)',
    content: 'Pare, temo que els dragons sospitin de mi a la guarnició. Si teniu alguna manera d\'ajudar-me, feu-ho aviat, però no us poseu en perill amb la gent del poble.\n\n— J.M.',
    analysis: 'Lletra jove i angoixada d\'en Jaume des de la presó de Vic abans de ser incomunicat.',
    correct: false
  },
  '13-05': {
    signature: 'Jaume Mas',
    seal: '◆',
    date: '13 de maig de 1705',
    from: 'Jaume Mas',
    content: 'He rebut el missatge. Els dragons es mouen cap a Manlleu. Si ens descobreixen les armes clandestines, estem perduts.\n\n— J.M.',
    analysis: 'Signatura incompleta, paper gastat. Correspon als dies previs a la seva captura.',
    correct: false
  },
  '12-05': {
    signature: 'Bernat Mas',
    seal: '◆✓',
    date: '12 de maig de 1705',
    from: 'Bernat Mas (Mestre d\'Escola)',
    content: 'Esborrany de comptes de l\'escola i petició d\'oli per a les llànties de la rectoria.\n\n— B.M.',
    analysis: 'Escrit ordinari de l\'escola. La tinta és antiga i no és la tinta ferrogàl·lica recent macerada.',
    correct: false
  },
  '11-05': {
    signature: 'Anton de Manlleu',
    seal: '◆',
    date: '11 de maig de 1705',
    from: 'Anton (Escolà)',
    content: 'Llista d\'almoines recollides a la missa major per als pobres de la parròquia. Registrat amb permís de mossèn Ramon.\n\n— Anton, escolà',
    analysis: 'Anotació de l\'escolà a la caixa de les almoines. Lletra d\'aprenent, no coincideix amb la del traïdor.',
    correct: false
  },
  '10-05': {
    signature: 'Bernat Mas',
    seal: '◆',
    date: '10 de maig de 1705',
    from: 'Bernat Mas',
    content: 'Còpia d\'exercici de cal·ligrafia per als nens de l\'estudi. Textos llatins i deures escolars.\n\n— B.M.',
    analysis: 'Paper d\'escola senzill, sense segell de lacre ni signatura oficial.',
    correct: false
  },
}

const BOX_ITEMS = [
  { id: 'sobre', type: 'sobre' as const, label: 'Carta Segellada', emoji: '📬' },
  { id: '10-05', type: 'carta' as const, label: 'Carta 1', emoji: '📄' },
  { id: '11-05', type: 'carta' as const, label: 'Carta 2', emoji: '📄' },
  { id: '12-05', type: 'carta' as const, label: 'Carta 3', emoji: '📄' },
  { id: '13-05', type: 'carta' as const, label: 'Carta 4', emoji: '📄' },
  { id: '14-05', type: 'carta' as const, label: 'Carta 5', emoji: '📄' },
  { id: '15-05', type: 'carta' as const, label: 'Carta 6', emoji: '📄' },
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
  const teamSeal = getTeamCorrectSeal(props.content as any)
  const teamCode =
    ((props.content as any)?.teamCode as string) ||
    ((props.content as any)?.code as string) ||
    'EQUIP1'

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
          teamInfo: props.content,
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
    } catch {
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
          teamInfo: props.content,
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
    } catch {
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
          teamInfo: props.content,
        }),
      })

      const data = await res.json()

      if (data.success) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          currentScreen: 'sealed',
          isCorrect: true,
        }))
      } else {
        play('buzzer')
        setError(data.message || 'Segell incorrecte. Aquest segell no coincideix amb el de la carta original de Bernat.')
        setState(prev => ({
          ...prev,
          part3SelectedSeal: null,
        }))
      }
    } catch {
      play('buzzer')
      setError('Error en validar el segell')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto pb-12 flex flex-col font-serif text-[#2B2118]"
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
            teamSeal={teamSeal}
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
                teamSeal={teamSeal}
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
        <Part4CompleteScreen teamSeal={teamSeal} teamCode={teamCode} />
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
      <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-[#8C6D53] pb-2 mb-1 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2118] mt-0.5 font-serif">
          CAIXA DE LES ALMOINES
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "El cadenat protegeix secrets del Pacte dels Vigatans"
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md bg-stone-950">
        <img
          src="/images/scenes/caixa-almoines.webp"
          alt="Caixa de les Almoines a la Rectoria"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          🔒 Rectoria · Caixa Forta de les Almoines
        </div>
      </div>

      {/* Menu de pestanyes */}
      <section className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
          {/* Historia */}
          <button
            type="button"
            onClick={() => onTabChange('historia')}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              tab === 'historia'
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A]'
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
                ? 'bg-[#EAE0CA] text-[#1D3557] dark:text-[#E5A93C] border-b-2 border-[#1D3557] dark:border-[#E5A93C] shadow-inner'
                : solved
                  ? 'text-[#5C4533] dark:text-[#C2A68E] hover:text-[#1D3557] dark:hover:text-[#E5A93C] hover:bg-[#E2D6B8] dark:hover:bg-[#2C221A] cursor-pointer'
                  : 'text-[#A9A09A] dark:text-[#6E645C] cursor-not-allowed'
            }`}
          >
            <span>🧧</span>
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
                  className="bg-[#F5EFE0] dark:bg-[#1f1711] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-lg p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-[#2B2118] dark:text-[#F3EBD8] leading-relaxed mb-3">
                    La <strong>Caixa de les Almoines</strong> de la Rectoria de la Guixa conté la
                    carta que en Bernat Mas ha introduït per la ranura per lliurar els conjurats a l'Emissari.
                    Amb la clau que mossèn Ramon va aconseguir llençar a la foscor i el codi dels quatre elements (<strong>4-2-3-1</strong>),
                    obriu la caixa, recupereu la carta del traïdor i prepareu la substitució per la carta falsa abans que no arribi l'Emissari reial.
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
                    <div className="group relative bg-gradient-to-b from-orange-50 to-white p-2.5 rounded-lg border border-amber-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center">
                      <div className="w-11 h-11 flex items-center justify-center">
                        <img src="/images/elements/foc.webp" alt="Foc" className="w-10 h-10 object-contain drop-shadow" />
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-amber-900 uppercase">
                        Foc
                      </div>
                      <div className="mt-1.5 text-[9px] text-amber-800 font-bold">4</div>
                    </div>

                    {/* AIGUA */}
                    <div className="group relative bg-gradient-to-b from-blue-50 to-white p-2.5 rounded-lg border border-sky-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center">
                      <div className="w-11 h-11 flex items-center justify-center">
                        <img src="/images/elements/aigua.webp" alt="Aigua" className="w-10 h-10 object-contain drop-shadow" />
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-sky-900 uppercase">
                        Aigua
                      </div>
                      <div className="mt-1.5 text-[9px] text-sky-800 font-bold">2</div>
                    </div>

                    {/* TERRA */}
                    <div className="group relative bg-gradient-to-b from-emerald-50 to-white p-2.5 rounded-lg border border-emerald-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center">
                      <div className="w-11 h-11 flex items-center justify-center">
                        <img src="/images/elements/terra.webp" alt="Terra" className="w-10 h-10 object-contain drop-shadow" />
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-emerald-900 uppercase">
                        Terra
                      </div>
                      <div className="mt-1.5 text-[9px] text-emerald-800 font-bold">3</div>
                    </div>

                    {/* AIRE */}
                    <div className="group relative bg-gradient-to-b from-purple-50 to-white p-2.5 rounded-lg border border-purple-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col items-center">
                      <div className="w-11 h-11 flex items-center justify-center">
                        <img src="/images/elements/aire.webp" alt="Aire" className="w-10 h-10 object-contain drop-shadow" />
                      </div>
                      <div className="mt-1 text-[10px] font-bold tracking-widest text-purple-900 uppercase">
                        Aire
                      </div>
                      <div className="mt-1.5 text-[9px] text-purple-800 font-bold">1</div>
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
                {/* Imatge del cofre tancat sobre el cadenat */}
                <div className="relative w-full aspect-[16/9] max-w-md mx-auto rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md bg-stone-950">
                  <img
                    src="/images/scenes/caixa-tancada.webp"
                    alt="Caixa de les Almoines Tancada"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
                    🔒 Caixa de les Almoines tancada amb cadenat
                  </div>
                </div>

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
                        {[
                          { name: 'FOC', img: '/images/elements/foc.webp' },
                          { name: 'AIGUA', img: '/images/elements/aigua.webp' },
                          { name: 'TERRA', img: '/images/elements/terra.webp' },
                          { name: 'AIRE', img: '/images/elements/aire.webp' },
                        ].map((elem, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="mb-2 flex items-center justify-center w-8 h-8 rounded-full bg-[#5C4533]/15 border border-[#5C4533]/30 p-1 shadow-sm">
                              <img src={elem.img} alt={elem.name} className="w-full h-full object-contain drop-shadow-sm" />
                            </div>
                            <DialWheel
                              value={parseInt(digits[idx] || '0')}
                              onChange={val => handleDigitChange(idx, String(val))}
                            />
                            <div className="mt-2 text-center">
                              <p className="text-xs text-[#5C4533] font-sans font-bold">{elem.name}</p>
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
                  className="bg-[#D5F4E6] border-2 border-[#16A085] p-5 rounded-lg shadow-lg text-center"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="relative w-full aspect-[16/9] max-w-md mx-auto rounded-lg overflow-hidden border-2 border-[#16A085] shadow-md mb-3 bg-stone-950">
                    <img
                      src="/images/scenes/caixa-oberta.webp"
                      alt="Caixa de les Almoines Oberta"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 right-2 bg-[#16A085] text-white text-[11px] font-bold font-sans px-2.5 py-0.5 rounded-full shadow">
                      OBERTA
                    </div>
                  </div>
                  <p className="font-bold text-[#117A65] text-base font-sans uppercase">COFRE OBERT!</p>
                  <p className="text-xs text-[#16A085] mt-1">El cadenat s'ha desclavat i la caixa s'ha obert correctament</p>
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
  teamSeal,
  onSelectCard,
  onRobarCarta,
  onSubmit,
  loading,
}: {
  stolenCards: Set<string>
  selectedDate: string | null
  teamSeal: SealOption
  onSelectCard: (id: string) => void
  onRobarCarta: () => void
  onSubmit: () => void
  loading: boolean
}) {
  const [activeTab, setActiveTab] = useState<'sobre' | 'cartes' | 'nota'>('sobre')
  const [sobreObert, setSobreObert] = useState(false)
  const sobreRobat = stolenCards.has('sobre')
  const cartesIds = ['10-05', '11-05', '12-05', '13-05', '14-05', '15-05']

  const originalLetter = CARD_DETAILS[CORRECT_DATE] || CARD_DETAILS['15-05'] || {
    signature: 'Bernat Mas',
    seal: '✓✓',
    date: '15 de maig de 1705',
    from: "Bernat Mas (Mestre d'Escola)",
    content: "Al Capità de la Guarnició de Vic,\n\nCompleixo el tracte acordat per salvar la vida del meu fill Jaume. Aquests són els noms dels conjurats que signaran el pacte a l'ermita de Sant Sebastià a trenc d'alba: Antoni de Peguera, Bac de Roda, Jaume Puig i la resta de vigatans.\n\nExigeixo l'alliberament immediat del meu fill segons la vostra paraula.\n\n— Bernat Mas, Mestre",
    analysis: '',
    correct: true,
  }

  const TABS = [
    { id: 'sobre' as const, label: 'El Sobre', emoji: '📬' },
    { id: 'cartes' as const, label: 'Les Cartes', emoji: '📄' },
    { id: 'nota' as const, label: 'La Nota', emoji: '📝' },
  ]
  return (
    <div className="flex flex-col flex-1 gap-4">
      <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-[#8C6D53] pb-2 mb-1 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2118] mt-0.5 font-serif">
          LA CARTA SEGELLADA
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          "Examina el contingut de la caixa i substitueix la carta correcta"
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] shadow-md bg-stone-950">
        <img
          src="/images/scenes/rectoria.webp"
          alt="Rectoria de Santa Eulàlia de Riuprimer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          📜 Rectoria de Santa Eulàlia · Taula del Rector
        </div>
      </div>

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
                      <p className="text-xs text-[#8C6D53] uppercase tracking-widest font-bold font-sans mb-1">Sobre Segellat Original</p>
                      <p className="text-xs text-[#5C4533] font-sans mb-4">
                        {originalLetter.from} · {originalLetter.date}
                      </p>

                      <motion.button
                        onClick={() => !sobreRobat && setSobreObert(true)}
                        className="mx-auto mb-4 flex flex-col items-center gap-2 group"
                        whileHover={!sobreRobat ? { scale: 1.06 } : {}}
                        whileTap={!sobreRobat ? { scale: 0.94 } : {}}
                      >
                        <div className={`w-28 h-28 rounded-full border-4 shadow-2xl flex items-center justify-center p-2.5 transition-all ${
                          sobreRobat
                            ? 'bg-stone-800/40 border-stone-600 opacity-40 grayscale cursor-not-allowed'
                            : 'bg-gradient-to-br from-red-800 via-red-700 to-red-950 border-amber-500/70 shadow-red-950/70 group-hover:shadow-red-800/90 cursor-pointer'
                        }`}>
                          <img
                            src={teamSeal.image}
                            alt={teamSeal.label}
                            className={`w-full h-full object-contain filter drop-shadow-md ${sobreRobat ? 'opacity-30' : ''}`}
                          />
                        </div>
                        <span className="text-xs font-sans font-semibold text-[#8C6D53] group-hover:text-[#2B2118]">
                          {sobreRobat ? 'Carta destruïda' : 'Clica el segell per obrir el sobre'}
                        </span>
                      </motion.button>

                      <div className="bg-[#FFF9F0]/80 border border-[#D8CCAE] p-2.5 rounded text-left">
                        <p className="text-[11px] font-bold text-[#7B1A1A] font-sans uppercase">
                          Segell de Bernat: {teamSeal.label}
                        </p>
                        <p className="text-[11px] text-[#5C4533] italic mt-0.5">
                          Heràldica: {teamSeal.heraldry}
                        </p>
                      </div>
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
                    <div className="flex items-center justify-between mb-3 border-b border-[#D8CCAE] pb-2">
                      <div>
                        <p className="text-xs text-[#8C6D53] uppercase tracking-widest font-bold font-sans">📅 {originalLetter.date}</p>
                        <p className="text-xs text-[#5C4533] italic font-sans">De: {originalLetter.from}</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#8C6D53] uppercase bg-[#EAE0CA] border border-[#D8CCAE] px-2 py-0.5 rounded font-bold">
                        Carta Original
                      </span>
                    </div>

                    <div className="bg-white/60 p-4 sm:p-5 rounded border border-[#D8CCAE] mb-3">
                      <p className="text-xs sm:text-sm text-[#2B2118] leading-relaxed whitespace-pre-wrap font-serif">
                        {originalLetter.content}
                      </p>

                      {/* Segell a la part inferior dreta */}
                      <div className="flex justify-end mt-4 pt-2">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                          <img
                            src={teamSeal.image}
                            alt={teamSeal.label}
                            className="w-full h-full object-contain filter drop-shadow-xl"
                          />
                        </div>
                      </div>
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
  const currentSeal = ALL_SEALS.find(s => s.id === selectedSeal)

  return (
    <div className="flex flex-col flex-1 gap-4">
      <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-[#8C6D53] pb-2 mb-1 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
          Estació 7 · Rectoria
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2118] mt-0.5 font-serif">
          EL SEGELL DE BERNAT
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] mt-1 italic max-w-md mx-auto">
          Tria la matriu de cera autèntica per segellar la nova carta
        </p>
      </header>

      {/* Context */}
      <motion.div
        className="bg-[#EAE0CA] border border-[#8C6D53] rounded-lg p-3 text-center shadow-sm"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-[#2B2118] leading-relaxed">
          A la caixa hi ha <strong>8 segells de cera</strong> diferents. Heu de segellar la nova carta amb el mateix segell que duia la carta original de Bernat Mas perquè l'Emissari no descobreixi l'engany.
        </p>
      </motion.div>

      {/* Grid de 8 segells */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ALL_SEALS.map(seal => {
          const isSelected = selectedSeal === seal.id
          return (
            <motion.button
              key={seal.id}
              onClick={() => onSelectSeal(seal.id)}
              className={`flex flex-col items-center justify-between p-2.5 border-2 rounded-lg transition relative overflow-hidden text-center min-h-[140px] ${
                isSelected
                  ? 'bg-[#E8F8F5] border-[#16A085] shadow-lg ring-2 ring-[#16A085]/40'
                  : 'bg-[#F5EFE0] border-[#D8CCAE] hover:bg-[#EAE0CA] hover:border-[#8C6D53] shadow-sm'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Badge número */}
              <div className="absolute top-1.5 left-1.5 bg-[#8C6D53] text-[#F5EFE0] text-[10px] font-bold font-mono px-1.5 py-0.5 rounded">
                #{seal.number}
              </div>

              {/* Imatge del segell */}
              <div className="w-16 h-16 my-1 flex items-center justify-center">
                <img
                  src={seal.image}
                  alt={seal.label}
                  className="w-full h-full object-contain filter drop-shadow hover:scale-105 transition-transform"
                />
              </div>

              {/* Textos */}
              <div className="w-full">
                <p className={`text-[11px] font-bold font-sans line-clamp-2 leading-tight ${
                  isSelected ? 'text-[#117A65]' : 'text-[#2B2118]'
                }`}>
                  {seal.label}
                </p>
                <p className="text-[9px] text-[#8C6D53] font-sans mt-0.5 line-clamp-1">
                  {seal.subtitle}
                </p>
              </div>

              {isSelected && (
                <div className="w-full mt-1 bg-[#16A085] text-white text-[10px] font-bold py-0.5 rounded font-sans uppercase">
                  ✓ Triat
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Detall d'inspecció del segell seleccionat */}
      {currentSeal && (
        <motion.div
          className="bg-[#FFF9F0] border-2 border-[#16A085] p-3.5 rounded-lg shadow-sm flex items-start gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 flex-shrink-0 bg-stone-900/10 rounded-full p-1.5 border border-[#16A085]/40 flex items-center justify-center">
            <img
              src={currentSeal.image}
              alt={currentSeal.label}
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-bold text-[#117A65] font-sans">
                Segell #{currentSeal.number}: {currentSeal.label}
              </p>
              <span className="text-[10px] text-[#8C6D53] font-sans">{currentSeal.subtitle}</span>
            </div>
            <p className="text-[11px] text-[#5C4533] italic mt-1 leading-snug">
              <strong>Heràldica:</strong> {currentSeal.heraldry}
            </p>
            <p className="text-[10px] text-[#8C6D53] mt-1.5 font-sans">
              🔍 Comprova si aquest motiu heràldic coincideix amb la carta de Bernat que heu obert.
            </p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          className="bg-[#FADBD8] border border-[#E74C3C] text-[#C0392B] p-3 rounded-lg text-xs text-center font-sans font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={onSubmit}
        disabled={!selectedSeal || loading}
        className={`w-full p-3.5 font-bold text-sm border-2 transition rounded-lg font-sans shadow-md ${
          selectedSeal && !loading
            ? 'bg-[#7B1A1A] text-[#F5EFE0] border-[#5C1010] hover:bg-[#5C1010]'
            : 'bg-[#D8CCAE] text-[#8C6D53] border-[#8C6D53] cursor-not-allowed'
        }`}
        whileHover={selectedSeal && !loading ? { scale: 1.02 } : {}}
        whileTap={selectedSeal && !loading ? { scale: 0.98 } : {}}
      >
        {loading ? '⏳ Estampant segell...' : '🔴 ESTAMPAR SEGELL I TANCAR EL SOBRE'}
      </motion.button>
    </div>
  )
}

function BoxItemModal({
  itemId,
  stolenCards,
  selectedDate,
  teamSeal,
  onRobarCarta,
  onSubstituir,
  onClose,
}: {
  itemId: string
  stolenCards: Set<string>
  selectedDate: string | null
  teamSeal: SealOption
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

              <p className="text-sm font-bold text-[#2B2118] mb-3 font-serif">Sobre Segellat Original</p>

              <div className="bg-white/40 backdrop-blur-sm border border-[#8C6D53]/30 rounded p-3 mb-3">
                <p className="text-xs text-[#5C4533] mb-1">
                  <span className="font-bold">De:</span> Bernat Mas, Mestre d'Escola
                </p>
                <p className="text-xs text-[#8C6D53]">
                  <span className="font-bold">Data:</span> 15 de maig de 1705
                </p>
              </div>

              {/* Segell de cera autèntic */}
              <div className="w-24 h-24 mx-auto my-3 rounded-full p-2 bg-gradient-to-br from-red-800 via-red-700 to-red-950 border-2 border-amber-600/70 shadow-lg flex items-center justify-center">
                <img src={teamSeal.image} alt={teamSeal.label} className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <p className="text-xs font-bold text-[#7B1A1A] text-center font-sans">{teamSeal.label}</p>
              <p className="text-[11px] text-[#5C4533] italic text-center mb-2">{teamSeal.heraldry}</p>

              <p className="text-xs text-[#5C4533] italic mb-1">Segell intacte · Cera vermella</p>

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

              <div className="pr-6">
                <p className="text-xs text-[#8C6D53] mb-2 uppercase tracking-widest font-bold font-sans">📅 {details.date}</p>
                <p className="text-xs text-[#5C4533] mb-3 italic font-sans">De: {details.from}</p>

                <div className="bg-white/50 p-4 rounded border border-[#D8CCAE] mb-3">
                  <p className="text-xs text-[#2B2118] leading-relaxed whitespace-pre-wrap font-serif">
                    {details.content}
                  </p>
                </div>

                {details.analysis && (
                  <div className="bg-[#FFF9F0] border border-[#D8CCAE] p-3 rounded">
                    <p className="text-xs text-[#5C4533] italic">
                      <span className="font-bold">Observació:</span> {details.analysis}
                    </p>
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

function Part4CompleteScreen({ teamSeal, teamCode }: { teamSeal: SealOption; teamCode: string }) {
  const router = useRouter()
  const { clearActiveGame } = useGameNavigation()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!qrCanvasRef.current) return
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const qrTargetUrl = `${origin}/emissari/carta/${teamCode}`

    QRCode.toCanvas(
      qrCanvasRef.current,
      qrTargetUrl,
      {
        width: 170,
        margin: 1,
        color: {
          dark: '#2B2118',
          light: '#F4EBD9',
        },
      },
      (err) => {
        if (err) console.error('Error generating carta QR:', err)
      }
    )
  }, [teamCode])

  return (
    <div className="flex flex-col justify-center flex-1 gap-4 pb-8">
      <header className="border-b-2 border-[#8C6D53] pb-3 text-center">
        <h2 className="text-2xl font-bold text-[#2B2118]">✅ PROVA SUPERADA</h2>
        <p className="text-xs text-[#5C4533] mt-1 font-sans">Caixa d'Almoines oberta i carta segellada</p>
      </header>

      <motion.div
        className="bg-[#D5F4E6] border-2 border-[#16A085] p-5 rounded-xl shadow-lg text-center flex flex-col items-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-20 h-20 rounded-full p-2 bg-gradient-to-br from-red-800 via-red-700 to-red-950 border-4 border-amber-500 shadow-xl mb-2 flex items-center justify-center">
          <img
            src={teamSeal.image}
            alt={teamSeal.label}
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>
        <p className="font-bold text-[#117A65] text-sm font-sans uppercase">SEGELL AUTÈNTIC DE BERNAT #{teamSeal.number}</p>
        <p className="text-xs text-[#16A085] mt-0.5 font-serif">{teamSeal.label} · {teamSeal.subtitle}</p>
      </motion.div>

      {/* Instruccions de la següent missió */}
      <motion.div
        className="bg-[#FAF5E9] border-2 border-[#8C6D53] p-4 rounded-xl shadow-sm space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 border-b border-[#8C6D53]/30 pb-2">
          <span className="text-xl">🦹‍♂️</span>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53] block">
              SEGÜENT MISSIÓ · PLA DE MASSET
            </span>
            <h4 className="font-serif font-bold text-sm text-[#2B2118]">
              Lliurar la Carta Falsa a l'Emissari
            </h4>
          </div>
        </div>

        <p className="text-xs text-[#2B2118] leading-relaxed">
          Heu de portar la carta falsa a l&apos;Emissari reial, que us espera al <strong>Pla de Masset</strong>. Presenteu-vos com a enviats del mestre d&apos;escola i digueu la contrasenya verbal:
        </p>

        <div className="bg-[#EAE0CA] border border-[#8C6D53] rounded-lg p-2.5 text-center">
          <span className="text-[10px] font-mono text-[#8C6D53] uppercase block font-bold">Contrasenya Secreta:</span>
          <span className="font-serif font-bold text-[#1D3557] text-sm sm:text-base">«L'alba ve de Vic»</span>
        </div>

        {/* Avís del Quadern */}
        <div className="bg-[#1D3557]/10 border-l-4 border-[#1D3557] p-3 rounded-r-lg">
          <p className="text-xs text-[#1D3557] leading-relaxed font-sans">
            📖 <strong>Trobareu aquesta carta amb el seu codi QR al QUADERN</strong> (a la pestanya de <em>Proves</em>). Quan arribeu davant de l&apos;Emissari, obriu el Quadern i mostreu-li el codi QR perquè l&apos;escanegi.
          </p>
        </div>
      </motion.div>

      {/* Codi QR de consulta ràpida */}
      <motion.div
        className="bg-[#F4EBD9] border border-[#8C6D53] p-4 rounded-xl shadow-sm flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#8C6D53] mb-1">
          Codi QR de la Carta
        </span>
        <div className="bg-[#F4EBD9] p-2 rounded-lg border border-[#8C6D53]/40 shadow-inner">
          <canvas ref={qrCanvasRef} className="rounded" />
        </div>
        <p className="text-[11px] font-mono text-[#8C6D53] mt-1.5 font-bold">
          Equip: {teamCode}
        </p>
      </motion.div>

      {/* Recompensa */}
      <div className="bg-[#1D3557] text-[#FAF5E9] border-2 border-[#C99E32] p-3 rounded-xl text-center font-serif">
        <span className="text-xs font-mono uppercase text-[#C99E32] font-bold">FASE COMPLETADA</span>
        <div className="text-lg font-bold mt-0.5">+100 Punts d'Equip</div>
      </div>

      {/* Botó de Tancar i Anar al Menú / Quadern */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            clearActiveGame()
            router.push('/joc')
          }}
          className="w-full py-3.5 px-4 bg-[#1D3557] hover:bg-[#2B4C7E] text-white font-bold font-sans rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <span>📖</span>
          <span>Tancar i Anar al Quadern / Menú</span>
        </button>
      </div>
    </div>
  )
}