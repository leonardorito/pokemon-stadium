export interface PokemonStateProps {
  pokemonId: number;
  name: string;
  hp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite?: string | null;
  defeated?: boolean;
}

export class PokemonState {
  pokemonId: number;
  name: string;
  hp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite: string | null;
  defeated: boolean;

  constructor({
    pokemonId,
    name,
    hp,
    currentHp,
    attack,
    defense,
    speed,
    sprite = null,
    defeated = false,
  }: PokemonStateProps) {
    this.pokemonId = pokemonId;
    this.name = name;
    this.hp = hp;
    this.currentHp = currentHp;
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
    this.sprite = sprite;
    this.defeated = defeated;
  }
}
