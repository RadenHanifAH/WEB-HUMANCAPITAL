import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

function Reset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ toast style seperti Daftar.jsx
  const toastSuccess = (message) =>
    toast.success(message, {
      style: { borderLeft: "6px solid #22c55e" },
      iconTheme: { primary: "#22c55e", secondary: "#fff" },
    });

  const toastError = (message) =>
    toast.error(message, {
      style: { borderLeft: "6px solid #ef4444" },
      iconTheme: { primary: "#ef4444", secondary: "#fff" },
    });

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ mencegah reload form

    if (!email.trim()) {
      toastError("Email wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/auth/password-reset/request", { email });

      // ✅ Email ada / request sukses
      toastSuccess("Link reset password telah dikirim ke email kamu.");
      setEmail("");
    } catch (err) {
      const msg = err?.response?.data?.message || "";

      // ✅ Email tidak ada (sesuaikan jika backend kamu pakai message lain)
      const lower = msg.toLowerCase();
      if (
        lower.includes("email tidak ditemukan") ||
        lower.includes("email not found") ||
        lower.includes("not found")
      ) {
        toastError("Email tidak ditemukan");
        return;
      }

      // fallback error lain
      toastError(msg || "Gagal mengirim reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100vh)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/60 via-blue-400/50 to-blue-500/50 blur-3xl opacity-40 pointer-events-none" />

      <div className="relative h-full flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md sm:max-w-xl bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 transform -translate-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center sm:text-left">
            Lupa Password
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center sm:text-left">
            Masukkan email anda yang terdaftar untuk me-reset password.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none mb-4 text-sm sm:text-base"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-2.5 md:px-6 md:py-3 
              bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 
              text-white rounded-lg text-sm md:text-base font-semibold 
              flex items-center justify-center transition shadow-lg transform active:scale-95 disabled:opacity-60"
            >
              {loading ? "Mengirim..." : "Kirim"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Ingat Password?{" "}
            <a
              href="/login"
              className="text-sm font-medium text-sky-800 hover:underline"
            >
              Masuk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Reset;
