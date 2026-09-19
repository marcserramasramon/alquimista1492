import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { getServiceRoleClient } from '@/lib/db'
import { getTeamCorrectSeal } from '@/content/public/seals'

/**
 * GET /api/emissari/validate-letter?teamCode=EQUIP1
 * Retorna les dades necessàries perquè l'Emissari pugui validar la carta:
 * - Equip
 * - Contrasenya requerida ("L'alba ve de Vic")
 * - Segell de Bernat assignat
 * - Estat de validació de la carta
 * - Si ja s'ha aplicat la penalització de -10 punts per error de contrasenya
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamCode = searchParams.get('teamCode')?.trim().toUpperCase()

    if (!teamCode) {
      return NextResponse.json({ error: 'Cal especificar el codi d\'equip' }, { status: 400 })
    }

    const serviceClient = getServiceRoleClient()

    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, code, name, color, variant, session_id')
      .eq('code', teamCode)
      .maybeSingle()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Equip no trobat' }, { status: 404 })
    }

    // Comprovar si ja té l'evidència de carta_lliurada
    const { data: evidence } = await serviceClient
      .from('team_evidences')
      .select('id')
      .eq('team_id', team.id)
      .eq('evidence_id', 'carta_lliurada')
      .maybeSingle()

    // Comprovar si ja té penalització de contrasenya
    const { data: penalty } = await serviceClient
      .from('score_events')
      .select('id')
      .eq('team_id', team.id)
      .eq('event_type', 'emissari_password_penalty')
      .maybeSingle()

    const expectedSeal = getTeamCorrectSeal(team)

    return NextResponse.json({
      teamId: team.id,
      teamCode: team.code,
      teamName: team.name,
      teamColor: team.color,
      password: "L'alba ve de Vic",
      expectedSeal: {
        number: expectedSeal.number,
        label: expectedSeal.label,
        subtitle: expectedSeal.subtitle,
        heraldry: expectedSeal.heraldry,
        image: expectedSeal.image,
      },
      isLetterValidated: !!evidence,
      hasPasswordPenalty: !!penalty,
    })
  } catch (error) {
    console.error('Error a GET /api/emissari/validate-letter:', error)
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 })
  }
}

/**
 * POST /api/emissari/validate-letter
 * Body: { teamCode: string, action: 'accept' | 'penalize' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const teamCode = body.teamCode?.trim().toUpperCase()
    const action = body.action as 'accept' | 'penalize' | 'reject'

    if (!teamCode || !['accept', 'penalize', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Paràmetres incorrectes' }, { status: 400 })
    }

    const serviceClient = getServiceRoleClient()

    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, code, name, session_id')
      .eq('code', teamCode)
      .maybeSingle()

    if (teamError || !team) {
      return NextResponse.json({ error: 'Equip no trobat' }, { status: 404 })
    }

    if (action === 'accept') {
      // Inserir carta_lliurada a team_evidences
      await serviceClient.from('team_evidences').upsert(
        {
          team_id: team.id,
          evidence_id: 'carta_lliurada',
        },
        { onConflict: 'team_id,evidence_id', ignoreDuplicates: true }
      )

      // Actualitzar evidence_unlocked a la sessió si existeix
      if (team.session_id) {
        const { data: session } = await serviceClient
          .from('sessions')
          .select('evidence_unlocked')
          .eq('id', team.session_id)
          .maybeSingle()

        if (session) {
          const currentEvidences: string[] = session.evidence_unlocked || []
          if (!currentEvidences.includes('carta_lliurada')) {
            await serviceClient
              .from('sessions')
              .update({
                evidence_unlocked: [...currentEvidences, 'carta_lliurada'],
              })
              .eq('id', team.session_id)
          }
        }
      }

      return NextResponse.json({
        success: true,
        action: 'accept',
        message: 'Carta acceptada! L\'Emissari s\'aparta i marxa cap a Vic. S\'ha desbloquejat la Decisió Moral.',
      })
    } else if (action === 'penalize') {
      // Comprovar si ja s'ha penalitzat prèviament
      const { data: existingPenalty } = await serviceClient
        .from('score_events')
        .select('id')
        .eq('team_id', team.id)
        .eq('event_type', 'emissari_password_penalty')
        .maybeSingle()

      if (existingPenalty) {
        return NextResponse.json({
          success: true,
          action: 'penalize',
          alreadyPenalized: true,
          hasPasswordPenalty: true,
          message: 'Aquest equip ja ha estat penalitzat anteriorment (-10 punts). Poden seguir intentant dir la contrasenya sense més penalitzacions.',
        })
      }

      // Inserir registre de penalització de -10 punts a score_events
      await serviceClient.from('score_events').insert({
        team_id: team.id,
        points: -10,
        event_type: 'emissari_password_penalty',
        details: {
          station_id: 'pla_de_masset',
          reason: 'error_contrasenya_emissari',
        },
      })

      // Restar 10 punts al marcador global de la sessió si existeix
      if (team.session_id) {
        const { data: session } = await serviceClient
          .from('sessions')
          .select('score')
          .eq('id', team.session_id)
          .maybeSingle()

        if (session) {
          const newScore = Math.max(0, (session.score ?? 0) - 10)
          await serviceClient
            .from('sessions')
            .update({ score: newScore })
            .eq('id', team.session_id)
        }
      }

      return NextResponse.json({
        success: true,
        action: 'penalize',
        penalized: true,
        hasPasswordPenalty: true,
        message: 'S\'han restat -10 punts a l\'equip per error en la contrasenya. Ara poden intentar-ho de nou tantes vegades com calgui sense més penalitzacions.',
      })
    } else {
      // Rebuig simple sense penalització (compatibilitat)
      return NextResponse.json({
        success: true,
        action: 'reject',
        message: 'Contrasenya no acceptada. Els jugadors poden provar de nou.',
      })
    }
  } catch (error) {
    console.error('Error a POST /api/emissari/validate-letter:', error)
    return NextResponse.json({ error: 'Error intern del servidor' }, { status: 500 })
  }
}
