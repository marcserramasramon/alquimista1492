'use client'

import Link from 'next/link'

export interface TeamResultData {
  teamName: string
  teamColor?: string
  teamCode: string
  score: number
  timeElapsed: number
  moralChoice?: string | null
  isCorrect?: boolean
  solvedStations: number
  salconduitsRemaining: number
}

export interface RankingItem {
  id: string
  name: string
  code: string
  color: string
  score: number
  timeElapsed: number
  finished: boolean
}

interface ResultsViewProps {
  teamResult: TeamResultData | null
  ranking: RankingItem[]
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${String(secs).padStart(2, '0')}s`
}

/**
 * Pantalla final de la partida: veredicte, epíleg moral triat per l'equip,
 * estadístiques pròpies i classificació general. Es fa servir tant a la
 * pàgina `/results` (dades reals) com al Visor de Jocs (dades simulades).
 */
export function ResultsView({ teamResult, ranking }: ResultsViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950 text-stone-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold">
            El Traïdor de la Guixa · Epíleg Final
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-amber-100 mt-1">
            Resultat de la Partida
          </h1>
          {teamResult && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-stone-800 rounded-full border border-stone-700">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamResult.teamColor }}
              />
              <span className="text-xs font-semibold text-amber-200">
                {teamResult.teamName} ({teamResult.teamCode})
              </span>
            </div>
          )}
        </div>

        {/* Accusation Status Banner */}
        <div className="bg-stone-800/90 border-2 border-amber-500/50 rounded-2xl p-6 mb-6 shadow-xl text-center">
          <div className="text-5xl mb-3">
            {teamResult?.isCorrect ? '🏆' : '⚖️'}
          </div>
          <h2 className="text-2xl font-bold font-serif text-amber-100 mb-2">
            {teamResult?.isCorrect
              ? 'El Traïdor Ha Estat Descobert!'
              : "La Conjuració S'Ha Desvetllat!"}
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed max-w-lg mx-auto">
            En Bernat Cufí, l'antic mestre d'escola, era qui passava la informació als dragons de Felip V per salvar la vida del seu fill Jaume.
          </p>
        </div>

        {/* Moral Epilogue Section */}
        {teamResult?.moralChoice && (
          <div className="bg-amber-950/40 border border-amber-800/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>📖</span>
              <span>El Vostre Epíleg: {teamResult.moralChoice === 'A' ? 'Compassió' : 'Justícia'}</span>
            </div>
            <blockquote className="text-stone-200 text-sm italic leading-relaxed border-l-2 border-amber-500 pl-4 my-2">
              {teamResult.moralChoice === 'A' ? (
                <>
                  "Els joves saben per on vénen els dragons, i els conjurats fugen pel camí segur de la ronda. Bernat desapareix en la fosca. Mesos més tard, quan Vic canvia de mans, obren les presons. En Jaume surt. Espera a la porta i veu el seu pare. S'abraçen sense paraules. Bernat no torna mai més a la Guixa. Però en Jaume viu."
                </>
              ) : (
                <>
                  "Els joves toquen a sometent sense saber per on vénen els dragons. Els conjurats se'n surten pels pèls. Bernat queda lligat a un mas apartat fins que passa tot. Mesos més tard, quan Vic canvia de mans, en Jaume surt de la presó. Busca el seu pare a l'escola i no el troba. La campana sona bé. Però el preu va ser més alt."
                </>
              )}
            </blockquote>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <span className="text-xs text-stone-400 block mb-1">Punts Finals</span>
            <span className="text-2xl font-black font-mono text-amber-300">
              {teamResult?.score ?? 0}
            </span>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <span className="text-xs text-stone-400 block mb-1">Temps Total</span>
            <span className="text-lg font-bold font-mono text-stone-200">
              {teamResult ? formatTime(teamResult.timeElapsed) : '--'}
            </span>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 rounded-xl p-3 text-center">
            <span className="text-xs text-stone-400 block mb-1">Salconduits</span>
            <span className="text-2xl font-bold font-mono text-green-400">
              {teamResult?.salconduitsRemaining ?? 3}/3
            </span>
          </div>
        </div>

        {/* General Ranking of Teams */}
        {ranking.length > 0 && (
          <div className="bg-stone-800/60 border border-stone-700 rounded-2xl p-5 mb-8">
            <h3 className="text-base font-bold font-serif text-amber-200 mb-4 flex items-center justify-between">
              <span>Classificació de la Partida</span>
              <span className="text-xs text-stone-400 font-sans font-normal">{ranking.length} equips</span>
            </h3>

            <div className="space-y-2">
              {ranking.map((team, idx) => {
                const isCurrentTeam = team.code === teamResult?.teamCode
                return (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                      isCurrentTeam
                        ? 'bg-amber-950/60 border-amber-500 shadow-md scale-[1.02]'
                        : 'bg-stone-900/60 border-stone-700/80 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400 w-5 text-center">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}r`}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <div>
                        <span className="font-semibold text-stone-100">
                          {team.name}
                        </span>
                        {isCurrentTeam && (
                          <span className="ml-2 text-[10px] uppercase font-bold bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded">
                            El vostre equip
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-300">
                        {team.score} pts
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Return Button */}
        <div className="text-center pb-8">
          <Link
            href="/joc"
            className="inline-block px-6 py-3 bg-stone-800 hover:bg-stone-700 text-amber-200 text-sm font-semibold rounded-xl border border-stone-600 shadow transition"
          >
            ← Tornar al Tauler de Joc
          </Link>
        </div>
      </div>
    </div>
  )
}
