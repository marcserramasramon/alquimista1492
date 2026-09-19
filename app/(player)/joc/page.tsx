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
import { BottomNav, type NavTabId } from '@/components/player/BottomNav'
import { PlayerTimer } from '@/components/player/PlayerTimer'
import { NightModeToggle } from '@/components/ui/NightModeToggle'
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
  const { gameState, clearActiveGame, isGameActive } = useGameNavigation()
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (tabParam && ['map', 'notebook', 'historia', 'salconduit', 'accuse'].includes(tabParam)) {
      return tabParam
    }
    return 'historia'
  })

  useEffect(() => {
    if (tabParam && ['map', 'notebook', 'historia', 'salconduit', 'accuse'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])
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
    <div className="min-h-screen bg-parchment text-ink flex flex-col">
      {/* Header */}
      <header className="bg-parchment border-b-2 border-[#8C6D53] shadow-sm sticky top-0 z-40 text-center">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[#8C6D53] font-sans font-bold">
              Equip: {playerSession.teamName}
            </span>
            <NightModeToggle compact />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2118] font-serif mt-1 uppercase">
            El Traïdor de la Guixa
          </h1>

          <div className="mt-2.5 flex justify-center">
            <PlayerTimer status={gameClock.status} expiresAt={gameClock.expiresAt} />
          </div>

          {/* Stats Row */}
          {teamState.team && teamState.session && (
            <div className="mt-3 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm font-sans font-bold text-[#2B2118]">
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>
                  {teamState.stations.filter((s) => s.solved).length}/{teamState.stations.length} Estacions
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>📋</span>
                <span>{teamState.evidences.length} Proves</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🎫</span>
                <span>
                  {teamState.session?.salconduits_remaining ?? 2} Salvos
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col overflow-hidden">
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
            />
          )}

          {activeTab === 'historia' && (
            <IntroTab
              stations={teamState.stations}
              evidences={teamState.evidences}
              onOpenMap={() => setActiveTab('map')}
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
        onViewResults={() => router.push('/results')}
      />

      {/* Bottom Navigation Menu */}
      <BottomNav
        activeTab={activeTab === 'accuse' ? 'map' : activeTab}
        onTabChange={setActiveTab}
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
