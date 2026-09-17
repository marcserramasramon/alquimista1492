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
  const processedTokens = useRef<Set<string>>(new Set())

  const handleScan = useCallback(
    async (detectedCodes: IDetectedBarcode[]) => {
      if (isProcessing || !detectedCodes || detectedCodes.length === 0) return

      try {
        const text = detectedCodes[0]?.rawValue
        if (!text) return

        // Prevent duplicate processing
        if (processedTokens.current.has(text)) {
          return
        }

        // Extract token from URL if it's a full URL
        let token = text
        const match = text.match(/\/s\/([A-Za-z0-9_-]+)/)
        if (match) {
          token = match[1]
        }

        // Validate token format (basic check)
        if (!token || token.length < 6) {
          setError('Codi QR no vàlid')
          return
        }

        processedTokens.current.add(text)
        setIsProcessing(true)

        // Navigate to station
        router.push(`/s/${token}`)
      } catch (err) {
        console.error('Error processing QR:', err)
        setError('Error escanejant codi')
      }
    },
    [isProcessing, router]
  )

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

      {/* Scanner */}
      <div className="flex-1 overflow-hidden">
        <Scanner
          onScan={handleScan}
          onError={(err) => {
            console.error('Scanner error:', err)
            setError("No es pot accedir a la càmera")
          }}
          styles={{
            container: {
              width: '100%',
              height: '100%',
            },
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 text-white p-4 text-center">
          <p className="font-semibold">{error}</p>
          <p className="text-sm mt-1">Assegura't que la càmera està habilitada</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-amber-100 text-amber-900 p-4 text-center text-sm">
        <p>Apunta la càmera cap al codi QR de l'estació</p>
      </div>
    </div>
  )
}
