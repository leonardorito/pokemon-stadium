import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import type { LobbyStatusPlayer, PokemonState } from "@/types/api";
import { HudTag } from "./HudTag";
import { Panel } from "./Panel";
import { PokemonSlotCard } from "./PokemonSlotCard";
import { StencilLabel } from "./StencilLabel";

interface Props {
  player: LobbyStatusPlayer | null;
  team: PokemonState[] | null;
  accent: "magenta" | "cyan";
  isMe: boolean;
  showHp?: boolean;
}

export function PlayerPanel({
  player,
  team,
  accent,
  isMe,
  showHp = false,
}: Props) {
  const accentColor = accent === "magenta" ? colors.magenta : colors.cyan;
  const slots: (PokemonState | null)[] = [0, 1, 2].map(
    (i) => team?.[i] ?? null,
  );
  const ready = !!player?.isReady;
  const aliveCount = team ? team.filter((p) => !p.defeated).length : 0;

  return (
    <Panel>
      <View style={[styles.header, { borderBottomColor: accentColor }]}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, { color: accentColor }]}
            numberOfLines={1}
          >
            {player?.nickname ?? "WAITING…"}
          </Text>
          {isMe && <HudTag color={colors.yellow}>You</HudTag>}
        </View>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: ready ? colors.lime : colors.edge },
            ]}
          />
          <StencilLabel color={ready ? colors.lime : colors.textMuted}>
            {ready ? "Ready" : "Standby"}
          </StencilLabel>
        </View>
      </View>
      <View style={styles.slots}>
        {slots.map((slot, i) => (
          <PokemonSlotCard
            key={i}
            pokemon={slot}
            index={i}
            accent={accent}
            showHp={showHp}
          />
        ))}
      </View>
      <Text style={styles.footer}>
        Team {team ? `${aliveCount}/${team.length} alive` : "unassigned"}
      </Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 2,
    marginBottom: 12,
  },
  nameRow: { flexDirection: "row", gap: 8, alignItems: "center", flex: 1 },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  statusRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 10, height: 10 },
  slots: { flexDirection: "row", gap: 8 },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginTop: 12,
  },
});
