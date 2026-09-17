'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GameProps } from '@/components/gameTypes'
import { useAudio } from '@/lib/audio/useAudio'
import {
  fadeInVariants,
  scaleVariants,
  buttonHoverVariants,
} from '@/lib/animations/useAnimations'

interface GameState {
  currentScreen: 'menu' | 'intro' | 'lapides' | 'registre' | 'carta' | 'joc' | 'result'
  selectedLapida: number | null
  attempts: number
}

const LAPIDES = [
  { id: 1, name: 'Corminas', year: 1698 },
  { id: 2, name: 'Corbella', year: 1705 },
  { id: 3, name: 'Mas', year: 1700 },
  { id: 4, name: 'Coromines', year: 1702 },
  { id: 5, name: 'Corminelles', year: 1697 },
  { id: 6, name: 'Carrió', year: 1704 },
  { id: 7, name: 'Solà', year: 1699 },
  { id: 8, name: 'Puig', year: 1703 },
  { id: 9, name: 'Molí', year: 1701 },
]

const REGISTRY = [
  { year: 1697, name: 'Joan Corminelles' },
  { year: 1698, name: 'Joseph Coromines' },
  { year: 1699, name: 'Miquel Solà' },
  { year: 1700, name: 'Pere Mas' },
  { year: 1701, name: 'Gabriel Molí' },
  { year: 1702, name: 'Maria Coromines' },
  { year: 1703, name: 'Antoni Puig' },
  { year: 1704, name: 'Jaume Carrió' },
  { year: 1705, name: 'Jaume Corbella' },
]

export function CementiriGame(props: GameProps) {
  const { play } = useAudio()
  const [state, setState] = useState<GameState>(() => {
    const saved = props.sharedState as GameState | undefined
    return saved || {
      currentScreen: 'menu',
      selectedLapida: null,
      attempts: 0,
    }
  })

  useEffect(() => {
    props.setSharedState(state)
  }, [state, props])

  const handleSubmit = async () => {
    if (!state.selectedLapida) return

    const result = await props.submit({
      lapisaId: state.selectedLapida,
    })

    if (result.correct) {
      play('evidence-unlock')
      setState(prev => ({ ...prev, currentScreen: 'result' }))
    } else {
      play('buzzer')
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        selectedLapida: null,
      }))
    }
  }

  const navigateTo = (screen: GameState['currentScreen']) => {
    setState(prev => ({ ...prev, currentScreen: screen }))
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto p-4 min-h-screen bg-amber-50 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Timer at top */}
      <div className="text-right text-sm font-mono text-red-600 mb-4">
        12:34:56
      </div>

      {state.currentScreen === 'menu' && (
        <MenuScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'intro' && (
        <IntroScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'lapides' && (
        <LapidesScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'registre' && (
        <RegistreScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'carta' && (
        <CartaScreen onNavigate={navigateTo} />
      )}

      {state.currentScreen === 'joc' && (
        <JocScreen
          selectedLapida={state.selectedLapida}
          onLapisaSelect={id => setState(prev => ({ ...prev, selectedLapida: id }))}
          onSubmit={handleSubmit}
          onNavigate={navigateTo}
          attempts={state.attempts}
        />
      )}

      {state.currentScreen === 'result' && (
        <ResultScreen solved={props.solved} selectedLapida={state.selectedLapida} />
      )}
    </motion.div>
  )
}

function MenuScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      <h1 className="text-4xl font-bold text-center mb-8">CEMENTIRI</h1>
      <h2 className="text-xl text-center mb-8 text-amber-900">La Signatura del Difunt</h2>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('intro')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [1] INTRODUCCIÓ
        </button>
        <button
          onClick={() => onNavigate('lapides')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [2] LÀPIDES
        </button>
        <button
          onClick={() => onNavigate('registre')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [3] REGISTRE
        </button>
        <button
          onClick={() => onNavigate('carta')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [4] LA CARTA
        </button>
        <button
          onClick={() => onNavigate('joc')}
          className="w-full p-4 bg-amber-900 text-amber-50 font-bold text-lg border-2 border-amber-900"
        >
          [5] EL JOC
        </button>
      </div>
    </div>
  )
}

function IntroScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">CEMENTIRI</h2>
        <p className="text-base leading-relaxed text-amber-900">
          "La carta va signada amb el nom d'un mort fa sis anys. Només qui consulta el registre de difunts podia saber aquell nom.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          Els picapedrers fan errors: alguns noms a les làpides no van escrits tal com es van enterrar.
        </p>
        <p className="text-base leading-relaxed text-amber-900 mt-4">
          Compareu la signatura errada de la carta amb les làpides fictícies."
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
        >
          [CONTINUAR]
        </button>
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function LapidesScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">LES 9 LÀPIDES</h2>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {LAPIDES.map(lapida => (
            <div
              key={lapida.id}
              className="bg-white border-2 border-amber-900 p-3 text-center text-xs"
            >
              <p className="font-bold text-amber-900">{lapida.name}</p>
              <p className="text-amber-700">{lapida.year}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <motion.button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          [ENTENENT]
        </motion.button>
        <motion.button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          [← MENÚ]
        </motion.button>
      </div>
    </div>
  )
}

function RegistreScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">REGISTRE PARROQUIAL</h2>

        <div className="space-y-2 text-xs text-amber-900">
          {REGISTRY.map(entry => (
            <div key={entry.year} className="flex justify-between p-2 bg-white border border-amber-200">
              <span className="font-bold">{entry.year}:</span>
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
        >
          [ENTENENT]
        </button>
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function CartaScreen({
  onNavigate,
}: {
  onNavigate: (screen: GameState['currentScreen']) => void
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">FRAGMENT DE LA CARTA</h2>

        <div className="bg-amber-100 border-2 border-amber-900 p-4 text-sm text-amber-900 mb-6">
          <p className="font-bold mb-3">15 de maig de 1705</p>
          <p className="italic mb-4">
            "Si el Pacte cau, els homes de Sentfoses hauran de fugir. Només l'Emissari pot salvar-nos..."
          </p>
          <p className="font-bold border-t-2 border-amber-900 pt-3">
            Signada: <span className="text-red-600">Corminas</span> (ERRADA)
          </p>
        </div>

        <p className="text-sm text-amber-900 mb-4">
          La signatura diu "Corminas", però qui és realment? Compara amb les làpides i el registre.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('joc')}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold"
        >
          [COMPARAR AMB LES LÀPIDES]
        </button>
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function JocScreen({
  selectedLapida,
  onLapisaSelect,
  onSubmit,
  onNavigate,
  attempts,
}: {
  selectedLapida: number | null
  onLapisaSelect: (id: number) => void
  onSubmit: () => void
  onNavigate: (screen: GameState['currentScreen']) => void
  attempts: number
}) {
  return (
    <div className="flex flex-col justify-between flex-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">DE QUINA LÀPIDA VA COPIAR EL NOM?</h2>

        <p className="text-sm text-amber-900 mb-6">
          Recorda: la signatura deia "Corminas".
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {LAPIDES.map(lapida => (
            <button
              key={lapida.id}
              onClick={() => onLapisaSelect(lapida.id)}
              className={`p-3 text-xs font-bold border-2 ${
                selectedLapida === lapida.id
                  ? 'bg-green-500 text-white border-green-700'
                  : 'bg-white text-amber-900 border-amber-900 hover:bg-amber-50'
              }`}
            >
              <p>{lapida.name}</p>
              <p className="text-xs">{lapida.year}</p>
            </button>
          ))}
        </div>

        {attempts > 0 && (
          <p className="text-red-600 text-sm mb-4">
            Intent {attempts}/3 - Làpida incorrecta
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={onSubmit}
          disabled={!selectedLapida}
          className="w-full p-3 bg-amber-900 text-amber-50 font-bold disabled:opacity-50"
        >
          [VALIDAR]
        </button>
        <button
          onClick={() => onNavigate('menu')}
          className="w-full p-3 text-left text-amber-900 font-bold"
        >
          [← MENÚ]
        </button>
      </div>
    </div>
  )
}

function ResultScreen({
  solved,
  selectedLapida,
}: {
  solved: boolean
  selectedLapida: number | null
}) {
  const selectedName = selectedLapida ? LAPIDES[selectedLapida - 1].name : '?'

  return (
    <div className="flex flex-col justify-center flex-1 gap-4">
      {solved ? (
        <>
          <h2 className="text-3xl font-bold text-center mb-4">✓ CORRECTE!</h2>
          <p className="text-center text-amber-900 font-bold mb-4">
            Has seleccionat: Làpida nº 1 (Corminas, 1698)
          </p>
          <p className="text-center text-amber-900 mb-4">
            Però el registre parroquial diu:
          </p>
          <p className="text-center text-amber-900 font-bold">
            Joseph Coromines (any 1698)
          </p>
          <p className="text-center text-amber-900 mt-4">
            L'Escolà SABIA el nom correcte, perquè ell va escriure el registre.
          </p>
          <p className="text-center text-amber-900 mt-4">
            Podia copiar aquesta errada!
          </p>
          <div className="bg-amber-100 border-2 border-amber-900 p-4 text-center">
            <p className="font-bold text-amber-900">XIFRA: PEDRA = 1</p>
          </div>
          <p className="text-center text-green-600 font-bold">+100 punts</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center mb-4">✗ INCORRECTE</h2>
          <p className="text-center text-amber-900">
            Has seleccionat: Làpida nº {selectedLapida} ({selectedName})
          </p>
          <p className="text-center text-amber-900 mt-4">
            Però la signatura de la carta diu "Corminas", no "{selectedName}".
          </p>
          <p className="text-center text-amber-900 mt-4">
            Compara la lletra un cop més.
          </p>
        </>
      )}
    </div>
  )
}
