import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatCard from "./components/StatCard";
import StatusBadge from "./components/StatusBadge";
import { useDivisiDashboard } from "../../hooks/divisi/useDivisiDashboard";
import axios from "../../api/axiosInstance";

const STATUS_FILTERS = [
  { value: "", label: "Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const LIMIT = 5;

const SkeletonRow = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

export default function DivisiDashboard() {
  const navigate = useNavigate();
  const { data: statsData } = useDivisiDashboard();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchList = useCallback(async (searchVal, statusVal, pageVal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/divisi/pengajuan", {
        params: {
          search: searchVal,
          status: statusVal,
          page: pageVal,
          limit: LIMIT,
        },
      });
      const payload = res.data?.data ?? {};
      setItems(payload.items ?? []);
      setTotal(payload.total ?? 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal memuat daftar pengajuan");
    } finally {
      setLoading(false);
    }
  }, []);

  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchList(search, statusFilter, 1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter, fetchList]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchList(search, statusFilter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const stats = [
    {
      icon: ClipboardList,
      label: "Total Pengajuan",
      value: statsData?.total_pengajuan ?? "0",
      color: "blue",
    },
    {
      icon: Clock,
      label: "Menunggu Persetujuan",
      value: statsData?.pending ?? "0",
      color: "yellow",
    },
    {
      icon: CheckCircle2,
      label: "Disetujui",
      value: statsData?.approved ?? "0",
      color: "green",
    },
    {
      icon: XCircle,
      label: "Ditolak",
      value: statsData?.rejected ?? "0",
      color: "red",
    },
  ];

  const handleEdit = (item) => {
    navigate(`/divisi/pengajuan/edit/${item.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Dashboard Pengajuan
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Kelola permintaan sumber daya manusia secara sistematis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-800">
            Riwayat Pengajuan SDM
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari posisi..."
                className="pl-9 pr-3 py-2 w-48 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Filter className="w-3.5 h-3.5" />
                {STATUS_FILTERS.find((f) => f.value === statusFilter)?.label ||
                  "Filter"}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-100 shadow-lg z-20 py-1">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => {
                        setStatusFilter(f.value);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        statusFilter === f.value
                          ? "text-blue-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-5 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-12">
                  No
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Tanggal
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Posisi / Jabatan
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Departemen
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 w-24 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : !items.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    Belum ada pengajuan
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {String((page - 1) * LIMIT + idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-sm">
                        {item.posisi}
                      </p>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {item.alasan}
                      </p>

                      {item.status === "REJECTED" && item.catatan_admin && (
                        <p
                          className="text-xs text-red-500 mt-1 line-clamp-2"
                          title={item.catatan_admin}
                        >
                          <span className="font-medium">Alasan ditolak:</span>{" "}
                          {item.catatan_admin}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {item.departemen}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        disabled={
                          item.status !== "DRAFT" && item.status !== "PENDING"
                        }
                        title={
                          item.status !== "DRAFT" && item.status !== "PENDING"
                            ? "Pengajuan yang sudah diproses tidak dapat diedit"
                            : "Edit pengajuan"
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                          bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors
                          disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            <span>
              Menampilkan {items.length} dari {total} pengajuan
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium ${
                      page === p
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
