import React from "react";
import { Briefcase, Menu, X } from "lucide-react";

const SidebarHeader = ({ isCollapsed, setIsCollapsed }) => (
  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
    {!isCollapsed && (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-gray-700" />
        </div>
        <h1 className="text-lg font-semibold text-gray-800 tracking-wide">Admin Portal</h1>
      </div>
    )}
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
    >
      {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
    </button>
  </div>
);

export default SidebarHeader;
