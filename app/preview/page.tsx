'use client'

import { useState } from 'react'
import { getGameComponent, GAMES } from '@/components/games/registry'
import { SubmitResult } from '@/components/gameTypes'
import { SalconduitTab } from '@/components/player/SalconduitTab'
import { EmissariAlertModal } from '@/components/game/EmissariAlertModal'
import { NotebookTab } from '@/components/player/NotebookTab'
import { InstalledHomeScreen } from '@/components/player/InstalledHomeScreen'
import { PlayerNameInput } from '@/components/player/PlayerNameInput'
import { MapTab } from '@/components/player/MapTab'
import { IntroTab } from '@/components/player/IntroTab'
import { ResultsView } from '@/components/player/ResultsView'
import { BottomNav, type NavTabId } from '@/components/player/BottomNav'
import { PlayerTimer } from '@/components/player/PlayerTimer'
import { getAllStations } from '@/content/public/stations'
import type { TeamRow, SessionRow, TeamStationRow } from '@/lib/realtime/useTeamState'

const GAME_TABS = [
  { id: 'home-view', name: '🏠 Home', tag: 'Pantalla d\'inici' },
  { id: 'hub-view', name: '🏰 Hub del Joc', tag: 'Pantalla principal' },
  { id: 'mapa-fites-view', name: '🗺️ Mapa de les Fites', tag: 'Estacions' },
  { id: 'serrat-bruixes', name: '1. Serrat Bruixes', tag: 'Foc / Polibi' },
  { id: 'font-ferro', name: '2. Font del Ferro', tag: 'Tinta / Dates' },
  { id: 'planes-bones', name: '3. Planes Bones', tag: 'Ruta 4x4' },
  { id: 'cementiri', name: '4. Cementiri', tag: 'Làpides' },
  { id: 'salconduit-view', name: '🎖️ Salvos (Jugador)', tag: '2 Permisos + QR' },
  { id: 'emissari-alert-view', name: '⚠️ Avís 5 min', tag: 'Pop-up Coartada' },
  { id: 'pla-masset-accusation', name: '6. Acusació', tag: 'Traïdor' },
  { id: 'caixa-almoines', name: '7. Caixa Almoines', tag: '3 Fases' },
  { id: 'sometent-campanar', name: '8. Campanar', tag: 'Sometent · Decisió · Final' },
  { id: 'results-view', name: '🏆 Resultats Finals', tag: 'Pop-up de fi de partida' },
]

const PREVIEW_STATIONS: TeamStationRow[] = getAllStations()
  .slice(0, 2)
  .map((station, idx) => ({
    id: `preview-team-station-${idx}`,
    team_id: 'preview-team-id',
    station_id: station.id,
    solved: true,
    solved_at: new Date().toISOString(),
    attempts: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

const PREVIEW_RESULTS = {
  teamResult: {
    teamName: 'Els Conjurats de la Guixa',
    teamColor: '#1D3557',
    teamCode: 'EQUIP1',
    score: 480,
    timeElapsed: 4620,
    moralChoice: 'A',
    isCorrect: true,
    solvedStations: 8,
    salconduitsRemaining: 1,
  },
  ranking: [
    { id: '1', name: 'Els Conjurats de la Guixa', code: 'EQUIP1', color: '#1D3557', score: 480, timeElapsed: 4620, finished: true },
    { id: '2', name: 'La Ronda de Sentfores', code: 'EQUIP2', color: '#C99E32', score: 430, timeElapsed: 4980, finished: true },
    { id: '3', name: 'El Sometent', code: 'EQUIP3', color: '#8C6D53', score: 390, timeElapsed: 5100, finished: true },
  ],
}

const PREVIEW_COARTADES = [
  {
    name: 'Plantilla A: La Llevadora (Mas de la Carmeta)',
    frases: [
      'En Josep va portar aiguardent i draps nets al mas de la Carmeta durant la nit quan va arribar la llevadora.',
      'La matrona Miquel va entrar al mas quan els crits de la parturienta es sentien des del camí públic.',
      'En Ricard va estar tota la nit fora del mas portant aigua freda i brasa pel foc que escalfava l\'aigua.',
      'Els veïns propers juren que van veure moviment continu a la casa: anar i venir de dones amb pans i roba blanca.',
    ],
  },
  {
    name: 'Plantilla B: El Medicament (Pagès de la Farga)',
    frases: [
      'La Josepa estava malalta de calentura alta, i en Josep va córrer fins al Pare Miquel que guarda les herbes medicinals a la rectoria.',
      'En Tomàs va ser vist per quatre persones distintes carregant una bossa amb tònica de sàlvia i mel comprada a la casa de l\'Esteve.',
      'A la finestra de la casa hi havia una carteta clavada amb la recepta escrita pel Pare Miquel per curar la malaltia.',
      'L\'home del molí pot jurar que en Miquel va passar per la riera portant una ampoleta de líquid vermellós lligada a la cinta.',
    ],
  },
  {
    name: 'Plantilla C: Avisar el Rector (Difunt Josep)',
    frases: [
      'El Pare Miquel va cridar en Joan pel sacrament per anar a visitar un moribund al mas de Sots que estava morint de febres.',
      'En Valentí pot certificar-ho: era ell qui portava la llàntia blanca, l\'aigua beneïda i el santcrist del rector pel camí de serena.',
      'Els infants del poble van veure el sacerdot i el seu ajudant pujant cap a la capella de Sant Jaume amb les vestidures.',
      'El rector escriu al llibre de defuncions que va administrar els olis sants aquella nit a tres cases del terme.',
    ],
  },
  {
    name: 'Plantilla D: Persona Perduda (Al bosc)',
    frases: [
      'L\'oncle de la Fada va desaparèixer al capvespre, i la seva mare va cridar desesperada a tot el poble demanant gent per buscar-lo.',
      'Més de deu homes es van reunir amb torxes per cercar pels camps foscos, inclòs en Pau i en Miquel, fins ben entrada la matinada.',
      'Van trobar el fugitiu adormit sota el paller de l\'Esteve, confós i desorientat per la foscor i la soledat.',
      'Per això tots aquells homes de la partida van estar junts aquella nit sencera, sota les estrelles, buscant pels marges i les passeres.',
    ],
  },
  {
    name: 'Plantilla E: El Mestre d\'Obres (Gotera urgent)',
    frases: [
      'El mestre havia deixat tancat l\'estudi per pujar a la rectoria portant els comptes de les obres que el Pare Miquel li demanava urgentment.',
      'Els nens que aprenen lletres van declarar que en Jaume el mestre va arribar tard aquell dia, tot suant i assedegat de la pujada.',
      'En Josep, el fill del carnisser, va veure el mestre baixant ràpidament del camí de la rectoria amb papers a la mà i cara de preocupació.',
      'L\'ajudant del mestre, una noia del poble, va haver de tancar ella mateixa els portals de l\'estudi perquè el mestre no tornava aquella tarda.',
    ],
  },
]

const PREVIEW_EVIDENCES = [
  {
    id: 'mock-ev-1',
    team_id: 'preview-team-id',
    evidence_id: 'ev-foc-1',
    unlocked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-ev-2',
    team_id: 'preview-team-id',
    evidence_id: 'ev-tinta-2',
    unlocked_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
]

export default function PreviewPage() {
  const [selectedGame, setSelectedGame] = useState('serrat-bruixes')
  const [sharedState, setSharedState] = useState<unknown>({})
  const [submissionLog, setSubmissionLog] = useState<Array<{ time: string; data: unknown; result: SubmitResult }>>([])
  const [forceCorrect, setForceCorrect] = useState(true)

  // Estats per a la prova de l'Avís dels 5 minuts
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0)
  const [selectedFraseIdx, setSelectedFraseIdx] = useState(0)
  const [showAlertModal, setShowAlertModal] = useState(false)

  // Estat de pestanya activa dins la simulació del Hub del Joc
  const [hubTab, setHubTab] = useState<NavTabId>('historia')

  // Estats per al flux interactiu de la Pantalla d'Inici (Home -> Escanejar QR -> Demanar Nom -> Hub)
  const [homeStep, setHomeStep] = useState<'home' | 'scan' | 'name'>('home')
  const [previewTeamCode, setPreviewTeamCode] = useState('EQUIP1')
  const [previewPlayerName, setPreviewPlayerName] = useState('Bernat')

  const SPECIAL_VIEWS = ['home-view', 'hub-view', 'mapa-fites-view', 'salconduit-view', 'emissari-alert-view', 'results-view']
  const isSpecialView = SPECIAL_VIEWS.includes(selectedGame)
  const GameComponent = !isSpecialView ? getGameComponent(selectedGame) : null

  const activeFrase = PREVIEW_COARTADES[selectedTemplateIdx].frases[selectedFraseIdx]

  const mockTeam: TeamRow = {
    id: 'preview-team-id',
    code: 'EQUIP1',
    name: 'Els Conjurats de la Guixa',
    color: 'blue',
    variant: 'A',
    session_id: 'preview-session-id',
    created_at: new Date().toISOString(),
    is_active: true,
    started_at: new Date().toISOString(),
    finished_at: null,
    master_session_id: null,
  }

  const mockSession = {
    id: 'preview-session-id',
    current_act: 1,
    current_station: null,
    solved_stations: ['serrat-bruixes', 'font-ferro'],
    code_digits: ['4', '2', '', ''],
    evidence_unlocked: ['ev-foc-1', 'ev-tinta-2'],
    suspects_dismissed: [],
    salconduits_remaining: 2,
    salconduits_used: [],
    score: 200,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 5400000).toISOString(),
    created_at: new Date().toISOString(),
    discovered_at: null,
    master_id: null,
    solved_at: null,
  } as unknown as SessionRow

  const mockSubmit = async (answer: unknown): Promise<SubmitResult> => {
    const isCorrect = forceCorrect

    // Handle bells game - generate a sequence if requested
    const answerObj = answer as any
    if (answerObj?.moralChoice && !answerObj?.bellSequence) {
      // First call - return generated sequence
      const bellSequence = Array.from({ length: 8 }, () => Math.floor(Math.random() * 4))
      const result: any = {
        correct: false,
        message: 'Seqüència de campanades generada.',
        score: 0,
        sequence: bellSequence,
        epilogue: answerObj.moralChoice === 'A'
          ? 'Bernat i Jaume es reuniren a l\'estiu.\nNo tornaren mai més a la Guixa.\n\nPerò els conjurats van salvos.'
          : 'Jaume surt de presó tardor.\nBusca el seu pare a l\'escola.\nNo el troba.\n\nEls conjurats es salvaren.\nPerò al preu de la familia de Bernat.',
        decisionPercentage: { optionA: 55, optionB: 45 }
      }

      setSubmissionLog(prev => [
        {
          time: new Date().toLocaleTimeString('ca-ES'),
          data: answer,
          result,
        },
        ...prev.slice(0, 4),
      ])

      return result
    }

    if (answerObj?.lapidaId !== undefined || answerObj?.lapisaId !== undefined) {
      const lid = answerObj.lapidaId ?? answerObj.lapisaId
      const isLapida1 = String(lid) === '1' || String(answerObj.answer).toUpperCase() === 'CORMINAS'
      const result: SubmitResult = {
        correct: isLapida1,
        message: isLapida1 ? 'Enigma resolt correctament!' : 'Làpida incorrecta. Revisa la carta!',
        score: isLapida1 ? 100 : -10,
      }
      setSubmissionLog(prev => [
        {
          time: new Date().toLocaleTimeString('ca-ES'),
          data: answer,
          result,
        },
        ...prev.slice(0, 4),
      ])
      return result
    }

    const result: SubmitResult = {
      correct: isCorrect,
      message: isCorrect ? 'Enigma resolt correctament!' : 'Resposta incorrecta. Torna-ho a provar.',
      score: isCorrect ? 100 : -10,
    }

    setSubmissionLog(prev => [
      {
        time: new Date().toLocaleTimeString('ca-ES'),
        data: answer,
        result,
      },
      ...prev.slice(0, 4),
    ])

    return result
  }

  const handleSelectGame = (id: string) => {
    setSelectedGame(id)
    setSharedState({})
  }

  return (
    <div className="min-h-screen bg-[#F4EBD9] text-[#2B2118] flex flex-col font-serif">
      {/* Top Bar for Navigation between all games */}
      <header className="bg-[#1D3557] text-white px-4 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗝️</span>
            <div>
              <h1 className="text-base font-bold tracking-wide uppercase font-sans">
                Visor de Jocs — El Traïdor de la Guixa
              </h1>
              <p className="text-xs text-amber-200 font-sans">
                Mode Explorador: Prova interactiva dels enigmes i pantalles especials
              </p>
            </div>
          </div>

          {/* Validation toggle for testing both correct and incorrect feedback */}
          {!isSpecialView && (
            <div className="flex items-center gap-2 text-xs bg-[#162740] px-3 py-1.5 rounded-full border border-blue-400/30">
              <span className="font-sans text-gray-300">Resposta simulada:</span>
              <button
                onClick={() => setForceCorrect(true)}
                className={`px-2 py-0.5 rounded font-sans font-bold transition-all ${
                  forceCorrect ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                ✓ Correcta
              </button>
              <button
                onClick={() => setForceCorrect(false)}
                className={`px-2 py-0.5 rounded font-sans font-bold transition-all ${
                  !forceCorrect ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                ✗ Incorrecta
              </button>
            </div>
          )}
        </div>

        {/* Tab Selector */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {GAME_TABS.map(tab => {
            const isSelected = selectedGame === tab.id
            const isHighlight = tab.id === 'salconduit-view' || tab.id === 'emissari-alert-view'
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectGame(tab.id)}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap font-sans transition-all flex flex-col items-start ${
                  isSelected
                    ? 'bg-[#C99E32] text-[#2B2118] font-bold shadow'
                    : isHighlight
                    ? 'bg-amber-900/80 text-amber-100 hover:bg-amber-800 border border-amber-500/40'
                    : 'bg-[#2B466D] text-gray-200 hover:bg-[#3B5B8C]'
                }`}
              >
                <span>{tab.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-[#4A3A28]' : 'text-gray-300'}`}>
                  {tab.tag}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">
        <div className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl shadow-lg overflow-hidden min-h-[600px] flex flex-col">
          {/* PANTALLA ESPECIAL: HOME (PANTALLA D'INICI I ACCÉS) */}
          {selectedGame === 'home-view' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#DFD4BC] border-b border-[#8C6D53] p-3 text-xs font-sans flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1D3557]">
                    🏠 Pantalla d&apos;inici i accés de l&apos;equip
                  </span>
                  <span className="text-gray-600 block sm:inline sm:ml-2">
                    — Flux d&apos;entrada: Home → Escanejar QR d&apos;equip → Demanar nom → Hub del Joc
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {homeStep !== 'home' && (
                    <button
                      onClick={() => setHomeStep('home')}
                      className="bg-stone-200 hover:bg-stone-300 text-stone-700 px-2 py-0.5 rounded text-[11px] font-sans font-medium"
                    >
                      ↺ Tornar a l&apos;inici
                    </button>
                  )}
                  <span className="bg-[#C99E32] text-[#2B2118] font-bold px-2 py-0.5 rounded text-[11px]">
                    Vista Jugador
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {homeStep === 'home' && (
                  <InstalledHomeScreen onScan={() => setHomeStep('scan')} />
                )}

                {homeStep === 'scan' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#2B2118] text-[#F4EBD9]">
                    <div className="w-full max-w-md bg-[#382C22] border border-[#8C6D53] rounded-xl p-6 shadow-2xl text-center">
                      <div className="w-16 h-16 bg-[#1D3557] text-[#F4EBD9] rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-[#C99E32]">
                        📷
                      </div>
                      <h2 className="text-xl font-bold font-serif mb-2 text-[#EAE0CA]">
                        Escanejar codi QR d&apos;equip
                      </h2>
                      <p className="text-sm text-stone-300 mb-6 font-sans">
                        Apunta la càmera cap al codi QR que et proporciona el màster de joc, o introdueix el codi de 6 caràcters.
                      </p>

                      <div className="space-y-4 font-sans">
                        <button
                          onClick={() => {
                            setPreviewTeamCode('EQUIP1')
                            setHomeStep('name')
                          }}
                          className="w-full bg-[#1D3557] hover:bg-[#152740] text-[#F4EBD9] py-3 px-4 rounded-lg font-bold tracking-wide uppercase shadow flex items-center justify-center gap-2 transition-colors"
                        >
                          <span>⚡</span> Simular escaneig QR equip: [EQUIP1]
                        </button>

                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-stone-600"></div>
                          <span className="flex-shrink mx-4 text-xs text-stone-400 uppercase">o codi manual</span>
                          <div className="flex-grow border-t border-stone-600"></div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={previewTeamCode}
                            onChange={(e) => setPreviewTeamCode(e.target.value.toUpperCase())}
                            placeholder="CODI"
                            className="flex-1 text-center font-mono tracking-widest text-lg uppercase bg-white text-[#2B2118] rounded-lg px-3 py-2 border border-stone-400 focus:outline-none focus:border-[#C99E32]"
                          />
                          <button
                            onClick={() => {
                              if (previewTeamCode.trim().length === 6) {
                                setHomeStep('name')
                              }
                            }}
                            disabled={previewTeamCode.trim().length !== 6}
                            className="bg-[#C99E32] hover:bg-[#b08826] disabled:opacity-50 text-[#2B2118] font-bold px-4 py-2 rounded-lg uppercase text-sm transition-colors"
                          >
                            Continuar
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setHomeStep('home')}
                        className="mt-6 text-xs text-stone-400 underline hover:text-stone-200 font-sans"
                      >
                        Cancel·lar i tornar a l&apos;inici
                      </button>
                    </div>
                  </div>
                )}

                {homeStep === 'name' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-white">
                    <div className="w-full max-w-md">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-amber-900 mb-1 font-serif">
                          El Traïdor de la Guixa
                        </h1>
                        <p className="text-base text-amber-700 mb-2 font-sans">
                          Entrada de Jugador
                        </p>
                        <p className="text-xs text-amber-800 font-mono tracking-widest bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
                          Equip: <strong>{previewTeamCode}</strong>
                        </p>
                      </div>

                      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 border-amber-200">
                        <div className="mb-4 text-center">
                          <p className="text-sm text-amber-700 font-sans">
                            Introdueix el teu nom per entrar al joc
                          </p>
                        </div>

                        <PlayerNameInput
                          value={previewPlayerName}
                          onChange={setPreviewPlayerName}
                          onSubmit={() => {
                            // En trametre el nom, va directament al hub del joc!
                            handleSelectGame('hub-view')
                          }}
                        />

                        <div className="mt-6 pt-4 border-t border-amber-100 text-center font-sans">
                          <p className="text-xs text-amber-600">
                            En prémer «Entrar al Joc» accediràs directament al Hub
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANTALLA ESPECIAL: HUB DEL JOC (PANTALLA PRINCIPAL) */}
          {selectedGame === 'hub-view' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#DFD4BC] border-b border-[#8C6D53] p-3 text-xs font-sans flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1D3557]">
                    🏰 Hub del Joc
                  </span>
                  <span className="text-gray-600 block sm:inline sm:ml-2">
                    — Pantalla principal després d&apos;entrar a l&apos;equip: capçalera amb cronòmetre i estadístiques, pestanyes i navegació inferior
                  </span>
                </div>
                <span className="bg-[#C99E32] text-[#2B2118] font-bold px-2 py-0.5 rounded text-[11px]">
                  Vista Jugador
                </span>
              </div>

              <div className="flex-1 flex flex-col bg-parchment text-ink min-h-[600px]">
                <header className="bg-parchment border-b-2 border-[#8C6D53] shadow-sm text-center">
                  <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
                    <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold block">
                      Equip: {mockTeam.name} {previewPlayerName ? `· Jugador: ${previewPlayerName}` : ''}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] font-serif mt-1 uppercase">
                      El Traïdor de la Guixa
                    </h1>

                    <div className="mt-2.5 flex justify-center">
                      <PlayerTimer status="active" expiresAt={mockSession.expires_at} />
                    </div>

                    <div className="mt-3 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm font-sans font-bold text-[#2B2118]">
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{PREVIEW_STATIONS.length}/8 Estacions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📋</span>
                        <span>{PREVIEW_EVIDENCES.length} Proves</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🎫</span>
                        <span>{mockSession.salconduits_remaining} Salvos</span>
                      </div>
                    </div>
                  </div>
                </header>

                <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {hubTab === 'map' && (
                      <MapTab stations={PREVIEW_STATIONS} teamId={mockTeam.id} />
                    )}

                    {hubTab === 'notebook' && (
                      <NotebookTab
                        evidences={PREVIEW_EVIDENCES}
                        stations={PREVIEW_STATIONS}
                        coartadaFrase={activeFrase}
                      />
                    )}

                    {hubTab === 'historia' && (
                      <IntroTab onOpenMap={() => setHubTab('map')} />
                    )}

                    {hubTab === 'salconduit' && (
                      <SalconduitTab
                        team={mockTeam}
                        session={mockSession}
                        passes={[]}
                        onOpenNotebook={() => setHubTab('notebook')}
                      />
                    )}
                  </div>
                </main>

                <BottomNav
                  activeTab={hubTab}
                  onTabChange={setHubTab}
                  evidencesCount={PREVIEW_EVIDENCES.length}
                  salconduitsRemaining={mockSession.salconduits_remaining ?? 0}
                  isGameActive={false}
                  onCenterAction={() => handleSelectGame('serrat-bruixes')}
                />
              </div>
            </div>
          )}

          {/* PANTALLA ESPECIAL: MAPA DE LES FITES */}
          {selectedGame === 'mapa-fites-view' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#DFD4BC] border-b border-[#8C6D53] p-3 text-xs font-sans flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1D3557]">
                    🗺️ Mapa de les Fites
                  </span>
                  <span className="text-gray-600 block sm:inline sm:ml-2">
                    — Estacions del joc situades al mapa, amb l&apos;estat de cada equip
                  </span>
                </div>
                <span className="bg-[#C99E32] text-[#2B2118] font-bold px-2 py-0.5 rounded text-[11px]">
                  Vista Jugador
                </span>
              </div>

              <div className="flex-1 h-[600px]">
                <MapTab stations={PREVIEW_STATIONS} teamId={mockTeam.id} />
              </div>
            </div>
          )}

          {/* PANTALLA ESPECIAL 1: SALVOS (JUGADOR) */}
          {selectedGame === 'salconduit-view' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#DFD4BC] border-b border-[#8C6D53] p-3 text-xs font-sans flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1D3557]">
                    🎖️ Pantalla oficial «Salvos» del jugador
                  </span>
                  <span className="text-gray-600 block sm:inline sm:ml-2">
                    — Document de 1705 amb els 2 permisos col·lectius i el codi QR per a l'Emissari
                  </span>
                </div>
                <span className="bg-[#C99E32] text-[#2B2118] font-bold px-2 py-0.5 rounded text-[11px]">
                  Vista Jugador
                </span>
              </div>

              <SalconduitTab
                team={mockTeam}
                session={mockSession}
                passes={[]}
                onOpenNotebook={() => handleSelectGame('emissari-alert-view')}
              />
            </div>
          )}

          {/* PANTALLA ESPECIAL 2: AVÍS DELS 5 MINUTS I GUARDAT AL QUADERN */}
          {selectedGame === 'emissari-alert-view' && (
            <div className="flex-1 p-4 sm:p-6 flex flex-col gap-6">
              {/* Panell explicatiu de control */}
              <div className="bg-[#DFD4BC] border-2 border-[#8C6D53] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-[#1D3557]">
                      Simulador de l'Avís de l'Emissari (5 minuts post-2 proves)
                    </h2>
                  </div>
                  <span className="bg-red-800 text-white font-sans font-bold px-2.5 py-0.5 rounded text-xs">
                    Pop-up + Quadern
                  </span>
                </div>

                <p className="text-xs text-[#5C4533] italic mb-4">
                  Quan l'equip ha resolt 2 proves i transcorren 5 minuts, la webapp dispara aquest avís emergent. Un cop tancat amb «ENTÈS», la coartada queda desada al Quadern d'Investigació.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-sans font-bold text-[#8C6D53] mb-1">
                      Coartada de l'equip:
                    </label>
                    <select
                      value={selectedTemplateIdx}
                      onChange={e => setSelectedTemplateIdx(Number(e.target.value))}
                      className="w-full p-2 bg-[#F4EBD9] border border-[#8C6D53] rounded text-xs font-serif text-[#2B2118]"
                    >
                      {PREVIEW_COARTADES.map((t, idx) => (
                        <option key={idx} value={idx}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-[#8C6D53] mb-1">
                      Frase del jugador (repartiment secret):
                    </label>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map(i => (
                        <button
                          key={i}
                          onClick={() => setSelectedFraseIdx(i)}
                          className={`flex-1 py-1.5 text-xs font-sans font-bold rounded border transition ${
                            selectedFraseIdx === i
                              ? 'bg-[#1D3557] text-white border-[#1D3557]'
                              : 'bg-[#F4EBD9] text-[#5C4533] border-[#8C6D53] hover:bg-[#D8CCAE]'
                          }`}
                        >
                          Jugador {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botó per disparar el pop-up de l'avís */}
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="w-full py-3 px-4 bg-red-700 hover:bg-red-800 active:scale-98 text-white rounded-xl font-sans font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>⚠️</span>
                  <span>DISPARAR EL POP-UP DE L'AVÍS DE L'EMISSARI</span>
                </button>
              </div>

              {/* Previsualització de com queda desat al Quadern */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="font-serif font-bold text-sm text-[#1D3557] flex items-center gap-1.5">
                    <span>📔</span> Com es veu al Quadern un cop tancat l'avís:
                  </h3>
                  <span className="text-xs text-gray-500 font-sans italic">
                    (Visible en tot moment pels jugadors)
                  </span>
                </div>

                <div className="bg-white rounded-xl border-2 border-[#8C6D53] shadow overflow-hidden h-[420px] flex flex-col">
                  <NotebookTab
                    evidences={PREVIEW_EVIDENCES}
                    stations={PREVIEW_STATIONS}
                    coartadaFrase={activeFrase}
                  />
                </div>
              </div>

              {/* Modal emergent de l'Emissari */}
              <EmissariAlertModal
                show={showAlertModal}
                frase={activeFrase}
                onDismiss={() => setShowAlertModal(false)}
              />
            </div>
          )}

          {/* PANTALLA ESPECIAL 3: RESULTATS FINALS (FI DE PARTIDA) */}
          {selectedGame === 'results-view' && (
            <div className="flex-1 flex flex-col">
              <div className="bg-[#DFD4BC] border-b border-[#8C6D53] p-3 text-xs font-sans flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1D3557]">
                    🏆 Pantalla final de fi de partida
                  </span>
                  <span className="text-gray-600 block sm:inline sm:ml-2">
                    — Es mostra quan la campana toca o l&apos;equip envia l&apos;acusació: veredicte, epíleg i classificació
                  </span>
                </div>
                <span className="bg-[#C99E32] text-[#2B2118] font-bold px-2 py-0.5 rounded text-[11px]">
                  Vista Jugador
                </span>
              </div>

              <div className="flex-1">
                <ResultsView teamResult={PREVIEW_RESULTS.teamResult} ranking={PREVIEW_RESULTS.ranking} />
              </div>
            </div>
          )}

          {/* JOCS ESTÀNDARD */}
          {!isSpecialView && GameComponent && (
            <div className="p-2 sm:p-4 flex-1">
              <GameComponent
                stationId={selectedGame}
                content={{}}
                sharedState={sharedState}
                setSharedState={setSharedState}
                submit={mockSubmit}
                solved={false}
              />
            </div>
          )}

          {!isSpecialView && !GameComponent && (
            <div className="p-8 text-center text-red-700">
              No s'ha trobat el joc seleccionat.
            </div>
          )}

          {/* Submission activity log at bottom */}
          {!isSpecialView && submissionLog.length > 0 && (
            <div className="border-t border-[#8C6D53] bg-[#DFD4BC] p-3 text-xs font-sans">
              <div className="font-bold text-[#2B2118] mb-1 flex items-center justify-between">
                <span>Darrers intents enviats al joc:</span>
                <button
                  onClick={() => setSubmissionLog([])}
                  className="text-gray-600 hover:text-black underline"
                >
                  Netejar registre
                </button>
              </div>
              <div className="space-y-1">
                {submissionLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-600">[{log.time}]</span>
                    <span className={log.result.correct ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      {log.result.correct ? '✓ CORREC' : '✗ ERROR'}
                    </span>
                    <span className="text-gray-800 truncate">
                      Dades: {JSON.stringify(log.data)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
