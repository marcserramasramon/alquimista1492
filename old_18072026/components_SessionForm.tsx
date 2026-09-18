'use client'

import React, { useState } from 'react'

interface SessionFormProps {
  onSubmit: (name: string) => void
  isLoading?: boolean
}

export function SessionForm({ onSubmit, isLoading = false }: SessionFormProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name)
      setName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="session-name" className="block text-sm font-medium text-amber-900 mb-2">
          Nom de la partida
        </label>
        <input
          id="session-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          placeholder="Ex: Partida del 16 de setembre"
          className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={!name.trim() || isLoading}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors min-h-12"
      >
        {isLoading ? 'Creant...' : '+ Crear nova partida'}
      </button>
    </form>
  )
}
