import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterToken } from '@/lib/auth/master'
import { getServiceRoleClient } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/master/config'

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('master_token')?.value ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    if (!token) {
      return NextResponse.json({ error: 'No autenticat com a Màster' }, { status: 401 })
    }

    try {
      await verifyMasterToken(token)
    } catch {
      return NextResponse.json({ error: 'Sessió de Màster invàlida o expirada' }, { status: 401 })
    }

    const serviceClient = getServiceRoleClient()

    const [teamsRes, resultsRes, sessionsRes, playersRes] = await Promise.all([
      serviceClient.from('teams').select('*').order('created_at', { ascending: true }),
      serviceClient.from('results').select('*'),
      serviceClient.from('sessions').select('*'),
      serviceClient.from('players').select('team_id, name'),
    ])

    if (teamsRes.error) throw teamsRes.error
    if (resultsRes.error) throw resultsRes.error
    if (sessionsRes.error) throw sessionsRes.error

    const resultsMap = new Map((resultsRes.data || []).map((r) => [r.team_id, r]))
    const sessionsMap = new Map((sessionsRes.data || []).map((s) => [s.id, s]))

    // Count players
    const playersCountMap = new Map<string, number>()
    for (const p of playersRes.data || []) {
      playersCountMap.set(p.team_id, (playersCountMap.get(p.team_id) || 0) + 1)
    }

    const officialCodes = new Set(DEFAULT_TEAMS.map((d) => d.code))
    const officialTeams = (teamsRes.data || []).filter((t) => officialCodes.has(t.code))

    const enriched = officialTeams
      .map((team) => {
        const result = resultsMap.get(team.id)
        const session = team.session_id ? sessionsMap.get(team.session_id) : null
        const startTime = team.started_at ? new Date(team.started_at) : new Date()
        const endTime = team.finished_at ? new Date(team.finished_at) : new Date()
        const timeElapsed = Math.round(
          (endTime.getTime() - startTime.getTime()) / 1000
        )

        return {
          ...team,
          score: result?.total_score || session?.score || 0,
          timeElapsed,
          moralChoice: result?.moral_choice || undefined,
          playersCount: playersCountMap.get(team.id) || 0,
          accuracy: session?.evidence_unlocked?.length
            ? `${Math.round((session.evidence_unlocked.length / 6) * 100)}%`
            : '0%',
        }
      })
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ results: enriched })
  } catch (error) {
    console.error('Error a /api/master/results:', error)
    return NextResponse.json(
      { error: 'Error intern carregant resultats' },
      { status: 500 }
    )
  }
}
