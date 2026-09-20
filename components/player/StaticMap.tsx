'use client'

import { useRef, useState } from 'react'
import { getAllStations, getStation } from '@/content/public/stations'
import type { TeamStationRow, TeamEvidenceRow } from '@/lib/realtime/useTeamState'
import { getTeamStation } from '@/lib/realtime/useTeamState'
import { StationModal } from './StationModal'

interface StaticMapProps {
  stations: TeamStationRow[]
  evidences?: TeamEvidenceRow[]
  teamId?: string
}

// Fites principals de l'Acte 1 (elements): sempre en verd clar
const FITES_PRINCIPALS = new Set([
  'serrat',
  'serrat-bruixes',
  'font_ferro',
  'font-ferro',
  'planes_bones',
  'planes-bones',
  'cementiri',
  'sometent-campanar',
  'campanar',
])

export function StaticMap({ stations, evidences = [], teamId }: StaticMapProps) {
  const isCampanarUnlocked = evidences.some((e) => e.evidence_id === 'carta_lliurada')

  // Estacions amagades: 'escola' no té fita; 'caixa_almoines' comparteix amb rectoria;
  // 'sometent-campanar' només apareix quan s'ha lliurat la carta a l'Emissari
  const hiddenStationIds = new Set([
    'escola',
    'caixa_almoines',
    'caixa-almoines',
    ...(!isCampanarUnlocked
      ? [
          'campanar',
          'bells-sometent',
          'bells_sometent',
          'sometent-campanar',
          'sometent_campanar',
        ]
      : []),
  ])

  const allStations = getAllStations().filter((station) => !hiddenStationIds.has(station.id))
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const svgRef = useState<SVGSVGElement | null>(null)[1]

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.min(Math.max(prev * delta, 1), 4))
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Botó esquerre (arrossegar) o dret: tots dos mouen el mapa a escriptori.
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

  const touchStateRef = useRef<{
    mode: 'pan' | 'pinch' | null
    startX: number
    startY: number
    startPanX: number
    startPanY: number
    startDistance: number
    startZoom: number
  }>({ mode: null, startX: 0, startY: 0, startPanX: 0, startPanY: 0, startDistance: 0, startZoom: 1 }).current

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      touchStateRef.mode = 'pan'
      touchStateRef.startX = e.touches[0].clientX
      touchStateRef.startY = e.touches[0].clientY
      touchStateRef.startPanX = panX
      touchStateRef.startPanY = panY
    } else if (e.touches.length === 2) {
      touchStateRef.mode = 'pinch'
      touchStateRef.startDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      touchStateRef.startZoom = zoom
      touchStateRef.startX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      touchStateRef.startY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      touchStateRef.startPanX = panX
      touchStateRef.startPanY = panY
    }
  }

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (touchStateRef.mode === 'pan' && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStateRef.startX
      const deltaY = e.touches[0].clientY - touchStateRef.startY
      setPanX(touchStateRef.startPanX + deltaX / zoom)
      setPanY(touchStateRef.startPanY + deltaY / zoom)
    } else if (touchStateRef.mode === 'pinch' && e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      if (touchStateRef.startDistance > 0) {
        const nextZoom = Math.min(Math.max(touchStateRef.startZoom * (distance / touchStateRef.startDistance), 1), 4)
        setZoom(nextZoom)
      }
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      setPanX(touchStateRef.startPanX + (centerX - touchStateRef.startX) / zoom)
      setPanY(touchStateRef.startPanY + (centerY - touchStateRef.startY) / zoom)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 0) {
      touchStateRef.mode = null
    } else if (e.touches.length === 1) {
      // Passem de pessic a arrossegar amb un dit sense saltar de posició.
      touchStateRef.mode = 'pan'
      touchStateRef.startX = e.touches[0].clientX
      touchStateRef.startY = e.touches[0].clientY
      touchStateRef.startPanX = panX
      touchStateRef.startPanY = panY
    }
  }

  const selectedStation = selectedStationId ? getStation(selectedStationId) || null : null
  const selectedTeamStation = selectedStationId
    ? getTeamStation(stations, selectedStationId) || null
    : null

  // Map bounds (retallat: -10% esquerra, -20% dreta, -30% baix)
  const boundMinLon = 2.22288
  const boundMinLat = 41.90974
  const boundMaxLon = 2.23464
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
    <div className="w-full h-full flex flex-col bg-parchment overflow-y-auto">
      {/* Header — mateixa estètica que Història */}
      <div className="px-4 sm:px-6 pb-2 flex-shrink-0">
        <div className="w-full max-w-4xl mx-auto">
          <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-leather pb-1.5 mb-2 text-center">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-ink font-serif uppercase">
              MAPA
            </h1>
            <p className="text-xs text-leather font-sans mt-0.5">
              Clica les fites • Fes zoom • Arrossega per moure
            </p>
          </header>

          {/* Llegenda a sobre del mapa */}
          <div className="pt-1 pb-2">
            <p className="text-xs uppercase tracking-wider font-bold text-leather mb-1.5 font-sans">Llegenda:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-ink">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/15 shadow-2xs" style={{ backgroundColor: '#1E3A5F' }}></div>
                <span>Fita principal pendent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/15 shadow-2xs" style={{ backgroundColor: '#93C5FD' }}></div>
                <span>Altres punts pendents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/15 shadow-2xs" style={{ backgroundColor: '#9CA3AF' }}></div>
                <span>Fita principal visitada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/15 shadow-2xs" style={{ backgroundColor: '#E5E7EB' }}></div>
                <span>Altres punts visitats</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative overflow-hidden flex items-center justify-center p-4 bg-[#EAE0CA]/40 aspect-[4/3] flex-shrink-0">
        <svg
          ref={svgRef as any}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="border-2 border-leather/50 rounded-xl shadow-lg cursor-grab active:cursor-grabbing touch-none w-full h-full"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'center',
            transition: zoom === 1 && panX === 0 && panY === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Background image - Mapa il·lustrat del joc */}
          <image
            href="/map-test.webp"
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

          {/* Station markers - Only icons / element images */}
          {allStations.map((station) => {
            const { x, y } = latLonToSVG(station.latitude, station.longitude)
            const teamStation = getTeamStation(stations, station.id)
            const visited = !!teamStation
            const solved = teamStation?.solved ?? false

            // Color del marcador: principals vs secundaris,
            // i pendents vs visitats (desaturat un cop ja no cal atenció).
            const isPrincipal = FITES_PRINCIPALS.has(station.id)
            const isCampanar = station.id.includes('campanar') || station.id.includes('sometent')
            const markerColor = solved
              ? isPrincipal
                ? '#7D8694' // principal visitat: gris mitjà desaturat
                : '#B0B7C3' // secundari visitat: gris molt clar
              : isCampanar
                ? '#B45309' // campanar desbloquejat pendent: ambre daurat intens
                : isPrincipal
                  ? '#1E3A5F' // principal pendent: blau marí intens
                  : '#93C5FD' // secundari pendent: blau cel suau

            const hasElementImage = !!station.elementImage
            const markerRadius = hasElementImage ? 17 : 14
            const imgSize = 25
            const fontSize = 24

            return (
              <g
                key={station.id}
                onClick={() => setSelectedStationId(station.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Marker circle background */}
                <circle
                  cx={x}
                  cy={y}
                  r={markerRadius}
                  fill={markerColor}
                  stroke={isPrincipal ? '#C99E32' : '#FFFFFF'}
                  strokeWidth={isPrincipal ? 2.5 : 1.5}
                  style={{
                    pointerEvents: 'all',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                  }}
                />

                {/* Marker icon or element image */}
                {hasElementImage ? (
                  <g pointerEvents="none">
                    <image
                      href={station.elementImage}
                      x={x - imgSize / 2}
                      y={y - imgSize / 2}
                      width={imgSize}
                      height={imgSize}
                      preserveAspectRatio="xMidYMid meet"
                      style={{
                        opacity: solved ? 0.75 : 1,
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                      }}
                    />
                    {solved && (
                      <g transform={`translate(${x + 11}, ${y - 11})`}>
                        <circle cx="0" cy="0" r="7" fill="#16A085" stroke="white" strokeWidth="1.5" />
                        <text
                          x="0"
                          y="0.5"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="9"
                          fontWeight="bold"
                          fill="white"
                        >
                          ✓
                        </text>
                      </g>
                    )}
                  </g>
                ) : (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={fontSize}
                    fill="white"
                    style={{
                      pointerEvents: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    {solved ? '✓' : station.icon}
                  </text>
                )}
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

      {/* Estacions del joc a sota */}
      <div className="px-6 pt-4 pb-24 border-t border-leather/30 bg-[#FAF5E9] dark:bg-[#1A140F] flex-shrink-0">
        <div className="w-full max-w-4xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-leather dark:text-[#C2A68E] mb-2.5 font-sans">📍 Estacions del joc:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-sm">
              {allStations.map((station) => (
                <div
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/80 dark:bg-[#261E17] hover:bg-white dark:hover:bg-[#33281F] border border-[#8C6D53]/20 dark:border-[#8C6D53]/40 shadow-xs cursor-pointer transition"
                >
                  {station.elementImage ? (
                    <img src={station.elementImage} alt={station.catalan} className="w-5 h-5 object-contain flex-shrink-0 drop-shadow-xs" />
                  ) : (
                    <span className="text-lg flex-shrink-0">{station.icon}</span>
                  )}
                  <span className="text-ink dark:text-[#F3EBD8] font-bold truncate text-xs sm:text-sm min-w-0 flex-1">{station.catalan}</span>
                </div>
              ))}
            </div>
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
