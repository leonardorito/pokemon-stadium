import type { Lobby } from '../../domain/entities/Lobby.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';

export interface LeaveLobbyInput {
  lobbyId: string;
  playerId: string;
}

export interface LeaveLobbyOutput {
  lobby: Lobby;
  emptied: boolean;
}

export class LeaveLobby {
  constructor(private readonly lobbyRepo: LobbyRepository) {}

  async execute({ lobbyId, playerId }: LeaveLobbyInput): Promise<LeaveLobbyOutput | null> {
    const lobby = await this.lobbyRepo.removePlayerFromWaitingLobby(lobbyId, playerId);
    if (!lobby) return null;
    return { lobby, emptied: lobby.players.length === 0 };
  }
}
