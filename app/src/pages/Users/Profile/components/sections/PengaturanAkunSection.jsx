import React, { memo } from "react";
import { Eye, EyeOff } from "lucide-react";

// ✅ letakkan component di luar agar tidak remount tiap ketik
const PasswordInput = memo(function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600">{label}</label>

      <div className="relative mt-1">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full p-2 pr-10 border border-gray-300 rounded-md"
          autoComplete="off"
        />

        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
});

export default function PengaturanAkunSection({
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  passwordError,
  onSave,
}) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Pengaturan Akun</h2>
      <p className="text-sm text-gray-500 mb-6">Ubah password akun kamu.</p>

      <div className="space-y-4">
        <PasswordInput
          label="Password Saat Ini"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={showCurrentPassword}
          onToggleVisible={() => setShowCurrentPassword((v) => !v)}
        />

        <PasswordInput
          label="Password Baru"
          value={newPassword}
          onChange={setNewPassword}
          visible={showNewPassword}
          onToggleVisible={() => setShowNewPassword((v) => !v)}
        />

        <PasswordInput
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirmPassword}
          onToggleVisible={() => setShowConfirmPassword((v) => !v)}
        />

        <div className="text-xs text-gray-500 bg-gray-50 border rounded-md p-3">
          Password harus mengandung:
          <ul className="list-disc ml-5 mt-1">
            <li>Minimal 8 karakter</li>
            <li>Minimal 1 huruf besar</li>
            <li>Minimal 1 angka</li>
            <li>Minimal 1 simbol</li>
          </ul>
        </div>

        {passwordError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            {passwordError}
          </div>
        )}

        <button
          type="button"
          onClick={onSave}
          className="mt-2 px-5 py-2 rounded-lg text-white bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 shadow"
        >
          Simpan Password
        </button>
      </div>
    </div>
  );
}
