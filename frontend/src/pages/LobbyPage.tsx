import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectMe,
  selectMyTeam,
  selectOpponent,
  selectOpponentTeam,
  useLobbyStore,
} from '../store/lobbyStore';
import { useBattleStore } from '../store/battleStore';
import * as socketService from '../services/socketService';
import { PlayerPanel } from '../components/PlayerPanel';
import { StadiumButton } from '../components/StadiumButton';

export function LobbyPage() {
  const navigate = useNavigate();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const status = useLobbyStore((s) => s.status);
  const players = useLobbyStore((s) => s.players);
  const code = useLobbyStore((s) => s.code);
  const me = useLobbyStore(selectMe);
  const opponent = useLobbyStore(selectOpponent);
  const myTeam = useLobbyStore(selectMyTeam);
  const opponentTeam = useLobbyStore(selectOpponentTeam);
  const assignPokemon = useLobbyStore((s) => s.assignPokemon);
  const ready = useLobbyStore((s) => s.ready);
  const setMyPlayerId = useLobbyStore((s) => s.setMyPlayerId);
  const lobbyReset = useLobbyStore((s) => s.reset);
  const battleReset = useBattleStore((s) => s.reset);

  const onExit = () => {
    // Disconnect the socket so the backend's disconnect handler runs leaveLobby
    // (the server has no explicit leave event). The socket instance is preserved
    // — re-joining via socketService.connect() reattaches with listeners intact.
    socketService.disconnect();
    setMyPlayerId(null);
    lobbyReset();
    battleReset();
    navigate('/');
  };

  const [graceElapsed, setGraceElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGraceElapsed(true), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (graceElapsed && !myPlayerId) navigate('/join');
  }, [graceElapsed, myPlayerId, navigate]);

  useEffect(() => {
    if (status === 'battling') navigate('/battle');
  }, [status, navigate]);

  const myTeamAssigned = !!myTeam && myTeam.length > 0;
  const meReady = !!me?.isReady;

  const playerOnLeft = useMemo(() => players[0] ?? null, [players]);
  const playerOnRight = useMemo(() => players[1] ?? null, [players]);
  const teamFor = (id?: string | null) =>
    id === me?.id ? myTeam : id === opponent?.id ? opponentTeam : null;

  const leftIsMe = playerOnLeft?.id === myPlayerId;

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={onExit}
        className="font-display text-xs tracking-[0.24em] uppercase text-arc-magenta transition hover:text-arc-yellow"
      >
        ← Exit Lobby
      </button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl tracking-widest text-white uppercase md:text-6xl">
          Lobby <span className="text-arc-cyan">{code ?? '—'}</span>
        </h1>
        <div className="flex items-center gap-2 font-mono text-[0.65rem] tracking-widest uppercase">
          <span className="hud-tag text-arc-magenta">{players.length}/2 trainers</span>
          <span className="hud-tag text-arc-cyan">{status ?? '—'}</span>
        </div>
      </div>

      <div className="relative grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <PlayerPanel
          player={playerOnLeft}
          team={teamFor(playerOnLeft?.id)}
          accent="magenta"
          isMe={leftIsMe}
          side="left"
        />

        <div className="relative flex flex-col items-center justify-center">
          <div className="hidden h-full w-px bg-gradient-to-b from-arc-magenta via-arc-yellow to-arc-cyan lg:block" />
          <div className="absolute inset-0 hidden items-center justify-center lg:flex">
            <div className="grid h-24 w-24 place-items-center border-2 border-arc-yellow bg-stadium-base font-display text-2xl tracking-widest text-arc-yellow shadow-[6px_6px_0_0_#1f2547] rotate-3">
              VS
            </div>
          </div>
          <div className="lg:hidden">
            <div className="grid h-16 w-16 place-items-center border-2 border-arc-yellow bg-stadium-base font-display text-xl tracking-widest text-arc-yellow shadow-[4px_4px_0_0_#1f2547]">
              VS
            </div>
          </div>
        </div>

        <PlayerPanel
          player={playerOnRight}
          team={teamFor(playerOnRight?.id)}
          accent="cyan"
          isMe={!leftIsMe && playerOnRight?.id === myPlayerId}
          side="right"
        />
      </div>

      <div className="panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="stencil-label text-arc-yellow">▼ Your Move</div>
          <div className="mt-1 font-display text-2xl tracking-widest text-white uppercase">
            {!myTeamAssigned
              ? 'Roll a fresh team'
              : !meReady
                ? 'Lock it in. Hit ready.'
                : opponent?.isReady
                  ? 'Stand by — engaging arena…'
                  : 'Waiting on opponent.'}
          </div>
          <div className="mt-1 font-mono text-[0.7rem] tracking-widest text-white/45 uppercase">
            ▸ Re-rolling overwrites your current squad.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <StadiumButton
            variant="magenta"
            onClick={assignPokemon}
            disabled={meReady}
          >
            {myTeamAssigned ? 'Re-Roll Team ↻' : 'Roll Team ▸'}
          </StadiumButton>
          <StadiumButton
            variant="lime"
            onClick={ready}
            disabled={!myTeamAssigned || meReady}
            pulse={myTeamAssigned && !meReady}
          >
            {meReady ? 'Locked ✓' : 'Ready ▸'}
          </StadiumButton>
        </div>
      </div>

      <div className="grid gap-3 font-mono text-[0.65rem] tracking-[0.32em] text-white/45 uppercase sm:grid-cols-3">
        <div className="border border-stadium-edge bg-stadium-deep p-3">
          ▸ Each pokemon is unique per arena.
        </div>
        <div className="border border-stadium-edge bg-stadium-deep p-3">
          ▸ Speed of lead pokemon decides first turn.
        </div>
        <div className="border border-stadium-edge bg-stadium-deep p-3">
          ▸ All damage = max(1, ATK − DEF).
        </div>
      </div>
    </div>
  );
}
