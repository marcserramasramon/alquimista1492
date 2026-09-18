'use client'

import { useCallback } from 'react'
import { getStation, getAllStations } from '@/content/public/stations'
import type { TeamStationRow } from '@/lib/realtime/useTeamState'
import { isStationSolved } from '@/lib/realtime/useTeamState'

interface StationsTabProps {
  stations: TeamStationRow[]
  onSelectStation: (stationId: string) => void
}

export function StationsTab({ stations, onSelectStation }: StationsTabProps) {
  const allStations = getAllStations()

  const getStationStatus = useCallback(
    (stationId: string) => {
      const solved = isStationSolved(stations, stationId)
      if (solved) {
        return { icon: '✓', label: 'Resolt', class: 'text-green-700 bg-green-50' }
      }
      return { icon: '🔒', label: 'Bloquejat', class: 'text-amber-700 bg-amber-50' }
    },
    [stations]
  )

  return (
    <div className="w-full">
      {/* Title */}
      <div className="px-6 py-4 border-b border-amber-200">
        <h2 className="text-xl font-bold text-amber-900">
          Estacions del Joc
        </h2>
        <p className="text-sm text-amber-700 mt-1">
          {stations.filter(s => s.solved).length} de {stations.length} estacions resoltes
        </p>
      </div>

      {/* Stations Grid */}
      <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {allStations.map((station) => {
          const status = getStationStatus(station.id)
          const teamStation = stations.find(
            (ts) => ts.station_id === station.id
          )

          return (
            <button
              key={station.id}
              onClick={() => onSelectStation(station.id)}
              className="w-full p-4 rounded-lg border-2 border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 active:scale-95 transition-all text-left"
            >
              {/* Header with icon and name */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{station.icon}</div>
                  <div>
                    <h3 className="font-bold text-amber-900">
                      {station.catalan}
                    </h3>
                    <p className="text-xs text-amber-700">
                      {station.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${status.class}`}
                >
                  {status.icon} {status.label}
                </div>
              </div>

              {/* Attempts counter if available */}
              {teamStation && teamStation.attempts && teamStation.attempts > 0 && (
                <div className="text-xs text-amber-600 ml-11">
                  Intents: {teamStation.attempts}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
