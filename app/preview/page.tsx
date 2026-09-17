'use client'

import { useState } from 'react'
import { getGameComponent, GAMES } from '@/components/games/registry'
import { SubmitResult } from '@/components/gameTypes'

const GAME_TABS = [
  { id: 'serrat-bruixes', name: '1. Serrat Bruixes', tag: 'Foc / Polibi' },
  { id: 'font-ferro', name: '2. Font del Ferro', tag: 'Tinta / Dates' },
  { id: 'planes-bones', name: '3. Planes Bones', tag: 'Ruta 4x4' },
  { id: 'cementiri', name: '4. Cementiri', tag: 'Làpides' },
  { id: 'pla-masset-control', name: '5. Control Masset', tag: 'Interrogatori' },
  { id: 'pla-masset-accusation', name: '6. Acusació', tag: 'Traïdor' },
  { id: 'caixa-almoines', name: '7. Caixa Almoines', tag: '3 Fases' },
  { id: 'sometent-campanar', name: '8. Campanar', tag: 'Sometent' },
  { id: 'decisio-moral', name: '9. Decisió Moral', tag: 'Final' },
]

export default function PreviewPage() {
  const [selectedGame, setSelectedGame] = useState('serrat-bruixes')
  const [sharedState, setSharedState] = useState<unknown>({})
  const [submissionLog, setSubmissionLog] = useState<Array<{ time: string; data: unknown; result: SubmitResult }>>([])
  const [forceCorrect, setForceCorrect] = useState(true)

  const GameComponent = getGameComponent(selectedGame)

  const mockSubmit = async (answer: unknown): Promise<SubmitResult> => {
    const isCorrect = forceCorrect
    const result: SubmitResult = {
      correct: isCorrect,
      message: isCorrect ? 'Enigma resolt correctament!' : 'Resposta incorrecta. Torna-ho a provar.',
      score: isCorrect ? 100 : -10,
    }

    setSubmissionLog(prev => [
      {
        time: new Date().toLocaleTimeString('ca-ES'),
        data: answer,
        result,
      },
      ...prev.slice(0, 4),
    ])

    return result
  }

  const handleSelectGame = (id: string) => {
    setSelectedGame(id)
    setSharedState({})
  }

  return (
    <div className="min-h-screen bg-[#F4EBD9] text-[#2B2118] flex flex-col font-serif">
      {/* Top Bar for Navigation between all games */}
      <header className="bg-[#1D3557] text-white px-4 py-3 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗝️</span>
            <div>
              <h1 className="text-base font-bold tracking-wide uppercase font-sans">
                Visor de Jocs — El Traïdor de la Guixa
              </h1>
              <p className="text-xs text-amber-200 font-sans">
                Mode Explorador: Prova interactiva dels 9 enigmes
              </p>
            </div>
          </div>

          {/* Validation toggle for testing both correct and incorrect feedback */}
          <div className="flex items-center gap-2 text-xs bg-[#162740] px-3 py-1.5 rounded-full border border-blue-400/30">
            <span className="font-sans text-gray-300">Resposta simulada:</span>
            <button
              onClick={() => setForceCorrect(true)}
              className={`px-2 py-0.5 rounded font-sans font-bold transition-all ${
                forceCorrect ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ✓ Correcta
            </button>
            <button
              onClick={() => setForceCorrect(false)}
              className={`px-2 py-0.5 rounded font-sans font-bold transition-all ${
                !forceCorrect ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              ✗ Incorrecta
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="max-w-7xl mx-auto mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {GAME_TABS.map(tab => {
            const isSelected = selectedGame === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectGame(tab.id)}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap font-sans transition-all flex flex-col items-start ${
                  isSelected
                    ? 'bg-[#C99E32] text-[#2B2118] font-bold shadow'
                    : 'bg-[#2B466D] text-gray-200 hover:bg-[#3B5B8C]'
                }`}
              >
                <span>{tab.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-[#4A3A28]' : 'text-gray-300'}`}>
                  {tab.tag}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Game Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">
        <div className="bg-[#EAE0CA] border-2 border-[#8C6D53] rounded-xl shadow-lg overflow-hidden min-h-[600px] flex flex-col">
          {GameComponent ? (
            <div className="p-2 sm:p-4 flex-1">
              <GameComponent
                stationId={selectedGame}
                content={{}}
                sharedState={sharedState}
                setSharedState={setSharedState}
                submit={mockSubmit}
                solved={false}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-red-700">
              No s'ha trobat el joc seleccionat.
            </div>
          )}

          {/* Submission activity log at bottom */}
          {submissionLog.length > 0 && (
            <div className="border-t border-[#8C6D53] bg-[#DFD4BC] p-3 text-xs font-sans">
              <div className="font-bold text-[#2B2118] mb-1 flex items-center justify-between">
                <span>Darrers intents enviats al joc:</span>
                <button
                  onClick={() => setSubmissionLog([])}
                  className="text-gray-600 hover:text-black underline"
                >
                  Netejar registre
                </button>
              </div>
              <div className="space-y-1">
                {submissionLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-600">[{log.time}]</span>
                    <span className={log.result.correct ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                      {log.result.correct ? '✓ CORREC' : '✗ ERROR'}
                    </span>
                    <span className="text-gray-800 truncate">
                      Dades: {JSON.stringify(log.data)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
