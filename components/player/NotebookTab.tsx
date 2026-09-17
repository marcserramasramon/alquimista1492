'use client'

import { useState } from 'react'
import { getAllSuspects, getSuspect } from '@/content/public/suspects'
import { getAllEvidence, getEvidence } from '@/content/public/evidence'
import type { TeamEvidenceRow } from '@/lib/realtime/useTeamState'

interface NotebookTabProps {
  evidences: TeamEvidenceRow[]
  coartadaFrase?: string | null
}

type NotebookView = 'suspects' | 'evidence' | 'clues'

export function NotebookTab({ evidences, coartadaFrase }: NotebookTabProps) {
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

      {/* Avís de l'Emissari guardat si ja ha saltat l'alerta */}
      {coartadaFrase && (
        <div className="mx-4 mt-3 p-4 bg-[#3d0a0a] border-2 border-red-700 rounded-xl text-amber-100 shadow-lg">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-serif font-bold text-red-300 text-sm tracking-wide">
                AVÍS DE L'EMISSARI
              </h3>
            </div>
            <span className="bg-red-900 text-red-200 border border-red-600 px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase">
              La teva Coartada
            </span>
          </div>
          <p className="text-xs text-yellow-300 italic mb-2 font-sans">
            "L'Emissari és pel poble interrogant a la gent. Se sap que pregunta per:"
          </p>
          <div className="bg-[#2a0606] border border-red-800 rounded-lg p-3 text-center shadow-inner">
            <p className="font-serif italic text-amber-200 text-sm sm:text-base leading-relaxed">
              «{coartadaFrase}»
            </p>
          </div>
          <p className="text-[11px] text-red-200/80 text-center mt-2 font-sans">
            Muntar-vos una coartada no és mentir, fills. És salvar-vos. Cadascun de vosaltres porta un retall de la historia. Junts, heu de saber on éreu, amb qui, i per quant temps. La historia la compartiu tots. I serà la mateixa, sempre, sense relliscades. Que no doni una volta. Clar?
          </p>
        </div>
      )}

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
