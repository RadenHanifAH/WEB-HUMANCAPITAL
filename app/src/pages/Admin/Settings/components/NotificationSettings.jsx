import React, { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { getSettings, updateNotificationSettings } from "../services/settings.api";

export default function NotificationSettings({ showToast }) {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      setEnabled(Boolean(res?.data?.email_pembaruan_sistem_aktif));
    } catch (e) {
      console.error(e);
      showToast("Gagal memuat pengaturan notifikasi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateNotificationSettings({ email_pembaruan_sistem_aktif: enabled });
      showToast("Pengaturan notifikasi berhasil diperbarui!", "success");
      await load();
    } catch (e) {
      console.error(e);
      showToast(e?.response?.data?.message || "Gagal menyimpan notifikasi", "error");
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
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Pengaturan Notifikasi</h2>
      <p className="text-sm text-gray-500 mb-6">Kelola preferensi notifikasi sistem</p>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-800">Notifikasi Email Internal</h3>

        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-800">Pemberitahuan Pembaruan Sistem</h4>
            <p className="text-xs text-gray-500">Terima email tentang pembaruan fitur atau pemeliharaan sistem.</p>
          </div>

          <input
            type="checkbox"
            className="sr-only peer"
            id="systemUpdate"
            checked={enabled}
            onChange={() => setEnabled((v) => !v)}
          />
          <label
            htmlFor="systemUpdate"
            className="relative cursor-pointer w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-sky-500/30 rounded-full peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
          />
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