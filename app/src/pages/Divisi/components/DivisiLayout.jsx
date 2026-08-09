import { useState } from "react";
import { Outlet } from "react-router-dom";
import DivisiSidebar from "./DivisiSidebar";
// import DivisiNavbar from "./DivisiNavbar";

export default function DivisiLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <DivisiSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* <DivisiNavbar onMenuClick={() => setSidebarOpen(true)} /> */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
