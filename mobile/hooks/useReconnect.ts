import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useBackendUrl } from "@/hooks/useBackendUrl";
import * as socketService from "@/services/socketService";
import { useBattleStore } from "@/store/battleStore";
import { useLobbyStore } from "@/store/lobbyStore";

const RECONNECT_TIMEOUT_MS = 3000;

export function useReconnect(): { isRehydrating: boolean } {
  const router = useRouter();
  const { url: backendUrl } = useBackendUrl();
  const isLobbyHydrated = useLobbyStore((s) => s.isHydrated);
  const isRehydrating = useLobbyStore((s) => s.isRehydrating);
  const status = useLobbyStore((s) => s.status);
  const errorMessage = useLobbyStore((s) => s.errorMessage);
  const battleId = useBattleStore((s) => s.battleId);

  // Isolate router behind a ref so callback identities stay stable across navigation
  // changes. Without this, listing `router` as a useCallback/useEffect dep cascades
  // into spurious re-runs that, on battle-end navigation, end up calling
  // router.replace('/') and killing the active session.
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  });

  const isFirstConnect = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const lobby = useLobbyStore.getState();
    lobby.setMyPlayerId(null);
    lobby.setMyNickname("");
    lobby.reset();
    useBattleStore.getState().reset();
    clearTimer();
    lobby.setRehydrating(false);
    routerRef.current.replace("/");
  }, [clearTimer]);

  useEffect(() => {
    if (!isLobbyHydrated || !backendUrl) return;
    const lobby = useLobbyStore.getState();
    const pid = lobby.myPlayerId;
    const nick = lobby.myNickname;
    if (!pid || !nick) return;
    lobby.setRehydrating(true);
    try {
      socketService.connect(backendUrl);
    } catch {
      handleExpired();
      return;
    }
    socketService.emit("join_lobby", { nickname: nick, playerId: pid });
    timeoutRef.current = setTimeout(handleExpired, RECONNECT_TIMEOUT_MS);
    return () => clearTimer();
  }, [isLobbyHydrated, backendUrl, clearTimer, handleExpired]);

  useEffect(() => {
    const onConnect = () => {
      if (isFirstConnect.current) {
        isFirstConnect.current = false;
        return;
      }
      const lobby = useLobbyStore.getState();
      if (!lobby.myNickname || !lobby.myPlayerId) return;
      lobby.setRehydrating(true);
      socketService.emit("join_lobby", {
        nickname: lobby.myNickname,
        playerId: lobby.myPlayerId,
      });
      clearTimer();
      timeoutRef.current = setTimeout(handleExpired, RECONNECT_TIMEOUT_MS);
    };
    socketService.on("connect", onConnect);
    return () =>
      socketService.off("connect", onConnect as (...args: unknown[]) => void);
  }, [clearTimer, handleExpired]);

  useEffect(() => {
    if (!isRehydrating || !status) return;
    if (status === "waiting" || status === "ready") {
      routerRef.current.replace("/lobby");
      finishRehydrate();
    } else if (status === "battling") {
      const pid = useLobbyStore.getState().myPlayerId;
      if (!pid) {
        handleExpired();
        return;
      }
      socketService.emit("sync_battle", { playerId: pid });
    } else if (status === "finished") {
      if (useBattleStore.getState().battleOver) {
        finishRehydrate();
      } else {
        handleExpired();
      }
    }
  }, [isRehydrating, status, finishRehydrate, handleExpired]);

  useEffect(() => {
    if (!isRehydrating || !battleId) return;
    routerRef.current.replace("/battle");
    finishRehydrate();
  }, [isRehydrating, battleId, finishRehydrate]);

  useEffect(() => {
    if (!isRehydrating || !errorMessage) return;
    if (errorMessage === "Session expired") {
      handleExpired();
    }
  }, [isRehydrating, errorMessage, handleExpired]);

  return { isRehydrating };
}
