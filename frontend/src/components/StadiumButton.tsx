import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'magenta' | 'cyan' | 'lime' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pulse?: boolean;
  children: ReactNode;
}

const palette: Record<Variant, { bg: string; text: string; shadow: string; border: string }> = {
  primary: {
    bg: 'bg-arc-yellow',
    text: 'text-stadium-base',
    shadow: '6px 6px 0 0 #1f2547',
    border: 'border-stadium-base',
  },
  magenta: {
    bg: 'bg-arc-magenta',
    text: 'text-white',
    shadow: '6px 6px 0 0 #1f2547',
    border: 'border-stadium-base',
  },
  cyan: {
    bg: 'bg-arc-cyan',
    text: 'text-stadium-base',
    shadow: '6px 6px 0 0 #1f2547',
    border: 'border-stadium-base',
  },
  lime: {
    bg: 'bg-arc-lime',
    text: 'text-stadium-base',
    shadow: '6px 6px 0 0 #1f2547',
    border: 'border-stadium-base',
  },
  ghost: {
    bg: 'bg-stadium-surface',
    text: 'text-white',
    shadow: '4px 4px 0 0 #1f2547',
    border: 'border-stadium-edge',
  },
};

export function StadiumButton({
  variant = 'primary',
  pulse = false,
  className = '',
  children,
  disabled,
  style,
  ...rest
}: Props) {
  const tones = palette[variant];
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center gap-2 border-2 px-5 py-3 font-display text-sm tracking-[0.22em] uppercase transition-all duration-150 ${tones.bg} ${tones.text} ${tones.border} ${
        disabled
          ? 'cursor-not-allowed opacity-40 grayscale'
          : 'hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-x-0 active:translate-y-0'
      } ${pulse ? 'animate-pulse-ready' : ''} ${className}`}
      style={{
        boxShadow: disabled ? 'none' : tones.shadow,
        ...style,
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)',
        }}
      />
    </button>
  );
}
