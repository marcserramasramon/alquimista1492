'use client'

import { useState, Fragment } from 'react'
import { STORY_ENTRIES } from '@/content/public/story'
import type { TeamStationRow } from '@/lib/realtime/useTeamState'
import { getTeamStation } from '@/lib/realtime/useTeamState'

interface IntroTabProps {
  stations?: TeamStationRow[]
  onOpenMap?: () => void
}

/**
 * Renderitza un paràgraf amb suport per **text en negreta**.
 */
function renderParagraph(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-prussian">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}

/**
 * Pestanya "Història" (PRD pantalla 6 "Intro"): recull seleccionable de les
 * entrades narratives que s'han anat desbloquejant. La primera entrada (la
 * intro de l'Acte I) sempre és accessible; la resta es desbloquegen en
 * resoldre l'estació corresponent (p. ex. l'Alerta dels Vigies al Serrat de
 * les Bruixes, o la Història a la Font del Ferro).
 */
export function IntroTab({ stations = [], onOpenMap }: IntroTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const isUnlocked = (entry: (typeof STORY_ENTRIES)[number]) => {
    if (!entry.stationId) return true
    if (getTeamStation(stations, entry.stationId)?.solved) return true
    if (entry.stationAliases?.some((alias) => getTeamStation(stations, alias)?.solved)) {
      return true
    }
    return false
  }

  const unlockedCount = STORY_ENTRIES.filter((e) => isUnlocked(e)).length
  const selectedEntry = STORY_ENTRIES.find((e) => e.id === selectedId)

  if (selectedEntry) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setSelectedId(null)}
            className="mb-4 text-sm font-sans font-bold text-leather flex items-center gap-1"
          >
            <span aria-hidden>←</span> Tornar al recull
          </button>

          <header className="border-b-2 border-leather pb-3 mb-5 text-center">
            <span className="text-xs uppercase tracking-widest text-leather font-sans font-bold">
              {selectedEntry.eyebrow}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-serif mt-1">
              {selectedEntry.title}
            </h1>
          </header>

          <div className="space-y-4 font-serif text-ink text-sm sm:text-base leading-relaxed">
            {selectedEntry.paragraphs.map((p, i) => (
              <p key={i} className={p.startsWith('**') && p.endsWith('**') ? 'font-bold text-prussian' : ''}>
                {renderParagraph(p)}
              </p>
            ))}
          </div>

          {selectedEntry.id === 'intro' && onOpenMap && (
            <button
              onClick={onOpenMap}
              className="mt-8 w-full bg-prussian text-parchment font-accent text-sm uppercase tracking-wide rounded-lg py-3 shadow-md min-h-[48px]"
            >
              Anar al Mapa
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-md mx-auto">
        <header className="border-b-2 border-leather pb-3 mb-5 text-center">
          <span className="text-xs uppercase tracking-widest text-leather font-sans font-bold">
            Recull de Fets
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-serif mt-1">
            Història
          </h1>
          <p className="text-xs text-leather font-sans mt-1">
            {unlockedCount} de {STORY_ENTRIES.length} entrades desbloquejades
          </p>
        </header>

        <div className="space-y-3">
          {STORY_ENTRIES.map((entry) => {
            const unlocked = isUnlocked(entry)
            return (
              <button
                key={entry.id}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && setSelectedId(entry.id)}
                data-testid={`historia-entrada-${entry.id}`}
                className={`w-full text-left p-3.5 rounded-lg border shadow-sm flex items-start gap-3 min-h-[48px] transition-colors ${
                  unlocked
                    ? 'bg-[#FAF5E9] border-leather/40 active:bg-[#F2E5C8]'
                    : 'bg-[#EAE0CA]/50 border-leather/20 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-2xl leading-none">{unlocked ? entry.icon : '🔒'}</div>
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-ink text-sm sm:text-base">
                    {unlocked ? entry.title : 'Entrada bloquejada'}
                  </h3>
                  <p className="text-xs text-leather font-sans mt-0.5">
                    {unlocked ? entry.eyebrow : 'Resol l’estació corresponent per desbloquejar-la'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
