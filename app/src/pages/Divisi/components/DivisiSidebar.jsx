/* eslint-disable no-unused-vars */
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  X,
  Settings,
} from "lucide-react";
import useAuthStore from "../../../store/useAuthStore";
import Syaamil from "../../../assets/logo.png";

const navItems = [
  { to: "/divisi/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/divisi/pengajuan", icon: ClipboardList, label: "Pengajuan SDM" },
  { to: "/divisi/settings", icon: Settings, label: "Pengaturan" },
];

export default function DivisiSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-[240px] min-w-[240px] bg-white border-r border-gray-100
        flex flex-col h-full
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <img src={Syaamil} alt="Syaamil" className="h-12 w-auto" />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 pt-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.profil?.foto_profil ? (
              <img
                src={user.profil.foto_profil}
                alt={user?.nama || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-blue-600">
                {user?.nama?.charAt(0)?.toUpperCase() || "D"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
              {user?.nama || "Kepala Divisi"}
            </p>
            <p className="text-xs text-gray-400 leading-tight truncate">
              {user?.email || "divisi@syaamil.com"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-1 py-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}