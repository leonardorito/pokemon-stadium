import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useBackendUrl } from "@/hooks/useBackendUrl";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isHydrated } = useBackendUrl();

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
