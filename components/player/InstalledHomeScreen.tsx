'use client'

interface InstalledHomeScreenProps {
  onScan: () => void
}

/**
 * Pantalla 2: primera pantalla de l'app ja instal·lada (o oberta sense
 * instal·lar). Punt de partida per escanejar el QR d'equip.
 */
export function InstalledHomeScreen({ onScan }: InstalledHomeScreenProps) {
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
        <p className="text-base sm:text-lg text-leather mb-4">
          L&apos;Emissari t&apos;espera a Sentfores–La Guixa
        </p>

        <div className="w-full max-w-sm mx-auto">
          <p className="text-sm sm:text-base mb-6 text-ink">
            Demana el codi QR del teu equip al màster i escaneja&apos;l per començar
            l&apos;investigació.
          </p>

          <button
            onClick={onScan}
            className="w-full bg-prussian text-parchment font-accent text-lg uppercase tracking-wide rounded-lg py-4 shadow-lg active:scale-95 transition-transform"
          >
            Escanejar
          </button>
        </div>
      </div>
    </div>
  )
}
