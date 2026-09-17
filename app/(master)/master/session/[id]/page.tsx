'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { QRCodeDisplay } from '@/components/master/QRCode'
import Link from 'next/link'

interface Team {
  id: string
  code: string
  name: string
  createdAt: string
}

const TEAM_COLORS = ['bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-cyan-100']

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [teams, setTeams] = useState<Team[]>([])
  const [teamName, setTeamName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('master_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  // Load teams for this session
  useEffect(() => {
    const saved = localStorage.getItem(`session-teams-${sessionId}`)
    if (saved) {
      try {
        setTeams(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading teams:', e)
      }
    }
  }, [sessionId])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return

    setIsLoading(true)
    try {
      // Call API to create team
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          teamName: teamName.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to create team:', error)
        alert('Error creating team. Please try again.')
        return
      }

      const { code } = await response.json()

      // Add to local state
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        code,
        name: teamName,
        createdAt: new Date().toISOString(),
      }

      const updated = [...teams, newTeam]
      setTeams(updated)
      localStorage.setItem(`session-teams-${sessionId}`, JSON.stringify(updated))
      setTeamName('')
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Error creating team. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTeam = (id: string) => {
    const updated = teams.filter((t) => t.id !== id)
    setTeams(updated)
    localStorage.setItem(`session-teams-${sessionId}`, JSON.stringify(updated))
    if (selectedTeamId === id) {
      setSelectedTeamId(null)
    }
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  const stationQRData = [
    { id: 'station-1', name: 'Serrat de les Bruixes', token: 'STN001' },
    { id: 'station-2', name: 'Font del Ferro', token: 'STN002' },
    { id: 'station-3', name: 'Planes Bones', token: 'STN003' },
    { id: 'station-4', name: 'Cementiri', token: 'STN004' },
    { id: 'station-5', name: 'Pla de Masset (Control)', token: 'STN005' },
    { id: 'station-6', name: 'Pla de Masset (Acusació)', token: 'STN006' },
    { id: 'station-7', name: 'Rectoria (Caixa)', token: 'STN007' },
    { id: 'station-8', name: 'Campanar', token: 'STN008' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/master"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Tornar a les partides
          </Link>
          <h1 className="text-3xl font-bold text-amber-900">
            Gestió de partida
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-6">
                Equips
              </h2>

              {/* Create Team Form */}
              <form onSubmit={handleCreateTeam} className="mb-6 pb-6 border-b border-amber-200">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nom de l'equip"
                    className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!teamName.trim() || isLoading}
                    className="w-full py-2 px-3 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isLoading ? 'Creant...' : '+ Afegir equip'}
                  </button>
                </div>
              </form>

              {/* Teams List */}
              <div className="space-y-2">
                {teams.map((team, index) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedTeamId === team.id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${TEAM_COLORS[index % TEAM_COLORS.length]}`} />
                      <div>
                        <p className="font-semibold text-sm text-amber-900">{team.name}</p>
                        <p className="text-xs text-amber-600">{team.code}</p>
                      </div>
                    </div>
                  </button>
                ))}

                {teams.length === 0 && (
                  <p className="text-center py-6 text-amber-600 text-sm">
                    Sense equips
                  </p>
                )}
              </div>

              {/* Delete Team Button */}
              {selectedTeam && (
                <button
                  onClick={() => handleDeleteTeam(selectedTeam.id)}
                  className="w-full mt-4 py-2 px-3 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Suprimir equip
                </button>
              )}
            </div>
          </div>

          {/* QR Codes Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team QR Code */}
            {selectedTeam && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
                <h2 className="text-xl font-bold text-amber-900 mb-4">
                  QR d'entrada - {selectedTeam.name}
                </h2>
                <div className="flex justify-center">
                  <QRCodeDisplay
                    value={selectedTeam.code}
                    size={250}
                    label={`Codi: ${selectedTeam.code}`}
                  />
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full mt-4 py-2 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Imprimir QR
                </button>
              </div>
            )}

            {/* Station QR Codes Grid */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-4">
                QR d'estacions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {stationQRData.map((station) => (
                  <div key={station.id} className="flex flex-col items-center">
                    <QRCodeDisplay
                      value={station.token}
                      size={120}
                    />
                    <p className="text-xs text-center text-amber-900 font-medium mt-2 line-clamp-2">
                      {station.name}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.print()}
                className="w-full mt-6 py-2 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Imprimir tots els QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
