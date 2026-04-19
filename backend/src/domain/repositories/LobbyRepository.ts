import type { Lobby } from '../entities/Lobby.js';

export class LobbyRepository {
  async create(_lobby: Lobby): Promise<Lobby> {
    throw new Error('LobbyRepository.create not implemented');
  }

  async findById(_id: string): Promise<Lobby | null> {
    throw new Error('LobbyRepository.findById not implemented');
  }

  async findWaiting(): Promise<Lobby | null> {
    throw new Error('LobbyRepository.findWaiting not implemented');
  }

  async findByPlayerId(_playerId: string): Promise<Lobby | null> {
    throw new Error('LobbyRepository.findByPlayerId not implemented');
  }

  async update(_lobby: Lobby): Promise<Lobby | null> {
    throw new Error('LobbyRepository.update not implemented');
  }

  async finalizeOpenLobbiesForPlayer(_playerId: string, _exceptLobbyId?: string): Promise<void> {
    throw new Error('LobbyRepository.finalizeOpenLobbiesForPlayer not implemented');
  }

  async setPlayerReady(_lobbyId: string, _playerId: string): Promise<Lobby | null> {
    throw new Error('LobbyRepository.setPlayerReady not implemented');
  }

  async removePlayerFromWaitingLobby(
    _lobbyId: string,
    _playerId: string,
  ): Promise<Lobby | null> {
    throw new Error('LobbyRepository.removePlayerFromWaitingLobby not implemented');
  }
}
