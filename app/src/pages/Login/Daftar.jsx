import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; 
import Logo from "../../assets/logo.png";

function Daftar() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pwd) => {
  if (pwd.length < 8) {
    return "Password harus minimal 8 karakter.";
  }
  if (!/[A-Za-z]/.test(pwd)) {
    return "Password harus mengandung huruf.";
  }
  if (!/[0-9]/.test(pwd)) {
    return "Password harus mengandung angka.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
    return "Password harus mengandung simbol.";
  }
  return "";
};


  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pwdError = validatePassword(password);
    setPasswordError(pwdError);

    if (pwdError) {
      return; // jangan submit kalau password salah
    }

    console.log("Register attempt:", {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      agree,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="p-6 ml-10">
        <img src={Logo} alt="Logo" className="h-14 w-auto" />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Selangkah Lebih Dekat Dengan Suksesmu
          </h1>

          {/* Google Sign Up */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border py-3 rounded-full text-base hover:bg-gray-50 transition mb-4"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-6 w-6"
            />
            Daftar dengan Google
          </button>

          <div className="flex items-center gap-2 mb-6">
            <hr className="flex-1 border-gray-300" />
            <span className="text-sm text-gray-500">Atau</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 text-base focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Phone with all countries */}
            <div>
              <label className="block text-sm font-medium mb-1">No HP</label>
              <PhoneInput
                country={"id"}
                value={phone}
                onChange={setPhone}
                inputClass="!w-full !py-6 !text-base"
                containerClass="!w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 text-base focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  className={`w-full border rounded-lg px-4 py-3 text-base focus:ring focus:ring-blue-300 pr-10 ${
                    passwordError ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError ? (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Gunakan 8 atau lebih karakter, dengan perpaduan huruf, angka & simbol.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border rounded-lg px-4 py-3 text-base focus:ring focus:ring-blue-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agree" className="text-sm text-gray-600">
                Dengan ini saya menyatakan bahwa seluruh data dan/atau informasi
                yang saya sampaikan adalah benar
              </label>
            </div>

            <button
              type="submit"
              disabled={!agree || passwordError}
              className={`w-full py-3 rounded-lg text-base transition ${
                agree && !passwordError
                  ? "bg-gradient-to-r from-blue-700 to-sky-600 text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Daftar
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Sudah mempunyai akun?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Masuk
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t mt-10">
        © 2025 Perusahaan Anda. All rights reserved.
      </footer>
    </div>
  );
}

export default Daftar;
