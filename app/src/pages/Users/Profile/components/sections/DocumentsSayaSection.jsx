import React, { useRef, useState } from "react";
import {
  FileText,
  Link2,
  Upload,
  Loader2 as LoaderIcon,
} from "lucide-react";
import axios from "../../../../../api/axiosInstance";

// ✅ Sama seperti CertificateModal.jsx — url_cv/url_portofolio dari backend
// berupa path relatif ("/uploads/documents/xxx.pdf"), perlu digabung
// dengan origin API supaya bisa dibuka dari frontend (beda port/origin).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const resolveFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  return BASE_URL + path;
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

  // ✅ Persis nama kolom model `dokumen_pengguna` di schema.prisma:
  // url_cv, nama_cv, url_portofolio, nama_portofolio
  const hasCv = Boolean(documents?.url_cv);
  const hasPortfolio = Boolean(documents?.url_portofolio);
  // nama_portofolio null -> berarti yang tersimpan adalah LINK, bukan file upload
  const portfolioIsLink = hasPortfolio && !documents?.nama_portofolio;

  const cvUrl = resolveFileUrl(documents?.url_cv);
  const portfolioUrl = resolveFileUrl(documents?.url_portofolio);
  // Kalau link eksternal (bukan file upload), tampilkan & buka apa adanya,
  // tidak perlu digabung dengan BASE_URL.
  const portfolioHref = portfolioIsLink ? documents?.url_portofolio : portfolioUrl;

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
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-700 hover:underline truncate"
              title="Buka CV di tab baru"
            >
              {documents.nama_cv || "CV"}
            </a>
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
            <a
              href={portfolioHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-700 hover:underline truncate"
              title="Buka portofolio di tab baru"
            >
              {portfolioIsLink
                ? documents.url_portofolio
                : documents.nama_portofolio || "Portofolio"}
            </a>
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