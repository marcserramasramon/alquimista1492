import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterToken } from '@/lib/auth/master'
import { getServiceRoleClient } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/master/config'

export async function POST(request: NextRequest) {
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
    const body = await request.json().catch(() => ({}))
    const durationMinutes = Number(body.durationMinutes) || 90

    const now = new Date()
    const nowIso = now.toISOString()
    const expiresAtIso = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString()

    // 2. Process each of the 8 default teams
    for (const defTeam of DEFAULT_TEAMS) {
      const { data: team } = await serviceClient
        .from('teams')
        .select('*')
        .eq('code', defTeam.code)
        .maybeSingle()

      if (!team) {
        // Create new session
        const { data: newSession } = await serviceClient
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
            started_at: nowIso,
            expires_at: expiresAtIso,
          })
          .select('id')
          .single()

        if (newSession) {
          await serviceClient.from('teams').insert({
            code: defTeam.code,
            name: defTeam.name,
            color: defTeam.color,
            variant: defTeam.variant,
            is_active: true,
            started_at: nowIso,
            finished_at: null,
            session_id: newSession.id,
          })
        }
      } else {
        // Reset existing team
        // A. Remove previous players from this team
        await serviceClient.from('players').delete().eq('team_id', team.id)

        // B. Remove previous results
        await serviceClient.from('results').delete().eq('team_id', team.id)

        // C. Clean team_stations if exists
        try {
          await serviceClient.from('team_stations').delete().eq('team_id', team.id)
        } catch {
          // Ignore if table does not exist or empty
        }

        // D. Reset or create associated session
        if (team.session_id) {
          await serviceClient
            .from('sessions')
            .update({
              current_act: 1,
              current_station: null,
              solved_stations: [],
              code_digits: ['', '', '', ''],
              evidence_unlocked: [],
              suspects_dismissed: [],
              salconduits_remaining: 3,
              salconduits_used: [],
              started_at: nowIso,
              expires_at: expiresAtIso,
            })
            .eq('id', team.session_id)
        } else {
          const { data: newSession } = await serviceClient
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
              started_at: nowIso,
              expires_at: expiresAtIso,
            })
            .select('id')
            .single()

          if (newSession) {
            await serviceClient
              .from('teams')
              .update({ session_id: newSession.id })
              .eq('id', team.id)
          }
        }

        // E. Update team status
        await serviceClient
          .from('teams')
          .update({
            name: defTeam.name,
            color: defTeam.color,
            variant: defTeam.variant,
            is_active: true,
            started_at: nowIso,
            finished_at: null,
          })
          .eq('id', team.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Partida reiniciada amb èxit per als 8 equips',
      startedAt: nowIso,
      expiresAt: expiresAtIso,
      durationMinutes,
    })
  } catch (error) {
    console.error('Error a /api/master/reset:', error)
    return NextResponse.json(
      { error: 'Error intern reiniciant la partida' },
      { status: 500 }
    )
  }
}
