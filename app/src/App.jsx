import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Lowongan from "./pages/Lowongan";
import Login from "./pages/Login/Login";
import Daftar from "./pages/Login/Daftar";
import Reset from "./pages/Login/Reset";
import Admin from "./pages/Users/Admin";
import ScrollToTop from "./components/ScrollToTop";

function Layout() {
  const location = useLocation();

  // route yang tidak butuh navbar/footer
  const hideLayout = ["/login", "/daftar", "/reset-password", "/admin"];

  return (
    <>
      {/* Navbar hanya muncul kalau bukan di login/daftar/reset/admin */}
      {!hideLayout.includes(location.pathname) && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lowongan" element={<Lowongan />} />
        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path="/admin" element={<Admin />} /> {/* ⬅️ Tambahkan ini */}
      </Routes>

      {/* Footer hanya muncul kalau bukan di login/daftar/reset/admin */}
      {!hideLayout.includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}

export default App;
