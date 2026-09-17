import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { COARTADAS } from '@/content/private/coartadas'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const teamCode = searchParams.get('teamCode')?.toUpperCase()

    if (!teamCode) {
      return NextResponse.json({ error: 'Codi d\'equip requerit' }, { status: 400 })
    }

    const serviceClient = getServiceRoleClient()

    // 1. Obtenir equip
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, name, code, color, variant, session_id')
      .eq('code', teamCode)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: `Equip "${teamCode}" no trobat` }, { status: 404 })
    }

    // 2. Obtenir sessió
    let salconduitsRemaining = 2
    if (team.session_id) {
      const { data: session } = await serviceClient
        .from('sessions')
        .select('salconduits_remaining')
        .eq('id', team.session_id)
        .single()

      if (session && session.salconduits_remaining !== null) {
        salconduitsRemaining = session.salconduits_remaining
      }
    }

    // 3. Obtenir coartada de l'equip
    const { data: teamCoartada } = await serviceClient
      .from('team_coartadas')
      .select('coartada_id')
      .eq('team_id', team.id)
      .single()

    let coartadaInfo: { type: string; name: string; frases: string[] } | undefined = undefined

    if (teamCoartada && teamCoartada.coartada_id && COARTADAS[teamCoartada.coartada_id]) {
      const c = COARTADAS[teamCoartada.coartada_id]
      coartadaInfo = {
        type: c.type,
        name: `Plantilla ${teamCoartada.coartada_id} (${c.type})`,
        frases: [...c.frases],
      }
    } else {
      // Fallback a plantilla A si encara no s'ha generat
      const c = COARTADAS['A']
      coartadaInfo = {
        type: c.type,
        name: 'Plantilla A (llevadora)',
        frases: [...c.frases],
      }
    }

    return NextResponse.json({
      id: team.id,
      code: team.code,
      name: team.name,
      color: team.color,
      variant: team.variant,
      salconduitsRemaining,
      coartada: coartadaInfo,
    })
  } catch (err) {
    console.error('Emissari team-info error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
