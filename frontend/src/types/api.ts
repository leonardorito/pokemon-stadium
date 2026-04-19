export interface PokemonState {
  pokemonId: number;
  name: string;
  hp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite: string;
  defeated: boolean;
}

export type LobbyStatus = 'waiting' | 'ready' | 'battling' | 'finished';

export interface LobbyStatusPlayer {
  id: string;
  nickname: string;
  isReady: boolean;
}

export interface LobbyStatusTeam {
  playerId: string;
  team: PokemonState[];
}

export interface LobbyStatusPayload {
  lobbyId: string;
  code: string;
  status: LobbyStatus;
  players: LobbyStatusPlayer[];
  teams: LobbyStatusTeam[];
  currentTurn: string | null;
}

export interface JoinedPayload {
  playerId: string;
  lobbyId: string;
}

export interface BattleStartPayload {
  battleId: string;
  firstTurn: string;
  battleState: {
    currentTurn: string;
    players: Array<{ playerId: string; team: PokemonState[] }>;
  };
}

export interface BattleSyncPayload {
  battleId: string;
  currentTurn: string | null;
  status: LobbyStatus | null;
  players: Array<{ playerId: string; team: PokemonState[] }>;
}

export interface TurnResultPayload {
  attackerId: string;
  defenderId: string;
  damage: number;
  remainingHp: number;
  currentTurn: string | null;
}

export interface PokemonDefeatedPayload {
  playerId: string;
  pokemonName: string;
}

export interface PokemonEnterPayload {
  playerId: string;
  pokemon: PokemonState;
}

export interface TurnChangePayload {
  currentTurn: string;
}

export interface BattleEndPayload {
  winner: string | null;
  winnerNickname: string;
}

export interface ErrorPayload {
  message: string;
}
