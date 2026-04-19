import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as socketService from '../services/socketService';
import { useLobbyStore } from '../store/lobbyStore';
import { useBattleStore } from '../store/battleStore';

const RECONNECT_TIMEOUT_MS = 3000;

export function useReconnect(): { isRehydrating: boolean } {
  const navigate = useNavigate();
  const isRehydrating = useLobbyStore((s) => s.isRehydrating);
  const status = useLobbyStore((s) => s.status);
  const errorMessage = useLobbyStore((s) => s.errorMessage);
  const battleId = useBattleStore((s) => s.battleId);

  // react-router v7's `useNavigate()` returns a new reference whenever the location changes.
  // Closing over `navigate` directly would invalidate every useCallback/useEffect that lists
  // it as a dep, cascading into spurious init-effect re-runs during normal navigation. We
  // isolate navigate behind a ref so our callback identities stay stable across location changes.
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  });

  const isFirstConnect = useRef(true);
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const finishRehydrate = useCallback(() => {
    clearTimer();
    useLobbyStore.getState().setRehydrating(false);
  }, [clearTimer]);

  const handleExpired = useCallback(() => {
    sessionStorage.removeItem('playerId');
    sessionStorage.removeItem('nickname');
    const lobby = useLobbyStore.getState();
    lobby.setMyPlayerId(null);
    lobby.setMyNickname('');
    lobby.reset();
    useBattleStore.getState().reset();
    clearTimer();
    lobby.setRehydrating(false);
    navigateRef.current('/');
  }, [clearTimer]);

  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const pid = sessionStorage.getItem('playerId');
    const nick = sessionStorage.getItem('nickname');
    if (!url || !pid || !nick) return;
    useLobbyStore.getState().setRehydrating(true);
    try {
      socketService.connect(url);
    } catch {
      handleExpired();
      return;
    }
    socketService.emit('join_lobby', { nickname: nick, playerId: pid });
    timeoutRef.current = window.setTimeout(handleExpired, RECONNECT_TIMEOUT_MS);
    return () => clearTimer();
  }, [clearTimer, handleExpired]);

  useEffect(() => {
    const onConnect = () => {
      if (isFirstConnect.current) {
        isFirstConnect.current = false;
        return;
      }
      const lobby = useLobbyStore.getState();
      if (!lobby.myNickname || !lobby.myPlayerId) return;
      lobby.setRehydrating(true);
      socketService.emit('join_lobby', {
        nickname: lobby.myNickname,
        playerId: lobby.myPlayerId,
      });
      clearTimer();
      timeoutRef.current = window.setTimeout(handleExpired, RECONNECT_TIMEOUT_MS);
    };
    socketService.on('connect', onConnect);
    return () => socketService.off('connect', onConnect as (...args: unknown[]) => void);
  }, [clearTimer, handleExpired]);

  useEffect(() => {
    if (!isRehydrating || !status) return;
    if (status === 'waiting' || status === 'ready') {
      navigateRef.current('/lobby');
      finishRehydrate();
    } else if (status === 'battling') {
      const pid = useLobbyStore.getState().myPlayerId;
      if (!pid) {
        handleExpired();
        return;
      }
      socketService.emit('sync_battle', { playerId: pid });
    } else if (status === 'finished') {
      if (useBattleStore.getState().battleOver) {
        finishRehydrate();
      } else {
        handleExpired();
      }
    }
  }, [isRehydrating, status, finishRehydrate, handleExpired]);

  useEffect(() => {
    if (!isRehydrating || !battleId) return;
    navigateRef.current('/battle');
    finishRehydrate();
  }, [isRehydrating, battleId, finishRehydrate]);

  useEffect(() => {
    if (!isRehydrating || !errorMessage) return;
    if (errorMessage === 'Session expired') {
      handleExpired();
    }
  }, [isRehydrating, errorMessage, handleExpired]);

  return { isRehydrating };
}
