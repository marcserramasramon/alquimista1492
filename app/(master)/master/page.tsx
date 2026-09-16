'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMasterDashboard } from '@/lib/master/useDashboard'
import { TeamsTable } from '@/components/master/TeamsTable'
import { GameTimer } from '@/components/master/GameTimer'
import Link from 'next/link'

export default function MasterDashboard() {
  const router = useRouter()
  const { teams, sessionStartTime, sessionEndTime, isLoading, error } =
    useMasterDashboard()

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('master_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear the cookie
      await fetch('/api/auth/master-logout', {
        method: 'POST',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear localStorage as well
      localStorage.removeItem('master_token')
      // Redirect to login
      router.push('/(master)/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-amber-900">
              Control del Màster
            </h1>
            <p className="text-amber-700 text-sm mt-2">
              Monitoratge en viu de la partida
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/master/results"
              className="px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Veure Resultats
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-3 text-sm font-medium text-amber-900 hover:text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Tancar sessió
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg text-red-900">
            <p className="font-semibold">Error carregant dades:</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Timer Section */}
        <div className="mb-8">
          <GameTimer startTime={sessionStartTime} endTime={sessionEndTime} />
        </div>

        {/* Teams Table */}
        <TeamsTable teams={teams} isLoading={isLoading} />

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-amber-600">
          <p>Última actualització: {new Date().toLocaleTimeString('ca-ES')}</p>
        </div>
      </div>
    </div>
  )
}
