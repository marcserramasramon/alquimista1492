import { NextRequest, NextResponse } from 'next/server'
import { verifyMasterToken } from '@/lib/auth/master'
import { getServiceRoleClient } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/master/config'

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
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

    // 2. Determine duration
    let durationMinutes = Number(body.durationMinutes)
    if (!durationMinutes || isNaN(durationMinutes)) {
      const { data: currentConfig } = await serviceClient
        .from('game_config')
        .select('duration_minutes')
        .eq('id', 1)
        .maybeSingle()
      durationMinutes = currentConfig?.duration_minutes || 90
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const expiresAtIso = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString()

    // 3. Update global game clock — this flips status to 'active'
    // Players' realtime hooks and polling will detect 'pending' -> 'active'
    // and trigger the "La partida ha començat!" popup.
    const { error: configError } = await serviceClient
      .from('game_config')
      .upsert({
        id: 1,
        status: 'active',
        duration_minutes: durationMinutes,
        started_at: nowIso,
        expires_at: expiresAtIso,
        updated_at: nowIso,
      })

    if (configError) {
      throw configError
    }

    // 4. Update all official teams with start timestamp
    const officialCodes = DEFAULT_TEAMS.map((t) => t.code)
    const { data: teams } = await serviceClient
      .from('teams')
      .select('id, session_id')
      .in('code', officialCodes)

    if (teams && teams.length > 0) {
      const teamIds = teams.map((t) => t.id)
      const sessionIds = teams.map((t) => t.session_id).filter(Boolean) as string[]

      await serviceClient
        .from('teams')
        .update({
          started_at: nowIso,
          finished_at: null,
        })
        .in('id', teamIds)

      if (sessionIds.length > 0) {
        await serviceClient
          .from('sessions')
          .update({
            started_at: nowIso,
            expires_at: expiresAtIso,
          })
          .in('id', sessionIds)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Partida iniciada amb èxit! El compte enrere està en marxa.',
      startedAt: nowIso,
      expiresAt: expiresAtIso,
      durationMinutes,
      gameStatus: 'active',
    })
  } catch (error) {
    console.error('Error a /api/master/start:', error)
    return NextResponse.json(
      { error: 'Error intern iniciant la partida' },
      { status: 500 }
    )
  }
}
