import 'server-only'

import { getServiceRoleClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const DismissSuspectSchema = z.object({
  teamId: z.string().uuid(),
  suspectId: z.string().min(1),
  dismissed: z.boolean(),
})

/**
 * Marca (o desmarca) un sospitós com a descartat pel Quadern de l'equip.
 * Es guarda a `sessions.suspects_dismissed`, visible en temps real a tots
 * els mòbils de l'equip.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = DismissSuspectSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { teamId, suspectId, dismissed } = validation.data
    const serviceClient = getServiceRoleClient()

    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, session_id')
      .eq('id', teamId)
      .single()

    if (teamError || !team?.session_id) {
      return NextResponse.json({ error: 'Team or session not found' }, { status: 404 })
    }

    const { data: session, error: sessionError } = await serviceClient
      .from('sessions')
      .select('suspects_dismissed')
      .eq('id', team.session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const current = session.suspects_dismissed || []
    const nextList = dismissed
      ? Array.from(new Set([...current, suspectId]))
      : current.filter((id: string) => id !== suspectId)

    const { error: updateError } = await serviceClient
      .from('sessions')
      .update({ suspects_dismissed: nextList })
      .eq('id', team.session_id)

    if (updateError) {
      console.error('Failed to update suspects_dismissed:', updateError)
      return NextResponse.json({ error: 'Failed to update suspects' }, { status: 500 })
    }

    return NextResponse.json({ success: true, suspectsDismissed: nextList })
  } catch (error) {
    console.error('Dismiss suspect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
