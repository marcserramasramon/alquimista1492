'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db'
import type { Database } from '@/lib/db.types'
import Link from 'next/link'

type TeamResult = Database['public']['Tables']['teams']['Row'] & {
  score: number
  timeElapsed: number
  moralChoice?: string
  accuracy?: string
}

export default function ResultsPage() {
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
      'Equip',
      'Temps',
      'Punts',
      'Decisió Moral',
      'Precisió',
    ]
    const rows = results.map((team, idx) => [
      idx + 1,
      team.name || `Equip ${idx + 1}`,
      formatTime(team.timeElapsed),
      team.score,
      team.moralChoice || '-',
      team.accuracy,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `resultats-traidor-${new Date().toISOString().split('T')[0]}.csv`)
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
            <h1 className="text-4xl font-bold text-amber-900">
              Resultats de la Partida
            </h1>
            <p className="text-amber-700 text-sm mt-2">
              Classificació final dels equips
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Descarregar CSV
            </button>
            <Link
              href="/master"
              className="px-6 py-3 text-sm font-medium text-amber-900 hover:text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Tornar al Dashboard
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-900">
            <p className="font-semibold">Error carregant resultats:</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-900 rounded-full" />
              </div>
              <span className="ml-3 text-amber-700">Carregant resultats...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-amber-600 text-lg">No hi ha resultats ainda</p>
              <p className="text-amber-500 text-sm mt-2">
                Espera que els equips acabin la partida
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="text-center py-3 px-4 font-bold text-amber-900 w-12">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-bold text-amber-900">
                      Equip
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-amber-900">
                      Temps
                    </th>
                    <th className="text-center py-3 px-4 font-bold text-amber-900">
                      Punts
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
                      key={team.id}
                      className={`border-b border-amber-100 hover:bg-amber-50 transition-colors ${
                        idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center font-bold text-lg">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 border-amber-900"
                            style={{
                              backgroundColor: team.color || '#d97706',
                            }}
                          />
                          <p className="font-semibold text-amber-900">
                            {team.name || `Equip ${idx + 1}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-amber-900">
                        {formatTime(team.timeElapsed)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block font-bold text-lg text-amber-900 bg-amber-100 px-4 py-2 rounded-lg">
                          {team.score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            team.moralChoice === 'A'
                              ? 'bg-green-100 text-green-900'
                              : team.moralChoice === 'B'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {team.moralChoice === 'A'
                            ? 'Acceptar'
                            : team.moralChoice === 'B'
                              ? 'Rebutjar'
                              : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-amber-900 font-semibold">
                        {team.accuracy}
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
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
              <p className="text-amber-600 text-sm mb-2">Guanyador</p>
              <p className="text-2xl font-bold text-amber-900">
                {results[0].name || 'Equip 1'}
              </p>
              <p className="text-sm text-amber-600 mt-2">
                {results[0].score} punts
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
              <p className="text-amber-600 text-sm mb-2">Equips participants</p>
              <p className="text-2xl font-bold text-amber-900">{results.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
              <p className="text-amber-600 text-sm mb-2">Puntuació mitjana</p>
              <p className="text-2xl font-bold text-amber-900">
                {Math.round(
                  results.reduce((sum, t) => sum + t.score, 0) / results.length
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
