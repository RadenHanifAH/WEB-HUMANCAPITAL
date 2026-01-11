import { create } from "zustand";
import axios from "../api/axiosInstance";
import { toast } from "react-hot-toast";

const pickUser = (res) => res?.data?.user || res?.data?.data?.user || res?.data?.data || res?.data || null;

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  setUser: (user) => set({ user }),

  signup: async ({
    name,
    email,
    password,
    confirmPassword,
    nik,
    noHp,
    NIK,
    nomorHp,
  }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Password tidak sama");
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        NIK: NIK || nik,
        nomorHp: nomorHp || noHp,
      };

      const res = await axios.post("/auth/register", payload);
      const user = pickUser(res);

      set({ user, loading: false });
      toast.success("Daftar berhasil");
      return user;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Terjadi kesalahan");
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      const user = pickUser(res);

      set({ user, loading: false });
      toast.success("Login berhasil");
      return user;
    } catch (error) {
      set({ loading: false });
      toast.error(error?.response?.data?.message || "Login gagal");
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Logout berhasil");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal logout");
    }
  },

  /**
   * ✅ checkAuth behavior:
   * - Guest (belum login): profile 401 "No access token provided" => silent, user null
   * - Token expired/invalid: coba refresh => kalau gagal (no refresh token) silent
   * - Error selain auth => console.error
   */
checkAuth: async () => {
  set({ checkingAuth: true });

  try {
    const res = await axios.get("/auth/profile");
    set({
      user: res.data?.data || res.data?.user || res.data || null,
      checkingAuth: false,
    });
    return;
  } catch (error) {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message;

    // ✅ guest: normal
    if (status === 401 && msg === "Unauthorized - No access token provided") {
      set({ user: null, checkingAuth: false });
      return;
    }

    // ✅ token expired/invalid -> coba refresh
    if (status === 401) {
      try {
        await axios.post("/auth/refresh-token");
        const res2 = await axios.get("/auth/profile");
        set({
          user: res2.data?.data || res2.data?.user || res2.data || null,
          checkingAuth: false,
        });
        return;
      } catch (e2) {
        const st2 = e2?.response?.status;
        const msg2 = e2?.response?.data?.message;

        // ✅ guest: normal
        if (st2 === 400 && msg2 === "No refresh token provided") {
          set({ user: null, checkingAuth: false });
          return;
        }

        // ✅ refresh gagal => anggap logout
        set({ user: null, checkingAuth: false });
        return;
      }
    }

    // ✅ selain 401 -> error beneran
    set({ user: null, checkingAuth: false });
  }
},

}));

export default useAuthStore;
