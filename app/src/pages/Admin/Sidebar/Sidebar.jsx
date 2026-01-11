import React from "react";
import SidebarHeader from "./components/SidebarHeader.jsx";
import SidebarMenu from "./SidebarMenu.jsx";
import SidebarFooter from "./components/SidebarFooter.jsx";

const Sidebar = ({ isCollapsed, setIsCollapsed, activeTab, handleTabChange, user, logout }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-20 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300`}
      style={{ width: isCollapsed ? "5rem" : "16rem" }}
    >
      <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <SidebarMenu
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />
      <SidebarFooter isCollapsed={isCollapsed} user={user} logout={logout} />
    </aside>
  );
};

export default Sidebar;
