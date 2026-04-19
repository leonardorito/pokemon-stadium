import type { Player } from '../entities/Player.js';

export class PlayerRepository {
  async create(_player: Player): Promise<Player> {
    throw new Error('PlayerRepository.create not implemented');
  }

  async findById(_id: string): Promise<Player | null> {
    throw new Error('PlayerRepository.findById not implemented');
  }

  async findByName(_name: string): Promise<Player | null> {
    throw new Error('PlayerRepository.findByName not implemented');
  }

  async findBySocketId(_socketId: string): Promise<Player | null> {
    throw new Error('PlayerRepository.findBySocketId not implemented');
  }

  async update(_player: Player): Promise<Player | null> {
    throw new Error('PlayerRepository.update not implemented');
  }
}
