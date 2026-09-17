'use client'

import { useState } from 'react'
import { CementiriGame } from '@/components/games/CementiriGame'
import { SubmitResult } from '@/components/gameTypes'

export default function CementiriPage() {
  const [sharedState, setSharedState] = useState<unknown>({})
  const [solved, setSolved] = useState(false)

  const handleSubmit = async (answer: unknown): Promise<SubmitResult> => {
    console.log('Resposta enviada a Cementiri:', answer)
    // El nom correcte alterat és Corminas (id: 1)
    const isCorrect = (answer as { lapidaId?: number })?.lapidaId === 1
    if (isCorrect) setSolved(true)
    return {
      correct: isCorrect,
      message: isCorrect ? 'Enigma resolt! Has trobat la làpida correcta.' : 'Làpida incorrecta.',
      score: isCorrect ? 100 : -10,
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EBD9] p-2 sm:p-4">
      <CementiriGame
        stationId="cementiri"
        content={{}}
        sharedState={sharedState}
        setSharedState={setSharedState}
        submit={handleSubmit}
        solved={solved}
      />
    </main>
  )
}
