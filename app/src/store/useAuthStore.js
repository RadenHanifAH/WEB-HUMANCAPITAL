import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      hasHydrated: false, // State untuk melacak apakah rehidrasi sudah selesai

      setUser: (data) => set({ user: data }),

      login: ({ user, token }) => {
        set({ user, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "auth-storage", // Nama kunci di localStorage
      getStorage: () => localStorage,

      onRehydrateStorage: () => (state) => {
        // Callback yang dipanggil setelah rehidrasi selesai
        state.setHydrated();
      },

      partialize: (state) => ({
        // Hanya user dan token yang disimpan secara persisten
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;