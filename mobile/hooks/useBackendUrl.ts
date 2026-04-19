import { useConfigStore } from "@/store/configStore";

interface UseBackendUrlResult {
  url: string | null;
  isHydrated: boolean;
  setUrl: (url: string) => void;
  clearUrl: () => void;
}

export function useBackendUrl(): UseBackendUrlResult {
  const url = useConfigStore((s) => s.backendUrl);
  const isHydrated = useConfigStore((s) => s.isHydrated);
  const setUrl = useConfigStore((s) => s.setBackendUrl);
  const clearUrl = useConfigStore((s) => s.clearBackendUrl);

  return { url, isHydrated, setUrl, clearUrl };
}
