'use client'

import { TeamData } from '@/lib/master/useDashboard'

interface TeamsTableProps {
  teams: TeamData[]
  isLoading: boolean
}

const TOTAL_STATIONS = 9

export function TeamsTable({ teams, isLoading }: TeamsTableProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSalconductIcons = (count: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
          i < count
            ? 'bg-green-200 border-green-400 text-green-900'
            : 'bg-gray-200 border-gray-300 text-gray-500'
        }`}
      >
        ✓
      </div>
    ))
  }

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200 overflow-x-auto"
      data-testid="teams-list"
    >
      <h2 className="text-xl font-bold text-amber-900 mb-6">Equips en joc</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-900 rounded-full" />
          </div>
          <span className="ml-3 text-amber-700">Carregant dades...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-amber-600 text-lg">No hi ha equips actius</p>
          <p className="text-amber-500 text-sm mt-2">
            Espera que els jugadors es connectin
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-amber-200">
                <th className="text-left py-3 px-4 font-bold text-amber-900">
                  Equip
                </th>
                <th className="text-center py-3 px-4 font-bold text-amber-900">
                  Estacions
                </th>
                <th className="text-center py-3 px-4 font-bold text-amber-900">
                  Temps
                </th>
                <th className="text-center py-3 px-4 font-bold text-amber-900">
                  Punts
                </th>
                <th className="text-center py-3 px-4 font-bold text-amber-900">
                  Salconduits
                </th>
                <th className="text-center py-3 px-4 font-bold text-amber-900">
                  Estat
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr
                  key={team.id}
                  data-testid="team-row"
                  className="border-b border-amber-100 hover:bg-amber-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-amber-900"
                        style={{
                          backgroundColor: team.color || '#d97706',
                        }}
                      />
                      <div>
                        <p className="font-semibold text-amber-900">
                          {team.name || `Equip ${idx + 1}`}
                        </p>
                        <p className="text-xs text-amber-600 font-mono">
                          {team.code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                      <span className="font-bold text-blue-900">
                        {team.solvedStationsCount}
                      </span>
                      <span className="text-blue-600 text-xs">/ {TOTAL_STATIONS}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-amber-900">
                    {formatTime(team.timeElapsed)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className="font-bold text-lg text-amber-900"
                      data-testid="team-score"
                    >
                      {team.score}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-1">
                      {getSalconductIcons(team.salconduits)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        team.finished_at
                          ? 'bg-green-100 text-green-900'
                          : team.is_active
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {team.finished_at
                        ? 'Acabat'
                        : team.is_active
                          ? 'En joc'
                          : 'Inactiu'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
