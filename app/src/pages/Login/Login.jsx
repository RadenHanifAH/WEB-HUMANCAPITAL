import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // icon mata
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png"; // ganti sesuai lokasi logo kamu

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="p-6 ml-10">
        <img src={Logo} alt="Logo" className="h-13 w-auto" />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 md:px-16">
        {/* Left Text */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <h1
            className="text-3xl font-semibold leading-snug max-w-md 
                 bg-gradient-to-r from-blue-900 to-sky-400 
                 bg-clip-text text-transparent"
          >
            Wujudkan Karier Impian Bersama Syaamil Group
          </h1>
        </div>

        {/* Right Form */}
        <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-lg px-4 py-3 text-base focus:ring focus:ring-blue-300"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border rounded-lg px-4 py-3 text-base focus:ring focus:ring-blue-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link
                  to="/reset-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded-lg text-base hover:bg-blue-800 transition"
            >
              Masuk
            </button>

            <div className="flex items-center gap-2">
              <hr className="flex-1 border-gray-300" />
              <span className="text-sm text-gray-500">Atau</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border py-3 rounded-lg text-base hover:bg-gray-50 transition"
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="h-6 w-6"
              />
              Masuk dengan Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Belum Punya Akun?{" "}
            <Link to="/daftar" className="text-blue-600 hover:underline">
              Daftar disini
            </Link>
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

export default Login;
