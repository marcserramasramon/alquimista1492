'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { getAllStations, getStation } from '@/content/public/stations'
import type { TeamStationRow } from '@/lib/realtime/useTeamState'
import { isStationSolved, getTeamStation } from '@/lib/realtime/useTeamState'
import { StationModal } from './StationModal'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface MapTabProps {
  stations: TeamStationRow[]
  teamId?: string
}

export function MapTab({ stations, teamId }: MapTabProps) {
  const router = useRouter()
  const allStations = getAllStations()
  const mapRef = useRef<any>(null)

  // State for modal
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const selectedStation = selectedStationId
    ? getStation(selectedStationId) || null
    : null
  const selectedTeamStation = selectedStationId
    ? getTeamStation(stations, selectedStationId) || null
    : null

  // Calculate bounds from station coordinates
  let centerLat = 42.1278 // Fallback center
  let centerLon = 2.1278

  if (allStations.length > 0) {
    const lats = allStations.map((s) => s.latitude)
    const lons = allStations.map((s) => s.longitude)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    // Add padding (10% of range)
    const latPadding = Math.max((maxLat - minLat) * 0.1, 0.01)
    const lonPadding = Math.max((maxLon - minLon) * 0.1, 0.01)

    centerLat = (minLat + maxLat) / 2
    centerLon = (minLon + maxLon) / 2
  }

  const handleMarkerClick = (stationId: string) => {
    setSelectedStationId(stationId)
  }

  const handleGameStart = () => {
    if (selectedStationId) {
      const teamStation = getTeamStation(stations, selectedStationId)
      if (teamStation?.station_id) {
        // Redirect to game if exists, otherwise this shouldn't happen
        // The game component will handle game state via context
        setSelectedStationId(null)
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Title */}
      <div className="px-6 py-4 border-b border-amber-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-amber-900">Mapa del Joc</h2>
        <p className="text-sm text-amber-700 mt-1">
          Clica una estació per veure més opcions
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          {...({
            center: [centerLat, centerLon],
            zoom: 15,
            maxZoom: 17,
            minZoom: 13,
            style: {
              height: '100%',
              width: '100%',
              filter: 'sepia(30%)',
            },
            className: 'z-0',
            ref: mapRef,
          } as any)}
        >
          <TileLayer
            {...({
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            } as any)}
          />

          {/* Station Markers */}
          {allStations.map((station) => {
            const teamStation = getTeamStation(stations, station.id)
            const visited = !!teamStation
            const solved = teamStation?.solved ?? false

            return (
              <Marker
                key={station.id}
                {...({
                  position: [station.latitude, station.longitude],
                  eventHandlers: {
                    click: () => handleMarkerClick(station.id),
                  },
                } as any)}
              >
                <Popup>
                  <div className="text-sm">
                    <h4 className="font-bold text-amber-900">
                      {station.icon} {station.catalan}
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      {station.description}
                    </p>
                    <div className="mt-2">
                      {!visited ? (
                        <span className="text-amber-700 font-semibold">
                          🔒 No visitada
                        </span>
                      ) : solved ? (
                        <span className="text-green-700 font-semibold">
                          ✓ Completada
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          ⏳ En progres
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-600 mt-2 cursor-pointer hover:underline">
                      Toca per més opcions →
                    </p>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-amber-200 bg-amber-50 flex-shrink-0">
        <div className="text-xs text-amber-700 space-y-1">
          <div>🔒 = No visitada</div>
          <div>⏳ = En progres</div>
          <div>✓ = Completada</div>
        </div>
      </div>

      {/* Station Modal */}
      <StationModal
        isOpen={selectedStationId !== null}
        onClose={() => setSelectedStationId(null)}
        station={selectedStation}
        teamStation={selectedTeamStation}
        teamId={teamId}
      />
    </div>
  )
}
