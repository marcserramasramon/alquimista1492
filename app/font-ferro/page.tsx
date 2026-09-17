'use client'

import { useState } from 'react'
import { FontFerroGame } from '@/components/games/FontFerroGame'
import { SubmitResult } from '@/components/gameTypes'

export default function FontFerroPage() {
  const [sharedState, setSharedState] = useState<unknown>({})
  const [solved, setSolved] = useState(false)

  const handleSubmit = async (answer: unknown): Promise<SubmitResult> => {
    console.log('Resposta enviada a Font del Ferro:', answer)
    const obj = typeof answer === 'object' && answer !== null ? (answer as Record<string, unknown>) : {}
    const raw = String(obj.date || obj.answer || answer || '')
    const clean = raw
      .toUpperCase()
      .trim()
      .replace(/[.,;:!?'"`·\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const compact = clean.replace(/\s+/g, '')

    const isCorrect =
      clean === '12' ||
      clean === '12 DE MAIG' ||
      clean === '12 MAIG' ||
      clean === 'DIA 12' ||
      clean === 'DIA 12 DE MAIG' ||
      clean === 'EL 12' ||
      clean === 'DOTZE' ||
      compact === '12' ||
      compact === '12DEMAIG' ||
      compact === 'DIA12' ||
      compact.includes('12')

    if (isCorrect) setSolved(true)

    return {
      correct: isCorrect,
      message: isCorrect
        ? "Molt bé! El dia 12 de maig es va recollir l'aigua ferrosa. Marianna queda descartada!"
        : "Data incorrecta. Recorda restar 3 dies complets de maceració al dia 15 de maig.",
      score: isCorrect ? 100 : -10,
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EBD9] p-2 sm:p-4">
      <FontFerroGame
        stationId="font-ferro"
        content={{}}
        sharedState={sharedState}
        setSharedState={setSharedState}
        submit={handleSubmit}
        solved={solved}
      />
    </main>
  )
}
