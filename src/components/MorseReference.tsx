import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { MORSE_MAP, UNSUPPORTED_NOTES } from '@/utils/morseCode'


type RefCategory = 'letters' | 'numbers' | 'signs'

const CATEGORY_LABELS: Record<RefCategory, string> = {
    letters: 'Letras A–Z',
    numbers: 'Dígitos 0–9',
    signs: 'Signos',
}

const CATEGORY_CHARS: Record<RefCategory, string[]> = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    numbers: '0123456789'.split(''),
    signs: ['.', ',', '?', '!', '/', '@', '=', '+', '-', '"', '(', ')'],
}

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.012 } },
}

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
}

export default function MorseReference() {
    const [active, setActive] = useState<RefCategory>('letters')

    const chars = CATEGORY_CHARS[active].filter(c =>
        Object.prototype.hasOwnProperty.call(MORSE_MAP, c)
    )

    return (
        <div>
            {/* Sub-tabs */}
            <div className="flex gap-1.5 mb-5 flex-wrap">
                {(Object.keys(CATEGORY_LABELS) as RefCategory[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActive(cat)}
                        className={[
                            'text-xs px-4 py-2 rounded-lg border font-semibold font-sans transition-all',
                            active === cat
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                        ].join(' ')}
                    >
                        {CATEGORY_LABELS[cat]}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    className="grid gap-2"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))' }}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                >
                    {chars.map(char => (
                        <motion.div
                            key={char}
                            variants={itemVariants}
                            whileHover={{ scale: 1.06 }}
                            className="bg-white border border-gray-200 rounded-lg p-3 text-center cursor-default hover:border-primary-200 hover:bg-primary-50 transition-colors"
                        >
                            <div className="font-display text-xl font-bold text-gray-900 leading-none">
                                {char}
                            </div>
                            <div className="font-mono text-xs text-primary-500 font-semibold mt-2 tracking-wider">
                                {MORSE_MAP[char]}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* Limitaciones */}
            <div className="mt-5 bg-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-3 font-sans">
                    Limitaciones estándar
                </div>
                {UNSUPPORTED_NOTES.map((note, i) => (
                    <div
                        key={i}
                        className="text-xs text-gray-500 font-medium py-1.5 pl-3 border-l-2 border-gray-300 mb-1 last:mb-0"
                    >
                        {note}
                    </div>
                ))}
            </div>
        </div>
    )
}