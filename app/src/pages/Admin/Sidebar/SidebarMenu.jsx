import React, { useState } from "react";
import {
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Calendar,
  Archive,
  Settings,
  ClipboardList,
  ChevronDown,
  UserCog,
  Activity,
} from "lucide-react";

// ── ✅ Helper: ambil role user dari localStorage ─────────────────────
// Prioritas:
//   1. localStorage "user" → field `peran` (bentuk toSafeUser dari backend)
//   2. Fallback: decode payload JWT "accessToken" → field `role`
// Dipanggil DI DALAM komponen (bukan level module) agar terbaca ulang
// setiap render → perubahan role langsung terlihat tanpa refresh.
const getUserRole = () => {
  // 1) dari object user yang tersimpan saat login
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser?.peran) {
      return String(storedUser.peran).trim().toLowerCase();
    }
  } catch {
    /* user rusak/invalid → lanjut ke fallback */
  }

  // 2) fallback: decode payload JWT (field `role`, di-set generateTokens)
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      let b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "="; // padding base64
      const payload = JSON.parse(atob(b64));
      if (payload?.role) return String(payload.role).trim().toLowerCase();
    }
  } catch {
    /* token rusak → anggap pelamar */
  }

  return "pelamar";
};

const menuItems = [
  { id: "dashboard",     label: "Dashboard",      icon: BarChart3 },
  { id: "pengajuan-sdm", label: "Pengajuan SDM",  icon: ClipboardList },
  { id: "jobs",          label: "Pembukaan Lowongan", icon: Briefcase },
  { id: "applicants",    label: "Pelamar",        icon: Users },
  {
    id: "schedule",
    label: "Wawancara",
    icon: Calendar,
    children: [
      { id: "schedule",     label: "Penjadwalan",  icon: Calendar },
      { id: "schedule-penilaian",   label: "Penilaian" },
      { id: "schedule-dokumen-penilaian", label: "Dokumen Penilaian" },
    ],
  },
  { id: "employees",       label: "Arsip",          icon: Archive },
  { id: "reports",         label: "Laporan",        icon: FileText },
  { id: "user-management", label: "Manajemen User", icon: UserCog },
  { id: "activity-log",    label: "Log Aktivitas",  icon: Activity, adminOnly: true },
  { id: "settings",        label: "Pengaturan",     icon: Settings },
];

const SidebarMenu = ({ isCollapsed, activeTab, handleTabChange }) => {
  // ✅ FIX: dibaca setiap render, bukan sekali di level module
  const userRole = getUserRole();
  const canViewActivityLog = ["admin", "super_admin"].includes(userRole);

  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {};
    menuItems.forEach((item) => {
      if (item.children?.some((c) => c.id === activeTab)) {
        initial[item.id] = true;
      }
    });
    return initial;
  });

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter menu berdasarkan role
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) return canViewActivityLog;
    return true;
  });

  return (
    <nav className="flex-1 flex flex-col px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
      {visibleMenuItems.map((item) => {
        const Icon = item.icon;
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        const isChildActive = hasChildren && item.children.some((c) => c.id === activeTab);
        const isActive = activeTab === item.id || isChildActive;
        const isOpen = !!openMenus[item.id];

        // ── Item dengan dropdown (misal: Wawancara) ──────────────
        if (hasChildren) {
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  toggleMenu(item.id);
                  if (isCollapsed) handleTabChange(item.children[0].id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-sky-600 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center px-2" : "justify-start"}`}
              >
                <Icon className={`shrink-0 ${isActive ? "w-6 h-6" : "w-5 h-5"}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left break-words leading-tight">
                    {item.label}
                  </span>
                )}
                {!isCollapsed && (
                  <ChevronDown
                    className={`shrink-0 w-4 h-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {!isCollapsed && isOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-gray-200 flex flex-col space-y-1">
                  {item.children.map((child) => {
                    const isChildActiveItem = activeTab === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleTabChange(child.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          isChildActiveItem
                            ? "text-sky-600 font-medium"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        <span className="block break-words leading-tight">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // ── Item biasa tanpa dropdown ─────────────────────────────
        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-blue-100 text-sky-600 font-medium shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            } ${isCollapsed ? "justify-center px-2" : "justify-start"}`}
          >
            <Icon className={`shrink-0 ${isActive ? "w-6 h-6" : "w-5 h-5"}`} />
            {!isCollapsed && (
              <span className="flex-1 text-left break-words leading-tight">
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarMenu;