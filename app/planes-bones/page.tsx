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
    const raw = String(obj.answer || obj.location || obj.destination || answer || '')
    const clean = raw
      .toUpperCase()
      .trim()
      .replace(/[.,;:!?'"`·\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const hasJoan = clean.includes('JOAN') || (Array.isArray(obj.suspects) && obj.suspects.includes('joan'))
    const hasPere = clean.includes('PERE') || (Array.isArray(obj.suspects) && obj.suspects.includes('pere'))
    const hasMarianna = clean.includes('MARIANNA') || (Array.isArray(obj.suspects) && obj.suspects.includes('marianna'))

    const isCorrect = (hasJoan && hasPere && !hasMarianna) || clean.includes('FARGA')

    if (isCorrect) setSolved(true)

    return {
      correct: isCorrect,
      message: isCorrect
        ? 'Molt bé! En Joan i en Pere confirmen que Isidre anava cap a la Farga a les 23:00.'
        : 'Resposta incorrecta. Revisa les 5 pistes per determinar quins 2 personatges va visitar Isidre.',
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
