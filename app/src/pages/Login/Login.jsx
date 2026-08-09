// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/perusahaan1.png";
import useAuthStore from "../../store/useAuthStore";

const IconInputField = ({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  isPassword = false,
  onToggleVisibility,
  isVisible = false,
}) => (
  <div className="mb-4">
    <div className="relative">
      {Icon && (
        <Icon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg text-base focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition duration-150 placeholder:text-gray-400"
      />
      {isPassword && (
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  </div>
);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(email, password);
      if (response?.success) {
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal login");
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-600">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">Memproses...</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/60 via-blue-400/50 to-blue-500/50 opacity-40 pointer-events-none" />

      <div className="relative h-full flex items-center justify-center p-4 sm:p-6 min-h-screen">
        <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden">
          <div className="hidden lg:flex lg:w-1/2 relative p-8 bg-white items-center justify-center">
            <img
              src={Logo}
              alt="Logo Perusahaan"
              className="w-full h-auto max-h-[80%] object-contain rounded-lg shadow-xl"
            />
          </div>

          <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-center sm:text-left">
                Hai, Selamat Datang!
              </h1>
              <p className="text-gray-700 mb-8 text-center sm:text-left text-sm sm:text-base">
                Silakan masuk dengan akun anda.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <IconInputField
                    icon={Mail}
                    type="email"
                    placeholder="nama@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <IconInputField
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isPassword={true}
                    isVisible={showPassword}
                    onToggleVisibility={() => setShowPassword((prev) => !prev)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 font-medium -mt-2">
                    {error}
                  </p>
                )}

                <div className="-mt-3 text-right">
                  <Link
                    to="/reset"
                    className="text-sm font-medium text-sky-800 hover:underline"
                  >
                    Lupa Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 text-white rounded-lg text-sm md:text-base font-semibold flex items-center justify-center transition shadow-lg transform active:scale-95 ${loading ? "opacity-80 cursor-not-allowed" : ""}`}
                >
                  Masuk
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-700">
                Belum memiliki akun?{" "}
                <Link
                  to="/daftar"
                  className="text-sky-800 font-semibold hover:underline"
                >
                  Daftar disini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
