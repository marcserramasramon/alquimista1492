'use client'

import { useState, Fragment } from 'react'
import { STORY_ENTRIES } from '@/content/public/story'
import type { TeamStationRow, TeamEvidenceRow } from '@/lib/realtime/useTeamState'
import { getTeamStation } from '@/lib/realtime/useTeamState'

interface IntroTabProps {
  stations?: TeamStationRow[]
  evidences?: TeamEvidenceRow[]
  onOpenMap?: () => void
  /** Entrada a obrir directament en muntar-se (p. ex. la intro, el primer cop que el jugador obre l'app). Només es té en compte en el muntatge inicial. */
  initialEntryId?: string
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
export function IntroTab({ stations = [], evidences = [], onOpenMap, initialEntryId }: IntroTabProps) {
  // L'entrada inicial (si n'hi ha) només es té en compte en muntar-se: un
  // cop obert el component, canvis posteriors de la prop no l'afecten,
  // perquè els cops següents que es visiti la pestanya s'hi vegi el recull.
  const [selectedId, setSelectedId] = useState<string | null>(() => initialEntryId ?? null)

  const isUnlocked = (entry: (typeof STORY_ENTRIES)[number]) => {
    if (!entry.stationId) return true
    if (getTeamStation(stations, entry.stationId)?.solved) return true
    if (entry.stationAliases?.some((alias) => getTeamStation(stations, alias)?.solved)) {
      return true
    }
    // Also check if matches an unlocked evidence (e.g. carta_lliurada)
    if (evidences.some((ev) => ev.evidence_id === entry.stationId || entry.stationAliases?.includes(ev.evidence_id))) {
      return true
    }
    return false
  }

  const unlockedCount = STORY_ENTRIES.filter((e) => isUnlocked(e)).length
  const selectedEntry = STORY_ENTRIES.find((e) => e.id === selectedId)

  if (selectedEntry) {
    return (
      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <div className="w-full max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedId(null)}
            className="pt-4 mb-4 text-sm font-sans font-bold text-leather flex items-center gap-1"
          >
            <span aria-hidden>←</span> Tornar al recull
          </button>

          <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-leather pb-2 mb-4 text-center">
            <span className="text-xs uppercase tracking-widest text-leather font-sans font-bold">
              {selectedEntry.eyebrow}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-serif mt-0.5">
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
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24">
      <div className="w-full max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-parchment pt-3 border-b-2 border-leather pb-2 mb-4 text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink font-serif">
            Història
          </h1>
          <p className="text-xs text-leather font-sans mt-0.5">
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
