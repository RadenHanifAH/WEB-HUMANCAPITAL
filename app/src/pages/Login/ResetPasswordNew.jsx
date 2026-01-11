import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import axios from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function ResetPasswordNew() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password) => {
    // minimal 8, 1 huruf besar, 1 angka, 1 simbol
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",.<>/?\\|`~]).{8,}$/;
    return regex.test(password);
  };

  // ✅ helper toast style seperti Daftar.jsx
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

  const submit = async (e) => {
    e.preventDefault();

    const ruleMsg =
      "Password harus mengandung minimal 8 karakter, 1 huruf besar, 1 angka, dan 1 simbol.";

    if (!validatePassword(newPassword)) {
      toastError(ruleMsg);
      return;
    }

    if (newPassword !== confirm) {
      toastError("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/auth/password-reset/confirm", {
        token,
        newPassword,
      });

      toastSuccess("Password berhasil direset. Silakan login.");

      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      toastError(err?.response?.data?.message || "Reset gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      {/* background sama seperti Daftar.jsx */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/50 via-blue-400/40 to-blue-500/50 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-md bg-white/30 pointer-events-none" />

      <div className="relative flex items-center justify-center min-h-screen py-10 px-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center">
            Buat Password Baru
          </h2>
          <p className="text-gray-700 mb-6 text-center text-sm sm:text-base">
            Masukkan password baru kamu. Pastikan sesuai aturan keamanan.
          </p>

          <form onSubmit={submit} className="space-y-4">
            {/* Password baru */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password Baru <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Masukkan password baru"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-600">
                Password harus mengandung minimal 8 karakter, 1 huruf
                besar, 1 angka, dan 1 simbol.
              </p>
            </div>

            {/* Konfirmasi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Konfirmasi Password <span className="text-red-600">*</span>
              </label>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full px-5 py-2.5 sm:px-6 sm:py-3 
                bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 
                text-white rounded-lg text-sm sm:text-base font-semibold 
                transition shadow-md transform active:scale-95 disabled:opacity-60"
            >
              {loading ? "Menyimpan..." : "Simpan Password"}
            </button>

            <p className="text-sm text-gray-700 text-center mt-3">
              Kembali ke{" "}
              <Link
                to="/login"
                className="text-sky-800 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
