// src/pages/auth/Daftar.jsx
import React, { useState } from "react";
import { Mail, Lock, User, Phone, IdCard, Eye, EyeOff } from "lucide-react";
import Logo from "../../assets/perusahaan1.png";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

function Daftar() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    noHp: "",
    email: "",
    password: "",
    konfirmasiPassword: "",
    setuju: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // --- Validasi password ---
  const validatePassword = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",.<>/?\\|`~]).{8,}$/;
    return regex.test(password);
  };

  // --- Handle perubahan input ---
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  // --- Handle submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(formData.password)) {
      setError(
        "Password harus mengandung minimal 8 karakter, 1 huruf besar, 1 angka, dan 1 simbol."
      );
      return;
    }

    if (formData.password !== formData.konfirmasiPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (!formData.setuju) {
      setError("Anda harus menyetujui pernyataan kebenaran data.");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/register", {
        name: formData.nama,
        email: formData.email,
        password: formData.password,
        NIK: formData.nik,
        nomorHp: formData.noHp,
      });

      alert("Pendaftaran berhasil! Silakan login.");
      console.log("Response:", response.data);

      // ✅ Redirect ke halaman login
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan pada server");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden">
      {/* Background gradient blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/50 via-blue-400/40 to-blue-500/50 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-md bg-white/30 pointer-events-none" />

      {/* Container utama */}
      <div className="relative flex items-center justify-center min-h-screen py-10">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden m-6 lg:m-8 min-h-[130vh]">
          {/* Gambar kiri */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white/40 p-10">
            <img
              src={Logo}
              alt="Logo Perusahaan"
              className="w-full h-auto max-h-[85%] object-contain rounded-xl shadow-lg"
            />
          </div>

          {/* Form kanan */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 flex justify-center items-center">
            <div
              className="w-full max-w-md h-full overflow-y-auto lg:overflow-visible"
              style={{
                maxHeight: "calc(120vh - 80px)",
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center lg:text-left">
                Hai, Selamat Datang!
              </h2>
              <p className="text-gray-700 mb-6 text-center lg:text-left text-sm sm:text-base">
                Silakan daftar untuk membuat akun anda.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama */}
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

                {/* NIK */}
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

                {/* No HP */}
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

                {/* Email */}
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

                {/* Password */}
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
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
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

                {/* Checkbox */}
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

                {/* Error */}
                {error && (
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                )}

                {/* Tombol daftar */}
                <button
                  type="submit"
                  className="w-full px-5 py-2.5 sm:px-6 sm:py-3 
                  bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 
                  text-white rounded-lg text-sm sm:text-base font-semibold 
                  transition shadow-md transform active:scale-95"
                >
                  Daftar
                </button>

                {/* Tautan login */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Daftar;
