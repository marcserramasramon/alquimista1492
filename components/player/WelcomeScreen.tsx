'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface WelcomeScreenProps {
  onContinueWithoutInstall: () => void
}

/**
 * Pantalla 1: benvinguda al navegador (encara no instal·lada).
 * Botó principal per instal·lar l'app; a iOS Safari no hi ha prompt
 * natiu, així que es mostren instruccions manuals.
 */
export function WelcomeScreen({ onContinueWithoutInstall }: WelcomeScreenProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [showManualHint, setShowManualHint] = useState(false)

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window))

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    const handleInstalled = () => setInstalled(true)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleDownload = async () => {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null)
      }
      return
    }
    // iOS, o un navegador que encara no ha oferit el prompt natiu
    // (Firefox, o Chrome abans de considerar el lloc instal·lable):
    // mostrem instruccions manuals en lloc de no fer res.
    setShowManualHint(true)
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-end p-4 sm:p-8 bg-cover bg-center bg-no-repeat text-parchment"
      style={{ backgroundImage: "url('/images/portada-landing.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/85 -z-10" />

      <div className="w-full max-w-sm mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-serif text-parchment drop-shadow-lg mb-2">
          El Traïdor de la Guixa
        </h1>
        <p className="text-base sm:text-lg text-parchment/80 drop-shadow mb-6">
          Sentfores–La Guixa, 1705
        </p>

        {installed ? (
          <p className="text-sm text-parchment/90 mb-6">
            L&apos;app ja s&apos;ha instal·lat. Obre-la des de la pantalla d&apos;inici del mòbil.
          </p>
        ) : (
          <button
            onClick={handleDownload}
            className="w-full bg-prussian text-parchment font-accent text-lg uppercase tracking-wide rounded-lg py-4 shadow-lg mb-4 active:scale-95 transition-transform"
          >
            Descarrega l&apos;app
          </button>
        )}

        {isIOS && !installed && (
          <p className="text-sm text-parchment/90 mb-6">
            A l&apos;iPhone/iPad: toca <span className="font-semibold">Comparteix</span> i després{' '}
            <span className="font-semibold">&quot;Afegeix a la pantalla d&apos;inici&quot;</span>.
          </p>
        )}

        {!isIOS && !installed && showManualHint && (
          <p className="text-sm text-parchment/90 mb-6">
            Aquest navegador no ofereix instal·lació automàtica. Obre el menú del
            navegador i cerca <span className="font-semibold">&quot;Instal·la l&apos;app&quot;</span> o{' '}
            <span className="font-semibold">&quot;Afegeix a la pantalla d&apos;inici&quot;</span>.
          </p>
        )}

        <button
          onClick={onContinueWithoutInstall}
          className="text-sm text-parchment/80 underline underline-offset-2 mb-10"
        >
          Continua sense instal·lar
        </button>

        <div className="pt-6 border-t border-parchment/30">
          <Link href="/login" className="text-xs text-parchment/70 underline underline-offset-2">
            Accés màster
          </Link>
        </div>
      </div>
    </div>
  )
}
