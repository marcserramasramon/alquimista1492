'use client'

interface BellRungModalProps {
  show: boolean
  onViewResults: () => void
}

/**
 * Shown once the game clock is over (bell rung by the master, or time ran
 * out). There is no dismiss-and-keep-playing option: the only action is to
 * go to the results screen, since no more submissions are accepted once
 * the game is over.
 */
export function BellRungModal({ show, onViewResults }: BellRungModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-red-600 animate-scaleUp">
        <div className="text-5xl mb-3 animate-bounce">🔔</div>
        <h2 className="text-2xl font-black text-red-900 mb-2">
          LA CAMPANA HA TOCAT!
        </h2>
        <p className="text-stone-700 text-sm mb-4 leading-relaxed">
          S'ha acabat la partida. Cap prova pendent ja es pot superar.
          Consulteu el resultat del vostre equip.
        </p>
        <button
          onClick={onViewResults}
          className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl shadow transition"
        >
          Veure Resultats
        </button>
      </div>
    </div>
  )
}
