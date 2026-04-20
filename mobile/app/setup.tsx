import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BattleBackground } from "@/components/BattleBackground";
import { Panel } from "@/components/Panel";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { StadiumButton } from "@/components/StadiumButton";
import { StencilLabel } from "@/components/StencilLabel";
import {
  DEFAULT_BACKEND_URL,
  LOCALHOST_BACKEND_URL,
} from "@/constants/config";
import { colors, fonts } from "@/constants/theme";
import { useBackendUrl } from "@/hooks/useBackendUrl";

export default function SetupScreen() {
  const router = useRouter();
  const { url: storedUrl, setUrl } = useBackendUrl();
  const [input, setInput] = useState(storedUrl ?? DEFAULT_BACKEND_URL);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const trimmed = input.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      setError("URL must start with http:// or https://");
      return;
    }
    setUrl(trimmed);
    router.replace("/");
  };

  return (
    <BattleBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.container}>
            <View style={styles.heading}>
              <StencilLabel color={colors.magenta}>
                ▒ Step 01 / Stadium uplink
              </StencilLabel>
              <Text style={styles.titleTop}>Wire the</Text>
              <Text style={styles.titleBottom}>Booth.</Text>
              <Text style={styles.subtitle}>
                Choose which backend this app should connect to.
              </Text>
            </View>

            <Panel>
              <StencilLabel color={colors.cyan}>▼ Backend URL</StencilLabel>
              <TextInput
                value={input}
                onChangeText={(v) => {
                  setInput(v);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://example.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                style={styles.input}
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <Pressable
                onPress={() => {
                  setInput(LOCALHOST_BACKEND_URL);
                  setError(null);
                }}
                style={styles.localBtn}
              >
                <Text style={styles.localBtnText}>▸ Use localhost</Text>
              </Pressable>
            </Panel>

            <View style={styles.saveWrap}>
              <StadiumButton variant="cyan" onPress={handleSave}>
                Save & Continue ▸
              </StadiumButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <ScanlineOverlay />
    </BattleBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32, gap: 24 },
  heading: { gap: 12 },
  titleTop: {
    fontFamily: fonts.display,
    color: colors.textWhite,
    fontSize: 38,
    letterSpacing: 1.6,
    lineHeight: 38,
  },
  titleBottom: {
    fontFamily: fonts.display,
    color: colors.cyan,
    fontSize: 38,
    letterSpacing: 1.6,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: fonts.mono,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  input: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.edge,
    backgroundColor: colors.deep,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.mono,
    color: colors.yellow,
    fontSize: 16,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.mono,
    color: colors.magenta,
    fontSize: 12,
  },
  localBtn: { marginTop: 12, alignSelf: "flex-start" },
  localBtnText: {
    fontFamily: fonts.mono,
    color: colors.cyan,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  saveWrap: { alignItems: "center" },
});
