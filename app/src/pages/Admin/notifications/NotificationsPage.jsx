// src/pages/Admin/Notifications/NotificationsPage.jsx
//
// ✅ Sama seperti NotificationBell — TIDAK pakai react-router. Halaman ini
// dirender lewat MainContent.jsx saat `activeTab === "notifications"`.
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Bell,
  Calendar,
  UserPlus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  UserX,
  CheckCheck,
  Briefcase,
  FileText,
  ClipboardCheck,
  Users,
  UserMinus,
} from "lucide-react";
import {
  fetchAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./api/notificationsApi";

const TYPE_META = {
  interview_scheduled: { icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
  new_applicant: { icon: UserPlus, bg: "bg-orange-50", text: "text-orange-600" },
  system_update: { icon: RefreshCw, bg: "bg-gray-100", text: "text-gray-500" },
  application_rejected: { icon: XCircle, bg: "bg-red-50", text: "text-red-600" },
  application_accepted: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
  no_show: { icon: UserX, bg: "bg-red-50", text: "text-red-600" },

  pengajuan_submitted: { icon: FileText, bg: "bg-purple-50", text: "text-purple-600" },
  pengajuan_approved: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
  pengajuan_rejected: { icon: XCircle, bg: "bg-red-50", text: "text-red-600" },

  job_created: { icon: Briefcase, bg: "bg-teal-50", text: "text-teal-600" },
  job_updated: { icon: Briefcase, bg: "bg-teal-50", text: "text-teal-600" },
  job_deleted: { icon: Briefcase, bg: "bg-gray-100", text: "text-gray-500" },

  user_created: { icon: Users, bg: "bg-indigo-50", text: "text-indigo-600" },
  user_deleted: { icon: UserMinus, bg: "bg-gray-100", text: "text-gray-500" },

  assessment_saved: { icon: ClipboardCheck, bg: "bg-sky-50", text: "text-sky-600" },
};
const DEFAULT_META = { icon: Bell, bg: "bg-sky-50", text: "text-sky-600" };

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dateGroupLabel = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(d, now)) return "Hari Ini";
  if (isSameDay(d, yesterday)) return "Kemarin";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min}m lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}j lalu`;
  const day = Math.floor(hr / 24);
  return `${day}h lalu`;
};

export default function NotificationsPage({ onNavigateTab }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (pageArg) => {
      try {
        setLoading(true);
        const data = await fetchAllNotifications({
          page: pageArg,
          pageSize,
        });
        setItems(data.items || []);
        setTotal(data.total || 0);
        setPage(data.page || pageArg);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Kelompokkan notifikasi per label tanggal (Hari Ini / Kemarin / tanggal
  // lain), sambil mempertahankan urutan terbaru->terlama dari server.
  const grouped = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const label = dateGroupLabel(item.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (e) {
        console.error(e);
      }
    }
    // ✅ actionUrl sekarang berisi ID tab admin (mis. "schedule",
    // "applicants"), diteruskan ke handleTabChange lewat prop.
    if (item.actionUrl && onNavigateTab) onNavigateTab(item.actionUrl);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-sky-900">Notifikasi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Kelola dan lihat semua aktivitas rekrutmen.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 w-full sm:w-auto"
        >
          <CheckCheck className="h-4 w-4" />
          Tandai Semua Dibaca
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-14 flex flex-col items-center gap-2">
            <Bell className="h-8 w-8" />
            Tidak ada notifikasi
          </div>
        ) : (
          grouped.map(([label, groupItems]) => (
            <div key={label}>
              <p className="px-4 sm:px-6 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {label}
              </p>
              {groupItems.map((item) => {
                const meta = TYPE_META[item.type] || DEFAULT_META;
                const Icon = meta.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left flex gap-3 px-4 sm:px-6 py-3.5 border-t border-gray-50 hover:bg-gray-50 transition-colors ${
                      !item.isRead ? "bg-sky-50/40" : ""
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.bg} ${meta.text}`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-sm font-semibold text-gray-800 break-words">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>
                      <span className="block text-sm text-gray-500 mt-0.5 break-words">
                        {item.message}
                      </span>
                      {!item.isRead && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                          BELUM DIBACA
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Pagination sederhana */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => load(page - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 bg-white"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-gray-500">
            Halaman {page} dari {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => load(page + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-40 bg-white"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}