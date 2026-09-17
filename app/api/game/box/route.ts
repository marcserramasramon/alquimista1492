import 'server-only'

import { getServiceRoleClient, supabase } from '@/lib/db'
import { GAME_SOLUTIONS } from '@/content/private/game-solutions'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const BoxValidationSchema = z.object({
  part: z.enum(['1', '2', '3']),
  answer: z.union([z.string(), z.object({})]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = BoxValidationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { part, answer } = validation.data
    const serviceClient = getServiceRoleClient()

    // Get current player from auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // In development or preview without auth, validate against game solutions
      const boxSolutions = GAME_SOLUTIONS.caixa_almoines as any
      let isCorrect = false
      let message = ''
      let penalty = 0

      if (part === '1') {
        const normalized = (answer as string).replace(/[\s-]/g, '')
        isCorrect = normalized === boxSolutions.part1.answer
        if (!isCorrect) {
          message = 'Contrasenya incorrecta. Recorda els 4 elements: FOC(4) AIGUA(2) TERRA(3) PEDRA(1)'
          penalty = -10
        } else {
          message = 'Caixa oberta! Continua a la Part 2.'
        }
      } else if (part === '2') {
        const submitted = (answer as string).trim()
        isCorrect = submitted === boxSolutions.part2.answer
        if (!isCorrect) {
          message = 'Data incorrecta. Busca la carta amb data 16-05-1705'
          penalty = -120
        } else {
          message = 'Carta correcta substituïda! Continua a la Part 3.'
        }
      } else if (part === '3') {
        // Part 3: Validate seal (answer is the seal id: 'bernat', 'anton', 'jaume', 'capitan')
        const submitted = (answer as string).trim()
        isCorrect = submitted === boxSolutions.part3.answer
        if (!isCorrect) {
          message = 'Segell incorrecte. El segell de Bernat és el correcte.'
          penalty = -60
        } else {
          message = 'Carta segellada correctament! Prova superada.'
        }
      }

      return NextResponse.json(
        {
          success: isCorrect,
          message,
          reward: isCorrect ? 100 : 0,
          penalty,
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

    const boxSolutions = GAME_SOLUTIONS.caixa_almoines as any

    let isCorrect = false
    let message = ''
    let penalty = 0

    // Validate each part
    if (part === '1') {
      const normalized = (answer as string).replace(/[\s-]/g, '')
      isCorrect = normalized === boxSolutions.part1.answer

      if (!isCorrect) {
        message = 'Contrasenya incorrecta. Recorda els 4 elements: FOC(4) AIGUA(2) TERRA(3) PEDRA(1)'
        penalty = -10
      } else {
        message = 'Caixa oberta! Continua a la Part 2.'
      }
    } else if (part === '2') {
      const submitted = (answer as string).trim()
      isCorrect = submitted === boxSolutions.part2.answer

      if (!isCorrect) {
        message = 'Data incorrecta. Busca la carta amb data 16-05-1705'
        penalty = -120 // −2 minuts
      } else {
        message = 'Carta correcta substituda! Continua a la Part 3.'
      }
    } else if (part === '3') {
      // Part 3: Validate seal (answer is the seal id)
      const submitted = (answer as string).trim()
      isCorrect = submitted === boxSolutions.part3.answer
      if (!isCorrect) {
        message = 'Segell incorrecte. El segell de Bernat és el correcte.'
        penalty = -60
      } else {
        message = 'Carta segellada correctament! Prova superada.'
      }
    }

    // Record attempt
    await serviceClient.from('attempts').insert({
      session_id: session.id,
      station_id: `box_part_${part}`,
      answer: JSON.stringify(answer),
      is_correct: isCorrect,
      status: isCorrect ? 'correct' : 'incorrect',
      attempt_number: 1,
    })

    // Award points on correct answer
    let scoreReward = 0
    if (isCorrect) {
      scoreReward = 100

      // Part 2: Insert carta_falsa evidence when part 2 is solved correctly
      if (part === '2') {
        await serviceClient.from('team_evidence').insert({
          team_id: player.team_id,
          evidence_id: 'carta_falsa',
          discovered_at: new Date().toISOString(),
        })
      }

      // Mark as solved on final part (part 3)
      if (part === '3') {
        const { data: teamStation } = await serviceClient
          .from('team_stations')
          .select('id')
          .eq('team_id', player.team_id)
          .eq('station_id', 'caixa_almoines')
          .single()

        if (teamStation) {
          await serviceClient
            .from('team_stations')
            .update({
              solved: true,
              solved_at: new Date().toISOString(),
            })
            .eq('id', teamStation.id)
        } else {
          await serviceClient.from('team_stations').insert({
            team_id: player.team_id,
            station_id: 'caixa_almoines',
            solved: true,
            solved_at: new Date().toISOString(),
          })
        }
      }

      // Insert score event
      await serviceClient.from('score_events').insert({
        team_id: player.team_id,
        points: scoreReward,
        event_type: 'station_puzzle_part',
        details: {
          station_id: 'caixa_almoines',
          part: part,
        },
      })

      // Update session score
      const newScore = (session.score ?? 0) + scoreReward
      await serviceClient.from('sessions').update({ score: newScore }).eq('id', session.id)
    }

    return NextResponse.json(
      {
        success: isCorrect,
        message,
        reward: scoreReward,
        penalty,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Box validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
