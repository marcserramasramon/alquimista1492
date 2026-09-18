'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/db'
import type { Database } from '@/lib/db.types'

export type TeamRow = Database['public']['Tables']['teams']['Row']
export type SessionRow = Database['public']['Tables']['sessions']['Row']
export type TeamStationRow = Database['public']['Tables']['team_stations']['Row']
export type TeamEvidenceRow = Database['public']['Tables']['team_evidences']['Row']
export type PassRow = Database['public']['Tables']['passes']['Row']

export interface TeamState {
  team: TeamRow | null
  session: SessionRow | null
  stations: TeamStationRow[]
  evidences: TeamEvidenceRow[]
  passes: PassRow[]
  loading: boolean
  error: string | null
}

/**
 * Hook to subscribe to real-time team state
 * Keeps all players in same team synchronized
 */
export function useTeamState(teamId: string | null | undefined) {
  const [state, setState] = useState<TeamState>({
    team: null,
    session: null,
    stations: [],
    evidences: [],
    passes: [],
    loading: true,
    error: null,
  })

  // Initial fetch
  const fetchTeamState = useCallback(async () => {
    if (!teamId) {
      setState((prev) => ({ ...prev, loading: false, error: 'No team ID' }))
      return
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Fetch team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (teamError) throw teamError

      // Fetch session
      let sessionData: SessionRow | null = null
      if (teamData?.session_id) {
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', teamData.session_id)
          .single()

        if (sessionError) throw sessionError
        sessionData = session
      }

      // Fetch team stations
      const { data: stationsData, error: stationsError } = await supabase
        .from('team_stations')
        .select('*')
        .eq('team_id', teamId)

      if (stationsError) throw stationsError

      // Fetch team evidences
      const { data: evidencesData, error: evidencesError } = await supabase
        .from('team_evidences')
        .select('*')
        .eq('team_id', teamId)

      if (evidencesError) throw evidencesError

      // Fetch passes
      const { data: passesData, error: passesError } = await supabase
        .from('passes')
        .select('*')
        .eq('team_id', teamId)

      if (passesError) throw passesError

      setState({
        team: teamData,
        session: sessionData,
        stations: stationsData || [],
        evidences: evidencesData || [],
        passes: passesData || [],
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Failed to fetch team state:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [teamId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!teamId) return

    // Initial fetch
    fetchTeamState()

    // Subscribe to team changes
    const teamSubscription = supabase
      .channel(`team-${teamId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams', filter: `id=eq.${teamId}` },
        (payload) => {
          setState((prev) => ({
            ...prev,
            team: payload.new as TeamRow,
          }))
        }
      )
      .subscribe()

    // Subscribe to session changes
    const sessionSubscription = supabase
      .channel(`team-${teamId}-session`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          const updatedSession = payload.new as SessionRow
          setState((prev) => {
            if (prev.session?.id === updatedSession.id) {
              return { ...prev, session: updatedSession }
            }
            return prev
          })
        }
      )
      .subscribe()

    // Subscribe to team stations changes
    const stationsSubscription = supabase
      .channel(`team-${teamId}-stations`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_stations', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const updatedStation = payload.new as TeamStationRow
          setState((prev) => {
            const newStations = [...prev.stations]
            const idx = newStations.findIndex(
              (s) => s.id === updatedStation.id
            )
            if (idx >= 0) {
              newStations[idx] = updatedStation
            } else {
              newStations.push(updatedStation)
            }
            return { ...prev, stations: newStations }
          })
        }
      )
      .subscribe()

    // Subscribe to team evidences changes
    const evidencesSubscription = supabase
      .channel(`team-${teamId}-evidences`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_evidences', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const updatedEvidence = payload.new as TeamEvidenceRow
          setState((prev) => {
            const newEvidences = [...prev.evidences]
            const idx = newEvidences.findIndex(
              (e) => e.id === updatedEvidence.id
            )
            if (idx >= 0) {
              newEvidences[idx] = updatedEvidence
            } else {
              newEvidences.push(updatedEvidence)
            }
            return { ...prev, evidences: newEvidences }
          })
        }
      )
      .subscribe()

    // Subscribe to passes changes
    const passesSubscription = supabase
      .channel(`team-${teamId}-passes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'passes', filter: `team_id=eq.${teamId}` },
        (payload) => {
          const updatedPass = payload.new as PassRow
          setState((prev) => {
            const newPasses = [...prev.passes]
            const idx = newPasses.findIndex((p) => p.id === updatedPass.id)
            if (idx >= 0) {
              newPasses[idx] = updatedPass
            } else {
              newPasses.push(updatedPass)
            }
            return { ...prev, passes: newPasses }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(teamSubscription)
      supabase.removeChannel(sessionSubscription)
      supabase.removeChannel(stationsSubscription)
      supabase.removeChannel(evidencesSubscription)
      supabase.removeChannel(passesSubscription)
    }
  }, [teamId, fetchTeamState])

  return state
}

/**
 * Get solved stations count
 */
export function getSolvedStationsCount(stations: TeamStationRow[]): number {
  return stations.filter((s) => s.solved).length
}

const STATION_CANONICAL_MAP: Record<string, string> = {
  serrat: 'serrat-bruixes',
  serrat_bruixes: 'serrat-bruixes',
  'serrat-bruixes': 'serrat-bruixes',
  font_ferro: 'font-ferro',
  'font-ferro': 'font-ferro',
  planes_bones: 'planes-bones',
  'planes-bones': 'planes-bones',
  cementiri: 'cementiri',
  pla_masset: 'pla-masset',
  'pla-masset': 'pla-masset',
  'pla-masset-control': 'pla-masset',
  'pla-masset-accusation': 'pla-masset',
  acusacio: 'pla-masset',
  caixa_almoines: 'caixa-almoines',
  'caixa-almoines': 'caixa-almoines',
  'rectoria-caixa': 'caixa-almoines',
  rectoria: 'caixa-almoines',
  campanar: 'sometent-campanar',
  'bells-sometent': 'sometent-campanar',
  bells_sometent: 'sometent-campanar',
  'campanar-sometent': 'sometent-campanar',
  'sometent-campanar': 'sometent-campanar',
}

/**
 * Check if station is solved
 */
export function isStationSolved(
  stations: TeamStationRow[],
  stationId: string
): boolean {
  return getTeamStation(stations, stationId)?.solved === true
}

/**
 * Get team station (amb suport per a IDs canònics i àlies)
 */
export function getTeamStation(
  stations: TeamStationRow[],
  stationId: string
): TeamStationRow | undefined {
  const direct = stations.find((s) => s.station_id === stationId)
  if (direct) return direct

  const canonicalTarget = STATION_CANONICAL_MAP[stationId] || stationId
  return stations.find((s) => {
    const canonicalCurrent = STATION_CANONICAL_MAP[s.station_id] || s.station_id
    return canonicalCurrent === canonicalTarget
  })
}
