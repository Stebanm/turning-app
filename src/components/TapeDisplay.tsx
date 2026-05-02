import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { MoveDown } from 'lucide-react';


import type { TapeCell } from '@/types/turing'

interface TapeDisplayProps {
    cells: TapeCell[]
    headIndex: number
    offset: number
}

function cellClass(cell: TapeCell, isHead: boolean): string {
    if (isHead)
        return 'bg-primary-100 border-primary-500 border-2 text-primary-700 font-bold'
    if (cell.sec === 'input' && cell.sym === cell.orig)
        return 'bg-info-100 border-info-200 text-info-500 font-semibold text-base'
    if (cell.sym === 'X')
        return 'bg-gray-100 border-gray-200 text-gray-400 text-xs'
    if (cell.sec === 'sep')
        return 'bg-gray-200 border-gray-300 border-dashed text-gray-500 font-bold'
    if (cell.sec === 'output' && cell.sym !== 'B')
        return 'bg-success-100 border-success-200 text-success-500 font-bold text-base'
    return 'bg-white border-gray-200 text-gray-300'
}

function displaySym(sym: string): string {
    return sym === 'B' ? '·' : sym === 'X' ? '×' : sym
}

const LEGEND = [
    { dot: 'bg-info-500', text: 'text-info-500', label: 'Entrada' },
    { dot: 'bg-primary-500', text: 'text-primary-500', label: 'Cabezal' },
    { dot: 'bg-success-500', text: 'text-success-500', label: 'Morse' },
    { dot: 'bg-gray-400', text: 'text-gray-400', label: 'Procesado' },
]

export default function TapeDisplay({ cells, headIndex, offset }: TapeDisplayProps) {
    const headRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        headRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, [headIndex])

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 font-sans">
                    Cinta de Memoria
                </span>
                <span className="text-xs text-gray-400 font-mono">
                    ventana: {cells.length} celdas · cabezal: {headIndex}
                </span>
            </div>

            <div className="bg-gray-100 rounded-xl px-4 py-4 overflow-x-auto border border-gray-200">
                <div className="flex gap-1.5 w-max pb-6 pt-7">
                    {cells.map((cell, vi) => {
                        const absIdx = offset + vi
                        const isHead = absIdx === headIndex

                        return (
                            <div key={cell.id} ref={isHead ? headRef : null} className="relative flex flex-col items-center">

                                {/* Flecha cabezal */}
                                <AnimatePresence>
                                    {isHead && (
                                        <motion.div
                                            key="arrow"
                                            className="absolute -top-6 left-1/2 text-primary-500 font-bold text-base pointer-events-none select-none"
                                            style={{ translateX: '-50%' }}
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: [0, -5, 0] }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                y: { repeat: Infinity, duration: 0.85, ease: 'easeInOut' },
                                                opacity: { duration: 0.15 },
                                            }}
                                        >
                                            <MoveDown className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Celda */}
                                <motion.div
                                    layout
                                    layoutId={cell.id}
                                    className={[
                                        'w-11 h-12 rounded-lg border flex items-center justify-center',
                                        'font-mono select-none transition-colors',
                                        cellClass(cell, isHead),
                                        cell.written && !isHead ? 'animate-cellIn' : '',
                                    ].join(' ')}
                                    initial={{ opacity: 0, scale: 0.75 }}
                                    animate={{ opacity: 1, scale: isHead ? 1.1 : 1 }}
                                    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                                >
                                    {displaySym(cell.sym)}
                                </motion.div>

                                {/* Índice */}
                                {cell.sec !== 'blank' && (
                                    <div className="mt-1 text-[9px] text-gray-300 font-mono">{absIdx}</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Leyenda */}
            <div className="flex gap-4 mt-2 px-1 flex-wrap">
                {LEGEND.map(({ dot, text, label }) => (
                    <span key={label} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className={`text-[11px] font-sans font-medium ${text}`}>{label}</span>
                    </span>
                ))}
            </div>
        </div>
    )
}