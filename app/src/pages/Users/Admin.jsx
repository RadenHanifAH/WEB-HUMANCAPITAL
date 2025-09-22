import React, { useState } from "react";
import {
  BarChart3,
  Briefcase,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Archive,
  UserCheck,
} from "lucide-react";

import Dashboard from "./Dashboard";
import Lokeradmin from "./Lokeradmin";
import Lamaranadmin from "./Lamaranadmin";
import Pelamar from "./Pelamar";
import Arsip from "./Arsip";
import Acceptance from "./Acceptance";
import HeaderAdmin from "./HeaderAdmin"; // ✅ Tambahkan ini

function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "jobs", label: "Lowongan Kerja", icon: Briefcase },
    { id: "applications", label: "Lamaran", icon: FileText },
    { id: "applicants", label: "Pelamar", icon: Users },
    { id: "acceptance", label: "Penerimaan", icon: UserCheck },
    { id: "employees", label: "Arsip", icon: Archive },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <div
        className={`bg-gray-100 border-r border-gray-300 transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"} flex flex-col`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-800 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700">Admin Portal</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-200"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col flex-1 p-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                  ${
                    isActive
                      ? "bg-sky-800 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }
                  ${isCollapsed ? "justify-center px-2" : "justify-start"}
                `}
              >
                <Icon
                  className={`flex-shrink-0 transition-all duration-200 
                  ${isActive ? "w-6 h-6" : "w-5 h-5"}`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* KONTEN */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Tambahkan header di atas konten */}
        <HeaderAdmin />

        <div className="p-10">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "jobs" && <Lokeradmin />}
          {activeTab === "applications" && <Lamaranadmin />}
          {activeTab === "applicants" && <Pelamar />}
          {activeTab === "employees" && <Arsip />}
          {activeTab === "acceptance" && <Acceptance />}
        </div>
      </div>
    </div>
  );
}

export default Admin;
