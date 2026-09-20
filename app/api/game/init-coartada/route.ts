import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { assignCoartadaForTeam } from '@/lib/coartada/assign'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Manual/fallback endpoint to (re)assign a team's coartada.
 * Normally coartadas are assigned in bulk from /api/master/start once the
 * game begins and team rosters are final; this exists for cases like a
 * player joining after the game has already started.
 */
const InitCoartadaSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = InitCoartadaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { teamId } = validation.data
    const serviceClient = getServiceRoleClient()

    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 403 })
    }

    const result = await assignCoartadaForTeam(serviceClient, teamId)

    if (result.error) {
      console.error(`Failed to assign coartada for team ${teamId}:`, result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      playersAssigned: result.playersAssigned,
    })
  } catch (error) {
    console.error('Init coartada error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
