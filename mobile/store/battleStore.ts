import { create } from "zustand";
import * as socketService from "@/services/socketService";
import { useLobbyStore } from "@/store/lobbyStore";
import type {
  BattleEndPayload,
  BattleStartPayload,
  BattleSyncPayload,
  PokemonDefeatedPayload,
  PokemonEnterPayload,
  PokemonState,
  TurnChangePayload,
  TurnResultPayload,
} from "@/types/api";

interface BattleState {
  battleId: string | null;
  firstTurn: string | null;
  currentTurn: string | null;
  teams: Record<string, PokemonState[]>;
  battleLog: string[];
  winnerId: string | null;
  winnerNickname: string | null;
  battleOver: boolean;
  attackPending: boolean;
  lastAttackerId: string | null;
  lastDefenderId: string | null;
  lastEvent: number;

  applyBattleStart: (payload: BattleStartPayload) => void;
  applyBattleSync: (payload: BattleSyncPayload) => void;
  applyTurnResult: (payload: TurnResultPayload) => void;
  applyPokemonDefeated: (payload: PokemonDefeatedPayload) => void;
  applyPokemonEnter: (payload: PokemonEnterPayload) => void;
  applyTurnChange: (payload: TurnChangePayload) => void;
  applyBattleEnd: (payload: BattleEndPayload) => void;
  reset: () => void;
  playAgain: () => void;

  attack: () => void;
}

const initial = {
  battleId: null as string | null,
  firstTurn: null as string | null,
  currentTurn: null as string | null,
  teams: {} as Record<string, PokemonState[]>,
  battleLog: [] as string[],
  winnerId: null as string | null,
  winnerNickname: null as string | null,
  battleOver: false,
  attackPending: false,
  lastAttackerId: null as string | null,
  lastDefenderId: null as string | null,
  lastEvent: 0,
};

const log = (
  state: BattleState,
  line: string,
): Pick<BattleState, "battleLog" | "lastEvent"> => ({
  battleLog: [...state.battleLog, line].slice(-60),
  lastEvent: Date.now(),
});

const activeOf = (team: PokemonState[] | undefined): PokemonState | null =>
  team?.find((p) => !p.defeated) ?? null;

export const useBattleStore = create<BattleState>((set, get) => ({
  ...initial,

  applyBattleStart: (payload) => {
    const teams: Record<string, PokemonState[]> = {};
    for (const p of payload.battleState.players) teams[p.playerId] = p.team;
    set((state) => ({
      battleId: payload.battleId,
      firstTurn: payload.firstTurn,
      currentTurn: payload.battleState.currentTurn,
      teams,
      winnerId: null,
      winnerNickname: null,
      battleOver: false,
      attackPending: false,
      lastAttackerId: null,
      lastDefenderId: null,
      ...log(state, `Battle starts. ${nicknameOf(payload.firstTurn)} moves first.`),
    }));
  },

  applyBattleSync: (payload) => {
    const teams: Record<string, PokemonState[]> = {};
    for (const p of payload.players) teams[p.playerId] = p.team;
    set({
      battleId: payload.battleId,
      currentTurn: payload.currentTurn,
      teams,
      winnerId: null,
      winnerNickname: null,
      battleOver: false,
      attackPending: false,
      lastAttackerId: null,
      lastDefenderId: null,
    });
  },

  applyTurnResult: (payload) => {
    set((state) => {
      const attackerActive = activeOf(state.teams[payload.attackerId]);
      const defenderActive = activeOf(state.teams[payload.defenderId]);
      const attackerName = attackerActive?.name ?? "Pokémon";
      const defenderName = defenderActive?.name ?? "Pokémon";

      const teams = { ...state.teams };
      const defenderTeam = teams[payload.defenderId];
      if (defenderTeam) {
        const idx = defenderTeam.findIndex((p) => !p.defeated);
        if (idx >= 0) {
          const updated = [...defenderTeam];
          updated[idx] = { ...updated[idx]!, currentHp: payload.remainingHp };
          teams[payload.defenderId] = updated;
        }
      }

      return {
        teams,
        currentTurn: payload.currentTurn,
        attackPending: false,
        lastAttackerId: payload.attackerId,
        lastDefenderId: payload.defenderId,
        ...log(
          state,
          `${formatName(attackerName)} dealt ${payload.damage} damage — ${formatName(defenderName)} has ${payload.remainingHp} HP left`,
        ),
      };
    });
  },

  applyPokemonDefeated: (payload) => {
    set((state) => {
      const teams = { ...state.teams };
      const team = teams[payload.playerId];
      if (team) {
        teams[payload.playerId] = team.map((p) =>
          p.name === payload.pokemonName && !p.defeated
            ? { ...p, defeated: true, currentHp: 0 }
            : p,
        );
      }
      return {
        teams,
        ...log(state, `${formatName(payload.pokemonName)} fainted!`),
      };
    });
  },

  applyPokemonEnter: (payload) => {
    set((state) =>
      log(state, `${formatName(payload.pokemon.name)} enters the battle!`),
    );
  },

  applyTurnChange: (payload) => {
    set((state) => ({
      currentTurn: payload.currentTurn,
      ...log(state, `Turn → ${nicknameOf(payload.currentTurn)}`),
    }));
  },

  applyBattleEnd: (payload) => {
    set((state) => ({
      currentTurn: null,
      winnerId: payload.winner,
      winnerNickname: payload.winnerNickname,
      battleOver: true,
      attackPending: false,
      ...log(state, `Winner: ${payload.winnerNickname}`),
    }));
  },

  reset: () => set({ ...initial }),

  playAgain: () => {
    set({ ...initial });
    const lobby = useLobbyStore.getState();
    // Clear playerId too — without this the lobby's "are we joined?" gate
    // (`if (!myPlayerId)`) falls through to the post-join view with empty
    // data. Nickname is preserved so re-joining is one tap.
    lobby.setMyPlayerId(null);
    lobby.reset();
  },

  attack: () => {
    const id = useLobbyStore.getState().myPlayerId;
    if (!id) return;
    const state = get();
    if (state.currentTurn !== id) return;
    if (state.attackPending) return;
    set({ attackPending: true });
    socketService.emit("attack", { playerId: id });
  },
}));

function nicknameOf(playerId: string | null): string {
  if (!playerId) return "Stadium";
  const player = useLobbyStore.getState().players.find((p) => p.id === playerId);
  return player?.nickname ?? "Trainer";
}

function formatName(name: string): string {
  if (!name) return "Pokémon";
  return name.charAt(0).toUpperCase() + name.slice(1);
}
