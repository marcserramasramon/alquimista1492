import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { getGameClock, isGameOver } from '@/lib/scoring/gameClock'
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
 * Proves que desbloqueja cada fita en resoldre-la correctament.
 * IDs segons content/public/evidence.ts (veure content/private/evidence-mapping.ts
 * per a l'origen narratiu de cada prova).
 */
const STATION_EVIDENCE: Record<string, string[]> = {
  'serrat': ['literacy'],
  'serrat-bruixes': ['literacy'],
  'serrat_bruixes': ['literacy'],
  'font_ferro': ['cantirs', 'ink'],
  'font-ferro': ['cantirs', 'ink'],
  'planes_bones': ['light'],
  'planes-bones': ['light'],
  'cementiri': ['seal', 'filigrana'],
  'pla-masset': ['declaratio_anton', 'caligraphia'],
  'pla_masset': ['declaratio_anton', 'caligraphia'],
  'pla-masset-accusation': ['declaratio_anton', 'caligraphia'],
  'acusacio': ['declaratio_anton', 'caligraphia'],
  'caixa-almoines': ['nota_capita', 'carta_falsa'],
  'caixa_almoines': ['nota_capita', 'carta_falsa'],
  'rectoria-caixa': ['nota_capita', 'carta_falsa'],
  'rectoria': ['nota_capita', 'carta_falsa'],
}

const CANONICAL_STATION_IDS: Record<string, string> = {
  'serrat': 'serrat-bruixes',
  'serrat_bruixes': 'serrat-bruixes',
  'serrat-bruixes': 'serrat-bruixes',
  'font_ferro': 'font-ferro',
  'font-ferro': 'font-ferro',
  'planes_bones': 'planes-bones',
  'planes-bones': 'planes-bones',
  'cementiri': 'cementiri',
  'pla-masset': 'pla-masset-accusation',
  'pla_masset': 'pla-masset-accusation',
  'pla-masset-control': 'pla-masset-control',
  'pla-masset-accusation': 'pla-masset-accusation',
  'acusacio': 'pla-masset-accusation',
  'caixa-almoines': 'rectoria-caixa',
  'caixa_almoines': 'rectoria-caixa',
  'rectoria-caixa': 'rectoria-caixa',
  'rectoria': 'rectoria-caixa',
  'campanar': 'campanar-sometent',
  'bells-sometent': 'campanar-sometent',
  'bells_sometent': 'campanar-sometent',
  'sometent-campanar': 'campanar-sometent',
  'campanar-sometent': 'campanar-sometent',
}

interface ComparisonResult {
  isCorrect: boolean
  isGiro?: boolean
}

/**
 * Type-safe comparison function for different answer types
 */
function compareAnswers(
  submitted: unknown,
  solutionData: Record<string, unknown>,
  stationType: string
): ComparisonResult {
  const expected = solutionData.answer

  // Special handling for AccusationGame: { suspect, evidence }
  if (
    typeof submitted === 'object' &&
    submitted !== null &&
    'suspect' in submitted
  ) {
    const sub = submitted as { suspect: string; evidence?: unknown[] }
    // If player accuses Anton -> triggers narrative giro
    if (sub.suspect === 'anton') {
      return { isCorrect: true, isGiro: true }
    }

    // Traitor is Bernat
    const traitor = (solutionData.traitor as string) || (typeof expected === 'string' ? expected : 'bernat')
    if (sub.suspect === traitor || sub.suspect === 'bernat') {
      const evidence = sub.evidence || []
      const minEvidence = (solutionData.minEvidence as number) || 3
      if (evidence.length >= minEvidence) {
        return { isCorrect: true, isGiro: false }
      }
    }
    return { isCorrect: false }
  }

  // Unwrap object payload if simple field provided
  let normalizedSubmitted = submitted
  if (typeof normalizedSubmitted === 'object' && normalizedSubmitted !== null) {
    const obj = normalizedSubmitted as Record<string, unknown>
    if ('lapidaId' in obj || 'lapisaId' in obj) {
      normalizedSubmitted = String(obj.lapidaId || obj.lapisaId)
    } else if ('date' in obj && (typeof obj.date === 'string' || typeof obj.date === 'number')) {
      normalizedSubmitted = String(obj.date)
    } else if ('location' in obj && typeof obj.location === 'string') {
      normalizedSubmitted = String(obj.location)
    } else if ('destination' in obj && typeof obj.destination === 'string') {
      normalizedSubmitted = String(obj.destination)
    } else if ('code' in obj && (typeof obj.code === 'string' || typeof obj.code === 'number')) {
      normalizedSubmitted = String(obj.code)
    } else if ('key' in obj && (typeof obj.key === 'string' || typeof obj.key === 'number')) {
      normalizedSubmitted = String(obj.key)
    } else if ('qr' in obj && typeof obj.qr === 'string') {
      normalizedSubmitted = String(obj.qr)
    } else if ('answer' in obj && (typeof obj.answer === 'string' || typeof obj.answer === 'number')) {
      normalizedSubmitted = String(obj.answer)
    }
  }

  // Coerce number and string for simple comparisons
  let normExpected = expected
  if (typeof normalizedSubmitted === 'number' && typeof normExpected === 'string') {
    normalizedSubmitted = String(normalizedSubmitted)
  } else if (typeof normalizedSubmitted === 'string' && typeof normExpected === 'number') {
    normExpected = String(normExpected)
  }

  // Cementiri specific comparisons
  if (stationType.includes('cementiri')) {
    const sStr = String(normalizedSubmitted).toUpperCase().trim()
    if (
      sStr === '1' ||
      sStr === 'CORMINAS' ||
      sStr === 'JOSEPH COROMINES' ||
      sStr === 'COROMINES' ||
      sStr === 'LAPIDA 1' ||
      sStr.replace(/\s+/g, '') === '1' ||
      sStr.replace(/\s+/g, '') === 'CORMINAS' ||
      sStr.replace(/\s+/g, '') === 'JOSEPHCOROMINES'
    ) {
      return { isCorrect: true }
    }
  }

  // Font del Ferro specific comparisons — el dia correcte depèn de la
  // variant de l'equip (12/11/13), mai s'accepten els altres dies.
  if (stationType.includes('font') || stationType.includes('ferro')) {
    const sStr = String(normalizedSubmitted).toUpperCase().trim()
    const expDay = solutionData.day ? String(solutionData.day) : null
    if (expDay && (sStr === expDay || sStr.includes(`DIA ${expDay}`) || sStr === `${expDay} DE MAIG` || sStr === `${expDay} MAIG`)) {
      return { isCorrect: true }
    }
  }

  // String comparison (most common)
  if (typeof normalizedSubmitted === 'string' && typeof normExpected === 'string') {
    const subClean = normalizedSubmitted.toUpperCase().trim().replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    const expClean = normExpected.toUpperCase().trim().replace(/[.,;:!?'"`·\-]/g, ' ').replace(/\s+/g, ' ').trim()
    if (subClean === expClean) return { isCorrect: true }

    const subCompact = subClean.replace(/\s+/g, '')
    const expCompact = expClean.replace(/\s+/g, '')
    if (subCompact === expCompact) return { isCorrect: true }

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
        return { isCorrect: true }
      }
    }

    // Variants especials de Planes Bones (La Clau de la Forja a Can Vinyals / Joan i Pere / Farga)
    if (stationType.includes('plane') || stationType.includes('bones')) {
      if (
        subCompact.includes('CLAU') ||
        subCompact.includes('FORJA') ||
        subCompact.includes('CANVINYALS') ||
        subCompact.includes('PEDRAVINYALS') ||
        subCompact.includes('NOGUERA') ||
        subCompact.includes('NOGUERES') ||
        subClean === 'CLAU FORJA' ||
        subClean === 'CLAU DE LA FORJA' ||
        subClean === 'CLAU DE FORJA' ||
        subClean === 'LA CLAU' ||
        subClean === 'CAN VINYALS' ||
        subClean === 'PEDRA GRAN' ||
        subClean === 'JOAN I PERE' ||
        subClean === 'PERE I JOAN' ||
        subClean === 'JOAN I PERE DEL MOLI' ||
        subClean === 'JOAN PERE' ||
        subClean === 'PERE JOAN' ||
        subClean === 'JOAN, PERE' ||
        subClean === 'PERE, JOAN' ||
        (subClean.includes('JOAN') && subClean.includes('PERE')) ||
        subClean === 'FARGA' ||
        subClean === 'LA FARGA' ||
        subClean === '3' ||
        subClean === 'CASELLA 3' ||
        subClean === '23:00' ||
        subClean === '23' ||
        subClean === '60' ||
        subClean === '60 MIN' ||
        subCompact === 'FARGA' ||
        subCompact === 'LAFARGA' ||
        subCompact.includes('FARGA') ||
        (subCompact.includes('JOAN') && subCompact.includes('PERE'))
      ) {
        return { isCorrect: true }
      }
    }

    return { isCorrect: false }
  }

  // Number comparison
  if (typeof normalizedSubmitted === 'number' && typeof normExpected === 'number') {
    return { isCorrect: normalizedSubmitted === normExpected }
  }

  // Object comparison for complex answers
  if (
    typeof normalizedSubmitted === 'object' &&
    normalizedSubmitted !== null &&
    typeof normExpected === 'object' &&
    normExpected !== null
  ) {
    // Handle PlaneBonesGame answer: { visitedCells, totalMinutes }
    if ('visitedCells' in normalizedSubmitted || 'totalMinutes' in normalizedSubmitted) {
      const sub = normalizedSubmitted as Record<string, unknown>
      const exp = normExpected as Record<string, unknown>
      // Compare time-based answer (convert both to comparable format)
      if ('time' in exp && 'totalMinutes' in sub) {
        const submittedTime = sub.totalMinutes as number
        const expectedTime = exp.time as number
        // Allow ±5 minute tolerance
        return { isCorrect: Math.abs(submittedTime - expectedTime) <= 5 }
      }

      // Check if arrived at Farga (id 3)
      if (Array.isArray(sub.visitedCells)) {
        const last = sub.visitedCells[sub.visitedCells.length - 1]
        if (last === 3 || last === '3' || sub.visitedCells.includes(3)) {
          return { isCorrect: true }
        }
      }
    }

    // Handle ControlGame answer: { type, timestamp }
    if ('type' in normalizedSubmitted) {
      const sub = normalizedSubmitted as Record<string, unknown>
      const exp = normExpected as Record<string, unknown>
      return { isCorrect: sub.type === exp.type }
    }

    // Default: deep equality for other object types
    return { isCorrect: JSON.stringify(normalizedSubmitted) === JSON.stringify(normExpected) }
  }

  return { isCorrect: false }
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

    const clock = await getGameClock()
    if (isGameOver(clock)) {
      return NextResponse.json(
        { success: false, message: 'La partida ha acabat', code: 'GAME_OVER' },
        { status: 403 }
      )
    }

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
    const canonicalStationId = CANONICAL_STATION_IDS[stationId] || stationId
    let { data: solution, error: solutionError } = await serviceClient
      .from('solutions_private')
      .select('solution')
      .eq('station_id', stationId)
      .eq('variant', team.variant)
      .maybeSingle()

    if (!solution && canonicalStationId !== stationId) {
      const retry = await serviceClient
        .from('solutions_private')
        .select('solution')
        .eq('station_id', canonicalStationId)
        .eq('variant', team.variant)
        .maybeSingle()
      solution = retry.data
      solutionError = retry.error
    }

    if (solutionError || !solution) {
      return NextResponse.json(
        { error: 'Solution not configured for station' },
        { status: 500 }
      )
    }

    const solutionData = solution.solution as Record<string, unknown>

    // === Step 4: Compare answer with solution ===
    const comparison = compareAnswers(answer, solutionData, stationId)
    const isCorrect = comparison.isCorrect
    const isGiro = comparison.isGiro ?? false

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

    // Si és el Gir narratiu (acusació de l'Anton)
    if (isGiro) {
      // Desbloqueja la declaració de l'Anton per corroborar que és innocent
      await serviceClient.from('team_evidences').upsert(
        { team_id: team.id, evidence_id: 'declaratio_anton' },
        { onConflict: 'team_id,evidence_id', ignoreDuplicates: true }
      )

      // Penalització de -10 punts per haver-se equivocat d'acusat (Anton és innocent!)
      const suspectName =
        typeof answer === 'object' && answer !== null && 'suspect' in answer
          ? String((answer as Record<string, unknown>).suspect)
          : 'anton'

      await serviceClient.from('score_events').insert({
        team_id: team.id,
        points: -10,
        event_type: 'accusation_wrong_suspect',
        details: {
          station_id: stationId,
          suspect: suspectName,
          reason: 'acusat_erroni_anton',
        },
      })

      const newScore = Math.max(0, (session.score ?? 0) - 10)
      await serviceClient
        .from('sessions')
        .update({ score: newScore })
        .eq('id', sessionId)

      return NextResponse.json({
        success: true,
        isGiro: true,
        message: "L'Anton arriba esbufegant: el mossèn ha estat ferit a la rectoria! Sospitós erroni (-10 punts).",
        reward: -10,
      })
    }

    const isAccusation =
      (typeof answer === 'object' && answer !== null && 'suspect' in answer) ||
      stationId.includes('masset') ||
      stationId.includes('acusacio')

    let scoreReward = 0
    let responseMessage = isCorrect
      ? 'Resposta correcta!'
      : isAccusation
        ? 'Acusació desestimada. Sospitós erroni o proves no concloents (-10 punts).'
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

      // Desbloqueja les proves associades a la fita, perquè apareguin al Quadern
      const evidenceIds = STATION_EVIDENCE[stationId] || STATION_EVIDENCE[canonicalStationId]
      if (evidenceIds) {
        await serviceClient.from('team_evidences').upsert(
          evidenceIds.map((evidenceId) => ({
            team_id: team.id,
            evidence_id: evidenceId,
          })),
          { onConflict: 'team_id,evidence_id', ignoreDuplicates: true }
        )
      }
    } else if (isAccusation) {
      // Penalització de -10 punts per error d'acusació (sospitós erroni o proves no concloents)
      scoreReward = -10

      await serviceClient.from('score_events').insert({
        team_id: team.id,
        points: -10,
        event_type: 'accusation_penalty',
        details: {
          station_id: stationId,
          answer: answerString,
          reason: 'error_acusacio',
        },
      })

      const newScore = Math.max(0, (session.score ?? 0) - 10)
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
