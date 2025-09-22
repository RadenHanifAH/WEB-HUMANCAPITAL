"use client";

import React, { useState } from "react";
import { Search, Bell, User, LogOut } from "lucide-react";

export default function HeaderAdmin() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-200 relative">
      {/* Judul Halaman */}
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>

      {/* Bagian Kanan: Search, Notif, Profile */}
      <div className="flex items-center gap-4">
        {/* Search bar */}
        {/* <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari pelamar, lowongan..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div> */}

        {/* Notifikasi */}
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-sky-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
            3
          </span>
        </div>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 focus:outline-none hover:ring-2 hover:ring-sky-200"
          >
            <User className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="font-semibold text-gray-800">Admin HR</p>
                <p className="text-sm text-gray-500">admin@company.com</p>
              </div>
              <div className="py-2">
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
