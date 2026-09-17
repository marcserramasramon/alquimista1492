import 'server-only'

import { getServiceRoleClient, supabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Validation schema for coartada request
 * teamId: optional - if provided, validates player belongs to this team
 * fraseNumber: optional specific frase number (1-8), else returns all
 */
const GetCoartadaSchema = z.object({
  teamId: z.string().uuid('Invalid team ID').optional(),
  fraseNumber: z.coerce.number().int().min(1).max(4).optional(),
})

interface CoartadaResponse {
  frases: Array<{
    number: number
    content: string
  }>
}

interface CoartadaSingleResponse {
  frase: string
  index: number
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const teamId = searchParams.get('teamId')
    const fraseNumber = searchParams.get('fraseNumber')

    // Validate query parameters
    const validation = GetCoartadaSchema.safeParse({
      teamId,
      fraseNumber: fraseNumber ? parseInt(fraseNumber, 10) : undefined,
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { teamId: providedTeamId, fraseNumber: validFraseNumber } = validation.data

    // === Step 1: Get current player from auth ===
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceClient = getServiceRoleClient()

    // === Step 2: Get player and their team ===
    const { data: player, error: playerError } = await serviceClient
      .from('players')
      .select('id, team_id, player_index')
      .eq('user_id', user.id)
      .single()

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // === Step 3: Verify team access if teamId was provided ===
    const validTeamId = providedTeamId || player.team_id

    if (providedTeamId && player.team_id !== providedTeamId) {
      return NextResponse.json(
        { error: 'Access denied: player does not belong to this team' },
        { status: 403 }
      )
    }

    // === Step 4: Query coartada frases for this player ===
    let query = serviceClient
      .from('player_coartada_frases')
      .select('frase_number, frase_content')
      .eq('team_id', validTeamId)
      .eq('player_index', player.player_index)

    // Filter by specific frase if provided
    if (validFraseNumber !== undefined) {
      query = query.eq('frase_number', validFraseNumber)
    }

    const { data: frases, error: frasesError } = await query

    if (frasesError) {
      console.error('Failed to fetch coartada frases:', frasesError)
      return NextResponse.json(
        { error: 'Failed to fetch coartada' },
        { status: 500 }
      )
    }

    // === Step 5: Return results ===
    if (!frases || frases.length === 0) {
      return NextResponse.json(
        { error: 'No coartada assigned for this player' },
        { status: 404 }
      )
    }

    // If requesting single frase, return in different format
    if (validFraseNumber !== undefined && frases.length === 1) {
      const frase = frases[0]
      return NextResponse.json(
        {
          frase: frase.frase_content,
          index: frase.frase_number,
        } satisfies CoartadaSingleResponse,
        { status: 200 }
      )
    }

    // Return all frases for player
    return NextResponse.json(
      {
        frases: frases.map(f => ({
          number: f.frase_number,
          content: f.frase_content,
        })),
      } satisfies CoartadaResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('Coartada fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
