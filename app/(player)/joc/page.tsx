'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/db'
import { useTeamState } from '@/lib/realtime/useTeamState'
import { useGameClockAlerts } from '@/lib/realtime/useGameClockAlerts'
import { useGameNavigation } from '@/lib/context/GameNavigationContext'
import { useEmissariAlert } from '@/lib/hooks/useEmissariAlert'
import { MapTab } from '@/components/player/MapTab'
import { IntroTab } from '@/components/player/IntroTab'
import { NotebookTab } from '@/components/player/NotebookTab'
import { SalconduitTab } from '@/components/player/SalconduitTab'
import { AccuseTab } from '@/components/player/AccuseTab'
import { QRScanner } from '@/components/player/QRScanner'
import { BottomNav } from '@/components/player/BottomNav'
import { PlayerStatusBar } from '@/components/player/PlayerStatusBar'
import { GameStartedModal } from '@/components/player/GameStartedModal'
import { BellRungModal } from '@/components/player/BellRungModal'
import { EmissariAlertModal } from '@/components/game/EmissariAlertModal'

type Tab = 'map' | 'notebook' | 'historia' | 'salconduit' | 'accuse'

interface PlayerSession {
  playerId: string
  teamId: string
  teamName: string
  teamColor?: string
}

function JocHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const { gameState, isGameActive } = useGameNavigation()
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (tabParam && ['map', 'notebook', 'historia', 'salconduit', 'accuse'].includes(tabParam)) {
      return tabParam
    }
    return 'map'
  })
  // Entrada de la Història a obrir de seguida (només el primer cop que el
  // jugador obre l'app, veu directament "El Pacte Traït").
  const [autoIntroEntryId, setAutoIntroEntryId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (tabParam && ['map', 'notebook', 'historia', 'salconduit', 'accuse'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Qualsevol canvi de pestanya manual (barra inferior) neteja l'obertura
  // automàtica de la Història, perquè només afecti la primera vegada.
  const handleTabChange = useCallback((tab: Tab) => {
    setAutoIntroEntryId(undefined)
    setActiveTab(tab)
  }, [])

  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingAccusation, setIsSubmittingAccusation] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const teamState = useTeamState(playerSession?.teamId)
  const { showAlert, dismissAlert, coartadaFrase } = useEmissariAlert(teamState.evidences, playerSession?.teamId)
  const gameClock = useGameClockAlerts()

  // Get player session on mount
  useEffect(() => {
    const getPlayerSession = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/')
          return
        }

        // Get player record
        const { data: player, error: playerError } = await supabase
          .from('players')
          .select('id, team_id, teams(id, name, color)')
          .eq('user_id', user.id)
          .single()

        if (playerError || !player) {
          console.error('Player lookup error:', playerError)
          router.push('/')
          return
        }

        const team = Array.isArray(player.teams) ? player.teams[0] : player.teams
        if (!team) {
          console.error('No team found')
          router.push('/')
          return
        }

        setPlayerSession({
          playerId: player.id,
          teamId: player.team_id,
          teamName: team.name || 'Equip Sense Nom',
          teamColor: team.color || undefined,
        })

        // Primer cop que aquest jugador obre l'app: mostrar directament
        // l'entrada "El Pacte Traït" de la Història. La resta de vegades,
        // el mapa és la pantalla per defecte.
        if (!tabParam) {
          const seenKey = `traidor_historia_vista_${player.id}`
          let hasSeenIntro = true
          try {
            hasSeenIntro = window.localStorage.getItem(seenKey) === '1'
          } catch {
            hasSeenIntro = true
          }

          if (!hasSeenIntro) {
            setActiveTab('historia')
            setAutoIntroEntryId('intro')
            try {
              window.localStorage.setItem(seenKey, '1')
            } catch {
              // localStorage no disponible; no bloqueja el joc
            }
          } else {
            setActiveTab('map')
          }
        }
      } catch (err) {
        console.error('Session fetch error:', err)
        setError('Error al caregar la sessió')
        setTimeout(() => router.push('/'), 1500)
      } finally {
        setLoading(false)
      }
    }

    getPlayerSession()
  }, [router])

  // Handle accusation submission
  const handleSubmitAccusation = useCallback(
    async (suspectId: string, evidenceIds: string[]) => {
      if (!playerSession?.teamId) return

      try {
        setIsSubmittingAccusation(true)

        const response = await fetch('/api/game/accusation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: playerSession.teamId,
            suspectId,
            evidenceIds,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Error al enviar l\'acusació')
        }

        // Accusation successful - navigate to results
        router.push('/results')
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error('Error al enviar l\'acusació')
      } finally {
        setIsSubmittingAccusation(false)
      }
    },
    [playerSession?.teamId, router]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-parchment text-ink">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-prussian font-serif mb-2">
            Carregant Joc
          </h1>
          <p className="text-leather">Preparant l&apos;investigació...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-parchment text-ink p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-cochineal font-serif mb-2">Error</h1>
          <p className="text-cochineal">{error}</p>
        </div>
      </div>
    )
  }

  if (!playerSession) {
    return null
  }

  return (
    <div className="h-dvh overflow-hidden bg-parchment text-ink flex flex-col">
      {/* Barra superior */}
      <PlayerStatusBar gameStatus={gameClock.status} expiresAt={gameClock.expiresAt} />

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col overflow-hidden">
        {/* Tab Content - Takes remaining space */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'map' && (
            <MapTab
              stations={teamState.stations}
              evidences={teamState.evidences}
              teamId={playerSession.teamId}
            />
          )}

          {activeTab === 'notebook' && (
            <NotebookTab
              evidences={teamState.evidences}
              stations={teamState.stations}
              coartadaFrase={coartadaFrase}
              teamCode={teamState.team?.code || 'EQUIP1'}
              teamId={playerSession.teamId}
              suspectsDismissed={teamState.session?.suspects_dismissed || []}
            />
          )}

          {activeTab === 'historia' && (
            <IntroTab
              stations={teamState.stations}
              evidences={teamState.evidences}
              onOpenMap={() => setActiveTab('map')}
              initialEntryId={autoIntroEntryId}
            />
          )}

          {activeTab === 'salconduit' && (
            <SalconduitTab
              team={teamState.team}
              session={teamState.session}
              passes={teamState.passes}
              onOpenNotebook={() => setActiveTab('notebook')}
            />
          )}

          {activeTab === 'accuse' && (
            <AccuseTab
              stations={teamState.stations}
              evidences={teamState.evidences}
              onSubmitAccusation={handleSubmitAccusation}
              isSubmitting={isSubmittingAccusation}
            />
          )}
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showScanner && <QRScanner onClose={() => setShowScanner(false)} />}

      {/* Emissari Alert Modal */}
      {coartadaFrase && (
        <EmissariAlertModal
          show={showAlert}
          frase={coartadaFrase}
          onDismiss={dismissAlert}
        />
      )}

      {/* Game Clock Modals */}
      <GameStartedModal
        show={gameClock.showStartedPopup}
        durationMinutes={gameClock.durationMinutes}
        onDismiss={gameClock.dismissStartedPopup}
      />
      <BellRungModal
        show={gameClock.showBellPopup}
        onViewResults={() => {
          gameClock.dismissBellPopup()
          router.push('/results')
        }}
      />

      {/* Bottom Navigation Menu */}
      <BottomNav
        activeTab={activeTab === 'accuse' ? 'map' : activeTab}
        onTabChange={handleTabChange}
        evidencesCount={teamState.evidences.length}
        salconduitsRemaining={teamState.session?.salconduits_remaining ?? 2}
        isGameActive={isGameActive}
        onCenterAction={() => {
          if (isGameActive && gameState.activeToken) {
            router.push(`/s/${gameState.activeToken}`)
          } else {
            setShowScanner(true)
          }
        }}
      />
    </div>
  )
}

export default function JocHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-amber-50">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-amber-900 border-t-amber-300"></div>
            <p className="text-lg font-semibold text-amber-900">Carregant el Hub...</p>
          </div>
        </div>
      }
    >
      <JocHubContent />
    </Suspense>
  )
}
