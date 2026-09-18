'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db'
import { ResultsView, type TeamResultData, type RankingItem } from '@/components/player/ResultsView'

export default function PlayerResultsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [teamResult, setTeamResult] = useState<TeamResultData | null>(null)
  const [ranking, setRanking] = useState<RankingItem[]>([])

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)

        // 1. Get current authenticated player
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: player } = await supabase
          .from('players')
          .select('id, team_id, teams(id, name, code, color, session_id, started_at, finished_at)')
          .eq('user_id', user.id)
          .single()

        if (!player || !player.teams) {
          router.push('/')
          return
        }

        const team = Array.isArray(player.teams) ? player.teams[0] : player.teams

        // 2. Fetch session and result for this team
        const [sessionRes, resultRes] = await Promise.all([
          team.session_id
            ? supabase.from('sessions').select('*').eq('id', team.session_id).single()
            : { data: null },
          supabase.from('results').select('*').eq('team_id', team.id).single(),
        ])

        const session = sessionRes.data
        const result = resultRes.data

        const startTime = team.started_at ? new Date(team.started_at).getTime() : Date.now()
        const endTime = team.finished_at ? new Date(team.finished_at).getTime() : Date.now()
        const timeElapsed = Math.max(0, Math.round((endTime - startTime) / 1000))

        setTeamResult({
          teamName: team.name || 'El vostre equip',
          teamColor: team.color || '#d97706',
          teamCode: team.code,
          score: result?.total_score || session?.score || 0,
          timeElapsed,
          moralChoice: result?.moral_choice || null,
          isCorrect: result ? true : true,
          solvedStations: session?.solved_stations?.length || 0,
          salconduitsRemaining: session?.salconduits_remaining ?? 3,
        })

        // 3. Fetch public ranking of teams
        const { data: allTeams } = await supabase
          .from('teams')
          .select('id, name, code, color, started_at, finished_at, session_id')
          .eq('is_active', true)

        if (allTeams) {
          const sessionIds = allTeams.map((t) => t.session_id).filter(Boolean) as string[]
          const { data: allSessions } = await supabase
            .from('sessions')
            .select('id, score')
            .in('id', sessionIds)

          const sMap = new Map((allSessions || []).map((s) => [s.id, s.score || 0]))

          const rankList: RankingItem[] = allTeams.map((t) => {
            const st = t.started_at ? new Date(t.started_at).getTime() : Date.now()
            const et = t.finished_at ? new Date(t.finished_at).getTime() : Date.now()
            return {
              id: t.id,
              name: t.name || t.code,
              code: t.code,
              color: t.color || '#d97706',
              score: (t.session_id ? sMap.get(t.session_id) : 0) || 0,
              timeElapsed: Math.round((et - st) / 1000),
              finished: !!t.finished_at,
            }
          })

          rankList.sort((a, b) => b.score - a.score)
          setRanking(rankList)
        }
      } catch (err) {
        console.error('Error carregant resultats del jugador:', err)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 text-amber-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-amber-200 rounded-full animate-spin mb-4" />
        <p className="text-amber-200 font-serif text-lg">Recompilant les dades de la investigació...</p>
      </div>
    )
  }

  return <ResultsView teamResult={teamResult} ranking={ranking} />
}
