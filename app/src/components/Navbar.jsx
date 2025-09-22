import React, { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scroller } from "react-scroll";
import Logo from "../assets/logo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBerandaClick = () => {
    if (location.pathname === "/") {
      scroller.scrollTo("top", {
        smooth: true,
        duration: 500,
        offset: -80,
      });
    } else {
      navigate("/");
    }
  };

  const handleScrollTo = (target) => {
    if (location.pathname === "/") {
      scroller.scrollTo(target, {
        smooth: true,
        duration: 500,
        offset: -80,
      });
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 ml-10">
          <Link to="/">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item, index) => {
            if (item.path) {
              return (
                <Link
                  key={index}
                  to={item.path}
                  className="relative text-md font-medium text-gray-700 transition-colors duration-200 hover:text-orange-500"
                >
                  {item.name}
                </Link>
              );
            }
            if (item.onClick) {
              return (
                <span
                  key={index}
                  onClick={item.onClick}
                  className="cursor-pointer relative text-md font-medium text-gray-700 transition-colors duration-200 hover:text-orange-500"
                >
                  {item.name}
                </span>
              );
            }
            return null;
          })}
        </nav>

        {/* Auth + Mobile Menu Button */}
        <div className="flex items-center gap-4">
          {/* ✅ Login Desktop */}
          <Link
            to="/login"
            className="hidden md:flex items-center px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-100"
          >
            <User className="h-4 w-4 mr-2" />
            Masuk
          </Link>

          <button
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col p-4 gap-2">
            {menuItems.map((item, index) => {
              if (item.path) {
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-gray-700 hover:text-orange-500"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              }
              if (item.onClick) {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="text-gray-700 hover:text-orange-500 cursor-pointer"
                  >
                    {item.name}
                  </span>
                );
              }
              return null;
            })}

            {/* ✅ Login Mobile */}
            <Link
              to="/login"
              className="flex items-center px-3 py-2 mt-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-100 w-auto self-start"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 mr-2" />
              Masuk
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
