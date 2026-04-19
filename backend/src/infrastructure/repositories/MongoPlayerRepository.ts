import type { HydratedDocument } from 'mongoose';
import { PlayerRepository } from '../../domain/repositories/PlayerRepository.js';
import { Player } from '../../domain/entities/Player.js';
import { PlayerModel, type PlayerDoc } from '../models/PlayerModel.js';

export class MongoPlayerRepository extends PlayerRepository {
  async create(player: Player): Promise<Player> {
    const doc = await PlayerModel.create({
      name: player.name,
      socketId: player.socketId,
    });
    return this.#toDomain(doc);
  }

  async findById(id: string): Promise<Player | null> {
    const doc = await PlayerModel.findById(id);
    return doc ? this.#toDomain(doc) : null;
  }

  async findByName(name: string): Promise<Player | null> {
    const doc = await PlayerModel.findOne({ name });
    return doc ? this.#toDomain(doc) : null;
  }

  async findBySocketId(socketId: string): Promise<Player | null> {
    const doc = await PlayerModel.findOne({ socketId });
    return doc ? this.#toDomain(doc) : null;
  }

  async update(player: Player): Promise<Player | null> {
    const doc = await PlayerModel.findByIdAndUpdate(
      player.id,
      { name: player.name, socketId: player.socketId },
      { new: true },
    );
    return doc ? this.#toDomain(doc) : null;
  }

  #toDomain(doc: HydratedDocument<PlayerDoc>): Player {
    return new Player({
      id: doc._id.toString(),
      name: doc.name,
      socketId: doc.socketId ?? null,
    });
  }
}
