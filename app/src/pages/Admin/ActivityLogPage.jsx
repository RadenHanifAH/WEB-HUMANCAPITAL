import { useState, useEffect, useCallback } from "react";
import {
  Activity, Search, ChevronLeft, ChevronRight,
  Clock, TrendingUp, AlertCircle, Filter
} from "lucide-react";
import { fetchActivityLogs, fetchActivityLogStats } from "../../api/activityLogApi";
import {
  ACTION_CONFIG, ACTION_LIST,
  getActionConfig, getModuleLabel, formatDateTime, formatTimeAgo
} from "../../constants/activityLog";
import LogDetailDrawer from "../../components/activity-log/LogDetailDrawer";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [aksi, setAksi] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchActivityLogs({
        search, aksi, startDate, endDate, page, limit: pageSize,
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, aksi, startDate, endDate, page, pageSize]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchActivityLogStats();
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Activity className="h-6 w-6 text-blue-600" /> Log Aktivitas Pengajuan SDM
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Jejak audit semua perubahan data Pengajuan SDM (khusus admin)
            </p>
          </div>
          {/* Tombol Export sudah dihapus */}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Aktivitas"   value={stats?.total ?? 0}     icon={<Activity className="h-5 w-5" />}     color="blue" />
          <StatCard label="Hari Ini"          value={stats?.today ?? 0}    icon={<Clock className="h-5 w-5" />}        color="emerald" />
          <StatCard label="7 Hari Terakhir"   value={stats?.thisWeek ?? 0} icon={<TrendingUp className="h-5 w-5" />}   color="amber" />
          <StatCard label="Modul Aktif"       value={stats?.byModule?.length ?? 1} icon={<Filter className="h-5 w-5" />} color="purple" />
        </div>

        {/* Filter Bar */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Cari deskripsi, pelaku..."
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Action filter */}
            <div className="min-w-[140px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Aksi</label>
              <select
                value={aksi}
                onChange={(e) => { setAksi(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">Semua Aksi</option>
                {ACTION_LIST.map((a) => (
                  <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {/* Filter Modul sudah dihapus (sudah hard-lock ke Pengajuan SDM) */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex items-center gap-2 text-slate-400">Memuat data...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <AlertCircle className="mb-2 h-8 w-8" />
              <p className="text-sm">Tidak ada log aktivitas ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 font-semibold text-slate-600">Waktu</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Pelaku</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Aksi</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Modul</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const actionCfg = getActionConfig(log.aksi);
                    return (
                      <tr
                        key={log.id}
                        onClick={() => handleRowClick(log)}
                        className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="text-xs font-medium text-slate-700">
                            {formatDateTime(log.created_at)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatTimeAgo(log.created_at)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{log.nama_pelaku}</div>
                          <div className="text-[11px] capitalize text-slate-400">
                            {log.peran_pelaku}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${actionCfg.badgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${actionCfg.dotClass}`} />
                            {actionCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-slate-600">
                            {getModuleLabel(log.modul)}
                          </span>
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <p className="truncate text-xs text-slate-500" title={log.deskripsi}>
                            {log.deskripsi || "—"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {logs.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total} log
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 enabled:hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-medium text-slate-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-40 enabled:hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <LogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    blue:    "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber:   "bg-amber-50 text-amber-600 border-amber-100",
    purple:  "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorMap[color] || colorMap.blue}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}