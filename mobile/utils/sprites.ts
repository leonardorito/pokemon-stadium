import type { PokemonState } from "@/types/api";

const GEN_V_MAX = 649;
const BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

export type SpriteView = "front" | "back";

export function animatedSpriteUrl(
  pokemonId: number,
  view: SpriteView = "front",
): string | null {
  if (!Number.isFinite(pokemonId) || pokemonId < 1 || pokemonId > GEN_V_MAX)
    return null;
  const path = view === "back" ? "/back" : "";
  return `${BASE}${path}/${pokemonId}.gif`;
}

export function spriteFor(pokemon: PokemonState, view: SpriteView): string {
  return animatedSpriteUrl(pokemon.pokemonId, view) ?? pokemon.sprite;
}
