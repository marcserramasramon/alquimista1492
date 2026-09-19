'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import { fadeInVariants, shakeVariants } from '@/lib/animations/useAnimations'

interface GameState {
  activeTab: 'historia' | 'recepta' | 'torns' | 'taula'
  selectedDate: string
  inspectingDay: string
  attempts: number
  solved: boolean
  lastFeedback: { type: 'success' | 'error'; message: string } | null
}

interface DayRecord {
  day: string
  dateLabel: string
  visitors: { name: string; role: string; cantirs: number }[]
  note?: string
  isMarketDay?: boolean
}

const TORNS_DATA: DayRecord[] = [
  {
    day: '10',
    dateLabel: '10 de Maig de 1705',
    visitors: [
      { name: 'Marianna', role: "Hostalera de l'Hostal", cantirs: 3 },
      { name: 'Isidre', role: 'Ferrer de la Guixa', cantirs: 2 },
    ],
    note: 'Dia tranquil de recollida ordinària.',
  },
  {
    day: '11',
    dateLabel: '11 de Maig de 1705',
    visitors: [
      { name: 'Pere', role: 'Moliner del Molí', cantirs: 2 },
      { name: 'Anton', role: "Escolà de l'Església", cantirs: 1 },
      { name: 'Bernat', role: "Mestre d'Escola", cantirs: 2 },
    ],
    note: "Bernat i Anton omplen aigua pel poble.",
  },
  {
    day: '12',
    dateLabel: '12 de Maig de 1705',
    visitors: [
      { name: 'Anton', role: "Escolà de l'Església", cantirs: 2 },
      { name: 'Isidre', role: 'Ferrer de la Guixa', cantirs: 3 },
      { name: 'Bernat', role: "Mestre d'Escola", cantirs: 2 },
    ],
    note: "⚠️ MERCAT SETMANAL A VIC: Marianna de l'Hostal va marxar a primera hora per vendre queviures a la ciutat. NO va anar a la font.",
    isMarketDay: true,
  },
  {
    day: '13',
    dateLabel: '13 de Maig de 1705',
    visitors: [
      { name: 'Pere', role: 'Moliner del Molí', cantirs: 1 },
      { name: 'Isidre', role: 'Ferrer de la Guixa', cantirs: 2 },
      { name: 'Bernat', role: "Mestre d'Escola", cantirs: 1 },
    ],
    note: 'Torn de tarda abans de la posta de sol.',
  },
  {
    day: '14',
    dateLabel: '14 de Maig de 1705',
    visitors: [
      { name: 'Marianna', role: "Hostalera de l'Hostal", cantirs: 2 },
      { name: 'Joan', role: 'Traginer del poble', cantirs: 4 },
    ],
    note: 'Joan carrega 4 càntirs per a les bèsties de tir.',
  },
  {
    day: '15',
    dateLabel: '15 de Maig de 1705',
    visitors: [
      { name: 'Marianna', role: "Hostalera de l'Hostal", cantirs: 3 },
      { name: 'Anton', role: "Escolà de l'Església", cantirs: 1 },
    ],
    note: "📌 DIA DE REDACCIÓ DE LA CARTA: La carta del delator porta data d'avui! Però recorda que la tinta ferrosa s'ha de macerar 3 dies abans.",
  },
  {
    day: '16',
    dateLabel: '16 de Maig de 1705',
    visitors: [
      { name: 'Marianna', role: "Hostalera de l'Hostal", cantirs: 2 },
      { name: 'Bernat', role: "Mestre d'Escola", cantirs: 2 },
    ],
    note: 'Últim registre recollit al llibre.',
  },
]

// Dia en què es va recollir l'aigua (resposta correcta) i dia en què es va
// redactar la carta, per variant (docs/joc-2-font-ferro-dev.md § Solucions per Variant).
const WATER_DAY_BY_VARIANT: Record<string, string> = { A: '12', B: '11', C: '13' }
const REDACTION_DAY_BY_VARIANT: Record<string, string> = { A: '15', B: '14', C: '16' }

function buildTornsForVariant(variant: string): DayRecord[] {
  const waterDay = WATER_DAY_BY_VARIANT[variant] || WATER_DAY_BY_VARIANT.A
  const redactionDay = REDACTION_DAY_BY_VARIANT[variant] || REDACTION_DAY_BY_VARIANT.A
  return TORNS_DATA.map(record => {
    if (record.day === waterDay) {
      return {
        ...record,
        isMarketDay: true,
        note: "⚠️ MERCAT SETMANAL A VIC: Marianna de l'Hostal va marxar a primera hora per vendre queviures a la ciutat. NO va anar a la font.",
      }
    }
    if (record.day === redactionDay) {
      return {
        ...record,
        isMarketDay: false,
        note: `📌 DIA DE REDACCIÓ DE LA CARTA: La carta del delator porta data d'avui! Però recorda que la tinta ferrosa s'ha de macerar 3 dies abans.`,
      }
    }
    return { ...record, isMarketDay: false, note: undefined }
  })
}

export function FontFerroGame(props: GameProps) {
  const { play } = useAudio()
  const variant = (props.content?.variant as string) || 'A'
  const waterDay = WATER_DAY_BY_VARIANT[variant] || WATER_DAY_BY_VARIANT.A
  const redactionDay = REDACTION_DAY_BY_VARIANT[variant] || REDACTION_DAY_BY_VARIANT.A
  const TORNS_DATA_VARIANT = buildTornsForVariant(variant)
  const waterDayVisitors = TORNS_DATA_VARIANT.find(d => d.day === waterDay)?.visitors || []
  const waterDayVisitorNames = waterDayVisitors.map(v => v.name).join(', ')
  const [state, setState] = useState<GameState>(() => {
    const saved =
      props.sharedState && typeof props.sharedState === 'object'
        ? (props.sharedState as Partial<GameState>)
        : {}

    return {
      activeTab: saved.activeTab || 'historia',
      selectedDate: saved.selectedDate || '',
      inspectingDay: saved.inspectingDay || '12',
      attempts: saved.attempts || 0,
      solved: props.solved || saved.solved || false,
      lastFeedback: null,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSelectDate = (day: string) => {
    setState(prev => ({
      ...prev,
      selectedDate: day,
      inspectingDay: day,
      lastFeedback: null,
    }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanAnswer = state.selectedDate.trim().toUpperCase()
    if (!cleanAnswer) {
      setState(prev => ({
        ...prev,
        lastFeedback: {
          type: 'error',
          message: "Selecciona o escriu el dia en què es va recollir l'aigua.",
        },
      }))
      return
    }

    try {
      const result = await props.submit({
        date: cleanAnswer,
        answer: cleanAnswer,
      })

      // El servidor és l'única autoritat: no marquem l'enigma com a resolt
      // si el servidor no ho confirma.
      if (result.correct === true) {
        play('evidence-unlock')
        setState(prev => ({
          ...prev,
          solved: true,
          lastFeedback: {
            type: 'success',
            message: `Molt bé! El dia ${waterDay} de maig es va recollir l'aigua ferrosa. Marianna queda descartada!`,
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
              "Data incorrecta. Torna a revisar el llibre de torns i la recepta de la tinta.",
          },
        }))
      }
    } catch (err) {
      console.error('Error enviant resposta:', err)
      play('buzzer')
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        lastFeedback: {
          type: 'error',
          message: 'Error enviant la resposta. Torna-ho a intentar.',
        },
      }))
    }
  }

  const activeDayRecord =
    TORNS_DATA_VARIANT.find(d => d.day === state.inspectingDay) || TORNS_DATA_VARIANT[2]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-8 font-serif">
      {/* CAPÇALERA HISTÒRICA */}
      <header className="border-b-2 border-[#8C6D53] dark:border-[#8C6D53]/40 pb-3 mb-4 text-center">
        <span className="text-xs uppercase tracking-widest text-[#8C6D53] dark:text-[#c2a68e] font-sans font-bold">
          Estació 2 · FONT DEL FERRO
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] dark:text-[#f3ebd8] mt-1 font-serif">
          LA TINTA NEGRE
        </h1>
        <p className="text-xs sm:text-sm text-[#5C4533] dark:text-[#c2a68e] mt-1 italic max-w-md mx-auto">
          "Tinta de Gales, Torns d'Aigua i la Traça del Delator"
        </p>
      </header>

      {/* Imatge d'ambientació de l'estació */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-[#8C6D53] dark:border-[#8C6D53]/40 shadow-md mb-4 bg-stone-950">
        <img
          src="/images/scenes/font-ferro.webp"
          alt="Font del Ferro - Brollador ferruginós i roures"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 right-3 text-white/90 text-[11px] sm:text-xs font-sans italic drop-shadow">
          💧 Font del Ferro · El brollador d'aigua ferruginosa i els roures
        </div>
      </div>

      {/* PESTANYES DE CONSULTA I INVESTIGACIÓ */}
      <section className="bg-[#EAE0CA] dark:bg-[#1a130e] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-xl shadow-sm overflow-hidden">
        {/* Barra superior de pestanyes */}
        <div className="bg-[#D8CCAE] dark:bg-[#221a14] border-b border-[#8C6D53] dark:border-[#8C6D53]/40 flex flex-wrap">
          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'historia' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'historia'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>📜</span>
            <span>La Història</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'recepta' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'recepta'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>🧪</span>
            <span>Recepta Notarial</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'torns' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'torns'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>📋</span>
            <span>Llibre de Torns</span>
          </button>

          <button
            type="button"
            onClick={() => setState(prev => ({ ...prev, activeTab: 'taula' }))}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
              state.activeTab === 'taula'
                ? 'bg-[#EAE0CA] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] border-b-2 border-[#1D3557] dark:border-[#e5a93c] shadow-inner'
                : 'text-[#5C4533] dark:text-[#c2a68e] hover:text-[#1D3557] dark:hover:text-[#f3ebd8] hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
            }`}
          >
            <span>💧</span>
            <span>Taula Interactiva</span>
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
                className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#2B2118] dark:text-[#f3ebd8]"
              >
                <div className="p-3.5 bg-[#F4EBD9] dark:bg-[#221a14] border-l-4 border-[#8C6D53] dark:border-[#c99e32] rounded-r shadow-inner">
                  <h3 className="font-bold text-[#1D3557] dark:text-[#8bb2e8] text-sm sm:text-base font-serif mb-1">
                    L'Aigua que no Menteix
                  </h3>
                  <p>
                    La carta trobada que delata la reunió dels Vigatans no està escrita amb una tinta qualsevol. Els perits han comprovat que es tracta de <strong>tinta ferrosa de gales</strong>, l'única emprada pels escrivans i notaris de la plana.
                  </p>
                  <p>
					Els nens que l'han trobada tenien les mans brutes de tinta, devia ser fresca. <strong>Havia estat escrita el mateix dia</strong>, pel matí o a primera hora de la tarda.
                  </p>
                </div>

                <div className="space-y-2 text-[#4A3728] dark:text-[#f3ebd8]">
                  <p>
                    A tot el terme de Sentfores i la Guixa només hi ha un brollador amb el contingut de ferro suficient per ennegrir les gales de roure: <strong>la Font del Ferro</strong>.
                  </p>
                  <p>
                    Qui va escriure la carta va haver de venir personalment a cercar aigua a aquesta font, o va enviar algú a omplir els càntirs. Descobrint el dia exacte en què es va collir l'aigua podrem saber qui hi era present... i sobretot, <strong>qui en queda totalment lliure de tota sospita</strong>.
                  </p>
                </div>

                <div className="bg-[#DFD4BC]/70 dark:bg-[#241a13] p-3 rounded border border-[#8C6D53]/40 dark:border-[#8C6D53]/30 flex items-start gap-2.5 text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans">
                  <span className="text-lg">💡</span>
                  <div>
                    <strong>Pista per a la investigació:</strong> Consulta la <em>Recepta Notarial</em> per saber quant de temps cal per fabricar la tinta, i revisa el <em>Llibre de Torns</em> per comprovar qui va anar a la font cada jornada.
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 2: RECEPTA NOTARIAL */}
            {state.activeTab === 'recepta' && (
              <motion.div
                key="recepta"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#FAF5E9] dark:bg-[#1f1711] border-2 border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-lg p-4 sm:p-5 shadow-inner relative">
                  <div className="text-center pb-3 border-b border-[#8C6D53]/40 dark:border-[#8C6D53]/30 mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C6D53] dark:text-[#c2a68e]">
                      Manuscrit Notarial · Segle XVIII
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#1D3557] dark:text-[#8bb2e8] font-serif">
                      Recepta per a Tinta Negra de Notaris
                    </h3>
                  </div>

                  <blockquote className="italic text-xs sm:text-sm text-[#4A3728] dark:text-[#f3ebd8] leading-relaxed pl-3 border-l-2 border-[#C99E32] dark:border-[#e5a93c]">
                    «Preneu mitja unça de gales de roure ben esclafades al morter. Poseu-les en remull amb aigua rovellada de la <strong>Font del Ferro</strong>, exactament durant <strong>TRES DIES SENCERS</strong>, remenant de matí i de vespre fins que el líquid es torni negre fosc i violaci. Coleu-ho amb un drap fi de lli i afegiu-hi una mica de goma aràbiga per donar-li cos.»
                  </blockquote>

                  <div className="mt-4 pt-3 border-t border-[#8C6D53]/30 dark:border-[#8C6D53]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans gap-2">
                    <span>
                      📅 <strong>Data de la carta trobada:</strong> {redactionDay} de maig de 1705
                    </span>
                    <span className="font-bold text-[#1D3557] dark:text-[#e5a93c] bg-[#EAE0CA] dark:bg-[#14100c] px-2 py-1 rounded border border-[#8C6D53]/40 dark:border-[#8C6D53]/30">
                      Maceració: 3 dies complets
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTANYA 3: LLIBRE DE TORNS (DOCUMENT HISTÒRIC) */}
            {state.activeTab === 'torns' && (
              <motion.div
                key="torns"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-[#8bb2e8] font-serif">
                    Registre de Torns d'Aigua (10 al 16 de maig de 1705)
                  </h3>
                  <span className="text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans">Comuna de la Guixa</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm bg-[#FAF5E9] dark:bg-[#1f1711] rounded-lg border border-[#8C6D53] dark:border-[#8C6D53]/40 overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-[#D8CCAE] dark:bg-[#221a14] text-[#2B2118] dark:text-[#f3ebd8] font-bold font-sans">
                        <th className="p-2 border border-[#8C6D53]/40 dark:border-[#8C6D53]/30">Dia</th>
                        <th className="p-2 border border-[#8C6D53]/40 dark:border-[#8C6D53]/30">Veïns que van recollir aigua</th>
                        <th className="p-2 border border-[#8C6D53]/40 dark:border-[#8C6D53]/30 hidden sm:table-cell">Anotacions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8C6D53]/30 dark:divide-[#8C6D53]/20 text-[#4A3728] dark:text-[#f3ebd8]">
                      {TORNS_DATA_VARIANT.map(record => (
                        <tr
                          key={record.day}
                          className={record.day === waterDay ? 'bg-amber-100/60 dark:bg-[#24170c] font-medium' : ''}
                        >
                          <td className="p-2 font-mono font-bold text-[#1D3557] dark:text-[#8bb2e8] border border-[#8C6D53]/30 dark:border-[#8C6D53]/20 whitespace-nowrap">
                            Dia {record.day}
                          </td>
                          <td className="p-2 border border-[#8C6D53]/30 dark:border-[#8C6D53]/20">
                            <div className="flex flex-wrap gap-1.5">
                              {record.visitors.map((v, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-1.5 py-0.5 bg-[#EAE0CA] dark:bg-[#2c221a] rounded text-xs font-sans border border-[#8C6D53]/30 dark:border-[#8C6D53]/20"
                                >
                                  <strong>{v.name}</strong> ({v.role.split(' ')[0]}) · {v.cantirs} c.
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-2 border border-[#8C6D53]/30 dark:border-[#8C6D53]/20 text-xs font-sans hidden sm:table-cell text-[#5C4533] dark:text-[#c2a68e]">
                            {record.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 bg-amber-50 dark:bg-[#24170c] rounded border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-[#f3ebd8] font-sans">
                  <strong>⚠️ Nota marginal del Batlle:</strong> El dia {waterDay} de maig hi havia mercat a Vic. Marianna de l'Hostal no va ser al poble ni va acudir a la font.
                </div>
              </motion.div>
            )}

            {/* PESTANYA 4: TAULA INTERACTIVA I EXPLORADOR DE DIES */}
            {state.activeTab === 'taula' && (
              <motion.div
                key="taula"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1D3557] dark:text-[#8bb2e8] font-serif">
                    Explorador Interactiu de Torns
                  </h3>
                  <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans">
                    Clica sobre cada dia per examinar els càntirs, veïns i esdeveniments registrats:
                  </p>
                </div>

                {/* Botons selectors de dia */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {TORNS_DATA_VARIANT.map(record => {
                    const isInspecting = state.inspectingDay === record.day
                    const isSelected = state.selectedDate === record.day

                    return (
                      <button
                        key={record.day}
                        type="button"
                        onClick={() => handleSelectDate(record.day)}
                        className={`py-2 px-1 rounded-lg text-center font-sans transition-all border ${
                          isSelected
                            ? 'bg-[#1D3557] dark:bg-[#14100c] text-[#FAF5E9] dark:text-[#e5a93c] border-[#1D3557] dark:border-[#e5a93c] shadow-md ring-2 ring-[#C99E32] dark:ring-[#e5a93c]'
                            : isInspecting
                            ? 'bg-[#C99E32] dark:bg-[#c99e32] text-[#121E2B] dark:text-[#14100c] border-[#8C6D53] dark:border-[#8C6D53]/60 font-bold'
                            : 'bg-[#FAF5E9] dark:bg-[#1f1711] text-[#4A3728] dark:text-[#c2a68e] border-[#8C6D53]/40 dark:border-[#8C6D53]/30 hover:bg-[#E2D6B8] dark:hover:bg-[#2c221a]'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-mono">Maig</div>
                        <div className="text-sm sm:text-base font-bold font-mono">{record.day}</div>
                        {record.isMarketDay && (
                          <div className="text-[9px] text-amber-300 font-bold">Mercat</div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Detall del dia seleccionat/inspeccionat */}
                <div className="p-4 bg-[#FAF5E9] dark:bg-[#1f1711] border-2 border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-xl shadow-inner space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#8C6D53]/30 dark:border-[#8C6D53]/20">
                    <span className="font-bold text-[#1D3557] dark:text-[#8bb2e8] font-serif text-sm sm:text-base">
                      {activeDayRecord.dateLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectDate(activeDayRecord.day)}
                      className={`text-xs px-2.5 py-1 rounded font-sans font-bold transition-all ${
                        state.selectedDate === activeDayRecord.day
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#C99E32] dark:bg-[#c99e32] text-[#121E2B] dark:text-[#14100c] hover:bg-amber-400 dark:hover:bg-[#e5a93c] shadow-sm'
                      }`}
                    >
                      {state.selectedDate === activeDayRecord.day
                        ? '✓ Dia Triat'
                        : 'Triar aquest dia'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-sans font-bold text-[#5C4533] dark:text-[#c2a68e]">
                      Veïns que van acudir a la font:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeDayRecord.visitors.map((v, i) => (
                        <div
                          key={i}
                          className="p-2 bg-[#EAE0CA]/80 dark:bg-[#2c221a] rounded border border-[#8C6D53]/30 dark:border-[#8C6D53]/20 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#2B2118] dark:text-[#f3ebd8]">{v.name}</div>
                            <div className="text-xs text-[#5C4533] dark:text-[#c2a68e]">{v.role}</div>
                          </div>
                          <div className="font-mono font-bold text-[#1D3557] dark:text-[#8bb2e8] bg-[#D8CCAE] dark:bg-[#221a14] px-2 py-0.5 rounded border border-[#8C6D53]/20 dark:border-[#8C6D53]/20">
                            {v.cantirs} càntir{v.cantirs > 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeDayRecord.note && (
                    <div
                      className={`p-2.5 rounded text-xs font-sans border ${
                        activeDayRecord.isMarketDay
                          ? 'bg-amber-100/90 dark:bg-[#24170c] border-amber-400 dark:border-amber-700/60 text-amber-950 dark:text-[#f3ebd8] font-medium'
                          : 'bg-[#EAE0CA] dark:bg-[#221a14] border-[#8C6D53]/30 dark:border-[#8C6D53]/20 text-[#5C4533] dark:text-[#c2a68e]'
                      }`}
                    >
                      {activeDayRecord.note}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FORMULARI DE VALIDACIÓ I DEDUCCIÓ */}
      <section className="bg-[#EAE0CA] dark:bg-[#1a130e] border-2 border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-xl p-4 sm:p-5 shadow-md">
        {!state.solved ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#2B2118] dark:text-[#f3ebd8] font-serif mb-1">
                Quin dia del mes de maig es va recollir l'aigua ferrosa per a la tinta?
              </label>
              <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] font-sans">
                Calcula la data exacta restant els 3 dies complets de maceració de la recepta a la data de la carta (15 de maig):
              </p>
            </div>

            <motion.div
              animate={state.lastFeedback?.type === 'error' ? 'shake' : 'initial'}
              variants={shakeVariants}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={state.selectedDate}
                onChange={e =>
                  setState(prev => ({
                    ...prev,
                    selectedDate: e.target.value.trim(),
                    inspectingDay: e.target.value.trim() || prev.inspectingDay,
                    lastFeedback: null,
                  }))
                }
                className="flex-1 p-3 border-2 border-[#8C6D53] dark:border-[#8C6D53]/60 rounded-lg bg-[#FAF5E9] dark:bg-[#14100c] text-[#1D3557] dark:text-[#e5a93c] font-mono font-bold text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C99E32] shadow-inner"
              />

              <button
                type="submit"
                disabled={!state.selectedDate}
                className="py-3 px-6 bg-[#C99E32] hover:bg-amber-500 dark:bg-[#c99e32] dark:hover:bg-[#e5a93c] disabled:opacity-50 text-[#121E2B] dark:text-[#14100c] font-bold font-sans rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Validar Dia</span>
                <span>➔</span>
              </button>
            </motion.div>

            {state.lastFeedback && state.lastFeedback.type === 'error' && (
              <div className="p-2.5 bg-red-100 dark:bg-[#2c1515] border border-red-300 dark:border-red-700/60 text-red-900 dark:text-red-200 rounded text-xs font-sans flex items-center gap-2">
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
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-500 rounded-lg text-emerald-950 dark:text-emerald-100 shadow-inner">
              <div className="flex items-center gap-2 text-base font-bold font-serif text-emerald-900 dark:text-emerald-300 mb-1">
                <span>✓</span>
                <span>Dia {waterDay} de Maig de 1705 Confirmat!</span>
              </div>
              <p className="text-xs font-sans text-emerald-800 dark:text-emerald-200 leading-relaxed">
                Has deduït amb exactitud la data de la recollida: {redactionDay} de maig menys 3 dies de remull = <strong>{waterDay} de maig</strong>.
              </p>
            </div>

            {/* DESCOBERTA D'EVIDÈNCIA I DESCART */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Evidència */}
              <div className="p-3.5 bg-[#FAF5E9] dark:bg-[#1a130e] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8C6D53] dark:text-[#c2a68e]">
                  🏺 Nova Evidència Desbloquejada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#1D3557] dark:text-[#8bb2e8] mt-0.5">
                  Dos Càntirs d'Aigua a l'Escola
                </h4>
                <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] mt-1 font-sans">
                  El dia {waterDay}, {waterDayVisitorNames} van carregar aigua a la font.
                </p>
              </div>

              {/* Sospitosa Descartada */}
              <div className="p-3.5 bg-[#FAF5E9] dark:bg-[#1a130e] border border-[#8C6D53] dark:border-[#8C6D53]/40 rounded-lg shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400">
                  🚫 Sospitosa Descartada
                </span>
                <h4 className="font-serif font-bold text-sm text-[#2B2118] dark:text-[#f3ebd8] mt-0.5">
                  Marianna de l'Hostal
                </h4>
                <p className="text-xs text-[#5C4533] dark:text-[#c2a68e] mt-1 font-sans">
                  El dia {waterDay} era al mercat setmanal de Vic. Queda <strong>100% descartada</strong> de la recollida d'aigua per a la carta.
                </p>
              </div>
            </div>

            {/* XIFRA DE L'ELEMENT AIGUA */}
            <div className="p-3.5 bg-[#1D3557] dark:bg-[#1a2332] text-[#FAF5E9] rounded-lg border-2 border-[#C99E32] dark:border-[#e5a93c] shadow text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#C99E32] dark:text-[#e5a93c]">
                XIFRA DE L'ELEMENT DESCOBERTA
              </div>
              <div className="text-xl sm:text-2xl font-bold font-serif mt-1 flex items-center justify-center gap-2.5">
                <img src="/images/elements/aigua.webp" alt="Aigua" className="w-8 h-8 object-contain drop-shadow" />
                <span>AIGUA = 2</span>
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
