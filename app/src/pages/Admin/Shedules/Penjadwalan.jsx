import React, { useEffect, useState } from "react";
import { Calendar, Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { ITEMS_PER_PAGE } from "./components/constants";
import TypeFilter from "./components/TypeFilter";
import Pagination from "./components/Pagination";
import ScheduleCard from "./components/ScheduleCard";
import ScheduleForm from "./components/ScheduleForm";
import ConfirmDialog from "./components/ConfirmDialog";

import {
  fetchSchedules,
  completeSchedule,
  deleteSchedule,
  markNoShowByAdmin,
  rejectScheduleApplicant,
} from "./services/schedules.api";

const TYPE_FILTER_STORAGE_KEY = "schedules_type_filter";

export default function SchedulesPage() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");

  const [typeFilter, setTypeFilter] = useState(
    () => localStorage.getItem(TYPE_FILTER_STORAGE_KEY) || "InterviewHC"
  );

  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: ITEMS_PER_PAGE,
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    description: "",
    confirmLabel: "",
    variant: "default",
    loading: false,
    action: null,
  });

  const closeConfirm = () =>
    setConfirmState((prev) => ({ ...prev, open: false }));

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / data.pageSize));

  const load = async ({ page = data.page } = {}) => {
    try {
      setLoading(true);
      const res = await fetchSchedules({
        date: selectedDate,
        type: typeFilter,
        page,
        pageSize: data.pageSize,
      });
      setData({
        items: res.items || [],
        total: res.total || 0,
        page: res.page || page,
        pageSize: res.pageSize || data.pageSize,
      });
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, typeFilter]);

  useEffect(() => {
    localStorage.setItem(TYPE_FILTER_STORAGE_KEY, typeFilter);
  }, [typeFilter]);

  const onComplete = async (id) => {
    try {
      await completeSchedule(id);
      toast.success("Jadwal dikonfirmasi selesai");
      await load({ page: data.page });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal konfirmasi");
    }
  };

  const onMarkNoShow = (id) => {
    setConfirmState({
      open: true,
      title: "Tandai kandidat tidak hadir?",
      description:
        "Lamaran kandidat ini akan otomatis ditolak setelah ditandai tidak hadir.",
      confirmLabel: "Ya, Tandai Tidak Hadir",
      variant: "danger",
      loading: false,
      action: async () => {
        await markNoShowByAdmin(id);
        toast.success("Kandidat ditandai tidak hadir, lamaran otomatis ditolak");
        await load({ page: data.page });
      },
    });
  };

  // ✅ Handler untuk menolak lamaran secara manual
  const onReject = (id) => {
    setConfirmState({
      open: true,
      title: "Tolak lamaran kandidat ini?",
      description:
        "Lamaran akan ditandai Ditolak dan jadwal ini akan ditutup.",
      confirmLabel: "Ya, Tolak Lamaran",
      variant: "danger",
      loading: false,
      action: async () => {
        await rejectScheduleApplicant(id);
        toast.success("Lamaran berhasil ditolak");
        await load({ page: data.page });
      },
    });
  };

  // ✅ Handler untuk reschedule (hapus jadwal lama, buka form buat jadwal baru)
  const onReschedule = (id) => {
    setConfirmState({
      open: true,
      title: "Reschedule jadwal ini?",
      description:
        "Jadwal lama akan dihapus. Anda akan diarahkan untuk membuat jadwal baru untuk kandidat yang sama.",
      confirmLabel: "Ya, Reschedule",
      variant: "default",
      loading: false,
      action: async () => {
        await deleteSchedule(id);
        toast.success("Jadwal lama dihapus. Silakan buat jadwal baru.");
        setShowForm(true);
      },
    });
  };

  const onDelete = (id) => {
    setConfirmState({
      open: true,
      title: "Hapus jadwal ini?",
      description: "Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Ya, Hapus",
      variant: "danger",
      loading: false,
      action: async () => {
        await deleteSchedule(id);
        toast.success("Jadwal dihapus");

        // Jika hapus item terakhir di halaman selain halaman 1, balik ke halaman sebelumnya
        const willBeEmpty = data.items.length === 1 && data.page > 1;
        await load({ page: willBeEmpty ? data.page - 1 : data.page });
      },
    });
  };

  const handleConfirmAccept = async () => {
    if (!confirmState.action) return;
    try {
      setConfirmState((prev) => ({ ...prev, loading: true }));
      await confirmState.action();
      closeConfirm();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Terjadi kesalahan, silakan coba lagi"
      );
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-sky-900">Penjadwalan</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 px-3 py-2 text-sm pl-9 transition-colors w-full sm:w-auto"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg text-white font-semibold transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 px-4 py-2 text-sm whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Buat Jadwal
          </button>
        </div>
      </div>

      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <TypeFilter value={typeFilter} onChange={(v) => setTypeFilter(v)} />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : data.items.length > 0 ? (
          data.items.map((s) => (
            <ScheduleCard
              key={s.id}
              item={s}
              onDelete={onDelete}
              onComplete={onComplete}
              onMarkNoShow={onMarkNoShow}
              onReject={onReject}
              onReschedule={onReschedule}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            Tidak ada jadwal yang ditemukan.
          </div>
        )}
      </div>

      <Pagination
        page={data.page}
        totalPages={totalPages}
        onChange={(p) => load({ page: p })}
      />

      <ScheduleForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => load({ page: 1 })}
      />

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        loading={confirmState.loading}
        onConfirm={handleConfirmAccept}
        onCancel={closeConfirm}
      />
    </div>
  );
}
