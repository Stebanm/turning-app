import type { TapeCell, TransitionRule, Snapshot, MoveDirection } from '@/types/turing'
import { MORSE_MAP, isSupported } from '@/utils/morseCode'


// ── Constants ───────────────────────────────────────────────────────────────
const BLANK: string = 'B'
const SEP: string = '#'
const MAX_STEPS = 5000
const TAPE_LEFT_PAD = 5
const TAPE_RIGHT_PAD = 50

// ── Tape construction ───────────────────────────────────────────────────────
export function buildTape(chars: string[]): TapeCell[] {
    const cells: TapeCell[] = []

    for (let i = 0; i < TAPE_LEFT_PAD; i++) {
        cells.push({ id: `L${i}`, sym: BLANK, sec: 'blank', orig: '', written: false })
    }

    chars.forEach((c, i) => {
        cells.push({ id: `I${i}`, sym: c, sec: 'input', orig: c, written: false })
    })

    cells.push({ id: 'SEP', sym: SEP, sec: 'sep', orig: SEP, written: false })

    for (let i = 0; i < TAPE_RIGHT_PAD; i++) {
        cells.push({ id: `O${i}`, sym: BLANK, sec: 'blank', orig: '', written: false })
    }

    return cells
}

function ensureTape(tape: TapeCell[], idx: number): TapeCell[] {
    while (idx >= tape.length) {
        tape.push({
            id: `X${tape.length}`,
            sym: BLANK,
            sec: 'blank',
            orig: '',
            written: false,
        })
    }
    return tape
}

// ── Visible window ──────────────────────────────────────────────────────────
export function getVisibleWindow(
    tape: TapeCell[],
    head: number,
    windowSize = 19,
): { cells: TapeCell[]; offset: number } {
    const half = Math.floor(windowSize / 2)
    let start = Math.max(0, head - half)
    let end = Math.min(tape.length - 1, start + windowSize - 1)
    start = Math.max(0, end - windowSize + 1)
    return { cells: tape.slice(start, end + 1), offset: start }
}

// ── Full simulation ─────────────────────────────────────────────────────────
export function computeAllSteps(inputChars: string[]): Snapshot[] {
    const snaps: Snapshot[] = []
    let tape = buildTape(inputChars)
    let head = TAPE_LEFT_PAD
    let state = 'q0'
    let steps = 0

    // Helper: clone tape + push snapshot
    const snap = (desc: string, rule: TransitionRule | null): void => {
        snaps.push({
            step: snaps.length,
            tape: tape.map(c => ({ ...c })),
            head,
            state,
            desc,
            rule,
        })
    }

    // Helper: make a rule object
    const mkRule = (
        cs: string, rs: string, ws: string,
        mv: MoveDirection, ns: string,
    ): TransitionRule => ({ currentState: cs, readSymbol: rs, writeSymbol: ws, move: mv, nextState: ns })

    snap('Máquina inicializada. Cabezal en posición inicial.', null)

    while (state !== 'halt' && state !== 'reject' && steps < MAX_STEPS) {
        steps++
        tape = ensureTape(tape, head)
        const sym = tape[head].sym

        // ── q0: scan left-to-right for next unprocessed input cell ──────────────
        if (state === 'q0') {
            // Find first input cell that still holds its original character
            const found = tape.findIndex(
                (c, i) =>
                    i >= TAPE_LEFT_PAD &&
                    c.sec === 'input' &&
                    c.sym === c.orig &&
                    c.sym !== 'X',
            )

            if (found === -1) {
                state = 'halt'
                snap('Toda la entrada fue procesada. ¡HALT!', null)
                break
            }

            head = found
            const ch = tape[head].sym

            if (!isSupported(ch)) {
                state = 'reject'
                snap(`Carácter '${ch}' no tiene representación Morse → REJECT`, null)
                break
            }

            const rule = mkRule('q0', ch, 'X', 'R', `qFS_${ch}`)
            tape[head] = { ...tape[head], sym: 'X', written: true }
            state = `qFS_${ch}`
            snap(`Leí '${ch}', lo marco como procesado (X). Avanzo buscando separador #.`, rule)
            head++
            continue
        }

        // ── qFS_{ch}: scan right until we find the separator # ──────────────────
        if (state.startsWith('qFS_')) {
            const ch = state.slice(4)

            if (sym === SEP) {
                const nextSt = `qFB_${ch}`
                const rule = mkRule(state, SEP, SEP, 'R', nextSt)
                state = nextSt
                snap(`Encontré separador #. Avanzo hacia zona de salida para '${ch}'.`, rule)
                head++
                continue
            }

            const rule = mkRule(state, sym, sym, 'R', state)
            snap(`Avanzo sobre '${sym}' buscando separador #.`, rule)
            head++
            continue
        }

        // ── qFB_{ch}: find first blank cell in the output zone ──────────────────
        if (state.startsWith('qFB_')) {
            const ch = state.slice(4)
            const morse = MORSE_MAP[ch]

            if (sym === BLANK) {
                // Start writing morse symbols
                const nextSt = morse.length > 1 ? `qWM_${ch}_1` : `qWS_${ch}`
                const rule = mkRule(state, BLANK, morse[0], 'R', nextSt)
                tape[head] = { ...tape[head], sym: morse[0], sec: 'output', written: true }
                state = nextSt
                snap(`Inicio escritura Morse de '${ch}': ${morse}. Escribo '${morse[0]}'.`, rule)
                head++
                continue
            }

            // Skip already-written cells (previous letter's morse + separators)
            const rule = mkRule(state, sym, sym, 'R', state)
            snap(`Saltando '${sym}' buscando espacio libre en salida.`, rule)
            head++
            continue
        }

        // ── qWM_{ch}_{i}: write the i-th morse symbol ───────────────────────────
        if (state.startsWith('qWM_')) {
            const rest = state.slice(4)
            const uIdx = rest.lastIndexOf('_')
            const ch = rest.slice(0, uIdx)
            const i = parseInt(rest.slice(uIdx + 1), 10)
            const morse = MORSE_MAP[ch]

            if (i < morse.length) {
                const isLast = i === morse.length - 1
                const nextSt = isLast ? `qWS_${ch}` : `qWM_${ch}_${i + 1}`
                const rule = mkRule(state, sym, morse[i], 'R', nextSt)
                tape[head] = { ...tape[head], sym: morse[i], sec: 'output', written: true }
                state = nextSt
                snap(
                    `Escribo símbolo Morse '${morse[i]}' (${i + 1}/${morse.length}) de '${ch}'.`,
                    rule,
                )
                head++
                continue
            }
        }

        // ── qWS_{ch}: write letter separator '|' then head back left ────────────
        if (state.startsWith('qWS_')) {
            const rule = mkRule(state, sym, '|', 'L', 'qGB')
            tape[head] = { ...tape[head], sym: '|', sec: 'output', written: true }
            state = 'qGB'
            snap(`Escribo separador de letra '|'. Regreso al inicio buscando #.`, rule)
            head--
            continue
        }

        // ── qGB: go back left until we find the separator # ─────────────────────
        if (state === 'qGB') {
            if (sym === SEP) {
                const rule = mkRule('qGB', SEP, SEP, 'L', 'q0')
                state = 'q0'
                snap(`Encontré separador #. Retorno a q0 para el siguiente carácter.`, rule)
                head--
                continue
            }

            const rule = mkRule('qGB', sym, sym, 'L', 'qGB')
            snap(`Retrocediendo sobre '${sym}'.`, rule)
            head--
            continue
        }

        // Fallback safety advance (should not be reached in normal operation)
        head++
    }

    // Ensure there is always a final halt snapshot
    const last = snaps[snaps.length - 1]
    if (last && last.state !== 'halt' && last.state !== 'reject') {
        snap('Traducción completada. HALT.', null)
    }

    return snaps
}

// ── Extract final morse output from a tape ─────────────────────────────────
export function extractMorseOutput(tape: TapeCell[]): string {
    const sepIdx = tape.findIndex(c => c.sym === SEP)
    if (sepIdx < 0) return ''
    return tape
        .slice(sepIdx + 1)
        .map(c => (c.sym === BLANK ? '' : c.sym))
        .join('')
        .replace(/\|+$/, '')
        .replace(/\|/g, ' ')
}


// Agrega esta función al final de turingEngine.ts
export function getFullOutputWindow(
    tape: TapeCell[],
): { cells: TapeCell[]; offset: number } {
    // Muestra desde el primer blanco izquierdo hasta el último símbolo escrito
    const firstNonBlank = tape.findIndex(c => c.sec !== 'blank')
    const lastWritten = tape.reduce((last, c, i) =>
        (c.written || c.sec === 'sep' || (c.sec === 'input')) ? i : last, 0
    )

    const start = Math.max(0, firstNonBlank - 1)
    const end = Math.min(tape.length - 1, lastWritten + 2)

    return { cells: tape.slice(start, end + 1), offset: start }
}
