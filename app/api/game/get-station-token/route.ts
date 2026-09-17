import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const GetTokenSchema = z.object({
  stationId: z.string().min(1),
  teamId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = GetTokenSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          code: 'INVALID_REQUEST',
          message: 'Invalid request format',
        },
        { status: 400 }
      )
    }

    const { stationId, teamId } = validation.data
    const serviceClient = getServiceRoleClient()

    // Find active pass for this station and team
    const { data: pass, error: passError } = await serviceClient
      .from('passes')
      .select('pass_token, expires_at')
      .eq('station_id', stationId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (passError || !pass) {
      return NextResponse.json(
        {
          code: 'NO_PASS_FOUND',
          message: 'No active pass found for this station',
        },
        { status: 404 }
      )
    }

    // Check if token is expired
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

    return NextResponse.json(
      {
        token: pass.pass_token,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get token error:', error)
    return NextResponse.json(
      {
        code: 'ERROR',
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
