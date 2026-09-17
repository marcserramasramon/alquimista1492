import type { PropsWithChildren } from 'react'
import { GameNavigationProvider } from '@/lib/context/GameNavigationContext'

export default function PlayerLayout({ children }: PropsWithChildren) {
  return (
    <GameNavigationProvider>
      {children}
    </GameNavigationProvider>
  )
}
