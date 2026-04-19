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
import {
  DEFAULT_BACKEND_URL,
  LOCALHOST_BACKEND_URL,
} from "@/constants/config";
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
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Backend URL</Text>
          <Text style={styles.subtitle}>
            Choose which backend this app should connect to.
          </Text>

          <TextInput
            value={input}
            onChangeText={(value) => {
              setInput(value);
              if (error) setError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://example.com"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={styles.quickButton}
            onPress={() => {
              setInput(LOCALHOST_BACKEND_URL);
              setError(null);
            }}
          >
            <Text style={styles.quickButtonText}>Use localhost</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save & continue</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { color: "#c00", fontSize: 13 },
  quickButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#eef",
  },
  quickButtonText: { color: "#225", fontSize: 14, fontWeight: "500" },
  saveButton: {
    marginTop: 8,
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
