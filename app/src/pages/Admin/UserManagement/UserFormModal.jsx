import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "divisi", label: "Divisi" },
];

const DIVISI_OPTIONS = [
  "Holdings",
  "Commercial",
  "Creative & Production",
  "ICT",
  "General Affairs",
  "Human Capital",
  "Risk & Legal",
];

const EMPTY_FORM = {
  nama: "",
  email: "",
  peran: "",
  divisi: "",
  password: "",
  confirmPassword: "",
};

export default function UserFormModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nama: user.nama || "",
        email: user.email || "",
        peran: user.peran || "",
        divisi: user.divisi || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [user]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleDivisiChange = (value) => {
    setForm((f) => ({
      ...f,
      divisi: value,
      nama: value ? `Kepala Divisi ${value}` : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit && form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        const payload = { ...form };
        if (!payload.password) {
          delete payload.password;
          delete payload.confirmPassword;
        }
        await axiosInstance.put(`/users/${user.id}`, payload);
      } else {
        await axiosInstance.post("/users", form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? "Edit User" : "Tambah User Baru"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="p-6 space-y-5"
        >
          <input
            type="text"
            name="fake-username"
            autoComplete="off"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
          <input
            type="password"
            name="fake-password"
            autoComplete="off"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nama Lengkap</label>
              <input
                value={form.nama}
                placeholder="Pilih divisi dulu"
                required
                readOnly
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Role Pengguna</label>
              <select
                value={form.peran}
                onChange={(e) => setField("peran", e.target.value)}
                required
                autoComplete="off"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">Pilih Role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Divisi</label>
              <select
                value={form.divisi}
                onChange={(e) => handleDivisiChange(e.target.value)}
                required
                autoComplete="off"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              >
                <option value="">Pilih Divisi</option>
                {DIVISI_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="budi@talentstream.id"
                required
                autoComplete="off"
                name="email-off"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Password{" "}
                {isEdit && (
                  <span className="text-gray-400">
                    (kosongkan jika tidak diubah)
                  </span>
                )}
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  required={!isEdit}
                  autoComplete="new-password"
                  name="new-password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Konfirmasi</label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                required={!isEdit}
                autoComplete="new-password"
                name="confirm-new-password"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}