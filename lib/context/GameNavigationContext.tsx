'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

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

const STORAGE_KEY = 'scaperoom_active_game'

const GameNavigationContext = createContext<GameNavigationContextType | undefined>(undefined)

export function GameNavigationProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (stored) {
          return JSON.parse(stored)
        }
      } catch {
        // ignore parse/storage errors
      }
    }
    return {
      activeToken: null,
      stationId: null,
    }
  })

  // Synchronize on mount if needed
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.activeToken) {
          setGameState(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const setActiveGame = useCallback((token: string, stationId: string) => {
    const newState = { activeToken: token, stationId }
    setGameState(newState)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch {
      // ignore storage errors
    }
  }, [])

  const clearActiveGame = useCallback(() => {
    setGameState({ activeToken: null, stationId: null })
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
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

