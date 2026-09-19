'use client'

import { useEffect, useState } from 'react'

interface NightModeToggleProps {
  className?: string
  showLabel?: boolean
  compact?: boolean
}

export function NightModeToggle({
  className = '',
  showLabel = false,
  compact = false,
}: NightModeToggleProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Comprova si ja estava actiu o si el sistema prefereix fosc
    const stored = localStorage.getItem('traidor-guixa-theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else if (stored === 'light') {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      // Per defecte en un joc de nit, podem comprovar l'hora o el prefers-color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const currentHour = new Date().getHours()
      const isNightTime = currentHour >= 20 || currentHour < 7

      if (prefersDark || isNightTime) {
        document.documentElement.classList.add('dark')
        setIsDark(true)
      }
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('traidor-guixa-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('traidor-guixa-theme', 'light')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Canviar a Mode Pergamí (Dia)' : 'Canviar a Mode Nit / Clandestí (Fosc)'}
      aria-label={isDark ? 'Canviar a Mode Pergamí' : 'Canviar a Mode Nit'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border shadow-sm font-sans ${
        isDark
          ? 'bg-[#2B2118] text-[#E5A93C] border-[#E5A93C]/40 hover:bg-[#3D2E22]'
          : 'bg-[#EAE0CA] text-[#5C4533] border-[#8C6D53]/40 hover:bg-[#DFD4BC]'
      } ${compact ? 'text-xs min-h-[32px]' : 'text-xs sm:text-sm min-h-[36px]'} ${className}`}
    >
      <span className="text-base leading-none">{isDark ? '🕯️' : '☀️'}</span>
      {showLabel && (
        <span className="font-medium tracking-wide">
          {isDark ? 'Mode Nit' : 'Mode Dia'}
        </span>
      )}
    </button>
  )
}
