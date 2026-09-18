import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Test endpoint: Simulates 4 players joining and initializing coartada
 * Usage: POST /api/test/init-coartada-test
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[TEST] Starting 4-player coartada initialization test...')

    const serviceClient = getServiceRoleClient()

    // Create test team
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .insert({
        code: `TEST${Date.now().toString().slice(-6)}`,
        name: 'Test Team 4 Players',
        variant: 'A',
      })
      .select('id, code')
      .single()

    if (teamError || !team) {
      console.error('[TEST] Failed to create team:', teamError)
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
    }

    const teamId = team.id
    console.log(`[TEST] Created team: ${teamId}`)

    // Create 4 players
    const playerIds: string[] = []
    for (let i = 0; i < 4; i++) {
      const { data: player, error: playerError } = await serviceClient
        .from('players')
        .insert({
          team_id: teamId,
          user_id: `test-user-${i}-${Date.now()}`,
          name: `Test Player ${i + 1}`,
          player_index: i,
        })
        .select('id')
        .single()

      if (playerError || !player) {
        console.error(`[TEST] Failed to create player ${i}:`, playerError)
        return NextResponse.json({ error: `Failed to create player ${i}` }, { status: 500 })
      }

      playerIds.push(player.id)
      console.log(`[TEST] Created player ${i}: ${player.id}`)
    }

    // Initialize coartada for team
    console.log(`[TEST] Calling init-coartada for team ${teamId}...`)
    const initResponse = await fetch('http://localhost:3000/api/game/init-coartada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    })

    const initData = await initResponse.json()
    console.log(`[TEST] Init response:`, initData)

    if (!initResponse.ok) {
      console.error('[TEST] Init coartada failed:', initData)
      return NextResponse.json(
        { error: 'Init coartada failed', details: initData },
        { status: 500 }
      )
    }

    // Verify frases were assigned
    const { data: frases, error: frasesError } = await serviceClient
      .from('player_coartada_frases')
      .select('player_index, frase_number, frase_content')
      .eq('team_id', teamId)
      .order('player_index', { ascending: true })

    if (frasesError) {
      console.error('[TEST] Failed to fetch frases:', frasesError)
      return NextResponse.json({ error: 'Failed to fetch frases' }, { status: 500 })
    }

    console.log('[TEST] Assigned frases:')
    frases?.forEach(f => {
      console.log(`  Player ${f.player_index}: frase #${f.frase_number} = "${f.frase_content}"`)
    })

    return NextResponse.json(
      {
        success: true,
        teamId,
        teamCode: team.code,
        playersCreated: 4,
        coartadaType: initData.coartadaType,
        playersAssigned: initData.playersAssigned,
        frases: frases?.map(f => ({
          player: f.player_index,
          fraseNumber: f.frase_number,
          content: f.frase_content,
        })),
        logs: 'Check server console for detailed logs',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[TEST] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    )
  }
}
