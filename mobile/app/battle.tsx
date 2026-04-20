import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivePokemonCard } from "@/components/ActivePokemonCard";
import { BattleBackground } from "@/components/BattleBackground";
import { BenchRow } from "@/components/BenchRow";
import { HudTag } from "@/components/HudTag";
import { Panel } from "@/components/Panel";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { StadiumButton } from "@/components/StadiumButton";
import { StencilLabel } from "@/components/StencilLabel";
import { colors, fonts } from "@/constants/theme";
import { useBattleStore } from "@/store/battleStore";
import { selectMe, selectOpponent, useLobbyStore } from "@/store/lobbyStore";
import type { PokemonState } from "@/types/api";

export default function BattleScreen() {
  const router = useRouter();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const me = useLobbyStore(selectMe);
  const opponent = useLobbyStore(selectOpponent);

  const battleId = useBattleStore((s) => s.battleId);
  const teams = useBattleStore((s) => s.teams);
  const currentTurn = useBattleStore((s) => s.currentTurn);
  const battleLog = useBattleStore((s) => s.battleLog);
  const battleOver = useBattleStore((s) => s.battleOver);
  const attackPending = useBattleStore((s) => s.attackPending);
  const lastDefenderId = useBattleStore((s) => s.lastDefenderId);
  const lastEvent = useBattleStore((s) => s.lastEvent);
  const attack = useBattleStore((s) => s.attack);

  const logRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    logRef.current?.scrollToEnd({ animated: true });
  }, [battleLog.length]);

  useEffect(() => {
    if (!battleOver) return;
    const t = setTimeout(() => router.replace("/result"), 1800);
    return () => clearTimeout(t);
  }, [battleOver, router]);

  const myTeam = useMemo(
    () => (myPlayerId ? (teams[myPlayerId] ?? []) : []),
    [teams, myPlayerId],
  );
  const oppTeam = useMemo(
    () => (opponent?.id ? (teams[opponent.id] ?? []) : []),
    [teams, opponent?.id],
  );

  const myActive = activeOf(myTeam);
  const oppActive = activeOf(oppTeam);
  const myBench = benchOf(myTeam, myActive);
  const oppBench = benchOf(oppTeam, oppActive);
  const myAlive = myTeam.filter((p) => !p.defeated).length;
  const oppAlive = oppTeam.filter((p) => !p.defeated).length;

  const isMyTurn = currentTurn === myPlayerId && !battleOver;
  const isOppTurn = !!opponent && currentTurn === opponent.id && !battleOver;
  const myBeingHit = lastDefenderId === myPlayerId;
  const oppBeingHit = !!opponent && lastDefenderId === opponent.id;

  const turnLabel = battleOver
    ? "MATCH OVER"
    : isMyTurn
      ? "YOUR MOVE"
      : `${opponent?.nickname ?? "OPPONENT"} ATTACKING`;
  const turnColor = battleOver
    ? colors.lime
    : isMyTurn
      ? colors.yellow
      : colors.magenta;
  const attackLabel = battleOver
    ? "Match Over"
    : !isMyTurn
      ? "Standby…"
      : attackPending
        ? "..."
        : "Attack ▸";
  const attackDisabled = battleOver || !isMyTurn || attackPending;

  return (
    <BattleBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <StencilLabel color={colors.magenta}>▒ Live Match</StencilLabel>
              <Text style={styles.round}>
                <Text style={styles.roundLabel}>Round </Text>
                <Text style={styles.roundValue}>
                  {battleId ? `#${battleId.slice(-4).toUpperCase()}` : "— —"}
                </Text>
              </Text>
            </View>
            <HudTag color={turnColor}>{turnLabel}</HudTag>
          </View>

          <ActivePokemonCard
            pokemon={oppActive}
            trainerName={opponent?.nickname ?? "OPPONENT"}
            isMine={false}
            isActiveTurn={isOppTurn}
            isBeingHit={oppBeingHit}
            hitTick={lastEvent}
            aliveCount={oppAlive}
            totalCount={oppTeam.length}
          />
          <Panel style={styles.benchPanel}>
            <BenchRow bench={oppBench} isMine={false} />
          </Panel>

          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.magenta }]}
            />
            <View style={styles.vs}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.cyan }]}
            />
          </View>

          <ActivePokemonCard
            pokemon={myActive}
            trainerName={me?.nickname ? `${me.nickname} (YOU)` : "YOU"}
            isMine
            isActiveTurn={isMyTurn}
            isBeingHit={myBeingHit}
            hitTick={lastEvent}
            aliveCount={myAlive}
            totalCount={myTeam.length}
            actionSlot={
              myActive ? (
                <StadiumButton
                  variant="primary"
                  pulse={isMyTurn && !attackPending && !battleOver}
                  disabled={attackDisabled}
                  onPress={attack}
                >
                  {attackLabel}
                </StadiumButton>
              ) : undefined
            }
          />
          <Panel style={styles.benchPanel}>
            <BenchRow bench={myBench} isMine />
          </Panel>

          <Panel>
            <View style={styles.logHeader}>
              <StencilLabel color={colors.yellow}>▼ Battle Log</StencilLabel>
              <Text style={styles.logCount}>{battleLog.length} entries</Text>
            </View>
            <ScrollView
              ref={logRef}
              style={styles.logScroll}
              nestedScrollEnabled
            >
              {battleLog.length === 0 && (
                <Text style={styles.logEmpty}>▸ Waiting for first hit…</Text>
              )}
              {battleLog.map((line, i) => (
                <Text key={`${i}-${line}`} style={styles.logLine}>
                  <Text style={styles.logIndex}>
                    [{String(i + 1).padStart(2, "0")}]{" "}
                  </Text>
                  {line}
                </Text>
              ))}
            </ScrollView>
          </Panel>
        </ScrollView>
      </SafeAreaView>
      <ScanlineOverlay />
    </BattleBackground>
  );
}

function activeOf(team: PokemonState[]): PokemonState | null {
  return team.find((p) => !p.defeated) ?? null;
}
function benchOf(
  team: PokemonState[],
  active: PokemonState | null,
): PokemonState[] {
  if (!active) return team;
  return team.filter((p) => p !== active);
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 12, gap: 12, paddingBottom: 32 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 4,
  },
  headerLeft: { flex: 1, gap: 4 },
  round: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  roundLabel: { color: colors.textWhite },
  roundValue: { color: colors.yellow },
  benchPanel: { paddingVertical: 12 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  dividerLine: { flex: 1, height: 2 },
  vs: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.yellow,
    backgroundColor: colors.base,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    fontFamily: fonts.display,
    color: colors.yellow,
    fontSize: 16,
    letterSpacing: 2,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logCount: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  logScroll: { maxHeight: 140 },
  logEmpty: { fontFamily: fonts.mono, color: colors.textGhost, fontSize: 12 },
  logLine: {
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(31,37,71,0.4)",
  },
  logIndex: { color: colors.cyan },
});
