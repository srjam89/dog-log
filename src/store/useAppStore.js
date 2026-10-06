import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      session: null,
      isAuthLoading: true,
      activeDog: null,
      activeDogId: null,
      themeMode: "system",
      setSession: (session) =>
        set((state) => {
          const previousUserId = state.session?.user?.id ?? null;
          const nextUserId = session?.user?.id ?? null;
          if (!session || previousUserId !== nextUserId) {
            return { session, activeDog: null, activeDogId: null };
          }
          return { session };
        }),
      clearSession: () =>
        set({ session: null, activeDog: null, activeDogId: null }),
      setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
      setActiveDog: (activeDog) =>
        set({
          activeDog: activeDog || null,
          activeDogId: activeDog?.id || null,
        }),
      clearActiveDog: () => set({ activeDog: null, activeDogId: null }),
      setActiveDogId: (activeDogId) => set({ activeDogId }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: "pawjournal-app",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => ({
        themeMode: persistedState?.themeMode ?? "system",
      }),
      partialize: ({ themeMode }) => ({ themeMode }),
    },
  ),
);
