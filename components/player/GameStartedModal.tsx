'use client'

interface GameStartedModalProps {
  show: boolean
  durationMinutes: number | null
  onDismiss: () => void
}

export function GameStartedModal({ show, durationMinutes, onDismiss }: GameStartedModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-emerald-600 animate-scaleUp">
        <div className="text-5xl mb-3">🏁</div>
        <h2 className="text-2xl font-black text-emerald-900 mb-2">
          LA PARTIDA HA COMENÇAT!
        </h2>
        <p className="text-stone-700 text-sm mb-4 leading-relaxed">
          {durationMinutes
            ? `Teniu ${durationMinutes} minuts per descobrir el traïdor. Quan la campana soni, se us acabarà el temps.`
            : 'La investigació ha començat. Quan la campana soni, se us acabarà el temps.'}
        </p>
        <button
          onClick={onDismiss}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
        >
          Comencem!
        </button>
      </div>
    </div>
  )
}
