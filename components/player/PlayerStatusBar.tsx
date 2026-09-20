'use client'

import { PlayerTimer } from './PlayerTimer'
import { NightModeToggle } from '@/components/ui/NightModeToggle'
import type { GameStatus } from '@/lib/realtime/useGameClock'

interface PlayerStatusBarProps {
  gameStatus: GameStatus
  expiresAt?: string | null
}

/**
 * Barra superior fixa amb el rellotge i el commutador de mode clar/fosc.
 * Compartida pel hub i per les pantalles de joc d'estació perquè l'equip
 * vegi sempre el mateix estat.
 */
export function PlayerStatusBar({ gameStatus, expiresAt }: PlayerStatusBarProps) {
  return (
    <header className="bg-parchment border-b-2 border-[#8C6D53] shadow-sm sticky top-0 z-40 flex-shrink-0">
      {/* Espai per a la barra d'estat del sistema quan la webapp es mostra a pantalla completa */}
      <div style={{ height: 'env(safe-area-inset-top)' }} />
      <div className="max-w-4xl mx-auto px-3 py-0.5 flex items-center justify-between gap-2">
        <PlayerTimer status={gameStatus} expiresAt={expiresAt} />

        <NightModeToggle compact />
      </div>
    </header>
  )
}
