import { create } from 'zustand';
import * as socketService from '../services/socketService';
import type {
  JoinedPayload,
  LobbyStatus,
  LobbyStatusPayload,
  LobbyStatusPlayer,
  LobbyStatusTeam,
} from '../types/api';

interface LobbyState {
  myPlayerId: string | null;
  myNickname: string;

  lobbyId: string | null;
  code: string | null;
  status: LobbyStatus | null;
  players: LobbyStatusPlayer[];
  teams: LobbyStatusTeam[];
  currentTurn: string | null;

  errorMessage: string | null;
  isRehydrating: boolean;

  setMyPlayerId: (id: string | null) => void;
  setMyNickname: (n: string) => void;
  applyJoined: (payload: JoinedPayload) => void;
  applyLobbyStatus: (payload: LobbyStatusPayload) => void;
  setError: (msg: string | null) => void;
  clearError: () => void;
  setRehydrating: (value: boolean) => void;
  reset: () => void;

  joinLobby: (nickname: string, playerId?: string) => void;
  assignPokemon: () => void;
  ready: () => void;
}

const persistedPlayerId =
  typeof window !== 'undefined' ? sessionStorage.getItem('playerId') : null;
const persistedNickname =
  typeof window !== 'undefined' ? sessionStorage.getItem('nickname') ?? '' : '';

export const useLobbyStore = create<LobbyState>((set, get) => ({
  myPlayerId: persistedPlayerId,
  myNickname: persistedNickname,

  lobbyId: null,
  code: null,
  status: null,
  players: [],
  teams: [],
  currentTurn: null,

  errorMessage: null,
  isRehydrating: false,

  setMyPlayerId: (id) => {
    if (id) sessionStorage.setItem('playerId', id);
    else sessionStorage.removeItem('playerId');
    set({ myPlayerId: id });
  },

  setMyNickname: (n) => {
    sessionStorage.setItem('nickname', n);
    set({ myNickname: n });
  },

  applyJoined: ({ playerId, lobbyId }) => {
    sessionStorage.setItem('playerId', playerId);
    set({ myPlayerId: playerId, lobbyId, errorMessage: null });
  },

  applyLobbyStatus: (payload) => {
    const current = get().lobbyId;
    if (current && payload.lobbyId !== current) return;
    set({
      lobbyId: payload.lobbyId,
      code: payload.code,
      status: payload.status,
      players: payload.players,
      teams: payload.teams,
      currentTurn: payload.currentTurn,
    });
  },

  setError: (msg) => set({ errorMessage: msg }),
  clearError: () => set({ errorMessage: null }),
  setRehydrating: (value) => set({ isRehydrating: value }),

  reset: () =>
    set({
      lobbyId: null,
      code: null,
      status: null,
      players: [],
      teams: [],
      currentTurn: null,
      errorMessage: null,
    }),

  joinLobby: (nickname, playerId) => {
    socketService.emit('join_lobby', playerId ? { nickname, playerId } : { nickname });
  },

  assignPokemon: () => {
    const id = get().myPlayerId;
    if (!id) {
      set({ errorMessage: 'No player id — rejoin the lobby' });
      return;
    }
    socketService.emit('assign_pokemon', { playerId: id });
  },

  ready: () => {
    const id = get().myPlayerId;
    if (!id) {
      set({ errorMessage: 'No player id — rejoin the lobby' });
      return;
    }
    socketService.emit('ready', { playerId: id });
  },
}));

export const selectMyTeam = (state: LobbyState) =>
  state.teams.find((t) => t.playerId === state.myPlayerId)?.team ?? null;

export const selectOpponent = (state: LobbyState) =>
  state.players.find((p) => p.id !== state.myPlayerId) ?? null;

export const selectMe = (state: LobbyState) =>
  state.players.find((p) => p.id === state.myPlayerId) ?? null;

export const selectOpponentTeam = (state: LobbyState) => {
  const opp = selectOpponent(state);
  if (!opp) return null;
  return state.teams.find((t) => t.playerId === opp.id)?.team ?? null;
};
