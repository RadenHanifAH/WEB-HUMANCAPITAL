// app/src/pages/Admin/Pengajuan/PengajuanBadge.jsx
import React from "react";
import { Clock, CheckCircle2, XCircle, FileEdit } from "lucide-react";

const CONFIG = {
  DRAFT: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-gray-100 text-gray-500 border-gray-200",
  },
  PENDING: {
    label: "Menunggu",
    icon: Clock,
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  APPROVED: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  REJECTED: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-50 text-red-500 border-red-200",
  },
};

export default function PengajuanBadge({ status }) {
  const cfg  = CONFIG[status] ?? CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}