// @ts-nocheck
// TypeScript errors in this file are expected and will be resolved after:
// 1. Supabase project is created
// 2. supabase gen types is run to generate lib/db.types.ts with correct schema
// This temporary suppression allows compilation during development phase.

// POST /api/game/validate-answer
// Validate player answer against solutions (server-only)
// Uses service role to access solutions_private table

import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ValidateAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  stationId: z.string(),
  answer: z.unknown(), // Can be string, number, object depending on game type
})

interface ValidateAnswerResponse {
  correct: boolean
  message: string
  digit?: number
  evidence?: string[]
  suspectsDismissed?: string[]
  scoreBonus?: number
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

    // Get service role client (has access to solutions_private)
    const serviceClient = getServiceRoleClient()

    // Get the session and its variant
    const { data: session, error: sessionError } = await serviceClient
      .from('sessions')
      .select('id, team_id, code_digits')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get team variant
    const { data: team } = await serviceClient
      .from('teams')
      .select('variant')
      .eq('id', session.team_id)
      .single()

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // CRITICAL: Load solution using service role (anon users cannot access)
    const { data: solutions, error: solutionError } = await serviceClient
      .from('solutions_private')
      .select('solution, hints')
      .eq('station_id', stationId)
      .eq('variant', team.variant)
      .single()

    if (solutionError || !solutions) {
      return NextResponse.json(
        { error: 'Solution not configured for station' },
        { status: 500 }
      )
    }

    // Parse solution (structure depends on game type)
    const solution = solutions.solution as Record<string, any>

    // Validate answer (this is a basic check - actual validation depends on game type)
    const correct = String(answer).toUpperCase() === String(solution.answer).toUpperCase()

    // Record attempt
    const { data: attempt } = await serviceClient
      .from('attempts')
      .select('attempt_number')
      .eq('session_id', sessionId)
      .eq('station_id', stationId)
      .order('attempt_number', { ascending: false })
      .limit(1)
      .single()

    const attemptNumber = (attempt?.attempt_number ?? 0) + 1

    const { error: insertError } = await serviceClient
      .from('attempts')
      .insert({
        session_id: sessionId,
        station_id: stationId,
        attempt_number: attemptNumber,
        answer: String(answer),
        is_correct: correct,
        status: correct ? 'correct' : 'incorrect',
      })

    if (insertError) {
      console.error('Failed to insert attempt:', insertError)
      return NextResponse.json(
        { error: 'Failed to record attempt' },
        { status: 500 }
      )
    }

    // Prepare response
    const response: ValidateAnswerResponse = {
      correct,
      message: correct
        ? 'Resposta correcta!'
        : 'Resposta incorrecta. Torna-ho a intentar.',
      digit: solution.digit,
      evidence: solution.evidence ? [solution.evidence] : undefined,
      suspectsDismissed: solution.suspects_dismissed || undefined,
      scoreBonus: correct ? 100 : -10,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
