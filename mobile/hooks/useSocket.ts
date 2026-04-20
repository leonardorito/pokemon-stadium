import { useEffect } from "react";
import { useBackendUrl } from "@/hooks/useBackendUrl";
import * as socketService from "@/services/socketService";
import { useBattleStore } from "@/store/battleStore";
import { useLobbyStore } from "@/store/lobbyStore";
import type {
  BattleEndPayload,
  BattleStartPayload,
  BattleSyncPayload,
  ErrorPayload,
  JoinedPayload,
  LobbyStatusPayload,
  PokemonDefeatedPayload,
  PokemonEnterPayload,
  TurnChangePayload,
  TurnResultPayload,
} from "@/types/api";

export function useSocket(): void {
  const { url: backendUrl } = useBackendUrl();

  useEffect(() => {
    if (!backendUrl) return;

    try {
      socketService.connect(backendUrl);
    } catch {
      useLobbyStore
        .getState()
        .setError("Failed to connect — check the backend URL");
      return;
    }

    const onJoined = (p: JoinedPayload) =>
      useLobbyStore.getState().applyJoined(p);
    const onLobbyStatus = (p: LobbyStatusPayload) =>
      useLobbyStore.getState().applyLobbyStatus(p);
    const onBattleStart = (p: BattleStartPayload) =>
      useBattleStore.getState().applyBattleStart(p);
    const onBattleSync = (p: BattleSyncPayload) =>
      useBattleStore.getState().applyBattleSync(p);
    const onTurnResult = (p: TurnResultPayload) =>
      useBattleStore.getState().applyTurnResult(p);
    const onPokemonDefeated = (p: PokemonDefeatedPayload) =>
      useBattleStore.getState().applyPokemonDefeated(p);
    const onPokemonEnter = (p: PokemonEnterPayload) =>
      useBattleStore.getState().applyPokemonEnter(p);
    const onTurnChange = (p: TurnChangePayload) =>
      useBattleStore.getState().applyTurnChange(p);
    const onBattleEnd = (p: BattleEndPayload) =>
      useBattleStore.getState().applyBattleEnd(p);
    const onError = (p: ErrorPayload) =>
      useLobbyStore.getState().setError(p?.message ?? "Unknown error");

    socketService.on<JoinedPayload>("joined", onJoined);
    socketService.on<LobbyStatusPayload>("lobby_status", onLobbyStatus);
    socketService.on<BattleStartPayload>("battle_start", onBattleStart);
    socketService.on<BattleSyncPayload>("battle_sync", onBattleSync);
    socketService.on<TurnResultPayload>("turn_result", onTurnResult);
    socketService.on<PokemonDefeatedPayload>("pokemon_defeated", onPokemonDefeated);
    socketService.on<PokemonEnterPayload>("pokemon_enter", onPokemonEnter);
    socketService.on<TurnChangePayload>("turn_change", onTurnChange);
    socketService.on<BattleEndPayload>("battle_end", onBattleEnd);
    socketService.on<ErrorPayload>("error", onError);

    return () => {
      socketService.off("joined", onJoined as (...args: unknown[]) => void);
      socketService.off("lobby_status", onLobbyStatus as (...args: unknown[]) => void);
      socketService.off("battle_start", onBattleStart as (...args: unknown[]) => void);
      socketService.off("battle_sync", onBattleSync as (...args: unknown[]) => void);
      socketService.off("turn_result", onTurnResult as (...args: unknown[]) => void);
      socketService.off("pokemon_defeated", onPokemonDefeated as (...args: unknown[]) => void);
      socketService.off("pokemon_enter", onPokemonEnter as (...args: unknown[]) => void);
      socketService.off("turn_change", onTurnChange as (...args: unknown[]) => void);
      socketService.off("battle_end", onBattleEnd as (...args: unknown[]) => void);
      socketService.off("error", onError as (...args: unknown[]) => void);
    };
  }, [backendUrl]);
}
