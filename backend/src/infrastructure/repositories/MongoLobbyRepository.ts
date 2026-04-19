import { Types, type HydratedDocument } from 'mongoose';
import { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';
import { Lobby } from '../../domain/entities/Lobby.js';
import { LobbyModel, type LobbyDoc } from '../models/LobbyModel.js';

export class MongoLobbyRepository extends LobbyRepository {
  async create(lobby: Lobby): Promise<Lobby> {
    const doc = await LobbyModel.create({
      code: lobby.code,
      players: lobby.players.map((p) => ({
        playerId: new Types.ObjectId(p.playerId),
        isReady: p.isReady,
      })),
      status: lobby.status,
    });
    return this.#toDomain(doc);
  }

  async findById(id: string): Promise<Lobby | null> {
    const doc = await LobbyModel.findById(id);
    return doc ? this.#toDomain(doc) : null;
  }

  async findWaiting(): Promise<Lobby | null> {
    const doc = await LobbyModel.findOne({
      status: 'waiting',
      'players.1': { $exists: false },
    }).sort({ createdAt: 1 });
    return doc ? this.#toDomain(doc) : null;
  }

  async removePlayerFromWaitingLobby(
    lobbyId: string,
    playerId: string,
  ): Promise<Lobby | null> {
    const after = await LobbyModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(lobbyId),
        status: 'waiting',
        'players.playerId': new Types.ObjectId(playerId),
      },
      { $pull: { players: { playerId: new Types.ObjectId(playerId) } } },
      { new: true },
    );
    if (!after) return null;
    if (after.players.length === 0) {
      const finalized = await LobbyModel.findOneAndUpdate(
        { _id: after._id },
        { $set: { status: 'finished' } },
        { new: true },
      );
      return finalized ? this.#toDomain(finalized) : this.#toDomain(after);
    }
    return this.#toDomain(after);
  }

  async findByPlayerId(playerId: string): Promise<Lobby | null> {
    const doc = await LobbyModel.findOne({
      'players.playerId': new Types.ObjectId(playerId),
      status: { $ne: 'finished' },
    }).sort({ createdAt: -1 });
    return doc ? this.#toDomain(doc) : null;
  }

  async finalizeOpenLobbiesForPlayer(playerId: string, exceptLobbyId?: string): Promise<void> {
    const filter: Record<string, unknown> = {
      'players.playerId': new Types.ObjectId(playerId),
      status: { $ne: 'finished' },
    };
    if (exceptLobbyId) filter._id = { $ne: new Types.ObjectId(exceptLobbyId) };
    await LobbyModel.updateMany(filter, { $set: { status: 'finished' } });
  }

  async setPlayerReady(lobbyId: string, playerId: string): Promise<Lobby | null> {
    const after = await LobbyModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(lobbyId),
        'players.playerId': new Types.ObjectId(playerId),
      },
      { $set: { 'players.$.isReady': true } },
      { new: true },
    );
    if (!after) return null;
    if (
      after.players.length === 2 &&
      after.players.every((p) => p.isReady) &&
      after.status === 'waiting'
    ) {
      const promoted = await LobbyModel.findOneAndUpdate(
        { _id: new Types.ObjectId(lobbyId), status: 'waiting' },
        { $set: { status: 'ready' } },
        { new: true },
      );
      if (promoted) return this.#toDomain(promoted);
    }
    return this.#toDomain(after);
  }

  async update(lobby: Lobby): Promise<Lobby | null> {
    const doc = await LobbyModel.findByIdAndUpdate(
      lobby.id,
      {
        code: lobby.code,
        players: lobby.players.map((p) => ({
          playerId: new Types.ObjectId(p.playerId),
          isReady: p.isReady,
        })),
        status: lobby.status,
      },
      { new: true },
    );
    return doc ? this.#toDomain(doc) : null;
  }

  #toDomain(doc: HydratedDocument<LobbyDoc>): Lobby {
    return new Lobby({
      id: doc._id.toString(),
      code: doc.code,
      players: doc.players.map((p) => ({
        playerId: p.playerId.toString(),
        isReady: p.isReady,
      })),
      status: doc.status,
    });
  }
}
