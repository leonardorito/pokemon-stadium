import type { Battle } from '../entities/Battle.js';

export class BattleRepository {
  async create(_battle: Battle): Promise<Battle> {
    throw new Error('BattleRepository.create not implemented');
  }

  async findById(_id: string): Promise<Battle | null> {
    throw new Error('BattleRepository.findById not implemented');
  }

  async findByLobbyId(_lobbyId: string): Promise<Battle | null> {
    throw new Error('BattleRepository.findByLobbyId not implemented');
  }

  async update(_battle: Battle): Promise<Battle | null> {
    throw new Error('BattleRepository.update not implemented');
  }
}
