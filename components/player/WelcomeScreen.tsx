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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-parchment text-ink">
      <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Imatge de HOME a sobre de tot, gran i neta */}
        <div className="w-full rounded-2xl overflow-hidden border-2 sm:border-3 border-[#8C6D53] shadow-xl mb-6 bg-stone-950 aspect-[16/9]">
          <img
            src="/images/scenes/home.webp"
            alt="El Traïdor de la Guixa"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif text-prussian mb-2">El Traïdor de la Guixa</h1>
        <p className="text-base sm:text-lg text-leather mb-6">
          Sentfores–La Guixa, 1705
        </p>

        <div className="w-full max-w-sm mx-auto">
          {installed ? (
            <p className="text-sm text-leather mb-6">
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
          <p className="text-sm text-leather mb-6">
            A l&apos;iPhone/iPad: toca <span className="font-semibold">Comparteix</span> i després{' '}
            <span className="font-semibold">&quot;Afegeix a la pantalla d&apos;inici&quot;</span>.
          </p>
        )}

        {!isIOS && !installed && showManualHint && (
          <p className="text-sm text-leather mb-6">
            Aquest navegador no ofereix instal·lació automàtica. Obre el menú del
            navegador i cerca <span className="font-semibold">&quot;Instal·la l&apos;app&quot;</span> o{' '}
            <span className="font-semibold">&quot;Afegeix a la pantalla d&apos;inici&quot;</span>.
          </p>
        )}

        <button
          onClick={onContinueWithoutInstall}
          className="text-sm text-leather underline underline-offset-2 mb-10"
        >
          Continua sense instal·lar
        </button>

          <div className="mt-12 pt-6 border-t border-leather/30">
            <Link href="/login" className="text-xs text-leather underline underline-offset-2">
              Accés màster
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
