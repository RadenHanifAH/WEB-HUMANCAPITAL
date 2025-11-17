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
import Home from "./pages/Home";
import Lowongan from "./pages/Lowongan";
import Login from "./pages/Login/Login";
import Daftar from "./pages/Login/Daftar";
import Reset from "./pages/Login/Reset";
import Admin from "./pages/Users/Admin";
import Profile from "./pages/Users/Profile";
import ScrollToTop from "./components/ScrollToTop";
import useAuthStore from "./store/useAuthStore";
import { Loader2 } from "lucide-react";

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

  const hideNavbar = ["/admin"];
  const hideFooter = ["/login", "/daftar", "/reset-password", "/admin"];

  return (
    <>
      {!checkingAuth && !hideNavbar.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lowongan" element={<Lowongan />} />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/daftar"
          element={!user ? <Daftar /> : <Navigate to="/" />}
        />
        <Route path="/reset-password" element={<Reset />} />
        <Route
          path="/admin"
          element={user?.role === "admin" ? <Admin /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>

      {!checkingAuth && !hideFooter.includes(location.pathname) && <Footer />}
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
