import React, { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scroller } from "react-scroll";
import Logo from "../assets/logo.png";
import useAuthStore from "../store/useAuthStore";

function Navbar() {
  const { user, logout } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleBerandaClick = () => {
    setIsOpen(false);
    if (location.pathname === "/") {
      scroller.scrollTo("top", { smooth: true, duration: 500, offset: -80 });
    } else {
      navigate("/");
    }
  };

  const handleScrollTo = (target) => {
    setIsOpen(false);
    if (location.pathname === "/") {
      scroller.scrollTo(target, { smooth: true, duration: 500, offset: -80 });
    } else {
      navigate("/", { state: { scrollTo: target } });
    }
  };

  const menuItems = [
    { name: "Beranda", onClick: handleBerandaClick },
    { name: "Lowongan Kerja", path: "/lowongan" },
    { name: "Tentang Kami", onClick: () => handleScrollTo("about") },
    { name: "Core Value", onClick: () => handleScrollTo("culture") },
  ];

  // LOGIKA PENGAMBILAN FOTO:
  // Cek user.profile.fotoProfile (sesuai Profile.jsx)
  // Jika tidak ada, cek user.profile_picture (fallback)
  // Jika tidak ada, null.
  const userPhoto = user?.profile?.fotoProfile || user?.profile_picture || null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-0">
        {/* Logo */}
        <div className="flex items-center gap-2 ml-0 md:ml-26">
          <Link to="/">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item, index) =>
            item.path ? (
              <Link
                key={index}
                to={item.path}
                className="relative text-md font-medium text-gray-700 transition-colors duration-200 hover:text-orange-500"
              >
                {item.name}
              </Link>
            ) : (
              <span
                key={index}
                onClick={item.onClick}
                className="cursor-pointer relative text-md font-medium text-gray-700 transition-colors duration-200 hover:text-orange-500"
              >
                {item.name}
              </span>
            )
          )}
        </nav>

        {/* Auth & Mobile */}
        <div className="flex items-center gap-3 mr-0 md:mr-26">
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden md:flex items-center px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4 mr-2" />
                Masuk
              </Link>

              <Link
                to="/daftar"
                className="hidden md:flex items-center px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition"
              >
                Daftar
              </Link>
            </>
          ) : (
            <div className="relative hidden md:flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {/* FOTO PROFILE */}
                <div className="h-11 w-11 flex items-center justify-center rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
                  {userPhoto ? (
                    <img 
                      src={userPhoto} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gray-600" />
                  )}
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg py-2">
                  {/* Admin akan lihat Dashboard */}
                  {user?.role === "admin" ? (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard Admin
                    </Link>
                  ) : (
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      Profil
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-sm">
          <nav className="flex flex-col p-4 gap-3">
            {menuItems.map((item, index) =>
              item.path ? (
                <Link
                  key={index}
                  to={item.path}
                  className="text-gray-700 hover:text-orange-500 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="text-gray-700 hover:text-orange-500 text-base font-medium cursor-pointer"
                >
                  {item.name}
                </span>
              )
            )}

            {/* Admin Mobile */}
            {user?.role === "admin" ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-400 transition"
                onClick={() => setIsOpen(false)}
              >
                Dashboard Admin
              </Link>
            ) : null}

            {/* Auth Mobile */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Masuk
                </Link>

                <Link
                  to="/daftar"
                  className="flex items-center justify-center px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Daftar
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-400 transition"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;