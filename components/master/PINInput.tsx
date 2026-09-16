'use client'

import React, { useState } from 'react'

interface PINInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  error?: string
}

export function PINInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  error,
}: PINInputProps) {
  const [showPin, setShowPin] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, 6)
    onChange(newValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === 6 && !isLoading) {
      onSubmit()
    }
  }

  const handleSubmitClick = () => {
    if (value.length === 6 && !isLoading) {
      onSubmit()
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="space-y-6">
        {/* PIN Input */}
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-amber-900 mb-3">
            Codi d'accés (6 dígits)
          </label>
          <div className="relative">
            <input
              id="pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={6}
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="••••••"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-900 disabled:text-gray-400"
              aria-label={showPin ? 'Amaga codi' : 'Mostra codi'}
            >
              {showPin ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Visual PIN Indicator */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < value.length
                  ? 'bg-amber-600'
                  : 'bg-amber-200'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmitClick}
          disabled={value.length !== 6 || isLoading}
          className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-12"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validant...
            </>
          ) : (
            'Accedir'
          )}
        </button>
      </div>
    </div>
  )
}
