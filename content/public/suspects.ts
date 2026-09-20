/**
 * Suspects Definitions - Public Content
 *
 * Suspect profiles visible to players (before accusation).
 * No solution spoilers; narrative details only.
 */

export interface Suspect {
  id: string
  name: string
  catalan: string
  role: string
  roleDescription: string
  age: number
  narrative: string
  suspicionFactor: 'baixa' | 'mitjana' | 'alta'
  clueLocation: string
  profileIcon: string
}

export const SUSPECTS: Record<string, Suspect> = {
  bernat: {
    id: 'bernat',
    name: 'Bernat',
    catalan: 'Bernat Mestre d\'Escola',
    role: 'School Master',
    roleDescription: 'Teaches letters and numbers to village children',
    age: 41,
    narrative:
      'Educated man from outside the village. Arrived in 1703. Widowed, with a son. Respectful, quiet.',
    suspicionFactor: 'alta',
    clueLocation: 'Escola de la Guixa',
    profileIcon: '👨‍🏫',
  },
  anton: {
    id: 'anton',
    name: 'Anton',
    catalan: 'Anton l\'Escolà',
    role: 'Church Sexton',
    roleDescription: 'Serves the rector and maintains church records',
    age: 18,
    narrative:
      'Young man from Manlleu. Arrived 1701. Knows all the registry records. Devoted to the rector.',
    suspicionFactor: 'alta',
    clueLocation: 'Rectoria de la Guixa',
    profileIcon: '⛪',
  },
  pere_moli: {
    id: 'pere_moli',
    name: 'Pere',
    catalan: 'Pere del Molí',
    role: 'Miller',
    roleDescription: 'Runs the grain mill for the village',
    age: 45,
    narrative:
      'Known his whole life. Strong, practical, simple. Keeps the mill running day and night.',
    suspicionFactor: 'baixa',
    clueLocation: 'Molí de la Guixa',
    profileIcon: '🪨',
  },
  joan: {
    id: 'joan',
    name: 'Joan',
    catalan: 'Joan el traginer',
    role: 'Muleteer',
    roleDescription: 'Carries goods between villages on pack animals',
    age: 30,
    narrative:
      'Travels weekly to Manlleu. Knows many people. Stays mostly quiet. Sharp eye for detail.',
    suspicionFactor: 'baixa',
    clueLocation: 'Camins de Manlleu',
    profileIcon: '🐴',
  },
  marianna: {
    id: 'marianna',
    name: 'Marianna',
    catalan: 'Marianna de l\'Hostal',
    role: 'Innkeeper',
    roleDescription: 'Runs the village inn and keeps the guest book',
    age: 35,
    narrative:
      'Manages the inn with her family. Hears all the village news. Quick-minded with numbers.',
    suspicionFactor: 'baixa',
    clueLocation: 'Hostal de la Guixa',
    profileIcon: '🏘️',
  },
  isidre: {
    id: 'isidre',
    name: 'Isidre',
    catalan: 'Isidre el ferrer',
    role: 'Blacksmith',
    roleDescription: 'Works day and night at the forge',
    age: 33,
    narrative:
      'Skilled craftsman. Works odd hours keeping the forge running. Known for his quiet strength.',
    suspicionFactor: 'baixa',
    clueLocation: 'Farga de la Guixa',
    profileIcon: '⚒️',
  },
} as const

/**
 * Get all suspects
 */
export function getAllSuspects(): Suspect[] {
  return Object.values(SUSPECTS)
}
