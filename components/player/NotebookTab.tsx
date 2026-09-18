'use client'

import { useState } from 'react'
import { getAllSuspects } from '@/content/public/suspects'
import { getAllEvidence } from '@/content/public/evidence'
import { getAllStations } from '@/content/public/stations'
import type { TeamEvidenceRow, TeamStationRow } from '@/lib/realtime/useTeamState'
import { getTeamStation } from '@/lib/realtime/useTeamState'

interface NotebookTabProps {
  evidences: TeamEvidenceRow[]
  stations?: TeamStationRow[]
  coartadaFrase?: string | null
}

type NotebookView = 'fites' | 'suspects' | 'evidence'

// Fites principals de l'Acte 1: les 4 estacions amb joc que fan avançar la trama.
const FITES_IDS = new Set([
  'serrat-bruixes',
  'serrat',
  'font-ferro',
  'font_ferro',
  'planes-bones',
  'planes_bones',
  'cementiri',
])

const SUSPICION_STYLES: Record<string, string> = {
  alta: 'bg-cochineal/10 text-cochineal border-cochineal/40',
  mitjana: 'bg-gold/10 text-[#7a5c10] border-gold/50',
  baixa: 'bg-leather/10 text-leather border-leather/40',
}

export function NotebookTab({ evidences, stations = [], coartadaFrase }: NotebookTabProps) {
  const [view, setView] = useState<NotebookView>('fites')
  const allSuspects = getAllSuspects()
  const allEvidence = getAllEvidence()
  const fites = getAllStations().filter((s) => FITES_IDS.has(s.id))

  const unlockedEvidenceIds = evidences.map((e) => e.evidence_id)
  const solvedFitesCount = fites.filter((f) => getTeamStation(stations, f.id)?.solved).length

  const tabs: { id: NotebookView; label: string; icon: string; badge?: number }[] = [
    { id: 'fites', label: 'Fites', icon: '🚩', badge: solvedFitesCount },
    { id: 'suspects', label: 'Sospitosos', icon: '🕵️' },
    { id: 'evidence', label: 'Proves', icon: '📜', badge: unlockedEvidenceIds.length },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-parchment">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header — mateixa estètica que Història */}
        <header className="border-b-2 border-leather pb-3 mb-5 text-center">
          <span className="text-xs uppercase tracking-widest text-leather font-sans font-bold">
            Investigació
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-serif mt-1">
            Quadern
          </h1>
          <p className="text-xs text-leather font-sans mt-1">
            {solvedFitesCount} de {fites.length} fites superades • {unlockedEvidenceIds.length} proves recollides
          </p>
        </header>

        {/* Contingut: panell de pestanyes de documentació */}
        <div className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl shadow-sm overflow-hidden">
          {/* Pestanyes */}
          <div className="bg-[#D8CCAE] border-b border-[#8C6D53] flex">
            {tabs.map((tab) => {
              const isActive = view === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  data-testid={`quadern-tab-${tab.label}`}
                  className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-[#EAE0CA] text-[#1D3557] border-b-2 border-[#1D3557] shadow-inner'
                      : 'text-[#5C4533] hover:text-[#1D3557] hover:bg-[#E2D6B8]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>
                    {tab.label}
                    {tab.badge !== undefined ? ` (${tab.badge})` : ''}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Contingut de la pestanya activa */}
          <div className="p-4 sm:p-5 space-y-3">
        {view === 'fites' && (
          <>
            <p className="text-xs font-sans text-[#5C4533] mb-1">
              {solvedFitesCount} de {fites.length} fites superades
            </p>
            {fites.map((station) => {
              const teamStation = getTeamStation(stations, station.id)
              const solved = teamStation?.solved ?? false
              return (
                <div
                  key={station.id}
                  className={`p-3.5 rounded-lg border bg-[#FAF5E9] shadow-sm ${
                    solved ? 'border-[#1D3557]/40' : 'border-[#8C6D53]/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none">{station.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif font-bold text-ink">
                          {station.catalan}
                        </h3>
                        <span
                          className={`text-[10px] font-sans font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            solved
                              ? 'bg-prussian/10 text-prussian border-prussian/40'
                              : 'bg-leather/10 text-leather border-leather/40'
                          }`}
                        >
                          {solved ? '✓ Resolta' : 'Pendent'}
                        </span>
                      </div>
                      <p className="text-sm text-ink/80 font-sans mt-1">
                        {station.narrativeHook}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {view === 'suspects' && (
          <>
            {allSuspects.map((suspect) => (
              <div
                key={suspect.id}
                className="p-3.5 rounded-lg border border-[#8C6D53]/30 bg-[#FAF5E9] shadow-sm"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-3xl">{suspect.profileIcon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-ink">
                        {suspect.catalan}
                      </h3>
                      <span
                        className={`text-[10px] font-sans font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0 ${SUSPICION_STYLES[suspect.suspicionFactor]}`}
                      >
                        {suspect.suspicionFactor}
                      </span>
                    </div>
                    <p className="text-xs text-leather font-sans">
                      {suspect.roleDescription} — {suspect.age} anys
                    </p>
                  </div>
                </div>
                <p className="text-sm text-ink/80 font-sans mb-2">
                  {suspect.narrative}
                </p>
                <div className="text-xs text-leather font-sans">
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
                <p className="text-ink font-sans">
                  Encara no heu trobat cap prova
                </p>
                <p className="text-xs text-leather mt-2 font-sans">
                  Resoleu fites per la Guixa per anar-les desbloquejant aquí
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-sans text-leather mb-1">
                  {unlockedEvidenceIds.length} de {allEvidence.length} proves trobades
                </p>
                {allEvidence
                  .filter((e) => unlockedEvidenceIds.includes(e.id))
                  .map((evidence) => (
                    <div
                      key={evidence.id}
                      className="p-3.5 rounded-lg border border-[#1D3557]/25 bg-[#FAF5E9] shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{evidence.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-serif font-bold text-ink">
                            {evidence.catalan}
                          </h4>
                          <p className="text-sm text-ink/80 font-sans my-1">
                            {evidence.description}
                          </p>
                          <div className="text-xs text-leather font-sans">
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

        {/* Avís de l'Emissari guardat si ja ha saltat l'alerta */}
        {coartadaFrase && (
          <div className="max-w-xl mx-auto p-4 bg-[#3d0a0a] border-2 border-cochineal rounded-xl text-parchment shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="font-serif font-bold text-red-300 text-sm tracking-wide">
                  AVÍS DE L'EMISSARI
                </h3>
              </div>
              <span className="bg-cochineal/80 text-parchment border border-cochineal px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase">
                La teva Coartada
              </span>
            </div>
            <p className="text-xs text-gold italic mb-2 font-sans">
              "L'Emissari és pel poble interrogant a la gent. Se sap que pregunta per:"
            </p>
            <div className="bg-[#2a0606] border border-cochineal/70 rounded-lg p-3 text-center shadow-inner">
              <p className="font-serif italic text-parchment text-sm sm:text-base leading-relaxed">
                «{coartadaFrase}»
              </p>
            </div>
            <p className="text-[11px] text-red-200/80 text-center mt-2 font-sans">
              Muntar-vos una coartada no és mentir, fills. És salvar-vos. Cadascun de vosaltres porta un retall de la historia. Junts, heu de saber on éreu, amb qui, i per quant temps. La historia la compartiu tots. I serà la mateixa, sempre, sense relliscades. Que no doni una volta. Clar?
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
