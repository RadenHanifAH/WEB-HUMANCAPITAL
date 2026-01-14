import React from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../../assets/logo.png"; // ✅ sesuaikan path

const SidebarHeader = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
      {/* ✅ Logo (klik ke Home) */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 rounded-md focus:outline-none"
        aria-label="Ke Beranda"
      >
        {/* Saat collapse: logo kecil, saat normal: logo normal */}
        <img
          src={Logo}
          alt="Logo"
          className={`${isCollapsed ? "h-8" : "h-10"} w-auto`}
        />
      </button>

      {/* Toggle collapse */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default SidebarHeader;
