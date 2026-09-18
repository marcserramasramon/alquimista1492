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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-parchment text-ink">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-serif text-prussian mb-2">El Traïdor de la Guixa</h1>
        <p className="text-lg text-leather mb-8">
          L&apos;Emissari t&apos;espera a Sentfores–La Guixa
        </p>

        <p className="text-base mb-10">
          Demana el codi QR del teu equip al màster i escaneja&apos;l per començar
          l&apos;investigació.
        </p>

        <button
          onClick={onScan}
          className="w-full bg-prussian text-parchment font-accent text-lg uppercase tracking-wide rounded-lg py-4 shadow-lg"
        >
          Escanejar
        </button>
      </div>
    </div>
  )
}
