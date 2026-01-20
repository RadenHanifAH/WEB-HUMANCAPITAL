import React from "react";
import { BarChart3, Briefcase, FileText, Users, MessageSquare, Calendar, Archive, Settings } from "lucide-react";

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

const SidebarMenu = ({ isCollapsed, activeTab, handleTabChange }) => {
  return (
    <nav className="flex-1 flex flex-col px-3 py-4 space-y-2 overflow-y-auto">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive ? "bg-blue-100 text-sky-600 font-medium shadow-sm" : "text-gray-700 hover:bg-gray-100"
            } ${isCollapsed ? "justify-center px-2" : "justify-start"}`}
          >
            <Icon className={`${isActive ? "w-6 h-6" : "w-5 h-5"}`} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
};

export default SidebarMenu;
