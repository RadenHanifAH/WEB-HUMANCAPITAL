import React, { useRef, useState } from "react";
import { FileText, Link2, Upload, Loader2 as LoaderIcon } from "lucide-react";
import axios from "../../../../../api/axiosInstance";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const resolveFileUrl = (path) => {
  if (!path) return null;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  // Cukup pastikan ada leading slash, JANGAN tambahin /api lagi
  // karena BASE_URL (VITE_API_URL) sudah termasuk /api
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return BASE_URL + normalizedPath;
};

// ✅ BARU: Chrome/browser modern memblokir navigasi langsung ke data: URL
// lewat klik <a target="_blank"> (dianggap potensi phishing). Solusinya:
// konversi Data URI -> Blob -> Object URL saat diklik, baru dibuka di tab
// baru. Untuk URL biasa (http/https), tetap buka langsung seperti biasa.
const openFile = (url) => {
  if (!url) return;

  if (url.startsWith("data:")) {
    try {
      const [header, base64] = url.split(",");
      const mimeMatch = header.match(/data:(.*);base64/);
      const mime = mimeMatch?.[1] || "application/octet-stream";

      const byteString = atob(base64);
      const bytes = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank", "noopener,noreferrer");

      // Bersihkan object URL setelah tab baru sempat memuatnya
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error("Gagal membuka dokumen:", err);
    }
    return;
  }

  // URL biasa (http/https) -> buka langsung
  window.open(url, "_blank", "noopener,noreferrer");
};

const DokumenSayaSection = ({
  documents,
  onDocumentsUpdated,
  onOpenPortfolioModal,
}) => {
  const cvInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [cvError, setCvError] = useState(null);
  const [portfolioError, setPortfolioError] = useState(null);

  const hasCv = Boolean(documents?.url_cv);
  const hasPortfolio = Boolean(documents?.url_portofolio);
  const portfolioIsLink = hasPortfolio && !documents?.nama_portofolio;

  const cvUrl = resolveFileUrl(documents?.url_cv);
  const portfolioUrl = resolveFileUrl(documents?.url_portofolio);
  const portfolioHref = portfolioIsLink
    ? documents?.url_portofolio
    : portfolioUrl;

  const handlePickCv = () => cvInputRef.current?.click();
  const handlePickPortfolioFile = () => portfolioInputRef.current?.click();

  const handleCvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setCvError("File CV harus berformat PDF.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingCv(true);
      setCvError(null);

      const formData = new FormData();
      formData.append("cv", file);

      const res = await axios.post("/profile/documents/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onDocumentsUpdated?.(res?.data?.data);
    } catch (err) {
      setCvError(err?.response?.data?.message || "Gagal mengunggah CV.");
    } finally {
      setUploadingCv(false);
      e.target.value = "";
    }
  };

  const handlePortfolioFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPortfolioError("File portofolio harus berformat PDF.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingPortfolio(true);
      setPortfolioError(null);

      const formData = new FormData();
      formData.append("portfolio", file);

      const res = await axios.post(
        "/profile/documents/portfolio/file",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      onDocumentsUpdated?.(res?.data?.data);
    } catch (err) {
      setPortfolioError(
        err?.response?.data?.message || "Gagal mengunggah portofolio.",
      );
    } finally {
      setUploadingPortfolio(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h3 className="text-base font-bold tracking-wide text-gray-900 mb-4">
        DOKUMEN SAYA
      </h3>

      {/* CV BOX */}
      <div className="border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-sky-600 flex-shrink-0" />
          {hasCv && cvUrl ? (
            <button
              type="button"
              onClick={() => openFile(cvUrl)}
              className="text-sm font-medium text-sky-700 hover:underline truncate text-left"
              title="Buka CV di tab baru"
            >
              {documents.nama_cv || "CV"}
            </button>
          ) : (
            <span className="text-sm font-medium text-gray-800 truncate">
              Belum ada CV diunggah
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-semibold ${
              hasCv ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {hasCv ? "Tersimpan" : "Belum tersimpan"}
          </span>

          <button
            type="button"
            onClick={handlePickCv}
            disabled={uploadingCv}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-60"
          >
            {uploadingCv && <LoaderIcon className="w-4 h-4 animate-spin" />}
            {hasCv ? "Ganti" : "Unggah"}
          </button>
        </div>

        <input
          ref={cvInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleCvChange}
        />

        {cvError && <p className="text-xs text-red-600 mt-2">{cvError}</p>}
      </div>

      {/* PORTOFOLIO BOX */}
      <div className="border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-sky-600 flex-shrink-0" />

          {hasPortfolio ? (
            portfolioIsLink ? (
              <a
                href={portfolioHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-sky-700 hover:underline truncate"
                title="Buka portofolio di tab baru"
              >
                {documents.url_portofolio}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => openFile(portfolioHref)}
                className="text-sm font-medium text-sky-700 hover:underline truncate text-left"
                title="Buka portofolio di tab baru"
              >
                {documents.nama_portofolio || "Portofolio"}
              </button>
            )
          ) : (
            <span className="text-sm font-medium text-gray-800">
              Portofolio
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenPortfolioModal}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs sm:text-sm py-2 px-2 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {hasPortfolio ? "Ubah Link" : "Tambah Link"}
            </span>
          </button>

          <button
            type="button"
            onClick={handlePickPortfolioFile}
            disabled={uploadingPortfolio}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-sky-700 text-sky-700 hover:bg-sky-50 font-semibold text-xs sm:text-sm py-2 px-2 rounded-lg transition-colors disabled:opacity-60"
          >
            {uploadingPortfolio ? (
              <LoaderIcon className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span className="truncate">Unggah File</span>
          </button>
        </div>

        <input
          ref={portfolioInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePortfolioFileChange}
        />

        {portfolioError && (
          <p className="text-xs text-red-600 mt-2">{portfolioError}</p>
        )}
      </div>
    </div>
  );
};

export default DokumenSayaSection;
