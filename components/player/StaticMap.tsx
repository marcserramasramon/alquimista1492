'use client'

import { useState } from 'react'
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

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length !== 2) return // Two fingers only

    let startDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    let startPanX = panX
    let startPanY = panY
    let startCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2
    let startCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 2) return

      const deltaX = moveEvent.touches[0].clientX - startCenterX
      const deltaY = moveEvent.touches[0].clientY - startCenterY

      setPanX(startPanX + deltaX)
      setPanY(startPanY + deltaY)
    }

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
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
      <div className="px-4 sm:px-6 pt-6 pb-2 flex-shrink-0">
        <div className="w-full max-w-4xl mx-auto">
          <header className="border-b-2 border-leather pb-3 mb-2 text-center">
            <span className="text-xs uppercase tracking-widest text-leather font-sans font-bold">
              Plànol de la Vila
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-serif mt-1 uppercase">
              MAPA
            </h1>
            <p className="text-xs text-leather font-sans mt-1">
              Clica una estació per veure més opcions • Scroll per zoom • Arrossega per moure
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

            {/* Fites dels 4 Elements */}
            <div className="mt-2.5 pt-2 border-t border-leather/20 flex flex-wrap items-center gap-2.5 text-xs font-sans text-[#5C4533] dark:text-[#C2A68E]">
              <span className="font-bold text-leather dark:text-[#E5A93C] uppercase text-[11px] tracking-wider">Fites Elementals:</span>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#261E17] px-2 py-0.5 rounded-md border border-[#8C6D53]/25 shadow-2xs">
                <img src="/images/elements/foc.webp" alt="Foc" className="w-4 h-4 object-contain" />
                <span className="font-medium text-ink dark:text-[#F3EBD8]">Serrat (Foc)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#261E17] px-2 py-0.5 rounded-md border border-[#8C6D53]/25 shadow-2xs">
                <img src="/images/elements/aigua.webp" alt="Aigua" className="w-4 h-4 object-contain" />
                <span className="font-medium text-ink dark:text-[#F3EBD8]">Font (Aigua)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#261E17] px-2 py-0.5 rounded-md border border-[#8C6D53]/25 shadow-2xs">
                <img src="/images/elements/terra.webp" alt="Terra" className="w-4 h-4 object-contain" />
                <span className="font-medium text-ink dark:text-[#F3EBD8]">Planes (Terra)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#261E17] px-2 py-0.5 rounded-md border border-[#8C6D53]/25 shadow-2xs">
                <img src="/images/elements/aire.webp" alt="Aire" className="w-4 h-4 object-contain" />
                <span className="font-medium text-ink dark:text-[#F3EBD8]">Cementiri (Aire)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-[#EAE0CA]/40 min-h-[440px]">
        <svg
          ref={svgRef as any}
          width={svgWidth}
          height={svgHeight}
          className="border-2 border-leather/50 rounded-xl shadow-lg cursor-grab active:cursor-grabbing touch-none"
          style={{
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
            transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
            transformOrigin: 'center',
            transition: zoom === 1 && panX === 0 && panY === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
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
                style={{
                  cursor: 'pointer',
                  transform: `scale(${1 / zoom})`,
                  transformOrigin: `${x}px ${y}px`,
                }}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {allStations.map((station) => (
                <div
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-white/80 dark:bg-[#261E17] hover:bg-white dark:hover:bg-[#33281F] border border-[#8C6D53]/20 dark:border-[#8C6D53]/40 shadow-xs cursor-pointer transition"
                >
                  {station.elementImage ? (
                    <img src={station.elementImage} alt={station.catalan} className="w-7 h-7 object-contain flex-shrink-0 drop-shadow-xs" />
                  ) : (
                    <span className="text-2xl flex-shrink-0">{station.icon}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-ink dark:text-[#F3EBD8] font-bold block truncate text-xs sm:text-sm">{station.catalan}</span>
                    {station.elementImage && (
                      <span className="text-[10px] text-leather dark:text-[#E5A93C] font-sans uppercase font-semibold">
                        {station.id.includes('serrat') ? 'Element Foc' :
                         station.id.includes('font') ? 'Element Aigua' :
                         station.id.includes('plane') ? 'Element Terra' :
                         station.id.includes('cementiri') ? 'Element Aire' : 'Fita'}
                      </span>
                    )}
                  </div>
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
