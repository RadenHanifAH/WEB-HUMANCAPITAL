import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,

      setUser: (userData) => set({ user: userData }),

      login: (userData) => {
        set({ user: userData });
        localStorage.setItem("token", userData.token || "");
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null });
      },
    }),
    {
      name: "auth-storage", // simpan di localStorage
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;
