import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Validation schema for answer submission
 * Answer can be: string, number, or complex object depending on game type
 */
const ValidateAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  stationId: z.string().min(1),
  answer: z.unknown(),
})

interface ValidateAnswerResponse {
  success: boolean
  message: string
  reward: number
}

/**
 * Type-safe comparison function for different answer types
 */
function compareAnswers(
  submitted: unknown,
  expected: unknown,
  stationType: string
): boolean {
  // Unwrap object payload if simple field provided
  if (typeof submitted === 'object' && submitted !== null) {
    const obj = submitted as Record<string, unknown>
    if ('date' in obj && (typeof obj.date === 'string' || typeof obj.date === 'number')) {
      submitted = String(obj.date)
    } else if ('answer' in obj && (typeof obj.answer === 'string' || typeof obj.answer === 'number')) {
      submitted = String(obj.answer)
    }
  }

  // Coerce number and string for simple comparisons
  if (typeof submitted === 'number' && typeof expected === 'string') {
    submitted = String(submitted)
  } else if (typeof submitted === 'string' && typeof expected === 'number') {
    expected = String(expected)
  }

  // String comparison (most common)
  if (typeof submitted === 'string' && typeof expected === 'string') {
    const subClean = submitted.toUpperCase().trim().replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    const expClean = expected.toUpperCase().trim().replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (subClean === expClean) return true

    const subCompact = subClean.replace(/\s+/g, '')
    const expCompact = expClean.replace(/\s+/g, '')
    if (subCompact === expCompact) return true

    // Variants especials de Serrat
    if (stationType.includes('serrat')) {
      if (
        subClean === 'SAP LLETRA' ||
        subClean === 'SAP DE LLETRA' ||
        subClean === 'SAP DE LETRA' ||
        subClean === 'SAP LETRA' ||
        subClean === 'SAB DE LLETRA' ||
        subClean === 'SAB LLETRA' ||
        subCompact === 'SAPDELLETRA' ||
        subCompact === 'SAPLLETRA' ||
        (subCompact.includes('SAP') && (subCompact.includes('LLETRA') || subCompact.includes('LETRA')))
      ) {
        return true
      }
    }

    // Variants especials de Font del Ferro (dia 12)
    if (stationType.includes('font') || stationType.includes('ferro')) {
      if (
        subClean === '12' ||
        subClean === '12 DE MAIG' ||
        subClean === '12 MAIG' ||
        subClean === 'DIA 12' ||
        subClean === 'DIA 12 DE MAIG' ||
        subClean === 'EL 12' ||
        subClean === 'DOTZE' ||
        subCompact === '12' ||
        subCompact === '12DEMAIG' ||
        subCompact === 'DIA12'
      ) {
        return true
      }
    }

    return false
  }

  // Number comparison
  if (typeof submitted === 'number' && typeof expected === 'number') {
    return submitted === expected
  }

  // Object comparison for complex answers
  if (
    typeof submitted === 'object' &&
    submitted !== null &&
    typeof expected === 'object' &&
    expected !== null
  ) {
    // Handle PlaneBonesGame answer: { visitedCells, totalMinutes }
    if ('visitedCells' in submitted || 'totalMinutes' in submitted) {
      const sub = submitted as Record<string, unknown>
      const exp = expected as Record<string, unknown>
      // Compare time-based answer (convert both to comparable format)
      if ('time' in exp && 'totalMinutes' in sub) {
        const submittedTime = sub.totalMinutes as number
        const expectedTime = exp.time as number
        // Allow ±5 minute tolerance
        return Math.abs(submittedTime - expectedTime) <= 5
      }
    }

    // Handle ControlGame answer: { type, timestamp }
    if ('type' in submitted) {
      const sub = submitted as Record<string, unknown>
      const exp = expected as Record<string, unknown>
      return sub.type === exp.type
    }

    // Handle AccusationGame answer: { suspect, evidence }
    if ('suspect' in submitted && 'evidence' in submitted) {
      const sub = submitted as Record<string, unknown>
      const exp = expected as Record<string, unknown>

      // Check suspect match
      if (sub.suspect !== exp.traitor) {
        return false
      }

      // Check if evidence array has minimum required pieces
      const evidence = sub.evidence as unknown[]
      const minEvidence = (exp.minEvidence as number) || 1
      return evidence && evidence.length >= minEvidence
    }

    // Default: deep equality for other object types
    return JSON.stringify(submitted) === JSON.stringify(expected)
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const validation = ValidateAnswerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { sessionId, stationId, answer } = validation.data
    const serviceClient = getServiceRoleClient()

    // === Step 1: Get session and find associated team ===
    const { data: session, error: sessionError } = await serviceClient
      .from('sessions')
      .select('id, score')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Find the team for this session
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, variant')
      .eq('session_id', sessionId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // === Step 2: Rate limiting - max 1 attempt per 3 seconds per team+station ===
    const { data: lastAttempt } = await serviceClient
      .from('attempts')
      .select('timestamp')
      .eq('session_id', sessionId)
      .eq('station_id', stationId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (lastAttempt?.timestamp) {
      const lastAttemptTime = new Date(lastAttempt.timestamp).getTime()
      const currentTime = new Date().getTime()
      const timeSinceLastAttempt = (currentTime - lastAttemptTime) / 1000

      if (timeSinceLastAttempt < 3) {
        return NextResponse.json(
          {
            success: false,
            message: `Massa ràpid. Espera ${Math.ceil(3 - timeSinceLastAttempt)} segons.`,
            reward: 0,
          },
          { status: 429 }
        )
      }
    }

    // === Step 3: Fetch solution from database (server-only access) ===
    const { data: solution, error: solutionError } = await serviceClient
      .from('solutions_private')
      .select('solution')
      .eq('station_id', stationId)
      .eq('variant', team.variant)
      .single()

    if (solutionError || !solution) {
      return NextResponse.json(
        { error: 'Solution not configured for station' },
        { status: 500 }
      )
    }

    const solutionData = solution.solution as Record<string, unknown>

    // === Step 4: Compare answer with solution ===
    const isCorrect = compareAnswers(answer, solutionData.answer, stationId)

    // === Step 5: Record attempt ===
    // Convert answer to string for storage
    let answerString: string
    if (typeof answer === 'string') {
      answerString = answer
    } else if (typeof answer === 'number') {
      answerString = String(answer)
    } else {
      answerString = JSON.stringify(answer)
    }

    const { error: attemptError } = await serviceClient
      .from('attempts')
      .insert({
        session_id: sessionId,
        station_id: stationId,
        answer: answerString,
        is_correct: isCorrect,
        status: isCorrect ? 'correct' : 'incorrect',
        attempt_number: 1, // Will be incremented by trigger if needed
      })

    if (attemptError) {
      console.error('Failed to insert attempt:', attemptError)
      return NextResponse.json(
        { error: 'Failed to record attempt' },
        { status: 500 }
      )
    }

    let scoreReward = 0
    let responseMessage = isCorrect
      ? 'Resposta correcta!'
      : 'Resposta incorrecta. Torna-ho a intentar.'

    // === Step 6: On correct answer, update game state ===
    if (isCorrect) {
      scoreReward = 100

      // Update team_stations: mark as solved
      const { data: teamStation } = await serviceClient
        .from('team_stations')
        .select('id')
        .eq('team_id', team.id)
        .eq('station_id', stationId)
        .single()

      if (teamStation) {
        await serviceClient
          .from('team_stations')
          .update({
            solved: true,
            solved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', teamStation.id)
      } else {
        // Create team_station entry if it doesn't exist
        await serviceClient.from('team_stations').insert({
          team_id: team.id,
          station_id: stationId,
          solved: true,
          solved_at: new Date().toISOString(),
        })
      }

      // Insert score event (audit trail)
      await serviceClient.from('score_events').insert({
        team_id: team.id,
        points: scoreReward,
        event_type: 'station_solved',
        details: {
          station_id: stationId,
          answer_type: typeof answer,
        },
      })

      // Update session score
      const newScore = (session.score ?? 0) + scoreReward
      await serviceClient
        .from('sessions')
        .update({ score: newScore })
        .eq('id', sessionId)
    }

    // === Step 7: Return response ===
    return NextResponse.json(
      {
        success: isCorrect,
        message: responseMessage,
        reward: scoreReward,
      } satisfies ValidateAnswerResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
