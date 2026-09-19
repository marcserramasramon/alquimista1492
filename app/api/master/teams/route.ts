import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterToken } from '@/lib/auth/master'
import { getServiceRoleClient } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/master/config'

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
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

    // 2. Fetch existing active teams
    const { data: existingTeams, error: teamsError } = await serviceClient
      .from('teams')
      .select('*')
      .order('code', { ascending: true })

    if (teamsError) {
      throw teamsError
    }

    let teamsList = existingTeams || []

    // If fewer than 8 teams exist, auto-seed missing default teams
    const existingCodes = new Set(teamsList.map((t) => t.code))
    const missingTeams = DEFAULT_TEAMS.filter((dt) => !existingCodes.has(dt.code))

    if (missingTeams.length > 0) {
      for (const defTeam of missingTeams) {
        // Create session for the team
        const { data: newSession, error: sErr } = await serviceClient
          .from('sessions')
          .insert({
            current_act: 1,
            current_station: null,
            solved_stations: [],
            code_digits: ['', '', '', ''],
            evidence_unlocked: [],
            suspects_dismissed: [],
            salconduits_remaining: 3,
            salconduits_used: [],
          })
          .select('id')
          .single()

        if (!sErr && newSession) {
          const { data: newTeam } = await serviceClient
            .from('teams')
            .insert({
              code: defTeam.code,
              name: defTeam.name,
              color: defTeam.color,
              variant: defTeam.variant,
              is_active: true,
              session_id: newSession.id,
            })
            .select('*')
            .single()

          if (newTeam) {
            teamsList.push(newTeam)
          }
        }
      }

      // Re-sort after insertion
      teamsList.sort((a, b) => a.code.localeCompare(b.code))
    }

    // Filter to the 8 official teams of the single session
    const officialCodes = new Set(DEFAULT_TEAMS.map((d) => d.code))
    const activeTeams = teamsList
      .filter((t) => officialCodes.has(t.code))
      .sort((a, b) => a.code.localeCompare(b.code))

    // 3. Fetch sessions, results, and player counts
    const sessionIds = activeTeams.map((t) => t.session_id).filter(Boolean) as string[]
    const teamIds = activeTeams.map((t) => t.id)

    const [sessionsRes, resultsRes, playersRes] = await Promise.all([
      sessionIds.length > 0
        ? serviceClient.from('sessions').select('*').in('id', sessionIds)
        : { data: [] },
      teamIds.length > 0
        ? serviceClient.from('results').select('*').in('team_id', teamIds)
        : { data: [] },
      teamIds.length > 0
        ? serviceClient.from('players').select('team_id, name')
        : { data: [] },
    ])

    const sessionsMap = new Map((sessionsRes.data || []).map((s) => [s.id, s]))
    const resultsMap = new Map((resultsRes.data || []).map((r) => [r.team_id, r]))

    // Count players per team
    const playersCountMap = new Map<string, number>()
    const playersNamesMap = new Map<string, string[]>()
    for (const p of playersRes.data || []) {
      const count = playersCountMap.get(p.team_id) || 0
      playersCountMap.set(p.team_id, count + 1)
      const names = playersNamesMap.get(p.team_id) || []
      names.push(p.name)
      playersNamesMap.set(p.team_id, names)
    }

    // Fetch game config to drive single source of truth for countdown and status
    const { data: gameConfig } = await serviceClient
      .from('game_config')
      .select('status, duration_minutes, started_at, expires_at')
      .eq('id', 1)
      .maybeSingle()

    const currentStatus = gameConfig?.status ?? 'pending'
    const sessionStartTime = currentStatus !== 'pending' && gameConfig?.started_at
      ? new Date(gameConfig.started_at)
      : null
    const sessionEndTime = currentStatus !== 'pending' && gameConfig?.expires_at
      ? new Date(gameConfig.expires_at)
      : null

    // 4. Enrich team data
    const now = new Date()
    const enriched = activeTeams.map((team) => {
      const session = team.session_id ? sessionsMap.get(team.session_id) : undefined
      const result = resultsMap.get(team.id)

      let timeElapsed = 0
      if (currentStatus === 'pending') {
        timeElapsed = 0
      } else {
        const teamStart = team.started_at
          ? new Date(team.started_at)
          : sessionStartTime || now

        if (team.finished_at) {
          const finish = new Date(team.finished_at)
          timeElapsed = Math.max(0, Math.round((finish.getTime() - teamStart.getTime()) / 1000))
        } else if (currentStatus === 'finished') {
          const finish = sessionEndTime || now
          timeElapsed = Math.max(0, Math.round((finish.getTime() - teamStart.getTime()) / 1000))
        } else {
          timeElapsed = Math.max(0, Math.round((now.getTime() - teamStart.getTime()) / 1000))
        }
      }

      return {
        ...team,
        score: result?.total_score || session?.score || 0,
        solvedStationsCount: session?.solved_stations?.length || 0,
        timeElapsed,
        moralChoice: result?.moral_choice || null,
        salconduits: session?.salconduits_remaining ?? 3,
        playersCount: playersCountMap.get(team.id) || 0,
        playerNames: playersNamesMap.get(team.id) || [],
      }
    })

    return NextResponse.json({
      teams: enriched,
      sessionStartTime,
      sessionEndTime,
      gameStatus: currentStatus,
      durationMinutes: gameConfig?.duration_minutes ?? 90,
      totalTeams: enriched.length,
    })
  } catch (error) {
    console.error('Error a /api/master/teams:', error)
    return NextResponse.json(
      { error: 'Error intern carregant equips del màster' },
      { status: 500 }
    )
  }
}
