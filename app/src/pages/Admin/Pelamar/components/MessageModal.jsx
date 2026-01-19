import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../../../api/axiosInstance";
import { API_APPLICANTS } from "../utils/constants";

const MessageModal = ({ isOpen, onClose, data, onSuccess }) => {
  const { applicant, action, status, stage } = data;
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!applicant) return;

    const baseMessage = `Halo ${applicant.name}, ini adalah pesan dari tim rekrutmen.`;

    if (action === "reject") {
      setMessage(
        `${baseMessage}\n\nTerima kasih atas waktu dan usaha Anda. Kami mohon maaf, saat ini kami belum bisa melanjutkan proses lamaran Anda ke tahap berikutnya.`
      );
    } else if (action === "accept") {
      setMessage(
        `${baseMessage}\n\nSelamat! Anda telah diterima untuk posisi ${applicant.position}. Kami akan segera menghubungi Anda untuk proses Onboarding.`
      );
    }
  }, [applicant, action]);

  const handleSubmit = async () => {
    if (!message.trim()) return toast.error("Pesan tidak boleh kosong");
    if (!applicant?.id) return toast.error("Data pelamar tidak valid");

    setIsSubmitting(true);
    const loadingToast = toast.loading("Mengirim pesan dan memperbarui status...");

    try {
      await axiosInstance.put(`${API_APPLICANTS}/${applicant.id}/status`, {
        status,
        stage,
        message,
      });

      toast.success("Status berhasil diperbarui!", { id: loadingToast });
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div
          className={`p-4 text-white font-bold text-center ${
            action === "accept" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {action === "accept" ? "Konfirmasi Penerimaan" : "Konfirmasi Penolakan"}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nama Pelamar:</p>
            <p className="font-semibold text-sky-900">{applicant?.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Pesan untuk Pelamar:</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              rows="8"
              placeholder="Tulis pesan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white font-semibold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 ${
                action === "accept"
                  ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                  : "bg-red-600 hover:bg-red-700 shadow-red-200"
              }`}
            >
              {isSubmitting ? "Memproses..." : "Kirim & Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
