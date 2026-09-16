/**
 * Games Module
 * Exports all game components and utilities
 */

export { SerratBruixesGame } from './SerratBruixesGame'
export { FontFerroGame } from './FontFerroGame'
export { PlaneBonesGame } from './PlaneBonesGame'
export { CementiriGame } from './CementiriGame'

export {
  GAMES,
  getGameComponent,
  hasGame,
  getRegisteredStations,
  type GameRegistry,
} from './registry'
