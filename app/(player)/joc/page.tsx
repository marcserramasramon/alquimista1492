'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/db'
import { useTeamState } from '@/lib/realtime/useTeamState'
import { useGameNavigation } from '@/lib/context/GameNavigationContext'
import { MapTab } from '@/components/player/MapTab'
import { NotebookTab } from '@/components/player/NotebookTab'
import { SalconduitTab } from '@/components/player/SalconduitTab'
import { AccuseTab } from '@/components/player/AccuseTab'
import { QRScanner } from '@/components/player/QRScanner'

type Tab = 'map' | 'notebook' | 'historia' | 'salconduit' | 'accuse'

interface PlayerSession {
  playerId: string
  teamId: string
  teamName: string
  teamColor?: string
}

export default function JocHubPage() {
  const router = useRouter()
  const { gameState, clearActiveGame, isGameActive } = useGameNavigation()
  const [activeTab, setActiveTab] = useState<Tab>('map')
  const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingAccusation, setIsSubmittingAccusation] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const teamState = useTeamState(playerSession?.teamId)

  // Get player session on mount
  useEffect(() => {
    const getPlayerSession = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/e/INVALID')
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
          router.push('/e/INVALID')
          return
        }

        const team = Array.isArray(player.teams) ? player.teams[0] : player.teams
        if (!team) {
          console.error('No team found')
          router.push('/e/INVALID')
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
        setTimeout(() => router.push('/e/INVALID'), 1500)
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-amber-900 mb-2">
            Carregant Joc
          </h1>
          <p className="text-amber-700">Preparant l'investigació...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Error</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!playerSession) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-amber-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Title */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-amber-900">
              El Traïdor de la Guixa
            </h1>
            <p className="text-sm text-amber-700">
              Equip: <span className="font-semibold">{playerSession.teamName}</span>
            </p>
          </div>

          {/* Stats Row */}
          {teamState.team && teamState.session && (
            <div className="flex gap-4 text-sm font-semibold">
              <div className="flex items-center gap-1 text-amber-900">
                <span>📍</span>
                <span>
                  {teamState.stations.filter((s) => s.solved).length}/{teamState.stations.length} Estacions
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-900">
                <span>📋</span>
                <span>{teamState.evidences.length} Proves</span>
              </div>
              <div className="flex items-center gap-1 text-amber-900">
                <span>🎫</span>
                <span>
                  {teamState.passes.filter((p) => !p.used_at).length} Salconduits
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
          {activeTab === 'map' && <MapTab stations={teamState.stations} />}

          {activeTab === 'notebook' && (
            <NotebookTab evidences={teamState.evidences} />
          )}

          {activeTab === 'historia' && (
            <div className="px-6 py-4 overflow-y-auto">
              <h2 className="text-xl font-bold text-amber-900 mb-4">
                📖 La Trama
              </h2>
              <p className="text-amber-700 text-sm">
                Històries i pistes descobertes apareixeran aquí
              </p>
            </div>
          )}

          {activeTab === 'salconduit' && (
            <SalconduitTab passes={teamState.passes} />
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

      {/* Bottom Navigation Tabs */}
      <nav className="border-t-4 border-amber-700 bg-white shadow-lg sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto px-2 py-3 flex gap-2 items-end justify-center relative h-24">
          {/* Left side buttons */}
          <div className="flex gap-2">
            <TabButton
              id="map"
              icon="📍"
              label="Mapa"
              isActive={activeTab === 'map'}
              onClick={() => setActiveTab('map')}
            />
            <TabButton
              id="notebook"
              icon="📔"
              label="Quadern"
              isActive={activeTab === 'notebook'}
              onClick={() => setActiveTab('notebook')}
              badge={teamState.evidences.length}
            />
          </div>

          {/* Center QR Scanner or Game Button - Larger and circular */}
          <button
            onClick={() => {
              if (isGameActive && gameState.activeToken) {
                router.push(`/s/${gameState.activeToken}`)
              } else {
                setShowScanner(true)
              }
            }}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-3xl shadow-xl border-4"
            style={{
              backgroundColor: '#D4AF37',
              borderColor: '#B8860B',
            }}
            title={isGameActive ? 'Torna al joc' : 'Escaneja QR'}
          >
            {isGameActive ? '🎮' : '🔍'}
          </button>

          {/* Right side buttons */}
          <div className="flex gap-2">
            <TabButton
              id="historia"
              icon="📖"
              label="História"
              isActive={activeTab === 'historia'}
              onClick={() => setActiveTab('historia')}
            />
            <TabButton
              id="salconduit"
              icon="🎖️"
              label="Salvos"
              isActive={activeTab === 'salconduit'}
              onClick={() => setActiveTab('salconduit')}
              badge={teamState.passes.filter((p) => !p.used_at).length}
            />
          </div>
        </div>
      </nav>
    </div>
  )
}

interface TabButtonProps {
  id: string
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
  badge?: number
  disabled?: boolean
}

function TabButton({
  id,
  icon,
  label,
  isActive,
  onClick,
  badge,
  disabled = false,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`tab-${id}`}
      className={`w-12 h-12 rounded-lg font-semibold text-xs transition-all flex flex-col items-center justify-center gap-0.5 relative ${
        isActive
          ? 'bg-amber-700 text-white shadow-lg'
          : disabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label && <span className="text-xs leading-none">{label}</span>}
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </div>
      )}
    </button>
  )
}
