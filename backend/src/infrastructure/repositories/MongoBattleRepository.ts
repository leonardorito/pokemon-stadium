import type { HydratedDocument } from 'mongoose';
import { BattleRepository } from '../../domain/repositories/BattleRepository.js';
import { Battle } from '../../domain/entities/Battle.js';
import { PokemonState } from '../../domain/entities/PokemonState.js';
import { BattleModel, type BattleDoc } from '../models/BattleModel.js';

export class MongoBattleRepository extends BattleRepository {
  async create(battle: Battle): Promise<Battle> {
    const doc = await BattleModel.create({
      lobby: battle.lobbyId,
      players: battle.players,
      currentTurn: battle.currentTurn,
    });
    return this.#toDomain(doc);
  }

  async findById(id: string): Promise<Battle | null> {
    const doc = await BattleModel.findById(id);
    return doc ? this.#toDomain(doc) : null;
  }

  async findByLobbyId(lobbyId: string): Promise<Battle | null> {
    const doc = await BattleModel.findOne({ lobby: lobbyId });
    return doc ? this.#toDomain(doc) : null;
  }

  async update(battle: Battle): Promise<Battle | null> {
    const doc = await BattleModel.findByIdAndUpdate(
      battle.id,
      {
        lobby: battle.lobbyId,
        players: battle.players,
        currentTurn: battle.currentTurn,
      },
      { new: true },
    );
    return doc ? this.#toDomain(doc) : null;
  }

  #toDomain(doc: HydratedDocument<BattleDoc>): Battle {
    return new Battle({
      id: doc._id.toString(),
      lobbyId: doc.lobby ? doc.lobby.toString() : null,
      players: doc.players.map((p) => ({
        playerId: p.playerId ? p.playerId.toString() : null,
        team: p.team.map(
          (t) =>
            new PokemonState({
              pokemonId: t.pokemonId,
              name: t.name,
              hp: t.hp,
              currentHp: t.currentHp,
              attack: t.attack,
              defense: t.defense,
              speed: t.speed,
              sprite: t.sprite ?? null,
              defeated: t.defeated,
            }),
        ),
      })),
      currentTurn: doc.currentTurn ? doc.currentTurn.toString() : null,
    });
  }
}
