import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { spriteFor } from "@/utils/sprites";
import type { PokemonState } from "@/types/api";
import { HpBar } from "./HpBar";
import { HudTag } from "./HudTag";
import { Panel } from "./Panel";
import { PokemonSprite } from "./PokemonSprite";
import { StencilLabel } from "./StencilLabel";

interface Props {
  pokemon: PokemonState | null;
  index: number;
  accent: "magenta" | "cyan";
  showHp?: boolean;
}

export function PokemonSlotCard({
  pokemon,
  index,
  accent,
  showHp = false,
}: Props) {
  const accentColor = accent === "magenta" ? colors.magenta : colors.cyan;

  return (
    <Panel style={styles.panel}>
      <View style={styles.headerRow}>
        <StencilLabel>Slot {index + 1}</StencilLabel>
        {pokemon?.defeated && <HudTag color={colors.magenta}>Fainted</HudTag>}
      </View>
      <View style={[styles.spriteBox, { borderColor: accentColor }]}>
        {pokemon ? (
          <PokemonSprite
            uri={spriteFor(pokemon, "front")}
            size={72}
            animation={pokemon.defeated ? "faint" : "bob"}
          />
        ) : (
          <Text style={styles.empty}>?</Text>
        )}
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {pokemon ? capitalize(pokemon.name) : "—"}
        </Text>
        {pokemon && (
          <Text style={styles.id}>
            #{String(pokemon.pokemonId).padStart(3, "0")}
          </Text>
        )}
      </View>
      {showHp && pokemon && (
        <View style={styles.hpRow}>
          <HpBar current={pokemon.currentHp} max={pokemon.hp} />
        </View>
      )}
    </Panel>
  );
}

function capitalize(n: string) {
  return n ? n[0]!.toUpperCase() + n.slice(1) : "";
}

const styles = StyleSheet.create({
  panel: { padding: 10, gap: 8, flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spriteBox: {
    height: 88,
    borderWidth: 2,
    backgroundColor: colors.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { fontFamily: fonts.display, fontSize: 32, color: colors.textGhost },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  name: { fontFamily: fonts.pixel, fontSize: 9, color: colors.textWhite, flex: 1 },
  id: { fontFamily: fonts.mono, fontSize: 10, color: colors.textDim },
  hpRow: { marginTop: 8 },
});
