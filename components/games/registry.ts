/**
 * Games Registry
 * Central registry of all game components
 * Maps station IDs to their corresponding game components
 */

import { SerratBruixesGame } from './SerratBruixesGame'
import { FontFerroGame } from './FontFerroGame'
import { PlaneBonesGame } from './PlaneBonesGame'
import { CementiriGame } from './CementiriGame'
import { ControlGame } from './ControlGame'
import { AccusationGame } from './AccusationGame'
import { BoxGame } from './BoxGame'
import { BellGame } from './BellGame'
import { MoralChoiceGame } from './MoralChoiceGame'

export interface GameRegistry {
  [stationId: string]: React.ComponentType<any>
}

/**
 * All registered games by station ID
 */
export const GAMES: GameRegistry = {
  'serrat-bruixes': SerratBruixesGame,
  'font-ferro': FontFerroGame,
  'planes-bones': PlaneBonesGame,
  'cementiri': CementiriGame,
  'pla-masset-control': ControlGame,
  'pla-masset-accusation': AccusationGame,
  'caixa-almoines': BoxGame,
  'sometent-campanar': BellGame,
  'decisio-moral': MoralChoiceGame,
}

/**
 * Get a game component by station ID
 */
export function getGameComponent(stationId: string) {
  return GAMES[stationId]
}

/**
 * Check if a station has a registered game
 */
export function hasGame(stationId: string): boolean {
  return stationId in GAMES
}

/**
 * Get all registered station IDs
 */
export function getRegisteredStations(): string[] {
  return Object.keys(GAMES)
}
