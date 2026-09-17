'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { DEFAULT_TEAMS } from '@/lib/master/config'

interface TeamQRCard {
  code: string
  name: string
  color: string
  qrUrl: string
  joinUrl: string
}

export default function MasterPrintPage() {
  const [cards, setCards] = useState<TeamQRCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateAll = async () => {
      const origin = window.location.origin
      const generated: TeamQRCard[] = []

      for (const t of DEFAULT_TEAMS) {
        const joinUrl = `${origin}/e/${t.code}`
        try {
          const qrUrl = await QRCode.toDataURL(joinUrl, {
            width: 320,
            margin: 1,
            color: {
              dark: '#1c1917',
              light: '#ffffff',
            },
          })
          generated.push({
            code: t.code,
            name: t.name,
            color: t.color,
            qrUrl,
            joinUrl,
          })
        } catch (e) {
          console.error('Error generating card for', t.code, e)
        }
      }

      setCards(generated)
      setIsLoading(false)
    }

    generateAll()
  }, [])

  return (
    <div className="min-h-screen bg-stone-100 p-6 print:p-0 print:bg-white text-stone-900">
      {/* Non-print controls */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden bg-white p-4 rounded-xl shadow border border-amber-200">
        <div>
          <h1 className="text-xl font-bold text-amber-950">Fitxes d'Equip per Imprimir</h1>
          <p className="text-xs text-amber-700">8 equips llestos per retallar i repartir als participants</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition"
          >
            Tancar
          </button>
          <button
            onClick={() => window.print()}
            disabled={isLoading}
            className="px-6 py-2 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-lg text-sm shadow transition flex items-center gap-2"
          >
            <span>🖨️</span> Imprimir Ara
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-amber-900 font-semibold">
          Generant codis QR en alta resolució...
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4 print:gap-3 print:max-w-none">
          {cards.map((card) => (
            <div
              key={card.code}
              className="bg-white border-2 border-dashed border-stone-300 rounded-xl p-5 flex flex-col items-center justify-between text-center relative break-inside-avoid print:shadow-none shadow-sm"
              style={{ minHeight: '340px' }}
            >
              {/* Header */}
              <div className="w-full pb-2 mb-2 border-b border-stone-200">
                <span className="text-[10px] tracking-widest uppercase font-bold text-stone-500">
                  El Traïdor de la Guixa · Escape Room
                </span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block"
                    style={{ backgroundColor: card.color }}
                  />
                  <h2 className="text-lg font-bold text-stone-900">{card.name}</h2>
                </div>
              </div>

              {/* QR */}
              <div className="p-2 bg-white rounded-lg border border-stone-200 my-1">
                <img src={card.qrUrl} alt={card.name} className="w-44 h-44 object-contain" />
              </div>

              {/* Instructions */}
              <div className="w-full pt-2 border-t border-stone-200 text-xs text-stone-600">
                <p className="font-semibold text-stone-800">
                  Codi d'equip: <span className="font-mono text-amber-900 text-sm tracking-wider">{card.code}</span>
                </p>
                <p className="text-[11px] mt-1 text-stone-500">
                  Tots els membres de l'equip escanegeu aquest codi per compartir la mateixa partida.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Specific CSS */}
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
