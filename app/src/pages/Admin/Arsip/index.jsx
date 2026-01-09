import React, { useEffect, useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import StatusFilter from "./components/StatusFilter";
import ConfirmModal from "./components/ConfirmModal";
import ArchiveRow from "./components/ArchiveRow";


import { fetchArchives, exportArchivesCSV, deleteArchive } from "./services/archives.api";

const GRID_TEMPLATE = "grid-cols-[2.5fr_1.5fr_1fr_1fr_0.5fr]";

export default function ArsipPage() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 10 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async ({ page = data.page, pageSize = data.pageSize } = {}) => {
    try {
      setLoading(true);
      const res = await fetchArchives({ q, status, page, pageSize });
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
  }, [q, status]);

  const canNext = useMemo(() => data.page * data.pageSize < data.total, [data.page, data.pageSize, data.total]);

  const handleExport = async () => {
    try {
      const res = await exportArchivesCSV({ q, status });
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

      <h1 className="text-2xl font-semibold text-sky-900 mb-6">Arsip Pelamar</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button className="flex-1 px-4 py-3 text-sm font-semibold border-b-2 border-sky-600 text-sky-700">
            Pelamar Diarsipkan
          </button>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari pelamar..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <StatusFilter value={status} onChange={setStatus} />

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Download size={16} /> Export Data
              </button>
            </div>
          </div>

          {/* Header Table */}
          <div className={`grid ${GRID_TEMPLATE} gap-4 py-3 border-b border-gray-200 text-sm font-semibold text-black`}>
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
              data.items.map((item) => <ArchiveRow key={item.id} item={item} onDelete={askDelete} />)
            ) : (
              <div className="text-center py-10 text-gray-500">Tidak ada pelamar yang ditemukan.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total: <b>{data.total}</b>
            </div>

            <div className="flex gap-2">
              <button
                disabled={data.page <= 1 || loading}
                onClick={() => load({ page: data.page - 1 })}
                className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
              >
                Prev
              </button>

              <div className="px-3 py-2 text-sm text-gray-700">Page {data.page}</div>

              <button
                disabled={!canNext || loading}
                onClick={() => load({ page: data.page + 1 })}
                className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
