import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/db.types'
import { COARTADAS, selectRandomCoartada } from '@/content/private/coartadas'

export interface AssignCoartadaResult {
  teamId: string
  playersAssigned: number
  error?: string
}

/**
 * Assigns a coartada type and its per-player frases to a team.
 * Idempotent: reuses the team's existing coartada type if already picked, and
 * only inserts frases for players who don't have one yet — safe to call again
 * whenever the team's roster grows (e.g. a late-joining player).
 */
export async function assignCoartadaForTeam(
  serviceClient: SupabaseClient<Database>,
  teamId: string
): Promise<AssignCoartadaResult> {
  const { data: players, error: playersError } = await serviceClient
    .from('players')
    .select('player_index')
    .eq('team_id', teamId)
    .order('player_index', { ascending: true })

  if (playersError) {
    return { teamId, playersAssigned: 0, error: playersError.message }
  }

  if (!players || players.length === 0) {
    return { teamId, playersAssigned: 0 }
  }

  // Reuse the team's coartada type if one is already picked, else choose one now
  const { data: existingTeamCoartada } = await serviceClient
    .from('team_coartadas')
    .select('coartada_id')
    .eq('team_id', teamId)
    .maybeSingle()

  let coartadaId = existingTeamCoartada?.coartada_id

  if (!coartadaId) {
    const selected = selectRandomCoartada()
    coartadaId =
      Object.entries(COARTADAS).find(([, coartada]) => coartada.type === selected.type)?.[0] ?? 'A'

    const { error: insertTeamError } = await serviceClient.from('team_coartadas').insert({
      team_id: teamId,
      coartada_id: coartadaId,
      assigned_at: new Date().toISOString(),
    })

    if (insertTeamError) {
      return { teamId, playersAssigned: 0, error: insertTeamError.message }
    }
  }

  const coartada = COARTADAS[coartadaId]
  if (!coartada) {
    return { teamId, playersAssigned: 0, error: `Unknown coartada_id: ${coartadaId}` }
  }

  const { data: existingFrases } = await serviceClient
    .from('player_coartada_frases')
    .select('player_index')
    .eq('team_id', teamId)

  const alreadyAssigned = new Set((existingFrases ?? []).map((f) => f.player_index))

  const missingInserts = players
    .filter((p) => !alreadyAssigned.has(p.player_index))
    .map((p) => ({
      team_id: teamId,
      player_index: p.player_index,
      frase_number: (p.player_index % 4) + 1,
      frase_content: coartada.frases[p.player_index % 4],
      created_at: new Date().toISOString(),
    }))

  if (missingInserts.length > 0) {
    const { error: insertFrasesError } = await serviceClient
      .from('player_coartada_frases')
      .insert(missingInserts)

    if (insertFrasesError) {
      return { teamId, playersAssigned: 0, error: insertFrasesError.message }
    }
  }

  return { teamId, playersAssigned: players.length }
}
