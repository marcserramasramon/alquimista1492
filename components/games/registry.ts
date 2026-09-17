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
import { BellsGame } from './BellsGame'
import { MoralChoiceGame } from './MoralChoiceGame'

export interface GameRegistry {
  [stationId: string]: React.ComponentType<any>
}

/**
 * All registered games by station ID
 */
export const GAMES: GameRegistry = {
  'serrat-bruixes': SerratBruixesGame,
  'serrat': SerratBruixesGame,
  'font-ferro': FontFerroGame,
  'font_ferro': FontFerroGame,
  'planes-bones': PlaneBonesGame,
  'planes_bones': PlaneBonesGame,
  'cementiri': CementiriGame,
  'pla-masset-control': ControlGame,
  'pla-masset': ControlGame,
  'pla_masset': ControlGame,
  'pla-masset-accusation': AccusationGame,
  'acusacio': AccusationGame,
  'caixa-almoines': BoxGame,
  'rectoria-caixa': BoxGame,
  'caixa_almoines': BoxGame,
  'rectoria': BoxGame,
  'sometent-campanar': BellsGame,
  'bells-sometent': BellsGame,
  'campanar': BellsGame,
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
