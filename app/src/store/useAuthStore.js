import { create } from "zustand";
import axios from "../api/axiosInstance";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  setUser: (user) => set({ user }),

  signup: async ({ name, email, nik, noHp, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Password do not match");
    }

    try {
      const res = await axios.post("/auth/register", {
        name,
        email,
        password,
        noHp,
        nik,
      });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      toast.error(error.response.data.message || "An error occured");
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occured during logout"
      );
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
      error.response?.data?.message;
    }
  },
}));

export default useAuthStore;
