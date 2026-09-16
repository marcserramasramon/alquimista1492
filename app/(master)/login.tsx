'use client'

import { useState } from 'react'
import { PINInput } from '@/components/master/PINInput'
import { useMasterAuth } from '@/lib/master/useAuth'

export default function MasterLoginPage() {
  const [pin, setPin] = useState('')
  const { login, isLoading, error } = useMasterAuth()

  const handleSubmit = async () => {
    if (pin.length === 6) {
      await login(pin)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            El Traïdor de la Guixa
          </h1>
          <p className="text-lg text-amber-700">
            Control del Màster
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-amber-200">
          <div className="mb-2 text-center">
            <p className="text-sm text-amber-700">Introdueix el codi d'accés</p>
          </div>

          <PINInput
            value={pin}
            onChange={setPin}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error || undefined}
          />

          {/* Info Footer */}
          <div className="mt-8 pt-6 border-t border-amber-100">
            <p className="text-xs text-center text-amber-600">
              Webapp de control per a l'escapada "El Traïdor de la Guixa"
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100 rounded-full opacity-20 blur-3xl" />
        </div>
      </div>
    </div>
  )
}
