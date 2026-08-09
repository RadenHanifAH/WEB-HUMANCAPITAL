import React from "react";
import { Trash2, Eye } from "lucide-react";
import UserAvatar from "../components/UserAvatar"; // Sesuaikan path import UserAvatar Anda

const GRID_TEMPLATE = "grid-cols-[2.5fr_1.5fr_1fr_1fr_0.8fr]";

const getStatusColors = (statusAkhir) => {
  switch (statusAkhir) {
    case "hired":
    case "Diterima":
      return "bg-green-100 text-green-700";
    case "rejected":
    case "Ditolak":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID");
};

export default function ArchiveRow({ item, onDelete, onViewDetail }) {
  // ✅ FIX: Baca properti camelCase yang dikirim oleh mapArchiveItem di backend
  const displayName = item?.name || "-";
  const displayEmail = item?.email || "-";
  const positionText = item?.position || "-";
  const decisionDate = item?.decisionDate;
  const fotoProfil = item?.profile?.fotoProfile || null;
  const finalStatus = item?.finalStatus === "hired" ? "Diterima" : "Ditolak";

  return (
    <div
      className={`grid ${GRID_TEMPLATE} gap-4 items-center bg-white py-4 px-0 hover:bg-gray-50/70 transition-colors`}
    >
      {/* Pelamar */}
      <div className="flex items-center gap-3 pl-2">
        <UserAvatar
          fotoProfile={fotoProfil}
          className="w-10 h-10"
          alt={`Foto ${displayName}`}
        />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 uppercase truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
        </div>
      </div>

      {/* Posisi */}
      <span className="text-sm text-sky-700 font-medium truncate">{positionText}</span>

      {/* Status */}
      <div className="flex justify-center">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full text-center ${getStatusColors(
            finalStatus
          )}`}
        >
          {finalStatus}
        </span>
      </div>

      {/* Tanggal */}
      <span className="text-sm text-gray-600 text-center">
        {formatDate(decisionDate)}
      </span>

      {/* Aksi */}
      <div className="flex items-center justify-end gap-1 pr-2">
        <button
          onClick={() => onViewDetail?.(item?.id)}
          className="p-1.5 rounded-full text-sky-600 hover:bg-sky-50"
          title="Lihat Detail"
          type="button"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => onDelete?.(item?.id)}
          className="p-1.5 rounded-full text-red-500 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Hapus Permanen"
          type="button"
          disabled={!item?.id}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}