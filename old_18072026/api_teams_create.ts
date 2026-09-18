// POST /api/teams/create
// Create a new team for a master session

import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateTeamSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  teamName: z.string().min(2).max(30),
})

function generateTeamCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = CreateTeamSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { sessionId, teamName } = validation.data

    // Get service role client
    const serviceClient = getServiceRoleClient()

    // Verify master session exists
    const { data: masterSession, error: sessionError } = await serviceClient
      .from('master_sessions')
      .select('id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !masterSession) {
      return NextResponse.json(
        { error: 'Master session not found' },
        { status: 404 }
      )
    }

    // Generate unique team code
    let teamCode: string
    let codeExists = true
    let attempts = 0
    const maxAttempts = 10

    while (codeExists && attempts < maxAttempts) {
      teamCode = generateTeamCode()
      const { data: existingTeam } = await serviceClient
        .from('teams')
        .select('id')
        .eq('code', teamCode)
        .single()

      codeExists = !!existingTeam
      attempts++
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Failed to generate unique team code' },
        { status: 500 }
      )
    }

    // Create team
    const { data: team, error: insertError } = await serviceClient
      .from('teams')
      .insert({
        code: teamCode!,
        name: teamName,
        master_session_id: sessionId,
      })
      .select('code')
      .single()

    if (insertError || !team) {
      console.error('Failed to create team:', insertError)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }

    return NextResponse.json({ code: team.code }, { status: 201 })
  } catch (error) {
    console.error('Team creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
