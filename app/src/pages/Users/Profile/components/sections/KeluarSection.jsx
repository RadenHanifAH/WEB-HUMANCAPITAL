import React from "react";
import { LogOut } from "lucide-react";

const KeluarSection = () => {
  return (
    <div className="p-6 text-red-600 font-semibold bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center space-x-3">
      <LogOut size={24} />
      <p>
        Anda memilih <strong>Keluar</strong>. Simulasi Log Out berhasil. Silakan
        refresh halaman.
      </p>
    </div>
  );
};

export default KeluarSection;
