import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Loader } from "lucide-react";
import { getSettings } from "../services/settings.api";

export default function SystemSettings({ showToast }) {
  const [loading, setLoading] = useState(true);

  const [systemData, setSystemData] = useState({
    nama_perusahaan: "",
    website: "",
    lokasi: "",
    zona_waktu: "",
    email_pembaruan_sistem_aktif: true,
  });

  const load = async () => {
    setLoading(true);

    try {
      const res = await getSettings();
      const s = res?.data || {};

      setSystemData({
        nama_perusahaan: s.nama_perusahaan || "",
        website: s.website || "",
        lokasi: s.lokasi || "",
        zona_waktu: s.zona_waktu || "",
        email_pembaruan_sistem_aktif: s.email_pembaruan_sistem_aktif ?? true,
      });
    } catch (e) {
      console.error(e);
      showToast("Gagal memuat pengaturan sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-gray-700">
        <Loader className="animate-spin mr-2" />
        Memuat...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon size={20} className="text-sky-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          Pengaturan Sistem
        </h2>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Konfigurasi sistem dan maintenance.
      </p>

      <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Informasi Sistem
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nama Perusahaan</p>
            <p className="font-medium">{systemData.nama_perusahaan || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Website</p>
            <p className="font-medium">{systemData.website || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Lokasi</p>
            <p className="font-medium">{systemData.lokasi || "-"}</p>
          </div>

          <div>
            <p className="text-gray-500">Timezone</p>
            <p className="font-medium">{systemData.zona_waktu || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
