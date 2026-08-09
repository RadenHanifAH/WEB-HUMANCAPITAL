import React, { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import StatusFilter from "./components/StatusFilter";
import PositionFilter from "./components/PositionFilter";
import ConfirmModal from "./components/ConfirmModal";
import ArchiveRow from "./components/ArchiveRow";
import ArchiveDetailModal from "./components/ArchiveDetailModal";
import Pagination from "./components/Pagination";

import {
  fetchArchives,
  fetchArchivePositions,
  fetchArchiveDetail,
  exportArchivesCSV,
  deleteArchive,
} from "./services/archives.api";

const GRID_TEMPLATE = "grid-cols-[2.5fr_1.5fr_1fr_1fr_0.8fr]";

export default function ArsipPage() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [position, setPosition] = useState("all");
  const [positionOptions, setPositionOptions] = useState([]);

  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 10 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ===== Detail modal =====
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const load = async ({ page = 1, pageSize = data.pageSize } = {}) => {
    try {
      setLoading(true);
      const res = await fetchArchives({ q, status, position, page, pageSize });
      setData({
        items: res.items || [],
        total: res.total || 0,
        page: res.page || page,
        pageSize: res.pageSize || pageSize,
      });
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat arsip pelamar");
      setData({ items: [], total: 0, page: 1, pageSize: 10 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, position]);

  // ✅ Ambil daftar posisi unik sekali di awal untuk dropdown "Semua Posisi"
  useEffect(() => {
    fetchArchivePositions()
      .then((items) => setPositionOptions(items))
      .catch((e) => console.error("Gagal memuat daftar posisi:", e));
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportArchivesCSV({ q, status, position });
      const blob = new Blob([res.data], { type: "text/csv" });

      const cd = res.headers?.["content-disposition"];
      let filename = `arsip_pelamar_${new Date().toISOString().slice(0, 10)}.csv`;
      if (cd) {
        const m = cd.match(/filename="(.+)"/);
        if (m) filename = m[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Gagal export data");
    }
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteArchive(deleteId);
      toast.success("Berhasil menghapus arsip");
      setConfirmOpen(false);
      setDeleteId(null);
      await load({ page: 1 });
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus arsip");
    }
  };

  const handleViewDetail = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetchArchiveDetail(id);
      setDetailData(res);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat detail pelamar");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <Toaster position="top-center" />

      <ConfirmModal
        isOpen={confirmOpen}
        message="Yakin ingin menghapus permanen pelamar ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />

      <ArchiveDetailModal
        isOpen={detailOpen}
        loading={detailLoading}
        data={detailData}
        onClose={() => setDetailOpen(false)}
      />

      <h1 className="text-2xl font-semibold text-sky-900 mb-6">Arsip Pelamar</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* ✅ Hanya satu tab: "Pelamar Diarsipkan" — "Riwayat Penolakan" dihapus */}
        <div className="flex border-b border-gray-200">
          <button className="px-4 py-3 text-sm font-semibold border-b-2 border-sky-600 text-sky-700">
            Pelamar Diarsipkan
          </button>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari nama pelamar atau posisi..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusFilter value={status} onChange={setStatus} />
              <PositionFilter value={position} positions={positionOptions} onChange={setPosition} />

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-sky-200 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-50 transition-colors"
              >
                <Download size={16} /> Export Data
              </button>
            </div>
          </div>

          {/* Header Table */}
          <div className={`grid ${GRID_TEMPLATE} gap-4 py-3 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide`}>
            <span className="pl-14">Pelamar</span>
            <span>Posisi</span>
            <span className="text-center">Status Akhir</span>
            <span className="text-center">Tanggal Keputusan</span>
            <span className="text-right pr-2">Aksi</span>
          </div>

          {/* Items */}
          <div className="mt-0 space-y-0 divide-y divide-gray-100">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : data.items.length > 0 ? (
              data.items.map((item) => (
                <ArchiveRow
                  key={item.id}
                  item={item}
                  onDelete={askDelete}
                  onViewDetail={handleViewDetail}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">Tidak ada pelamar yang ditemukan.</div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            loading={loading}
            onPageChange={(page) => load({ page })}
          />
        </div>
      </div>
    </div>
  );
}