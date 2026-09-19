'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { useAudio } from '@/lib/audio/useAudio'
import { getAllSuspects } from '@/content/public/suspects'
import { getAllEvidence, getEvidence, getCanonicalEvidenceId, type Evidence } from '@/content/public/evidence'
import { getAllStations } from '@/content/public/stations'
import type { TeamEvidenceRow, TeamStationRow } from '@/lib/realtime/useTeamState'
import { getTeamStation } from '@/lib/realtime/useTeamState'

interface NotebookTabProps {
  evidences: TeamEvidenceRow[]
  stations?: TeamStationRow[]
  coartadaFrase?: string | null
  teamCode?: string
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

export function NotebookTab({
  evidences,
  stations = [],
  coartadaFrase,
  teamCode = 'EQUIP1',
}: NotebookTabProps) {
  const router = useRouter()
  const { play } = useAudio()
  const [view, setView] = useState<NotebookView>('fites')
  const [showLetterModal, setShowLetterModal] = useState(false)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const allSuspects = getAllSuspects()
  const allEvidence = getAllEvidence()
  const fites = getAllStations().filter((s) => FITES_IDS.has(s.id))

  const rawUnlockedIds = evidences.map((e) => e.evidence_id)
  const unlockedEvidenceIds = Array.from(
    new Set(rawUnlockedIds.map((id) => getCanonicalEvidenceId(id)))
  )

  const unlockedEvidenceList: Evidence[] = unlockedEvidenceIds.map((id) => {
    const existing = getEvidence(id)
    if (existing) return existing
    return {
      id,
      name: id,
      catalan: `Prova: ${id}`,
      description: 'Pista recollida durant la investigació.',
      discoveredAt: 'Investigació',
      category: 'observation',
      icon: '📜',
    }
  })

  const solvedFitesCount = fites.filter((f) => getTeamStation(stations, f.id)?.solved).length

  // Comprovar si tenen la carta falsa desbloquejada
  const hasCartaFalsa =
    unlockedEvidenceIds.includes('carta_falsa') ||
    unlockedEvidenceIds.includes('carta_lliurada') ||
    stations.some((s) => s.station_id.includes('caixa') && s.solved)

  // Estat de lliurament de la carta a l'Emissari
  const [isLetterDelivered, setIsLetterDelivered] = useState(() =>
    unlockedEvidenceIds.includes('carta_lliurada')
  )

  // Sincronitzar si canvia per props
  useEffect(() => {
    if (unlockedEvidenceIds.includes('carta_lliurada') && !isLetterDelivered) {
      setIsLetterDelivered(true)
    }
  }, [unlockedEvidenceIds, isLetterDelivered])

  // Polling en segon pla per detectar quan l'Emissari valida la carta
  useEffect(() => {
    if (isLetterDelivered || !hasCartaFalsa) return
    let interval: NodeJS.Timeout | null = null
    let isMounted = true

    const checkLetterStatus = async () => {
      try {
        const res = await fetch(`/api/emissari/validate-letter?teamCode=${teamCode}`)
        if (res.ok) {
          const data = await res.json()
          if (data.isLetterValidated && isMounted) {
            setIsLetterDelivered(true)
            play('evidence-unlock')
            return true
          }
        }
      } catch (err) {
        console.error('Error comprovant la carta al quadern:', err)
      }
      return false
    }

    checkLetterStatus().then((validated) => {
      if (!validated && isMounted) {
        interval = setInterval(async () => {
          const done = await checkLetterStatus()
          if (done && interval) clearInterval(interval)
        }, 2500)
      }
    })

    return () => {
      isMounted = false
      if (interval) clearInterval(interval)
    }
  }, [teamCode, isLetterDelivered, hasCartaFalsa, play])

  // Generar QR de la carta quan s'obre el modal
  useEffect(() => {
    if (!showLetterModal || !qrCanvasRef.current) return
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const qrTargetUrl = `${origin}/emissari/carta/${teamCode}`

    QRCode.toCanvas(
      qrCanvasRef.current,
      qrTargetUrl,
      {
        width: 175,
        margin: 1,
        color: {
          dark: '#2B2118',
          light: '#F4EBD9',
        },
      },
      (err) => {
        if (err) console.error('Error generant QR de la carta al quadern:', err)
      }
    )
  }, [showLetterModal, teamCode])

  const tabs: { id: NotebookView; label: string; icon: string; badge?: number }[] = [
    { id: 'fites', label: 'Fites', icon: '🚩', badge: solvedFitesCount },
    { id: 'suspects', label: 'Sospitosos', icon: '🕵️' },
    { id: 'evidence', label: 'Proves', icon: '📜', badge: unlockedEvidenceList.length },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-parchment">
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Header — mateixa estètica que Història */}
        <header className="border-b-2 border-leather pb-3 mb-4 text-center">
          <span className="text-xs uppercase tracking-widest text-leather font-sans font-bold">
            Investigació
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-serif mt-1">
            Quadern
          </h1>
          <p className="text-xs text-leather font-sans mt-1">
            {solvedFitesCount} de {fites.length} fites superades • {unlockedEvidenceList.length} proves recollides
          </p>
        </header>

        {/* BÀNER DESTACAT DE LA CARTA PER A L'EMISSARI (QUAN DESBLOQUEJADA) */}
        {hasCartaFalsa && (
          <div
            className={`p-4 rounded-xl border-2 shadow-md flex items-center justify-between gap-3 ${
              isLetterDelivered
                ? 'bg-gradient-to-r from-emerald-950/20 via-emerald-800/15 to-emerald-950/20 border-emerald-600/50'
                : 'bg-gradient-to-r from-amber-900/15 via-[#C99E32]/20 to-amber-900/15 border-[#C99E32]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{isLetterDelivered ? '✅' : '✉️'}</span>
              <div>
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider block ${
                    isLetterDelivered ? 'text-emerald-800' : 'text-[#8C6D53]'
                  }`}
                >
                  {isLetterDelivered ? 'FASE COMPLETADA' : 'MISSIÓ ACTIVA · PLA DE MASSET'}
                </span>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#2B2118]">
                  {isLetterDelivered ? 'Carta Lliurada a l\'Emissari' : 'Carta Falsa per a l\'Emissari'}
                </h4>
                <p className="text-[11px] text-[#5C4533] font-sans">
                  {isLetterDelivered
                    ? 'L\'Emissari ha marxat enganyat. Campanar desbloquejat!'
                    : 'Obriu la carta i mostreu el codi QR a l\'Emissari.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLetterModal(true)}
              className={`px-3 py-2 text-xs font-bold font-sans rounded-lg shadow transition whitespace-nowrap cursor-pointer ${
                isLetterDelivered
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  : 'bg-[#1D3557] hover:bg-[#2B4C7E] text-white'
              }`}
            >
              {isLetterDelivered ? 'Veure Carta' : 'Obrir Carta i QR →'}
            </button>
          </div>
        )}

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
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                          {station.elementImage ? (
                            <img src={station.elementImage} alt={station.catalan} className="w-9 h-9 object-contain drop-shadow" />
                          ) : (
                            <span className="text-3xl leading-none">{station.icon}</span>
                          )}
                        </div>
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
                          {solved && station.elementImage && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D3557] text-[#FAF5E9] text-[11px] font-serif shadow-xs">
                              <img src={station.elementImage} alt="" className="w-4 h-4 object-contain" />
                              <span>
                                Element descobert: <strong>
                                  {station.id.includes('serrat') ? 'FOC = 4' :
                                   station.id.includes('font') ? 'AIGUA = 2' :
                                   station.id.includes('plane') ? 'TERRA = 3' :
                                   station.id.includes('cementiri') ? 'AIRE = 1' : ''}
                                </strong>
                              </span>
                            </div>
                          )}
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
                {/* Carta Falsa destacada al capdamunt de Proves si està disponible */}
                {hasCartaFalsa && (
                  <div className="p-4 rounded-xl border-2 border-[#8C6D53] bg-[#FAF5E9] shadow-md space-y-2 mb-3">
                    <div className="flex items-start justify-between gap-2 border-b border-[#8C6D53]/25 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">✉️</span>
                        <div>
                          <h4 className="font-serif font-bold text-ink">
                            Carta falsa per a l'Emissari
                          </h4>
                          <p className="text-xs text-leather font-sans">
                            Segell autèntic de Bernat Mas (✓✓) · Document per lliurar
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-sans font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                          isLetterDelivered
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isLetterDelivered ? '✓ Lliurada' : 'Pendent'}
                      </span>
                    </div>

                    <p className="text-xs text-ink/80 font-sans">
                      Carta preparada per mossèn Ramon amb la llista de noms manipulada. Mostreu-ne el codi QR a l&apos;Emissari reial al Pla de Masset perquè l&apos;escanegi.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowLetterModal(true)}
                      className="w-full py-2.5 px-4 bg-[#1D3557] hover:bg-[#2B4C7E] text-white text-xs sm:text-sm font-bold font-sans rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      <span>🔍</span>
                      <span>{isLetterDelivered ? 'Veure Carta i Detalls' : 'Obrir Carta i Ensenyar Codi QR a l\'Emissari'}</span>
                    </button>
                  </div>
                )}

                {unlockedEvidenceList.length === 0 && !hasCartaFalsa ? (
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
                      {unlockedEvidenceList.length} proves recollides
                    </p>
                    {unlockedEvidenceList.map((evidence) => (
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
          <div className="w-full max-w-4xl mx-auto p-4 bg-[#3d0a0a] border-2 border-cochineal rounded-xl text-parchment shadow-lg">
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

      {/* MODAL DE LA CARTA FALSA AMB CODI QR I BLOC DE FASE COMPLETADA */}
      {showLetterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF5E9] border-2 border-[#8C6D53] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4">
            {/* Capçalera del Modal */}
            <div className="flex items-center justify-between border-b-2 border-[#8C6D53]/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✉️</span>
                <h3 className="font-serif font-bold text-lg text-[#2B2118]">
                  Carta per a l'Emissari
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLetterModal(false)}
                className="w-8 h-8 rounded-full bg-[#EAE0CA] hover:bg-[#D8CCAE] text-[#5C4533] font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document de la carta */}
            <div className="bg-[#F4EBD9] border border-[#8C6D53]/60 p-4 rounded-xl shadow-inner font-serif space-y-3">
              <div className="border-b border-[#8C6D53]/30 pb-2 text-xs text-[#5C4533] space-y-0.5">
                <p><span className="font-bold">Remitent:</span> Bernat Mas (Mestre d&apos;Escola)</p>
                <p><span className="font-bold">Destinatari:</span> L&apos;Emissari del Virrei (Pla de Masset)</p>
                <p><span className="font-bold">Segell:</span> Segell autèntic de Bernat (✓✓)</p>
                <p><span className="font-bold">Contrasenya verbal:</span> <span className="text-[#1D3557] font-bold">«L'alba ve de Vic»</span></p>
              </div>

              <div className="text-xs sm:text-sm text-[#2B2118] italic leading-relaxed space-y-2 border-l-2 border-[#8C6D53]/50 pl-3">
                <p>
                  «Al Capità de la Guarnició de Vic,<br />
                  Aquests són els noms i les fites dels conjurats de la Guixa que han de signar a l&apos;ermita de Sant Sebastià a trenc d&apos;alba: [Llista fictícia elaborada per mossèn Ramon amb noms manipulats per despistar el Virrei].
                </p>
                <p className="text-right not-italic font-bold font-serif pt-1">
                  — Bernat Mas, Mestre»
                </p>
              </div>
            </div>

            {/* Codi QR per a l'Emissari */}
            <div className="bg-[#F4EBD9] border border-[#8C6D53] p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#8C6D53] mb-1">
                Codi QR de la Carta
              </span>
              <p className="text-xs text-[#5C4533] italic mb-3">
                {isLetterDelivered
                  ? 'Aquest codi ja ha estat validat per l\'Emissari.'
                  : 'Mostreu aquest codi a l\'Emissari al Pla de Masset perquè l\'escanegi.'}
              </p>
              <div className="bg-[#FAF5E9] p-2 rounded-lg border border-[#8C6D53]/40 shadow-inner">
                <canvas ref={qrCanvasRef} className="rounded" />
              </div>
              <p className="text-[11px] font-mono text-[#8C6D53] mt-2 font-bold">
                Equip: {teamCode}
              </p>

              {!isLetterDelivered && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#8C6D53] font-sans animate-pulse">
                  <span>⏳</span>
                  <span>Esperant validació de l'Emissari...</span>
                </div>
              )}
            </div>

            {/* BLOC DE FASE COMPLETADA (APAREIX UN COP LLIURADA LA CARTA) */}
            {isLetterDelivered && (
              <div className="p-4 bg-[#1D3557] text-[#FAF5E9] rounded-xl border-2 border-[#C99E32] text-center font-serif shadow-lg space-y-2.5 animate-fadeIn">
                <div className="text-3xl">🎉</div>
                <span className="text-xs font-mono uppercase text-[#C99E32] font-bold tracking-wider block">
                  FASE COMPLETADA · CARTA ACCEPTADA
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  L&apos;Emissari ha caigut en l&apos;engany i marxa cap a Vic!
                </h3>
                <p className="text-xs text-[#D8CCAE] font-sans">
                  Ha donat la carta per autèntica i la porta del campanar ha quedat lliure.
                </p>

                {/* Nota de la Història i Campanar */}
                <div className="p-3 bg-amber-950/60 rounded-lg border border-amber-400/40 text-xs text-amber-100 space-y-2 text-left font-sans mt-2">
                  <p className="font-bold flex items-start gap-2 text-amber-300">
                    <span className="text-base leading-none">📜</span>
                    <span>
                      Mireu la pestanya <strong>Història</strong>: s&apos;ha desbloquejat la nova entrada <em>«L&apos;Emissari Marxa Enganyat»</em>!
                    </span>
                  </p>
                  <p className="font-bold flex items-start gap-2 text-amber-300">
                    <span className="text-base leading-none">🔔</span>
                    <span>
                      S&apos;ha desbloquejat el joc del <strong>Campanar de Sant Sebastià</strong> al Mapa!
                    </span>
                  </p>
                </div>

                {/* Botó directe per anar al Campanar */}
                <button
                  type="button"
                  onClick={() => {
                    setShowLetterModal(false)
                    router.push('/s/sometent-campanar')
                  }}
                  className="w-full py-3.5 px-4 bg-[#C99E32] hover:bg-[#B38A25] text-[#1D3557] font-bold font-sans rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm mt-2"
                >
                  <span>🔔</span>
                  <span>ANAR AL CAMPANAR DE SANT SEBASTIÀ →</span>
                </button>
              </div>
            )}

            {/* Botó Tancar Modal */}
            <button
              type="button"
              onClick={() => setShowLetterModal(false)}
              className="w-full py-2.5 px-4 bg-[#EAE0CA] hover:bg-[#D8CCAE] text-[#5C4533] font-bold font-sans rounded-xl transition text-xs sm:text-sm cursor-pointer"
            >
              Tancar Finestra
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
