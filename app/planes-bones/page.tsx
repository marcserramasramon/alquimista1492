'use client'

import { useState } from 'react'
import { PlaneBonesGame } from '@/components/games/PlaneBonesGame'
import { SubmitResult } from '@/components/gameTypes'

export default function PlanesBonesPage() {
  const [sharedState, setSharedState] = useState<unknown>({})
  const [solved, setSolved] = useState(false)

  const handleSubmit = async (answer: unknown): Promise<SubmitResult> => {
    console.log('Resposta enviada a Planes Bones:', answer)
    const obj = typeof answer === 'object' && answer !== null ? (answer as Record<string, unknown>) : {}
    const raw = String(obj.location || obj.answer || obj.destination || answer || '')
    const clean = raw
      .toUpperCase()
      .trim()
      .replace(/[.,;:!?'"`·\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const compact = clean.replace(/\s+/g, '')

    const isCorrect =
      clean === 'FARGA' ||
      clean === 'LA FARGA' ||
      clean === '3' ||
      clean === 'CASELLA 3' ||
      compact === 'FARGA' ||
      compact === 'LAFARGA' ||
      compact.includes('FARGA') ||
      (Array.isArray(obj.visitedCells) && obj.visitedCells.includes(3))

    if (isCorrect) setSolved(true)

    return {
      correct: isCorrect,
      message: isCorrect
        ? 'Molt bé! La patrulla arriba a La Farga a les 23:00 i confirma la coartada del ferrer Isidre.'
        : 'Lloc incorrecte. Segueix la prioritat de la patrulla (NORD → EST → OEST → SUD) des de la Plaça.',
      score: isCorrect ? 100 : -10,
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EBD9] p-2 sm:p-4">
      <PlaneBonesGame
        stationId="planes-bones"
        content={{}}
        sharedState={sharedState}
        setSharedState={setSharedState}
        submit={handleSubmit}
        solved={solved}
      />
    </main>
  )
}
