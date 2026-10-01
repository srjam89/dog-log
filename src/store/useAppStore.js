import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      session: null,
      isAuthLoading: true,
      activeDog: null,
      activeDogId: null,
      themeMode: 'system',
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
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
      name: 'pawjournal-app',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ themeMode, activeDog, activeDogId }) => ({
        themeMode,
        activeDog,
        activeDogId,
      }),
    },
  ),
);
