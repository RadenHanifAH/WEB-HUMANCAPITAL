import React from "react";
import { Save } from "lucide-react";
import SettingsInput from "../SettingsInput";

const PengaturanAkunSection = ({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  showNewPassword,
  showConfirmPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  passwordError,
  setPasswordError,
  onSave,
}) => {
  const isDisabled =
    (newPassword === "" && confirmPassword === "") ||
    (!!newPassword && newPassword !== confirmPassword);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">Pengaturan Akun</h3>
      <p className="text-sm text-gray-500 mt-1 mb-6">Atur password akun</p>

      <h4 className="text-lg font-bold text-gray-800 mt-6 mb-4 border-t border-gray-300 pt-4">
        Ubah Password
      </h4>

      {passwordError && (
        <div className="mb-4 -mt-2 text-red-600 text-sm font-medium p-2 bg-red-50 rounded-lg border border-red-200">
          {passwordError}
        </div>
      )}

      <SettingsInput
        label="Password Baru"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          if (passwordError) setPasswordError(null);
        }}
        customType="password"
        isPasswordVisible={showNewPassword}
        showToggle={true}
        onToggleVisibility={() => setShowNewPassword((prev) => !prev)}
        readOnly={false}
      />

      <SettingsInput
        label="Konfirmasi Password Baru"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (passwordError) setPasswordError(null);
        }}
        customType="password"
        isPasswordVisible={showConfirmPassword}
        showToggle={true}
        onToggleVisibility={() => setShowConfirmPassword((prev) => !prev)}
        readOnly={false}
      />

      <div className="mt-8 pt-4 border-t border-gray-300">
        <button
          onClick={onSave}
          className="w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isDisabled}
        >
          <Save size={20} className="mr-2" /> Simpan Password
        </button>
      </div>
    </div>
  );
};

export default PengaturanAkunSection;
