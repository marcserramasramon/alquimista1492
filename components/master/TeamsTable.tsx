'use client'

import { useState } from 'react'
import { TeamData } from '@/lib/master/useDashboard'

interface TeamsTableProps {
  teams: TeamData[]
  isLoading: boolean
  onOpenQR?: (team: TeamData) => void
}

const TOTAL_STATIONS = 9

export function TeamsTable({ teams, isLoading, onOpenQR }: TeamsTableProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)

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
            ? 'bg-green-200 border-green-500 text-green-900'
            : 'bg-stone-200 border-stone-300 text-stone-400'
        }`}
        title={i < count ? 'Salconduit disponible' : 'Salconduit utilitzat'}
      >
        {i < count ? '🎫' : '✕'}
      </div>
    ))
  }

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-200 overflow-x-auto"
      data-testid="teams-list"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-amber-900">
            Estat dels 8 Equips
          </h2>
          <p className="text-xs text-amber-700 mt-0.5">
            Partida única en temps real
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
          {teams.length} equips configurats
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-900 rounded-full" />
          </div>
          <span className="ml-3 text-amber-700">Carregant dades dels equips...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-amber-600 text-lg">No s'han trobat equips actius</p>
          <p className="text-amber-500 text-sm mt-2">
            Fes clic a "Reiniciar / Nova Partida" per preparar els 8 equips
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
                <th className="text-center py-3 px-3 font-bold text-amber-900">
                  Jugadors
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
                <th className="text-center py-3 px-3 font-bold text-amber-900">
                  Estat
                </th>
                <th className="text-center py-3 px-3 font-bold text-amber-900">
                  QR Accés
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr
                  key={team.id || team.code}
                  data-testid="team-row"
                  className="border-b border-amber-100 hover:bg-amber-50/80 transition-colors"
                >
                  {/* Equip */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-amber-900 shrink-0"
                        style={{
                          backgroundColor: team.color || '#d97706',
                        }}
                      />
                      <div>
                        <p className="font-semibold text-amber-900 leading-tight">
                          {team.name || `Equip ${idx + 1}`}
                        </p>
                        <span className="text-[11px] text-amber-600 font-mono">
                          {team.code} · Var {team.variant}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Jugadors connectats */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedTeam(team)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        team.playersCount > 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                      title="Veure membres de l'equip"
                    >
                      <span>👥</span>
                      <span>{team.playersCount}</span>
                    </button>
                  </td>

                  {/* Estacions */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      <span className="font-bold text-blue-900">
                        {team.solvedStationsCount}
                      </span>
                      <span className="text-blue-600 text-xs">/ {TOTAL_STATIONS}</span>
                    </div>
                  </td>

                  {/* Temps */}
                  <td className="py-3 px-4 text-center font-mono text-amber-900">
                    {formatTime(team.timeElapsed)}
                  </td>

                  {/* Punts */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className="font-bold text-base text-amber-900"
                      data-testid="team-score"
                    >
                      {team.score}
                    </span>
                  </td>

                  {/* Salconduits */}
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-1">
                      {getSalconductIcons(team.salconduits)}
                    </div>
                  </td>

                  {/* Estat */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        team.finished_at
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : team.playersCount > 0
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {team.finished_at
                        ? 'Acabat'
                        : team.playersCount > 0
                          ? 'En joc'
                          : 'Pendent'}
                    </span>
                  </td>

                  {/* Botó QR */}
                  <td className="py-3 px-3 text-center">
                    {onOpenQR && (
                      <button
                        onClick={() => onOpenQR(team)}
                        className="px-2.5 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded border border-amber-300 transition-colors inline-flex items-center gap-1"
                        title="Veure codi QR d'aquest equip"
                      >
                        <span>📱</span> QR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de membres de l'equip */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-amber-300 text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-5 h-5 rounded-full border-2 border-amber-900 shrink-0"
                style={{ backgroundColor: selectedTeam.color || '#d97706' }}
              />
              <h3 className="text-lg font-bold text-amber-950">
                {selectedTeam.name || 'Equip'}
              </h3>
            </div>

            {selectedTeam.playerNames && selectedTeam.playerNames.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {selectedTeam.playerNames.map((nom, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-amber-900 font-medium"
                  >
                    <span>🙋</span>
                    <span>{nom}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-500 mb-4">Cap jugador connectat encara.</p>
            )}

            <button
              onClick={() => setSelectedTeam(null)}
              className="w-full min-h-[48px] text-sm font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
            >
              Tancar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
