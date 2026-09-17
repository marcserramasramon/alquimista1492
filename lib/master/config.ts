export interface DefaultTeamConfig {
  code: string
  name: string
  color: string
  variant: 'A' | 'B'
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
