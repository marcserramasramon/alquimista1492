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
  elementImage?: string
  difficulty: 'facil' | 'mig' | 'dificil'
  image?: string
}

export const STATIONS: Record<string, Station> = {
  'serrat-bruixes': {
    id: 'serrat-bruixes',
    order: 1,
    name: 'Serrat de les Bruixes',
    catalan: 'Serrat de les Bruixes',
    description: 'Antic turó amb pedres de senyals per a vigies de foc',
    narrativeHook: 'Desxifra els missatges de foc entre pobles',
    latitude: 41.910887,
    longitude: 2.224452,
    icon: '🔥',
    elementImage: '/images/elements/foc.webp',
    difficulty: 'facil',
    image: '/images/scenes/serrat-bruixes.webp',
  },
  'font-ferro': {
    id: 'font-ferro',
    order: 2,
    name: 'Font del Ferro',
    catalan: 'Font del Ferro',
    description: 'Font rica en ferro utilitzada per preparar tinta',
    narrativeHook: 'Analitza la recepta de la tinta i esbrina qui va recollir aigua',
    latitude: 41.915501,
    longitude: 2.227690,
    icon: '💧',
    elementImage: '/images/elements/aigua.webp',
    difficulty: 'mig',
    image: '/images/scenes/font-ferro.webp',
  },
  'planes-bones': {
    id: 'planes-bones',
    order: 3,
    name: 'Planes Bones',
    catalan: 'Planes Bones',
    description: 'Vall on es tracen les rutes de la patrulla nocturna',
    narrativeHook: 'Reconstrueix la ruta de la patrulla i comprova les coartades',
    latitude: 41.913588,
    longitude: 2.232733,
    icon: '🗺️',
    elementImage: '/images/elements/terra.webp',
    difficulty: 'mig',
    image: '/images/scenes/planes-bones.webp',
  },
  'cementiri': {
    id: 'cementiri',
    order: 4,
    name: 'Cementiri de la Guixa',
    catalan: 'Cementiri de la Guixa',
    description: 'Cementiri on apareixen noms del registre',
    narrativeHook: 'Troba el nom copiat del registre de defuncions',
    latitude: 41.912515,
    longitude: 2.227446,
    icon: '🪦',
    elementImage: '/images/elements/aire.webp',
    difficulty: 'dificil',
    image: '/images/scenes/cementiri.webp',
  },
  'rectoria': {
    id: 'rectoria',
    order: 5,
    name: 'Rectoria de la Guixa',
    catalan: 'Rectoria de la Guixa',
    description: 'Residència del rector, escenari dels fets violents',
    narrativeHook: 'Descobreix què li ha passat al rector',
    latitude: 41.913109,
    longitude: 2.228130,
    icon: '⛪',
    difficulty: 'mig',
    image: '/images/scenes/rectoria.webp',
  },
  'pla-masset': {
    id: 'pla-masset',
    order: 6,
    name: 'Pla de Masset',
    catalan: 'Pla de Masset',
    description: 'Punt de trobada amb l\'Emissari',
    narrativeHook: 'Supera l\'interrogatori i demostra la teva coartada',
    latitude: 41.913090,
    longitude: 2.229841,
    icon: '🦹‍♂️',
    difficulty: 'facil',
    image: '/images/scenes/acusacio.webp',
  },
  'escola': {
    id: 'escola',
    order: 7,
    name: 'Escola de la Guixa',
    catalan: 'Escola de la Guixa',
    description: 'Escola on ensenya en Bernat',
    narrativeHook: 'Investiga la cambra privada del mestre',
    latitude: 41.913543,
    longitude: 2.229260,
    icon: '📚',
    difficulty: 'dificil',
  },
  'caixa-almoines': {
    id: 'caixa-almoines',
    order: 8,
    name: 'Caixa de les Almoines',
    catalan: 'Caixa de les Almoines',
    description: 'Caixa de les almoines amagada al porxo de la rectoria',
    narrativeHook: 'Troba i obre la caixa de les almoines tancada',
    latitude: 41.913109,
    longitude: 2.228130,
    icon: '🪎',
    difficulty: 'dificil',
    image: '/images/scenes/caixa-almoines.webp',
  },
  'sometent-campanar': {
    id: 'sometent-campanar',
    order: 9,
    name: 'Campanar de Sant Sebastià',
    catalan: 'Campanar de Sant Sebastià',
    description: 'Campanar des d\'on el toc de sometent avisa els conjurats',
    narrativeHook: 'Toca la campana per senyalar la ruta de fugida',
    latitude: 41.913500,
    longitude: 2.228500,
    icon: '🔔',
    difficulty: 'dificil',
    image: '/images/scenes/sometent.webp',
  },
} as const

const STATION_ALIASES: Record<string, string> = {
  'serrat': 'serrat-bruixes',
  'serrat_bruixes': 'serrat-bruixes',
  'font_ferro': 'font-ferro',
  'planes_bones': 'planes-bones',
  'pla_masset': 'pla-masset',
  'pla-masset-control': 'pla-masset',
  'pla-masset-accusation': 'pla-masset',
  'caixa_almoines': 'caixa-almoines',
  'rectoria-caixa': 'caixa-almoines',
  'campanar': 'sometent-campanar',
  'bells-sometent': 'sometent-campanar',
  'bells_sometent': 'sometent-campanar',
}

/**
 * Get station by ID (supports canonical IDs and aliases)
 */
export function getStation(id: string): Station | undefined {
  const normalizedId = id.trim().toLowerCase()
  const canonicalId = STATION_ALIASES[normalizedId] || normalizedId
  return STATIONS[canonicalId as keyof typeof STATIONS]
}

/**
 * Get all stations ordered by visit sequence (exact 9 stations)
 */
export function getAllStations(): Station[] {
  return Object.values(STATIONS).sort((a, b) => a.order - b.order)
}

