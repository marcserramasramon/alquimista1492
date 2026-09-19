'use client'

export type NavTabId = 'map' | 'notebook' | 'historia' | 'salconduit'

interface BottomNavProps {
  activeTab: NavTabId | null | 'game'
  onTabChange: (tab: NavTabId) => void
  evidencesCount: number
  salconduitsRemaining: number
  isGameActive: boolean
  onCenterAction: () => void
}

/**
 * Native-style bottom tab bar: full width, evenly spaced, icon + label per
 * tab, active tab marked by color and a small top indicator (not a filled
 * button), like iOS/Android system tab bars. The QR/game action sits as an
 * elevated circular button in the middle, poking above the bar.
 */
export function BottomNav({
  activeTab,
  onTabChange,
  evidencesCount,
  salconduitsRemaining,
  isGameActive,
  onCenterAction,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
      <div className="max-w-4xl mx-auto grid grid-cols-5">
        <NavTab
          icon="📍"
          label="Mapa"
          isActive={activeTab === 'map'}
          onClick={() => onTabChange('map')}
        />
        <NavTab
          icon="📔"
          label="Quadern"
          isActive={activeTab === 'notebook'}
          onClick={() => onTabChange('notebook')}
          badge={evidencesCount}
        />

        {/* Center action: elevated circular button, own column for symmetry */}
        <div className="relative flex items-start justify-center">
          <button
            onClick={onCenterAction}
            className={`absolute -top-6 w-16 h-16 rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center justify-center text-3xl shadow-xl border-4 ${
              isGameActive && activeTab !== 'game' ? 'ring-4 ring-amber-400/60' : ''
            } ${activeTab === 'game' ? 'scale-105 ring-2 ring-amber-600' : ''}`}
            style={{ backgroundColor: '#D4AF37', borderColor: '#B8860B' }}
            title={isGameActive ? 'Torna al joc' : 'Escaneja QR'}
          >
            {isGameActive ? '🎮' : <QrIcon />}
          </button>
        </div>

        <NavTab
          icon="📖"
          label="Història"
          isActive={activeTab === 'historia'}
          onClick={() => onTabChange('historia')}
        />
        <NavTab
          icon="🎖️"
          label="Salvos"
          isActive={activeTab === 'salconduit'}
          onClick={() => onTabChange('salconduit')}
          badge={salconduitsRemaining}
        />
      </div>

      {/* Safe area for devices with a home indicator */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}

function QrIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h3v3" />
      <path d="M14 21v-1" />
      <path d="M21 14v3" />
      <path d="M21 21h-3" />
    </svg>
  )
}

interface NavTabProps {
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
  badge?: number
}

function NavTab({ icon, label, isActive, onClick, badge }: NavTabProps) {
  return (
    <button
      onClick={onClick}
      data-testid={`tab-${label}`}
      className={`relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 transition-colors ${
        isActive ? 'text-amber-800' : 'text-stone-400 active:text-stone-600'
      }`}
    >
      {isActive && (
        <span className="absolute top-0 h-0.5 w-8 rounded-full bg-amber-700" />
      )}
      <span className="relative text-[22px] leading-none">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  )
}
