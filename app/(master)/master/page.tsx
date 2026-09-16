'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionForm } from '@/components/master/SessionForm'
import Link from 'next/link'

interface Session {
  id: string
  name: string
  createdAt: string
  status: 'active' | 'paused' | 'finished'
}

export default function MasterDashboard() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('master_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('master_sessions')
    if (saved) {
      try {
        setSessions(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading sessions:', e)
      }
    }
  }, [])

  const handleCreateSession = async (name: string) => {
    setIsLoading(true)
    try {
      const newSession: Session = {
        id: `session-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        status: 'active',
      }

      const updated = [...sessions, newSession]
      setSessions(updated)
      localStorage.setItem('master_sessions', JSON.stringify(updated))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('master_token')
    router.push('/login')
  }

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id)
    setSessions(updated)
    localStorage.setItem('master_sessions', JSON.stringify(updated))
  }

  const statusBadgeColor: Record<Session['status'], string> = {
    active: 'bg-green-100 text-green-800 border-green-300',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    finished: 'bg-gray-100 text-gray-800 border-gray-300',
  }

  const statusLabel: Record<Session['status'], string> = {
    active: 'Activa',
    paused: 'Pausada',
    finished: 'Finalitzada',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">
              Control del Màster
            </h1>
            <p className="text-amber-700 text-sm mt-1">
              Gestiona les partides de "El Traïdor de la Guixa"
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-amber-900 hover:text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Tancar sessió
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Session Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200 sticky top-4">
              <h2 className="text-xl font-bold text-amber-900 mb-6">
                Nova partida
              </h2>
              <SessionForm onSubmit={handleCreateSession} isLoading={isLoading} />
            </div>
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-6">
                Partides ({sessions.length})
              </h2>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-amber-600 text-lg">
                    No hi ha partides encara
                  </p>
                  <p className="text-amber-500 text-sm mt-2">
                    Crea una nova partida per a començar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900">
                          {session.name}
                        </h3>
                        <p className="text-sm text-amber-600 mt-1">
                          {new Date(session.createdAt).toLocaleString('ca-ES')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full border ${
                            statusBadgeColor[session.status]
                          }`}
                        >
                          {statusLabel[session.status]}
                        </span>

                        <Link
                          href={`/master/session/${session.id}`}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          Obrir
                        </Link>

                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Suprimir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
