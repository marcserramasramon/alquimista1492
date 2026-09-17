'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  pulseVariants,
} from '@/lib/animations/useAnimations'

interface BellGameState {
  currentScreen: 'intro' | 'input' | 'result'
  code: string
  isSubmitting: boolean
}

/**
 * Joc 8: Sometent — Campanar
 * Input 4 digits per tocar el campanar
 * Validació: ordre correcta (element codes) — validated server-side only
 */
export function BellGame(props: GameProps) {
  const router = useRouter()
  const { play } = useAudio()
  const [state, setState] = useState<BellGameState>(() => {
    const saved = props.sharedState as BellGameState | undefined
    if (saved && 'currentScreen' in saved) {
      return saved
    }
    return {
      currentScreen: 'intro',
      code: '',
      isSubmitting: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSubmit = async () => {
    const normalized = state.code.replace(/[\s-]/g, '')

    // Basic format check only (not validation)
    if (normalized.length !== 4 || !/^\d{4}$/.test(normalized)) {
      return
    }

    play('bell-ring')
    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      const result = await props.submit({
        code: normalized,
      })
      if (!result.correct) {
        play('buzzer')
      }
      // Validation happens server-side; redirect to hub
      router.push(`/joc/hub`)
    } catch (error) {
      play('buzzer')
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-600 mb-4">
        12:34:56
      </div>

      {state.currentScreen === 'intro' && (
        <IntroScreen onContinue={() => setState(prev => ({ ...prev, currentScreen: 'input' }))} />
      )}

      {state.currentScreen === 'input' && (
        <InputScreen
          code={state.code}
          onCodeChange={val => setState(prev => ({ ...prev, code: val }))}
          onSubmit={handleSubmit}
          isSubmitting={state.isSubmitting}
        />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen />
      )}
    </motion.div>
  )
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-3xl font-bold text-center mb-6">PORTA DEL CAMPANAR</h1>

      <div className="bg-amber-100 p-6 rounded-lg text-center mb-4">
        <p className="text-5xl mb-4">🔔</p>
        <p className="text-lg font-bold">El Sometent final</p>
        <p className="text-sm mt-2 text-amber-800">Els conjurats de Sant Sebastià senten el senyal.</p>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <p className="font-bold mb-3 text-sm">CODI DELS 4 ELEMENTS:</p>
        <p className="text-sm">FOC = 1</p>
        <p className="text-sm">AIGUA = 2</p>
        <p className="text-sm">AIRE = 3</p>
        <p className="text-sm">TERRA = 4</p>
      </div>

      <p className="text-center text-sm text-amber-800 mb-4">
        Introduir la seqüència correcta per tocar el campanar.
      </p>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        CONTINUAR
      </button>
    </div>
  )
}

function InputScreen({
  code,
  onCodeChange,
  onSubmit,
  isSubmitting,
}: {
  code: string
  onCodeChange: (val: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  const isValid = code.replace(/[\s-]/g, '').length === 4

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-4">CODI DEL CAMPANAR (4 dígits)</h2>

      <motion.div
        className="bg-amber-100 p-8 rounded-lg text-center mb-4"
        animate={isValid ? 'pulse' : 'initial'}
        variants={pulseVariants}
      >
        <p className="text-5xl mb-4">🔔</p>
      </motion.div>

      <input
        type="text"
        value={code}
        onChange={e => onCodeChange(e.target.value)}
        disabled={isSubmitting}
        placeholder="Ex: 1234 o 1-2-3-4"
        className="w-full p-4 text-2xl text-center font-bold border-2 border-amber-900 tracking-widest disabled:opacity-50"
        maxLength={7}
      />

      <p className="text-center text-sm text-amber-800">Forma: 1234 o 1-2-3-4</p>

      <button
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
        className={`w-full p-4 font-bold text-lg border-2 transition ${
          isValid && !isSubmitting
            ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
            : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'ENVIANT...' : 'TOCAR EL CAMPANAR'}
      </button>
    </div>
  )
}

function ResultScreen() {
  return (
    <div className="flex flex-col justify-center flex-1 gap-6">
      <div className="text-center">
        <p className="text-lg text-amber-900">Processant resposta...</p>
      </div>
    </div>
  )
}
