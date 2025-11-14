import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Lowongan from "./pages/Lowongan";
import Login from "./pages/Login/Login";
import Daftar from "./pages/Login/Daftar";
import Reset from "./pages/Login/Reset";
import Admin from "./pages/Users/Admin";
import User from "./pages/Users/User";
import ScrollToTop from "./components/ScrollToTop";
import useAuthStore from "./store/useAuthStore";
import axiosInstance from "./api/axiosInstance";

function Layout() {
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  // ✅ Cek status login berdasarkan cookie
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/auth/profile", {
          withCredentials: true,
        });
        if (res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.warn("Gagal memuat profil user:", error.message);
        setUser(null);
      }
    };

    fetchProfile();
  }, [setUser]);

  // ✅ Halaman tanpa Navbar
  const hideNavbar = ["/admin"];

  // ✅ Halaman tanpa Footer
  const hideFooter = ["/login", "/daftar", "/reset-password", "/admin"];

  return (
    <>
      {/* Navbar hanya disembunyikan di halaman admin */}
      {!hideNavbar.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lowongan" element={<Lowongan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/home" element={<Home />} />
      </Routes>

      {/* Footer disembunyikan pada halaman tertentu */}
      {!hideFooter.includes(location.pathname) && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}
