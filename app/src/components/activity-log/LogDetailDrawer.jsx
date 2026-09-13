import { X, User, Clock, Globe, FileText, Tag } from "lucide-react";
import ChangeDiff from "./ChangeDiff";
import {
  getActionConfig,
  getModuleLabel,
  formatDateTime,
} from "../../constants/activityLog";

export default function LogDetailDrawer({ log, open, onClose }) {
  if (!log) return null;

  const actionCfg = getActionConfig(log.aksi);
  const perubahan = Array.isArray(log.perubahan) ? log.perubahan : [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl transform overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            Detail Log Aktivitas
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
              <User className="h-6 w-6 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{log.nama_pelaku}</p>
              <p className="text-sm text-slate-500">
                {log.pengguna?.email || "—"} ·{" "}
                <span className="capitalize">{log.peran_pelaku}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${actionCfg.badgeClass}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${actionCfg.dotClass}`}
              />{" "}
              {actionCfg.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <Tag className="h-3 w-3" /> {getModuleLabel(log.modul)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <FileText className="h-3.5 w-3.5" /> Deskripsi
            </div>
            <p className="text-sm text-slate-700">{log.deskripsi || "—"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock className="h-3 w-3" /> Waktu
              </div>
              <p className="text-sm text-slate-700">
                {formatDateTime(log.created_at)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Globe className="h-3 w-3" /> IP Address
              </div>
              <p className="text-sm text-slate-700">{log.ip_address || "—"}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-800">
              Perubahan Data
            </h3>
            <ChangeDiff perubahan={perubahan} />
          </div>
        </div>
      </aside>
    </>
  );
}
