import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import MainContent from "../MainContent";
import useAuthStore from "../../../store/useAuthStore";
import axios from "../../../api/axiosInstance";
import NotificationBell from "../notifications/components/NotificationBell";

const TAB_STORAGE_KEY = "adminActiveTab";

function Admin() {
  const { user, setUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    return savedTab || "schedule";
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? "5rem" : "16rem";

  const mainRef = useRef(null);
  const scrollPositions = useRef({});

  // FETCH ADMIN PROFILE
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data;
        if (data) {
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };

    if (!user) fetchAdminProfile();
  }, [user, setUser]);

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    if (mainRef.current && scrollPositions.current[activeTab] !== undefined) {
      mainRef.current.scrollTop = scrollPositions.current[activeTab];
    }
  }, [activeTab]);

  const handleTabChange = (id) => {
    if (mainRef.current) {
      scrollPositions.current[activeTab] = mainRef.current.scrollTop;
    }
    setActiveTab(id);
  };

  const safeUser = user || { profile: {}, email: "" };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        user={safeUser}
        logout={logout}
      />

      {/* ✅ Langsung kirim null agar MainContent tidak undefined & tidak error ESLint */}
      <MainContent
        ref={mainRef}
        activeTab={activeTab}
        sidebarWidth={sidebarWidth}
        onNavigateTab={handleTabChange}
        selectedApplicationId={null}
      />

      <div className="fixed top-4 right-4 md:right-6 z-30">
        <NotificationBell onNavigate={handleTabChange} />
      </div>
    </div>
  );
}

export default Admin;