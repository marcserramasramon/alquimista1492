'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  containerVariants,
  itemVariants,
} from '@/lib/animations/useAnimations'

interface AccusationGameState {
  currentScreen: 'intro' | 'suspect_select' | 'evidence_select' | 'giro' | 'result' | 'incorrect'
  selectedSuspect: string | null
  selectedEvidence: Set<string>
  attempts: number
  hasSeenGiro: boolean
  isCorrect: boolean
}

const SUSPECTS = [
  { id: 'anton', name: 'Anton l\'Escolà', desc: 'Escolà, vetlla del rector' },
  { id: 'bernat', name: 'Bernat Mestre d\'Escola', desc: 'Mestre, coordina l\'equip' },
]

const ALL_EVIDENCE = [
  { id: 'seal', name: 'Segell ploma i clau', source: 'Joc 4 Cementiri' },
  { id: 'light', name: 'Llum escola nit 15', source: 'Joc 3 Planes Bones' },
  { id: 'cantirs', name: 'Dos càntirs escola dia 12', source: 'Joc 2 Font del Ferro' },
  { id: 'literacy', name: 'Sap de lletra', source: 'Joc 1 Serrat' },
  { id: 'caligraphia', name: 'Full cal·ligrafia + noms registre', source: 'Joc 6 Primer Intent' },
  { id: 'filigrana', name: 'Filigrana àncora idèntica', source: 'Joc 4 Cementiri' },
]

const VALID_EVIDENCE_FOR_BERNAT = ['seal', 'light', 'cantirs', 'literacy', 'caligraphia', 'filigrana']
const VALID_EVIDENCE_FOR_ANTON: string[] = []

/**
 * Joc 6: Accusació (L'Acusació)
 * Seleccionar sospitós + 3 proves vàlides
 * Si acusen Anton primer → GIR narratiu
 * Si Bernat + 3 proves vàlides → Correcte
 */
export function AccusationGame(props: GameProps) {
  const { play } = useAudio()
  const [state, setState] = useState<AccusationGameState>(() => {
    const saved = props.sharedState as AccusationGameState | undefined
    return saved || {
      currentScreen: 'intro',
      selectedSuspect: null,
      selectedEvidence: new Set(),
      attempts: 0,
      hasSeenGiro: false,
      isCorrect: false,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSuspectSelect = (suspectId: string) => {
    setState(prev => ({
      ...prev,
      selectedSuspect: suspectId,
      currentScreen: 'evidence_select',
      selectedEvidence: new Set(),
    }))
  }

  const toggleEvidence = (evidenceId: string) => {
    setState(prev => {
      const newEvidence = new Set(prev.selectedEvidence)
      if (newEvidence.has(evidenceId)) {
        newEvidence.delete(evidenceId)
      } else {
        newEvidence.add(evidenceId)
      }
      return { ...prev, selectedEvidence: newEvidence }
    })
  }

  const handleSubmitAccusation = async () => {
    if (!state.selectedSuspect || state.selectedEvidence.size < 3) return

    const result = await props.submit({
      suspect: state.selectedSuspect,
      evidence: Array.from(state.selectedEvidence),
    })

    if (result.correct) {
      // If accusing Anton first, show giro
      if (state.selectedSuspect === 'anton' && !state.hasSeenGiro) {
        play('bell-ring')
        setState(prev => ({
          ...prev,
          currentScreen: 'giro',
          hasSeenGiro: true,
        }))
      } else {
        // Bernat is correct
        play('bell-ring')
        setState(prev => ({
          ...prev,
          currentScreen: 'result',
          isCorrect: true,
        }))
      }
    } else {
      play('buzzer')
      setState(prev => ({
        ...prev,
        currentScreen: 'incorrect',
        attempts: prev.attempts + 1,
      }))
    }
  }

  const handleRetryAfterGiro = () => {
    setState(prev => ({
      ...prev,
      currentScreen: 'suspect_select',
      selectedSuspect: null,
      selectedEvidence: new Set(),
    }))
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
        <IntroScreen onContinue={() => setState(prev => ({ ...prev, currentScreen: 'suspect_select' }))} />
      )}

      {state.currentScreen === 'suspect_select' && (
        <SuspectSelectScreen suspects={SUSPECTS} onSelectSuspect={handleSuspectSelect} />
      )}

      {state.currentScreen === 'evidence_select' && state.selectedSuspect && (
        <EvidenceSelectScreen
          suspect={SUSPECTS.find(s => s.id === state.selectedSuspect)!}
          evidence={ALL_EVIDENCE}
          selectedEvidence={state.selectedEvidence}
          onToggleEvidence={toggleEvidence}
          onSubmit={handleSubmitAccusation}
        />
      )}

      {state.currentScreen === 'giro' && (
        <GiroScreen onContinue={handleRetryAfterGiro} />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen isCorrect={state.isCorrect} suspect={state.selectedSuspect} />
      )}

      {state.currentScreen === 'incorrect' && (
        <IncorrectScreen
          attempt={state.attempts}
          onRetry={() => setState(prev => ({ ...prev, currentScreen: 'suspect_select', selectedSuspect: null, selectedEvidence: new Set() }))}
        />
      )}
    </motion.div>
  )
}

function IntroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-3xl font-bold text-center mb-4">PLA DE MASSET</h1>
      <h2 className="text-2xl font-bold text-center mb-6">L'Acusació</h2>

      <div className="bg-amber-100 p-4 rounded-lg mb-4">
        <p className="font-bold mb-2">HAS RECOLLIT 4 XIFRES: 4-2-3-1</p>
        <p className="text-sm mb-3 font-bold">SOSPITOSOS DESCARTATS:</p>
        <div className="text-sm space-y-1 mb-3">
          <p>✓ Pere del Molí (Serrat)</p>
          <p>✓ Joan (Serrat)</p>
          <p>✓ Marianna (Font)</p>
          <p>✓ Isidre (Planes)</p>
        </div>
      </div>

      <div className="border-t-2 border-b-2 border-amber-900 py-4 my-4">
        <p className="font-bold mb-3">QUEDEN DOS:</p>
        <p>• Anton l'Escolà</p>
        <p>• Bernat Mestre d'Escola</p>
      </div>

      <p className="text-sm mb-4">Consulta el teu Quadern. Marca 3 proves vàlides i acusa el traïdor.</p>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        CONTINUAR
      </button>
    </div>
  )
}

function SuspectSelectScreen({
  suspects,
  onSelectSuspect,
}: {
  suspects: typeof SUSPECTS
  onSelectSuspect: (id: string) => void
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center mb-6">QUI ÉS EL TRAÏDOR?</h2>

      <p className="text-center text-sm mb-4">Sospitosos que resten:</p>

      <div className="space-y-3">
        {suspects.map(suspect => (
          <button
            key={suspect.id}
            onClick={() => onSelectSuspect(suspect.id)}
            className="w-full p-4 bg-amber-100 border-2 border-amber-900 hover:bg-amber-200 transition text-left"
          >
            <p className="font-bold">{suspect.name}</p>
            <p className="text-sm text-amber-800">{suspect.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function EvidenceSelectScreen({
  suspect,
  evidence,
  selectedEvidence,
  onToggleEvidence,
  onSubmit,
}: {
  suspect: typeof SUSPECTS[0]
  evidence: typeof ALL_EVIDENCE
  selectedEvidence: Set<string>
  onToggleEvidence: (id: string) => void
  onSubmit: () => void
}) {
  const canSubmit = selectedEvidence.size === 3

  return (
    <motion.div
      className="flex flex-col flex-1 gap-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h2 className="text-2xl font-bold text-center mb-2">HAS ACUSAT:</h2>
      <p className="text-center font-bold text-amber-900 mb-4">{suspect.name}</p>

      <p className="text-center text-sm font-bold mb-4">Marca 3 proves vàlides del Quadern:</p>

      <motion.div className="space-y-2 flex-1 overflow-y-auto" variants={containerVariants}>
        {evidence.map(ev => (
          <motion.label
            key={ev.id}
            variants={itemVariants}
            className="flex items-start gap-3 p-3 bg-amber-100 border border-amber-300 cursor-pointer hover:bg-amber-150 transition"
          >
            <input
              type="checkbox"
              checked={selectedEvidence.has(ev.id)}
              onChange={() => onToggleEvidence(ev.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-bold text-sm">{ev.name}</p>
              <p className="text-xs text-amber-700">{ev.source}</p>
            </div>
          </motion.label>
        ))}
      </motion.div>

      <div className="border-t-2 border-amber-900 pt-4">
        <p className="text-center font-bold mb-4">Proves marcades: {selectedEvidence.size}/3</p>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full p-4 font-bold text-lg border-2 transition ${
            canSubmit
              ? 'bg-amber-900 text-amber-50 border-amber-900 hover:bg-amber-800'
              : 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
          }`}
        >
          VALIDAR
        </button>
      </div>
    </motion.div>
  )
}

function GiroScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-4">[ÀUDIO ANTON]</h2>
      </div>

      <div className="bg-red-100 border-2 border-red-600 p-6 rounded-lg text-center mb-4">
        <p className="text-lg font-bold text-red-800 leading-relaxed mb-4">
          "El rector! L'han ferit!"
        </p>
        <p className="text-base text-red-700 leading-relaxed">
          "He estat vetllant-lo tota la nit del 15 de maig!"
        </p>
      </div>

      <div className="bg-amber-100 p-4 rounded-lg mb-4">
        <p className="font-bold mb-3 text-sm">SE DESBLOQUEJA:</p>
        <div className="text-sm space-y-2">
          <p>✓ Declaració del Rector</p>
          <p>"L'Anton va vetllar-me tota la nit"</p>
          <p className="mt-3">✓ Full de cal·ligrafia (Escola)</p>
          <p>"Noms de difunts copiats per nens"</p>
        </div>
      </div>

      <div className="border-t-2 border-b-2 border-amber-900 py-4">
        <p className="text-center font-bold text-lg text-red-600">ANTON ESTÀ INNOCENT.</p>
        <p className="text-center mt-2">Llavors... QUI ÉS EL TRAÏDOR?</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        TORNAR A ACUSAR
      </button>
    </div>
  )
}

function ResultScreen({ isCorrect, suspect }: { isCorrect: boolean; suspect: string | null }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      {isCorrect ? (
        <>
          <h2 className="text-3xl font-bold text-center text-green-600 mb-4">✓ CORRECTE!</h2>
          <p className="text-center font-bold text-lg mb-4">
            BERNAT, MESTRE D'ESCOLA, ÉS EL TRAÏDOR.
          </p>

          <div className="bg-green-50 border-2 border-green-600 p-6 rounded-lg mb-4">
            <p className="font-bold mb-3 text-sm">SE DESBLOQUEJA:</p>
            <div className="text-sm space-y-2">
              <p>✓ RIMA DEL CODI (Joc 9):</p>
              <p className="italic">"Del cim baixa l'avís,..."</p>
              <p className="mt-3">✓ UBICACIÓ DE LA CLAU (Joc 7):</p>
              <p className="italic">"La clau està a la foscor,..."</p>
            </div>
          </div>

          <div className="bg-amber-100 p-4 rounded-lg">
            <p className="font-bold mb-2">MOTIU DE LA TRAÏCIÓ:</p>
            <p className="text-sm">En Jaume, fill de Bernat, és pres a la guarnició de Vic. El capità ha promès alliberarlo a canvi dels noms dels conjurats.</p>
          </div>

          <p className="text-center font-bold text-lg text-green-600 mt-4">+100 punts</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center text-red-600 mb-4">✗ INCORRECTE</h2>
          <p className="text-center mb-4">Les proves marcades no corresponen al sospitós acusat.</p>
        </>
      )}
    </div>
  )
}

function IncorrectScreen({ attempt, onRetry }: { attempt: number; onRetry: () => void }) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h2 className="text-2xl font-bold text-center text-red-600 mb-4">✗ INCORRECTE</h2>

      <p className="text-center mb-4">
        NO hi ha prou proves vàlides per a aquesta persona, o les proves no corresponen al sospitós acusat.
      </p>

      <div className="bg-red-100 p-4 rounded-lg mb-4">
        <p className="text-center font-bold">−10 punts</p>
        <p className="text-center text-sm mt-2">Intent {attempt}/3</p>
      </div>

      <button
        onClick={onRetry}
        className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900 hover:bg-amber-800 transition"
      >
        TORNAR A INTENTAR
      </button>
    </div>
  )
}
