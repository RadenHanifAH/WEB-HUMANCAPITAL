import React, { useEffect, useState } from "react";
import { X, Download, Loader2, FileWarning } from "lucide-react";

/**
 * Modal preview PDF. Menerima `buildDoc` (fungsi yang mengembalikan objek
 * dengan method `.output(type)` dan `.save(filename)` — bisa berupa jsPDF
 * biasa, ATAU Promise yang resolve ke objek serupa) supaya PDF baru dibuat
 * saat modal dibuka — bukan disimpan permanen di memori.
 *
 * ✅ FIX: sekarang mendukung `buildDoc` ASYNC (mengembalikan Promise).
 * Ini dibutuhkan untuk dokumen yang perlu MENGGABUNGKAN file lain (mis.
 * dokumen pendukung yang diunggah kandidat) ke dalam PDF akhir — proses
 * gabung itu melibatkan pembacaan file & pemrosesan halaman yang sifatnya
 * asynchronous (lihat generateInterviewPdf di pdfGenerators.js).
 * `await` terhadap nilai yang BUKAN Promise tetap langsung resolve, jadi
 * perubahan ini tidak merusak buildDoc lama yang sinkron (mis.
 * generatePsikotestPdf).
 */
const PdfPreviewModal = ({ open, onClose, buildDoc, fileName = "dokumen.pdf" }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [docRef, setDocRef] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let createdUrl = null;

    setError(null);
    setBlobUrl(null);
    setDocRef(null);

    (async () => {
      try {
        const doc = await buildDoc();
        if (cancelled) return;

        setDocRef(doc);
        const url = URL.createObjectURL(doc.output("blob"));
        createdUrl = url;
        setBlobUrl(url);
      } catch (e) {
        console.error("Gagal membuat PDF:", e);
        if (!cancelled) setError("Gagal membuat dokumen PDF.");
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const handleDownload = () => {
    if (docRef) docRef.save(fileName);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800 truncate">{fileName}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!blobUrl}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg disabled:opacity-40 transition"
            >
              <Download size={13} /> Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100">
          {error && (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <FileWarning size={28} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {!error && !blobUrl && (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm">Menyiapkan dokumen...</p>
            </div>
          )}
          {!error && blobUrl && (
            <iframe title={fileName} src={blobUrl} className="w-full h-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;