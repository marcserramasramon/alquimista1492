'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TeamResult {
  id: string
  name: string | null
  code: string
  color: string | null
  score: number
  timeElapsed: number
  moralChoice?: string
  accuracy?: string
  playersCount?: number
}

export default function MasterResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<TeamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('master_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('master_token')
        const headers: Record<string, string> = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const res = await fetch('/api/master/results', { headers })
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}))
          throw new Error(errJson.error || 'Error carregant resultats')
        }

        const data = await res.json()
        setResults(data.results || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleExportCSV = () => {
    const headers = [
      'Posició',
      'Codi',
      'Equip',
      'Jugadors',
      'Temps',
      'Punts',
      'Decisió Moral',
      'Precisió',
    ]
    const rows = results.map((team, idx) => [
      idx + 1,
      team.code,
      team.name || `Equip ${idx + 1}`,
      team.playersCount || 0,
      formatTime(team.timeElapsed),
      team.score,
      team.moralChoice === 'A' ? 'Compassió (A)' : team.moralChoice === 'B' ? 'Justícia (B)' : '-',
      team.accuracy || '0%',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `resultats-traidor-guixa-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🏆</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-amber-950">
                Resultats de la Partida
              </h1>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              Classificació oficial dels 8 equips de la Guixa
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow transition-colors flex items-center gap-2"
            >
              <span>📥</span> Descarregar CSV
            </button>
            <Link
              href="/master"
              className="px-5 py-2.5 text-sm font-medium text-amber-950 hover:text-amber-800 border border-amber-300 rounded-xl bg-white hover:bg-amber-50 shadow-sm transition-colors flex items-center gap-2"
            >
              <span>←</span> Panell del Màster
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-900">
            <p className="font-semibold">Error carregant resultats:</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-900 rounded-full" />
              <span className="ml-3 text-amber-800 font-semibold">Carregant resultats...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-amber-700 text-lg font-semibold">No hi ha equips registrats</p>
              <p className="text-amber-600 text-sm mt-1">
                Inicia una partida des del Panell del Màster
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-center py-3 px-3 font-bold text-amber-900 w-12">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-amber-900">
                      Equip
                    </th>
                    <th className="text-center py-3 px-3 font-bold text-amber-900">
                      Jugadors
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-amber-900">
                      Temps
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-amber-900">
                      Puntuació
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-amber-900">
                      Decisió Moral
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-amber-900">
                      Precisió
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((team, idx) => (
                    <tr
                      key={team.id || team.code}
                      className={`border-b border-amber-100 hover:bg-amber-50/80 transition-colors ${
                        idx === 0
                          ? 'bg-amber-50/50'
                          : idx === 1
                            ? 'bg-stone-50/50'
                            : ''
                      }`}
                    >
                      <td className="py-4 px-3 text-center font-bold text-lg font-mono">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}r`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-amber-900 shrink-0"
                            style={{
                              backgroundColor: team.color || '#d97706',
                            }}
                          />
                          <div>
                            <p className="font-semibold text-amber-950">
                              {team.name || `Equip ${idx + 1}`}
                            </p>
                            <span className="text-[11px] text-amber-600 font-mono">
                              {team.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full">
                          👥 {team.playersCount || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-amber-900">
                        {formatTime(team.timeElapsed)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block font-bold text-base text-amber-950 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                          {team.score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            team.moralChoice === 'A'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : team.moralChoice === 'B'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {team.moralChoice === 'A'
                            ? 'Compassió (A)'
                            : team.moralChoice === 'B'
                              ? 'Justícia (B)'
                              : 'Pendent'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-amber-900 font-semibold">
                        {team.accuracy || '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {results.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-5 border border-amber-200 text-center">
              <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                Líder de la Partida
              </p>
              <p className="text-xl font-black text-amber-950">
                {results[0]?.name || results[0]?.code}
              </p>
              <p className="text-xs text-amber-600 mt-1 font-mono">
                {results[0]?.score || 0} punts
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border border-amber-200 text-center">
              <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                Puntuació Mitjana
              </p>
              <p className="text-xl font-black text-amber-950">
                {Math.round(
                  results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length
                )}{' '}
                pts
              </p>
              <p className="text-xs text-amber-600 mt-1">
                8 equips en competició
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border border-amber-200 text-center">
              <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                Decisions Morals
              </p>
              <div className="flex justify-center gap-4 text-xs font-semibold mt-1">
                <span className="text-emerald-700">
                  A (Compassió): {results.filter((r) => r.moralChoice === 'A').length}
                </span>
                <span className="text-amber-800">
                  B (Justícia): {results.filter((r) => r.moralChoice === 'B').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
