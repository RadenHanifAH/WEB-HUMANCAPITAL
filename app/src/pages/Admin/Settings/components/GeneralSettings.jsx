import React, { useEffect, useState } from "react";
import { Settings as SettingsIcon, Loader } from "lucide-react";
import { getSettings, updateGeneralSettings } from "../services/settings.api";

export default function GeneralSettings({ showToast }) {
  const [settings, setSettings] = useState({
    nama_perusahaan: "",
    website: "",
    lokasi: "Bandung",
    zona_waktu: "WIB (UTC+7)",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      const s = res.data || {};
      setSettings({
        nama_perusahaan: s.nama_perusahaan || "",
        website: s.website || "",
        lokasi: s.lokasi || "Bandung",
        zona_waktu: s.zona_waktu || "WIB (UTC+7)",
      });
    } catch (e) {
      console.error(e);
      showToast("Gagal memuat pengaturan umum", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const onChange = (e) => setSettings((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateGeneralSettings(settings);
      showToast("Pengaturan umum berhasil diperbarui!", "success");
      await load();
    } catch (e) {
      console.error(e);
      showToast(e?.response?.data?.message || "Gagal menyimpan pengaturan umum", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-gray-700">
        <Loader className="animate-spin mr-2" /> Memuat...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Pengaturan Umum</h2>
      </div>

      <p className="text-sm text-gray-500 mb-6">Konfigurasi dasar sistem perusahaan.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600">Nama Perusahaan</label>
          <input
            type="text"
            name="nama_perusahaan"
            value={settings.nama_perusahaan}
            onChange={onChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Website Perusahaan</label>
          <input
            type="url"
            name="website"
            value={settings.website}
            onChange={onChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Lokasi Default</label>
          <select
            name="lokasi"
            value={settings.lokasi}
            onChange={onChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          >
            <option>Bandung</option>
            <option>Jakarta</option>
            <option>Surabaya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Zona Waktu</label>
          <select
            name="zona_waktu"
            value={settings.zona_waktu}
            onChange={onChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          >
            <option>WIB (UTC+7)</option>
            <option>WITA (UTC+8)</option>
            <option>WIT (UTC+9)</option>
          </select>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={`mt-8 px-6 py-2 rounded-lg text-white transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 ${
          saving ? "opacity-75 cursor-not-allowed" : ""
        }`}
        type="button"
      >
        {saving && <Loader size={18} className="animate-spin" />}
        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </div>
  );
}