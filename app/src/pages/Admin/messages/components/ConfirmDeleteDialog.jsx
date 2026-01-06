import React from "react";
import { Trash2, X } from "lucide-react";

export default function ConfirmDeleteDialog({
  open,
  title = "Konfirmasi Hapus",
  description = "",
  confirmText = "Hapus",
  cancelText = "Batal",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => {
          if (!loading) onClose?.();
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6">
        {/* Close icon */}
        <button
          type="button"
          onClick={() => {
            if (!loading) onClose?.();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          title="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700">
            <Trash2 className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (!loading) onClose?.();
            }}
            disabled={loading}
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Menghapus..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
