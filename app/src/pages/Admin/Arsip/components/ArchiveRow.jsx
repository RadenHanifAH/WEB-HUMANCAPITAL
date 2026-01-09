import React from "react";
import { Trash2 } from "lucide-react";
import UserAvatar from "../components/UserAvatar";

const GRID_TEMPLATE = "grid-cols-[2.5fr_1.5fr_1fr_1fr_0.5fr]";

const getStatusColors = (status) => {
  switch (status) {
    case "hired":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "hired":
      return "Diterima";
    case "rejected":
      return "Ditolak";
    default:
      return status || "-";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID");
};

export default function ArchiveRow({ item, onDelete }) {
  const user = item?.user;
  const profile = user?.profile;

  const displayName = user?.name || item?.name || item?.applicantName || "-";
  const displayEmail = user?.email || item?.email || "-";

  // ✅ Ambil foto dari profile user (utama), fallback ke item
  const fotoProfile = profile?.fotoProfile || item?.fotoProfile || null;

  const positionText = item?.job?.title || item?.position || "-";
  const decisionDate =
    item?.decisionDate || item?.archivedDate || item?.appliedAt || null;

  return (
    <div
      className={`grid ${GRID_TEMPLATE} gap-4 items-center bg-white py-3 px-0 hover:bg-gray-50 transition-colors`}
    >
      {/* Pelamar */}
      <div className="flex items-center gap-3 pl-2">
        <UserAvatar
          fotoProfile={fotoProfile}
          className="w-10 h-10"
          alt={`Foto ${displayName}`}
        />

        <div>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-gray-500">{displayEmail}</p>
        </div>
      </div>

      {/* Posisi */}
      <span className="text-sm text-gray-700">{positionText}</span>

      {/* Status */}
      <div className="flex justify-center">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full text-center ${getStatusColors(
            item?.finalStatus
          )}`}
        >
          {getStatusLabel(item?.finalStatus)}
        </span>
      </div>

      {/* Tanggal */}
      <span className="text-sm text-gray-700 text-center">
        {formatDate(decisionDate)}
      </span>

      {/* Aksi */}
      <div className="text-right pr-2">
        <button
          onClick={() => onDelete?.(item?.id)}
          className="p-1 rounded-full text-red-500 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Hapus Permanen"
          disabled={!item?.id}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
