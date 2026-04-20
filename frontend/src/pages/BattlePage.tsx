import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectMe, selectOpponent, useLobbyStore } from '../store/lobbyStore';
import { useBattleStore } from '../store/battleStore';
import { ActivePokemonCard } from '../components/ActivePokemonCard';
import { BenchRow } from '../components/BenchRow';
import { StadiumButton } from '../components/StadiumButton';
import type { PokemonState } from '../types/api';

export function BattlePage() {
  const navigate = useNavigate();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const me = useLobbyStore(selectMe);
  const opponent = useLobbyStore(selectOpponent);

  const battleId = useBattleStore((s) => s.battleId);
  const teams = useBattleStore((s) => s.teams);
  const currentTurn = useBattleStore((s) => s.currentTurn);
  const battleLog = useBattleStore((s) => s.battleLog);
  const battleOver = useBattleStore((s) => s.battleOver);
  const attackPending = useBattleStore((s) => s.attackPending);
  const lastDefenderId = useBattleStore((s) => s.lastDefenderId);
  const lastEvent = useBattleStore((s) => s.lastEvent);
  const attack = useBattleStore((s) => s.attack);

  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLog.length]);

  useEffect(() => {
    if (!battleOver) return;
    const t = setTimeout(() => navigate('/result'), 1800);
    return () => clearTimeout(t);
  }, [battleOver, navigate]);

  const myTeam = useMemo(() => (myPlayerId ? (teams[myPlayerId] ?? []) : []), [teams, myPlayerId]);
  const opponentTeam = useMemo(
    () => (opponent?.id ? (teams[opponent.id] ?? []) : []),
    [teams, opponent?.id],
  );

  const myActive = activeOf(myTeam);
  const oppActive = activeOf(opponentTeam);
  const myBench = benchOf(myTeam, myActive);
  const oppBench = benchOf(opponentTeam, oppActive);
  const myAlive = myTeam.filter((p) => !p.defeated).length;
  const oppAlive = opponentTeam.filter((p) => !p.defeated).length;

  const isMyTurn = currentTurn === myPlayerId && !battleOver;
  const isOppTurn = !!opponent && currentTurn === opponent.id && !battleOver;

  const myBeingHit = lastDefenderId === myPlayerId;
  const oppBeingHit = !!opponent && lastDefenderId === opponent.id;

  const attackLabel = battleOver
    ? 'Match Over'
    : !isMyTurn
      ? 'Waiting for opponent…'
      : attackPending
        ? '...'
        : 'Attack ▸';
  const attackDisabled = battleOver || !isMyTurn || attackPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="stencil-label text-arc-magenta">▒ Live Match</div>
          <h1 className="mt-1 text-5xl uppercase md:text-6xl">
            <span className="text-white">Round </span>
            <span className="text-arc-yellow">
              {battleId ? `#${battleId.slice(-4).toUpperCase()}` : '— —'}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`hud-tag ${
              battleOver
                ? 'text-arc-lime'
                : isMyTurn
                  ? 'text-arc-yellow animate-pulse-ready'
                  : 'text-arc-magenta'
            }`}
          >
            {battleOver
              ? 'MATCH OVER'
              : isMyTurn
                ? 'YOUR MOVE'
                : `${opponent?.nickname ?? 'OPPONENT'} ATTACKING`}
          </span>
          <span className="hud-tag text-arc-cyan">
            TURN <span className="ml-1 font-mono text-white">{turnCount(battleLog)}</span>
          </span>
        </div>
      </div>

      <div className="relative grid items-start gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-4">
          <ActivePokemonCard
            pokemon={myActive}
            trainerName={me?.nickname ? `${me.nickname} (YOU)` : 'YOU'}
            isMine
            isActiveTurn={isMyTurn}
            isBeingHit={myBeingHit && lastEvent > 0}
            aliveCount={myAlive}
            totalCount={myTeam.length}
            actionSlot={
              myActive ? (
                <StadiumButton
                  variant="primary"
                  pulse={isMyTurn && !attackPending && !battleOver}
                  disabled={attackDisabled}
                  onClick={attack}
                >
                  {attackLabel}
                </StadiumButton>
              ) : undefined
            }
          />
          <div className="panel p-3">
            <BenchRow bench={myBench} isMine />
          </div>
        </div>

        <div className="hidden flex-col items-center justify-center gap-2 lg:flex">
          <div className="h-20 w-px bg-gradient-to-b from-arc-cyan via-arc-yellow to-arc-magenta" />
          <div className="grid h-16 w-16 place-items-center border-2 border-arc-yellow bg-stadium-base font-display text-2xl tracking-widest text-arc-yellow shadow-[6px_6px_0_0_#1f2547]">
            VS
          </div>
          <div className="h-20 w-px bg-gradient-to-b from-arc-magenta via-arc-yellow to-arc-cyan" />
        </div>

        <div className="flex flex-col gap-4">
          <ActivePokemonCard
            pokemon={oppActive}
            trainerName={opponent?.nickname ?? 'OPPONENT'}
            isMine={false}
            isActiveTurn={isOppTurn}
            isBeingHit={oppBeingHit && lastEvent > 0}
            aliveCount={oppAlive}
            totalCount={opponentTeam.length}
          />
          <div className="panel p-3">
            <BenchRow bench={oppBench} isMine={false} />
          </div>
        </div>
      </div>

      <div className="panel flex flex-col p-5">
        <div className="flex items-center justify-between border-b border-stadium-edge pb-3">
          <span className="stencil-label text-arc-yellow">▼ Battle Log</span>
          <span className="font-mono text-[0.6rem] text-white/45 uppercase">
            {battleLog.length} entries
          </span>
        </div>
        <div className="mt-3 max-h-72 flex-1 overflow-y-auto pr-2 font-mono text-sm text-white/85">
          {battleLog.length === 0 && (
            <div className="text-white/35">▸ Waiting for first hit…</div>
          )}
          {battleLog.map((line, i) => (
            <div
              key={`${i}-${line}`}
              className="border-b border-stadium-edge/40 py-1.5 last:border-b-0"
            >
              <span className="mr-2 text-arc-cyan">[{String(i + 1).padStart(2, '0')}]</span>
              {line}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}

function activeOf(team: PokemonState[]): PokemonState | null {
  return team.find((p) => !p.defeated) ?? null;
}

function benchOf(team: PokemonState[], active: PokemonState | null): PokemonState[] {
  if (!active) return team;
  return team.filter((p) => p !== active);
}

function turnCount(log: string[]): number {
  return Math.max(0, log.filter((l) => l.includes('dealt')).length);
}
