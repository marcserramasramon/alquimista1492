'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'
import type { TeamRow, SessionRow, PassRow } from '@/lib/realtime/useTeamState'

interface SalconduitTabProps {
  team?: TeamRow | null
  session?: SessionRow | null
  passes?: PassRow[]
  onOpenNotebook?: () => void
}

export function SalconduitTab({
  team,
  session,
  passes = [],
  onOpenNotebook,
}: SalconduitTabProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  // Nombre de salvos restants de l'equip (per defecte 2 com a màxim col·lectiu)
  const realSalvos = session?.salconduits_remaining ?? 2

  // Mode preview / simulador interactiu
  const isPreview = !team || typeof window !== 'undefined' && window.location.pathname.includes('/preview')
  const [previewSalvos, setPreviewSalvos] = useState<number>(2)

  const salvosCount = isPreview ? previewSalvos : realSalvos
  const teamCode = team?.code || 'EQUIP-1'
  const teamName = team?.name || 'Equip de la Guixa'

  // Generar Codi QR del Salvoconducte per a l'Emissari
  useEffect(() => {
    if (!qrCanvasRef.current) return

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    // URL que obrirà l'Emissari quan escanegi el QR amb la càmera del seu mòbil
    const qrTargetUrl = `${origin}/emissari/${teamCode}`

    QRCode.toCanvas(
      qrCanvasRef.current,
      qrTargetUrl,
      {
        width: 170,
        margin: 1,
        color: {
          dark: '#2B2118', // Marró tinta antiga
          light: '#F4EBD9', // Fons pergamí
        },
      },
      (err) => {
        if (err) console.error('Error generating salvoconducte QR:', err)
      }
    )
  }, [teamCode])

  return (
    <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6 pb-24 font-serif text-[#2B2118]">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 pb-8">
        {/* Selector de simulació si estem en mode preview */}
        {isPreview && (
          <div className="p-3 bg-[#EAE0CA] border border-[#8C6D53] rounded-xl text-xs font-sans text-[#5C4533] flex items-center justify-between">
            <span className="font-bold">🔍 Simula l'estat dels Salvos de l'equip:</span>
            <div className="flex gap-1">
              {[2, 1, 0].map((num) => (
                <button
                  key={num}
                  onClick={() => setPreviewSalvos(num)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition ${
                    previewSalvos === num
                      ? 'bg-[#1D3557] text-white border-[#1D3557]'
                      : 'bg-[#F4EBD9] text-[#2B2118] border-[#8C6D53]'
                  }`}
                >
                  {num} {num === 1 ? 'salvo' : 'salvos'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENT OFICIAL DEL SALVOCONDUCTE (1705) */}
        <div className="bg-[#F4EBD9] border-4 border-[#8C6D53] rounded-2xl shadow-2xl p-5 sm:p-7 relative overflow-hidden">
          {/* Marc ornamental intern */}
          <div className="absolute inset-1.5 border border-[#8C6D53]/40 rounded-xl pointer-events-none" />

          {/* Marca d'aigua de segell reial */}
          <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 select-none pointer-events-none">
            🛡️
          </div>

          {/* Encapçalament Solemne */}
          <header className="text-center border-b-2 border-[#8C6D53] pb-4 mb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">⚜️</span>
              <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-widest text-[#8C6D53]">
                Batllia de la Guixa i Vegueria de Vic
              </span>
              <span className="text-xl">⚜️</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#1D3557] tracking-tight">
              SALVOCONDUCTE OFICIAL
            </h1>

            <p className="text-[11px] font-serif italic text-[#5C4533] mt-0.5">
              Lliure trànsit atorgat en temps de guerra · Any de Nostre Senyor 1705
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#D8CCAE] rounded-full border border-[#8C6D53]/60 text-[11px] font-sans font-bold text-[#2B2118]">
              <span>Equip:</span>
              <span className="font-serif italic font-bold">{teamName}</span>
              <span className="font-mono text-[#1D3557]">({teamCode})</span>
            </div>
          </header>

          {/* TEXT LEGAL D'ÈPOCA */}
          <p className="text-xs font-serif leading-relaxed text-[#5C4533] text-center italic mb-5">
            «Féu saber a tots els capitans, sometents i emissaris que els integrants d'aquesta agrupació gaudeixen de dos permisos de pas vàlids. En cas de contradicció o desobediència, l'autoritat podrà confiscar-ne els segells.»
          </p>

          {/* ELS 2 PERMISOS DE L'EQUIP */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs font-sans font-bold text-[#1D3557] uppercase tracking-wider px-1">
              <span>Permisos de l'Equip:</span>
              <span>{salvosCount} de 2 Actius</span>
            </div>

            {/* Permís 1 */}
            <div
              className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                salvosCount >= 1
                  ? 'bg-[#EAE0CA] border-[#B8860B] text-[#2B2118] shadow-sm'
                  : 'bg-[#F8D7DA] border-[#842029] text-[#842029] opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{salvosCount >= 1 ? '🎖️' : '🚫'}</div>
                <div>
                  <h3 className="font-serif font-bold text-sm">
                    PRIMER PERMÍS REIAL
                  </h3>
                  <p className="text-[11px] font-sans">
                    {salvosCount >= 1
                      ? 'Autorització de lliure pas vigent'
                      : 'Confiscat per l\'Emissari al punt de control'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  salvosCount >= 1
                    ? 'bg-[#B8860B] text-white'
                    : 'bg-[#842029] text-white'
                }`}
              >
                {salvosCount >= 1 ? 'VÀLID' : 'RETIRAT'}
              </span>
            </div>

            {/* Permís 2 */}
            <div
              className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                salvosCount >= 2
                  ? 'bg-[#EAE0CA] border-[#B8860B] text-[#2B2118] shadow-sm'
                  : 'bg-[#F8D7DA] border-[#842029] text-[#842029] opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{salvosCount >= 2 ? '🎖️' : '🚫'}</div>
                <div>
                  <h3 className="font-serif font-bold text-sm">
                    SEGON PERMÍS REIAL
                  </h3>
                  <p className="text-[11px] font-sans">
                    {salvosCount >= 2
                      ? 'Autorització de lliure pas vigent'
                      : 'Confiscat per l\'Emissari al punt de control'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  salvosCount >= 2
                    ? 'bg-[#B8860B] text-white'
                    : 'bg-[#842029] text-white'
                }`}
              >
                {salvosCount >= 2 ? 'VÀLID' : 'RETIRAT'}
              </span>
            </div>
          </div>

          {/* AVÍS SI PERDEN ELS 2 SALVOS */}
          {salvosCount === 0 && (
            <div className="mb-6 p-3.5 bg-[#842029] text-white rounded-xl text-xs font-sans text-center shadow">
              <span className="font-bold block mb-0.5">⚠️ SALVACONDUCTE SENSE EFECTE</span>
              <span>L'Emissari ha confiscat tots dos permisos de l'equip. Se us detindrà a la Rectoria.</span>
            </div>
          )}

          {/* CODI QR DEL SALVOCONDUCTE PER A L'EMISSARI */}
          <div className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl p-4 text-center">
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#8C6D53] block mb-1">
              Validació Oficial de Camp
            </span>
            <h4 className="text-sm font-bold font-serif text-[#1D3557] mb-3">
              MOSTRA AQUEST CODI QR A L'EMISSARI
            </h4>

            {/* Canvas QR */}
            <div className="inline-block p-3 bg-[#F4EBD9] rounded-xl border-2 border-[#8C6D53] shadow-inner mb-3">
              <canvas ref={qrCanvasRef} className="mx-auto block" />
            </div>

            <p className="text-[11px] font-serif italic text-[#5C4533] max-w-xs mx-auto leading-tight">
              L'Emissari escanejarà aquest codi des del seu dispositiu per verificar la vostra coartada o per confiscar-vos un permís.
            </p>
          </div>
        </div>

        {/* RECORDATORI DE LA COARTADA AL QUADERN */}
        <div className="bg-[#EAE0CA] border border-[#8C6D53] rounded-xl p-4 text-center">
          <p className="text-xs text-[#5C4533] mb-2 font-serif">
            Recorda que per superar el control de l'Emissari cal sostenir la coartada que se us ha comunicat.
          </p>
          {onOpenNotebook && (
            <button
              onClick={onOpenNotebook}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D3557] hover:bg-[#162740] text-white rounded-lg font-sans font-bold text-xs shadow transition"
            >
              <span>📔</span>
              <span>Consultar la meva frase al Quadern</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
