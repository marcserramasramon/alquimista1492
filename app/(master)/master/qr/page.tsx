'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { DEFAULT_TEAMS } from '@/lib/master/config'

interface StationQRMeta {
  id: string
  number: number
  title: string
  subtitle: string
  category: 'principal' | 'secundari'
  act: number
  location: string
  format: string
  elementReward?: string
  elementImage?: string
  contentSummary: string
  path: string
  fileBaseName: string
  manualCode?: string
}

const STATIONS_METADATA: StationQRMeta[] = [
  {
    id: 'serrat-bruixes',
    number: 1,
    title: 'Serrat de les Bruixes',
    subtitle: 'El Codi de Fogueres',
    category: 'principal',
    act: 1,
    location: 'Serrat de les Bruixes (punt alt, pal o fita de fusta visible)',
    format: 'Cartell A2 laminat (protegit contra vent i humitat)',
    elementReward: 'Xifra 4 (FOC)',
    elementImage: '/images/elements/foc.webp',
    contentSummary: 'Quadrat de Polibi 5×5 (A–Z, Ç i punt per desxifrar senyals de foc)',
    path: '/s/serrat-bruixes',
    fileBaseName: 'cartell-01-serrat-bruixes',
  },
  {
    id: 'font-ferro',
    number: 2,
    title: 'Font del Ferro',
    subtitle: "Tinta i Torns d'Aigua",
    category: 'principal',
    act: 1,
    location: 'Vora la Font del Ferro (lloc natural humit)',
    format: 'Cartell A2 laminat (resistent a esquitxades)',
    elementReward: 'Xifra 2 (AIGUA)',
    elementImage: '/images/elements/aigua.webp',
    contentSummary: 'Recepta de la Tinta de Gales + Registre de torns 10–16 de maig (12 de maig clau)',
    path: '/s/font-ferro',
    fileBaseName: 'cartell-02-font-ferro',
  },
  {
    id: 'planes-bones',
    number: 3,
    title: 'Planes Bones',
    subtitle: 'La Ronda de la Patrulla',
    category: 'principal',
    act: 1,
    location: 'Tram de camí de Planes Bones (cruïlla estratègica)',
    format: 'Cartell A1 o A2 laminat',
    elementReward: 'Xifra 3 (TERRA)',
    elementImage: '/images/elements/terra.webp',
    contentSummary: 'Mapa de camins i masies, taula de temps en quarts d’hora i advertència dels jurats',
    path: '/s/planes-bones',
    fileBaseName: 'cartell-03-planes-bones',
  },
  {
    id: 'clau-forja',
    number: 3.5,
    title: 'Pedra Gran de Can Vinyals',
    subtitle: 'La Clau de la Forja (Objecte Perdut)',
    category: 'principal',
    act: 1,
    location: 'Entrecreuament cap al camí de Can Vinyals, sota les nogueres (fita de pedra)',
    format: 'Targeta / adhesiu A5 o A6 plastificat i resistent a la intempèrie',
    elementReward: 'Validació Clau (TERRA = 3)',
    elementImage: '/images/elements/terra.webp',
    contentSummary: 'QR de troballa de la clau perduda d’Isidre + Codi manual de reserva CLAU-FORJA',
    path: '/s/clau-forja',
    fileBaseName: 'objecte-pedra-can-vinyals',
    manualCode: 'CLAU-FORJA',
  },
  {
    id: 'cementiri',
    number: 4,
    title: 'Cementiri de la Guixa',
    subtitle: 'La Signatura del Difunt',
    category: 'principal',
    act: 1,
    location: 'Cementiri vell (exterior, FORA de la reixa de ferro)',
    format: 'Cartell A2 o A3 laminat',
    elementReward: 'Xifra 1 (AIRE)',
    elementImage: '/images/elements/aire.webp',
    contentSummary: 'Text sobre làpides velles + Fragment de carta manuscrita clavada amb clau',
    path: '/s/cementiri',
    fileBaseName: 'cartell-04-cementiri',
  },
  {
    id: 'pla-masset',
    number: 5,
    title: 'Pla del Masset',
    subtitle: "Control de l'Emissari / Acusació",
    category: 'secundari',
    act: 2,
    location: "Entrada al Pla del Masset (o en un faristol/carpeta que custodia l'actor de l'Emissari)",
    format: "A3 o carpeta d'attrezzo en mà de l'actor",
    elementReward: 'Desbloqueig Acusació Final',
    contentSummary: 'Ordre de control nocturna de la guàrdia (16 de maig) per a interrogar equips',
    path: '/s/pla-masset',
    fileBaseName: 'cartell-05-pla-masset',
  },
  {
    id: 'caixa-almoines',
    number: 6,
    title: 'Rectoria',
    subtitle: 'La Clau de les Almoines',
    category: 'secundari',
    act: 2,
    location: 'Porxo de la Rectoria (nivell de terra, vora on es va llençar la clau)',
    format: 'A4 discret sobre paper envellit / fita baixa',
    elementReward: 'Obertura Caixa Almoines (Fase Final)',
    contentSummary: 'Nota urgent de Mossèn Ramon ferit, explicant que va llançar la clau a la foscor',
    path: '/s/caixa-almoines',
    fileBaseName: 'cartell-06-rectoria',
  },
]

export default function MasterQRDashboard() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [filter, setFilter] = useState<'all' | 'stations' | 'teams'>('all')
  const [stationQRs, setStationQRs] = useState<Record<string, { png: string; svg: string }>>({})
  const [teamQRs, setTeamQRs] = useState<Record<string, { png: string; svg: string }>>({})
  const [isGenerating, setIsGenerating] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('master_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  // Set default origin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  // Regenerate all QR codes whenever origin changes
  useEffect(() => {
    if (!origin) return

    let isMounted = true
    setIsGenerating(true)

    const generateAll = async () => {
      try {
        const sQrs: Record<string, { png: string; svg: string }> = {}
        for (const st of STATIONS_METADATA) {
          const targetUrl = `${origin}${st.path}`
          const png = await QRCode.toDataURL(targetUrl, {
            width: 480,
            margin: 2,
            color: { dark: '#1c1917', light: '#ffffff' },
          })
          const svg = await QRCode.toString(targetUrl, {
            type: 'svg',
            width: 480,
            margin: 2,
            color: { dark: '#1c1917', light: '#ffffff' },
          })
          sQrs[st.id] = { png, svg }
        }

        const tQrs: Record<string, { png: string; svg: string }> = {}
        for (const tm of DEFAULT_TEAMS) {
          const targetUrl = `${origin}/e/${tm.code}`
          const png = await QRCode.toDataURL(targetUrl, {
            width: 480,
            margin: 2,
            color: { dark: '#1c1917', light: '#ffffff' },
          })
          const svg = await QRCode.toString(targetUrl, {
            type: 'svg',
            width: 480,
            margin: 2,
            color: { dark: '#1c1917', light: '#ffffff' },
          })
          tQrs[tm.code] = { png, svg }
        }

        if (isMounted) {
          setStationQRs(sQrs)
          setTeamQRs(tQrs)
          setIsGenerating(false)
        }
      } catch (err) {
        console.error('Error generating QR codes:', err)
        if (isMounted) setIsGenerating(false)
      }
    }

    generateAll()

    return () => {
      isMounted = false
    }
  }, [origin])

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadSVG = (fileName: string, svgString: string) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-6 print:p-0 print:bg-white text-stone-900">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Actions (Hidden when printing) */}
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden bg-white p-5 rounded-2xl shadow-sm border border-amber-200">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/master"
                className="text-sm font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                ← Tornar al Panell
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-950 mt-1">
              📍 Central de Codis QR Imprimibles
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Cartells d'Estació per situar al poble (4 principals + 2 secundaris) i targetes d'equip
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
            <Link
              href="/master/print"
              target="_blank"
              className="px-4 py-2 border border-amber-300 hover:bg-amber-50 text-amber-900 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <span>🖨️</span> Fitxes d'Equips (A4)
            </Link>
            <button
              onClick={() => window.print()}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl text-sm shadow transition flex items-center gap-2"
            >
              <span>🖨️</span> Imprimir Cartells QR Ara
            </button>
          </div>
        </div>

        {/* Configuration Bar: Domain & Filters (Hidden when printing) */}
        <div className="mb-6 print:hidden bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Base URL selector */}
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
              Domini Base del QR:
            </label>
            <div className="flex-1 flex gap-2 w-full">
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800"
              />
              <button
                onClick={() => setOrigin(window.location.origin)}
                title="Restablir a domini actual del navegador"
                className="px-2.5 py-1.5 text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-lg transition"
              >
                Actual
              </button>
              <button
                onClick={() => setOrigin('https://traidor-guixa.vercel.app')}
                title="Fixar a Vercel de producció"
                className="px-2.5 py-1.5 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg transition"
              >
                Vercel
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tots (14)
            </button>
            <button
              onClick={() => setFilter('stations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === 'stations'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Cartells Estació (6)
            </button>
            <button
              onClick={() => setFilter('teams')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filter === 'teams'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Equips (8)
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="py-12 text-center text-amber-900 font-semibold print:hidden">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-900 border-t-amber-300 mb-2" />
            <p>Generant codis QR en alta resolució...</p>
          </div>
        )}

        {/* SECCIÓ 1: CARTELLS D'ESTACIÓ AL POBLE */}
        {(filter === 'all' || filter === 'stations') && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4 border-b border-stone-300 pb-2 print:hidden">
              <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                <span>🏰</span> Cartells d'Estació al Poble (4 Principals + 2 Secundaris)
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                Mida mínima recomanada impresa: 5 × 5 cm
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
              {STATIONS_METADATA.map((st) => {
                const qr = stationQRs[st.id]
                const fullUrl = `${origin}${st.path}`

                return (
                  <div
                    key={st.id}
                    className="bg-white border-2 border-stone-300 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative break-inside-avoid print:shadow-none print:border-dashed print:p-4"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
                          Cartell {st.number} · {st.category === 'principal' ? 'Acte 1 (Principal)' : 'Acte 2 (Final)'}
                        </span>
                        {st.elementReward && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200 flex items-center gap-1.5">
                            {st.elementImage && (
                              <img src={st.elementImage} alt="" className="w-3.5 h-3.5 object-contain" />
                            )}
                            <span>{st.elementReward}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-stone-900">{st.title}</h3>
                      <p className="text-xs font-medium text-amber-800 mb-3">{st.subtitle}</p>

                      {/* Technical Physical Details */}
                      <div className="text-[11px] space-y-1.5 text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200 mb-4 print:bg-white print:border-none print:p-1">
                        <div>
                          <strong className="text-stone-800">📍 Ubicació:</strong> {st.location}
                        </div>
                        <div>
                          <strong className="text-stone-800">📐 Format:</strong> {st.format}
                        </div>
                        <div>
                          <strong className="text-stone-800">📜 Contingut imprès:</strong> {st.contentSummary}
                        </div>
                      </div>
                    </div>

                    {/* Central QR Code Display */}
                    <div className="flex flex-col items-center justify-center my-2 p-3 bg-stone-50/50 rounded-xl border border-stone-200 print:bg-white print:p-0">
                      {qr?.png ? (
                        <img
                          src={qr.png}
                          alt={st.title}
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain bg-white p-2 rounded-lg shadow-sm print:shadow-none border border-stone-200"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-stone-400">
                          Carregant QR...
                        </div>
                      )}

                      <div className="mt-2 text-center">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">Codi Manual:</span>
                        <code className="text-xs font-mono font-bold text-amber-950 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 inline-block mt-0.5">
                          {st.manualCode || st.id}
                        </code>
                      </div>
                    </div>

                    {/* URL info & Action Buttons (Buttons hidden in print) */}
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <div className="flex items-center justify-between text-[11px] text-stone-500 mb-3">
                        <span className="truncate max-w-[240px] font-mono text-stone-600" title={fullUrl}>
                          {fullUrl}
                        </span>
                        <button
                          onClick={() => handleCopyUrl(st.id, fullUrl)}
                          className="text-amber-800 hover:text-amber-950 font-semibold ml-2 flex-shrink-0 print:hidden"
                        >
                          {copiedId === st.id ? '✓ Copiat' : 'Copiar URL'}
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 print:hidden">
                        {qr && (
                          <>
                            <a
                              href={qr.png}
                              download={`${st.fileBaseName}.png`}
                              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold text-center transition shadow-sm flex items-center justify-center gap-1"
                            >
                              <span>📥</span> PNG
                            </a>
                            <button
                              onClick={() => handleDownloadSVG(st.fileBaseName, qr.svg)}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                            >
                              <span>📥</span> SVG
                            </button>
                          </>
                        )}
                        <Link
                          href={st.path}
                          target="_blank"
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                        >
                          <span>🔗</span> Provar
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* SECCIÓ 2: TARGETES D'EQUIP */}
        {(filter === 'all' || filter === 'teams') && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4 border-b border-stone-300 pb-2 print:hidden">
              <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                <span>📱</span> Targetes d'Accés per als Equips (8 Equips)
              </h2>
              <Link
                href="/master/print"
                target="_blank"
                className="text-xs font-bold text-amber-800 hover:underline"
              >
                Obrir format A4 per retallar →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-2 print:gap-3">
              {DEFAULT_TEAMS.map((tm) => {
                const qr = teamQRs[tm.code]

                return (
                  <div
                    key={tm.code}
                    className="bg-white border-2 border-stone-200 rounded-xl p-4 flex flex-col justify-between items-center text-center shadow-sm relative break-inside-avoid"
                    style={{ borderTop: `5px solid ${tm.color}` }}
                  >
                    <div>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: tm.color }}
                        />
                        <h4 className="text-sm font-bold text-stone-900">{tm.name}</h4>
                      </div>
                      <p className="text-[11px] font-mono text-stone-500">
                        Codi: <strong className="text-amber-900">{tm.code}</strong>
                      </p>
                    </div>

                    <div className="my-3 p-2 bg-stone-50 rounded-lg border border-stone-200 print:bg-white">
                      {qr?.png ? (
                        <img
                          src={qr.png}
                          alt={tm.name}
                          className="w-36 h-36 object-contain bg-white p-1 rounded"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-stone-400 text-xs">
                          Carregant...
                        </div>
                      )}
                    </div>

                    <div className="w-full pt-2 border-t border-stone-100 print:hidden">
                      <div className="flex gap-1.5">
                        {qr && (
                          <>
                            <a
                              href={qr.png}
                              download={`equip-${tm.code.toLowerCase()}.png`}
                              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[10px] font-semibold transition"
                            >
                              PNG
                            </a>
                            <button
                              onClick={() =>
                                handleDownloadSVG(`equip-${tm.code.toLowerCase()}`, qr.svg)
                              }
                              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[10px] font-semibold transition"
                            >
                              SVG
                            </button>
                          </>
                        )}
                        <Link
                          href={`/e/${tm.code}`}
                          target="_blank"
                          className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-[10px] font-semibold transition"
                        >
                          Entrar
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}
