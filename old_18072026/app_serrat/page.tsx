'use client'

import { useState } from 'react'
import { SerratBruixesGame } from '@/components/games/SerratBruixesGame'
import { SubmitResult } from '@/components/gameTypes'

export default function SerratPage() {
  const [sharedState, setSharedState] = useState<unknown>({})
  const [solved, setSolved] = useState(false)

  const handleSubmit = async (answer: unknown): Promise<SubmitResult> => {
    console.log('Resposta enviada a Serrat:', answer)
    const raw = (answer as { answer?: string })?.answer || ''
    const clean = raw
      .toUpperCase()
      .trim()
      .replace(/[.,;:!?'"`·\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const compact = clean.replace(/\s+/g, '')

    const isCorrect =
      clean === 'SAP DE LLETRA' ||
      clean === 'SAP LLETRA' ||
      clean === 'SAP DE LETRA' ||
      clean === 'SAP LETRA' ||
      clean === 'SAB DE LLETRA' ||
      clean === 'SAB LLETRA' ||
      clean === 'SAP DE LLETRES' ||
      clean === 'SAP LLETRES' ||
      clean === 'ESCRIU' ||
      clean === 'LLEGEIX' ||
      compact === 'SAPDELLETRA' ||
      compact === 'SAPLLETRA' ||
      compact === 'SAPLETRA' ||
      compact === 'SAPDELETRA' ||
      compact === 'SABDELLETRA' ||
      compact === 'SABLLETRA' ||
      (compact.includes('SAP') && (compact.includes('LLETRA') || compact.includes('LETRA')))

    if (isCorrect) setSolved(true)

    return {
      correct: isCorrect,
      message: isCorrect
        ? 'Enigma resolt! Has desxifrat el codi de les fogueres.'
        : 'Resposta incorrecta.',
      score: isCorrect ? 100 : -10,
    }
  }

  return (
    <main className="min-h-screen bg-[#F4EBD9] p-2 sm:p-4">
      <SerratBruixesGame
        stationId="serrat-bruixes"
        content={{}}
        sharedState={sharedState}
        setSharedState={setSharedState}
        submit={handleSubmit}
        solved={solved}
      />
    </main>
  )
}
