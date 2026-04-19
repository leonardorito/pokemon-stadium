import type { LobbyStatusPlayer, PokemonState } from '../types/api';
import { PokemonSlotCard } from './PokemonSlotCard';

interface Props {
  player: LobbyStatusPlayer | null;
  team: PokemonState[] | null;
  accent: 'magenta' | 'cyan';
  isMe: boolean;
  side: 'left' | 'right';
  showHp?: boolean;
  isCurrentTurn?: boolean;
}

const accentMap = {
  magenta: { text: 'text-arc-magenta', border: 'border-arc-magenta' },
  cyan: { text: 'text-arc-cyan', border: 'border-arc-cyan' },
};

export function PlayerPanel({
  player,
  team,
  accent,
  isMe,
  side,
  showHp = false,
  isCurrentTurn = false,
}: Props) {
  const colors = accentMap[accent];
  const slots = Array.from({ length: 3 }, (_, i) => team?.[i] ?? null);
  const activeIdx = team ? team.findIndex((p) => !p.defeated) : -1;
  const ready = !!player?.isReady;

  return (
    <div
      className={`panel flex flex-col gap-4 p-5 ${side === 'right' ? 'lg:translate-y-4' : ''} animate-fade-rise`}
      style={{ animationDelay: `${side === 'left' ? 0.1 : 0.25}s` }}
    >
      <div
        className={`flex items-center justify-between border-b-2 pb-3 ${colors.border}`}
      >
        <div className="flex items-baseline gap-3">
          <span className={`font-display text-3xl tracking-wider uppercase ${colors.text}`}>
            {player?.nickname ?? 'WAITING…'}
          </span>
          {isMe && (
            <span className="hud-tag text-arc-yellow">YOU</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-label={ready ? 'Ready' : 'Not ready'}
            className={`h-3 w-3 rounded-full ${
              ready
                ? 'bg-arc-lime shadow-[0_0_12px_2px_rgba(184,255,60,0.8)] animate-pulse-ready'
                : 'bg-stadium-edge'
            }`}
          />
          <span className="stencil-label">{ready ? 'READY' : 'STANDBY'}</span>
        </div>
      </div>

      {isCurrentTurn && (
        <div className="animate-turn-flash border-2 border-arc-yellow px-3 py-1 text-center font-display text-xs tracking-[0.4em] text-arc-yellow uppercase">
          ACTIVE TURN
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot, i) => (
          <PokemonSlotCard
            key={i}
            pokemon={slot}
            index={i}
            accent={accent}
            active={showHp && i === activeIdx}
            showHp={showHp}
          />
        ))}
      </div>

      <div className="flex items-center justify-between font-mono text-[0.65rem] text-white/45 uppercase">
        <span>Team {team ? `${team.filter((p) => !p.defeated).length}/${team.length} alive` : 'unassigned'}</span>
        <span className={colors.text}>P{side === 'left' ? '1' : '2'}</span>
      </div>
    </div>
  );
}
