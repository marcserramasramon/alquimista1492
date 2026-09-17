'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface TeamData {
  id: string
  code: string
  name: string
  color: string
  variant: string
  salconduitsRemaining: number
  coartada?: {
    type: string
    name: string
    frases: string[]
  }
}

export default function EmissariControlPage({
  params,
}: {
  params: Promise<{ teamCode: string }>
}) {
  const resolvedParams = use(params)
  const teamCode = resolvedParams.teamCode?.toUpperCase()

  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'danger'; message: string } | null>(null)

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/emissari/team-info?teamCode=${teamCode}`)
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'No s\'ha pogut carregar l\'equip')
      }

      const data = await res.json()
      setTeamData(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error desconegut')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
  }, [teamCode])

  const handleAction = async (action: 'confiscate' | 'restore') => {
    if (!teamCode || actionLoading) return

    try {
      setActionLoading(true)
      const res = await fetch('/api/emissari/confiscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode, action }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error en executar l\'acció')
      }

      setTeamData(prev => prev ? { ...prev, salconduitsRemaining: data.salconduitsRemaining } : null)

      if (action === 'confiscate') {
        setNotification({
          type: 'danger',
          message: `🚫 Salvo confiscat! Ara l'equip té ${data.salconduitsRemaining} permisos.`,
        })
      } else {
        setNotification({
          type: 'success',
          message: `✓ Permís restaurat. Ara en té ${data.salconduitsRemaining}.`,
        })
      }

      setTimeout(() => setNotification(null), 4000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error en l\'acció')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1D3557] text-[#F4EBD9] p-4 flex flex-col items-center font-serif">
      <div className="w-full max-w-md my-auto flex flex-col gap-4">
        {/* Capçalera Oficial Emissari */}
        <header className="text-center border-b border-[#8C6D53]/60 pb-3">
          <span className="text-3xl block mb-1">⚔️</span>
          <span className="text-xs font-sans uppercase tracking-widest text-amber-300 font-bold">
            Consola de Camp · L'Emissari
          </span>
          <h1 className="text-2xl font-bold text-[#F4EBD9]">
            Punt de Control: Pla de Masset
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
            <p className="font-sans text-sm text-amber-200">Verificant salvoconducte de l'equip {teamCode}...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/80 border-2 border-red-700 rounded-2xl text-center">
            <span className="text-3xl block mb-2">⚠️</span>
            <p className="font-bold text-red-200 text-base">{error}</p>
            <button
              onClick={fetchTeamData}
              className="mt-4 px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-sans font-bold"
            >
              Tornar a provar
            </button>
          </div>
        ) : teamData ? (
          <>
            {/* Dades de l'Equip */}
            <div className="bg-[#F4EBD9] text-[#2B2118] p-5 rounded-2xl border-2 border-[#8C6D53] shadow-xl">
              <div className="flex items-center justify-between border-b border-[#8C6D53]/40 pb-2 mb-3">
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#8C6D53]">
                  Equip Identificat
                </span>
                <span className="font-mono font-bold text-sm bg-[#D8CCAE] px-2.5 py-0.5 rounded border border-[#8C6D53]">
                  {teamData.code}
                </span>
              </div>

              <h2 className="text-xl font-bold font-serif mb-1">
                {teamData.name}
              </h2>
              <p className="text-xs text-[#5C4533] italic mb-4">
                L'equip ha presentat el seu salvoconducte davant vostre.
              </p>

              {/* Estat dels 2 Permisos de l'Equip */}
              <div className="bg-[#EAE0CA] p-3 rounded-xl border border-[#8C6D53] mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans font-bold text-xs text-[#1D3557]">
                    Permisos de Circulació (Salvos):
                  </span>
                  <span className="font-sans font-extrabold text-sm text-[#1D3557]">
                    {teamData.salconduitsRemaining} / 2 VÀLIDS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`p-2.5 rounded-lg border text-center font-sans text-xs font-bold transition ${
                      teamData.salconduitsRemaining >= 1
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                        : 'bg-red-100 border-red-500 text-red-800 line-through opacity-75'
                    }`}
                  >
                    Permís I: {teamData.salconduitsRemaining >= 1 ? '✓ VÀLID' : '🚫 CONFISCAT'}
                  </div>
                  <div
                    className={`p-2.5 rounded-lg border text-center font-sans text-xs font-bold transition ${
                      teamData.salconduitsRemaining >= 2
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                        : 'bg-red-100 border-red-500 text-red-800 line-through opacity-75'
                    }`}
                  >
                    Permís II: {teamData.salconduitsRemaining >= 2 ? '✓ VÀLID' : '🚫 CONFISCAT'}
                  </div>
                </div>
              </div>

              {/* La Coartada que han de saber */}
              {teamData.coartada && (
                <div className="bg-[#FDFBF7] border border-[#C2B299] rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between mb-1.5 font-sans font-bold text-[#8C6D53]">
                    <span>📜 Coartada Assignada:</span>
                    <span className="text-[11px] text-[#1D3557]">{teamData.coartada.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-2 italic">
                    Interroga'ls per comprovar si tots diuen aquesta història:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-[#2B2118] font-serif">
                    {teamData.coartada.frases.map((f, i) => (
                      <li key={i} className="leading-snug">
                        «{f}»
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Botons d'Acció de l'Emissari */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleAction('confiscate')}
                disabled={actionLoading || teamData.salconduitsRemaining <= 0}
                className="w-full py-4 px-4 bg-red-700 hover:bg-red-800 active:scale-98 text-white rounded-xl font-sans font-bold text-base shadow-xl border-2 border-red-500 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>⚔️</span>
                <span>CONFISCAR 1 SALVO (−1 PERMÍS)</span>
              </button>

              <button
                onClick={() => {
                  setNotification({
                    type: 'success',
                    message: '✓ Has donat per bo el salvoconducte. L\'equip passa net!',
                  })
                  setTimeout(() => setNotification(null), 3000)
                }}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-sans font-bold text-sm shadow border border-emerald-400 transition flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>DONAR PER BO EL PAS (PAS NET)</span>
              </button>

              {teamData.salconduitsRemaining < 2 && (
                <button
                  onClick={() => handleAction('restore')}
                  disabled={actionLoading}
                  className="w-full py-2 text-xs font-sans text-amber-200 hover:text-white underline transition text-center"
                >
                  ↩️ Restaurar un salvo (desfer error)
                </button>
              )}
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
