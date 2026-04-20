import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BattleBackground } from "@/components/BattleBackground";
import { HudTag } from "@/components/HudTag";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { StadiumButton } from "@/components/StadiumButton";
import { StencilLabel } from "@/components/StencilLabel";
import { colors, fonts } from "@/constants/theme";
import { useBackendUrl } from "@/hooks/useBackendUrl";

export default function Index() {
  const router = useRouter();
  const { url, isHydrated } = useBackendUrl();
  if (!isHydrated) return null;
  if (!url) return <Redirect href="/setup" />;

  return (
    <BattleBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.container}>
          <View style={styles.heading}>
            <StencilLabel color={colors.cyan}>
              ▒ Welcome to the broadcast booth
            </StencilLabel>
            <View style={styles.titleBlock}>
              <Text style={styles.titleTop}>Pokémon</Text>
              <Text style={styles.titleBottom}>Stadium Lite</Text>
            </View>
            <Text style={styles.tagline}>
              A real-time Pokémon battle arena.
            </Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.statusWrap}>
              <HudTag color={colors.lime}>● ONLINE</HudTag>
            </View>
            <View style={styles.urlWrap}>
              <Text style={styles.urlLabel}>▸ Connected to</Text>
              <Text style={styles.urlValue} numberOfLines={1} ellipsizeMode="middle">
                {url}
              </Text>
            </View>
            <StadiumButton
              variant="primary"
              pulse
              onPress={() => router.push("/lobby")}
            >
              Battle Now ▸
            </StadiumButton>
            <StadiumButton variant="ghost" onPress={() => router.push("/setup")}>
              Edit Backend URL
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
    paddingHorizontal: 24,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 40,
  },
  heading: { alignItems: "center", gap: 18 },
  titleBlock: { alignItems: "center" },
  titleTop: {
    fontFamily: fonts.display,
    color: colors.textWhite,
    fontSize: 56,
    letterSpacing: 2.2,
    lineHeight: 56,
  },
  titleBottom: {
    fontFamily: fonts.display,
    color: colors.yellow,
    fontSize: 56,
    letterSpacing: 2.2,
    lineHeight: 56,
  },
  tagline: {
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },
  actions: { alignItems: "center", gap: 16, alignSelf: "stretch" },
  statusWrap: { alignItems: "center" },
  urlWrap: { alignItems: "center", gap: 4, paddingHorizontal: 16 },
  urlLabel: {
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  urlValue: {
    fontFamily: fonts.mono,
    color: colors.cyan,
    fontSize: 12,
    maxWidth: 320,
    textAlign: "center",
  },
});
