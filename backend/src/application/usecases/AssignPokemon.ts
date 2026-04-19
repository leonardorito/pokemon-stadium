import { Battle } from '../../domain/entities/Battle.js';
import { PokemonState } from '../../domain/entities/PokemonState.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';
import type { BattleRepository } from '../../domain/repositories/BattleRepository.js';
import type { PokemonCatalogService } from '../services/PokemonCatalogService.js';

export interface AssignPokemonInput {
  playerId: string;
}

export interface AssignPokemonOutput {
  team: PokemonState[];
}

const TEAM_SIZE = 3;

export class AssignPokemon {
  constructor(
    private readonly lobbyRepo: LobbyRepository,
    private readonly battleRepo: BattleRepository,
    private readonly catalog: PokemonCatalogService,
  ) {}

  async execute({ playerId }: AssignPokemonInput): Promise<AssignPokemonOutput> {
    const lobby = await this.lobbyRepo.findByPlayerId(playerId);
    if (!lobby) {
      throw new Error('Player is not in a lobby');
    }

    let battle = await this.battleRepo.findByLobbyId(lobby.id);
    if (!battle) {
      battle = await this.battleRepo.create(
        new Battle({
          id: '',
          lobbyId: lobby.id,
          players: [],
          currentTurn: null,
        }),
      );
    }

    const otherIds = battle.players
      .filter((p) => p.playerId !== playerId)
      .flatMap((p) => p.team.map((t) => t.pokemonId));

    const picks = await this.catalog.getRandom(TEAM_SIZE, otherIds);
    const details = await Promise.all(picks.map((p) => this.catalog.getById(p.id)));

    const team = details.map(
      (d) =>
        new PokemonState({
          pokemonId: d.id,
          name: d.name,
          hp: d.hp,
          currentHp: d.hp,
          attack: d.attack,
          defense: d.defense,
          speed: d.speed,
          sprite: d.sprite,
          defeated: false,
        }),
    );

    const existing = battle.players.find((p) => p.playerId === playerId);
    if (existing) {
      existing.team = team;
    } else {
      battle.players.push({ playerId, team });
    }

    await this.battleRepo.update(battle);

    return { team };
  }
}
