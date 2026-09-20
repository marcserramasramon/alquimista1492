'use client'

import { PlayerTimer } from './PlayerTimer'
import { NightModeToggle } from '@/components/ui/NightModeToggle'
import type { GameStatus } from '@/lib/realtime/useGameClock'

interface PlayerStatusBarProps {
  gameStatus: GameStatus
  expiresAt?: string | null
  showCounters: boolean
  stationsSolved?: number
  stationsTotal?: number
  evidencesCount?: number
  salconduitsRemaining?: number
}

/**
 * Barra superior fixa amb el rellotge, els comptadors de fites/proves/salvos
 * i el commutador de mode clar/fosc. Compartida pel hub i per les pantalles
 * de joc d'estació perquè l'equip vegi sempre el mateix estat.
 */
export function PlayerStatusBar({
  gameStatus,
  expiresAt,
  showCounters,
  stationsSolved = 0,
  stationsTotal = 0,
  evidencesCount = 0,
  salconduitsRemaining = 2,
}: PlayerStatusBarProps) {
  return (
    <header className="bg-parchment border-b-2 border-[#8C6D53] shadow-sm sticky top-0 z-40 flex-shrink-0">
      {/* Espai per a la barra d'estat del sistema quan la webapp es mostra a pantalla completa */}
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div className="max-w-4xl mx-auto px-3 py-0.5 flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-nowrap justify-center items-center gap-1.5 sm:gap-4 text-[10px] sm:text-sm font-sans font-bold text-[#2B2118] overflow-x-auto">
          <PlayerTimer status={gameStatus} expiresAt={expiresAt} />

          {showCounters && (
            <>
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>
                  {stationsSolved}/{stationsTotal} Fites
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>📋</span>
                <span>{evidencesCount} Proves</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🎫</span>
                <span>{salconduitsRemaining} Salvos</span>
              </div>
            </>
          )}
        </div>

        <NightModeToggle compact />
      </div>
    </header>
  )
}
