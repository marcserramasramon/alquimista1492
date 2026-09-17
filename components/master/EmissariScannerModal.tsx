'use client'

import { useState, useCallback, useRef } from 'react'
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { motion, AnimatePresence } from 'framer-motion'
import { TeamData } from '@/lib/master/useDashboard'

interface EmissariScannerModalProps {
  isOpen: boolean
  onClose: () => void
  teams?: TeamData[]
}

interface ScannedTeamInfo {
  id: string
  code: string
  name: string
  color: string
  variant: string
  salconduitsRemaining: number
  coartada?: {
    type: string
    name: string
    frases: string[]
  }
}

export function EmissariScannerModal({
  isOpen,
  onClose,
  teams = [],
}: EmissariScannerModalProps) {
  const [mode, setMode] = useState<'scan' | 'team'>('scan')
  const [scannedTeam, setScannedTeam] = useState<ScannedTeamInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const isProcessingRef = useRef(false)

  // Carregar dades d'un equip pel codi
  const loadTeamByCode = useCallback(async (rawCode: string) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      setLoading(true)
      setError(null)
      setFeedbackMsg(null)

      // Extreure codi d'equip si ve en format URL (ex: /emissari/BLAU o https://.../emissari/BLAU)
      let code = rawCode.trim()
      const match = rawCode.match(/\/emissari\/([A-Za-z0-9_-]+)/)
      if (match) {
        code = match[1]
      }

      const res = await fetch(`/api/emissari/team-info?teamCode=${encodeURIComponent(code)}`)
      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || `No s'ha trobat cap equip amb el codi "${code}"`)
      }

      const data = (await res.json()) as ScannedTeamInfo
      setScannedTeam(data)
      setMode('team')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error en escanejar el codi')
    } finally {
      setLoading(false)
      isProcessingRef.current = false
    }
  }, [])

  // Callback de detecció de l'escàner de càmera
  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      if (detectedCodes.length > 0 && detectedCodes[0]?.rawValue) {
        loadTeamByCode(detectedCodes[0].rawValue)
      }
    },
    [loadTeamByCode]
  )

  // Executar acció de confiscar o restaurar
  const handleConfiscateAction = async (action: 'confiscate' | 'restore') => {
    if (!scannedTeam || actionLoading) return

    try {
      setActionLoading(true)
      const res = await fetch('/api/emissari/confiscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamCode: scannedTeam.code, action }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error en executar l\'acció')
      }

      setScannedTeam((prev) =>
        prev ? { ...prev, salconduitsRemaining: data.salconduitsRemaining } : null
      )

      if (action === 'confiscate') {
        setFeedbackMsg({
          type: 'danger',
          text: `🚫 1 Salvo confiscat a l'equip ${scannedTeam.name}! Els queden ${data.salconduitsRemaining} permisos.`,
        })
      } else {
        setFeedbackMsg({
          type: 'success',
          text: `✓ Permís restaurat a ${scannedTeam.name}. Ara en tenen ${data.salconduitsRemaining}.`,
        })
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error modificant salconduits')
    } finally {
      setActionLoading(false)
    }
  }

  // Tornar a activar la càmera per escanejar el següent equip
  const handleScanNext = () => {
    setScannedTeam(null)
    setError(null)
    setFeedbackMsg(null)
    setMode('scan')
    isProcessingRef.current = false
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-serif">
      <div className="bg-[#F4EBD9] rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border-4 border-[#8C6D53] overflow-hidden text-[#2B2118]">
        {/* Capçalera del Modal */}
        <div className="p-4 bg-[#1D3557] text-white flex items-center justify-between border-b-2 border-[#8C6D53]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif leading-tight">
                Consola Emissari · Escàner de Salvos
              </h2>
              <p className="text-[11px] text-amber-200 font-sans">
                Pla de Masset · Control automàtic de salvoconductes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-lg text-2xl font-bold leading-none"
            title="Tancar"
          >
            ✕
          </button>
        </div>

        {/* Cos del Modal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Missatge de feedback */}
          <AnimatePresence>
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-xl font-sans text-xs sm:text-sm font-bold text-center border shadow ${
                  feedbackMsg.type === 'danger'
                    ? 'bg-red-100 border-red-500 text-red-900'
                    : 'bg-emerald-100 border-emerald-500 text-emerald-900'
                }`}
              >
                {feedbackMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-400 rounded-xl text-red-900 text-xs font-sans text-center">
              <span className="font-bold block">⚠️ Error:</span>
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: CÀMERA PER ESCANEJAR EL CODI QR DEL JUGADOR */}
          {mode === 'scan' && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-center">
                <h3 className="font-bold text-sm sm:text-base font-serif text-[#1D3557]">
                  Apunta la càmera al mòbil del jugador
                </h3>
                <p className="text-xs text-[#5C4533] italic">
                  El jugador ha de tenir oberta la pestanya «Salvos». El reconeixement d'equip és automàtic.
                </p>
              </div>

              {/* Contenidor de l'escàner de càmera */}
              <div className="w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-4 border-[#8C6D53] bg-black shadow-inner relative">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-10">
                    <div className="animate-spin text-4xl mb-2">⏳</div>
                    <p className="text-xs font-sans text-amber-200">Carregant dades de l'equip...</p>
                  </div>
                ) : (
                  <Scanner
                    onScan={handleScan}
                    onError={(err) => {
                      console.error('Master scanner error:', err)
                    }}
                    styles={{
                      container: {
                        width: '100%',
                        height: '100%',
                      },
                    }}
                  />
                )}
              </div>

              {/* Selector manual de suport per si la càmera no està disponible */}
              {teams.length > 0 && (
                <div className="w-full max-w-xs mt-1 p-3 bg-[#EAE0CA] border border-[#8C6D53] rounded-xl text-center">
                  <span className="text-[11px] font-sans font-bold text-[#8C6D53] block mb-1">
                    O tria manualment l'equip si cal:
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) loadTeamByCode(e.target.value)
                    }}
                    defaultValue=""
                    className="w-full p-2 bg-[#F4EBD9] border border-[#8C6D53] rounded text-xs font-serif text-[#2B2118]"
                  >
                    <option value="" disabled>
                      Selecciona un equip...
                    </option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: FITXA DE L'EQUIP IDENTIFICAT I ACCIONS DE L'EMISSARI */}
          {mode === 'team' && scannedTeam && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Targeta d'identificació de l'equip */}
              <div className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-2xl p-4 sm:p-5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#8C6D53]/40 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#8C6D53]">
                      Equip Detectat
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm bg-[#D8CCAE] px-2.5 py-0.5 rounded border border-[#8C6D53]">
                    {scannedTeam.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif text-[#1D3557] mb-1">
                  {scannedTeam.name}
                </h3>

                {/* Estat dels 2 Permisos */}
                <div className="mt-3 bg-[#F4EBD9] p-3 rounded-xl border border-[#8C6D53]">
                  <div className="flex items-center justify-between text-xs font-sans font-bold text-[#1D3557] mb-2">
                    <span>Permisos de Circulació (Salvos):</span>
                    <span className="text-sm">{scannedTeam.salconduitsRemaining} / 2 VÀLIDS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded-lg border text-center font-sans text-xs font-bold ${
                        scannedTeam.salconduitsRemaining >= 1
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                          : 'bg-red-100 border-red-500 text-red-800 line-through'
                      }`}
                    >
                      Permís I: {scannedTeam.salconduitsRemaining >= 1 ? '✓ VÀLID' : '🚫 CONFISCAT'}
                    </div>
                    <div
                      className={`p-2 rounded-lg border text-center font-sans text-xs font-bold ${
                        scannedTeam.salconduitsRemaining >= 2
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                          : 'bg-red-100 border-red-500 text-red-800 line-through'
                      }`}
                    >
                      Permís II: {scannedTeam.salconduitsRemaining >= 2 ? '✓ VÀLID' : '🚫 CONFISCAT'}
                    </div>
                  </div>
                </div>

                {/* La Coartada secreta de l'equip perquè l'Emissari interrogui */}
                {scannedTeam.coartada && (
                  <div className="mt-3 bg-[#FDFBF7] border border-[#C2B299] rounded-xl p-3 text-xs">
                    <div className="flex items-center justify-between mb-1.5 font-sans font-bold text-[#8C6D53]">
                      <span>📜 Coartada Assignada:</span>
                      <span className="text-[11px] text-[#1D3557]">{scannedTeam.coartada.name}</span>
                    </div>
                    <p className="text-[11px] text-[#5C4533] italic mb-2">
                      Fes-los preguntes per comprovar si tots responen aquestes frases:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-[#2B2118] font-serif">
                      {scannedTeam.coartada.frases.map((f, i) => (
                        <li key={i} className="leading-snug italic">
                          «{f}»
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Botons d'Acció de l'Emissari */}
              <div className="flex flex-col gap-2.5">
                {/* Botó CONFISCAR */}
                <button
                  onClick={() => handleConfiscateAction('confiscate')}
                  disabled={actionLoading || scannedTeam.salconduitsRemaining <= 0}
                  className="w-full py-3.5 px-4 bg-red-700 hover:bg-red-800 active:scale-98 text-white rounded-xl font-sans font-bold text-sm sm:text-base shadow-lg border-2 border-red-500 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>⚔️</span>
                  <span>CONFISCAR 1 SALVO (−1 PERMÍS)</span>
                </button>

                {/* Botó VALIDAR PAS NET */}
                <button
                  onClick={() => {
                    setFeedbackMsg({
                      type: 'success',
                      text: `✓ Has donat per bo el pas de ${scannedTeam.name}. Continuen amb els permisos intactes!`,
                    })
                  }}
                  disabled={actionLoading}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-sans font-bold text-xs sm:text-sm shadow border border-emerald-400 transition flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>DONAR PER BO EL PAS (PAS NET)</span>
                </button>

                {/* Botó DESFER / RESTAURAR */}
                {scannedTeam.salconduitsRemaining < 2 && (
                  <button
                    onClick={() => handleConfiscateAction('restore')}
                    disabled={actionLoading}
                    className="w-full py-1 text-xs font-sans text-[#8C6D53] hover:text-[#1D3557] underline text-center"
                  >
                    ↩️ Desfer i restaurar 1 permís
                  </button>
                )}

                {/* Botó per escanejar el següent equip */}
                <button
                  onClick={handleScanNext}
                  className="mt-1 w-full py-2.5 bg-[#1D3557] hover:bg-[#162740] text-white rounded-xl font-sans font-bold text-xs sm:text-sm shadow transition flex items-center justify-center gap-2"
                >
                  <span>📷</span>
                  <span>Escanejar el Següent Equip</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
