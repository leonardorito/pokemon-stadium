import { useEffect, useRef, useState } from 'react';
import type { PokemonState } from '../types/api';
import { spriteFor } from '../utils/sprites';

interface Props {
  pokemon: PokemonState | null;
  trainerName: string;
  isMine: boolean;
  isActiveTurn: boolean;
  isBeingHit?: boolean;
  aliveCount: number;
  totalCount: number;
}

export function ActivePokemonCard({
  pokemon,
  trainerName,
  isMine,
  isActiveTurn,
  isBeingHit = false,
  aliveCount,
  totalCount,
}: Props) {
  const view: 'front' | 'back' = isMine ? 'back' : 'front';

  const [src, setSrc] = useState<string>(() => (pokemon ? spriteFor(pokemon, view) : ''));
  const hitFlashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pokemon) setSrc(spriteFor(pokemon, view));
  }, [pokemon?.pokemonId, view, pokemon]);

  useEffect(() => {
    if (!isBeingHit || !pokemon) return;
    const el = hitFlashRef.current;
    if (!el) return;
    el.classList.remove('animate-sprite-shake');
    void el.offsetWidth;
    el.classList.add('animate-sprite-shake');
  }, [isBeingHit, pokemon?.currentHp, pokemon]);

  const accentText = isMine ? 'text-arc-cyan' : 'text-arc-magenta';
  const accentBorder = isMine ? 'border-arc-cyan' : 'border-arc-magenta';

  if (!pokemon) {
    return (
      <div
        className={`panel flex min-h-[320px] flex-col items-center justify-center gap-3 p-6 ${
          isActiveTurn ? 'ring-2 ring-arc-yellow ring-offset-4 ring-offset-stadium-base' : ''
        }`}
      >
        <span className={`stencil-label ${accentText}`}>{trainerName}</span>
        <div className="font-display text-5xl text-white/20">—</div>
        <span className="font-mono text-[0.6rem] tracking-widest text-white/30 uppercase">
          {isMine ? 'No active' : 'Waiting…'}
        </span>
      </div>
    );
  }

  const hpPct = Math.max(0, Math.min(100, (pokemon.currentHp / pokemon.hp) * 100));
  const hpColor = pokemon.defeated
    ? '#1f2547'
    : hpPct > 50
      ? '#B8FF3C'
      : hpPct > 25
        ? '#FFE600'
        : '#FF2E97';

  const isLow = !pokemon.defeated && hpPct <= 25;

  return (
    <div
      className={`panel relative flex flex-col gap-4 p-5 transition-all duration-300 ${
        isActiveTurn ? `ring-2 ${accentBorder} ring-offset-4 ring-offset-stadium-base` : ''
      } ${pokemon.defeated ? 'opacity-70' : ''}`}
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-stadium-edge pb-2">
        <span className={`font-display text-lg tracking-[0.18em] uppercase ${accentText}`}>
          {trainerName}
        </span>
        <span className="font-mono text-[0.6rem] tracking-widest text-white/55 uppercase">
          {aliveCount}/{totalCount} alive
        </span>
      </div>

      <div
        className="relative grid place-items-center bg-stadium-deep py-4"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, rgba(33,212,253,0.12), transparent 65%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)',
        }}
      >
        <div
          ref={hitFlashRef}
          className={pokemon.defeated ? 'animate-faint-fall' : 'animate-sprite-bob'}
        >
          <img
            key={`${pokemon.pokemonId}-${view}`}
            src={src || pokemon.sprite}
            alt={pokemon.name}
            onError={(e) => {
              if (e.currentTarget.src !== pokemon.sprite) {
                e.currentTarget.src = pokemon.sprite;
              }
            }}
            className="h-32 w-32 object-contain md:h-40 md:w-40"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </div>

        {isActiveTurn && !pokemon.defeated && (
          <div className="absolute right-2 top-2 hud-tag text-arc-yellow text-[0.55rem]">
            ACTIVE
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="font-pixel text-base tracking-[0.04em] text-white"
            style={{ lineHeight: 1.3 }}
          >
            {capitalize(pokemon.name)}
          </span>
          <span className="font-mono text-[0.65rem] tracking-widest text-white/55 uppercase">
            #{String(pokemon.pokemonId).padStart(3, '0')}
          </span>
        </div>

        <div className={`flex items-center gap-3 ${isLow ? 'animate-hp-shake' : ''}`}>
          <span className="stencil-label text-arc-yellow text-[0.6rem]">HP</span>
          <div className="relative h-4 flex-1 border-2 border-stadium-edge bg-stadium-deep">
            <div
              className="absolute inset-y-0 left-0 transition-[width,background-color] duration-700"
              style={{
                width: `${hpPct}%`,
                backgroundColor: hpColor,
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 1px, transparent 1px 3px)',
                mixBlendMode: 'overlay',
              }}
            />
          </div>
          <span className="font-mono text-xs text-white/85 tabular-nums">
            {pokemon.currentHp}/{pokemon.hp}
          </span>
        </div>
      </div>
    </div>
  );
}

function capitalize(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}
