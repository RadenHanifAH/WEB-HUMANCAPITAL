// src/components/admin/NotificationBell.jsx
//
// ✅ Admin panel kamu tidak pakai react-router untuk berpindah menu — semua
// diatur oleh `activeTab` (state) di Admin.jsx. Jadi komponen ini TIDAK
// pakai useNavigate/react-router sama sekali; navigasi dilakukan lewat
// prop `onNavigate(tabId)` yang diteruskan dari Admin.jsx -> handleTabChange.
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  Calendar,
  UserPlus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  UserX,
  Loader2,
} from "lucide-react";
import {
  fetchRecentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationsApi";

// Peta ikon & warna per tipe notifikasi. Tambah baris baru di sini kalau
// nanti ada tipe notifikasi baru dari modul lain.
const TYPE_META = {
  interview_scheduled: { icon: Calendar, bg: "bg-blue-50", text: "text-blue-600" },
  new_applicant: { icon: UserPlus, bg: "bg-orange-50", text: "text-orange-600" },
  system_update: { icon: RefreshCw, bg: "bg-gray-100", text: "text-gray-500" },
  application_rejected: { icon: XCircle, bg: "bg-red-50", text: "text-red-600" },
  application_accepted: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
  no_show: { icon: UserX, bg: "bg-red-50", text: "text-red-600" },
};
const DEFAULT_META = { icon: Bell, bg: "bg-sky-50", text: "text-sky-600" };

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

export default function NotificationBell({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRecentNotifications(5);
      setItems(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat sekali di awal + polling ringan tiap 30 detik supaya badge count
  // tetap ter-update walau dropdown tidak sedang dibuka.
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Tutup dropdown kalau klik di luar area komponen.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id);
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error(e);
      }
    }
    setOpen(false);
    // ✅ actionUrl sekarang berisi ID tab admin (mis. "schedule",
    // "applicants"), bukan URL — diteruskan ke handleTabChange lewat prop.
    if (item.actionUrl && onNavigate) onNavigate(item.actionUrl);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Notifikasi</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sky-600 hover:underline font-medium"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat...
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">
                Belum ada notifikasi
              </div>
            ) : (
              items.map((item) => {
                const meta = TYPE_META[item.type] || DEFAULT_META;
                const Icon = meta.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
                      !item.isRead ? "bg-sky-50/40" : ""
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.bg} ${meta.text}`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {item.title}
                        </span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {item.message}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-1">
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              // ✅ "notifications" adalah tab id baru yang ditambahkan di
              // MainContent.jsx, bukan URL.
              if (onNavigate) onNavigate("notifications");
            }}
            className="w-full text-center py-2.5 text-sm font-medium text-sky-600 hover:bg-sky-50 border-t border-gray-100 transition-colors"
          >
            Lihat Semua Notifikasi
          </button>
        </div>
      )}
    </div>
  );
}