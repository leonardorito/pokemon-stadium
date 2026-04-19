import type { Lobby } from '../../domain/entities/Lobby.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';

export interface SetReadyInput {
  playerId: string;
}

export interface SetReadyOutput {
  lobby: Lobby;
}

export class SetReady {
  constructor(private readonly lobbyRepo: LobbyRepository) {}

  async execute({ playerId }: SetReadyInput): Promise<SetReadyOutput> {
    const lobby = await this.lobbyRepo.findByPlayerId(playerId);
    if (!lobby) {
      throw new Error('Player is not in a lobby');
    }

    const participant = lobby.players.find((p) => p.playerId === playerId);
    if (!participant) {
      throw new Error('Player not in lobby participants');
    }

    const updated = await this.lobbyRepo.setPlayerReady(lobby.id, playerId);
    if (!updated) {
      throw new Error('Failed to update lobby');
    }

    return { lobby: updated };
  }
}
