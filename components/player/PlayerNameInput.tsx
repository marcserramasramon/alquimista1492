'use client'

import React, { useState } from 'react'

interface PlayerNameInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  error?: string
  disabled?: boolean
}

export function PlayerNameInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  error,
  disabled = false,
}: PlayerNameInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, 30)
    onChange(newValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length >= 2 && !isLoading && !disabled) {
      onSubmit()
    }
  }

  const handleSubmitClick = () => {
    if (value.length >= 2 && !isLoading && !disabled) {
      onSubmit()
    }
  }

  const isValid = value.length >= 2

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="space-y-6">
        {/* Player Name Input */}
        <div>
          <label htmlFor="player-name" className="block text-sm font-medium text-amber-900 mb-3">
            El teu nom (2-30 caràcters)
          </label>
          <input
            id="player-name"
            type="text"
            inputMode="text"
            maxLength={30}
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading || disabled}
            placeholder="Introdueix el teu nom"
            className="w-full px-4 py-3 text-lg border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          />
          {/* Character count */}
          <p className="mt-2 text-xs text-amber-600">
            {value.length}/30 caràcters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmitClick}
          disabled={!isValid || isLoading || disabled}
          className="w-full py-4 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 min-h-12"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              S'està connectant...
            </>
          ) : (
            'Entrar al Joc'
          )}
        </button>
      </div>
    </div>
  )
}
