import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBackendUrl } from "@/hooks/useBackendUrl";

export default function Index() {
  const router = useRouter();
  const { url, isHydrated } = useBackendUrl();

  if (!isHydrated) return null;
  if (!url) return <Redirect href="/setup" />;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Pokémon Stadium Lite</Text>
        <Text style={styles.subtitle}>Mobile</Text>
        <Text style={styles.urlLabel}>Connected to:</Text>
        <Text style={styles.url} numberOfLines={1}>
          {url}
        </Text>
        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/setup")}
        >
          <Text style={styles.editButtonText}>Edit backend URL</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: "600" },
  subtitle: { fontSize: 16, opacity: 0.6, marginBottom: 16 },
  urlLabel: { fontSize: 12, color: "#666", marginTop: 24 },
  url: { fontSize: 14, color: "#225", maxWidth: "100%" },
  editButton: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#225",
  },
  editButtonText: { color: "#225", fontSize: 14, fontWeight: "500" },
});
