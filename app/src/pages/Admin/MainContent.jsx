import React, { forwardRef } from "react";
import Dashboard from "./Dashboard/Dashboard";
import Lokeradmin from "../Users/Lokeradmin";
import Pelamar from "../Users/Pelamar";
import Arsip from "../Users/ArsipPelamar";
import Acceptance from "../Users/Acceptance";
import Repots from "../Users/Repots";
import Messages from "../Users/Messages";
import Schedule from "../Users/Schedule";
import SettingsPage from "../Users/Settings";

const MainContent = forwardRef(({ activeTab, sidebarWidth }, ref) => (
  <main
    ref={ref}
    className={`flex-1 overflow-y-auto scroll-smooth p-10 transition-all duration-300`}
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
));

export default MainContent;
