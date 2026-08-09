import React, { useState, useEffect } from "react";
import axios from "../../../../api/axiosInstance";
import AlertModal from "../components/ui/AlertModal";

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

const years = Array.from(
  { length: 50 },
  (_, i) => new Date().getFullYear() - i,
);

const employmentTypes = [
  "Penuh waktu",
  "Paruh waktu",
  "Pekerja Lepas",
  "Pekerja Mandiri",
  "Kontrak",
  "Magang",
];

// ⚠️ FIX: nama field disesuaikan persis kolom Prisma model `pengalaman_kerja`
const emptyForm = {
  jabatan: "",
  perusahaan: "",
  jenis_pekerjaan: "",
  lokasi: "",
  bulan_mulai: "",
  tahun_mulai: "",
  bulan_selesai: "",
  tahun_selesai: "",
  sedang_bekerja: false,
};

export default function WorkExperienceModal({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  editingItem = null,
}) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  const isEditMode = Boolean(editingItem);

  useEffect(() => {
    if (!isOpen) return;

    setAlert({ open: false, type: "warning", title: "", message: "" });

    if (editingItem) {
      // ⚠️ FIX: baca field dari editingItem persis nama kolom Prisma.
      // Logic konversi bulan (index 0-11 untuk <select>, disimpan sebagai
      // 1-12 di database) TETAP SAMA seperti sebelumnya.
      setForm({
        jabatan: editingItem.jabatan || "",
        perusahaan: editingItem.perusahaan || "",
        jenis_pekerjaan: editingItem.jenis_pekerjaan || "",
        lokasi: editingItem.lokasi || "",
        bulan_mulai:
          editingItem.bulan_mulai != null
            ? String(editingItem.bulan_mulai - 1)
            : "",
        tahun_mulai: editingItem.tahun_mulai || "",
        bulan_selesai:
          editingItem.bulan_selesai != null
            ? String(editingItem.bulan_selesai - 1)
            : "",
        tahun_selesai: editingItem.tahun_selesai || "",
        sedang_bekerja: !!editingItem.sedang_bekerja,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, editingItem]);

  const showAlert = (type, title, message) => {
    setAlert({ open: true, type, title, message });
  };

  const handleClose = () => {
    setAlert({ open: false, type: "warning", title: "", message: "" });
    onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // ⚠️ FIX: validasi tetap sama persis, hanya field yang dicek diganti
      // nama sesuai form baru (jabatan, perusahaan, bulan_mulai, dst).
      if (!form.jabatan.trim()) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Posisi pekerjaan wajib diisi.",
        );
        return;
      }
      if (!form.perusahaan.trim()) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Nama perusahaan wajib diisi.",
        );
        return;
      }
      if (!form.bulan_mulai || !form.tahun_mulai) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Tanggal mulai wajib diisi.",
        );
        return;
      }
      if (!form.sedang_bekerja && (!form.bulan_selesai || !form.tahun_selesai)) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Tanggal selesai wajib diisi.",
        );
        return;
      }

      setLoading(true);

      const payload = {
        jabatan: form.jabatan.trim(),
        perusahaan: form.perusahaan.trim(),
        jenis_pekerjaan: form.jenis_pekerjaan || null,
        lokasi: form.lokasi.trim() || null,
        bulan_mulai: Number(form.bulan_mulai) + 1,
        tahun_mulai: String(form.tahun_mulai),
        bulan_selesai: form.sedang_bekerja ? null : Number(form.bulan_selesai) + 1,
        tahun_selesai: form.sedang_bekerja ? null : String(form.tahun_selesai),
        sedang_bekerja: form.sedang_bekerja,
      };

      if (isEditMode) {
        await axios.put(`/profile/work-experience/${editingItem.id}`, payload);
        if (onSuccess) onSuccess({ ...editingItem, ...payload }, true);
        showAlert(
          "success",
          "Berhasil",
          "Pengalaman kerja berhasil diperbarui.",
        );
      } else {
        const res = await axios.post("/profile/work-experience", payload);
        if (onSuccess) onSuccess(res.data.data, false);
        setForm(emptyForm);
        showAlert(
          "success",
          "Berhasil",
          "Pengalaman kerja berhasil ditambahkan.",
        );
      }
    } catch (err) {
      console.error(err);
      showAlert(
        "error",
        "Gagal Menyimpan",
        err?.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem?.id) {
      showAlert("error", "Gagal Menghapus", "Data tidak valid.");
      return;
    }

    try {
      setDeleteLoading(true);

      const deletedItem = editingItem;

      console.log("Menghapus work-experience id:", deletedItem.id);

      await axios.delete(`/profile/work-experience/${deletedItem.id}`);

      // Sukses dihapus di server -> langsung tutup modal & update list di parent
      if (onDelete) onDelete(deletedItem);

      setForm(emptyForm);
      setAlert({ open: false, type: "warning", title: "", message: "" });
    } catch (err) {
      console.error(err);

      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || "";

      // Kalau backend bilang data tidak ditemukan (sudah terhapus / tidak valid),
      // anggap saja sebagai sukses dari sisi UI -> tetap hapus dari list & tutup modal,
      // supaya tidak ada data "hantu" yang nyangkut di tampilan.
      const isAlreadyGone =
        status === 404 ||
        (status === 400 && /tidak ditemukan/i.test(serverMsg));

      if (isAlreadyGone) {
        if (onDelete) onDelete(editingItem);
        setForm(emptyForm);
        setAlert({ open: false, type: "warning", title: "", message: "" });
        return;
      }

      showAlert(
        "error",
        "Gagal Menghapus",
        serverMsg || "Terjadi kesalahan saat menghapus data.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "Edit Pengalaman Kerja" : "Tambah Pengalaman Kerja"}
            </h2>
            <button
              onClick={handleClose}
              className="text-xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* BODY */}
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
            <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-700">
              Harap isi detail pengalaman kerja Anda secara akurat untuk
              mempermudah perekrut meninjau profil Anda.
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Posisi <span className="text-red-500">*</span>
              </label>
              <input
                value={form.jabatan}
                onChange={(e) => handleChange("jabatan", e.target.value)}
                placeholder="Contoh: Frontend Developer"
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Jenis Pekerjaan
              </label>
              <select
                value={form.jenis_pekerjaan}
                onChange={(e) => handleChange("jenis_pekerjaan", e.target.value)}
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">Pilih Jenis Pekerjaan</option>
                {employmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                value={form.perusahaan}
                onChange={(e) => handleChange("perusahaan", e.target.value)}
                placeholder="PT Teknologi Indonesia"
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Lokasi
              </label>
              <input
                value={form.lokasi}
                onChange={(e) => handleChange("lokasi", e.target.value)}
                placeholder="Contoh: Kota Bandung, Jawa Barat, Indonesia"
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mulai <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.bulan_mulai}
                  onChange={(e) => handleChange("bulan_mulai", e.target.value)}
                  className="rounded-md border px-3 py-2.5"
                >
                  <option value="">Pilih Bulan</option>
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={form.tahun_mulai}
                  onChange={(e) => handleChange("tahun_mulai", e.target.value)}
                  className="rounded-md border px-3 py-2.5"
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Berakhir <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  disabled={form.sedang_bekerja}
                  value={form.bulan_selesai}
                  onChange={(e) => handleChange("bulan_selesai", e.target.value)}
                  className="rounded-md border px-3 py-2.5 disabled:bg-gray-100"
                >
                  <option value="">Pilih Bulan</option>
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  disabled={form.sedang_bekerja}
                  value={form.tahun_selesai}
                  onChange={(e) => handleChange("tahun_selesai", e.target.value)}
                  className="rounded-md border px-3 py-2.5 disabled:bg-gray-100"
                >
                  <option value="">Pilih Tahun</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.sedang_bekerja}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((prev) => ({
                      ...prev,
                      sedang_bekerja: checked,
                      ...(checked ? { bulan_selesai: "", tahun_selesai: "" } : {}),
                    }));
                  }}
                />
                Saya saat ini bekerja di sini
              </label>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t px-5 py-4">
            {isEditMode ? (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="rounded-md border px-5 py-2 text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        open={alert.open}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => {
          const isSuccess = alert.type === "success";
          setAlert({ open: false, type: "warning", title: "", message: "" });
          if (isSuccess) handleClose();
        }}
      />
    </>
  );
}