import React from "react";
import { Edit, User as UserIcon } from "lucide-react";

const ProfileSidebar = ({
  userName,
  currentPhotoUrl,
  fileInputRef,
  isHovered,
  setIsHovered,
  onPhotoChange,
  onPickPhoto,
  activeMenu,
  setActiveMenu,
  menuItems,
  FallbackIcon = UserIcon, // ✅ default kalau tidak dikirim
}) => {
  const Icon = FallbackIcon || UserIcon; // ✅ jaga-jaga kalau null/undefined

  return (
    <>
      <div className="bg-white rounded-xl shadow-xl p-6 text-center border border-sky-100">
        <div
          className="relative w-24 h-24 mx-auto mb-3 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {currentPhotoUrl ? (
            <img
              className="w-24 h-24 rounded-full object-cover shadow-md transition-all duration-300 group-hover:opacity-70"
              src={currentPhotoUrl}
              alt={`Foto ${userName}`}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center shadow-md transition-all duration-300 group-hover:opacity-70">
              <Icon size={40} className="text-gray-500" />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={onPhotoChange}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />

          <button
            onClick={onPickPhoto}
            className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full text-white transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            } focus:outline-none focus:ring-2 focus:ring-sky-500`}
            aria-label="Ganti Foto Profil"
            title="Ganti Foto Profil"
          >
            <Edit size={24} />
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          {userName || "Nama Pengguna"}
        </h2>
      </div>

      <nav className="bg-white rounded-xl shadow-lg p-4 space-y-1 border border-gray-100">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveMenu(item.name)}
            className={`w-full flex items-center p-3 rounded-lg transition duration-150 text-left text-base ${
              item.name === activeMenu
                ? "bg-blue-50 text-blue-700 font-semibold shadow-inner"
                : "text-gray-600 hover:bg-gray-100"
            } ${
              item.name === "Keluar"
                ? "border-t border-gray-200 mt-2 pt-2 text-red-600 hover:text-red-700"
                : ""
            }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.name}
          </button>
        ))}
      </nav>
    </>
  );
};

export default ProfileSidebar;
