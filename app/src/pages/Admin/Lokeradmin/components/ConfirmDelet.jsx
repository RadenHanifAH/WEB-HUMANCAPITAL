import React from "react";
import { Trash2, X } from "lucide-react";

export default function ConfirmDelete({ isOpen, onClose, onConfirm, job }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border-l-4 border-red-500 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Konfirmasi Hapus</h2>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <p className="text-gray-700 mb-6">
          Yakin ingin menghapus lowongan:
          <span className="font-semibold text-gray-900 block mt-1">
            {job?.title}
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
