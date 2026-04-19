import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BACKEND_URL_STORAGE_KEY } from "@/constants/config";

interface ConfigState {
  backendUrl: string | null;
  isHydrated: boolean;
  setBackendUrl: (url: string) => void;
  clearBackendUrl: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      backendUrl: null,
      isHydrated: false,
      setBackendUrl: (url) => set({ backendUrl: url }),
      clearBackendUrl: () => set({ backendUrl: null }),
    }),
    {
      name: BACKEND_URL_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ backendUrl: state.backendUrl }),
    },
  ),
);

useConfigStore.persist.onFinishHydration(() => {
  useConfigStore.setState({ isHydrated: true });
});
