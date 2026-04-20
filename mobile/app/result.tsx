import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BattleBackground } from "@/components/BattleBackground";
import { PokemonSprite } from "@/components/PokemonSprite";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { StadiumButton } from "@/components/StadiumButton";
import { StencilLabel } from "@/components/StencilLabel";
import { colors, fonts } from "@/constants/theme";
import { useBattleStore } from "@/store/battleStore";
import { useLobbyStore } from "@/store/lobbyStore";
import { spriteFor } from "@/utils/sprites";

export default function ResultScreen() {
  const router = useRouter();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const winnerId = useBattleStore((s) => s.winnerId);
  const winnerNickname = useBattleStore((s) => s.winnerNickname);
  const teams = useBattleStore((s) => s.teams);
  const battleOver = useBattleStore((s) => s.battleOver);
  const playAgain = useBattleStore((s) => s.playAgain);

  useEffect(() => {
    if (!battleOver && !winnerNickname) router.replace("/");
  }, [battleOver, winnerNickname, router]);

  const champion = useMemo(() => {
    if (!winnerId) return null;
    const team = teams[winnerId] ?? [];
    return team.find((p) => !p.defeated) ?? team[0] ?? null;
  }, [winnerId, teams]);

  const iWon = !!winnerId && winnerId === myPlayerId;
  const accentColor = iWon ? colors.lime : colors.magenta;

  // Pulse opacity, NOT textShadowRadius. textShadowRadius animation via Reanimated
  // is silently no-op on Android (works on iOS), so the glow looks dead on Android.
  // Static text-shadow gives the glow halo; opacity pulse gives the rhythm.
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + glow.value * 0.3,
  }));

  const onPlayAgain = () => {
    playAgain();
    router.replace("/");
  };

  return (
    <BattleBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <StencilLabel color={accentColor}>▒ Final Bell</StencilLabel>
          {champion && (
            <PokemonSprite
              uri={spriteFor(champion, "front")}
              size={160}
              animation="bob"
            />
          )}
          <Text style={styles.winner} numberOfLines={1}>
            {winnerNickname ?? "STADIUM"}
          </Text>
          <Animated.Text
            style={[
              styles.outcome,
              { color: accentColor, textShadowColor: accentColor },
              glowStyle,
            ]}
          >
            {iWon ? "VICTORY" : "KNOCKOUT"}
          </Animated.Text>
          <View style={styles.btnWrap}>
            <StadiumButton
              variant={iWon ? "lime" : "magenta"}
              pulse
              onPress={onPlayAgain}
            >
              Play Again ↺
            </StadiumButton>
          </View>
        </View>
      </SafeAreaView>
      <ScanlineOverlay />
    </BattleBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  winner: {
    fontFamily: fonts.display,
    color: colors.textWhite,
    fontSize: 36,
    letterSpacing: 3.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  // Static text-shadow (not animated) — provides the glow halo. Opacity pulse handles the breathing.
  outcome: {
    fontFamily: fonts.pixel,
    fontSize: 24,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  btnWrap: { marginTop: 16 },
});
