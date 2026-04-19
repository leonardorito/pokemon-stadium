import { Schema } from 'mongoose';

export interface PokemonStateDoc {
  pokemonId: number;
  name: string;
  hp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite?: string | null;
  defeated: boolean;
}

export const pokemonStateSchema = new Schema<PokemonStateDoc>(
  {
    pokemonId: { type: Number, required: true },
    name: { type: String, required: true },
    hp: { type: Number, required: true },
    currentHp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    speed: { type: Number, required: true },
    sprite: { type: String },
    defeated: { type: Boolean, default: false },
  },
  { _id: false },
);
