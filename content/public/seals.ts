/**
 * Seals Definitions - Public Content
 *
 * 8 authentic-styled Catalan wax seals for the Box Game (Joc 7: Caixa de les Almoines).
 * Each team/group is assigned a unique authentic seal of Bernat to prevent copying.
 */

export interface SealOption {
  id: string // 'segell-1' .. 'segell-8'
  number: number // 1 .. 8
  label: string
  subtitle: string
  heraldry: string
  image: string
}

export const SEALS: Record<string, SealOption> = {
  'segell-1': {
    id: 'segell-1',
    number: 1,
    label: 'Lleó i Quatre Barres',
    subtitle: 'Segell Reial / Senyera',
    heraldry: "Corona reial d'or, escut partit amb lleó rampant i les quatre barres catalanes.",
    image: '/images/seals/segell-1.png',
  },
  'segell-2': {
    id: 'segell-2',
    number: 2,
    label: 'Creu dels Alquimistes',
    subtitle: 'Capel Eclesiàstic',
    heraldry: 'Capel amb sis borles a cada banda, creu central amb símbols de mercuri, sofre i creixent lunar.',
    image: '/images/seals/segell-2.png',
  },
  'segell-3': {
    id: 'segell-3',
    number: 3,
    label: 'La Clau i el Llibre',
    subtitle: "Mestre d'Escola",
    heraldry: "Elm de cavaller emplomallat, escut amb una clau daurada i el llibre d'ensenyament obert.",
    image: '/images/seals/segell-3.png',
  },
  'segell-4': {
    id: 'segell-4',
    number: 4,
    label: 'Claus Creuades de Sant Pere',
    subtitle: 'Mitra Pontifícia',
    heraldry: 'Tiara papal i claus creuades de Sant Pere lligades amb cordons i borles daurades.',
    image: '/images/seals/segell-4.png',
  },
  'segell-5': {
    id: 'segell-5',
    number: 5,
    label: 'El Navili i el Roure',
    subtitle: 'Mitra i Bàcul',
    heraldry: "Mitra episcopal amb ínfules, escut quarterat amb un vaixell de veles, un roure mil·lenari, símbols hermètics i un lleó.",
    image: '/images/seals/segell-5.png',
  },
  'segell-6': {
    id: 'segell-6',
    number: 6,
    label: 'Sigillvm Episcopi Vicensis',
    subtitle: 'Bisbe de Vic',
    heraldry: 'Segell ovalat amb la figura del Bisbe de Vic sostenint el bàcul pastoral sota mitra i orla de lletres llatines.',
    image: '/images/seals/segell-6.png',
  },
  'segell-7': {
    id: 'segell-7',
    number: 7,
    label: 'La Gran Clau del Temple',
    subtitle: 'Elm i Clau Cerimonial',
    heraldry: 'Elm de cavaller emplomallat, gran clau daurada central ornamentada amb llaç cerimonial.',
    image: '/images/seals/segell-7.png',
  },
  'segell-8': {
    id: 'segell-8',
    number: 8,
    label: 'Sigillvm Nob. Barcino',
    subtitle: 'Segell Noble de Barcelona',
    heraldry: 'Inscripció llatina, cimera amb lleó, escut quarterat amb sol radiant, mercuri, símbol alquímic i lleó rampant.',
    image: '/images/seals/segell-8.png',
  },
}

export const ALL_SEALS: SealOption[] = Object.values(SEALS)

/**
 * Retorna el segell autèntic assignat a un equip o variant específica.
 * Cada equip rep un segell diferent perquè cap grup pugui copiar l'altre.
 */
export function getTeamCorrectSeal(teamInfo?: {
  code?: string | null
  variant?: string | null
  id?: string | null
} | null): SealOption {
  if (!teamInfo) {
    return SEALS['segell-3'] // Valor per defecte
  }

  // 1. Si el codi té número (ex: EQUIP1 -> segell-1, EQUIP2 -> segell-2... EQUIP8 -> segell-8)
  if (teamInfo.code) {
    const match = teamInfo.code.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num >= 1 && num <= 8) {
        const key = `segell-${num}`
        if (SEALS[key]) return SEALS[key]
      } else {
        const mod = ((num - 1) % 8) + 1
        const key = `segell-${mod}`
        if (SEALS[key]) return SEALS[key]
      }
    }
  }

  // 2. Si té variant A, B o C
  if (teamInfo.variant === 'A') return SEALS['segell-3'] // Mestre d'escola
  if (teamInfo.variant === 'B') return SEALS['segell-7'] // Gran clau
  if (teamInfo.variant === 'C') return SEALS['segell-1'] // Lleó i Senyera

  // 3. Determinista per hash d'ID d'equip
  if (teamInfo.id) {
    let hash = 0
    for (let i = 0; i < teamInfo.id.length; i++) {
      hash = (hash * 31 + teamInfo.id.charCodeAt(i)) | 0
    }
    const idx = (Math.abs(hash) % 8) + 1
    return SEALS[`segell-${idx}`] || SEALS['segell-3']
  }

  return SEALS['segell-3']
}
