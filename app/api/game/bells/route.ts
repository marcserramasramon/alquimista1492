import 'server-only'

import { getServiceRoleClient, supabase } from '@/lib/db'
import { GAME_SOLUTIONS } from '@/content/private/game-solutions'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Bells (Sometent) Game API
 *
 * Flow:
 * 1. Client sends moral decision (A/B)
 * 2. Server generates or retrieves the team's bell sequence (0-3, length 8)
 * 3. Client plays back the sequence
 * 4. Server validates the sequence and awards points
 * 5. Returns epilogue text (A vs B) + decision percentage
 */

const BellsValidationSchema = z.object({
  moralChoice: z.enum(['A', 'B']),
  bellSequence: z.array(z.number().int().min(0).max(3)).length(8).optional(),
})

interface BellsGameState {
  sequence: number[]
  moralChoice: 'A' | 'B'
  sequenceSubmitted: boolean
  sequenceCorrect: boolean
}

/**
 * Generate a random sequence of 8 bells (0-3)
 */
function generateBellSequence(): number[] {
  const sequence: number[] = []
  for (let i = 0; i < 8; i++) {
    sequence.push(Math.floor(Math.random() * 4))
  }
  return sequence
}

/**
 * Validate a bell sequence against the expected sequence
 */
function validateBellSequence(
  userSequence: number[],
  expectedSequence: number[]
): boolean {
  if (userSequence.length !== expectedSequence.length) {
    return false
  }

  return userSequence.every((bell, index) => bell === expectedSequence[index])
}

/**
 * Calculate decision statistics from all teams in the session
 */
async function getDecisionPercentage(
  serviceClient: any,
  sessionId: string
): Promise<{ optionA: number; optionB: number }> {
  // Get all teams in this session
  const { data: teams } = await serviceClient
    .from('teams')
    .select('id')
    .eq('session_id', sessionId)

  if (!teams || teams.length === 0) {
    return { optionA: 50, optionB: 50 }
  }

  const teamIds = teams.map((t: any) => t.id)

  // Get all moral decision events for these teams
  const { data: decisionEvents } = await serviceClient
    .from('score_events')
    .select('details, team_id')
    .in('team_id', teamIds)
    .eq('event_type', 'bells_moral_decision')

  if (!decisionEvents || decisionEvents.length === 0) {
    return { optionA: 50, optionB: 50 }
  }

  const decisions = decisionEvents
    .map((e: any) => e.details?.moralChoice)
    .filter(Boolean)

  if (decisions.length === 0) {
    return { optionA: 50, optionB: 50 }
  }

  const countA = decisions.filter((d: string) => d === 'A').length
  const countB = decisions.filter((d: string) => d === 'B').length
  const total = countA + countB

  return {
    optionA: Math.round((countA / total) * 100),
    optionB: Math.round((countB / total) * 100),
  }
}

/**
 * Get epilogue text based on moral choice
 */
function getEpilogue(choice: 'A' | 'B'): string {
  if (choice === 'A') {
    return `Bernat i Jaume es reuniren a l'estiu.
No tornaren mai més a la Guixa.

Però els conjurats van salvos.`
  } else {
    return `Jaume surt de presó tardor.
Busca el seu pare a l'escola.
No el troba.

Els conjurats es salvaren.
Però al preu de la familia de Bernat.`
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = BellsValidationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { moralChoice, bellSequence } = validation.data
    const serviceClient = getServiceRoleClient()

    // Get current player from auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // In development or preview without auth, return mock response
      const mockSequence = generateBellSequence()
      const mockCorrect = bellSequence
        ? validateBellSequence(bellSequence, mockSequence)
        : false

      return NextResponse.json(
        {
          success: mockCorrect,
          message: mockCorrect
            ? 'Campanades correctes! Sometent sonat.'
            : 'Campanades incorrectes. Reprova.',
          sequence: mockSequence,
          reward: mockCorrect ? 100 : 0,
          epilogue: getEpilogue(moralChoice),
          decisionPercentage: { optionA: 55, optionB: 45 },
        },
        { status: 200 }
      )
    }

    // Get player and their team/session
    const { data: player } = await serviceClient
      .from('players')
      .select('id, team_id')
      .eq('user_id', user.id)
      .single()

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const { data: team } = await serviceClient
      .from('teams')
      .select('id, session_id')
      .eq('id', player.team_id)
      .single()

    if (!team || !team.session_id) {
      return NextResponse.json({ error: 'Team or session not found' }, { status: 404 })
    }

    const { data: session } = await serviceClient
      .from('sessions')
      .select('id, score')
      .eq('id', team.session_id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if this team already has a generated bell sequence
    // Retrieve from score_events with event_type 'bells_sequence_generated'
    const { data: sequenceEvents } = await serviceClient
      .from('score_events')
      .select('details')
      .eq('team_id', player.team_id)
      .eq('event_type', 'bells_sequence_generated')
      .order('created_at', { ascending: false })
      .limit(1)

    let bellSequenceData: number[] = []

    if (!sequenceEvents || sequenceEvents.length === 0) {
      // First time this team is playing bells - generate sequence
      bellSequenceData = generateBellSequence()

      // Store the generated sequence in score_events for later retrieval
      await serviceClient.from('score_events').insert({
        team_id: player.team_id,
        points: 0,
        event_type: 'bells_sequence_generated',
        details: {
          sequence: bellSequenceData,
        },
      })

      // Create team_stations entry to track progress
      await serviceClient.from('team_stations').insert({
        team_id: player.team_id,
        station_id: 'bells_sometent',
        solved: false,
        attempts: 0,
      })
    } else {
      // Retrieve existing sequence
      bellSequenceData = (sequenceEvents[0].details as any)?.sequence || generateBellSequence()
    }

    // Validate the bell sequence if provided
    let isCorrect = false
    let message = ''

    if (bellSequence && bellSequence.length === 4) {
      // Validate against the first 4 bells of the sequence
      isCorrect = bellSequence.every((bell, idx) => bell === bellSequenceData[idx])
      message = isCorrect
        ? 'Campanades correctes! Sometent sonat.'
        : 'Campanades incorrectes. Reprova.'
    } else if (bellSequence && bellSequence.length === 8) {
      // Also support full 8-bell validation for backwards compatibility
      isCorrect = validateBellSequence(bellSequence, bellSequenceData)
      message = isCorrect
        ? 'Campanades correctes! Sometent sonat.'
        : 'Campanades incorrectes. Reprova.'
    } else if (!bellSequence) {
      // First call: just return the sequence to be played
      message = 'Seqüència de campanades generada.'
    } else {
      message = 'Seqüència invàlida.'
    }

    // Record the attempt if sequence was submitted
    if (bellSequence) {
      await serviceClient.from('attempts').insert({
        session_id: session.id,
        station_id: 'bells_sometent',
        answer: JSON.stringify(bellSequence),
        is_correct: isCorrect,
        status: isCorrect ? 'correct' : 'incorrect',
        attempt_number: 1,
      })
    }

    // Award points and mark as solved on correct answer
    let scoreReward = 0
    if (isCorrect) {
      scoreReward = 100

      // Mark as solved
      const { data: existingStation } = await serviceClient
        .from('team_stations')
        .select('id')
        .eq('team_id', player.team_id)
        .eq('station_id', 'bells_sometent')
        .single()

      if (existingStation) {
        await serviceClient
          .from('team_stations')
          .update({
            solved: true,
            solved_at: new Date().toISOString(),
          })
          .eq('id', existingStation.id)
      }

      // Insert score event for bells completion
      await serviceClient.from('score_events').insert({
        team_id: player.team_id,
        points: scoreReward,
        event_type: 'station_puzzle',
        details: {
          station_id: 'bells_sometent',
          moralChoice: moralChoice,
        },
      })

      // Insert separate event for moral decision tracking
      await serviceClient.from('score_events').insert({
        team_id: player.team_id,
        points: 0,
        event_type: 'bells_moral_decision',
        details: {
          moralChoice: moralChoice,
        },
      })

      // Update session score
      const newScore = (session.score ?? 0) + scoreReward
      await serviceClient.from('sessions').update({ score: newScore }).eq('id', session.id)

      // Unlock final decision evidence
      await serviceClient.from('team_evidences').insert({
        team_id: player.team_id,
        evidence_id: 'decision_final',
      })
    }

    // Get decision statistics for this session
    const decisionPercentage = await getDecisionPercentage(serviceClient, session.id)

    return NextResponse.json(
      {
        success: isCorrect,
        message,
        sequence: bellSequenceData,
        reward: scoreReward,
        epilogue: getEpilogue(moralChoice),
        decisionPercentage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Bells game validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
