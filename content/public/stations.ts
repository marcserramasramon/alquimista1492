/**
 * Station Definitions - Public Content
 *
 * All station metadata accessible to players.
 * Coordinates, names, narratives (client-safe).
 */

export interface Station {
  id: string
  order: number
  name: string
  catalan: string
  description: string
  narrativeHook: string
  latitude: number
  longitude: number
  icon: string
  difficulty: 'facil' | 'mig' | 'dificil'
}

export const STATIONS: Record<string, Station> = {
  serrat: {
    id: 'serrat',
    order: 1,
    name: 'Serrat de les Bruixes',
    catalan: 'Serrat de les Bruixes',
    description: 'Ancient hilltop with firewatch signal stones',
    narrativeHook: 'Decode the firelight messages between villages',
    latitude: 41.910887,
    longitude: 2.224452,
    icon: '🔥',
    difficulty: 'facil',
  },
  font_ferro: {
    id: 'font_ferro',
    order: 2,
    name: 'Font del Ferro',
    catalan: 'Font del Ferro',
    description: 'Iron-rich spring used for ink preparation',
    narrativeHook: 'Analyze the ink recipe and trace who collected water',
    latitude: 41.915501,
    longitude: 2.227690,
    icon: '💧',
    difficulty: 'mig',
  },
  planes_bones: {
    id: 'planes_bones',
    order: 3,
    name: 'Planes Bones',
    catalan: 'Planes Bones',
    description: 'Valley where night patrol routes are mapped',
    narrativeHook: 'Reconstruct the patrol route and check alibis',
    latitude: 41.913588,
    longitude: 2.232733,
    icon: '🗺️',
    difficulty: 'mig',
  },
  cementiri: {
    id: 'cementiri',
    order: 4,
    name: 'Cementiri de la Guixa',
    catalan: 'Cementiri de la Guixa',
    description: 'Graveyard where registry names appear',
    narrativeHook: 'Find the name copied from the death registry',
    latitude: 41.912515,
    longitude: 2.227446,
    icon: '⚰️',
    difficulty: 'dificil',
  },
  rectoria: {
    id: 'rectoria',
    order: 5,
    name: 'Rectoria de la Guixa',
    catalan: 'Rectoria de la Guixa',
    description: 'The rector\'s residence, scene of violence',
    narrativeHook: 'Discover what happened to the rector',
    latitude: 41.913109,
    longitude: 2.228130,
    icon: '⛪',
    difficulty: 'mig',
  },
  pla_masset: {
    id: 'pla_masset',
    order: 6,
    name: 'Pla de Masset',
    catalan: 'Pla de Masset',
    description: 'Meeting point with the Emissary',
    narrativeHook: 'Stand interrogation and prove your alibi',
    latitude: 41.913090,
    longitude: 2.229841,
    icon: '👤',
    difficulty: 'facil',
  },
  escola: {
    id: 'escola',
    order: 7,
    name: 'Escola de la Guixa',
    catalan: 'Escola de la Guixa',
    description: 'Schoolhouse where Bernat teaches',
    narrativeHook: 'Investigate the master\'s private room',
    latitude: 41.913543,
    longitude: 2.229260,
    icon: '📚',
    difficulty: 'dificil',
  },
  caixa_almoines: {
    id: 'caixa_almoines',
    order: 8,
    name: 'Caixa de les Almoines',
    catalan: 'Caixa de les Almoines',
    description: 'Alms box hidden in the rectory porch',
    narrativeHook: 'Find and open the locked alms box',
    latitude: 41.913109,
    longitude: 2.228130,
    icon: '🔐',
    difficulty: 'dificil',
  },
  campanar: {
    id: 'campanar',
    order: 9,
    name: 'Campanar de Sant Sebastià',
    catalan: 'Campanar de Sant Sebastià',
    description: 'Bell tower where the tocsin signals the conjurates',
    narrativeHook: 'Ring the bell to signal the escape route',
    latitude: 41.913500,
    longitude: 2.228500,
    icon: '🔔',
    difficulty: 'dificil',
  },
  'bells_sometent': {
    id: 'bells-sometent',
    order: 9,
    name: 'Campanar de Sant Sebastià',
    catalan: 'Campanar de Sant Sebastià',
    description: 'Bell tower where the tocsin signals the conjurates',
    narrativeHook: 'Ring the bell to signal the escape route',
    latitude: 41.913500,
    longitude: 2.228500,
    icon: '🔔',
    difficulty: 'dificil',
  },
} as const

/**
 * Get station by ID
 */
export function getStation(id: string): Station | undefined {
  return STATIONS[id as keyof typeof STATIONS]
}

/**
 * Get all stations ordered by visit sequence
 */
export function getAllStations(): Station[] {
  return Object.values(STATIONS).sort((a, b) => a.order - b.order)
}

/**
 * Get station name in Catalan
 */
export function getStationName(id: string): string {
  const station = getStation(id)
  return station?.catalan || id
}
