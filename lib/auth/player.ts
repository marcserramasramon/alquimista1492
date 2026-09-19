// Player authentication
// Handles anonymous player signup and team joining

import { supabase, getServiceRoleClient } from '@/lib/db'

export interface PlayerSignupResult {
  sessionId: string
  teamId: string
  playerId: string
  sessionToken?: string
  authSession?: any
}

export interface PlayerSignupError {
  code: string
  message: string
}

/**
 * Sign up a player and join a team
 * @param teamCode - 6-character team code from QR
 * @param playerName - Player name
 * @returns Session info or error
 */
export async function signInAsPlayer(
  teamCode: string,
  playerName: string
): Promise<PlayerSignupResult | PlayerSignupError> {
  try {
    // Validate inputs
    if (!teamCode || teamCode.length !== 6) {
      return {
        code: 'INVALID_CODE',
        message: 'Invalid team code format'
      }
    }

    const trimmedName = playerName.trim()
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 30) {
      return {
        code: 'INVALID_NAME',
        message: 'Player name must be between 2 and 30 characters'
      }
    }

    const serviceClient = getServiceRoleClient()

    // Check if team exists and is active
    const { data: team, error: teamError } = await serviceClient
      .from('teams')
      .select('id, variant, is_active, session_id')
      .eq('code', teamCode.toUpperCase())
      .single()

    if (teamError || !team) {
      return {
        code: 'TEAM_NOT_FOUND',
        message: 'Team code not found'
      }
    }

    if (!team.is_active) {
      return {
        code: 'TEAM_INACTIVE',
        message: 'Team session has ended'
      }
    }

    if (!team.id) {
      return {
        code: 'INVALID_TEAM',
        message: 'Invalid team'
      }
    }

    // Create player auth user with confirmed email (avoids SMTP rate limits and works reliably)
    const email = `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`
    const password = `PlayerPass_${Math.random().toString(36).slice(-8)}!`

    const { data: createData, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !createData.user) {
      console.error('Failed to create player auth user:', createError)
      return {
        code: 'AUTH_FAILED',
        message: 'Failed to create user session'
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.session) {
      console.error('Failed to sign in player auth user:', authError)
      return {
        code: 'AUTH_FAILED',
        message: 'Failed to sign in user session'
      }
    }

    const userId = createData.user.id

    // Get current player count for this team
    const { data: existingPlayers } = await serviceClient
      .from('players')
      .select('player_index')
      .eq('team_id', team.id)
      .order('player_index', { ascending: false })
      .limit(1)

    const playerIndex = (existingPlayers?.[0]?.player_index ?? -1) + 1

    // Insert player record
    const { data: player, error: playerError } = await serviceClient
      .from('players')
      .insert({
        team_id: team.id,
        user_id: userId,
        name: trimmedName,
        player_index: playerIndex,
      })
      .select()
      .single()

    if (playerError || !player) {
      return {
        code: 'PLAYER_INSERT_FAILED',
        message: 'Failed to create player record'
      }
    }

    let sessionId: string

    if (team.session_id) {
      // Team already has a session
      sessionId = team.session_id
    } else {
      // Create new session
      const { data: session, error: sessionError } = await serviceClient
        .from('sessions')
        .insert({
          current_act: 1,
          current_station: null,
          solved_stations: [],
          code_digits: ['', '', '', ''],
          evidence_unlocked: [],
          suspects_dismissed: [],
          salconduits_remaining: 2,
          salconduits_used: [],
        })
        .select()
        .single()

      if (sessionError || !session?.id) {
        return {
          code: 'SESSION_CREATE_FAILED',
          message: 'Failed to create game session'
        }
      }

      // Update team with the new session_id
      const { error: updateError } = await serviceClient
        .from('teams')
        .update({ session_id: session.id })
        .eq('id', team.id)

      if (updateError) {
        return {
          code: 'SESSION_UPDATE_FAILED',
          message: 'Failed to link session to team'
        }
      }

      sessionId = session.id
    }

    return {
      sessionId,
      teamId: team.id,
      playerId: player.id,
      authSession: authData.session,
    }
  } catch (error) {
    console.error('Player signup error:', error)
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred'
    }
  }
}

/**
 * Get current player info
 */
export async function getCurrentPlayer() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('players')
    .select('*, teams(id, code, variant), sessions(*)')
    .eq('user_id', user.id)
    .single()

  return data
}
