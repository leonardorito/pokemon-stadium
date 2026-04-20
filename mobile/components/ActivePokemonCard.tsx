import type { ReactNode } from "react";
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
  trainerName: string;
  isMine: boolean;
  isActiveTurn: boolean;
  isBeingHit: boolean;
  hitTick: number;
  aliveCount: number;
  totalCount: number;
  // Rendered below the HP bar — used by BattleScreen to put the Attack
  // button right on the player's active card so they don't have to scroll.
  actionSlot?: ReactNode;
}

export function ActivePokemonCard({
  pokemon,
  trainerName,
  isMine,
  isActiveTurn,
  isBeingHit,
  hitTick,
  aliveCount,
  totalCount,
  actionSlot,
}: Props) {
  const accent = isMine ? colors.cyan : colors.magenta;
  const view = isMine ? "back" : "front";

  if (!pokemon) {
    return (
      <Panel
        borderColor={isActiveTurn ? colors.yellow : colors.edge}
        style={styles.empty}
      >
        <StencilLabel color={accent}>{trainerName}</StencilLabel>
        <Text style={styles.dash}>—</Text>
        <Text style={styles.waiting}>{isMine ? "No active" : "Waiting…"}</Text>
      </Panel>
    );
  }

  return (
    <Panel borderColor={isActiveTurn ? accent : colors.edge}>
      <View style={[styles.header, { borderBottomColor: colors.edge }]}>
        <Text style={[styles.trainer, { color: accent }]} numberOfLines={1}>
          {trainerName}
        </Text>
        <Text style={styles.alive}>
          {aliveCount}/{totalCount} alive
        </Text>
      </View>
      <View style={styles.spriteBox}>
        <PokemonSprite
          uri={spriteFor(pokemon, view)}
          size={140}
          animation={pokemon.defeated ? "faint" : "bob"}
          hitTrigger={isBeingHit ? hitTick : 0}
        />
        {isActiveTurn && !pokemon.defeated && (
          <View style={styles.activeTag}>
            <HudTag color={colors.yellow}>Active</HudTag>
          </View>
        )}
      </View>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
        <Text style={styles.id}>
          #{String(pokemon.pokemonId).padStart(3, "0")}
        </Text>
      </View>
      <HpBar current={pokemon.currentHp} max={pokemon.hp} />
      {actionSlot && <View style={styles.actionSlot}>{actionSlot}</View>}
    </Panel>
  );
}

function capitalize(n: string) {
  return n ? n[0]!.toUpperCase() + n.slice(1) : "";
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
    gap: 8,
  },
  dash: { fontFamily: fonts.display, fontSize: 48, color: colors.textGhost },
  waiting: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textGhost,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  trainer: {
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    flex: 1,
  },
  alive: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  spriteBox: {
    backgroundColor: colors.deep,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 12,
  },
  activeTag: { position: "absolute", top: 8, right: 8 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  name: { fontFamily: fonts.pixel, fontSize: 14, color: colors.textWhite },
  id: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.6,
  },
  actionSlot: { marginTop: 14, alignItems: "center" },
});
