// client-user/src/shared/store/authStore.js

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      login: async (token, user, refreshToken) => {
        try {
          await SecureStore.setItemAsync("dbe_refresh_token", refreshToken);
          set({
            token,
            user,
            refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Error storing refresh token:", error);
        }
      },

      logout: async () => {
        try {
          await SecureStore.deleteItemAsync("dbe_refresh_token");
        } catch (error) {
          console.error("Error deleting refresh token:", error);
        }
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      // Usado por el interceptor de refresh: actualiza accessToken y,
      // si el backend rotó el refreshToken, también lo persiste en SecureStore.
      setTokens: async (accessToken, refreshToken) => {
        try {
          if (refreshToken && refreshToken !== get().refreshToken) {
            await SecureStore.setItemAsync("dbe_refresh_token", refreshToken);
          }
        } catch (error) {
          console.error("Error storing refresh token:", error);
        }
        set((state) => ({
          token: accessToken,
          refreshToken: refreshToken || state.refreshToken,
        }));
      },

      setAccessToken: (token) => {
        set({ token });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates },
        }));
      },
    }),
    {
      name: "auth-DBE-user",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Usar el setter para que Zustand dispare re-renders correctamente
        state?.setHasHydrated(true);
      },
    }
  )
);