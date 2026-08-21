/* eslint-disable no-unused-vars */
// app/src/pages/Admin/Pengajuan/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  Eye,
  ClipboardList,
} from "lucide-react";
import PengajuanDetail from "./PengajuanDetail";
import PengajuanBadge from "./PengajuanBadge";
import { getPengajuanList, getPengajuanStats } from "./PengajuanService";

// ⬅️ "Draft" dihapus, hanya sisakan status yang relevan untuk workflow review
const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu Review" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
];

// ✅ FIX: bg/border warna-warni dihapus. Sekarang kartu polos putih dengan
// border abu-abu netral (samakan dengan kartu ringkasan "Total Pelamar /
// Lowongan Aktif / Lamaran Hari Ini"), hanya ikon yang tetap berwarna.
const STAT_CARDS = [
  {
    key: "total",
    label: "Total Pengajuan",
    icon: ClipboardList,
    color: "text-blue-600",
  },
  {
    key: "pending",
    label: "Menunggu Review",
    icon: Clock,
    color: "text-amber-500",
  },
  {
    key: "approved",
    label: "Disetujui",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },
  {
    key: "rejected",
    label: "Ditolak",
    icon: XCircle,
    color: "text-red-500",
  },
];

const LIMIT = 10;

export default function AdminPengajuanPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Fetch list ────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, statsData] = await Promise.all([
        getPengajuanList({ search, status, page, limit: LIMIT }),
        getPengajuanStats(),
      ]);
      setItems(listData.items);
      setTotal(listData.total);
      setStats(statsData);
    } catch (err) {
      console.error("Fetch pengajuan error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Tutup dropdown filter kalau klik di luar area filter
  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-filter-dropdown]")) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  // Reset ke page 1 kalau search/filter berubah
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };
  const handleStatus = (val) => {
    setStatus(val);
    setPage(1);
    setFilterOpen(false);
  };

  const handleAction = () => {
    fetchList();
    setSelected(null);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const formatTanggal = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ✅ FIX: ambil tanggal dari kemungkinan nama field apapun yang dikirim
  // backend — camelCase (tanggalPermintaan), snake_case
  // (tanggal_permintaan), sampai fallback ke createdAt kalau field
  // tanggal permintaan memang tidak ada. Ini supaya tanggal tetap muncul
  // walau format field dari API belum konsisten dengan form pengajuan.
  const getTanggalPengajuan = (item) =>
    item?.tanggalPermintaan ??
    item?.tanggal_permintaan ??
    item?.createdAt ??
    item?.created_at ??
    null;

  // ✅ FIX: ID diganti menjadi nomor urut berdasarkan posisi baris di halaman
  // saat ini (bukan lagi format #SDM-xxx).
  const generateRowNumber = (index) => (page - 1) * LIMIT + index + 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sky-900">Pengajuan SDM</h1>
      </div>

      {/* ── Stat Cards ── */}
      {/* ✅ FIX: kartu ini sekarang murni tampilan (seperti kartu ringkasan
          di Dashboard) — onClick dan cursor-pointer dihapus supaya tidak
          bisa diklik/tidak terlihat interaktif lagi. Bg/border juga sudah
          dibuat polos putih + abu-abu netral, hanya ikon yang berwarna. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-100 bg-white shadow-sm px-5 py-4 flex items-start justify-between"
          >
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats[key] ?? 0}
              </p>
            </div>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div className="flex gap-5 items-start">
        {/* ── Left: Table ── */}
        {/* ⬅️ overflow-hidden DIHAPUS dari sini agar dropdown filter tidak terpotong */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Toolbar */}
          <div className="relative flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari divisi atau posisi..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative" data-filter-dropdown>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  status
                    ? "border-sky-400 bg-sky-50 text-sky-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                {status
                  ? STATUS_OPTIONS.find((o) => o.value === status)?.label
                  : "Filter"}
                <ChevronDown className="w-3 h-3" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-48">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatus(opt.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        status === opt.value
                          ? "text-sky-600 font-semibold bg-sky-50"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table — overflow-x-auto tetap di sini saja, supaya scroll horizontal tabel tetap jalan tanpa memotong dropdown di atas */}
          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium">No</th>
                  <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium">
                    Divisi / Dept
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Posisi</th>
                  <th className="text-left px-4 py-3 font-medium">Jumlah</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-gray-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-300" />
                      Memuat data...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-gray-400">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">
                        Tidak ada pengajuan ditemukan
                      </p>
                      {(search || status) && (
                        <button
                          className="text-sky-500 text-xs mt-1 underline"
                          onClick={() => {
                            handleSearch("");
                            handleStatus("");
                          }}
                        >
                          Reset filter
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`cursor-pointer transition-colors hover:bg-sky-50/40 ${
                        selected?.id === item.id
                          ? "bg-sky-50 border-l-2 border-l-sky-500"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-sky-600 font-semibold whitespace-nowrap">
                        {generateRowNumber(index)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {formatTanggal(getTanggalPengajuan(item))}
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium text-xs">
                        {item.departemen || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {item.posisi}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {item.jumlah} Org
                      </td>
                      <td className="px-4 py-3">
                        <PengajuanBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari{" "}
                {total} pengajuan
              </span>
              <div className="flex gap-1">
                <PagBtn
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </PagBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PagBtn
                      key={p}
                      active={p === page}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PagBtn>
                  ),
                )}
                <PagBtn
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </PagBtn>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Detail ── */}
        <div className="w-[400px] shrink-0">
          {selected ? (
            <PengajuanDetail
              pengajuan={selected}
              onClose={() => setSelected(null)}
              onAction={handleAction}
            />
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400">
              <Eye className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="font-medium text-gray-500 text-sm">
                Pilih pengajuan
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Klik salah satu baris untuk melihat detail lengkap.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pagination Button ─────────────────────────────────────────
function PagBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${
        active
          ? "bg-sky-600 text-white border-sky-600"
          : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}