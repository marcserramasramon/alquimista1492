import 'server-only'

/**
 * Traitor Identity - Server-Only
 *
 * THE CORE SECRET: Identity and backstory of El Traïdor.
 * NEVER expose to client; used only in:
 * - Server validation logic
 * - Master dashboard (protected)
 * - Final revelation screens (after game complete)
 *
 * CRITICAL SECURITY: Do not import this in any client component.
 * Import only in:
 * - app/api/* route handlers
 * - lib/auth/* server utilities
 * - lib/master/* master-only logic
 */

export const TRAITOR_IDENTITY = {
  id: 'bernat',
  name: 'Bernat Mestre d\'Escola',
  role: 'School Master (Mestre d\'Escola)',
  firstName: 'Bernat',
  surname: 'Mestre d\'Escola',

  /**
   * Motivation & Backstory
   * Reason he betrayed the Pacte dels Vigatans
   */
  motivation: {
    son: 'Jaume',
    sonStatus: 'Captured by Spanish dragoons at Vic garrison',
    deal: 'Captain promises to release Jaume in exchange for list of conspirators',
    pressure: 'Forced choice between son and conspiracy',
    finalChoice: 'Player decides (moral choice game)',
  },

  /**
   * Evidence Trail
   * How players discover his guilt through games
   */
  evidenceTrail: [
    {
      game: 'Serrat',
      evidence: 'SAP DE LLETRA',
      detail: 'Fires reveal traitor can read',
      eliminatesOthers: ['pere_moli', 'joan'],
    },
    {
      game: 'Font Ferro',
      evidence: 'Dia 12 water collection',
      detail: 'Bernat collected water for ink preparation',
      detail2: '(Tinta made May 15, soaked 3 days)',
    },
    {
      game: 'Planes Bones',
      evidence: 'School light May 15 at 22:00',
      detail: 'Bernat writing the traitor letter alone at school',
    },
    {
      game: 'Cementiri',
      evidence: 'Corminas signature (wrong spelling)',
      detail: 'Only schoolmaster knows registry variants',
      detail2: '(He wrote it; could copy "Corminas" variant)',
    },
    {
      game: 'Caixa Almoines',
      evidence: 'Letter + Fake rector letter inside',
      detail: 'Original traitor letter + captain\'s trick letter',
    },
  ],

  /**
   * Physical Evidence in Games
   */
  physicalEvidence: {
    letter: {
      date: '15 de maig de 1705',
      content: 'Names of conspirators (sent to Captain)',
      paper: 'School paper with anchor watermark',
      ink: 'Gall-based ink from Font Ferro (May 12)',
      signature: 'Corminas (copied from registry variant)',
    },
    schoolSupplies: {
      cantirs: 'Two pitchers (for ink preparation)',
      paper: 'Official school register paper',
      seals: 'School seals and keys',
    },
  },

  /**
   * Key Moments
   */
  timeline: {
    may_10_16: {
      event: 'Receives word Jaume arrested',
      action: 'Begins planning betrayal',
    },
    may_12: {
      event: 'Visits Font Ferro',
      action: 'Collects iron-rich water for ink prep',
    },
    may_15_morning: {
      event: 'Prepares gall ink',
      action: 'Ink soaks 3 days from water collected May 12',
    },
    may_15_night: {
      event: 'Writes traitor letter',
      action: 'At school alone (light visible from Planes Bones)',
      time: '22:00-23:00',
      uses: [
        'School paper with anchor watermark',
        'Gall ink from Font Ferro water',
        'Copy clerk skills to mimic Corminas signature',
      ],
    },
    may_15_dawn: {
      event: 'Hides letter in Caixa de les Almoines',
      action: 'Uses code 4231 (element sequence)',
      note: 'Letter found by conjurats during game',
    },
  },

  /**
   * Narrative Arc in Games
   */
  gameProgression: {
    intro_to_midgame: 'Players collect evidence unknowingly',
    cemetiri_breakthrough: 'Registry clue: Bernat knew variants',
    caixa_revelation: 'Letter inside box confirms traitor',
    accusacio_climax: 'Players must choose: accuse Bernat or Anton',
    moral_choice: 'If Bernat accused: final choice (save son or enforce justice)',
    ending_a: 'COMPASSIÓ: Bernat escapes with Jaume (bittersweet)',
    ending_b: 'JUSTICIA: Bernat caught, Jaume orphaned (harsh but just)',
  },

  /**
   * Master Dashboard Usage
   * Shown to Màster in real-time dashboard
   */
  masterRevealed: true,
  masterCanSee: [
    'Full identity',
    'Evidence collected by teams',
    'Which accusations are made',
    'Final moral choice',
  ],

  /**
   * AI NPC Behavior (if future feature)
   * How Bernat acts during the game
   */
  npcBehavior: {
    beforeAccusation: 'Acts innocent, helps mislead teams',
    afterAccusation: 'Admits guilt when confronted with evidence',
    duringMoralChoice: 'Pleads for compassion (son in danger)',
  },
} as const

/**
 * Verification Helpers
 */
export const isTraitor = (suspectId: string): boolean => {
  return suspectId === TRAITOR_IDENTITY.id
}

export const getTraitorName = (): string => {
  return TRAITOR_IDENTITY.name
}

/**
 * Server-side validation: Check if accusation is correct
 * Used in /api/games/accusacio route
 */
export const validateAccusation = (
  suspectId: string,
  evidenceIds: string[]
): { correct: boolean; reason?: string } => {
  if (suspectId !== TRAITOR_IDENTITY.id) {
    return {
      correct: false,
      reason: 'Wrong suspect',
    }
  }

  // For Bernat, accept 3+ from valid evidence list
  const validEvidence = [
    'seal',
    'light',
    'cantirs',
    'literacy',
    'caligraphia',
    'filigrana',
  ]

  const matchCount = evidenceIds.filter(id => validEvidence.includes(id)).length

  if (matchCount < 3) {
    return {
      correct: false,
      reason: 'Not enough valid evidence',
    }
  }

  return {
    correct: true,
  }
}
