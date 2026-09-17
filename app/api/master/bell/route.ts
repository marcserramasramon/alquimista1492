import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterToken } from '@/lib/auth/master'
import { getServiceRoleClient } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/master/config'

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('master_token')?.value ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    if (!token) {
      return NextResponse.json({ error: 'No autenticat com a Màster' }, { status: 401 })
    }

    try {
      await verifyMasterToken(token)
    } catch {
      return NextResponse.json({ error: 'Sessió de Màster invàlida o expirada' }, { status: 401 })
    }

    const serviceClient = getServiceRoleClient()
    const body = await request.json().catch(() => ({}))

    const { addMinutes, triggerNow, setExpiresAt, setDurationMinutes } = body

    // 1. Get current sessions of official teams
    const officialCodes = DEFAULT_TEAMS.map((d) => d.code)
    const { data: teams } = await serviceClient
      .from('teams')
      .select('id, code, session_id, started_at')
      .in('code', officialCodes)

    const sessionIds = (teams || []).map((t) => t.session_id).filter(Boolean) as string[]
    if (sessionIds.length === 0) {
      return NextResponse.json({ error: 'No hi ha sessions actives dels equips' }, { status: 404 })
    }

    const { data: currentSessions } = await serviceClient
      .from('sessions')
      .select('id, started_at, expires_at')
      .in('id', sessionIds)

    const now = new Date()
    let newExpiresAtIso: string

    if (triggerNow) {
      // Sound bell immediately!
      newExpiresAtIso = now.toISOString()
    } else if (setExpiresAt) {
      newExpiresAtIso = new Date(setExpiresAt).toISOString()
    } else if (setDurationMinutes) {
      const baseTime = teams?.[0]?.started_at ? new Date(teams[0].started_at) : now
      newExpiresAtIso = new Date(baseTime.getTime() + Number(setDurationMinutes) * 60 * 1000).toISOString()
    } else if (addMinutes) {
      // Add or subtract minutes from current expiry
      const currentExpiry = currentSessions?.[0]?.expires_at
        ? new Date(currentSessions[0].expires_at)
        : new Date(now.getTime() + 90 * 60 * 1000)

      newExpiresAtIso = new Date(currentExpiry.getTime() + Number(addMinutes) * 60 * 1000).toISOString()
    } else {
      return NextResponse.json({ error: 'Paràmetres invàlids' }, { status: 400 })
    }

    // Update all sessions
    await serviceClient
      .from('sessions')
      .update({ expires_at: newExpiresAtIso })
      .in('id', sessionIds)

    return NextResponse.json({
      success: true,
      message: triggerNow
        ? 'Campana activada immediatament!'
        : 'Hora de la campana actualitzada',
      expiresAt: newExpiresAtIso,
    })
  } catch (error) {
    console.error('Error a /api/master/bell:', error)
    return NextResponse.json(
      { error: 'Error intern configurant la campana' },
      { status: 500 }
    )
  }
}
