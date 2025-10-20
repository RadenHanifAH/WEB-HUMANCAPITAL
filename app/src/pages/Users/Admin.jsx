import React, { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Archive,
  MessageSquare,
  Calendar,
  LogOut,
} from "lucide-react";

import Dashboard from "./Dashboard";
import Lokeradmin from "./Lokeradmin";
import Pelamar from "./Pelamar";
import Arsip from "./ArsipPelamar";
import Acceptance from "./Acceptance";
import Repots from "./Repots";
import Messages from "./Messages";
import Schedule from "./Schedule";
import SettingsPage from "./Settings";
import Profile from "../../assets/profile.png";

// Kunci untuk Local Storage
const TAB_STORAGE_KEY = "adminActiveTab";

function Admin() {
  // 1. Inisialisasi State dari Local Storage
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    // Menggunakan "schedule" sebagai default jika tidak ada yang tersimpan
    return savedTab || "schedule";
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? "5rem" : "16rem";

  const mainRef = useRef(null);
  const scrollPositions = useRef({});

  // 2. Efek untuk menyimpan activeTab ke Local Storage setiap kali berubah
  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    
    // Logika pemulihan posisi scroll (tetap dipertahankan)
    if (mainRef.current && scrollPositions.current[activeTab] !== undefined) {
      mainRef.current.scrollTop = scrollPositions.current[activeTab];
    }
    
  }, [activeTab]); // Dependensi: activeTab

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "jobs", label: "Lowongan Kerja", icon: Briefcase },
    { id: "applicants", label: "Pelamar", icon: Users },
    { id: "reports", label: "Laporan", icon: FileText },
    { id: "messages", label: "Pesan", icon: MessageSquare },
    { id: "schedule", label: "Jadwal Interview", icon: Calendar },
    { id: "employees", label: "Arsip", icon: Archive },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  const handleTabChange = (id) => {
    if (mainRef.current) {
      // Simpan posisi scroll sebelum pindah tab
      scrollPositions.current[activeTab] = mainRef.current.scrollTop;
    }
    setActiveTab(id);
  };
  
  // Catatan: Efek pemulihan scroll kini digabungkan ke dalam useEffect yang menyimpan activeTab di Local Storage,
  // namun jika Anda ingin memisahkannya:
  /*
  useEffect(() => {
      if (mainRef.current && scrollPositions.current[activeTab] !== undefined) {
        mainRef.current.scrollTop = scrollPositions.current[activeTab];
      }
  }, [activeTab]);
  */

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`
          fixed top-0 left-0 h-screen z-20
          flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300
        `}
        style={{ width: sidebarWidth }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-gray-700" />
              </div>
              <h1 className="text-lg font-semibold text-gray-800 tracking-wide">
                Admin Portal
              </h1>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 flex flex-col px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-blue-100 text-sky-600 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"}
                  ${isCollapsed ? "justify-center px-2" : "justify-start"}
                `}
              >
                <Icon className={`${isActive ? "w-6 h-6" : "w-5 h-5"}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* ==== FOOTER (PROFILE, INFO ADMIN & LOGOUT) ==== */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          {!isCollapsed && (
            // Flex container untuk gambar profil dan teks
            <div className="flex items-center gap-3 mb-2">
              {" "}
              {/* mb-2 untuk jarak dengan logout */}
              <img
                src={Profile} // Gambar profil lebih kecil
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-gray-700 text-sm">
                <p className="font-semibold">Halo, Admin 👋</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
          )}

          {isCollapsed && ( // Ketika collapsed, tampilkan hanya gambar profil besar di tengah
            <div className="flex justify-center mb-4">
              <img
                src={Profile} // Gambar profil lebih besar saat collapsed
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
          )}

          <button
            className={`
              flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition
              ${isCollapsed ? "justify-center w-full" : "justify-start"}
              `}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main
        ref={mainRef}
        className={`
          flex-1 overflow-y-auto scroll-smooth p-10 transition-all duration-300
        `}
        style={{ marginLeft: sidebarWidth }}
      >
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "jobs" && <Lokeradmin />}
        {activeTab === "applicants" && <Pelamar />}
        {activeTab === "employees" && <Arsip />}
        {activeTab === "reports" && <Repots />}
        {activeTab === "messages" && <Messages />}
        {activeTab === "schedule" && <Schedule />}
        {activeTab === "acceptance" && <Acceptance />}
        {activeTab === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

export default Admin;