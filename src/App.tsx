import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Snapshot, MachineStatus } from '@/types/turing'
import { computeAllSteps, getVisibleWindow, extractMorseOutput } from '@/utils/turingEngine'
import { normalizeInput, isSupported } from '@/utils/morseCode'
import TapeDisplay from '@/components/TapeDisplay'
import StatePanel from '@/components/StatePanel'
import TransitionTable from '@/components/TransitionTable'
import GenericButton from './components/GenericButton'
import MorseReference from './components/MorseReference'

type ActiveTab = 'sim' | 'table' | 'ref'

const SPEED = 350
const EXAMPLES = ['HOLA', 'SOS', 'DIEGO', 'MORSE 2025', 'HELLO WORLD']

const prefersReduced =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export default function App() {
  const [inputText, setInputText] = useState<string>('DIEGO')
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [playing, setPlaying] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('sim')
  const [error, setError] = useState<string>('')
  const [compiled, setCompiled] = useState<boolean>(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPlay = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setPlaying(false)
  }, [])

  const startPlay = useCallback((snaps: Snapshot[]) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPlaying(true)
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= snaps.length - 1) { stopPlay(); return prev }
        return prev + 1
      })
    }, SPEED)
  }, [stopPlay])

  useEffect(() => () => stopPlay(), [stopPlay])

  const compile = useCallback((text?: string) => {
    stopPlay()
    const raw = (text ?? inputText).trim()
    if (!raw) { setError('Ingresa al menos un carácter.'); setCompiled(false); return }
    const norm = normalizeInput(raw)
    const chars = norm.split('')
    const bad = [...new Set(chars.filter(c => !isSupported(c)))]
    if (bad.length > 0) {
      setError(`Caracteres no soportados: ${bad.join('  ')}`)
      setCompiled(false)
      return
    }
    setError('')
    const snaps = computeAllSteps(chars)
    setSnapshots(snaps)
    setCurrentStep(0)
    setCompiled(true)
    setActiveTab('sim')
    setTimeout(() => startPlay(snaps), 200)
  }, [inputText, stopPlay, startPlay])

  const handlePlayPause = useCallback(() => {
    if (playing) {
      stopPlay()
    } else {
      const step = currentStep >= snapshots.length - 1 ? 0 : currentStep
      setCurrentStep(step)
      startPlay(snapshots)
    }
  }, [playing, currentStep, snapshots, stopPlay, startPlay])

  const snap = snapshots[currentStep] ?? null

  const status: MachineStatus = !compiled
    ? 'idle'
    : snap?.state === 'halt' ? 'halt'
      : snap?.state === 'reject' ? 'reject'
        : playing ? 'running'
          : currentStep === 0 ? 'ready'
            : 'paused'

  const { cells: visibleCells, offset } = snap
    ? getVisibleWindow(snap.tape, snap.head)
    : { cells: [], offset: 0 }

  const morseOutput = snap ? extractMorseOutput(snap.tape) : ''

  const btnLabel = !compiled
    ? '▶ Compilar'
    : playing
      ? '⏸ Pausar'
      : (status === 'halt' || status === 'reject')
        ? '↺ Reiniciar'
        : '▶ Reanudar'

  const handleBtn = () => {
    if (!compiled) compile()
    else if (status === 'halt' || status === 'reject') compile(inputText)
    else handlePlayPause()
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-8 pb-16"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.5, ease: 'easeOut' }}
    >

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="text-center mb-8 pb-6 border-b border-gray-200">
        <div className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 font-mono text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide mb-4 border border-primary-200">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulseDot inline-block" />
          MÁQUINA DE TURING
        </div>
        <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight leading-tight">
          Traductor de Texto a{' '}
          <span className="text-primary-500">Código Morse</span>
        </h1>
      </header>

      {/* ── Input card ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={inputText}
              onChange={e => { setInputText(e.target.value); setCompiled(false); stopPlay() }}
              onKeyDown={e => e.key === 'Enter' && compile()}
              maxLength={20}
              spellCheck={false}
              placeholder="Escribe texto (A–Z, 0–9, signos ITU…)"
              className="w-full font-mono text-lg font-semibold bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 tracking-widest placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
            />
            {error && (
              <p className="mt-2 text-xs font-mono text-danger bg-danger-100 rounded-lg px-3 py-2 border-l-2 border-danger font-semibold">
                {error}
              </p>
            )}
          </div>

          <GenericButton
            label={btnLabel}
            size="large"
            onClick={handleBtn}
          />
        </div>

        {!compiled && (
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="text-xs text-gray-400 font-sans self-center mr-1">Ejemplos:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => compile(ex)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 font-mono font-medium transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Contenido compilado ──────────────────────────────────────────── */}
      {compiled && snap && (
        <>
          {/* Tabs */}
          <div className="flex items-center mb-5">
            <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              {(['sim', 'table', 'ref'] as ActiveTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'text-xs font-semibold px-4 py-2 rounded-lg transition-all font-sans',
                    activeTab === tab
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {{ sim: 'Simulación', table: 'Transiciones', ref: 'Referencia Morse' }[tab]}
                </button>
              ))}
            </div>
          </div>

          <div key={activeTab}>
            {activeTab === 'sim' && (
              <>
                <StatePanel
                  currentState={snap.state}
                  readingSymbol={snap.tape[snap.head]?.sym ?? ''}
                  step={currentStep}
                  description={snap.desc}
                  status={status}
                />

                <TapeDisplay cells={visibleCells} headIndex={snap.head} offset={offset} />

                {morseOutput && (
                  <div className="bg-success-100 border border-success-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-success-700 whitespace-nowrap font-sans">
                      Morse
                    </span>
                    <span className="font-mono text-sm font-semibold text-success-700 leading-relaxed break-all">
                      {morseOutput}
                    </span>
                  </div>
                )}
              </>
            )}

            {activeTab === 'table' && (
              <TransitionTable snapshots={snapshots} currentStep={currentStep} />
            )}

            {activeTab === 'ref' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <MorseReference />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Estado vacío inicial ─────────────────────────────────────────── */}
      {!compiled && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm mt-2">
          <div className="text-3xl mb-3">⚙</div>
          <h2 className="font-display text-xl text-gray-900 mb-2">Listo para simular</h2>
          <p className="text-gray-500 text-sm">
            Ingresa texto y presiona{' '}
            <span className="text-primary-500 font-bold">Compilar</span>{' '}
            para iniciar la traducción.
          </p>
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => compile(ex)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 font-sans transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}