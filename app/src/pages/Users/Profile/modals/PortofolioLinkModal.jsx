import React, { useEffect, useState } from "react";
import { X, Loader2 as LoaderIcon } from "lucide-react";
import axios from "../../../../api/axiosInstance";

const PortfolioLinkModal = ({ isOpen, currentLink, onClose, onSuccess }) => {
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLink(currentLink || "");
      setError(null);
    }
  }, [isOpen, currentLink]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // ✅ KIRIM PAYLOAD SNAKE_CASE SESUAI PRISMA
      const res = await axios.put("/profile/documents/portfolio/link", {
        url_portofolio: link,
      });

      onSuccess?.(res?.data?.data);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal menyimpan link portofolio.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {currentLink ? "Ubah Link Portofolio" : "Tambah Link Portofolio"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Link Portofolio
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />

        <p className="text-xs text-gray-400 mt-1.5">
          Atau gunakan tombol "Unggah File" pada card Portofolio jika ingin
          mengunggah file PDF langsung.
        </p>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-60"
          >
            {saving && <LoaderIcon className="w-4 h-4 animate-spin" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioLinkModal;
