import type { PokemonState } from '../types/api';

interface Props {
  bench: PokemonState[];
  isMine: boolean;
  emptySlots?: number;
}

export function BenchRow({ bench, isMine, emptySlots = 0 }: Props) {
  const accentText = isMine ? 'text-arc-cyan' : 'text-arc-magenta';
  const filler = Array.from({ length: emptySlots }, (_, i) => i);

  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`stencil-label text-[0.55rem] ${accentText}`}>BENCH</span>
      <div className={`flex flex-1 items-center gap-2 ${isMine ? 'justify-start' : 'justify-end'}`}>
        {bench.length === 0 && filler.length === 0 && (
          <span className="font-mono text-[0.55rem] tracking-widest text-white/30 uppercase">
            empty
          </span>
        )}
        {bench.map((p, i) => (
          <BenchSlot key={`${p.pokemonId}-${i}`} pokemon={p} />
        ))}
        {filler.map((i) => (
          <div
            key={`empty-${i}`}
            className="grid h-14 w-14 place-items-center border border-dashed border-stadium-edge bg-stadium-deep"
          >
            <span className="font-display text-lg text-white/20">?</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenchSlot({ pokemon }: { pokemon: PokemonState }) {
  return (
    <div
      className={`relative grid h-14 w-14 place-items-center border-2 border-stadium-edge bg-stadium-deep transition ${
        pokemon.defeated ? 'opacity-40' : ''
      }`}
      title={`${pokemon.name} ${pokemon.currentHp}/${pokemon.hp}`}
    >
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        className={`h-12 w-12 object-contain ${pokemon.defeated ? 'grayscale' : ''}`}
        style={{ imageRendering: 'pixelated' }}
        draggable={false}
      />
      {pokemon.defeated && (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-display text-arc-magenta text-2xl"
        >
          ✕
        </span>
      )}
    </div>
  );
}
