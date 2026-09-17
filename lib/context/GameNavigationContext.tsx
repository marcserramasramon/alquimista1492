'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface GameState {
  activeToken: string | null
  stationId: string | null
}

interface GameNavigationContextType {
  gameState: GameState
  setActiveGame: (token: string, stationId: string) => void
  clearActiveGame: () => void
  isGameActive: boolean
}

const GameNavigationContext = createContext<GameNavigationContextType | undefined>(undefined)

export function GameNavigationProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>({
    activeToken: null,
    stationId: null,
  })

  const setActiveGame = useCallback((token: string, stationId: string) => {
    setGameState({ activeToken: token, stationId })
  }, [])

  const clearActiveGame = useCallback(() => {
    setGameState({ activeToken: null, stationId: null })
  }, [])

  const isGameActive = gameState.activeToken !== null

  return (
    <GameNavigationContext.Provider
      value={{
        gameState,
        setActiveGame,
        clearActiveGame,
        isGameActive,
      }}
    >
      {children}
    </GameNavigationContext.Provider>
  )
}

export function useGameNavigation() {
  const context = useContext(GameNavigationContext)
  if (!context) {
    throw new Error('useGameNavigation must be used within GameNavigationProvider')
  }
  return context
}
