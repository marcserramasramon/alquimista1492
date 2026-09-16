'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function useMasterAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (pin: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al conectar')
        return false
      }

      const data = await response.json()

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('master_token', data.token)
      }

      // Redirect to master dashboard
      router.push('/master')
      return true
    } catch (err) {
      console.error('Login error:', err)
      setError('Error de connexió')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear the cookie
      await fetch('/api/auth/master-logout', {
        method: 'POST',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear localStorage as well for backward compatibility
      localStorage.removeItem('master_token')
      // Redirect to login
      router.push('/(master)/login')
    }
  }

  return {
    login,
    logout,
    isLoading,
    error,
  }
}
