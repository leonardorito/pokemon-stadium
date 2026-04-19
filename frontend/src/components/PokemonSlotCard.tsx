import type { PokemonState } from '../types/api';

function capitalize(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

interface Props {
  pokemon: PokemonState | null;
  index: number;
  accent: 'magenta' | 'cyan';
  active?: boolean;
  showHp?: boolean;
}

const accentMap = {
  magenta: { ring: 'border-arc-magenta', text: 'text-arc-magenta' },
  cyan: { ring: 'border-arc-cyan', text: 'text-arc-cyan' },
};

export function PokemonSlotCard({ pokemon, index, accent, active = false, showHp = false }: Props) {
  const colors = accentMap[accent];
  const empty = !pokemon;
  const hpPct = pokemon ? Math.max(0, Math.round((pokemon.currentHp / pokemon.hp) * 100)) : 0;
  const hpColor = hpPct > 50 ? '#B8FF3C' : hpPct > 25 ? '#FFE600' : '#FF2E97';

  return (
    <div
      className={`panel relative flex flex-col p-3 ${active ? 'ring-2 ring-arc-yellow ring-offset-2 ring-offset-stadium-base' : ''} animate-fade-rise`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="flex items-center justify-between text-[0.55rem] tracking-[0.32em]">
        <span className="stencil-label">Slot {index + 1}</span>
        {pokemon?.defeated && (
          <span className="hud-tag text-arc-magenta">FAINTED</span>
        )}
      </div>

      <div
        className={`relative mt-2 grid h-24 place-items-center border-2 ${colors.ring} bg-stadium-deep`}
      >
        {empty ? (
          <svg
            viewBox="0 0 100 100"
            className="h-16 w-16 text-arc-cyan/30"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            aria-hidden
          >
            <circle cx="50" cy="50" r="44" />
            <path d="M 6 50 H 36" />
            <path d="M 64 50 H 94" />
            <circle cx="50" cy="50" r="12" />
            <circle cx="50" cy="50" r="5" fill="currentColor" stroke="none" />
          </svg>
        ) : (
          <img
            src={pokemon!.sprite}
            alt={pokemon!.name}
            className={`h-20 w-20 object-contain transition ${pokemon!.defeated ? 'opacity-25 grayscale' : ''}`}
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 grid-noise opacity-50"
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {empty ? (
          <span className="font-display text-xs tracking-[0.18em] uppercase text-white/30">
            — ? —
          </span>
        ) : (
          <span
            className="font-pixel truncate text-[0.55rem] tracking-[0.04em] text-white"
            style={{ lineHeight: 1.5 }}
          >
            {capitalize(pokemon!.name)}
          </span>
        )}
        {pokemon && (
          <span className="font-mono text-[0.6rem] text-white/50">
            #{String(pokemon.pokemonId).padStart(3, '0')}
          </span>
        )}
      </div>

      {showHp && pokemon && (
        <div className="mt-2 flex items-center gap-2">
          <span className="stencil-label text-[0.55rem]">HP</span>
          <div className="relative h-2 flex-1 border border-stadium-edge bg-stadium-deep">
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-500"
              style={{ width: `${hpPct}%`, backgroundColor: hpColor }}
            />
          </div>
          <span className="font-mono text-[0.6rem] text-white/70">
            {pokemon.currentHp}/{pokemon.hp}
          </span>
        </div>
      )}
    </div>
  );
}
