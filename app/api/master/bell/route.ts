import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterToken } from '@/lib/auth/master'
import { getServiceRoleClient } from '@/lib/db'

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

    const { data: config } = await serviceClient
      .from('game_config')
      .select('status, started_at, expires_at')
      .eq('id', 1)
      .maybeSingle()

    if (!config || config.status === 'pending') {
      return NextResponse.json(
        { error: 'La partida encara no ha començat' },
        { status: 409 }
      )
    }

    const now = new Date()
    let newExpiresAtIso: string
    let newStatus = config.status

    if (triggerNow) {
      // Sound the bell immediately and lock the game — this cannot be
      // undone by simply adding minutes back.
      newExpiresAtIso = now.toISOString()
      newStatus = 'finished'
    } else if (setExpiresAt) {
      newExpiresAtIso = new Date(setExpiresAt).toISOString()
    } else if (setDurationMinutes) {
      const baseTime = config.started_at ? new Date(config.started_at) : now
      newExpiresAtIso = new Date(baseTime.getTime() + Number(setDurationMinutes) * 60 * 1000).toISOString()
    } else if (addMinutes) {
      const currentExpiry = config.expires_at
        ? new Date(config.expires_at)
        : new Date(now.getTime() + 90 * 60 * 1000)

      newExpiresAtIso = new Date(currentExpiry.getTime() + Number(addMinutes) * 60 * 1000).toISOString()
    } else {
      return NextResponse.json({ error: 'Paràmetres invàlids' }, { status: 400 })
    }

    await serviceClient
      .from('game_config')
      .update({
        status: newStatus,
        expires_at: newExpiresAtIso,
        updated_at: now.toISOString(),
      })
      .eq('id', 1)

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
