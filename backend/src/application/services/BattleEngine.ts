import { Battle } from '../../domain/entities/Battle.js';
import { LobbyStatus } from '../../domain/entities/Lobby.js';
import type { PokemonState } from '../../domain/entities/PokemonState.js';
import type { LobbyRepository } from '../../domain/repositories/LobbyRepository.js';
import type { BattleRepository } from '../../domain/repositories/BattleRepository.js';

export interface BattleStartResult {
  battleId: string;
  firstTurn: string;
  battleState: {
    currentTurn: string;
    players: Array<{ playerId: string; team: PokemonState[] }>;
  };
}

export interface AttackResult {
  attackerId: string;
  defenderId: string;
  damage: number;
  remainingHp: number;
  defenderPokemonName: string;
  defenderPokemonDefeated: boolean;
  newActiveDefenderPokemon: PokemonState | null;
  battleOver: boolean;
  winnerId: string | null;
  currentTurn: string | null;
}

export class BattleEngine {
  readonly #locks: Set<string> = new Set();

  constructor(
    private readonly lobbyRepo: LobbyRepository,
    private readonly battleRepo: BattleRepository,
  ) {}

  async startBattle(lobbyId: string): Promise<BattleStartResult> {
    const lobby = await this.lobbyRepo.findById(lobbyId);
    if (!lobby) {
      throw new Error('Lobby not found');
    }

    const battle = await this.battleRepo.findByLobbyId(lobbyId);
    if (!battle) {
      throw new Error('Battle not created — players must assign pokemon first');
    }
    if (battle.players.length < 2) {
      throw new Error('Battle requires two players');
    }
    if (battle.players.some((p) => !p.playerId || p.team.length === 0)) {
      throw new Error('All players must have teams assigned');
    }

    const [a, b] = battle.players as [
      Battle['players'][number],
      Battle['players'][number],
    ];
    const aLead = a.team[0]!;
    const bLead = b.team[0]!;
    const firstTurn = (bLead.speed > aLead.speed ? b.playerId : a.playerId)!;

    battle.currentTurn = firstTurn;
    const updatedBattle = await this.battleRepo.update(battle);
    if (!updatedBattle) {
      throw new Error('Failed to persist battle start');
    }

    lobby.status = LobbyStatus.BATTLING;
    const updatedLobby = await this.lobbyRepo.update(lobby);
    if (!updatedLobby) {
      throw new Error('Failed to update lobby status');
    }

    return {
      battleId: updatedBattle.id,
      firstTurn,
      battleState: {
        currentTurn: firstTurn,
        players: updatedBattle.players.map((p) => ({
          playerId: p.playerId!,
          team: p.team,
        })),
      },
    };
  }

  async processAttack(
    lobbyId: string,
    attackingPlayerId: string,
  ): Promise<AttackResult> {
    if (this.#locks.has(lobbyId)) {
      throw new Error('Turn already in progress');
    }
    this.#locks.add(lobbyId);
    try {
      const battle = await this.battleRepo.findByLobbyId(lobbyId);
      if (!battle) {
        throw new Error('Battle not found');
      }
      if (battle.currentTurn !== attackingPlayerId) {
        throw new Error('Not your turn');
      }

      const attackerEntry = battle.players.find(
        (p) => p.playerId === attackingPlayerId,
      );
      const defenderEntry = battle.players.find(
        (p) => p.playerId !== attackingPlayerId,
      );
      if (!attackerEntry || !defenderEntry || !defenderEntry.playerId) {
        throw new Error('Battle participants invalid');
      }

      const attacker = attackerEntry.team.find((p) => !p.defeated);
      const defender = defenderEntry.team.find((p) => !p.defeated);
      if (!attacker || !defender) {
        throw new Error('No active pokemon available');
      }

      const damage = Math.max(1, attacker.attack - defender.defense);
      defender.currentHp = Math.max(0, defender.currentHp - damage);

      let defenderPokemonDefeated = false;
      let newActiveDefenderPokemon: PokemonState | null = null;
      let battleOver = false;
      let winnerId: string | null = null;
      let currentTurn: string | null = defenderEntry.playerId;

      if (defender.currentHp === 0) {
        defender.defeated = true;
        defenderPokemonDefeated = true;
        const next = defenderEntry.team.find((p) => !p.defeated);
        if (!next) {
          battleOver = true;
          winnerId = attackingPlayerId;
          currentTurn = null;
        } else {
          newActiveDefenderPokemon = next;
        }
      }

      battle.currentTurn = currentTurn;
      await this.battleRepo.update(battle);

      if (battleOver) {
        const lobby = await this.lobbyRepo.findById(lobbyId);
        if (lobby) {
          lobby.status = LobbyStatus.FINISHED;
          await this.lobbyRepo.update(lobby);
        }
      }

      return {
        attackerId: attackingPlayerId,
        defenderId: defenderEntry.playerId,
        damage,
        remainingHp: defender.currentHp,
        defenderPokemonName: defender.name,
        defenderPokemonDefeated,
        newActiveDefenderPokemon,
        battleOver,
        winnerId,
        currentTurn,
      };
    } finally {
      this.#locks.delete(lobbyId);
    }
  }
}
