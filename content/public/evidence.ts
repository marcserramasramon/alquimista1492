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
    description: 'Marca de segell trobada en documents oficials',
    discoveredAt: 'Registres del cementiri',
    category: 'physical',
    icon: '🔑',
  },
  light: {
    id: 'light',
    name: 'School Light on Night 15',
    catalan: 'Llum escola nit 15',
    description: 'Llum observada a l\'edifici de l\'escola després de fosc',
    discoveredAt: 'Observació de la patrulla a Planes Bones',
    category: 'observation',
    icon: '💡',
  },
  cantirs: {
    id: 'cantirs',
    name: 'Two Pitchers from School',
    catalan: 'Dos càntirs escola dia 12',
    description: 'Dos càntirs d\'aigua agafats del material de l\'escola el 12 de maig',
    discoveredAt: 'Recollida d\'aigua a la Font del Ferro',
    category: 'physical',
    icon: '🏺',
  },
  literacy: {
    id: 'literacy',
    name: 'Knowledge of Letters',
    catalan: 'Sap de lletra',
    description: 'El traïdor sap llegir i escriure (revelat pel codi de foc)',
    discoveredAt: 'Anàlisi del senyal al Serrat de les Bruixes',
    category: 'observation',
    icon: '📖',
  },
  caligraphia: {
    id: 'caligraphia',
    name: 'Calligraphy Sheet with Names',
    catalan: 'Full cal·ligrafia + noms registre',
    description: 'Full trobat amb noms copiats amb cura del registre de defuncions',
    discoveredAt: 'Investigació a l\'escola',
    category: 'document',
    icon: '✍️',
  },
  filigrana: {
    id: 'filigrana',
    name: 'Anchor Watermark',
    catalan: 'Filigrana àncora idèntica',
    description: 'Filigrana d\'àncora idèntica al paper utilitzat per a les cartes',
    discoveredAt: 'Anàlisi de documents',
    category: 'physical',
    icon: '⚓',
  },
  ink: {
    id: 'ink',
    name: 'Iron-based Ink',
    catalan: 'Tinta de ferro',
    description: 'Tinta de gala preparada amb aigua de la font rica en ferro',
    discoveredAt: 'Anàlisi de la recepta a la Font del Ferro',
    category: 'physical',
    icon: '🖋️',
  },
  nota_capita: {
    id: 'nota_capita',
    name: 'Captain\'s Note',
    catalan: 'Nota del Capità',
    description: 'Missatge dins la caixa de les almoines: «Els noms a trenc d\'alba, i el teu fill dorm a casa»',
    discoveredAt: 'Caixa de les Almoines',
    category: 'document',
    icon: '📜',
  },
  carta_falsa: {
    id: 'carta_falsa',
    name: 'False Letter',
    catalan: 'Carta falsa del rector',
    description: 'Carta falsificada amb noms i ubicació erronis, preparada pel rector',
    discoveredAt: 'Caixa de les Almoines',
    category: 'document',
    icon: '✉️',
  },
  declaratio_anton: {
    id: 'declaratio_anton',
    name: 'Anton\'s Statement',
    catalan: 'Declaració d\'Anton',
    description: 'Testimoni signat pel rector que confirma la coartada d\'Anton',
    discoveredAt: 'Confrontació al Pla de Masset',
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
