import { motion, AnimatePresence } from 'framer-motion'

import { CircleCheckBig } from 'lucide-react';

import type { MachineStatus } from '@/types/turing'

interface StatePanelProps {
    currentState: string
    readingSymbol: string
    step: number
    description: string
    status: MachineStatus
}

interface CardProps {
    label: string
    value: string
    valueClass?: string
}

function FlipCard({ label, value, valueClass = 'text-gray-900' }: CardProps) {
    return (
        <motion.div
            layout
            className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm"
            transition={{ type: 'spring', stiffness: 200 }}
        >
            <div className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-1.5 font-sans">
                {label}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={value}
                    className={`font-mono text-sm font-bold min-h-[1.4em] ${valueClass}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.16 }}
                >
                    {value}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}

const STATUS_LABELS: Record<MachineStatus, string> = {
    idle: 'INACTIVO',
    ready: 'LISTO',
    running: 'EJECUTANDO',
    paused: 'PAUSADO',
    halt: 'COMPLETADO',
    reject: 'RECHAZADO',
}

// Solo clases con números — todas en safelist del config
const STATUS_BADGE: Record<MachineStatus, string> = {
    idle: 'bg-gray-100 text-gray-500 border border-gray-200',
    ready: 'bg-gray-100 text-gray-500 border border-gray-200',
    running: 'bg-primary-100 text-primary-700 border border-primary-200',
    paused: 'bg-info-100 text-info-700 border border-info-200',
    halt: 'bg-success-100 text-success-700 border border-success-200',
    reject: 'bg-danger-100 text-danger border border-danger-100',
}

const DESC_BOX: Record<MachineStatus, string> = {
    idle: 'bg-gray-100 border-l-gray-300 text-gray-500',
    ready: 'bg-gray-100 border-l-gray-300 text-gray-500',
    running: 'bg-primary-50 border-l-primary text-primary-700',
    paused: 'bg-info-50 border-l-info text-info-700',
    halt: 'bg-success-50 border-l-success text-success-700',
    reject: 'bg-danger-100 border-l-danger text-danger',
}

export default function StatePanel({
    currentState,
    readingSymbol,
    step,
    description,
    status,
}: StatePanelProps) {
    return (
        <div className="mb-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 font-sans">
                    Panel de Estado
                </span>

                <AnimatePresence mode="wait">
                    <motion.span
                        key={status}
                        className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold px-3 py-1 rounded-full tracking-wide ${STATUS_BADGE[status]}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.18 }}
                    >
                        {status === 'running' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulseDot inline-block" />
                        )}
                        {status === 'halt' && <CircleCheckBig className="w-3 h-3" />}
                        {STATUS_LABELS[status]}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <FlipCard label="Estado actual" value={currentState} valueClass="text-primary-700" />
                <FlipCard label="Símbolo leído" value={readingSymbol || '—'} valueClass="text-info-700" />
                <FlipCard label="Paso" value={String(step + 1)} valueClass="text-gray-700" />
                <FlipCard label="Pos. cabezal" value={String(step)} valueClass="text-success-700" />
            </div>

            {/* Descripción */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={description}
                    className={`border-l-[3px] rounded-lg px-4 py-3 font-mono text-xs min-h-[2.5rem] leading-relaxed ${DESC_BOX[status]}`}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {description}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}