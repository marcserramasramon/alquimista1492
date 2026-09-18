'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayerReconnect } from '@/lib/player/usePlayerReconnect'
import { WelcomeScreen } from '@/components/player/WelcomeScreen'
import { InstalledHomeScreen } from '@/components/player/InstalledHomeScreen'
import { TeamQRScanner } from '@/components/player/TeamQRScanner'

/**
 * Punt d'entrada del jugador ('/'):
 * 1. Si ja hi ha una sessió de jugador vàlida (equip actiu), hi salta
 *    directament sense mostrar cap pantalla intermèdia.
 * 2. Si l'app s'obre instal·lada (pantalla d'inici del mòbil), mostra
 *    directament la pantalla amb el botó d'escanejar.
 * 3. Si no, mostra la benvinguda amb el botó de descàrrega.
 */
export function EntryGate() {
  const router = useRouter()
  const reconnectStatus = usePlayerReconnect()
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null)
  const [forceScanScreen, setForceScanScreen] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean }
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
    )
  }, [])

  useEffect(() => {
    if (reconnectStatus === 'valid') {
      router.replace('/joc')
    }
  }, [reconnectStatus, router])

  if (reconnectStatus === 'checking' || reconnectStatus === 'valid' || isStandalone === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment text-ink">
        <p className="text-leather">Carregant...</p>
      </div>
    )
  }

  const showScanScreen = isStandalone || forceScanScreen

  return (
    <>
      {showScanScreen ? (
        <InstalledHomeScreen onScan={() => setShowScanner(true)} />
      ) : (
        <WelcomeScreen onContinueWithoutInstall={() => setForceScanScreen(true)} />
      )}

      {showScanner && <TeamQRScanner onClose={() => setShowScanner(false)} />}
    </>
  )
}
