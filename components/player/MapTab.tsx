'use client'

import dynamic from 'next/dynamic'
import { getAllStations } from '@/content/public/stations'
import type { TeamStationRow } from '@/lib/realtime/useTeamState'
import { isStationSolved } from '@/lib/realtime/useTeamState'

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
}

export function MapTab({ stations }: MapTabProps) {
  const allStations = getAllStations()

  // Center of Guixa area (approximate)
  const centerLat = 42.1278
  const centerLon = 2.1278

  return (
    <div className="w-full h-full flex flex-col">
      {/* Title */}
      <div className="px-6 py-4 border-b border-amber-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-amber-900">Mapa del Joc</h2>
        <p className="text-sm text-amber-700 mt-1">
          Localitzacions de les 9 estacions
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          {...({
            center: [centerLat, centerLon],
            zoom: 14,
            style: {
              height: '100%',
              width: '100%',
              filter: 'sepia(30%)',
            },
            className: 'z-0',
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
            const solved = isStationSolved(stations, station.id)

            return (
              <Marker
                key={station.id}
                {...({
                  position: [station.latitude, station.longitude],
                } as any)}
              >
                <Popup>
                  <div className="text-sm">
                    <h4 className="font-bold text-amber-900">
                      {station.catalan}
                    </h4>
                    <p className="text-xs text-amber-700 mt-1">
                      {station.description}
                    </p>
                    <div className="mt-2">
                      {solved ? (
                        <span className="text-green-700 font-semibold">
                          ✓ Resolt
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          🔒 Bloquejat
                        </span>
                      )}
                    </div>
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
          <div>✓ = Estació resolta</div>
          <div>🔒 = Estació bloquejada</div>
        </div>
      </div>
    </div>
  )
}
