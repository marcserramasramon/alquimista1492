import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const ConfiscateSchema = z.object({
  teamCode: z.string().min(1),
  action: z.enum(['confiscate', 'restore']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = ConfiscateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { teamCode, action } = validation.data
    const serviceClient = getServiceRoleClient()

    // 1. Buscar equip pel codi
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, name, code, session_id')
      .eq('code', teamCode.toUpperCase())
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: `Equip amb codi "${teamCode}" no trobat` }, { status: 404 })
    }

    if (!team.session_id) {
      return NextResponse.json({ error: 'Aquest equip no té una sessió activa vinculada' }, { status: 400 })
    }

    // 2. Obtenir sessió de l'equip
    const { data: session, error: sessionError } = await serviceClient
      .from('sessions')
      .select('id, salconduits_remaining, salconduits_used')
      .eq('id', team.session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sessió no trobada' }, { status: 404 })
    }

    const currentSalvos = session.salconduits_remaining ?? 2
    let newCount = currentSalvos

    if (action === 'confiscate') {
      newCount = Math.max(0, currentSalvos - 1)
    } else if (action === 'restore') {
      newCount = Math.min(2, currentSalvos + 1)
    }

    // 3. Actualitzar sessió
    const { error: updateError } = await serviceClient
      .from('sessions')
      .update({ salconduits_remaining: newCount })
      .eq('id', session.id)

    if (updateError) {
      console.error('Error updating salconduits:', updateError)
      return NextResponse.json({ error: 'Error actualitzant salconduits' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action,
      teamCode: team.code,
      teamName: team.name,
      salconduitsRemaining: newCount,
    })
  } catch (err) {
    console.error('Confiscate endpoint error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
