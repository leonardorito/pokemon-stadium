import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BattleBackground } from "@/components/BattleBackground";
import { HudTag } from "@/components/HudTag";
import { Panel } from "@/components/Panel";
import { PlayerPanel } from "@/components/PlayerPanel";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";
import { StadiumButton } from "@/components/StadiumButton";
import { StencilLabel } from "@/components/StencilLabel";
import { colors, fonts } from "@/constants/theme";
import { useBackendUrl } from "@/hooks/useBackendUrl";
import * as socketService from "@/services/socketService";
import { useBattleStore } from "@/store/battleStore";
import {
  selectMe,
  selectMyTeam,
  selectOpponent,
  selectOpponentTeam,
  useLobbyStore,
} from "@/store/lobbyStore";

export default function LobbyScreen() {
  const router = useRouter();
  const { url: backendUrl } = useBackendUrl();
  const myPlayerId = useLobbyStore((s) => s.myPlayerId);
  const myNickname = useLobbyStore((s) => s.myNickname);
  const code = useLobbyStore((s) => s.code);
  const status = useLobbyStore((s) => s.status);
  const players = useLobbyStore((s) => s.players);
  const me = useLobbyStore(selectMe);
  const opponent = useLobbyStore(selectOpponent);
  const myTeam = useLobbyStore(selectMyTeam);
  const opponentTeam = useLobbyStore(selectOpponentTeam);
  const setMyNickname = useLobbyStore((s) => s.setMyNickname);
  const setMyPlayerId = useLobbyStore((s) => s.setMyPlayerId);
  const joinLobby = useLobbyStore((s) => s.joinLobby);
  const assignPokemon = useLobbyStore((s) => s.assignPokemon);
  const ready = useLobbyStore((s) => s.ready);
  const lobbyReset = useLobbyStore((s) => s.reset);
  const setError = useLobbyStore((s) => s.setError);
  const battleOver = useBattleStore((s) => s.battleOver);
  const battleReset = useBattleStore((s) => s.reset);

  const [nick, setNick] = useState(myNickname);
  const [submitted, setSubmitted] = useState(false);

  const onExit = () => {
    // Disconnect the socket so the backend's disconnect handler runs leaveLobby
    // (the server has no explicit leave event). The socket instance is preserved
    // — re-joining via socketService.connect() reattaches with listeners intact.
    socketService.disconnect();
    setMyPlayerId(null);
    lobbyReset();
    battleReset();
    setSubmitted(false);
    router.replace("/");
  };

  useEffect(() => {
    if (status === "battling") router.replace("/battle");
  }, [status, router]);

  useEffect(() => {
    if (status === "finished" && battleOver) router.replace("/result");
  }, [status, battleOver, router]);

  const onSubmit = () => {
    const trimmed = nick.trim();
    if (!trimmed) {
      setError("Pick a trainer name first");
      return;
    }
    if (!backendUrl) {
      setError("Backend URL not configured");
      return;
    }
    setMyNickname(trimmed);
    try {
      socketService.connect(backendUrl);
    } catch {
      setError("Could not open the broadcast channel");
      return;
    }
    setSubmitted(true);
    joinLobby(trimmed);
  };

  if (!myPlayerId) {
    return (
      <BattleBackground>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.preContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.heading}>
                <StencilLabel color={colors.magenta}>
                  ▒ Step 02 / Trainer Identity
                </StencilLabel>
                <Text style={styles.titleTop}>Sign the</Text>
                <Text style={styles.titleBottom}>Roster.</Text>
                <Text style={styles.subtitle}>
                  Two trainers per arena. First in, first slot.
                </Text>
              </View>
              <Panel>
                <StencilLabel color={colors.cyan}>▼ Trainer Name</StencilLabel>
                <TextInput
                  value={nick}
                  onChangeText={setNick}
                  placeholder="ASH, MISTY, RED…"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  maxLength={20}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.input}
                />
                <Text style={styles.help}>
                  ▸ Trainer name is saved locally so you can rejoin
                </Text>
              </Panel>
              <View style={styles.actionWrap}>
                <StadiumButton
                  variant="cyan"
                  pulse={!submitted}
                  disabled={submitted}
                  onPress={onSubmit}
                >
                  {submitted ? "Waiting…" : "Take the Field ▸"}
                </StadiumButton>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <ScanlineOverlay />
      </BattleBackground>
    );
  }

  const myTeamAssigned = !!myTeam && myTeam.length > 0;
  const meReady = !!me?.isReady;
  const oppReady = !!opponent?.isReady;
  const directive = !myTeamAssigned
    ? "Roll a fresh team"
    : !meReady
      ? "Lock it in. Hit ready."
      : oppReady
        ? "Engaging arena…"
        : "Waiting on opponent.";

  return (
    <BattleBackground>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.postContainer}>
          <Pressable onPress={onExit} style={styles.exitBtn} hitSlop={12}>
            <Text style={styles.exitText}>← Exit Lobby</Text>
          </Pressable>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <StencilLabel color={colors.cyan}>▒ Lobby</StencilLabel>
              <Text style={styles.code}>{code ?? "— — — —"}</Text>
            </View>
            <View style={styles.headerRight}>
              <HudTag color={colors.magenta}>
                {players.length}/2 Trainers
              </HudTag>
              <HudTag color={colors.cyan}>{status ?? "—"}</HudTag>
            </View>
          </View>

          <PlayerPanel
            player={me ?? null}
            team={myTeam}
            accent="cyan"
            isMe
          />
          <PlayerPanel
            player={opponent ?? null}
            team={opponentTeam}
            accent="magenta"
            isMe={false}
          />

          <Panel>
            <StencilLabel color={colors.yellow}>▼ Your Move</StencilLabel>
            <Text style={styles.directive}>{directive}</Text>
            <Text style={styles.help}>
              ▸ Re-rolling overwrites your current squad.
            </Text>
            <View style={styles.actions}>
              <StadiumButton
                variant="magenta"
                disabled={meReady}
                onPress={assignPokemon}
              >
                {myTeamAssigned ? "Re-Roll ↻" : "Roll Team ▸"}
              </StadiumButton>
              <StadiumButton
                variant="lime"
                disabled={!myTeamAssigned || meReady}
                pulse={myTeamAssigned && !meReady}
                onPress={ready}
              >
                {meReady ? "Locked ✓" : "Ready ▸"}
              </StadiumButton>
            </View>
          </Panel>
        </ScrollView>
      </SafeAreaView>
      <ScanlineOverlay />
    </BattleBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  preContainer: {
    padding: 24,
    gap: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  postContainer: { padding: 16, gap: 16, paddingBottom: 32 },
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
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
  },
  input: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.edge,
    backgroundColor: colors.deep,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.display,
    color: colors.yellow,
    fontSize: 22,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  help: {
    marginTop: 12,
    fontFamily: fonts.mono,
    color: colors.textDim,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  actionWrap: { alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: { flex: 1, gap: 4 },
  headerRight: { gap: 6, alignItems: "flex-end" },
  code: {
    fontFamily: fonts.display,
    color: colors.yellow,
    fontSize: 32,
    letterSpacing: 3.2,
  },
  directive: {
    fontFamily: fonts.display,
    color: colors.textWhite,
    fontSize: 18,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginTop: 8,
  },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  exitBtn: { alignSelf: "flex-start", paddingVertical: 4 },
  exitText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.magenta,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
});
