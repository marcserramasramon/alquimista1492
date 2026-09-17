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

    // 4. Enrich team data
    const enriched = activeTeams.map((team) => {
      const session = team.session_id ? sessionsMap.get(team.session_id) : undefined
      const result = resultsMap.get(team.id)
      const startTime = team.started_at ? new Date(team.started_at) : new Date()
      const now = new Date()
      const timeElapsed = Math.round((now.getTime() - startTime.getTime()) / 1000)

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

    // Compute global start/end times if any team is started
    const firstStartedTeam = enriched.find((t) => t.started_at)
    const sessionStartTime = firstStartedTeam?.started_at ? new Date(firstStartedTeam.started_at) : null
    
    // Check if session has a defined expires_at
    const firstSessionWithExpiry = Array.from(sessionsMap.values()).find((s) => s.expires_at)
    const sessionEndTime = firstSessionWithExpiry?.expires_at
      ? new Date(firstSessionWithExpiry.expires_at)
      : sessionStartTime
        ? new Date(sessionStartTime.getTime() + 90 * 60 * 1000)
        : null

    return NextResponse.json({
      teams: enriched,
      sessionStartTime,
      sessionEndTime,
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
