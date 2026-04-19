import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useLobbyStore } from '../store/lobbyStore';
import { useBattleStore } from '../store/battleStore';
import * as audioService from '../services/audioService';
import type { AudioTrack } from '../services/audioService';

function trackForRoute(
  pathname: string,
  iWon: boolean,
): AudioTrack | null {
  if (pathname === '/' || pathname === '/join' || pathname === '/lobby') {
    return 'opening';
  }
  if (pathname === '/battle') return 'battle';
  if (pathname === '/result') return iWon ? 'victory' : null;
  return null;
}

export function useAudio(): void {
  const { pathname } = useLocation();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const winnerId = useBattleStore((s) => s.winnerId);

  const muted = useSyncExternalStore(
    audioService.subscribe,
    audioService.isMuted,
    audioService.isMuted,
  );

  const iWon = !!winnerId && winnerId === myPlayerId;
  const desired = trackForRoute(pathname, iWon);

  useEffect(() => {
    if (muted) return;
    if (desired) audioService.play(desired);
    else audioService.stop();
  }, [desired, muted]);
}
