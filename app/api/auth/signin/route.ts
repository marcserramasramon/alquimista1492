// POST /api/auth/signin
// Player signup and team joining

import { signInAsPlayer } from '@/lib/auth/player'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const SignInSchema = z.object({
  teamCode: z.string().length(6),
  playerName: z.string().min(1).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = SignInSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const { teamCode, playerName } = validation.data

    // Sign in player
    const result = await signInAsPlayer(teamCode, playerName)

    // Check if error
    if ('code' in result && result.code) {
      const statusCode = result.code === 'TEAM_NOT_FOUND' ? 404 : 400
      return NextResponse.json(result, { status: statusCode })
    }

    // Success
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
