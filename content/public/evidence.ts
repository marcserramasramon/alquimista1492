/**
 * Evidence Definitions - Public Content
 *
 * Evidence pieces available to players.
 * No spoilers about which suspect they point to; narrative only.
 */

export interface Evidence {
  id: string
  name: string
  catalan: string
  description: string
  discoveredAt: string
  category: 'physical' | 'testimony' | 'observation' | 'document'
  icon: string
}

export const EVIDENCE_PUBLIC: Record<string, Evidence> = {
  seal: {
    id: 'seal',
    name: 'Feather and Key Seal',
    catalan: 'Segell ploma i clau',
    description: 'A seal mark found on official documents',
    discoveredAt: 'Cemetery records',
    category: 'physical',
    icon: '🔑',
  },
  light: {
    id: 'light',
    name: 'School Light on Night 15',
    catalan: 'Llum escola nit 15',
    description: 'Light observed in the school building after dark',
    discoveredAt: 'Planes Bones patrol observation',
    category: 'observation',
    icon: '💡',
  },
  cantirs: {
    id: 'cantirs',
    name: 'Two Pitchers from School',
    catalan: 'Dos càntirs escola dia 12',
    description: 'Two water pitchers taken from school supplies on May 12',
    discoveredAt: 'Font del Ferro water collection',
    category: 'physical',
    icon: '🏺',
  },
  literacy: {
    id: 'literacy',
    name: 'Knowledge of Letters',
    catalan: 'Sap de lletra',
    description: 'The traitor can read and write (revealed by firelight code)',
    discoveredAt: 'Serrat de les Bruixes signal analysis',
    category: 'observation',
    icon: '📖',
  },
  caligraphia: {
    id: 'caligraphia',
    name: 'Calligraphy Sheet with Names',
    catalan: 'Full cal·ligrafia + noms registre',
    description: 'Sheet found with carefully copied names from the death registry',
    discoveredAt: 'School investigation',
    category: 'document',
    icon: '✍️',
  },
  filigrana: {
    id: 'filigrana',
    name: 'Anchor Watermark',
    catalan: 'Filigrana àncora idèntica',
    description: 'Identical anchor watermark on paper used for letters',
    discoveredAt: 'Document analysis',
    category: 'physical',
    icon: '⚓',
  },
  ink: {
    id: 'ink',
    name: 'Iron-based Ink',
    catalan: 'Tinta de ferro',
    description: 'Gall ink prepared from iron-rich spring water',
    discoveredAt: 'Font del Ferro recipe analysis',
    category: 'physical',
    icon: '🖋️',
  },
  nota_capita: {
    id: 'nota_capita',
    name: 'Captain\'s Note',
    catalan: 'Nota del Capità',
    description: 'Message inside the alms box: "The names at dawn, and your son sleeps at home"',
    discoveredAt: 'Caixa de les Almoines',
    category: 'document',
    icon: '📜',
  },
  carta_falsa: {
    id: 'carta_falsa',
    name: 'False Letter',
    catalan: 'Carta falsa del rector',
    description: 'Forged letter with wrong names and location, prepared by the rector',
    discoveredAt: 'Caixa de les Almoines',
    category: 'document',
    icon: '✉️',
  },
  declaratio_anton: {
    id: 'declaratio_anton',
    name: 'Anton\'s Statement',
    catalan: 'Declaració d\'Anton',
    description: 'Signed testimony from the rector confirming Anton\'s alibi',
    discoveredAt: 'Pla de Masset confrontation',
    category: 'testimony',
    icon: '📋',
  },
  carta_lliurada: {
    id: 'carta_lliurada',
    name: 'Letter Delivered to Emissary',
    catalan: 'Carta lliurada a l\'Emissari',
    description: 'L\'Emissari ha acceptat la carta falsa i marxa enganyat cap a Vic. S\'ha obert la porta del Campanar!',
    discoveredAt: 'Pla de Masset',
    category: 'document',
    icon: '✉️',
  },
} as const

export const EVIDENCE_ALIASES: Record<string, string> = {
  'ev-foc-1': 'literacy',
  'fire_beacons': 'literacy',
  'foc': 'literacy',
  'ev-tinta-2': 'ink',
  'tinta': 'ink',
  'evidence_patrol_route': 'light',
  'evidence_tombstone': 'seal',
}

/**
 * Get canonical evidence ID resolving aliases
 */
export function getCanonicalEvidenceId(id: string): string {
  return EVIDENCE_ALIASES[id] || id
}

/**
 * Get evidence by ID
 */
export function getEvidence(id: string): Evidence | undefined {
  const canonicalId = getCanonicalEvidenceId(id)
  return EVIDENCE_PUBLIC[canonicalId as keyof typeof EVIDENCE_PUBLIC]
}

/**
 * Get all evidence
 */
export function getAllEvidence(): Evidence[] {
  return Object.values(EVIDENCE_PUBLIC)
}

/**
 * Get evidence by category
 */
export function getEvidenceByCategory(
  category: Evidence['category']
): Evidence[] {
  return Object.values(EVIDENCE_PUBLIC).filter((e) => e.category === category)
}

/**
 * Get evidence name in Catalan
 */
export function getEvidenceName(id: string): string {
  const evidence = getEvidence(id)
  return evidence?.catalan || id
}
