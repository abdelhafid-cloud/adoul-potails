import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setHasHydrated: (value: boolean) => void;
}

function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function readStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function writeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setAuth: (user, accessToken, refreshToken) => {
        writeTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearTokens();
        set({ user: null, accessToken: null, refreshToken: null });
      },
      isAuthenticated: () => {
        const { accessToken } = get();
        return !!(accessToken || readStoredAccessToken());
      },
    }),
    {
      name: "adoul-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state && typeof window !== "undefined") {
          const storedAccess = readStoredAccessToken();
          const storedRefresh = readStoredRefreshToken();
          if (storedAccess && !state.accessToken) {
            state.accessToken = storedAccess;
            state.refreshToken = storedRefresh;
          } else if (state.accessToken && !storedAccess) {
            writeTokens(state.accessToken, state.refreshToken || "");
          }
        }
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);

/** Attend la réhydratation Zustand avant de décider de l'état connecté. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return {
    user,
    isReady: hasHydrated,
    isAuthenticated: hasHydrated ? isAuthenticated() : false,
  };
}
