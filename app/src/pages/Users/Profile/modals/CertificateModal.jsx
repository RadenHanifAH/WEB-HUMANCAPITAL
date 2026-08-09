import React, { useEffect, useMemo, useState } from "react";
import { X, UploadCloud, FileText, Trash2, ExternalLink } from "lucide-react";
import axios from "../../../../api/axiosInstance";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const years = Array.from({ length: 20 }, (_, i) => 2035 - i);

// ⚠️ FIX: nama field disesuaikan persis kolom Prisma model `sertifikat`
// (nama, penerbit, diterbitkan, kadaluarsa, file_sertifikat).
// issuedMonth/issuedYear/expiredMonth/expiredYear tetap state lokal UI saja
// (bukan kolom database), jadi namanya dibiarkan seperti semula.
const emptyForm = {
  nama: "",
  penerbit: "",
  issuedMonth: "",
  issuedYear: "",
  expiredMonth: "",
  expiredYear: "",
  noExpiry: false,
  certificateFile: null, // File object baru yang dipilih user (belum diupload)
  existingFileUrl: "", // Path file yang sudah ada di server (saat edit)
  fileName: "",
  removeFile: false, // true jika user menghapus file lama tanpa ganti baru
};

const parseDateToMonthYear = (isoDate) => {
  if (!isoDate) return { month: "", year: "" };
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return { month: "", year: "" };
  return { month: String(d.getMonth()), year: String(d.getFullYear()) };
};

const monthYearToDateString = (monthIndex, year) => {
  if (monthIndex === "" || !year) return null;
  const mm = String(Number(monthIndex) + 1).padStart(2, "0");
  return `${year}-${mm}-01`;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ✅ Sama seperti pola di DetailModal.jsx — file_sertifikat dari backend
// berupa path relatif ("/uploads/certificates/xxx.pdf"), perlu digabung
// dengan origin API supaya bisa dibuka dari frontend (beda port/origin).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const resolveFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return BASE_URL + path;
};

// ✅ Ambil ekstensi file (".pdf", ".png", dst) dari sebuah nama/path file.
// Dipakai supaya label yang ditampilkan ke user tetap punya ekstensi yang
// benar walau teksnya sendiri kita ganti jadi nama sertifikat.
const extractFileExtension = (path) => {
  if (!path) return "";
  const clean = String(path).split("?")[0];
  const match = clean.match(/\.[0-9a-zA-Z]+$/);
  return match ? match[0].toLowerCase() : "";
};

const CertificateModal = ({
  isOpen,
  editingItem,
  onClose,
  onSuccess,
  onDeleted,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // ⚠️ FIX: baca dari editingItem.diterbitkan / editingItem.kadaluarsa
        // (sebelumnya salah baca .issuedAt / .expiredAt yang tidak pernah ada)
        const issued = parseDateToMonthYear(editingItem.diterbitkan);
        const expired = parseDateToMonthYear(editingItem.kadaluarsa);
        setForm({
          nama: editingItem.nama || "",
          penerbit: editingItem.penerbit || "",
          issuedMonth: issued.month,
          issuedYear: issued.year,
          expiredMonth: expired.month,
          expiredYear: expired.year,
          noExpiry: !editingItem.kadaluarsa,
          certificateFile: null,
          existingFileUrl: editingItem.file_sertifikat || "",
          fileName: "",
          removeFile: false,
        });
      } else {
        setForm(emptyForm);
      }
      setError(null);
    }
  }, [editingItem, isOpen]);

  // ✅ Preview URL agar sertifikat bisa diklik/dilihat langsung dari modal.
  // PENTING: hook ini harus dipanggil sebelum early return `if (!isOpen)`
  // di bawah, supaya jumlah hooks konsisten di setiap render.
  const previewUrl = useMemo(() => {
    if (form.certificateFile) {
      return URL.createObjectURL(form.certificateFile);
    }
    if (form.existingFileUrl) {
      return resolveFileUrl(form.existingFileUrl);
    }
    return null;
  }, [form.certificateFile, form.existingFileUrl]);

  useEffect(() => {
    // Revoke object URL lama supaya tidak menumpuk di memori browser
    return () => {
      if (previewUrl && form.certificateFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, form.certificateFile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "noExpiry" && checked) {
      setForm((prev) => ({
        ...prev,
        noExpiry: true,
        expiredMonth: "",
        expiredYear: "",
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }
    setError(null);
    setForm((prev) => ({
      ...prev,
      certificateFile: file,
      fileName: file.name,
      removeFile: false,
    }));
  };

  const handleRemoveFile = () => {
    setForm((prev) => ({
      ...prev,
      certificateFile: null,
      existingFileUrl: "",
      fileName: "",
      removeFile: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.nama.trim() || !form.penerbit.trim()) {
      setError("Nama sertifikat dan organisasi penerbit wajib diisi.");
      return;
    }
    if (!form.issuedMonth || !form.issuedYear) {
      setError("Tanggal diterbitkan wajib diisi.");
      return;
    }
    if (!form.noExpiry && (!form.expiredMonth || !form.expiredYear)) {
      setError(
        "Batas masa aktif wajib diisi, atau tandai tidak memiliki batas waktu.",
      );
      return;
    }

    // ⚠️ FIX: field FormData disesuaikan persis dengan yang dibaca
    // profile.service.js createCertificate/updateCertificate:
    // nama, penerbit, diterbitkan, kadaluarsa (bukan name/issuer/issuedAt/expiredAt)
    const fd = new FormData();
    fd.append("nama", form.nama.trim());
    fd.append("penerbit", form.penerbit.trim());
    fd.append("diterbitkan", monthYearToDateString(form.issuedMonth, form.issuedYear));
    fd.append("noExpiry", String(form.noExpiry));
    if (!form.noExpiry) {
      fd.append(
        "kadaluarsa",
        monthYearToDateString(form.expiredMonth, form.expiredYear),
      );
    }
    if (form.certificateFile) {
      // Nama field harus "certificateFile" agar cocok dengan
      // multer.single("certificateFile") di backend
      fd.append("certificateFile", form.certificateFile);
    }
    if (editingItem && form.removeFile) {
      fd.append("removeFile", "true");
    }

    try {
      setSaving(true);
      if (editingItem) {
        const res = await axios.put(`/profile/certificate/${editingItem.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess(res?.data?.data || { ...editingItem }, true);
      } else {
        const res = await axios.post("/profile/certificate", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onSuccess(res?.data?.data, false);
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal menyimpan data sertifikat.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    setError(null);
    try {
      setDeleting(true);
      await axios.delete(`/profile/certificate/${editingItem.id}`);
      onDeleted?.(editingItem);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal menghapus data sertifikat.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const hasFile = Boolean(form.certificateFile || form.existingFileUrl);

  // ✅ Label generik "Sertifikat" + ekstensi asli filenya — tidak lagi
  // menyertakan nama sertifikat, dan tidak lagi bergantung ke nama file
  // acak dari server. Link tetap bisa diklik lewat previewUrl.
  const fileExtension = form.certificateFile
    ? extractFileExtension(form.certificateFile.name)
    : extractFileExtension(form.existingFileUrl);

  const displayFileName = `Sertifikat${fileExtension}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingItem ? "Edit Sertifikat" : "Tambah Sertifikat"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form
          id="certificate-form"
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-5 overflow-y-auto"
        >
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Sertifikat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Contoh: Google Cloud Professional Developer"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisasi Penerbit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="penerbit"
              value={form.penerbit}
              onChange={handleChange}
              placeholder="Contoh: Google"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Tanggal Diterbitkan
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Bulan <span className="text-red-500">*</span>
                </label>
                <select
                  name="issuedMonth"
                  value={form.issuedMonth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Pilih Bulan</option>
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <select
                  name="issuedYear"
                  value={form.issuedYear}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Batas Masa Aktif
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Bulan
                  {!form.noExpiry && <span className="text-red-500"> *</span>}
                </label>

                <select
                  name="expiredMonth"
                  value={form.expiredMonth}
                  onChange={handleChange}
                  disabled={form.noExpiry}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Bulan</option>

                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tahun
                  {!form.noExpiry && <span className="text-red-500"> *</span>}
                </label>

                <select
                  name="expiredYear"
                  value={form.expiredYear}
                  onChange={handleChange}
                  disabled={form.noExpiry}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
                >
                  <option value="">Pilih Tahun</option>

                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <input
                type="checkbox"
                name="noExpiry"
                checked={form.noExpiry}
                onChange={handleChange}
              />
              Sertifikat ini tidak memiliki batas waktu masa aktif
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Sertifikat
            </label>
            {hasFile ? (
              <div className="flex items-center justify-between gap-3 border border-gray-300 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  {previewUrl ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-600 hover:text-sky-700 underline underline-offset-2 truncate"
                      title="Buka sertifikat di tab baru"
                    >
                      {displayFileName}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-700 truncate">
                      {displayFileName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-sky-600"
                      title="Lihat sertifikat"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-red-600"
                    title="Hapus sertifikat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-300 rounded-lg px-3 py-5 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition">
                <UploadCloud className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Klik untuk unggah sertifikat
                </span>
                <span className="text-xs text-gray-400">
                  JPG, PNG, atau PDF, maks 5MB
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
          <div>
            {editingItem && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              form="certificate-form"
              disabled={saving || deleting}
              className="px-4 py-2 text-sm rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : editingItem ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;