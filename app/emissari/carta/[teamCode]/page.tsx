'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface TeamLetterData {
  teamId: string
  teamCode: string
  teamName: string
  teamColor?: string
  password: string
  expectedSeal: {
    number: number
    label: string
    subtitle: string
    heraldry: string
    image: string
  }
  isLetterValidated: boolean
  hasPasswordPenalty: boolean
}

export default function EmissariCartaPage({
  params,
}: {
  params: Promise<{ teamCode: string }>
}) {
  const resolvedParams = use(params)
  const teamCode = resolvedParams.teamCode?.toUpperCase()

  const [data, setData] = useState<TeamLetterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'danger' | 'warning'
    message: string
  } | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/emissari/validate-letter?teamCode=${teamCode}`)
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'No s\'ha pogut carregar la informació de l\'equip')
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const res = await fetch(`/api/emissari/validate-letter?teamCode=${teamCode}`)
        if (!res.ok) {
          const errJson = await res.json()
          throw new Error(errJson.error || 'No s\'ha pogut carregar la informació de l\'equip')
        }
        const json = await res.json()
        if (isMounted) {
          setData(json)
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconegut')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [teamCode])

  const handleValidate = async () => {
    if (!teamCode || actionLoading) return

    try {
      setActionLoading(true)
      const res = await fetch('/api/emissari/validate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode, action: 'accept' }),
      })

      const resJson = await res.json()
      if (!res.ok) {
        throw new Error(resJson.error || 'Error en validar la carta')
      }

      setData(prev => (prev ? { ...prev, isLetterValidated: true } : null))
      setNotification({
        type: 'success',
        message: '✓ CARTA VALIDADA! L\'Emissari marxa enganyat cap a Vic. La Decisió Moral s\'ha activat al mòbil dels jugadors.',
      })

      setTimeout(() => setNotification(null), 6000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error en l\'acció')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePenalize = async () => {
    if (!teamCode || actionLoading) return

    try {
      setActionLoading(true)
      const res = await fetch('/api/emissari/validate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode, action: 'penalize' }),
      })

      const resJson = await res.json()
      if (!res.ok) {
        throw new Error(resJson.error || 'Error en penalitzar l\'equip')
      }

      setData(prev => (prev ? { ...prev, hasPasswordPenalty: true } : null))

      if (resJson.alreadyPenalized) {
        setNotification({
          type: 'warning',
          message: 'ℹ️ Aquest equip ja tenia la penalització de −10 punts aplicada. Poden seguir intentant la contrasenya sense més penalitzacions.',
        })
      } else {
        setNotification({
          type: 'danger',
          message: '⚠️ −10 PUNTS APLICATS! Error en la contrasenya. Els jugadors poden intentar-ho de nou tantes vegades com calgui.',
        })
      }

      setTimeout(() => setNotification(null), 6000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error en l\'acció')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1D3557] text-[#F4EBD9] p-4 flex flex-col items-center font-serif">
      <div className="w-full max-w-4xl my-auto flex flex-col gap-4">
        {/* Capçalera Oficial Emissari */}
        <header className="text-center border-b border-[#8C6D53]/60 pb-3">
          <span className="text-3xl block mb-1">✉️ ⚔️</span>
          <span className="text-xs font-sans uppercase tracking-widest text-amber-300 font-bold">
            Pla de Masset · Control de l&apos;Emissari
          </span>
          <h1 className="text-2xl font-bold text-[#F4EBD9]">
            Lliurament de la Carta Falsa
          </h1>
        </header>

        {/* Notificació d'acció */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-xl font-sans text-xs sm:text-sm font-bold text-center shadow-lg border ${
                notification.type === 'danger'
                  ? 'bg-red-900 border-red-500 text-red-100'
                  : notification.type === 'warning'
                    ? 'bg-amber-900 border-amber-500 text-amber-100'
                    : 'bg-emerald-900 border-emerald-500 text-emerald-100'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="p-8 text-center bg-[#162740] rounded-2xl border border-blue-400/30">
            <div className="animate-spin text-4xl mb-3">⏳</div>
            <p className="font-sans text-sm text-amber-200">Carregant verificació de la carta per a {teamCode}...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/80 border-2 border-red-700 rounded-2xl text-center">
            <span className="text-3xl block mb-2">⚠️</span>
            <p className="font-bold text-red-200 text-base">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-sans font-bold"
            >
              Tornar a provar
            </button>
          </div>
        ) : data ? (
          <>
            {/* Fitxa de comprovació de la Carta */}
            <div className="bg-[#F4EBD9] text-[#2B2118] p-5 rounded-2xl border-2 border-[#8C6D53] shadow-xl space-y-4">
              {/* Identificació de l'equip */}
              <div className="flex items-center justify-between border-b border-[#8C6D53]/40 pb-2">
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#8C6D53]">
                  Equip davant vostre
                </span>
                <span className="font-mono font-bold text-sm bg-[#D8CCAE] px-2.5 py-0.5 rounded border border-[#8C6D53]">
                  {data.teamCode}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold font-serif">{data.teamName}</h2>
                <p className="text-xs text-[#5C4533] italic">
                  Els jugadors s&apos;han presentat al Pla de Masset per lliurar-vos la carta.
                </p>
              </div>

              {/* 1. Contrasenya Verbal que han de dir */}
              <div className="bg-[#FFF9F0] border-2 border-amber-600/60 rounded-xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans font-bold text-xs uppercase text-amber-900 tracking-wider">
                    🗣️ 1. Contrasenya Secreta:
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded font-sans">
                    VIVA VEU
                  </span>
                </div>
                <p className="text-base font-bold text-[#7B1A1A] font-serif my-1">
                  «{data.password}»
                </p>
                <p className="text-[11px] text-[#5C4533] italic">
                  Els jugadors us han de dir aquesta contrasenya exacta abans de rebre la carta.
                </p>
              </div>

              {/* 2. Segell esperat a la carta física */}
              <div className="bg-[#FDFBF7] border border-[#C2B299] rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans font-bold text-xs uppercase text-[#8C6D53] tracking-wider">
                    🔴 2. Segell de Bernat Mas:
                  </span>
                  <span className="text-xs font-mono font-bold bg-[#EAE0CA] px-2 py-0.5 rounded border border-[#8C6D53]">
                    #{data.expectedSeal.number}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-800 via-red-700 to-red-950 border-2 border-amber-500 shadow-md flex-shrink-0 flex items-center justify-center p-1.5">
                    <img
                      src={data.expectedSeal.image}
                      alt={data.expectedSeal.label}
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#1D3557] font-sans">
                      {data.expectedSeal.label}
                    </p>
                    <p className="text-[#5C4533] italic text-[11px] mt-0.5">
                      {data.expectedSeal.subtitle}
                    </p>
                    <p className="text-[10px] text-stone-600 mt-1">
                      <strong>Heràldica:</strong> {data.expectedSeal.heraldry}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estat de validació */}
              {data.isLetterValidated && (
                <div className="bg-emerald-100 border-2 border-emerald-600 text-emerald-900 p-3 rounded-xl text-center font-sans">
                  <p className="font-bold text-xs uppercase tracking-wider">✓ Carta Validada i Lliurada</p>
                  <p className="text-xs mt-1">
                    L&apos;Emissari ja ha marxat i la Decisió Moral està desbloquejada al mòbil dels jugadors.
                  </p>
                </div>
              )}
            </div>

            {/* Botons d'Acció de l'Emissari/Màster */}
            <div className="flex flex-col gap-2.5">
              {/* Botó Principal: Validar Carta */}
              <button
                onClick={handleValidate}
                disabled={actionLoading || data.isLetterValidated}
                className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-sans font-bold text-base shadow-xl border-2 border-emerald-500 transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span>✓</span>
                <span>VALIDAR CARTA (CONTRASENYA CORRECTA)</span>
              </button>

              {/* Botó o Indicador de Penalització per contrasenya incorrecta */}
              {!data.hasPasswordPenalty ? (
                <button
                  onClick={handlePenalize}
                  disabled={actionLoading || data.isLetterValidated}
                  className="w-full py-3 px-4 bg-red-950/80 hover:bg-red-900 active:scale-98 text-red-200 rounded-xl font-sans font-bold text-xs sm:text-sm shadow border-2 border-red-600/70 transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span>⚠️</span>
                  <span>PENALITZAR PER CONTRASENYA INCORRECTA (−10 PUNTS)</span>
                </button>
              ) : (
                <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-xl text-center font-sans">
                  <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-xs">
                    <span>✓</span>
                    <span>Penalització de −10 punts ja aplicada</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-1">
                    Els jugadors poden seguir intentant dir la contrasenya sense més deduccions de punts.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#162740] border border-blue-400/30 rounded-xl p-3.5 text-xs text-blue-200/90 font-sans leading-relaxed space-y-1.5">
              <p className="font-bold text-amber-300">🎭 Indicacions per a l&apos;Actor (Emissari):</p>
              <p>
                • <strong>Si diuen bé la contrasenya (<em>«L&apos;alba ve de Vic»</em>):</strong> agafa la carta, digues: <em>«Molt bé. El Capità sabrà recompensar la lleialtat de Bernat!»</em> i prem <strong>VALIDAR CARTA</strong>.
              </p>
              <p>
                • <strong>Si s&apos;equivoquen:</strong> pots prémer <strong>PENALITZAR (−10 PUNTS)</strong>. Després, deixa&apos;ls tornar a pensar i provar de nou la contrasenya tantes vegades com calgui (el sistema no els restarà més punts).
              </p>
            </div>
          </>
        ) : null}

        <footer className="text-center text-xs text-blue-300/80 font-sans mt-2">
          <Link href="/master" className="hover:underline">
            ← Tornar al Panell de Màster
          </Link>
        </footer>
      </div>
    </div>
  )
}
