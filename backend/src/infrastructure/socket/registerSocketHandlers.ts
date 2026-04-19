import type { Server as SocketIoServer, Socket } from 'socket.io';
import { LobbyStatus } from '../../domain/entities/Lobby.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';
import type { BattleRepository } from '../../domain/repositories/BattleRepository.js';
import type { PlayerRepository } from '../../domain/repositories/PlayerRepository.js';
import type { JoinLobby } from '../../application/usecases/JoinLobby.js';
import type { AssignPokemon } from '../../application/usecases/AssignPokemon.js';
import type { SetReady } from '../../application/usecases/SetReady.js';
import type { LeaveLobby } from '../../application/usecases/LeaveLobby.js';
import type { BattleEngine } from '../../application/services/BattleEngine.js';
import { emitLobbyStatusByLobbyId } from './buildLobbyStatus.js';

export interface SocketDeps {
  io: SocketIoServer;
  lobbyRepo: LobbyRepository;
  battleRepo: BattleRepository;
  playerRepo: PlayerRepository;
  joinLobby: JoinLobby;
  assignPokemon: AssignPokemon;
  setReady: SetReady;
  leaveLobby: LeaveLobby;
  battleEngine: BattleEngine;
}

interface JoinLobbyMessage {
  nickname?: unknown;
  playerId?: unknown;
}
interface PlayerIdMessage {
  playerId?: unknown;
}

export function registerSocketHandlers(deps: SocketDeps): void {
  const { io, lobbyRepo, battleRepo, playerRepo, joinLobby, assignPokemon, setReady, leaveLobby, battleEngine } = deps;

  io.on('connection', (socket: Socket) => {
    const emitError = (err: unknown): void => {
      const message = err instanceof Error ? err.message : 'Internal error';
      socket.emit('error', { message });
    };

    socket.on('error', (err: unknown) => emitError(err));

    socket.on('disconnect', async () => {
      const playerId = typeof socket.data.playerId === 'string' ? socket.data.playerId : '';
      const lobbyId = typeof socket.data.lobbyId === 'string' ? socket.data.lobbyId : '';
      if (!playerId || !lobbyId) return;
      try {
        const result = await leaveLobby.execute({ lobbyId, playerId });
        if (!result) return;
        if (!result.emptied) {
          await emitLobbyStatusByLobbyId(lobbyId, io, lobbyRepo, battleRepo, playerRepo);
        }
      } catch {
        // disconnect cleanup is best-effort; swallow errors
      }
    });

    socket.on('join_lobby', async (msg: JoinLobbyMessage) => {
      try {
        const nickname = typeof msg?.nickname === 'string' ? msg.nickname.trim() : '';
        if (!nickname) throw new Error('nickname is required');
        const incomingPlayerId = typeof msg?.playerId === 'string' && msg.playerId ? msg.playerId : undefined;

        const { playerId, lobby } = await joinLobby.execute({ nickname, playerId: incomingPlayerId });
        socket.join(lobby.id);
        socket.data.playerId = playerId;
        socket.data.lobbyId = lobby.id;
        socket.emit('joined', { playerId, lobbyId: lobby.id });
        await emitLobbyStatusByLobbyId(lobby.id, io, lobbyRepo, battleRepo, playerRepo);
      } catch (err) {
        emitError(err);
      }
    });

    socket.on('sync_battle', async (msg: PlayerIdMessage) => {
      try {
        const playerId = typeof msg?.playerId === 'string' ? msg.playerId : '';
        if (!playerId) throw new Error('playerId is required');
        const lobbyId = typeof socket.data.lobbyId === 'string' ? socket.data.lobbyId : '';
        if (!lobbyId) throw new Error('No active lobby');
        const battle = await battleRepo.findByLobbyId(lobbyId);
        if (!battle) throw new Error('No active battle');
        const lobby = await lobbyRepo.findById(lobbyId);
        socket.emit('battle_sync', {
          battleId: battle.id,
          currentTurn: battle.currentTurn,
          status: lobby?.status ?? null,
          players: battle.players.map((p) => ({ playerId: p.playerId, team: p.team })),
        });
      } catch (err) {
        emitError(err);
      }
    });

    socket.on('assign_pokemon', async (msg: PlayerIdMessage) => {
      try {
        const playerId = typeof msg?.playerId === 'string' ? msg.playerId : '';
        if (!playerId) throw new Error('playerId is required');

        await assignPokemon.execute({ playerId });
        const lobby = await lobbyRepo.findByPlayerId(playerId);
        if (!lobby) throw new Error('Player is not in a lobby');
        socket.join(lobby.id);
        socket.data.playerId = playerId;
        socket.data.lobbyId = lobby.id;
        await emitLobbyStatusByLobbyId(lobby.id, io, lobbyRepo, battleRepo, playerRepo);
      } catch (err) {
        emitError(err);
      }
    });

    socket.on('ready', async (msg: PlayerIdMessage) => {
      try {
        const playerId = typeof msg?.playerId === 'string' ? msg.playerId : '';
        if (!playerId) throw new Error('playerId is required');

        const { lobby } = await setReady.execute({ playerId });
        socket.join(lobby.id);
        socket.data.playerId = playerId;
        socket.data.lobbyId = lobby.id;
        await emitLobbyStatusByLobbyId(lobby.id, io, lobbyRepo, battleRepo, playerRepo);

        if (lobby.status === LobbyStatus.READY) {
          const start = await battleEngine.startBattle(lobby.id);
          io.to(lobby.id).emit('battle_start', start);
          await emitLobbyStatusByLobbyId(lobby.id, io, lobbyRepo, battleRepo, playerRepo);
        }
      } catch (err) {
        emitError(err);
      }
    });

    socket.on('attack', async (msg: PlayerIdMessage) => {
      try {
        const playerId = typeof msg?.playerId === 'string' ? msg.playerId : '';
        if (!playerId) throw new Error('playerId is required');

        const lobby = await lobbyRepo.findByPlayerId(playerId);
        if (!lobby) throw new Error('Player is not in a lobby');

        const result = await battleEngine.processAttack(lobby.id, playerId);

        io.to(lobby.id).emit('turn_result', {
          attackerId: result.attackerId,
          defenderId: result.defenderId,
          damage: result.damage,
          remainingHp: result.remainingHp,
          currentTurn: result.currentTurn,
        });

        if (result.defenderPokemonDefeated) {
          io.to(lobby.id).emit('pokemon_defeated', {
            playerId: result.defenderId,
            pokemonName: result.defenderPokemonName,
          });
        }

        if (result.battleOver) {
          const winner = result.winnerId
            ? await playerRepo.findById(result.winnerId)
            : null;
          io.to(lobby.id).emit('battle_end', {
            winner: result.winnerId,
            winnerNickname: winner?.name ?? 'Unknown',
          });
          await emitLobbyStatusByLobbyId(lobby.id, io, lobbyRepo, battleRepo, playerRepo);
        } else {
          if (result.defenderPokemonDefeated && result.newActiveDefenderPokemon) {
            io.to(lobby.id).emit('pokemon_enter', {
              playerId: result.defenderId,
              pokemon: result.newActiveDefenderPokemon,
            });
          }
          io.to(lobby.id).emit('turn_change', { currentTurn: result.currentTurn });
        }
      } catch (err) {
        emitError(err);
      }
    });
  });
}
