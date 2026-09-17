'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { TeamEvidenceRow } from '@/lib/realtime/useTeamState'

export interface UseEmissariAlertReturn {
  showAlert: boolean
  dismissAlert: () => void
  coartadaFrase: string | null
  loading: boolean
  error: string | null
}

/**
 * Hook to monitor team evidences and trigger Emissari alert after 2 evidences collected + 5 min elapsed
 *
 * When the team collects 2 evidences:
 * 1. Records the timestamp of the 2nd evidence
 * 2. Starts a 5-minute (300 second) countdown
 * 3. After 5 minutes and alert not dismissed: sets showAlert = true
 * 4. Fetches the coartada frase from /api/game/coartada
 * 5. Alert persists until dismissed by user
 *
 * @param evidences - Array of team evidences from teamState
 * @param teamId - Team ID for fetching coartada data
 * @returns Object with showAlert, dismissAlert, coartadaFrase, loading, error
 */
export function useEmissariAlert(
  evidences: TeamEvidenceRow[],
  teamId: string | null | undefined
): UseEmissariAlertReturn {
  // State management
  const [showAlert, setShowAlert] = useState(false)
  const [coartadaFrase, setCoartadaFrase] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs to track state across re-renders
  const timestampRef = useRef<number | null>(null)
  const dismissedRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const prevEvidenceLengthRef = useRef(0)

  /**
   * Dismiss alert and mark as dismissed (won't re-show on re-render)
   */
  const dismissAlert = useCallback(() => {
    setShowAlert(false)
    dismissedRef.current = true
  }, [])

  /**
   * Fetch coartada frase from the API
   */
  const fetchCoartada = useCallback(async () => {
    if (!teamId) {
      setError('Team ID not available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/game/coartada?teamId=${teamId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch coartada')
      }

      const data = await response.json()

      // Handle both single frase and multiple frases responses
      if (data.frase) {
        // Single frase response
        setCoartadaFrase(data.frase)
      } else if (data.frases && data.frases.length > 0) {
        // Multiple frases response - concatenate them
        const frazeText = data.frases.map((f: { content: string }) => f.content).join(' ')
        setCoartadaFrase(frazeText)
      } else {
        setError('No coartada available')
      }
    } catch (err) {
      console.error('Failed to fetch coartada:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch coartada')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  /**
   * Main effect: Monitor evidence count and manage timer
   */
  useEffect(() => {
    const evidenceCount = evidences.length

    // Reset if we go back below 2 evidences (shouldn't happen in normal gameplay)
    if (evidenceCount < 2) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      timestampRef.current = null
      dismissedRef.current = false
      setShowAlert(false)
      setCoartadaFrase(null)
      prevEvidenceLengthRef.current = evidenceCount
      return
    }

    // When we reach exactly 2 evidences (transition from 1 to 2)
    if (evidenceCount === 2 && prevEvidenceLengthRef.current < 2) {
      // Record timestamp of 2nd evidence
      timestampRef.current = Date.now()
      dismissedRef.current = false
      setShowAlert(false)

      // Set up timer for 5 minutes (300000 ms)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        // Check if alert hasn't been dismissed
        if (!dismissedRef.current) {
          setShowAlert(true)
          // Fetch coartada when showing alert
          fetchCoartada()
        }
      }, 300000) // 5 minutes in milliseconds
    }

    // Keep tracking the previous count for next render
    prevEvidenceLengthRef.current = evidenceCount

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [evidences.length, fetchCoartada])

  return {
    showAlert,
    dismissAlert,
    coartadaFrase,
    loading,
    error,
  }
}
