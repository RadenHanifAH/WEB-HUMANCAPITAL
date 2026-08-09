import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Lowongan from "./pages/Lowongan/Lowongan.jsx";
import Kontak from "./components/Kontak.jsx";

import Login from "./pages/Login/Login";
import Daftar from "./pages/Login/Daftar";
import Reset from "./pages/Login/Reset";
import ResetPasswordNew from "./pages/Login/ResetPasswordNew";
import Admin from "./pages/Admin/Sidebar/Admin.jsx";

import Profile from "./pages/Users/Profile/ProfilePage.jsx";
import ConfirmSchedulePage from "./pages/Admin/Shedules/components/ConfirmSchedulePage.jsx";
import NotificationsPage from "./pages/Admin/notifications/NotificationsPage.jsx";

import DivisiLayout from "./pages/Divisi/components/DivisiLayout.jsx";
import DivisiDashboard from "./pages/Divisi/DivisiDashboard.jsx";
import PengajuanSDM from "./pages/Divisi/PengajuanSDM.jsx";
import EditPengajuanSDM from "./pages/Divisi/EditPengajuanSDM.jsx";
import DivisiSettings from "./pages/Divisi/DivisiSettings.jsx";

import useAuthStore from "./store/useAuthStore";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";

function Layout() {
  const location = useLocation();
  const { user, checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  const hideNavbar =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/daftar") ||
    location.pathname.startsWith("/reset") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/admin/dashboard") ||
    location.pathname.startsWith("/admin/notifications") ||
    location.pathname.startsWith("/divisi");

  const hideFooter =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/daftar") ||
    location.pathname.startsWith("/reset") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/admin/dashboard") ||
    location.pathname.startsWith("/admin/notifications") ||
    location.pathname.startsWith("/divisi");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-center" 
      containerStyle={{ top:20 }}/>

      {!hideNavbar && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/lowongan" element={<Lowongan />} />
          <Route path="/kontak" element={<Kontak />} />

          {/* ================= AUTH ================= */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/daftar"
            element={!user ? <Daftar /> : <Navigate to="/" />}
          />

          {/* RESET PASSWORD */}
          <Route path="/reset" element={<Reset />} />
          <Route path="/reset-password/:token" element={<ResetPasswordNew />} />

          {/* ================= ADMIN ================= */}
          {/* ⚠️ FIX: kolom Prisma-nya `peran` (bukan `role`). toSafeUser()
              di backend mengirim `user.peran`, jadi guard di sini harus
              mengecek field yang sama, kalau tidak `user?.role` akan
              selalu undefined dan admin selalu dilempar ke "/". */}
          <Route
            path="/admin/dashboard"
            element={user?.peran === "admin" ? <Admin /> : <Navigate to="/" />}
          />

          <Route
            path="/admin/notifications"
            element={
              user?.peran === "admin" ? <NotificationsPage /> : <Navigate to="/" />
            }
          />

          {/* ================= DIVISI ================= */}
          <Route
            path="/divisi"
            element={
              user?.peran === "divisi" ? (
                <DivisiLayout />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="dashboard" element={<DivisiDashboard />} />
            <Route path="pengajuan" element={<PengajuanSDM />} />
            <Route path="pengajuan/edit/:id" element={<EditPengajuanSDM />} />
            <Route path="settings" element={<DivisiSettings />} />
          </Route>

          {/* ================= USER ================= */}
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/confirm-schedule/:id" element={<ConfirmSchedulePage />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}
    </div>
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