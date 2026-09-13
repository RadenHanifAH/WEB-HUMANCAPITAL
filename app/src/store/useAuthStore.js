import { create } from "zustand";
import axios from "../api/axiosInstance";
import { toast } from "react-hot-toast";

const pickUser = (res) =>
  res?.data?.user ||
  res?.data?.data?.user ||
  res?.data?.data ||
  res?.data ||
  null;

const LOGGED_OUT_FLAG = "isLoggedOut";
const ACCESS_TOKEN_KEY = "accessToken";

const useAuthStore = create((set) => ({
  user: null,
  // ✅ FIX: token sekarang jadi bagian dari state, di-hydrate dari
  // localStorage saat store pertama kali dibuat, supaya komponen yang
  // membaca `useAuthStore((s) => s.token)` (mis. LamaranSayaSection.jsx)
  // benar-benar mendapat nilainya, bukan selalu undefined.
  token: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
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
      // ⚠️ FIX: backend (auth.controller.js -> register) sekarang membaca
      // body dengan nama kolom Prisma persis: { nama, email, password,
      // nik, nomor_hp } — bukan lagi { name, NIK, nomorHp }. Semua
      // parameter & fallback lama (NIK||nik, nomorHp||noHp) dipertahankan,
      // hanya KEY yang dikirim ke backend yang disesuaikan.
      const payload = {
        nama: name,
        email,
        password,
        nik: NIK || nik,
        nomor_hp: nomorHp || noHp,
      };

      const res = await axios.post("/auth/register", payload);
      const user = pickUser(res);

      // ✅ user baru register/login -> hapus flag logout
      localStorage.removeItem(LOGGED_OUT_FLAG);

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
      const res = await axios.post("/auth/login", {
        email,
        password,
      });

      const user = res.data.user;
      const token = res.data.accessToken; // ✅ FIX: ambil token dari response

      localStorage.setItem(ACCESS_TOKEN_KEY, token);

      // ✅ login berhasil -> hapus flag logout
      localStorage.removeItem(LOGGED_OUT_FLAG);

      set({
        user,
        token, // ✅ FIX: simpan token ke state juga, bukan cuma localStorage
        loading: false,
      });

      toast.success("Login berhasil");

      return {
        success: true,
        user,
      };
    } catch (error) {
      set({ loading: false });

      toast.error(error?.response?.data?.message || "Login gagal");

      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");

      // ✅ tandai bahwa user memang sengaja logout
      localStorage.setItem(LOGGED_OUT_FLAG, "true");
      localStorage.removeItem(ACCESS_TOKEN_KEY);

      set({ user: null, token: null }); // ✅ FIX: reset token juga
      toast.success("Logout berhasil");
    } catch (error) {
      // tetap tandai logout di client meski request ke server gagal,
      // supaya checkAuth tidak auto-login lagi
      localStorage.setItem(LOGGED_OUT_FLAG, "true");
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      set({ user: null, token: null }); // ✅ FIX: reset token juga
      toast.error(error?.response?.data?.message || "Gagal logout");
    }
  },

  /**
   * ✅ checkAuth behavior:
   * - Kalau user baru saja logout (flag ada di localStorage) -> jangan coba refresh sama sekali
   * - Guest (belum login): profile 401 "No access token provided" => silent, user null
   * - Token expired/invalid: coba refresh => kalau gagal (no refresh token) silent
   * - Error selain auth => console.error
   */
  checkAuth: async () => {
    // ✅ kalau user memang baru logout, jangan coba auto-login lewat refresh
    if (localStorage.getItem(LOGGED_OUT_FLAG) === "true") {
      set({ user: null, token: null, checkingAuth: false });
      return;
    }

    set({ checkingAuth: true });

    try {
      const res = await axios.get("/auth/profile");
      set({
        user: res.data?.data || res.data?.user || res.data || null,
        // ✅ FIX: sinkronkan token dari localStorage saat checkAuth berhasil,
        // untuk kasus reload halaman (token sudah ada dari sesi sebelumnya)
        token: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
        checkingAuth: false,
      });
      return;
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;

      // ✅ guest: normal
      if (status === 401 && msg === "Unauthorized - No access token provided") {
        set({ user: null, token: null, checkingAuth: false });
        return;
      }

      // ✅ token expired/invalid -> coba refresh
      if (status === 401) {
        try {
          const refreshRes = await axios.post("/auth/refresh-token");
          const res2 = await axios.get("/auth/profile");

          // ✅ FIX: kalau endpoint refresh mengembalikan accessToken baru,
          // simpan juga ke localStorage & state
          const newToken =
            refreshRes?.data?.accessToken || localStorage.getItem(ACCESS_TOKEN_KEY) || null;
          if (refreshRes?.data?.accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, refreshRes.data.accessToken);
          }

          set({
            user: res2.data?.data || res2.data?.user || res2.data || null,
            token: newToken,
            checkingAuth: false,
          });
          return;
        } catch (e2) {
          const st2 = e2?.response?.status;
          const msg2 = e2?.response?.data?.message;

          // ✅ guest: normal
          if (st2 === 400 && msg2 === "No refresh token provided") {
            set({ user: null, token: null, checkingAuth: false });
            return;
          }

          // ✅ refresh gagal => anggap logout
          set({ user: null, token: null, checkingAuth: false });
          return;
        }
      }

      // ✅ selain 401 -> error beneran
      set({ user: null, token: null, checkingAuth: false });
    }
  },
}));

export default useAuthStore;