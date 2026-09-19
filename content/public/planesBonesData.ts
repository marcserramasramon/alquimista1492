/**
 * Planes Bones - La Ruta del Ferrer i la Clau Perduda
 * Dades de l'estació 3: testimonis, xarxa cartogràfica de 24 hexàgons i validació
 */

export interface HexNodeData {
  id: string
  numericId: number
  cx: number
  cy: number
  name: string
  subtitle: string
  icon: string
  type: 'inici' | 'cami' | 'masia' | 'aigua' | 'fita' | 'desti' | 'camp' | 'bosc' | 'perill'
  isPathNode: boolean
  pathOrder?: number
  description?: string
}

export interface WitnessClue {
  id: number
  title: string
  witness: string
  location: string
  text: string
  icon: string
  pathHighlight: string[]
}

// Seqüència exacta dels 9 nodes del camí d'Isidre
export const CORRECT_PATH_SEQUENCE: string[] = [
  'malla',
  'cruilla-vic',
  'masia-el-blanc',
  'pas-riera',
  'masia-planes-bones',
  'cami-nogueres',
  'can-vinyals',
  'pou-aigua',
  'la-guixa',
]

// Els 4 interrogatoris exclusius per als jugadors de l'equip
export const WITNESS_CLUES: WitnessClue[] = [
  {
    id: 1,
    title: 'Testimoni 1: Sortida de Malla',
    witness: 'Pagès dels conreus de Malla',
    location: 'Sortida del terme de Malla',
    text: '«Vaig veure sortir el ferrer Isidre de Malla al capvespre amb una càrrega d’eines i la clau de la forja penjada al cinyell. Va deixar a mà dreta el trencall que mena a Vic i va enfilar directe cap a la Masia El Blanc per comprovar la càrrega abans d’arribar a l’aigua.»',
    icon: '🌾',
    pathHighlight: ['malla', 'cruilla-vic', 'masia-el-blanc'],
  },
  {
    id: 2,
    title: 'Testimoni 2: El Gual de la Riera',
    witness: 'Masovera del camí ral',
    location: 'Riera i Masia de Planes Bones',
    text: '«Després de passar per El Blanc, el ferrer va travessar la riera saltant amb compte per les pedres seques del gual. Tot seguit va passar a pas viu per davant de la Masia de Planes Bones abans que fos fosc del tot.»',
    icon: '🌊',
    pathHighlight: ['pas-riera', 'masia-planes-bones'],
  },
  {
    id: 3,
    title: 'Testimoni 3: El Camí de les Nogueres i Can Vinyals',
    witness: 'Traginer de Can Vinyals',
    location: 'Entrecreuament de Can Vinyals',
    text: '«Va agafar el camí on les nogueres fan una ombra espessa fins a arribar a l’entrecreuament cap a Can Vinyals. Allà el vaig veure recolzar el sac a la gran pedra fita del camí per recuperar l’alè, i es va sentir un cop sec de ferro contra la roca!»',
    icon: '🌳',
    pathHighlight: ['cami-nogueres', 'can-vinyals'],
  },
  {
    id: 4,
    title: 'Testimoni 4: El Pou i l’Arribada a La Guixa',
    witness: 'Veïna del pou de la vila',
    location: 'Pou d’Aigua i entrada de La Guixa',
    text: '«Va arribar esbufegant al pou d’aigua per beure abans d’entrar a la Guixa. Es tocava el cinturó desesperat: deia que entre el camí de les nogueres i el pou havia perdut la clau mestra de la seva forja i no podria obrir el taller!»',
    icon: '🪣',
    pathHighlight: ['pou-aigua', 'la-guixa'],
  },
]

// Graella cartogràfica ampliada de 24 caselles (6 columnes x 4 files en rusc)
export const HEX_MAP_NODES: Record<string, HexNodeData> = {
  // --- FILA 1 (cy: 48) ---
  'malla': {
    id: 'malla',
    numericId: 1,
    cx: 44,
    cy: 48,
    name: 'Malla',
    subtitle: 'Sortida 19:30',
    icon: '🏘️',
    type: 'inici',
    isPathNode: true,
    pathOrder: 1,
    description: 'Punt de sortida d’Isidre amb eines de ferro i la clau al cinyell.',
  },
  'cruilla-vic': {
    id: 'cruilla-vic',
    numericId: 2,
    cx: 118,
    cy: 48,
    name: 'Trencall Vic',
    subtitle: 'Cruïlla a mà dreta',
    icon: '🛤️',
    type: 'cami',
    isPathNode: true,
    pathOrder: 2,
    description: 'Bifurcació cap a Vic. Isidre va ignorar el camí principal.',
  },
  'cami-ral': {
    id: 'cami-ral',
    numericId: 3,
    cx: 192,
    cy: 48,
    name: 'Camí Ral',
    subtitle: 'Camí ample a Vic',
    icon: '🐎',
    type: 'cami',
    isPathNode: false,
    description: 'Pista transitada per carruatges cap a la ciutat de Vic.',
  },
  'camps-blat': {
    id: 'camps-blat',
    numericId: 4,
    cx: 266,
    cy: 48,
    name: 'Camps de Blat',
    subtitle: 'Plana de Malla',
    icon: '🌾',
    type: 'camp',
    isPathNode: false,
    description: 'Camps oberts de blat sense camí transitable de nit.',
  },
  'prat-pastura': {
    id: 'prat-pastura',
    numericId: 5,
    cx: 340,
    cy: 48,
    name: 'Prat Pastura',
    subtitle: 'Ramat comunal',
    icon: '🐑',
    type: 'camp',
    isPathNode: false,
    description: 'Pastures d’ovelles tancades amb tanques de fusta.',
  },
  'cami-taradell': {
    id: 'cami-taradell',
    numericId: 6,
    cx: 414,
    cy: 48,
    name: 'Camí Taradell',
    subtitle: 'Pista de llevant',
    icon: '🚶',
    type: 'cami',
    isPathNode: false,
    description: 'Camí de ferradura cap a les masies de Taradell.',
  },

  // --- FILA 2 (cy: 112, desplaçada +37px) ---
  'feixes-regadiu': {
    id: 'feixes-regadiu',
    numericId: 7,
    cx: 81,
    cy: 112,
    name: 'Feixes Torrent',
    subtitle: 'Horts de reg',
    icon: '🥬',
    type: 'camp',
    isPathNode: false,
    description: 'Horts amb séquies estretes i fang.',
  },
  'masia-el-blanc': {
    id: 'masia-el-blanc',
    numericId: 8,
    cx: 155,
    cy: 112,
    name: 'Masia El Blanc',
    subtitle: 'Aturada i càrrega',
    icon: '🏡',
    type: 'masia',
    isPathNode: true,
    pathOrder: 3,
    description: 'Masia pairal on el ferrer va comprovar el sac de claus.',
  },
  'pas-riera': {
    id: 'pas-riera',
    numericId: 9,
    cx: 229,
    cy: 112,
    name: 'Pas de la Riera',
    subtitle: 'Gual de pedres',
    icon: '🌊',
    type: 'aigua',
    isPathNode: true,
    pathOrder: 4,
    description: 'Gual pedregós per travessar el curs d’aigua sense mullar-se.',
  },
  'gual-profund': {
    id: 'gual-profund',
    numericId: 10,
    cx: 303,
    cy: 112,
    name: 'Gual Fondo',
    subtitle: 'Intransitable',
    icon: '⛔',
    type: 'perill',
    isPathNode: false,
    description: 'Tram fondo de la riera amb gorgs perillosos a la foscor.',
  },
  'bosc-roures': {
    id: 'bosc-roures',
    numericId: 11,
    cx: 377,
    cy: 112,
    name: 'Bosc de Roures',
    subtitle: 'Obaga fosca',
    icon: '🌲',
    type: 'bosc',
    isPathNode: false,
    description: 'Roureda espessa sense camí marcat.',
  },
  'forn-calc': {
    id: 'forn-calc',
    numericId: 12,
    cx: 451,
    cy: 112,
    name: 'Forn de Calç',
    subtitle: 'Ruïnes velles',
    icon: '🧱',
    type: 'camp',
    isPathNode: false,
    description: 'Antic forn de calç abandonat.',
  },

  // --- FILA 3 (cy: 176) ---
  'oliverar-vell': {
    id: 'oliverar-vell',
    numericId: 13,
    cx: 44,
    cy: 176,
    name: 'Oliverar Vell',
    subtitle: 'Bancals alts',
    icon: '🫒',
    type: 'camp',
    isPathNode: false,
    description: 'Oliveres centenàries sobre feixes de pedra seca.',
  },
  'masia-planes-bones': {
    id: 'masia-planes-bones',
    numericId: 14,
    cx: 118,
    cy: 176,
    name: 'Planes Bones',
    subtitle: 'Masia central',
    icon: '🚜',
    type: 'masia',
    isPathNode: true,
    pathOrder: 5,
    description: 'Masia històrica de Planes Bones. Va passar-hi a pas ràpid.',
  },
  'cami-nogueres': {
    id: 'cami-nogueres',
    numericId: 15,
    cx: 192,
    cy: 176,
    name: 'Camí Nogueres',
    subtitle: 'Ombra d’arbres',
    icon: '🌳',
    type: 'cami',
    isPathNode: true,
    pathOrder: 6,
    description: 'Tram de camí flanquejat per grans nogueres que donen ombra.',
  },
  'can-vinyals': {
    id: 'can-vinyals',
    numericId: 16,
    cx: 266,
    cy: 176,
    name: 'Pedra Can Vinyals',
    subtitle: 'Pedra Gran i Nogueres',
    icon: '🪨',
    type: 'fita',
    isPathNode: true,
    pathOrder: 7,
    description: 'Entrecreuament cap a Can Vinyals. Gran pedra fita vora les nogueres on va caure la clau!',
  },
  'vinyes-vinyals': {
    id: 'vinyes-vinyals',
    numericId: 17,
    cx: 340,
    cy: 176,
    name: 'Les Vinyes',
    subtitle: 'Ceps de Can Vinyals',
    icon: '🍇',
    type: 'camp',
    isPathNode: false,
    description: 'Feixes de vinya costerudes protegides per marges.',
  },
  'corriol-bosc': {
    id: 'corriol-bosc',
    numericId: 18,
    cx: 414,
    cy: 176,
    name: 'El Falguerar',
    subtitle: 'Corriol estret',
    icon: '🌿',
    type: 'cami',
    isPathNode: false,
    description: 'Trencall estret ple d’esbarzers que no duu enlloc.',
  },

  // --- FILA 4 (cy: 240, desplaçada +37px) ---
  'erm-pedregos': {
    id: 'erm-pedregos',
    numericId: 19,
    cx: 81,
    cy: 240,
    name: 'Erm Pedregós',
    subtitle: 'Penyasegat baix',
    icon: '⛰️',
    type: 'perill',
    isPathNode: false,
    description: 'Terreny erm ple de còdols solts.',
  },
  'paller-marge': {
    id: 'paller-marge',
    numericId: 20,
    cx: 155,
    cy: 240,
    name: 'Paller Marge',
    subtitle: 'Cobert aïllat',
    icon: '🛖',
    type: 'camp',
    isPathNode: false,
    description: 'Paller solitari vora el camí.',
  },
  'pou-aigua': {
    id: 'pou-aigua',
    numericId: 21,
    cx: 229,
    cy: 240,
    name: 'Pou d’Aigua',
    subtitle: 'Descobriment pèrdua',
    icon: '🪣',
    type: 'aigua',
    isPathNode: true,
    pathOrder: 8,
    description: 'Pou comunal abans d’entrar a la vila. Aquí Isidre s’adona que no té la clau.',
  },
  'la-guixa': {
    id: 'la-guixa',
    numericId: 22,
    cx: 303,
    cy: 240,
    name: 'La Guixa',
    subtitle: 'Forja del poble',
    icon: '⛪',
    type: 'desti',
    isPathNode: true,
    pathOrder: 9,
    description: 'Arribada a la vila de Santa Eulàlia de Riuprimer / La Guixa.',
  },
  'pista-feixes': {
    id: 'pista-feixes',
    numericId: 23,
    cx: 377,
    cy: 240,
    name: 'Pista Feixes',
    subtitle: 'Camí d’horta',
    icon: '🛤️',
    type: 'cami',
    isPathNode: false,
    description: 'Pista secundària que s’allunya del poble cap al sud.',
  },
  'bosc-espes': {
    id: 'bosc-espes',
    numericId: 24,
    cx: 451,
    cy: 240,
    name: 'Bosc Vedat',
    subtitle: 'Accés prohibit',
    icon: '🌲',
    type: 'bosc',
    isPathNode: false,
    description: 'Vedat senyorial prohibit durant la nit.',
  },
}

/**
 * Valida si un text o codi correspon a la clau de la forja
 */
export function isValidClauKey(input: string): boolean {
  if (!input) return false
  const clean = input
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .trim()

  const validOptions = [
    'CLAUFORJA',
    'CLAU',
    'FORJA',
    'PEDRAVINYALS',
    'CANVINYALS',
    'NOGUERA',
    'NOGUERES',
  ]

  return validOptions.some((opt) => clean.includes(opt)) || clean === '3'
}
