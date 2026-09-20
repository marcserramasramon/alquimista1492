'use client'

import { useState, useCallback } from 'react'
import { getAllSuspects } from '@/content/public/suspects'
import { getAllEvidence, getCanonicalEvidenceId } from '@/content/public/evidence'
import type { TeamStationRow, TeamEvidenceRow } from '@/lib/realtime/useTeamState'
import { getSolvedStationsCount } from '@/lib/realtime/useTeamState'

interface AccuseTabProps {
  stations: TeamStationRow[]
  evidences: TeamEvidenceRow[]
  onSubmitAccusation: (suspectId: string, evidenceIds: string[]) => Promise<void>
  isSubmitting?: boolean
}

export function AccuseTab({
  stations,
  evidences,
  onSubmitAccusation,
  isSubmitting = false,
}: AccuseTabProps) {
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null)
  const [selectedEvidences, setSelectedEvidences] = useState<Set<string>>(
    new Set()
  )
  const [error, setError] = useState<string | null>(null)

  const solvedCount = getSolvedStationsCount(stations)
  const canAccuse = solvedCount >= 7

  const allSuspects = getAllSuspects()
  const allEvidence = getAllEvidence()
  const unlockedEvidenceIds = Array.from(
    new Set(evidences.map((e) => getCanonicalEvidenceId(e.evidence_id)))
  )

  const toggleEvidence = useCallback((evidenceId: string) => {
    setSelectedEvidences((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(evidenceId)) {
        newSet.delete(evidenceId)
      } else {
        newSet.add(evidenceId)
      }
      return newSet
    })
  }, [])

  const handleSubmit = async () => {
    setError(null)

    if (!selectedSuspect) {
      setError('Selecciona un sospitós')
      return
    }

    if (selectedEvidences.size === 0) {
      setError('Selecciona al menys una prova')
      return
    }

    try {
      await onSubmitAccusation(selectedSuspect, Array.from(selectedEvidences))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error en enviar l\'acusació'
      )
    }
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Title */}
      <div className="flex-shrink-0 px-6 py-2.5 border-b border-amber-200">
        <h2 className="text-lg font-bold text-amber-900">Acusació Final</h2>
        <p className="text-sm text-amber-700 mt-0.5">
          {canAccuse
            ? 'Estàs preparat per acusar!'
            : `Necessites ${7 - solvedCount} més estacions`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {!canAccuse ? (
          // Not ready to accuse
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              Acusació Bloqueada
            </h3>
            <p className="text-amber-700 mb-4">
              Resol {7 - solvedCount} estacions més per acusar
            </p>
            <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-700 h-full transition-all"
                style={{ width: `${(solvedCount / 7) * 100}%` }}
              />
            </div>
            <p className="text-xs text-amber-600 mt-2">
              {solvedCount}/7 estacions
            </p>
          </div>
        ) : (
          <>
            {/* Suspect Selection */}
            <div>
              <h3 className="font-bold text-amber-900 mb-3">
                Selecciona el Sospitós
              </h3>
              <div className="space-y-2">
                {allSuspects.map((suspect) => (
                  <button
                    key={suspect.id}
                    onClick={() => setSelectedSuspect(suspect.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedSuspect === suspect.id
                        ? 'bg-red-600 text-white border-2 border-red-700'
                        : 'bg-white border-2 border-amber-200 text-amber-900 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{suspect.profileIcon}</span>
                      <div>
                        <div className="font-semibold">{suspect.catalan}</div>
                        <div className="text-xs opacity-75">{suspect.role}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Selection */}
            <div>
              <h3 className="font-bold text-amber-900 mb-3">
                Selecciona Proves ({selectedEvidences.size})
              </h3>
              {unlockedEvidenceIds.length === 0 ? (
                <p className="text-amber-700 text-sm">
                  No tens proves descobertes
                </p>
              ) : (
                <div className="space-y-2">
                  {allEvidence
                    .filter((e) => unlockedEvidenceIds.includes(e.id))
                    .map((evidence) => (
                      <button
                        key={evidence.id}
                        onClick={() => toggleEvidence(evidence.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedEvidences.has(evidence.id)
                            ? 'bg-green-600 text-white border-2 border-green-700'
                            : 'bg-white border-2 border-green-200 text-green-900 hover:border-green-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{evidence.icon}</span>
                          <div>
                            <div className="font-semibold">
                              {evidence.catalan}
                            </div>
                            <div className="text-xs opacity-75">
                              {evidence.discoveredAt}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedSuspect || selectedEvidences.size === 0 || isSubmitting}
              className="w-full py-3 px-4 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 transition-all min-h-[48px]"
            >
              {isSubmitting ? 'Enviant...' : 'ACUSAR'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
