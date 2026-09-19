'use client'

import type { TeamStationRow, TeamEvidenceRow } from '@/lib/realtime/useTeamState'
import { StaticMap } from './StaticMap'

interface MapTabProps {
  stations: TeamStationRow[]
  evidences?: TeamEvidenceRow[]
  teamId?: string
}

export function MapTab({ stations, evidences, teamId }: MapTabProps) {
  return <StaticMap stations={stations} evidences={evidences} teamId={teamId} />
}
