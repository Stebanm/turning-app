import type { ReactNode, ButtonHTMLAttributes } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────

type ButtonSize = 'small' | 'normal' | 'large'
type ButtonVariant = 'filled' | 'outline' | 'ghost' | 'soft'
type ButtonColor =
    | 'primary-500' | 'primary-700'
    | 'success-500' | 'success-700'
    | 'info-500' | 'info-700'
    | 'danger-500'
    | 'gray-500' | 'gray-900'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    // Contenido
    label?: string      // texto del botón
    iconLeft?: ReactNode   // icono a la izquierda del texto
    iconRight?: ReactNode   // icono a la derecha del texto

    // Modo de contenido
    iconOnly?: boolean     // solo icono, sin texto — default: false
    textOnly?: boolean     // solo texto, sin iconos — default: false
    // Si ninguno es true → texto + icono (default)

    // Apariencia
    size?: ButtonSize  // default: 'normal'
    color?: ButtonColor // default: 'primary-500'
    variant?: ButtonVariant // default: 'filled'

    // Estado
    loading?: boolean
    fullWidth?: boolean
}

// ── Style maps ────────────────────────────────────────────────────────────

const SIZE: Record<ButtonSize, { btn: string; icon: string; text: string }> = {
    small: {
        btn: 'h-8 px-3 gap-1.5 rounded-lg text-xs',
        icon: 'w-3.5 h-3.5',
        text: 'text-xs font-semibold',
    },
    normal: {
        btn: 'h-10 px-4 gap-2 rounded-xl text-sm',
        icon: 'w-4 h-4',
        text: 'text-sm font-semibold',
    },
    large: {
        btn: 'h-12 px-6 gap-2.5 rounded-xl text-base',
        icon: 'w-5 h-5',
        text: 'text-base font-semibold',
    },
}

// iconOnly ajusta el padding para que sea cuadrado
const SIZE_ICON_ONLY: Record<ButtonSize, string> = {
    small: 'h-8 w-8 rounded-lg',
    normal: 'h-10 w-10 rounded-xl',
    large: 'h-12 w-12 rounded-xl',
}

// Color × Variant → clases de Tailwind
// Variantes: filled, outline, ghost, soft
type ColorVariantMap = Record<ButtonColor, Record<ButtonVariant, string>>

const COLOR_VARIANT: ColorVariantMap = {
    'primary-500': {
        filled: 'bg-primary-500 text-white hover:bg-primary-700 border border-transparent',
        outline: 'bg-transparent text-primary-500 border border-primary-500 hover:bg-primary-50',
        ghost: 'bg-transparent text-primary-500 border border-transparent hover:bg-primary-50',
        soft: 'bg-primary-100 text-primary-700 border border-transparent hover:bg-primary-200',
    },
    'primary-700': {
        filled: 'bg-primary-700 text-white hover:bg-primary-500 border border-transparent',
        outline: 'bg-transparent text-primary-700 border border-primary-700 hover:bg-primary-50',
        ghost: 'bg-transparent text-primary-700 border border-transparent hover:bg-primary-50',
        soft: 'bg-primary-100 text-primary-700 border border-transparent hover:bg-primary-200',
    },
    'success-500': {
        filled: 'bg-success-500 text-white hover:bg-success-700 border border-transparent',
        outline: 'bg-transparent text-success-500 border border-success-500 hover:bg-success-50',
        ghost: 'bg-transparent text-success-500 border border-transparent hover:bg-success-50',
        soft: 'bg-success-100 text-success-700 border border-transparent hover:bg-success-200',
    },
    'success-700': {
        filled: 'bg-success-700 text-white hover:bg-success-500 border border-transparent',
        outline: 'bg-transparent text-success-700 border border-success-700 hover:bg-success-50',
        ghost: 'bg-transparent text-success-700 border border-transparent hover:bg-success-50',
        soft: 'bg-success-100 text-success-700 border border-transparent hover:bg-success-200',
    },
    'info-500': {
        filled: 'bg-info-500 text-white hover:bg-info-700 border border-transparent',
        outline: 'bg-transparent text-info-500 border border-info-500 hover:bg-info-50',
        ghost: 'bg-transparent text-info-500 border border-transparent hover:bg-info-50',
        soft: 'bg-info-100 text-info-700 border border-transparent hover:bg-info-200',
    },
    'info-700': {
        filled: 'bg-info-700 text-white hover:bg-info-500 border border-transparent',
        outline: 'bg-transparent text-info-700 border border-info-700 hover:bg-info-50',
        ghost: 'bg-transparent text-info-700 border border-transparent hover:bg-info-50',
        soft: 'bg-info-100 text-info-700 border border-transparent hover:bg-info-200',
    },
    'danger-500': {
        filled: 'bg-danger-500 text-white hover:bg-danger border border-transparent',
        outline: 'bg-transparent text-danger-500 border border-danger-500 hover:bg-danger-100',
        ghost: 'bg-transparent text-danger-500 border border-transparent hover:bg-danger-100',
        soft: 'bg-danger-100 text-danger border border-transparent hover:bg-danger-100',
    },
    'gray-500': {
        filled: 'bg-gray-500 text-white hover:bg-gray-700 border border-transparent',
        outline: 'bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-100',
        ghost: 'bg-transparent text-gray-500 border border-transparent hover:bg-gray-100',
        soft: 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200',
    },
    'gray-900': {
        filled: 'bg-gray-900 text-white hover:bg-gray-700 border border-transparent',
        outline: 'bg-transparent text-gray-900 border border-gray-900 hover:bg-gray-100',
        ghost: 'bg-transparent text-gray-900 border border-transparent hover:bg-gray-100',
        soft: 'bg-gray-100 text-gray-900 border border-transparent hover:bg-gray-200',
    },
}

// ── Spinner ───────────────────────────────────────────────────────────────
function Spinner({ className }: { className?: string }) {
    return (
        <svg
            className={`animate-spin ${className ?? 'w-4 h-4'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    )
}

// ── Button ────────────────────────────────────────────────────────────────
export default function GenericButton({
    // Contenido
    label,
    iconLeft,
    iconRight,

    // Modo
    iconOnly = false,
    textOnly = false,

    // Apariencia
    size = 'normal',
    color = 'primary-500',
    variant = 'filled',

    // Estado
    loading = false,
    fullWidth = false,
    disabled,

    // HTML
    className = '',
    children,
    ...rest
}: ButtonProps) {
    const sizeStyle = SIZE[size]
    const colorStyle = COLOR_VARIANT[color][variant]

    // ── Clases base ──────────────────────────────────────────────────────────
    const base = [
        'inline-flex items-center justify-center font-sans',
        'transition-all duration-150 select-none cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        colorStyle,
        fullWidth ? 'w-full' : '',
        iconOnly ? SIZE_ICON_ONLY[size] : sizeStyle.btn,
        className,
    ].filter(Boolean).join(' ')

    // ── Qué mostrar ───────────────────────────────────────────────────────────
    // Prioridad: loading > iconOnly > textOnly > default (texto + icono)
    const showLeftIcon = !iconOnly && !textOnly && !!iconLeft && !loading
    const showRightIcon = !iconOnly && !textOnly && !!iconRight && !loading
    const showLabel = !iconOnly && !!label

    return (
        <button
            className={base}
            disabled={disabled || loading}
            aria-label={iconOnly && label ? label : undefined}
            {...(rest as object)}
        >
            {/* Loading spinner — reemplaza todo el contenido */}
            {loading ? (
                <Spinner className={sizeStyle.icon} />
            ) : (
                <>
                    {/* Icono izquierdo */}
                    {showLeftIcon && (
                        <span className={`flex-shrink-0 ${sizeStyle.icon}`} aria-hidden="true">
                            {iconLeft}
                        </span>
                    )}

                    {/* Solo icono (sin texto) */}
                    {iconOnly && (iconLeft ?? iconRight) && (
                        <span className={`flex-shrink-0 ${sizeStyle.icon}`} aria-hidden="true">
                            {iconLeft ?? iconRight}
                        </span>
                    )}

                    {/* Texto */}
                    {showLabel && (
                        <span className={sizeStyle.text}>{label}</span>
                    )}

                    {/* children como alternativa a label */}
                    {!showLabel && !iconOnly && children && (
                        <span className={sizeStyle.text}>{children}</span>
                    )}

                    {/* Icono derecho */}
                    {showRightIcon && (
                        <span className={`flex-shrink-0 ${sizeStyle.icon}`} aria-hidden="true">
                            {iconRight}
                        </span>
                    )}
                </>
            )}
        </button>
    )
}