import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ValidatePassSchema = z.object({
  token: z.string().min(1),
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
    const serviceClient = getServiceRoleClient()

    // === Step 1: Find pass by token ===
    const { data: pass, error: passError } = await serviceClient
      .from('passes')
      .select('id, team_id, used_at, expires_at, used_on_station_id, station_id')
      .eq('pass_token', token)
      .single()

    if (passError || !pass) {
      return NextResponse.json(
        {
          code: 'INVALID_TOKEN',
          message: 'Station token not found',
        },
        { status: 404 }
      )
    }

    // === Step 2: Validate token not expired ===
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

    // === Step 3: Validate token not already used ===
    if (pass.used_at) {
      return NextResponse.json(
        {
          code: 'ALREADY_SOLVED',
          message: 'This station has already been solved',
        },
        { status: 403 }
      )
    }

    // === Step 4: Validate station_id exists on the pass ===
    const stationId = pass.station_id
    if (!stationId) {
      return NextResponse.json(
        {
          code: 'STATION_ID_MISSING',
          message: 'Pass does not have a station associated',
        },
        { status: 500 }
      )
    }

    // === Step 5: Get team and session info ===
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, session_id, variant')
      .eq('id', pass.team_id)
      .single()

    if (teamError || !team || !team.session_id) {
      return NextResponse.json(
        {
          code: 'TEAM_NOT_FOUND',
          message: 'Team or session not found',
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
    // For MVP, return empty content object
    // Content should be loaded from content/public/ files
    const content: Record<string, unknown> = {}

    // TODO: Load station content from content/public/stations.json or database

    // === Step 7: Get team_stations record to check current state ===
    const { data: teamStation } = await serviceClient
      .from('team_stations')
      .select('solved, attempts, solved_at')
      .eq('team_id', pass.team_id)
      .eq('station_id', stationId)
      .single()

    // === Step 8: Return safe data to client ===
    return NextResponse.json(
      {
        stationId,
        sessionId: session.id,
        teamId: pass.team_id,
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
