import React from "react";
import { LogOut } from "lucide-react";

// ✅ `user` mengikuti bentuk toSafeUser() di auth.service.js:
// { id, nama, email, peran, divisi, created_at, profil: { ..., foto_profil, ... } }
const SidebarFooter = ({ isCollapsed, user, logout }) => (
  <div className="border-t border-gray-200 px-4 py-3 bg-white">
    {!isCollapsed ? (
      <div className="flex items-center gap-3 mb-2">
        <img
          src={user?.profil?.foto_profil || "https://placehold.co/40x40"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="text-gray-700 text-sm">
          <p className="font-semibold">Halo, {user?.nama || "Admin"} 👋</p>
          <p className="text-xs text-gray-500">{user?.email || "admin@example.com"}</p>
        </div>
      </div>
    ) : (
      <div className="flex justify-center mb-4">
        <img
          src={user?.profil?.foto_profil || "https://placehold.co/40x40"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>
    )}
    <button
      onClick={() => logout()}
      className={`flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition ${
        isCollapsed ? "justify-center w-full" : "justify-start"
      }`}
    >
      <LogOut className="w-4 h-4 text-red-500" />
      {!isCollapsed && <span className="text-red-600">Logout</span>}
    </button>
  </div>
);

export default SidebarFooter;