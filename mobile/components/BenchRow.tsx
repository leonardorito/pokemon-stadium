import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { colors, fonts } from "@/constants/theme";
import { spriteFor } from "@/utils/sprites";
import type { PokemonState } from "@/types/api";
import { StencilLabel } from "./StencilLabel";

interface Props {
  bench: PokemonState[];
  isMine: boolean;
  emptySlots?: number;
}

export function BenchRow({ bench, isMine, emptySlots = 0 }: Props) {
  const accent = isMine ? colors.cyan : colors.magenta;
  const fillers = Array.from({ length: emptySlots }, (_, i) => i);

  return (
    <View style={styles.row}>
      <StencilLabel color={accent}>Bench</StencilLabel>
      <View
        style={[
          styles.slots,
          { justifyContent: isMine ? "flex-start" : "flex-end" },
        ]}
      >
        {bench.map((p, i) => (
          <View
            key={`${p.pokemonId}-${i}`}
            style={[styles.slot, { opacity: p.defeated ? 0.4 : 1 }]}
          >
            <Image
              source={{ uri: spriteFor(p, "front") }}
              style={styles.sprite}
              contentFit="contain"
            />
            {p.defeated && <Text style={styles.x}>✕</Text>}
          </View>
        ))}
        {fillers.map((i) => (
          <View key={`empty-${i}`} style={[styles.slot, styles.emptySlot]}>
            <Text style={styles.q}>?</Text>
          </View>
        ))}
        {bench.length === 0 && fillers.length === 0 && (
          <Text style={styles.empty}>empty</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  slots: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center" },
  slot: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.edge,
    backgroundColor: colors.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySlot: { borderStyle: "dashed" },
  sprite: { width: 44, height: 44 },
  x: {
    position: "absolute",
    fontFamily: fonts.display,
    color: colors.magenta,
    fontSize: 22,
  },
  q: { fontFamily: fonts.display, fontSize: 16, color: colors.textGhost },
  empty: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textGhost,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
});
