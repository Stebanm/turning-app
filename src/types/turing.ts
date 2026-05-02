// ── Global types for the Turing Machine simulator ──────────────────────────

export type CellSection = 'blank' | 'input' | 'sep' | 'output'

export type MoveDirection = 'R' | 'L' | '—'

export type MachineStatus =
    | 'idle'
    | 'ready'
    | 'running'
    | 'paused'
    | 'halt'
    | 'reject'

export interface TapeCell {
    id: string
    sym: string
    sec: CellSection
    orig: string
    written: boolean
}

export interface TransitionRule {
    currentState: string
    readSymbol: string
    writeSymbol: string
    move: MoveDirection
    nextState: string
}

export interface Snapshot {
    step: number
    tape: TapeCell[]
    head: number
    state: string
    desc: string
    rule: TransitionRule | null
}

export interface MorseMap {
    [key: string]: string
}
