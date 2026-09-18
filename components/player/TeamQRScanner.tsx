'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'

interface TeamQRScannerProps {
  onClose: () => void
}

/**
 * Escàner del QR d'equip que dona el màster (pantalla d'inici de l'app).
 * A diferència de QRScanner (estacions, /s/[token]), aquest busca el
 * codi de 6 caràcters de /e/[code].
 */
export function TeamQRScanner({ onClose }: TeamQRScannerProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)
  const [manualValue, setManualValue] = useState('')
  const processedCodes = useRef<Set<string>>(new Set())

  const processCode = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || processedCodes.current.has(text)) return

      // El QR pot codificar la URL completa (/e/[code]) o només el codi
      let code = text
      const match = text.match(/\/e\/([A-Za-z0-9]{6})/)
      if (match) {
        code = match[1]
      }
      code = code.toUpperCase()

      if (!/^[A-Z0-9]{6}$/.test(code)) {
        setError('Codi no vàlid')
        return
      }

      processedCodes.current.add(text)
      setIsProcessing(true)
      setError(null)
      router.push(`/e/${code}`)
    },
    [router]
  )

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (isProcessing || !detectedCodes || detectedCodes.length === 0) return
      const text = detectedCodes[0]?.rawValue
      if (!text) return
      processCode(text)
    },
    [isProcessing, processCode]
  )

  const handleManualSubmit = () => {
    if (!manualValue.trim()) return
    processCode(manualValue)
  }

  return (
    <div className="fixed inset-0 bg-ink/95 z-50 flex flex-col">
      <div className="bg-prussian text-parchment p-4 flex items-center justify-between">
        <h2 className="text-lg font-accent">Escanejar codi d&apos;equip</h2>
        <button
          onClick={onClose}
          className="text-2xl font-bold leading-none hover:bg-white/10 rounded"
          aria-label="Tancar"
        >
          ✕
        </button>
      </div>

      {manualEntry ? (
        /* Manual code entry */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-parchment">
          <label htmlFor="team-code" className="text-ink font-semibold mb-3 text-center">
            Introdueix el codi d&apos;equip
          </label>
          <input
            id="team-code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            maxLength={6}
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleManualSubmit()
            }}
            className="w-full max-w-xs text-center text-2xl tracking-widest font-mono uppercase border-2 border-prussian rounded-lg py-3 mb-4 bg-white text-ink"
            placeholder="CODI"
          />
          <button
            onClick={handleManualSubmit}
            disabled={isProcessing || !manualValue.trim()}
            className="w-full max-w-xs bg-prussian text-parchment font-accent uppercase tracking-wide rounded-lg py-3 disabled:opacity-50"
          >
            Confirmar
          </button>
          <button
            onClick={() => {
              setManualEntry(false)
              setError(null)
            }}
            className="mt-4 text-sm text-leather underline underline-offset-2"
          >
            Torna a la càmera
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
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

      {error && (
        <div className="bg-cochineal text-parchment p-4 text-center">
          <p className="font-semibold">{error}</p>
          {!manualEntry && (
            <p className="text-sm mt-1">Assegura&apos;t que la càmera està habilitada</p>
          )}
        </div>
      )}

      {!manualEntry && (
        <div className="bg-vellum text-ink p-4 text-center text-sm">
          <p className="mb-2">Apunta la càmera cap al codi QR que et dona l&apos;Emissari</p>
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
