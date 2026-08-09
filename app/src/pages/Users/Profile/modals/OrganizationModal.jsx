import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "../../../../api/axiosInstance";

// ⚠️ FIX: nama field disesuaikan persis kolom Prisma model `organisasi`
const emptyForm = {
  peran: "",
  nama_organisasi: "",
  tanggal_mulai: "",
  tanggal_selesai: "",
  sedang_berlangsung: false,
  deskripsi: "",
};

const toInputDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const OrganizationModal = ({ isOpen, editingItem, onClose, onSuccess, onDeleted }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editingItem) {
      // ⚠️ FIX: baca field dari editingItem persis nama kolom Prisma
      setForm({
        peran: editingItem.peran || "",
        nama_organisasi: editingItem.nama_organisasi || "",
        tanggal_mulai: toInputDate(editingItem.tanggal_mulai),
        tanggal_selesai: toInputDate(editingItem.tanggal_selesai),
        sedang_berlangsung: !!editingItem.sedang_berlangsung,
        deskripsi: editingItem.deskripsi || "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ⚠️ FIX: validasi tetap sama persis, hanya field yang dicek diganti
    if (!form.peran || !form.nama_organisasi || !form.tanggal_mulai) {
      setError("Jabatan, nama organisasi, dan tanggal mulai wajib diisi.");
      return;
    }

    const payload = {
      peran: form.peran,
      nama_organisasi: form.nama_organisasi,
      tanggal_mulai: form.tanggal_mulai,
      tanggal_selesai: form.sedang_berlangsung ? null : form.tanggal_selesai || null,
      sedang_berlangsung: form.sedang_berlangsung,
      deskripsi: form.deskripsi,
    };

    try {
      setSaving(true);

      if (editingItem) {
        await axios.put(`/profile/organization/${editingItem.id}`, payload);
        onSuccess({ ...editingItem, ...payload }, true);
      } else {
        const res = await axios.post("/profile/organization", payload);
        onSuccess(res?.data?.data, false);
      }

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal menyimpan data organisasi."
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

      await axios.delete(`/profile/organization/${editingItem.id}`);

      onDeleted?.(editingItem);

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal menghapus data organisasi."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingItem ? "Edit Pengalaman Organisasi" : "Tambah Pengalaman Organisasi"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="organization-form"
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 overflow-y-auto"
        >
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jabatan
            </label>
            <input
              type="text"
              name="peran"
              value={form.peran}
              onChange={handleChange}
              placeholder="Contoh: Ketua Divisi IT"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Organisasi
            </label>
            <input
              type="text"
              name="nama_organisasi"
              value={form.nama_organisasi}
              onChange={handleChange}
              placeholder="Contoh: Himpunan Mahasiswa Informatika"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                value={form.tanggal_mulai}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={form.tanggal_selesai}
                onChange={handleChange}
                disabled={form.sedang_berlangsung}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="sedang_berlangsung"
              checked={form.sedang_berlangsung}
              onChange={handleChange}
            />
            Masih aktif di organisasi ini
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi (opsional)
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleChange}
              rows={3}
              placeholder="Ceritakan peran dan kontribusimu..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
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
              form="organization-form"
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

export default OrganizationModal;