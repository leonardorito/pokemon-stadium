import type { PokemonState } from './PokemonState.js';

export interface BattleTeamMember {
  playerId: string | null;
  team: PokemonState[];
}

export interface BattleProps {
  id: string;
  lobbyId: string | null;
  players?: BattleTeamMember[];
  currentTurn?: string | null;
}

export class Battle {
  id: string;
  lobbyId: string | null;
  players: BattleTeamMember[];
  currentTurn: string | null;

  constructor({
    id,
    lobbyId,
    players = [],
    currentTurn = null,
  }: BattleProps) {
    this.id = id;
    this.lobbyId = lobbyId;
    this.players = players;
    this.currentTurn = currentTurn;
  }
}
