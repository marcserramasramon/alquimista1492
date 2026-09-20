'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db'

export interface SignInError {
  code: string
  message: string
}

export function usePlayerSignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async (teamCode: string, playerName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamCode: teamCode.toUpperCase(),
          playerName: playerName.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()

        // Map error codes to Catalan messages
        let message = 'Error al connectar'
        if (data.code === 'TEAM_NOT_FOUND') {
          message = 'Codi d\'equip no vàlid'
        } else if (data.code === 'TEAM_INACTIVE') {
          message = 'La sessió de l\'equip ha acabat'
        } else if (data.code === 'INVALID_NAME') {
          message = 'El nom del jugador no és vàlid'
        } else if (data.code === 'INVALID_CODE') {
          message = 'El codi d\'equip no és vàlid'
        } else if (data.code === 'TEAM_FULL') {
          message = 'L\'equip està ple'
        } else if (data.message) {
          message = data.message
        }

        setError(message)
        return false
      }

      const data = await response.json()

      if (data.authSession) {
        await supabase.auth.setSession({
          access_token: data.authSession.access_token,
          refresh_token: data.authSession.refresh_token,
        })
      }

      // Coartadas are assigned once the master starts the game (see
      // /api/master/start), once every teammate has had a chance to join.

      // Redirect to game hub on success
      router.push('/joc')
      return true
    } catch (err) {
      console.error('Sign in error:', err)
      setError('Error de connexió')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signIn,
    isLoading,
    error,
  }
}
