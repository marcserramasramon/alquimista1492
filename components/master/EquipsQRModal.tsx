'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { TeamData } from '@/lib/master/useDashboard'

interface EquipsQRModalProps {
  isOpen: boolean
  onClose: () => void
  teams: TeamData[]
}

export function EquipsQRModal({ isOpen, onClose, teams }: EquipsQRModalProps) {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !origin || teams.length === 0) return

    const generateQRs = async () => {
      const qrs: Record<string, string> = {}
      for (const team of teams) {
        const url = `${origin}/e/${team.code}`
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: {
              dark: '#1e1b4b',
              light: '#ffffff',
            },
          })
          qrs[team.code] = dataUrl
        } catch (err) {
          console.error(`Error generant QR per ${team.code}:`, err)
        }
      }
      setQrCodes(qrs)
    }

    generateQRs()
  }, [isOpen, origin, teams])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border-2 border-amber-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-900 to-amber-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>📱</span> Codis QR d'Accés per als Equips
            </h2>
            <p className="text-amber-200 text-sm mt-1">
              Tots els membres del mateix equip escanegen el mateix codi QR per compartir partida
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/master/print"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2"
            >
              <span>🖨️</span> Imprimir Fitxes (A4)
            </a>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-amber-950/40 hover:bg-amber-950/80 flex items-center justify-center text-xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-amber-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {teams.map((team) => {
              const qrUrl = qrCodes[team.code]
              const joinUrl = origin ? `${origin}/e/${team.code}` : ''

              return (
                <div
                  key={team.id || team.code}
                  className="bg-white rounded-xl border-2 border-amber-200 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative"
                  style={{
                    borderTopColor: team.color || '#b45309',
                    borderTopWidth: '6px',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: team.color || '#b45309' }}
                    />
                    <h3 className="font-bold text-amber-900 text-base">
                      {team.name || team.code}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded mb-3">
                    Codi: {team.code}
                  </span>

                  {/* QR Image */}
                  <div className="bg-white p-2 rounded-lg border border-amber-100 shadow-inner w-44 h-44 flex items-center justify-center">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR ${team.name}`}
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedTeam(team)}
                        title="Fes clic per ampliar a pantalla completa"
                      />
                    ) : (
                      <div className="animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-800 rounded-full" />
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
                    <span>👥</span>
                    <span>{team.playersCount || 0} jugadors connectats</span>
                  </div>

                  <button
                    onClick={() => setSelectedTeam(team)}
                    className="mt-3 w-full py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <span>🔍</span> Ampliar QR
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-amber-200 flex justify-between items-center text-xs text-amber-700">
          <p>
            ℹ️ Quan els membres escanegin el QR, introduiran el seu nom i entraran automàticament a la partida del seu equip.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold rounded-lg transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>

      {/* Fullscreen Single Team QR Dialog */}
      {selectedTeam && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300 relative">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 text-2xl text-amber-900 hover:text-amber-700 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-3 mb-2">
              <span
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: selectedTeam.color || '#b45309' }}
              />
              <h2 className="text-2xl font-bold text-amber-950">
                {selectedTeam.name || selectedTeam.code}
              </h2>
            </div>

            <p className="text-sm font-mono text-amber-700 mb-6 bg-amber-50 py-1 px-3 rounded-full inline-block border border-amber-200">
              Codi d'accés: <strong>{selectedTeam.code}</strong>
            </p>

            <div className="bg-white p-4 rounded-xl border-2 border-amber-200 shadow-md inline-block mb-6">
              {qrCodes[selectedTeam.code] && (
                <img
                  src={qrCodes[selectedTeam.code]}
                  alt={`QR ${selectedTeam.name}`}
                  className="w-72 h-72 object-contain"
                />
              )}
            </div>

            <p className="text-sm text-amber-800 mb-2">
              Escanegeu aquest codi amb la càmera del mòbil per unir-vos a aquest equip.
            </p>
            <p className="text-xs text-amber-600 font-mono break-all mb-6">
              {origin}/e/{selectedTeam.code}
            </p>

            <button
              onClick={() => setSelectedTeam(null)}
              className="w-full py-3 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
            >
              Fet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
