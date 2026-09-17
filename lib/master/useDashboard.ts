import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/db'
import type { Database } from '@/lib/db.types'

export type TeamData = Database['public']['Tables']['teams']['Row'] & {
  score: number
  solvedStationsCount: number
  timeElapsed: number
  moralChoice?: string | null
  salconduits: number
}

interface DashboardData {
  teams: TeamData[]
  sessionStartTime: Date | null
  sessionEndTime: Date | null
  isLoading: boolean
  error: Error | null
  lastUpdated: Date
}

const POLL_INTERVAL_MS = 5000 // Fallback polling interval

export function useMasterDashboard(sessionId?: string) {
  const [data, setData] = useState<DashboardData>({
    teams: [],
    sessionStartTime: null,
    sessionEndTime: null,
    isLoading: true,
    error: null,
    lastUpdated: new Date(),
  })

  const subscriptionRef = useRef<any>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Fetch teams data
  const fetchTeams = useCallback(async () => {
    try {
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      // Fetch sessions data for each team
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')

      if (sessionsError) throw sessionsError

      // Fetch results data
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*')

      if (resultsError) throw resultsError

      if (!isMountedRef.current) return

      const sessionMap = new Map(
        (sessionsData || []).map((s) => [s.id, s])
      )
      const resultsMap = new Map(
        (resultsData || []).map((r) => [r.team_id, r])
      )

      const enrichedTeams: TeamData[] = (teamsData || []).map((team) => {
        const session = team.session_id ? sessionMap.get(team.session_id) : undefined
        const result = resultsMap.get(team.id)
        const startTime = team.started_at ? new Date(team.started_at) : new Date()
        const now = new Date()
        const timeElapsed = Math.round((now.getTime() - startTime.getTime()) / 1000)

        return {
          ...team,
          score: result?.total_score || session?.score || 0,
          solvedStationsCount: session?.solved_stations?.length || 0,
          timeElapsed,
          moralChoice: result?.moral_choice,
          salconduits: session?.salconduits_remaining || 0,
        }
      })

      setData((prev) => ({
        ...prev,
        teams: enrichedTeams,
        sessionStartTime: enrichedTeams[0]?.started_at
          ? new Date(enrichedTeams[0].started_at)
          : null,
        sessionEndTime: enrichedTeams[0]?.started_at
          ? new Date(new Date(enrichedTeams[0].started_at).getTime() + 90 * 60 * 1000)
          : null,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      }))
    } catch (error) {
      if (isMountedRef.current) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
      }
    }
  }, [])

  // Setup subscriptions
  useEffect(() => {
    let channel: any = null

    const setupRealtimeSubscriptions = async () => {
      try {
        // Subscribe to teams changes
        channel = supabase
          .channel('dashboard-teams')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'teams' },
            () => {
              fetchTeams()
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sessions' },
            () => {
              fetchTeams()
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'results' },
            () => {
              fetchTeams()
            }
          )
          .subscribe()

        subscriptionRef.current = channel
      } catch (error) {
        console.error('Realtime subscription error:', error)
        // Will fall back to polling
      }
    }

    // Initial fetch
    fetchTeams()

    // Setup subscriptions
    setupRealtimeSubscriptions()

    // Setup fallback polling
    pollIntervalRef.current = setInterval(fetchTeams, POLL_INTERVAL_MS)

    return () => {
      isMountedRef.current = false
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [fetchTeams])

  return data
}
