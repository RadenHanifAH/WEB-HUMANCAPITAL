import React, { useEffect, useState } from "react";
import { Calendar, Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { ITEMS_PER_PAGE } from "./components/constants";
import TypeFilter from "./components/TypeFilter";
import Pagination from "./components/Pagination";
import ScheduleCard from "./components/ScheduleCard";
import ScheduleForm from "./components/ScheduleForm";

import { fetchSchedules, completeSchedule, deleteSchedule } from "./services/schedules.api";

export default function SchedulesPage() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: ITEMS_PER_PAGE });

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

  const onComplete = async (id) => {
    try {
      await completeSchedule(id);
      toast.success("Jadwal dikonfirmasi selesai");
      await load({ page: data.page });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal konfirmasi");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;
    try {
      await deleteSchedule(id);
      toast.success("Jadwal dihapus");

      // reload halaman (kalau page kosong, mundur)
      const willBeEmpty = data.items.length === 1 && data.page > 1;
      await load({ page: willBeEmpty ? data.page - 1 : data.page });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Gagal hapus jadwal");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-center" />

      <h1 className="text-2xl font-semibold text-sky-900 mb-3">Jadwal Test</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 px-3 py-2 text-sm pl-9 transition-colors"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <TypeFilter value={typeFilter} onChange={(v) => setTypeFilter(v)} />
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg text-white font-semibold transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Buat Jadwal
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : data.items.length > 0 ? (
          data.items.map((s) => (
            <ScheduleCard key={s.id} item={s} onDelete={onDelete} onComplete={onComplete} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">Tidak ada jadwal interview yang ditemukan.</div>
        )}
      </div>

      <Pagination page={data.page} totalPages={totalPages} onChange={(p) => load({ page: p })} />

      <ScheduleForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={() => load({ page: 1 })}
      />
    </div>
  );
}
