import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Download,
  Database,
  Loader,
} from "lucide-react";
import { getSettings, runBackup } from "../services/settings.api";
import { formatDateTimeID } from "../utils/format";

export default function SystemSettings({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [systemData, setSystemData] = useState({
    lastBackupAt: null,
    lastBackupFile: null,
    systemVersion: "v2.1.0",
    database: "MySQL",
    lastUpdate: null, // ✅ simpan raw date/string, nanti diformat
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      const s = res?.data || {};

      setSystemData({
        lastBackupAt: s.lastBackupAt || null,
        lastBackupFile: s.lastBackupFile || null,
        systemVersion: s.systemVersion || "v2.1.0",
        database: s.database || "MySQL",
        lastUpdate: s.lastUpdate || null, // ✅ bisa ISO string
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
    // eslint-disable-next-line
  }, []);

  // ✅ helper: paksa download tanpa popup blocker
  const handleDownload = (filenameParam) => {
    const filename = filenameParam || systemData.lastBackupFile;
    if (!filename) {
      showToast("Belum ada file backup. Klik Backup Sekarang dulu.", "error");
      return;
    }

    const url = `web-humancapital-production.up.railway.app/api/settings/backup/${encodeURIComponent(
      filename
    )}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    showToast("Download dimulai...", "success");
  };

  const handleBackup = async () => {
    setProcessing(true);
    try {
      showToast("Memulai proses backup data...", "success");

      const res = await runBackup(); // { message, data: { filename } }
      const filename = res?.data?.filename || null;

      // refresh settings dari DB supaya lastBackupAt/lastUpdate ikut update
      await load();

      if (filename) handleDownload(filename);

      showToast("Backup data berhasil dibuat!", "success");
    } catch (e) {
      console.error(e);
      showToast(e?.response?.data?.message || "Backup gagal", "error");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ format untuk lastUpdate (jangan tampil ISO mentah)
  const lastUpdateText = formatDateTimeID(systemData.lastUpdate);

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
        <SettingsIcon size={20} className="text-sky-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          Pengaturan Sistem
        </h2>
      </div>

      <p className="text-sm text-gray-500 mb-8">
        Konfigurasi sistem dan maintenance.
      </p>

      {/* Backup & Restore */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Backup & Restore
        </h3>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-sm text-gray-700">
            <p className="font-medium">Backup otomatis (setiap hari)</p>
            <p className="text-xs text-gray-500">
              Backup terakhir: {formatDateTimeID(systemData.lastBackupAt)}
            </p>
            <p className="text-xs text-gray-500">
              File: {systemData.lastBackupFile || "-"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleDownload()}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
              type="button"
            >
              <Download size={16} />
              Download
            </button>

            <button
              onClick={handleBackup}
              disabled={processing}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 ${
                processing ? "opacity-75 cursor-not-allowed" : ""
              }`}
              type="button"
            >
              {processing && <Loader size={16} className="animate-spin" />}
              {processing ? "Proses..." : "Backup Sekarang"}
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="mb-2 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          System Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Versi Sistem</p>
              <p className="font-medium text-gray-800">
                {systemData.systemVersion}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Database</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Database size={16} className="text-sky-600" />
                {systemData.database}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Last Update</p>
              <p className="font-medium text-gray-800">{lastUpdateText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
