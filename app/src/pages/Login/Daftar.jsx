// src/pages/auth/Daftar.jsx
import React, { useMemo, useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  IdCard,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import Logo from "../../assets/perusahaan1.png";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

function Daftar() {
  const navigate = useNavigate();

  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    noHp: "",
    email: "",
    password: "",
    konfirmasiPassword: "",
    setuju: false,
  });

  const [otp, setOtp] = useState("");
  const otpValid = useMemo(() => /^\d{6}$/.test(otp), [otp]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",.<>/?\\|`~]).{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

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

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(formData.password)) {
      const msg =
        "Password harus mengandung minimal 8 karakter, 1 huruf besar, 1 angka, dan 1 simbol.";
      setError(msg);
      toastError(msg);
      return;
    }

    if (formData.password !== formData.konfirmasiPassword) {
      const msg = "Konfirmasi password tidak cocok.";
      setError(msg);
      toastError(msg);
      return;
    }

    if (!formData.setuju) {
      const msg = "Anda harus menyetujui pernyataan kebenaran data.";
      setError(msg);
      toastError(msg);
      return;
    }

    setLoading(true);
    try {
      // ✅ Persis nama field yang dibaca auth.controller.js -> register():
      // const { nama, email, password, nik, nomor_hp } = req.body;
      const res = await axiosInstance.post("/auth/register", {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        nik: formData.nik,
        nomor_hp: formData.noHp,
      });

      toastSuccess(res?.data?.message || "OTP sudah dikirim ke email kamu.");
      setStep("otp");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Terjadi kesalahan pada server";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpValid) {
      const msg = "OTP harus 6 digit angka.";
      setError(msg);
      toastError(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });

      toastSuccess(
        res?.data?.message || "Email berhasil diverifikasi. Silakan login.",
      );
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const msg = err.response?.data?.message || "OTP salah / kadaluarsa.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/resend-otp", {
        email: formData.email,
      });
      toastSuccess(res?.data?.message || "OTP baru sudah dikirim.");
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mengirim ulang OTP.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = useMemo(() => {
    const email = formData.email || "";
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    const safeUser =
      user.length <= 2 ? user[0] + "*" : user.slice(0, 2) + "***";
    return `${safeUser}@${domain}`;
  }, [formData.email]);

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/50 via-blue-400/40 to-blue-500/50 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-md bg-white/30 pointer-events-none" />

      <div className="relative flex items-center justify-center min-h-screen py-10">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden m-6 lg:m-8 min-h-[130vh]">
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white/40 p-10">
            <img
              src={Logo}
              alt="Logo Perusahaan"
              className="w-full h-auto max-h-[85%] object-contain rounded-xl shadow-lg"
            />
          </div>

          <div className="w-full lg:w-1/2 p-6 sm:p-10 flex justify-center items-center">
            <div
              className="w-full max-w-md h-full overflow-y-auto lg:overflow-visible"
              style={{ maxHeight: "calc(120vh - 80px)" }}
            >
              {step === "form" && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center lg:text-left">
                    Hai, Selamat Datang!
                  </h2>
                  <p className="text-gray-700 mb-6 text-center lg:text-left text-sm sm:text-base">
                    Silakan daftar untuk membuat akun anda.
                  </p>

                  <form onSubmit={handleSubmitRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          name="nama"
                          value={formData.nama}
                          onChange={handleChange}
                          placeholder="Nama Anda"
                          required
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        NIK <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <IdCard
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="text"
                          name="nik"
                          value={formData.nik}
                          onChange={handleChange}
                          placeholder="Masukkan NIK Anda"
                          required
                          maxLength="16"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        No. HP <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="tel"
                          name="noHp"
                          value={formData.noHp}
                          onChange={handleChange}
                          placeholder="08xxxxxxxxxx"
                          required
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="nama@gmail.com"
                          required
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Masukkan password"
                          required
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Konfirmasi Password{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="konfirmasiPassword"
                          value={formData.konfirmasiPassword}
                          onChange={handleChange}
                          placeholder="Ulangi password"
                          required
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 mt-3">
                      <input
                        type="checkbox"
                        name="setuju"
                        checked={formData.setuju}
                        onChange={handleChange}
                        className="mt-1 accent-sky-700"
                      />
                      <label className="text-sm text-gray-700 leading-snug">
                        Dengan ini saya menyatakan bahwa seluruh data dan/atau
                        informasi yang saya sampaikan adalah benar.
                      </label>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 font-medium">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 text-white rounded-lg text-sm sm:text-base font-semibold transition shadow-md transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Memproses..." : "Daftar"}
                    </button>

                    <p className="text-sm text-gray-700 text-center mt-3">
                      Sudah memiliki akun?{" "}
                      <Link
                        to="/login"
                        className="text-sky-800 font-semibold hover:underline"
                      >
                        Masuk disini
                      </Link>
                    </p>
                  </form>
                </>
              )}

              {step === "otp" && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center lg:text-left">
                    Verifikasi Email
                  </h2>
                  <p className="text-gray-700 mb-6 text-center lg:text-left text-sm sm:text-base">
                    Masukkan kode OTP 6 digit yang kami kirim ke{" "}
                    <span className="font-semibold">{maskedEmail}</span>.
                  </p>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Kode OTP <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={otp}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setOtp(val);
                            if (error) setError("");
                          }}
                          placeholder="Kode OTP"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-none tracking-widest text-center text-lg"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        OTP berlaku terbatas (mis. 5 menit). Jika tidak masuk,
                        cek spam.
                      </p>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 font-medium">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !otpValid}
                      className="w-full px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 text-white rounded-lg text-sm sm:text-base font-semibold transition shadow-md transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Memverifikasi..." : "Verifikasi"}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="text-gray-600 hover:text-gray-900 hover:underline"
                        disabled={loading}
                      >
                        Ubah email
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sky-800 font-semibold hover:underline disabled:opacity-60"
                        disabled={loading}
                      >
                        Kirim ulang OTP
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Daftar;