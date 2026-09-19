import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { getGameClock, isGameOver } from '@/lib/scoring/gameClock'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getStation } from '@/content/public/stations'

const ValidatePassSchema = z.object({
  token: z.string().min(1),
  teamId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = ValidatePassSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'INVALID_REQUEST',
          message: 'Invalid request format',
        },
        { status: 400 }
      )
    }

    const { token } = validation.data
    let requestedTeamId = validation.data.teamId || null

    // === Step 0: The game clock is authoritative — no station is
    // reachable once it is over, regardless of what the client believes ===
    const clock = await getGameClock()
    if (isGameOver(clock)) {
      return NextResponse.json(
        {
          code: 'GAME_OVER',
          message: 'La partida ha acabat',
        },
        { status: 403 }
      )
    }

    const serviceClient = getServiceRoleClient()

    // === Step 1: Find pass by token OR check if token is a station ID ===
    const { data: pass } = await serviceClient
      .from('passes')
      .select('id, team_id, used_at, expires_at, used_on_station_id, station_id')
      .eq('pass_token', token)
      .maybeSingle()

    let stationId: string | null = null
    let teamId: string | null = requestedTeamId

    if (pass) {
      // Validate token not expired
      if (pass.expires_at) {
        const expiresAt = new Date(pass.expires_at)
        const now = new Date()
        if (now > expiresAt) {
          return NextResponse.json(
            {
              code: 'TOKEN_EXPIRED',
              message: 'Station token has expired',
            },
            { status: 410 }
          )
        }
      }

      // Validate token not already used
      if (pass.used_at) {
        return NextResponse.json(
          {
            code: 'ALREADY_SOLVED',
            message: 'This station has already been solved',
          },
          { status: 403 }
        )
      }

      stationId = pass.station_id
      if (!teamId) {
        teamId = pass.team_id
      }
    } else {
      // Token is a direct physical station QR token (e.g. 'serrat-bruixes', 'st-serrat-bruixes', 'caixa-almoines', etc.)
      const cleanToken = token.replace(/^st-/, '').trim()
      const matchedStation = getStation(cleanToken)
      if (matchedStation) {
        stationId = matchedStation.id
      }
    }

    if (!stationId) {
      return NextResponse.json(
        {
          code: 'INVALID_TOKEN',
          message: 'Station token not found',
        },
        { status: 404 }
      )
    }

    // === Step 5: Get team and session info ===
    let team: any = null

    if (teamId) {
      const { data: foundTeam } = await serviceClient
        .from('teams')
        .select('id, session_id, variant, code')
        .eq('id', teamId)
        .maybeSingle()
      team = foundTeam
    }

    // If no team found yet, try finding the first active team with a session
    if (!team) {
      const { data: activeTeam } = await serviceClient
        .from('teams')
        .select('id, session_id, variant, code')
        .eq('is_active', true)
        .not('session_id', 'is', null)
        .limit(1)
        .maybeSingle()
      team = activeTeam
    }

    if (!team || !team.session_id) {
      return NextResponse.json(
        {
          code: 'TEAM_NOT_FOUND',
          message: 'Team or session not found. Uneix-te primer a un equip.',
        },
        { status: 404 }
      )
    }

    // === Step 6: Get session info ===
    const { data: session, error: sessionError } = await serviceClient
      .from('sessions')
      .select('id, score, solved_stations, evidence_unlocked')
      .eq('id', team.session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found',
        },
        { status: 404 }
      )
    }

    // === Step 7: Load public station content ===
    // Safe team metadata passed to games
    const content: Record<string, unknown> = {
      code: team.code,
      teamCode: team.code,
      variant: team.variant,
      id: team.id,
      teamId: team.id,
    }

    // === Step 7: Get team_stations record to check current state ===
    const { data: teamStation } = await serviceClient
      .from('team_stations')
      .select('solved, attempts, solved_at')
      .eq('team_id', team.id)
      .eq('station_id', stationId)
      .single()

    // === Step 8: Return safe data to client ===
    return NextResponse.json(
      {
        stationId,
        sessionId: session.id,
        teamId: team.id,
        variant: team.variant,
        content,
        sharedState: {
          score: session.score,
          solvedStations: session.solved_stations || [],
          evidenceUnlocked: session.evidence_unlocked || [],
          attempts: teamStation?.attempts || 0,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Pass validation error:', error)
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
