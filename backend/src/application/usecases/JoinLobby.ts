import { randomBytes } from 'node:crypto';
import { Lobby, LobbyStatus } from '../../domain/entities/Lobby.js';
import { Player } from '../../domain/entities/Player.js';
import type { PlayerRepository } from '../../domain/repositories/PlayerRepository.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';

export interface JoinLobbyInput {
  nickname: string;
  playerId?: string;
}

export interface JoinLobbyOutput {
  playerId: string;
  lobby: Lobby;
}

export class JoinLobby {
  constructor(
    private readonly playerRepo: PlayerRepository,
    private readonly lobbyRepo: LobbyRepository,
  ) {}

  async execute({ nickname, playerId }: JoinLobbyInput): Promise<JoinLobbyOutput> {
    let player: Player | null;
    if (playerId) {
      player = await this.playerRepo.findById(playerId);
      if (!player || player.name !== nickname) {
        throw new Error('Session expired');
      }
      const active = await this.lobbyRepo.findByPlayerId(player.id);
      if (active) {
        return { playerId: player.id, lobby: active };
      }
    } else {
      player = await this.playerRepo.findByName(nickname);
      if (!player) {
        player = await this.playerRepo.create(
          new Player({ id: '', name: nickname }),
        );
      }
    }

    let lobby = await this.lobbyRepo.findWaiting();
    if (!lobby) {
      lobby = await this.lobbyRepo.create(
        new Lobby({
          id: '',
          code: generateLobbyCode(),
          players: [],
          status: LobbyStatus.WAITING,
        }),
      );
    }

    await this.lobbyRepo.finalizeOpenLobbiesForPlayer(player.id, lobby.id);

    const already = lobby.players.find((p) => p.playerId === player.id);
    if (already) {
      return { playerId: player.id, lobby };
    }

    if (lobby.players.length >= 2) {
      throw new Error('Lobby is full');
    }

    lobby.players.push({ playerId: player.id, isReady: false });
    const updated = await this.lobbyRepo.update(lobby);
    if (!updated) {
      throw new Error('Failed to update lobby');
    }

    return { playerId: player.id, lobby: updated };
  }
}

function generateLobbyCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}
