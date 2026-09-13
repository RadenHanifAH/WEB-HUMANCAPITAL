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
    () => localStorage.getItem(TYPE_FILTER_STORAGE_KEY) || "InterviewHC",
  );

  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: ITEMS_PER_PAGE,
  });

  // ✅ BARU: menyimpan konteks kandidat + tipe jadwal yang sedang
  // di-reschedule, supaya saat ScheduleForm dibuka ulang, langkah
  // "Pilih Kandidat" sudah otomatis terisi (tipe yang sama + kandidat
  // yang sama sudah ter-centang), bukan mulai kosong dari nol.
  const [rescheduleContext, setRescheduleContext] = useState(null);
  // shape: { type, candidate: { applicationId, applicantName, position, avatar } } | null

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
        "Kandidat akan ditandai tidak hadir. Lamaran TIDAK langsung ditolak — Anda masih bisa memilih untuk menolak lamaran atau membuat jadwal ulang (reschedule) untuk kandidat ini setelahnya.",
      confirmLabel: "Ya, Tandai Tidak Hadir",
      variant: "danger",
      loading: false,
      action: async () => {
        await markNoShowByAdmin(id);
        toast.success("Kandidat ditandai tidak hadir");
        await load({ page: data.page });
      },
    });
  };

  // ✅ Handler untuk menolak lamaran secara manual
  const onReject = (id) => {
    setConfirmState({
      open: true,
      title: "Tolak lamaran kandidat ini?",
      description: "Lamaran akan ditandai Ditolak dan jadwal ini akan ditutup.",
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

  // ✅ FIX: Handler reschedule sekarang:
  //   1. Menyimpan info kandidat + tipe dari item yang ada di state
  //      SEBELUM dihapus (data.items sudah punya semua field yang
  //      dibutuhkan: applicationId, applicantName, position, avatar, type).
  //   2. Menghapus jadwal lama di backend.
  //   3. me-reload daftar jadwal (sebelumnya TIDAK dilakukan — ini
  //      penyebab utama kartu lama tetap terlihat & bisa ter-klik ulang
  //      meski datanya sudah terhapus, yang berujung error "tidak
  //      ditemukan" saat diklik kedua kalinya).
  //   4. Membuka ScheduleForm dengan tipe & kandidat yang sama sudah
  //      otomatis terisi, supaya tidak perlu mencari & mencentang ulang.
  const onReschedule = (id) => {
    const item = data.items.find((s) => s.id === id);

    setConfirmState({
      open: true,
      title: "Reschedule jadwal ini?",
      description:
        "Anda akan diarahkan untuk membuat jadwal baru untuk kandidat yang sama. Jadwal lama baru akan dihapus SETELAH jadwal baru berhasil dibuat — kalau Anda batal di tengah jalan, jadwal lama tetap aman dan tidak hilang.",
      confirmLabel: "Ya, Reschedule",
      variant: "default",
      loading: false,
      // ✅ FIX UTAMA: TIDAK menghapus jadwal lama di sini lagi.
      // Sebelumnya deleteSchedule(id) dipanggil duluan sebelum form baru
      // sempat diisi/disubmit — kalau user batal di tengah jalan, data
      // jadwal kandidat itu sudah hilang tanpa ada penggantinya.
      // Sekarang kita cuma menyiapkan konteks (tipe + kandidat +
      // scheduleIdToReplace) dan membuka form. Penghapusan jadwal lama
      // baru dilakukan oleh ScheduleForm SETELAH jadwal baru berhasil
      // dibuat (lihat ScheduleForm.jsx -> handleSubmit).
      action: async () => {
        if (item) {
          setRescheduleContext({
            type: item.type,
            scheduleIdToReplace: item.id,
            candidate: {
              applicationId: item.applicationId,
              applicantName: item.applicantName,
              position: item.position,
              avatar: item.avatar,
            },
          });
        } else {
          setRescheduleContext(null);
        }

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
        e?.response?.data?.message || "Terjadi kesalahan, silakan coba lagi",
      );
      setConfirmState((prev) => ({ ...prev, loading: false }));
    }
  };

  // ✅ BARU: dipakai tombol "Buat Jadwal" biasa (bukan reschedule),
  // memastikan tidak membawa konteks reschedule lama yang tersisa.
  const openBlankForm = () => {
    setRescheduleContext(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setRescheduleContext(null);
  };

  const handleFormCreated = () => {
    setRescheduleContext(null);
    load({ page: 1 });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-sky-900">
            Penjadwalan
          </h1>
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
            onClick={openBlankForm}
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
        onClose={handleFormClose}
        onCreated={handleFormCreated}
        // ✅ BARU: konteks reschedule (undefined kalau buat jadwal baru biasa)
        initialType={rescheduleContext?.type}
        preselectedApplicant={rescheduleContext?.candidate}
        scheduleIdToReplace={rescheduleContext?.scheduleIdToReplace}
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
