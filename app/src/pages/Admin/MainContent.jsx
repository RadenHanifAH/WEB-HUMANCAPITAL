import React, { forwardRef } from "react";

import Dashboard from "./Dashboard/Dashboard";
import Lokeradmin from "./Lokeradmin/LowonganKerja.jsx";
import Pelamar from "./Pelamar/Pelamar";
import Arsip from "./Arsip/index";
import Reports from "./Reports/index";
import Schedule from "./Shedules/Penjadwalan.jsx";
import SettingsPage from "./Settings/Index";
import AdminPengajuanPage from "./Pengajuan/Pengajuan.jsx";
import PenilaianPage from "./Penilaian/Penjadwalan.jsx";
import DokumenPenilaian from "./Penilaian/DokumenPenilaian";
import UserManagementPage from "./UserManagement/index.jsx";
import NotificationsPage from "./notifications/NotificationsPage.jsx";

const MainContent = forwardRef(
  ({ activeTab, sidebarWidth, selectedApplicationId, onNavigateTab }, ref) => (
    <main
      ref={ref}
      // ✅ FIX: padding-right sedikit lebih besar dari default (p-10),
      // khusus supaya konten/tombol di pojok kanan-atas halaman (mis.
      // "Ekspor" / "Tambah User" di UserManagementPage) tidak tertutup
      // NotificationBell yang posisinya fixed top-4 right-4/6 z-30.
      className="flex-1 overflow-y-auto scroll-smooth p-10 pr-14 sm:pr-16 md:pr-20 transition-all duration-300"
      style={{ marginLeft: sidebarWidth }}
    >
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "jobs" && <Lokeradmin />}
      {activeTab === "applicants" && <Pelamar />}
      {activeTab === "employees" && <Arsip />}
      {activeTab === "reports" && <Reports />}
      {activeTab === "schedule" && <Schedule />}
      {activeTab === "settings" && <SettingsPage />}
      {activeTab === "pengajuan-sdm" && <AdminPengajuanPage />}
      {activeTab === "user-management" && <UserManagementPage />}

      {activeTab === "notifications" && (
        <NotificationsPage onNavigateTab={onNavigateTab} />
      )}

      {activeTab === "schedule-penilaian" && (
        <PenilaianPage applicationId={selectedApplicationId} />
      )}

      {activeTab === "schedule-dokumen-penilaian" && <DokumenPenilaian />}
    </main>
  ),
);

export default MainContent;
