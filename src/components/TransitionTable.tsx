import { motion, AnimatePresence } from 'framer-motion'

import { MoveRight, MoveLeft } from 'lucide-react';

import type { Snapshot } from '@/types/turing'

interface TransitionTableProps {
    snapshots: Snapshot[]
    currentStep: number
    maxRows?: number
}

function isRelevantStep(snap: Snapshot): boolean {
    if (!snap.rule) return false
    const cs = snap.rule.currentState
    if (cs === 'q0' && snap.rule.writeSymbol === 'X') return true
    if (cs.startsWith('qFB_') && snap.rule.writeSymbol !== snap.rule.readSymbol) return true
    if (cs.startsWith('qWM_')) return true
    if (cs.startsWith('qWS_')) return true
    if (snap.state === 'halt' || snap.state === 'reject') return true
    return false
}

type RowType = 'read' | 'write' | 'sep' | 'final'

function getRowType(snap: Snapshot): RowType {
    const cs = snap.rule?.currentState ?? ''
    if (cs === 'q0') return 'read'
    if (cs.startsWith('qFB_') || cs.startsWith('qWM_')) return 'write'
    if (cs.startsWith('qWS_')) return 'sep'
    return 'final'
}

function buildLabels(snap: Snapshot) {
    const rule = snap.rule!
    const cs = rule.currentState

    if (cs === 'q0') return {
        stateCode: 'q0',
        stateDesc: 'Lectura de letra',
        read: rule.readSymbol, write: 'X', next: rule.nextState,
    }
    if (cs.startsWith('qFB_') || cs.startsWith('qWM_')) {
        const ch = cs.startsWith('qFB_') ? cs.slice(4) : cs.slice(4, cs.lastIndexOf('_'))
        const index = cs.startsWith('qFB_') ? 1 : parseInt(cs.slice(cs.lastIndexOf('_') + 1), 10)
        return {
            stateCode: cs.startsWith('qFB_') ? `qFB_${ch}` : `qWM_${ch}_${index}`,
            stateDesc: `Escritura Morse (${ch})`,
            read: 'blanco', write: rule.writeSymbol, next: rule.nextState,
        }
    }
    if (cs.startsWith('qWS_')) {
        const ch = cs.slice(4)
        return { stateCode: `qWS_${ch}`, stateDesc: `Separador de letra (${ch})`, read: 'blanco', write: '|', next: rule.nextState }
    }
    if (snap.state === 'halt') return { stateCode: 'halt', stateDesc: 'Traducción completada', read: '—', write: '—', next: 'halt' }
    if (snap.state === 'reject') return { stateCode: 'reject', stateDesc: 'Carácter no soportado', read: rule.readSymbol, write: '—', next: 'reject' }
    return { stateCode: cs, stateDesc: cs, read: rule.readSymbol, write: rule.writeSymbol, next: rule.nextState }
}

function moveLabel(m: string) { return m === 'R' ? <MoveRight className='w-4 h-4' /> : m === 'L' ? <MoveLeft className='w-4 h-4' /> : '—' }

// Solo clases numéricas — todas en safelist del config
const ROW_STYLES: Record<RowType, {
    rowBg: string; border: string
    codeBg: string; codeText: string
    descText: string; dot: string
}> = {
    read: {
        rowBg: 'bg-info-50 hover:bg-info-100',
        border: 'border-l-info',
        codeBg: 'bg-info-100', codeText: 'text-info-700',
        descText: 'text-info-500', dot: 'bg-info-500',
    },
    write: {
        rowBg: 'bg-success-50 hover:bg-success-100',
        border: 'border-l-success',
        codeBg: 'bg-success-100', codeText: 'text-success-700',
        descText: 'text-success-500', dot: 'bg-success-500',
    },
    sep: {
        rowBg: 'bg-gray-50 hover:bg-gray-100',
        border: 'border-l-gray-300',
        codeBg: 'bg-gray-100', codeText: 'text-gray-500',
        descText: 'text-gray-400', dot: 'bg-gray-300',
    },
    final: {
        rowBg: 'bg-success-50 hover:bg-success-100',
        border: 'border-l-success-700',
        codeBg: 'bg-success-100', codeText: 'text-success-700',
        descText: 'text-success-500', dot: 'bg-success-500',
    },
}

function WriteSymbol({ value }: { value: string }) {
    if (value === 'X') return (
        <span className="inline-flex items-center justify-center font-mono text-sm text-gray-400 w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg">×</span>
    )
    if (value === '|') return (
        <span className="inline-flex items-center justify-center font-mono text-base text-gray-500 w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg font-bold">|</span>
    )
    if (value === '—') return (
        <span className="inline-flex items-center justify-center font-mono text-sm text-gray-300 w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg">—</span>
    )
    return (
        <span className="inline-flex items-center justify-center font-mono text-xl font-black text-success-500 w-10 h-10 bg-success-100 border border-success-200 rounded-lg">
            {value}
        </span>
    )
}

function ReadSymbol({ value, type }: { value: string; type: RowType }) {
    const isLetter = type === 'read'
    const isBlank = value === 'blanco'
    return (
        <div className="inline-flex flex-col items-center gap-0.5">
            <span className={[
                'inline-flex items-center justify-center font-mono w-10 h-10 rounded-lg border',
                isLetter
                    ? 'text-lg font-bold text-info-700 bg-info-100 border-info-200'
                    : 'text-sm text-gray-400 bg-gray-50 border-gray-200',
            ].join(' ')}>
                {isBlank ? '—' : value}
            </span>
            {isBlank && (
                <span className="text-[9px] text-gray-400 font-sans tracking-wide">blanco</span>
            )}
        </div>
    )
}

export default function TransitionTable({ snapshots, currentStep, maxRows = 24 }: TransitionTableProps) {
    const relevant = snapshots.slice(0, currentStep + 1).filter(isRelevantStep).slice(-maxRows)

    if (relevant.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
                <p className="text-sm text-gray-400 font-sans">Inicia la simulación para ver las transiciones.</p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">

            {/* Leyenda */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-6 bg-gray-50">
                {([
                    ['bg-info-500', 'text-info-500', 'Lectura de letra'],
                    ['bg-success-500', 'text-success-500', 'Escritura Morse'],
                    ['bg-gray-300', 'text-gray-400', 'Separador de letra'],
                ] as [string, string, string][]).map(([dot, text, label]) => (
                    <span key={label} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className={`text-xs font-sans font-medium ${text}`}>{label}</span>
                    </span>
                ))}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {[['#', 'w-12'], ['Estado actual', 'w-60'], ['Lee', 'w-28'], ['Escribe', 'w-24'], ['Mov.', 'w-16'], ['Nuevo estado', '']].map(([label, cls]) => (
                                <th key={label} className={`px-4 py-3 text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-500 font-sans ${cls}`}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence initial={false}>
                            {relevant.map((snap, ri) => {
                                const rule = snap.rule!
                                const isLatest = ri === relevant.length - 1
                                const type = getRowType(snap)
                                const labels = buildLabels(snap)
                                const sty = ROW_STYLES[type]

                                return (
                                    <motion.tr
                                        key={snap.step}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className={[
                                            'border-l-[3px] transition-colors',
                                            sty.border,
                                            isLatest ? sty.rowBg.split(' ')[0] : sty.rowBg,
                                        ].join(' ')}
                                    >
                                        <td className="px-4 py-4 border-t border-gray-200">
                                            <span className="text-xs font-mono text-gray-300 tabular-nums">{ri + 1}</span>
                                        </td>
                                        <td className="px-4 py-4 border-t border-gray-200">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1.5 self-start text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md ${sty.codeBg} ${sty.codeText}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sty.dot}`} />
                                                    {labels.stateCode}
                                                </span>
                                                <span className={`text-[11px] font-sans font-medium pl-1 ${sty.descText}`}>
                                                    {labels.stateDesc}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-t border-gray-200">
                                            <ReadSymbol value={labels.read} type={type} />
                                        </td>
                                        <td className="px-4 py-4 border-t border-gray-200">
                                            <WriteSymbol value={labels.write} />
                                        </td>
                                        <td className="px-4 py-4 border-t border-gray-200">
                                            <span className={`font-mono text-lg font-bold ${rule.move === 'R' ? 'text-success-500'
                                                : rule.move === 'L' ? 'text-primary-500'
                                                    : 'text-gray-300'
                                                }`}>
                                                {moveLabel(rule.move)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-t border-gray-200">
                                            <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
                                                {labels.next}
                                            </span>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="text-[11px] text-gray-400 font-mono">{relevant.length} pasos relevantes</span>
                <span className="text-[11px] text-gray-400 font-mono">
                    {snapshots.slice(0, currentStep + 1).filter(s => s.rule).length} pasos totales
                </span>
            </div>
        </div>
    )
}