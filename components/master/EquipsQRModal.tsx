'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { TeamData } from '@/lib/master/useDashboard'

interface EquipsQRModalProps {
  isOpen: boolean
  onClose: () => void
  teams: TeamData[]
}

interface StationModalItem {
  id: string
  number: number
  title: string
  subtitle: string
  path: string
}

const STATIONS_LIST: StationModalItem[] = [
  { id: 'serrat-bruixes', number: 1, title: 'Serrat de les Bruixes', subtitle: 'El Codi de Fogueres', path: '/s/serrat-bruixes' },
  { id: 'font-ferro', number: 2, title: 'Font del Ferro', subtitle: "Tinta i Torns d'Aigua", path: '/s/font-ferro' },
  { id: 'planes-bones', number: 3, title: 'Planes Bones', subtitle: 'La Ronda de la Patrulla', path: '/s/planes-bones' },
  { id: 'cementiri', number: 4, title: 'Cementiri de la Guixa', subtitle: 'La Signatura del Difunt', path: '/s/cementiri' },
  { id: 'pla-masset', number: 5, title: 'Pla del Masset', subtitle: "Control de l'Emissari / Acusació", path: '/s/pla-masset' },
  { id: 'caixa-almoines', number: 6, title: 'Rectoria', subtitle: 'La Clau de les Almoines', path: '/s/caixa-almoines' },
]

export function EquipsQRModal({ isOpen, onClose, teams }: EquipsQRModalProps) {
  const [activeTab, setActiveTab] = useState<'stations' | 'teams'>('stations')
  const [teamQRs, setTeamQRs] = useState<Record<string, string>>({})
  const [stationQRs, setStationQRs] = useState<Record<string, string>>({})
  const [selectedItem, setSelectedItem] = useState<{ title: string; code: string; qrUrl: string; path: string } | null>(null)
  const [origin, setOrigin] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !origin) return

    const generateQRs = async () => {
      // Teams QR
      const tQrs: Record<string, string> = {}
      for (const team of teams) {
        const url = `${origin}/e/${team.code}`
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: { dark: '#1e1b4b', light: '#ffffff' },
          })
          tQrs[team.code] = dataUrl
        } catch (err) {
          console.error(`Error generant QR per ${team.code}:`, err)
        }
      }
      setTeamQRs(tQrs)

      // Stations QR
      const sQrs: Record<string, string> = {}
      for (const st of STATIONS_LIST) {
        const url = `${origin}${st.path}`
        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
            color: { dark: '#1c1917', light: '#ffffff' },
          })
          sQrs[st.id] = dataUrl
        } catch (err) {
          console.error(`Error generant QR per estacio ${st.id}:`, err)
        }
      }
      setStationQRs(sQrs)
    }

    generateQRs()
  }, [isOpen, origin, teams])

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col border-2 border-amber-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-900 to-amber-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span>📍</span> Codis QR i Manuals
            </h2>
            <p className="text-amber-200 text-xs sm:text-sm mt-0.5">
              Consulta ràpida del codi QR i del codi manual corresponent per si falla la càmera
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href="/master/qr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <span>🖨️</span> Versió per Imprimir
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-amber-950/40 hover:bg-amber-950/80 flex items-center justify-center text-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-amber-100/70 border-b border-amber-200 px-6 pt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-t border-x ${
              activeTab === 'stations'
                ? 'bg-amber-50 text-amber-950 border-amber-300 -mb-px'
                : 'text-amber-800 hover:bg-amber-200/50 border-transparent'
            }`}
          >
            🏰 Estacions al Poble (6)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-t border-x ${
              activeTab === 'teams'
                ? 'bg-amber-50 text-amber-950 border-amber-300 -mb-px'
                : 'text-amber-800 hover:bg-amber-200/50 border-transparent'
            }`}
          >
            👥 Equips de Joc (8)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-amber-50/50">
          {activeTab === 'stations' ? (
            /* Estacions Tab */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {STATIONS_LIST.map((st) => {
                const qrUrl = stationQRs[st.id]

                return (
                  <div
                    key={st.id}
                    className="bg-white rounded-xl border-2 border-stone-300 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                      Cartell {st.number}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base leading-tight">
                      {st.title}
                    </h3>
                    <p className="text-xs text-stone-500 mb-2">{st.subtitle}</p>

                    {/* QR Image */}
                    <div className="bg-white p-2 rounded-lg border border-stone-200 shadow-inner w-40 h-40 flex items-center justify-center">
                      {qrUrl ? (
                        <img
                          src={qrUrl}
                          alt={`QR ${st.title}`}
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() =>
                            setSelectedItem({
                              title: st.title,
                              code: st.id,
                              qrUrl,
                              path: st.path,
                            })
                          }
                          title="Fes clic per ampliar"
                        />
                      ) : (
                        <div className="animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-800 rounded-full" />
                      )}
                    </div>

                    {/* Manual Code Box */}
                    <div className="mt-3 w-full bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                        Codi Manual:
                      </span>
                      <div className="flex items-center justify-center gap-1">
                        <code className="text-xs font-mono font-bold text-amber-950 px-2 py-0.5 bg-white rounded border border-amber-300">
                          {st.id}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(st.id)}
                          className="p-1 hover:bg-amber-100 rounded text-amber-900 text-xs transition"
                          title="Copiar codi"
                        >
                          {copiedCode === st.id ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Equips Tab */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {teams.map((team) => {
                const qrUrl = teamQRs[team.code]

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

                    {/* QR Image */}
                    <div className="bg-white p-2 rounded-lg border border-amber-100 shadow-inner w-36 h-36 flex items-center justify-center my-2">
                      {qrUrl ? (
                        <img
                          src={qrUrl}
                          alt={`QR ${team.name}`}
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() =>
                            setSelectedItem({
                              title: team.name || team.code,
                              code: team.code,
                              qrUrl,
                              path: `/e/${team.code}`,
                            })
                          }
                          title="Fes clic per ampliar"
                        />
                      ) : (
                        <div className="animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-800 rounded-full" />
                      )}
                    </div>

                    {/* Manual Code Box */}
                    <div className="w-full bg-amber-50 p-2 rounded-lg border border-amber-200 text-center">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                        Codi Manual:
                      </span>
                      <div className="flex items-center justify-center gap-1">
                        <code className="text-sm font-mono font-bold text-amber-950 px-2 py-0.5 bg-white rounded border border-amber-300">
                          {team.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(team.code)}
                          className="p-1 hover:bg-amber-100 rounded text-amber-900 text-xs transition"
                          title="Copiar codi"
                        >
                          {copiedCode === team.code ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-amber-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-900 hover:bg-amber-800 text-white font-semibold rounded-lg transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>

      {/* Fullscreen Single Item QR Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-amber-300 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-2xl text-amber-900 hover:text-amber-700 font-bold"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-amber-950 mb-1">{selectedItem.title}</h2>

            <div className="bg-white p-3 rounded-xl border-2 border-amber-200 shadow-md inline-block my-3">
              <img
                src={selectedItem.qrUrl}
                alt={selectedItem.title}
                className="w-56 h-56 object-contain"
              />
            </div>

            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4">
              <span className="text-xs uppercase font-bold text-stone-500 block mb-0.5">
                Codi Manual:
              </span>
              <code className="text-base font-mono font-bold text-amber-950">
                {selectedItem.code}
              </code>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl transition-colors"
            >
              Fet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
