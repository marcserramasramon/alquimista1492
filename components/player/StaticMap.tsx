'use client'

import { useState } from 'react'
import { getAllStations, getStation } from '@/content/public/stations'
import type { TeamStationRow } from '@/lib/realtime/useTeamState'
import { getTeamStation } from '@/lib/realtime/useTeamState'
import { StationModal } from './StationModal'

interface StaticMapProps {
  stations: TeamStationRow[]
  teamId?: string
}

export function StaticMap({ stations, teamId }: StaticMapProps) {
  const allStations = getAllStations()
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const svgRef = useState<SVGSVGElement | null>(null)[1]

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.8), 4))
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 2) return // right click only
    let startX = e.clientX
    let startY = e.clientY
    let startPanX = panX
    let startPanY = panY

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY
      setPanX(startPanX + deltaX)
      setPanY(startPanY + deltaY)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const selectedStation = selectedStationId ? getStation(selectedStationId) : null
  const selectedTeamStation = selectedStationId
    ? getTeamStation(stations, selectedStationId)
    : null

  // Map bounds (from IGN WMS BBOX: 2.2212,41.9068,2.2380,41.9166)
  const boundMinLon = 2.2212
  const boundMinLat = 41.9068
  const boundMaxLon = 2.2380
  const boundMaxLat = 41.9166

  // SVG dimensions
  const svgWidth = 800
  const svgHeight = 600

  // Helper function to convert lat/lon to SVG coordinates
  const latLonToSVG = (lat: number, lon: number) => {
    const x =
      ((lon - boundMinLon) / (boundMaxLon - boundMinLon)) * svgWidth
    const y =
      ((boundMaxLat - lat) / (boundMaxLat - boundMinLat)) * svgHeight
    return { x, y }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-amber-50 to-white">
      {/* Title */}
      <div className="px-6 py-4 border-b border-amber-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-amber-900">Mapa del Joc</h2>
        <p className="text-sm text-amber-700 mt-1">
          Clica una estació per veure més opcions • 🖱️ Scroll per fer zoom • Clic dret per moure
        </p>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-gray-100">
        <svg
          ref={svgRef as any}
          width={svgWidth}
          height={svgHeight}
          className="border-2 border-amber-300 rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'center',
            transition: zoom === 1 && panX === 0 && panY === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Background image - IGN satellite map */}
          <image
            href="/mapa-guixa.png"
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
            preserveAspectRatio="none"
          />

          {/* Grid lines (subtle) */}
          {Array.from({ length: 5 }).map((_, i) => {
            const x = (i / 4) * svgWidth
            return (
              <line
                key={`vline-${i}`}
                x1={x}
                y1="0"
                x2={x}
                y2={svgHeight}
                stroke="#e8dcc8"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            )
          })}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = (i / 3) * svgHeight
            return (
              <line
                key={`hline-${i}`}
                x1="0"
                y1={y}
                x2={svgWidth}
                y2={y}
                stroke="#e8dcc8"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            )
          })}

          {/* Station markers */}
          {allStations.map((station) => {
            const { x, y } = latLonToSVG(station.latitude, station.longitude)
            const teamStation = getTeamStation(stations, station.id)
            const visited = !!teamStation
            const solved = teamStation?.solved ?? false

            // Determine marker color
            let markerColor = '#f59e0b' // amber (not visited)
            let borderColor = '#b45309'

            if (visited && solved) {
              markerColor = '#22c55e' // green (solved)
              borderColor = '#15803d'
            } else if (visited) {
              markerColor = '#eab308' // yellow (in progress)
              borderColor = '#b8860b'
            }

            return (
              <g key={station.id}>
                {/* Marker circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="18"
                  fill={markerColor}
                  stroke={borderColor}
                  strokeWidth="3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedStationId(station.id)}
                  className="hover:opacity-80 transition-opacity"
                />

                {/* Marker icon */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                >
                  {station.icon}
                </text>

                {/* Label */}
                <text
                  x={x}
                  y={y + 30}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#78350f"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {station.catalan.split(' ')[0]}
                </text>
              </g>
            )
          })}

          {/* Compass */}
          <g transform={`translate(${svgWidth - 40}, 30)`}>
            <circle cx="0" cy="0" r="20" fill="white" stroke="#b45309" strokeWidth="2" />
            <text x="0" y="-8" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#b45309">
              N
            </text>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#b45309" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-amber-200 bg-amber-50 flex-shrink-0">
        <div className="grid grid-cols-3 gap-4 text-xs text-amber-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-700"></div>
            <span>No visitada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-700"></div>
            <span>En progres</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700"></div>
            <span>Completada</span>
          </div>
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
