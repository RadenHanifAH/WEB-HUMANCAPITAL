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
  { length: 60 },
  (_, i) => new Date().getFullYear() - i,
);

const degreeOptions = ["SMA", "D3", "D4", "S1", "S2", "S3"];

// ⚠️ FIX: nama field disesuaikan persis kolom Prisma model `pendidikan`
const emptyForm = {
  institusi: "",
  gelar: "",
  jurusan: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  sedang_berlangsung: false,
};

// "2019-01-01T00:00:00.000Z" -> { month: "0", year: "2019" }
const parseDateToMonthYear = (isoDate) => {
  if (!isoDate) return { month: "", year: "" };

  const d = new Date(isoDate);

  if (Number.isNaN(d.getTime())) return { month: "", year: "" };

  return {
    month: String(d.getMonth()),
    year: String(d.getFullYear()),
  };
};

// month index (0-11) + year -> "YYYY-MM-01"
const monthYearToDateString = (monthIndex, year) => {
  if (monthIndex === "" || !year) return null;

  const mm = String(Number(monthIndex) + 1).padStart(2, "0");

  return `${year}-${mm}-01`;
};

export default function EducationModal({
  isOpen,
  onClose,
  onSuccess,
  onDeleted,
  editingItem = null,
}) {
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  const isEditMode = Boolean(editingItem);

  useEffect(() => {
    if (!isOpen) return;

    setAlert({
      open: false,
      type: "warning",
      title: "",
      message: "",
    });

    if (editingItem) {
      // ⚠️ FIX: baca field dari editingItem persis nama kolom Prisma
      // (tanggal_mulai, tanggal_selesai, sedang_berlangsung).
      const start = parseDateToMonthYear(editingItem.tanggal_mulai);
      const end = parseDateToMonthYear(editingItem.tanggal_selesai);

      setForm({
        institusi: editingItem.institusi || "",
        gelar: editingItem.gelar || "",
        jurusan: editingItem.jurusan || "",
        startMonth: start.month,
        startYear: start.year,
        endMonth: end.month,
        endYear: end.year,
        sedang_berlangsung: !!editingItem.sedang_berlangsung,
      });
    } else {
      setForm(emptyForm);
    }
  }, [isOpen, editingItem]);

  const showAlert = (type, title, message) => {
    setAlert({
      open: true,
      type,
      title,
      message,
    });
  };

  const handleClose = () => {
    setAlert({
      open: false,
      type: "warning",
      title: "",
      message: "",
    });

    onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // ⚠️ FIX: validasi tetap sama persis, hanya field yang dicek diganti
      // nama (institusi, sedang_berlangsung).
      if (!form.institusi.trim()) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Nama institusi wajib diisi.",
        );
        return;
      }

      if (!form.startMonth || !form.startYear) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Tanggal mulai wajib diisi.",
        );
        return;
      }

      if (!form.sedang_berlangsung && (!form.endMonth || !form.endYear)) {
        showAlert(
          "warning",
          "Data Belum Lengkap",
          "Tanggal selesai wajib diisi.",
        );
        return;
      }

      setLoading(true);

      const payload = {
        institusi: form.institusi.trim(),
        gelar: form.gelar || null,
        jurusan: form.jurusan.trim() || null,

        tanggal_mulai: monthYearToDateString(form.startMonth, form.startYear),

        tanggal_selesai: form.sedang_berlangsung
          ? null
          : monthYearToDateString(form.endMonth, form.endYear),

        sedang_berlangsung: form.sedang_berlangsung,
      };

      if (isEditMode) {
        await axios.put(`/profile/education/${editingItem.id}`, payload);

        if (onSuccess) {
          onSuccess({ ...editingItem, ...payload }, true);
        }

        showAlert("success", "Berhasil", "Pendidikan berhasil diperbarui.");
      } else {
        const res = await axios.post("/profile/education", payload);

        if (onSuccess) {
          onSuccess(res.data.data, false);
        }

        setForm(emptyForm);

        showAlert("success", "Berhasil", "Pendidikan berhasil ditambahkan.");
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
    if (!editingItem) return;

    try {
      setDeleting(true);

      await axios.delete(`/profile/education/${editingItem.id}`);

      if (onDeleted) {
        onDeleted(editingItem);
      }

      onClose();
    } catch (err) {
      console.error(err);

      showAlert(
        "error",
        "Gagal Menghapus",
        err?.response?.data?.message ||
          "Terjadi kesalahan saat menghapus data.",
      );
    } finally {
      setDeleting(false);
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
              {isEditMode ? "Edit Pendidikan" : "Tambah Pendidikan"}
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
              Tambahkan riwayat pendidikan Anda untuk melengkapi profil.
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Jenjang
              </label>

              <select
                value={form.gelar}
                onChange={(e) => handleChange("gelar", e.target.value)}
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">Pilih Jenjang</option>

                {degreeOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sekolah / Universitas <span className="text-red-500">*</span>
              </label>

              <input
                value={form.institusi}
                onChange={(e) => handleChange("institusi", e.target.value)}
                placeholder="Contoh: SMAN 15 Bandung"
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Jurusan / Bidang Studi
              </label>

              <input
                value={form.jurusan}
                onChange={(e) => handleChange("jurusan", e.target.value)}
                placeholder="Contoh: IPS (Ilmu Pengetahuan Sosial)"
                className="w-full rounded-md border px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mulai <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.startMonth}
                  onChange={(e) => handleChange("startMonth", e.target.value)}
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
                  value={form.startYear}
                  onChange={(e) => handleChange("startYear", e.target.value)}
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
                Selesai <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <select
                  disabled={form.sedang_berlangsung}
                  value={form.endMonth}
                  onChange={(e) => handleChange("endMonth", e.target.value)}
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
                  disabled={form.sedang_berlangsung}
                  value={form.endYear}
                  onChange={(e) => handleChange("endYear", e.target.value)}
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
                  checked={form.sedang_berlangsung}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    setForm((prev) => ({
                      ...prev,
                      sedang_berlangsung: checked,
                      ...(checked
                        ? {
                            endMonth: "",
                            endYear: "",
                          }
                        : {}),
                    }));
                  }}
                />
                Saya sedang menempuh pendidikan ini
              </label>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t px-5 py-4">
            <div>
              {isEditMode && (
                <button
                  onClick={handleDelete}
                  disabled={deleting || loading}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deleting ? "Menghapus..." : "Hapus"}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading || deleting}
                className="rounded-md border px-5 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || deleting}
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

          setAlert({
            open: false,
            type: "warning",
            title: "",
            message: "",
          });

          if (isSuccess) {
            handleClose();
          }
        }}
      />
    </>
  );
}