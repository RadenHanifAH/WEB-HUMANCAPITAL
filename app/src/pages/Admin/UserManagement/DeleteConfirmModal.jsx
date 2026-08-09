import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ user, onCancel, onConfirm, deleting }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Hapus User?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Anda akan menghapus akun <span className="font-medium">{user.nama}</span> ({user.email}).
          Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-60"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}