import { useEffect, useState, useCallback, useRef } from 'react'

export interface TeamData {
  id: string
  code: string
  name: string | null
  color: string | null
  variant: 'A' | 'B' | 'C'
  started_at: string | null
  finished_at: string | null
  is_active: boolean | null
  created_at?: string | null
  session_id?: string | null
  score: number
  solvedStationsCount: number
  timeElapsed: number
  moralChoice?: string | null
  salconduits: number
  playersCount: number
  playerNames?: string[]
}

interface DashboardData {
  teams: TeamData[]
  sessionStartTime: Date | null
  sessionEndTime: Date | null
  isLoading: boolean
  error: Error | null
  lastUpdated: Date
}

const POLL_INTERVAL_MS = 4000 // Polling interval in ms

export function useMasterDashboard() {
  const [data, setData] = useState<DashboardData>({
    teams: [],
    sessionStartTime: null,
    sessionEndTime: null,
    isLoading: true,
    error: null,
    lastUpdated: new Date(),
  })

  const [isResetting, setIsResetting] = useState(false)

  // Fetch teams data from dedicated server route
  const fetchTeams = useCallback(async () => {
    try {
      const token = localStorage.getItem('master_token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/master/teams', {
        headers,
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Sessió de màster expirada')
        }
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Error obtenint equips')
      }

      const json = await res.json()

      setData({
        teams: json.teams || [],
        sessionStartTime: json.sessionStartTime ? new Date(json.sessionStartTime) : null,
        sessionEndTime: json.sessionEndTime ? new Date(json.sessionEndTime) : null,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error('Error fetching teams:', error)
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
    }
  }, [])

  // Action to reset game for the 8 teams
  const resetGame = useCallback(async () => {
    setIsResetting(true)
    try {
      const token = localStorage.getItem('master_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch('/api/master/reset', {
        method: 'POST',
        headers,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Error reiniciant la partida')
      }

      await fetchTeams()
      return true
    } catch (err) {
      console.error('Error resetting game:', err)
      throw err
    } finally {
      setIsResetting(false)
    }
  }, [fetchTeams])

  useEffect(() => {
    // Initial fetch
    fetchTeams()

    // Polling interval
    const interval = setInterval(fetchTeams, POLL_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [fetchTeams])

  return {
    ...data,
    refetch: fetchTeams,
    resetGame,
    isResetting,
  }
}
