import type { Lobby } from '../../domain/entities/Lobby.js';
import type { PokemonState } from '../../domain/entities/PokemonState.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';
import type { BattleRepository } from '../../domain/repositories/BattleRepository.js';
import type { PlayerRepository } from '../../domain/repositories/PlayerRepository.js';

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
  status: string;
  players: LobbyStatusPlayer[];
  teams: LobbyStatusTeam[];
  currentTurn: string | null;
}

export async function buildLobbyStatus(
  lobby: Lobby,
  battleRepo: BattleRepository,
  playerRepo: PlayerRepository,
): Promise<LobbyStatusPayload> {
  const battle = await battleRepo.findByLobbyId(lobby.id);
  const players = await Promise.all(
    lobby.players.map(async (p) => {
      const player = await playerRepo.findById(p.playerId);
      return {
        id: p.playerId,
        nickname: player?.name ?? 'Unknown',
        isReady: p.isReady,
      };
    }),
  );
  const teams = battle
    ? battle.players
        .filter((p): p is { playerId: string; team: PokemonState[] } => p.playerId !== null)
        .map((p) => ({ playerId: p.playerId, team: p.team }))
    : [];
  return {
    lobbyId: lobby.id,
    code: lobby.code,
    status: lobby.status,
    players,
    teams,
    currentTurn: battle?.currentTurn ?? null,
  };
}

export async function emitLobbyStatusByLobbyId(
  lobbyId: string,
  io: { to: (room: string) => { emit: (event: string, payload: unknown) => void } },
  lobbyRepo: LobbyRepository,
  battleRepo: BattleRepository,
  playerRepo: PlayerRepository,
): Promise<void> {
  const lobby = await lobbyRepo.findById(lobbyId);
  if (!lobby) return;
  const payload = await buildLobbyStatus(lobby, battleRepo, playerRepo);
  io.to(lobbyId).emit('lobby_status', payload);
}
