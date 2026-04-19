import mongoose, { Schema, type Types } from 'mongoose';
import { pokemonStateSchema, type PokemonStateDoc } from './pokemonStateSchema.js';

export interface BattlePlayerDoc {
  playerId: Types.ObjectId;
  team: PokemonStateDoc[];
}

export interface BattleDoc {
  lobby: Types.ObjectId;
  players: BattlePlayerDoc[];
  currentTurn: Types.ObjectId | null;
}

const battlePlayerSchema = new Schema<BattlePlayerDoc>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    team: { type: [pokemonStateSchema], default: [] },
  },
  { _id: false },
);

const battleSchema = new Schema<BattleDoc>(
  {
    lobby: {
      type: Schema.Types.ObjectId,
      ref: 'Lobby',
      required: true,
    },
    players: { type: [battlePlayerSchema], default: [] },
    currentTurn: { type: Schema.Types.ObjectId, ref: 'Player', default: null },
  },
  { timestamps: true },
);

export const BattleModel = mongoose.model<BattleDoc>('Battle', battleSchema);
