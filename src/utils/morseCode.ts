import type { MorseMap } from '@/types/turing';

// ── ITU-R M.1677-1 Morse code dictionary ───────────────────────────────────

export const MORSE_MAP: MorseMap = {
  // Letters
  A: '.-',    B: '-...',  C: '-.-.',  D: '-..',   E: '.',
  F: '..-.',  G: '--.',   H: '....',  I: '..',    J: '.---',
  K: '-.-',   L: '.-..',  M: '--',    N: '-.',    O: '---',
  P: '.--.',  Q: '--.-',  R: '.-.',   S: '...',   T: '-',
  U: '..-',   V: '...-',  W: '.--',   X: '-..-',  Y: '-.--',
  Z: '--..',
  // Digits
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  // ITU-R M.1677-1 punctuation
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '!': '-.-.--',
  '/': '-..-.',
  '@': '.--.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '"': '.-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  // Spanish characters
  'Ñ': '--.--',
  'Á': '.--.-',
  'É': '..-..',
  'Ü': '..--',
  // Space becomes word separator
  ' ': '/',
}

export const UNSUPPORTED_NOTES: string[] = [
  'Sin distinción entre mayúsculas y minúsculas',
  'No soporta emojis ni símbolos matemáticos (∑ π √)',
  'No existe negrita, cursiva ni formato de texto',
  'Monedas especiales (€ £ ¥ ₿) no están estandarizadas',
  'Caracteres chinos, árabes, japoneses sin representación',
  'El silencio/pausa tiene 3 duraciones distintas',
]

export function isSupported(char: string): boolean {
  return Object.prototype.hasOwnProperty.call(MORSE_MAP, char.toUpperCase())
}

export function normalizeInput(text: string): string {
  return text.toUpperCase()
}
