'use client'

import type { TeamStationRow } from '@/lib/realtime/useTeamState'
import { StaticMap } from './StaticMap'

interface MapTabProps {
  stations: TeamStationRow[]
  teamId?: string
}

export function MapTab({ stations, teamId }: MapTabProps) {
  return <StaticMap stations={stations} teamId={teamId} />
}
