export const ACTION_CONFIG = {
  CREATE:  { label: "Membuat",     badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200", dotClass: "bg-emerald-500" },
  UPDATE:  { label: "Memperbarui", badgeClass: "bg-blue-100 text-blue-700 border-blue-200",          dotClass: "bg-blue-500" },
  DELETE:  { label: "Menghapus",   badgeClass: "bg-red-100 text-red-700 border-red-200",             dotClass: "bg-red-500" },
  APPROVE: { label: "Menyetujui",  badgeClass: "bg-teal-100 text-teal-700 border-teal-200",          dotClass: "bg-teal-500" },
  REJECT:  { label: "Menolak",     badgeClass: "bg-rose-100 text-rose-700 border-rose-200",          dotClass: "bg-rose-500" },
  SUBMIT:  { label: "Mengirim",    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",       dotClass: "bg-amber-500" },
  EXPORT:  { label: "Mengekspor",  badgeClass: "bg-purple-100 text-purple-700 border-purple-200",    dotClass: "bg-purple-500" },
};

// ✅ FIX: duplikat key dihapus, semua modul digabung jadi satu daftar bersih.
// (jadwal_wawancara, hasil_psikotes, hasil_wawancara dipertahankan untuk
// kompatibilitas log lama yang mungkin masih tersimpan di database)
export const MODULE_LABELS = {
  pengajuan_sdm:    "Pengajuan SDM",
  lowongan:         "Pembukaan Lowongan",
  user:             "Manajemen User",
  lamaran:          "Pelamar",
  penilaian:        "Dokumen Penilaian",
  wawancara:        "Wawancara",
  arsip:            "Arsip",
  laporan:          "Laporan",
  // nama modul lama (kalau ada log lama yang masih memakai)
  jadwal_wawancara: "Jadwal Wawancara",
  hasil_psikotes:   "Hasil Psikotes",
  hasil_wawancara:  "Hasil Wawancara",
  // siap pakai kalau nanti login/logout ikut dicatat
  auth:             "Autentikasi",
};

export const MODULE_LIST = Object.keys(MODULE_LABELS);
export const ACTION_LIST = Object.keys(ACTION_CONFIG);

export function getActionConfig(aksi) {
  return ACTION_CONFIG[aksi] || { label: aksi || "Unknown", badgeClass: "bg-slate-100 text-slate-700 border-slate-200", dotClass: "bg-slate-400" };
}

export function getModuleLabel(modul) {
  return MODULE_LABELS[modul] || modul || "Unknown";
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDateTime(dateStr);
}

export function formatValueForDisplay(val) {
  if (val === null || val === undefined) return "—";
  if (val === "") return "(kosong)";
  if (typeof val === "boolean") return val ? "Ya" : "Tidak";
  if (Array.isArray(val)) return val.length === 0 ? "(kosong)" : val.join(", ");
  if (typeof val === "object") {
    try { const str = JSON.stringify(val, null, 2); return str === "{}" ? "(kosong)" : str; } catch { return String(val); }
  }
  return String(val);
}