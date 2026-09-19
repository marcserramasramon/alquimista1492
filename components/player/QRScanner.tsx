'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'

interface QRScannerProps {
  onClose: () => void
}

export function QRScanner({ onClose }: QRScannerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const processedTokens = useRef<Set<string>>(new Set())

  const processToken = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || processedTokens.current.has(text)) return

      // Extract token from URL if it's a full URL
      let token = text
      const match = text.match(/\/s\/([A-Za-z0-9_-]+)/)
      if (match) {
        token = match[1]
      }

      // Els codis d'estació són sempre en minúscules; l'entrada manual
      // no ha de dependre de com el teclat mòbil hagi capitalitzat el text
      token = token.toLowerCase()

      // Validate token format (basic check)
      if (!token || token.length < 6) {
        setError('Codi no vàlid')
        return
      }

      processedTokens.current.add(text)
      setIsProcessing(true)
      setError(null)

      // Navigate to station
      router.push(`/s/${token}`)
    },
    [router]
  )

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (isProcessing || !detectedCodes || detectedCodes.length === 0) return

      try {
        const text = detectedCodes[0]?.rawValue
        if (!text) return
        processToken(text)
      } catch (err) {
        console.error('Error processing QR:', err)
        setError('Error escanejant codi')
      }
    },
    [isProcessing, processToken]
  )

  const handleManualSubmit = () => {
    if (!manualValue.trim()) return
    processToken(manualValue)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-amber-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Escaneja QR</h2>
        <button
          onClick={onClose}
          className="text-2xl font-bold leading-none hover:bg-amber-800 p-2 rounded"
        >
          ✕
        </button>
      </div>

      {manualEntry ? (
        /* Manual code entry */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-amber-50">
          <label htmlFor="station-code" className="text-amber-900 font-semibold mb-3 text-center">
            Introdueix el codi de l&apos;estació (cartell)
          </label>
          <input
            id="station-code"
            type="text"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleManualSubmit()
            }}
            className="w-full max-w-xs text-center text-2xl tracking-widest font-mono border-2 border-amber-700 rounded-lg py-3 mb-4 bg-white text-amber-900"
            placeholder="codi"
          />
          <button
            onClick={handleManualSubmit}
            disabled={isProcessing || !manualValue.trim()}
            className="w-full max-w-xs bg-amber-900 text-white font-semibold rounded-lg py-3 disabled:opacity-50"
          >
            Confirmar
          </button>
          <button
            onClick={() => {
              setManualEntry(false)
              setError(null)
            }}
            className="mt-4 text-sm text-amber-800 underline underline-offset-2"
          >
            Torna a la càmera
          </button>
        </div>
      ) : (
        /* Scanner */
        <div className="flex-1 overflow-hidden relative">
          <Scanner
            onScan={handleScan}
            onError={(err) => {
              console.error('Scanner error:', err)
              setError('No es pot accedir a la càmera')
            }}
            styles={{
              container: {
                width: '100%',
                height: '100%',
              },
            }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-white p-4 text-center">
          <p className="font-semibold">{error}</p>
          {!manualEntry && (
            <p className="text-sm mt-1">Assegura&apos;t que la càmera està habilitada</p>
          )}
        </div>
      )}

      {/* Instructions + manual entry toggle */}
      {!manualEntry && (
        <div className="bg-amber-100 text-amber-900 p-4 text-center text-sm">
          <p className="mb-2">Apunta la càmera cap al codi QR de l&apos;estació</p>
          <button
            onClick={() => {
              setError(null)
              setManualEntry(true)
            }}
            className="underline underline-offset-2 font-semibold"
          >
            Introduir el codi manualment
          </button>
        </div>
      )}
    </div>
  )
}
