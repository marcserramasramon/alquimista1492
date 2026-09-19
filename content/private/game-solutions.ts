import 'server-only'

/**
 * Game Solutions - Server-Only
 *
 * These are the correct answers for all station games.
 * NEVER export or reference from client code.
 * Used only in server route handlers for validation.
 */

export const GAME_SOLUTIONS = {
  // Joc 1: Serrat de les Bruixes (Element Code & Literacy)
  serrat_bruixes: {
    answer: 'SAP DE LLETRA',
    type: 'text',
    elementCode: 4, // FOC
    description: 'Fire message decoded from beacon fires',
  },

  // Joc 2: Font del Ferro (Water Source Date)
  font_ferro: {
    answer: '12',
    type: 'date',
    elementCode: 2, // AIGUA
    description: 'May 12: the day water was collected for ink',
    hint: 'Tinta made May 15, soaked 3 days = collected 3 days before',
  },

  // Joc 3: Planes Bones (Patrol Route)
  planes_bones: {
    answer: {
      path: [14, 5, 6, 7, 3], // Plaça → Hostal → Pou → Era → Farga
      minutes: 60,
    },
    type: 'path',
    elementCode: 3, // TERRA
    description: 'Patrol route arriving at Farga at 23:00',
    hint: 'Start at Plaça (22:00), each cell = 15 min, arrive Farga at 23:00',
  },

  // Joc 4: Cementiri (Gravestone Match)
  cementiri: {
    answer: 1, // Corminas (1698)
    type: 'lapida_id',
    elementCode: 1, // AIRE
    description: 'Gravestone for Joseph Coromines (1698)',
    realName: 'Joseph Coromines',
    year: 1698,
  },

  // Joc 5: Control de l'Emissari (Memory Validation)
  control_emissari: {
    answer: null, // Master validates this manually
    type: 'master_validation',
    description: 'L\'Emissari interrogates the team on their alibi',
  },

  // Joc 6: Accusació (Final Accusation)
  accusacio: {
    suspect: 'bernat', // Bernat Mestre d'Escola
    validEvidence: ['seal', 'light', 'cantirs', 'literacy', 'caligraphia', 'filigrana'],
    type: 'accusation',
    description: 'Accuse Bernat with 3+ valid evidence pieces',
    giroTrigger: 'anton', // If Anton accused first, narrative giro occurs
  },

  // Joc 7: Caixa de les Almoines (Three-part game)
  caixa_almoines: {
    part1: {
      answer: '4231',
      type: 'code',
      description: 'Box code from 4 elements: FOC(4) AIGUA(2) TERRA(3) AIRE(1)',
    },
    part2: {
      answer: '15-05',
      type: 'date',
      description: 'Date of stolen letter inside box (written May 15 with ink from May 12)',
    },
    part3: {
      answer: 'bernat', // Correct seal: Bernat's seal with anchor filigree
      type: 'seal',
      description: 'Seal the fake letter with Bernat\'s seal (red anchor filigree)',
    },
  },

  // Joc 8: Sometent (Bell Tower Code)
  sometent_bell: {
    bellSequence: [1, 2, 1, 2, 3, 1, 3, 2],
    type: 'bell_sequence',
    elementCode: null, // No element code, bell rings when correct
    description: 'Bell tower sequence: 8 bells representing the calling of the conjurats',
    moralChoices: {
      A: {
        label: 'ACCEPTAR TRACTE',
        narrative: 'Deixeu que Bernat fugui a buscar el seu fill',
      },
      B: {
        label: 'REBUTJAR TRACTE',
        narrative: 'Bernat queda detingut sense tenir certesa',
      },
    },
  },

  // Alternative ID for the same game
  bells_sometent: {
    bellSequence: [1, 2, 1, 2, 3, 1, 3, 2],
    type: 'bell_sequence',
    elementCode: null,
    description: 'Bell tower sequence: 8 bells representing the calling of the conjurats',
    moralChoices: {
      A: {
        label: 'ACCEPTAR TRACTE',
        narrative: 'Deixeu que Bernat fugui a buscar el seu fill',
      },
      B: {
        label: 'REBUTJAR TRACTE',
        narrative: 'Bernat queda detingut sense tenir certesa',
      },
    },
  },

  // Joc 9: Moral Decision (No scoring, narrative branches only)
  decisio_moral: {
    optionA: {
      label: 'ACCEPTAR TRACTE',
      ending: 'COMPASIÓ',
    },
    optionB: {
      label: 'REBUTJAR TRACTE',
      ending: 'JUSTICIA',
    },
    description: 'Final choice - tracking only, no correct answer',
  },
} as const

export type GameSolutionKey = keyof typeof GAME_SOLUTIONS
