import 'server-only'

/**
 * Evidence Mapping - Server-Only
 *
 * Links suspects to evidence pieces that support or contradict them.
 * NEVER send to client; use only in accusation validation logic.
 */

export const EVIDENCE_CATALOG = {
  seal: {
    id: 'seal',
    name: 'Segell ploma i clau',
    source: 'Joc 4 Cementiri',
    description: 'Seal with feather and key found in cemetery',
  },
  light: {
    id: 'light',
    name: 'Llum escola nit 15',
    source: 'Joc 3 Planes Bones',
    description: 'Light in school on night of May 15',
  },
  cantirs: {
    id: 'cantirs',
    name: 'Dos càntirs escola dia 12',
    source: 'Joc 2 Font del Ferro',
    description: 'Two pitchers taken from school on May 12',
  },
  literacy: {
    id: 'literacy',
    name: 'Sap de lletra',
    source: 'Joc 1 Serrat',
    description: 'Can read and write (firelight message)',
  },
  caligraphia: {
    id: 'caligraphia',
    name: 'Full cal·ligrafia + noms registre',
    source: 'Joc 6 Primer Intent',
    description: 'Calligraphy sheet with names from registry (schoolmaster\'s handwriting)',
  },
  filigrana: {
    id: 'filigrana',
    name: 'Filigrana àncora idèntica',
    source: 'Joc 4 Cementiri',
    description: 'Identical anchor watermark on letter paper',
  },
} as const

/**
 * Suspect Evidence Mapping
 *
 * Maps each suspect to evidence that points to OR clears them.
 */
export const SUSPECT_EVIDENCE = {
  bernat: {
    name: 'Bernat Mestre d\'Escola',
    role: 'School Master',
    validEvidence: [
      'seal',           // Found in cemetery (he knew about hidden cache)
      'light',          // School light on night 15 (his room)
      'cantirs',        // Took pitchers for ink preparation
      'literacy',       // Can read and write (traitor)
      'caligraphia',    // His handwriting in school registry
      'filigrana',      // He had access to official paper
    ],
    minEvidenceRequired: 3,
    reason: 'The school master wrote the traitor letter using school paper, school ink made from Font Ferro water, and his knowledge of the registry. He took the school supplies to prepare everything.',
  },

  anton: {
    name: 'Anton l\'Escolà',
    role: 'Church Sexton',
    validEvidence: [], // No evidence points to him
    alibi: 'He was watching over the rector all night of May 15',
    alibiUnlocks: {
      declaratio_rector: 'Statement from Rector: "Anton watched me all night"',
      full_caligraphia: 'Calligraphy sheet showing children copying dead names (not adult handwriting)',
    },
    note: 'If accused first, triggers narrative giro where Anton proves his innocence',
  },

  pere_moli: {
    name: 'Pere del Molí',
    role: 'Miller',
    status: 'ELIMINATED',
    reason: 'Cannot read or write (Serrat game reveals literate traitor)',
  },

  joan: {
    name: 'Joan el traginer',
    role: 'Muleteer',
    status: 'ELIMINATED',
    reason: 'Cannot read or write (Serrat game reveals literate traitor)',
  },

  marianna: {
    name: 'Marianna de l\'Hostal',
    role: 'Innkeeper',
    status: 'ELIMINATED',
    reason: 'Not at Font Ferro on May 12 (market day in Vic)',
  },

  isidre: {
    name: 'Isidre el ferrer',
    role: 'Blacksmith',
    status: 'CLEARED',
    alibi: 'At Farga on night of May 15 when patrol passed (Planes Bones game)',
  },
} as const

/**
 * Evidence Elimination Chain
 *
 * Shows how each game eliminates suspects via evidence:
 */
export const ELIMINATION_CHAIN = [
  {
    game: 'Serrat de les Bruixes',
    evidence: 'SAP DE LLETRA (Can read)',
    eliminates: ['pere_moli', 'joan'],
    reasoning: 'Traitor can read and write, eliminating Pere and Joan',
  },
  {
    game: 'Font del Ferro',
    evidence: 'Dia 12 (Water collection)',
    eliminates: ['marianna'],
    reasoning: 'Marianna was at market in Vic on May 12 (innkeeper absent)',
  },
  {
    game: 'Planes Bones',
    evidence: 'Farga at 23:00',
    clears: ['isidre'],
    reasoning: 'Isidre confirmed at Farga when patrol passed',
  },
  {
    game: 'Cementiri',
    evidence: 'Corminas signature',
    incriminates: ['bernat'],
    reasoning: 'Only schoolmaster knows registry well enough to copy name variants',
  },
  {
    game: 'Accusació',
    evidence: '3 valid pieces',
    confirms: 'bernat',
    reasoning: 'Combined evidence points to Bernat with multiple damning proofs',
  },
] as const
