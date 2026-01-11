import React, { forwardRef } from "react";
import Dashboard from "./Dashboard/Dashboard";
import Lokeradmin from "./Lokeradmin/Lokeradmin";
import Pelamar from "./Pelamar/Pelamar";
import Arsip from "./Arsip/index";
import Reports from "./Reports/index";
import Messages from "./messages/index";
import Schedule from "./Shedules/index";
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
    {activeTab === "reports" && <Reports />}
    {activeTab === "messages" && <Messages />}
    {activeTab === "schedule" && <Schedule />}
    {activeTab === "acceptance" && <Acceptance />}
    {activeTab === "settings" && <SettingsPage />}
  </main>
));

export default MainContent;
