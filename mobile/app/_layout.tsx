import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import {
  Bungee_400Regular,
  useFonts as useBungee,
} from "@expo-google-fonts/bungee";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  useFonts as useMono,
} from "@expo-google-fonts/jetbrains-mono";
import {
  PressStart2P_400Regular,
  useFonts as usePixel,
} from "@expo-google-fonts/press-start-2p";
import { colors } from "@/constants/theme";
import { useBackendUrl } from "@/hooks/useBackendUrl";
import { useReconnect } from "@/hooks/useReconnect";
import { useSocket } from "@/hooks/useSocket";
import { useLobbyStore } from "@/store/lobbyStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [bungeeOk] = useBungee({ Bungee_400Regular });
  const [monoOk] = useMono({ JetBrainsMono_400Regular, JetBrainsMono_700Bold });
  const [pixelOk] = usePixel({ PressStart2P_400Regular });
  const fontsLoaded = bungeeOk && monoOk && pixelOk;

  const { isHydrated: isConfigHydrated } = useBackendUrl();
  const isLobbyHydrated = useLobbyStore((s) => s.isHydrated);

  // Order matters: useSocket registers event listeners first so that any
  // join_lobby emitted by useReconnect's initial-recovery effect can be
  // handled by the registered `joined` listener.
  useSocket();
  useReconnect();

  useEffect(() => {
    if (fontsLoaded && isConfigHydrated && isLobbyHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isConfigHydrated, isLobbyHydrated]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.base }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.base },
        }}
      />
    </View>
  );
}
