'use client'

import { useState } from 'react'
import { getAllSuspects, getSuspect } from '@/content/public/suspects'
import { getAllEvidence, getEvidence } from '@/content/public/evidence'
import type { TeamEvidenceRow } from '@/lib/realtime/useTeamState'

interface NotebookTabProps {
  evidences: TeamEvidenceRow[]
}

type NotebookView = 'suspects' | 'evidence' | 'clues'

export function NotebookTab({ evidences }: NotebookTabProps) {
  const [view, setView] = useState<NotebookView>('suspects')
  const allSuspects = getAllSuspects()
  const allEvidence = getAllEvidence()

  const unlockedEvidenceIds = evidences.map((e) => e.evidence_id)

  return (
    <div className="w-full flex flex-col h-full">
      {/* Title */}
      <div className="px-6 py-4 border-b border-amber-200">
        <h2 className="text-xl font-bold text-amber-900">Quadern d'Investigació</h2>
      </div>

      {/* Tab Buttons */}
      <div className="px-4 py-3 border-b border-amber-200 flex gap-2 flex-shrink-0">
        <button
          onClick={() => setView('suspects')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            view === 'suspects'
              ? 'bg-amber-700 text-white'
              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
          }`}
        >
          Sospitosos
        </button>
        <button
          onClick={() => setView('evidence')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
            view === 'evidence'
              ? 'bg-amber-700 text-white'
              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
          }`}
        >
          Proves ({unlockedEvidenceIds.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {view === 'suspects' && (
          <>
            {allSuspects.map((suspect) => (
              <div
                key={suspect.id}
                className="p-4 rounded-lg border-2 border-amber-200 bg-white"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-3xl">{suspect.profileIcon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900">
                      {suspect.catalan}
                    </h3>
                    <p className="text-xs text-amber-700">
                      {suspect.role} — {suspect.age} anys
                    </p>
                  </div>
                </div>
                <p className="text-sm text-amber-800 mb-2">
                  {suspect.narrative}
                </p>
                <div className="text-xs text-amber-600">
                  📍 {suspect.clueLocation}
                </div>
              </div>
            ))}
          </>
        )}

        {view === 'evidence' && (
          <>
            {unlockedEvidenceIds.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-amber-700">
                  Ninguna prova descoberta aún
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Resol estacions per trobar proves
                </p>
              </div>
            ) : (
              <>
                {allEvidence
                  .filter((e) => unlockedEvidenceIds.includes(e.id))
                  .map((evidence) => (
                    <div
                      key={evidence.id}
                      className="p-4 rounded-lg border-2 border-green-300 bg-green-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{evidence.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900">
                            {evidence.catalan}
                          </h4>
                          <p className="text-sm text-green-800 my-1">
                            {evidence.description}
                          </p>
                          <div className="text-xs text-green-700">
                            📌 {evidence.discoveredAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
