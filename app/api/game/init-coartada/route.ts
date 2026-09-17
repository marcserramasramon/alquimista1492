import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { COARTADAS, selectRandomCoartada, type CoartadaType } from '@/content/private/coartadas'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Validation schema for init coartada request
 */
const InitCoartadaSchema = z.object({
  teamId: z.string().uuid('Invalid team ID'),
})

interface InitCoartadaResponse {
  success: boolean
  coartadaType: CoartadaType
  playersAssigned: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = InitCoartadaSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { teamId } = validation.data
    const serviceClient = getServiceRoleClient()

    // === Step 1: Check if team exists and get basic info ===
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      console.error('Team not found:', teamError)
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 403 }
      )
    }

    // === Step 2: Check if team already has coartada assigned ===
    const { data: existingCoartada, error: existingError } = await serviceClient
      .from('team_coartadas')
      .select('id')
      .eq('team_id', teamId)
      .single()

    if (!existingError && existingCoartada) {
      console.log(`Coartada already assigned for team ${teamId}`)
      return NextResponse.json(
        { error: 'Coartada already assigned for this team' },
        { status: 409 }
      )
    }

    // === Step 3: Select random coartada ===
    const selectedCoartada = selectRandomCoartada()
    const coartadaType = selectedCoartada.type

    // Find the key (A, B, C, D, E) of the selected coartada for storage
    let coartadaId = 'A'
    for (const [key, coartada] of Object.entries(COARTADAS)) {
      if (coartada.type === coartadaType) {
        coartadaId = key
        break
      }
    }

    console.log(`Selected coartada: ${coartadaId} (type: ${coartadaType})`)

    // === Step 4: Get number of players in team ===
    const { data: players, error: playersError } = await serviceClient
      .from('players')
      .select('id, player_index')
      .eq('team_id', teamId)
      .order('player_index', { ascending: true })

    if (playersError || !players) {
      console.error('Failed to fetch players:', playersError)
      return NextResponse.json(
        { error: 'Failed to fetch team players' },
        { status: 500 }
      )
    }

    const playerCount = players.length

    if (playerCount === 0) {
      console.error('Team has no players')
      return NextResponse.json(
        { error: 'Team has no players' },
        { status: 400 }
      )
    }

    console.log(`Team has ${playerCount} players`)

    // === Step 5: Assign frases to players (for 4 players as per spec) ===
    // For 4 players, assignment is: Player 0 → frase 1, Player 1 → frase 2, etc.
    // The spec says frases are 1-indexed in display but we store 0-indexed
    const fraseAssignments: Array<{ playerIndex: number; fraseIndex: number }> = []

    if (playerCount === 4) {
      // Direct mapping: Player 0 → frase index 0, Player 1 → frase index 1, etc.
      for (let i = 0; i < 4; i++) {
        fraseAssignments.push({ playerIndex: i, fraseIndex: i })
      }
    } else {
      // For other player counts, cycle through frases
      for (let i = 0; i < playerCount; i++) {
        fraseAssignments.push({ playerIndex: i, fraseIndex: i % 4 })
      }
    }

    console.log(`Frase assignments:`, fraseAssignments)

    // === Step 6: Save to team_coartadas table ===
    const { error: teamCoartadaError } = await serviceClient
      .from('team_coartadas')
      .insert({
        team_id: teamId,
        coartada_id: coartadaId,
        assigned_at: new Date().toISOString(),
      })

    if (teamCoartadaError) {
      console.error('Failed to insert team coartada:', teamCoartadaError)
      return NextResponse.json(
        { error: 'Failed to save coartada assignment' },
        { status: 500 }
      )
    }

    console.log(`Saved team_coartadas entry for team ${teamId}`)

    // === Step 7: Save each frase to player_coartada_frases table ===
    const fraseInserts = fraseAssignments.map(assignment => {
      const fraseContent = selectedCoartada.frases[assignment.fraseIndex]
      return {
        team_id: teamId,
        player_index: assignment.playerIndex,
        frase_number: assignment.fraseIndex + 1, // Store 1-indexed
        frase_content: fraseContent,
        created_at: new Date().toISOString(),
      }
    })

    const { error: frasesError } = await serviceClient
      .from('player_coartada_frases')
      .insert(fraseInserts)

    if (frasesError) {
      console.error('Failed to insert player coartada frases:', frasesError)
      return NextResponse.json(
        { error: 'Failed to save player frases' },
        { status: 500 }
      )
    }

    console.log(`Saved ${fraseInserts.length} frase assignments for team ${teamId}`)

    // === Step 8: Return response ===
    return NextResponse.json(
      {
        success: true,
        coartadaType,
        playersAssigned: playerCount,
      } satisfies InitCoartadaResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('Init coartada error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
