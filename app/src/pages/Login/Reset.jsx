import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";

function Reset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(`Link reset password telah dikirim ke: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="p-6 ml-10">
        <img src={Logo} alt="Logo" className="h-13 w-auto" />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 md:px-16">

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

            {message && (
              <p className="text-sm text-blue-600 text-center">{message}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded-lg text-base hover:bg-blue-800 transition"
            >
              Kirim Link Reset
            </button>

            <div className="text-center">
                <p className="mt-6 text-center text-sm text-gray-600">
            Apakah Anda ingat kata sandi Anda?{" "}
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Masuk
              </Link>
            </p>
            
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-500 border-t mt-10">
        © 2025 Perusahaan Anda. All rights reserved.
      </footer>
    </div>
  );
}

export default Reset;
