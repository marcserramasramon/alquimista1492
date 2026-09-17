export interface DefaultTeamConfig {
  code: string
  name: string
  color: string
  variant: 'A' | 'B'
}

export interface StationConfig {
  id: string
  name: string
  catalan: string
  order: number
  gameComponent: string
}

export const DEFAULT_TEAMS: DefaultTeamConfig[] = [
  { code: 'EQUIP1', name: 'Equip 1 — Els Sometents', color: '#dc2626', variant: 'A' },
  { code: 'EQUIP2', name: 'Equip 2 — Els Bandolers', color: '#2563eb', variant: 'B' },
  { code: 'EQUIP3', name: 'Equip 3 — Els Bruixots', color: '#16a34a', variant: 'A' },
  { code: 'EQUIP4', name: 'Equip 4 — La Guixa Alta', color: '#d97706', variant: 'B' },
  { code: 'EQUIP5', name: 'Equip 5 — La Guixa Baixa', color: '#9333ea', variant: 'A' },
  { code: 'Equip6'.toUpperCase(), name: 'Equip 6 — El Serrat', color: '#0891b2', variant: 'B' },
  { code: 'EQUIP7', name: 'Equip 7 — Els Moliners', color: '#ea580c', variant: 'A' },
  { code: 'EQUIP8', name: 'Equip 8 — Els Carboners', color: '#475569', variant: 'B' },
]

export const GAME_STATIONS: StationConfig[] = [
  { id: 'serrat-bruixes', name: 'Serrat de les Bruixes', catalan: 'Serrat de les Bruixes', order: 1, gameComponent: 'SerratBruixesGame' },
  { id: 'font-ferro', name: 'Font del Ferro', catalan: 'Font del Ferro', order: 2, gameComponent: 'FontFerroGame' },
  { id: 'planes-bones', name: 'Planes Bones', catalan: 'Planes Bones', order: 3, gameComponent: 'PlaneBonesGame' },
  { id: 'cementiri', name: 'Cementiri de la Guixa', catalan: 'Cementiri de la Guixa', order: 4, gameComponent: 'CementiriGame' },
  { id: 'pla-masset', name: 'Pla de Masset — Control', catalan: 'Pla de Masset', order: 5, gameComponent: 'ControlGame' },
  { id: 'pla-masset-accusation', name: 'Pla de Masset — Acusació', catalan: 'Pla de Masset', order: 6, gameComponent: 'AccusationGame' },
  { id: 'caixa-almoines', name: 'Caixa de les Almoines', catalan: 'Caixa de les Almoines', order: 7, gameComponent: 'BoxGame' },
  { id: 'bells-sometent', name: 'Campanar de Sant Sebastià', catalan: 'Campanar de Sant Sebastià', order: 8, gameComponent: 'BellsGame' },
  { id: 'decisio-moral', name: 'Decisió Moral', catalan: 'Decisió Moral', order: 9, gameComponent: 'MoralChoiceGame' },
]
