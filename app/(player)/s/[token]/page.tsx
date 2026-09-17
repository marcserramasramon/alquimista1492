'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getGameComponent } from '@/components/games/registry'
import { GameProps, SubmitResult } from '@/components/gameTypes'

interface StationData {
  stationId: string
  sessionId: string
  teamId: string
  content: Record<string, unknown>
  sharedState: unknown
}

interface ValidationError {
  code: string
  message: string
}

export default function StationQRPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [stationData, setStationData] = useState<StationData | null>(null)
  const [error, setError] = useState<ValidationError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sharedState, setSharedState] = useState<unknown>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate token and fetch station data
  useEffect(() => {
    const validateAndLoadStation = async () => {
      try {
        setIsLoading(true)

        const response = await fetch('/api/game/validate-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData)
          return
        }

        const data = await response.json()
        setStationData(data)
        setSharedState(data.sharedState || {})
      } catch (err) {
        console.error('Error validating pass:', err)
        setError({
          code: 'VALIDATION_ERROR',
          message: 'Error validating station access',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      validateAndLoadStation()
    }
  }, [token])

  const handleSubmit = async (answer: unknown): Promise<SubmitResult> => {
    if (!stationData) {
      return {
        correct: false,
        message: 'Station data not loaded',
      }
    }

    try {
      setIsSubmitting(true)

      const response = await fetch('/api/game/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: stationData.sessionId,
          stationId: stationData.stationId,
          answer,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Answer validation error:', errorData)
        return {
          correct: false,
          message: errorData.message || 'Error submitting answer',
        }
      }

      const result = await response.json()

      // On successful answer, redirect after a delay
      if (result.success) {
        setTimeout(() => {
          router.push(`/joc/hub?sessionId=${stationData.sessionId}`)
        }, 1500)
      }

      return {
        correct: result.success,
        message: result.message,
        score: result.reward,
      }
    } catch (err) {
      console.error('Error submitting answer:', err)
      return {
        correct: false,
        message: 'Error submitting your answer',
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-amber-900 border-t-amber-300"></div>
          <p className="text-lg font-semibold text-amber-900">S'està carregant l'estació...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !stationData) {
    const errorMessage =
      error?.code === 'TOKEN_EXPIRED'
        ? "El token d'estació ha expirat"
        : error?.code === 'ALREADY_SOLVED'
          ? "Aquesta estació ja l'heu resoltes"
          : error?.code === 'INVALID_TOKEN'
            ? "Token d'estació no vàlid"
            : error?.message || "Error carregant l'estació"

    const errorTitle =
      error?.code === 'TOKEN_EXPIRED'
        ? 'Token Expirat'
        : error?.code === 'ALREADY_SOLVED'
          ? 'Estació Ja Resolta'
          : error?.code === 'INVALID_TOKEN'
            ? 'Token No Vàlid'
            : 'Error'

    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-red-900">{errorTitle}</h1>
          <p className="mb-6 text-red-800">{errorMessage}</p>
          <button
            onClick={() => router.push('/joc/hub')}
            className="inline-block rounded bg-red-900 px-6 py-2 font-semibold text-white hover:bg-red-800"
          >
            Tornar al Hub
          </button>
        </div>
      </div>
    )
  }

  // Get game component
  const GameComponent = getGameComponent(stationData.stationId)

  if (!GameComponent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-red-900">Joc No Disponible</h1>
          <p className="mb-6 text-red-800">No s'ha trobat el component del joc per a aquesta estació</p>
          <button
            onClick={() => router.push('/joc/hub')}
            className="inline-block rounded bg-red-900 px-6 py-2 font-semibold text-white hover:bg-red-800"
          >
            Tornar al Hub
          </button>
        </div>
      </div>
    )
  }

  // Render game
  return (
    <div className="bg-amber-50">
      <GameComponent
        stationId={stationData.stationId}
        content={stationData.content}
        sharedState={sharedState}
        setSharedState={setSharedState}
        submit={handleSubmit}
        solved={false}
      />
    </div>
  )
}
