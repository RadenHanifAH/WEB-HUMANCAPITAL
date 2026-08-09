/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, memo } from "react";
import { Loader, Eye, EyeOff, Settings as SettingsIcon, CheckCircle, XCircle } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import axios from "../../api/axiosInstance";

const Tabs = ({ activeTab, setActiveTab }) => {
  // ✅ FIX: label ditukar supaya sesuai dengan isi konten di bawahnya.
  // key "general" (identitas: foto/nama/email) sekarang berlabel "Profil",
  // key "profile" (ubah password) sekarang berlabel "Umum". Key internal
  // sengaja TIDAK diubah supaya logic activeTab di bawah tetap sama persis.
  const tabs = [
    { key: "general", label: "Profil" },
    { key: "profile", label: "Umum" },
    { key: "notifications", label: "Notifikasi" },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-wrap text-sm font-medium text-center text-gray-500">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 px-4 py-3 transition-colors focus:outline-none ${
              activeTab === t.key
                ? "border-b-2 border-sky-600 text-sky-600"
                : "hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const Toast = ({ message, type = "success", onClose }) => {
  if (!message) return null;
  const bg = type === "success" ? "bg-emerald-500" : "bg-red-500";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl text-white flex items-center gap-3 z-50 ${bg}`}>
      <Icon size={20} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-75 hover:opacity-100" type="button">
        &times;
      </button>
    </div>
  );
};

const PasswordField = memo(function PasswordField({
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
          onChange={onChange}
          className="block w-full p-2 pr-10 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
});

export default function DivisiSettings() {
  const { user, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user) {
      setAvatarUrl(user?.profil?.foto_profil || "");
      setNotifEnabled(Boolean(user?.profil?.email_pembaruan_sistem_aktif ?? true));
    }
  }, [user]);

  const compressImage = (file, maxWidth = 800, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Gagal kompres gambar"));
              const r2 = new FileReader();
              r2.onloadend = () => resolve(r2.result);
              r2.onerror = reject;
              r2.readAsDataURL(blob);
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
      return showToast("Jenis file tidak didukung.", "error");
    }
    if (file.size > 2 * 1024 * 1024) {
      return showToast("Ukuran file melebihi 2MB.", "error");
    }

    try {
      const base64 = await compressImage(file, 800, 0.7);
      setAvatarUrl(base64);
    } catch (err) {
      showToast("Gagal memproses gambar.", "error");
    }
  };

  const savePhoto = async () => {
    setIsSavingPhoto(true);
    try {
      await axios.put("/auth/profile", { foto_profil: avatarUrl });
      setUser({
        ...user,
        profil: { ...(user?.profil || {}), foto_profil: avatarUrl },
      });
      showToast("Foto profil berhasil diperbarui!", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal menyimpan foto.", "error");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const savePassword = async () => {
    if (!password.current || !password.new || !password.confirm) {
      return showToast("Semua field password wajib diisi.", "error");
    }
    if (password.new !== password.confirm) {
      return showToast("Password baru dan konfirmasi tidak cocok!", "error");
    }

    setIsSavingPassword(true);
    try {
      await axios.put("/auth/change-password", {
        currentPassword: password.current,
        newPassword: password.new,
      });
      showToast("Password berhasil diubah!", "success");
      setPassword({ current: "", new: "", confirm: "" });
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal mengubah password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const saveNotification = async () => {
    setIsSavingNotif(true);
    try {
      await axios.put("/auth/profile", { email_pembaruan_sistem_aktif: notifEnabled });
      setUser({
        ...user,
        profil: { ...(user?.profil || {}), email_pembaruan_sistem_aktif: notifEnabled },
      });
      showToast("Pengaturan notifikasi disimpan!", "success");
    } catch (err) {
      showToast("Gagal menyimpan pengaturan notifikasi.", "error");
    } finally {
      setIsSavingNotif(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <h1 className="text-2xl font-semibold text-sky-900 mb-6">Pengaturan</h1>

      {/* ✅ FIX: card diperlebar (max-w-4xl -> max-w-6xl) dan margin-x
         dibuat responsif supaya tidak terlalu sempit di layar besar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-6xl mx-auto w-full">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="p-0">
          {activeTab === "general" && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <SettingsIcon size={20} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Profil</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Konfigurasi dasar akun divisi Anda.</p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 pb-8 border-b border-gray-100 text-center sm:text-left">
                <img
                  src={avatarUrl || "https://placehold.co/150x150/505050/FFFFFF?text=KD"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shrink-0"
                />
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/gif"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    type="button"
                  >
                    Upload Foto
                  </button>
                  <p className="text-xs text-gray-400 mt-2">Format JPG, PNG, GIF. Maksimal 2MB</p>

                  {avatarUrl !== (user?.profil?.foto_profil || "") && (
                    <button
                      onClick={savePhoto}
                      disabled={isSavingPhoto}
                      className="mt-3 sm:ml-2 px-4 py-2 rounded-md text-white text-sm bg-sky-600 hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                      type="button"
                    >
                      {isSavingPhoto && <Loader size={14} className="animate-spin" />}
                      Simpan Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <input
                    type="text"
                    value={user?.nama || "Kepala Divisi"}
                    disabled
                    className="mt-1 block w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Nama otomatis diatur oleh sistem.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="mt-1 block w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Ubah Password</h2>
              <p className="text-sm text-gray-500 mb-6">Pastikan akun Anda menggunakan password yang kuat.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 max-w-2xl">
                <PasswordField
                  label="Password Saat Ini"
                  value={password.current}
                  visible={showPass.current}
                  onToggleVisible={() => setShowPass((s) => ({ ...s, current: !s.current }))}
                  onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
                />
                <div className="hidden md:block"></div>
                <PasswordField
                  label="Password Baru"
                  value={password.new}
                  visible={showPass.new}
                  onToggleVisible={() => setShowPass((s) => ({ ...s, new: !s.new }))}
                  onChange={(e) => setPassword((p) => ({ ...p, new: e.target.value }))}
                />
                <PasswordField
                  label="Konfirmasi Password Baru"
                  value={password.confirm}
                  visible={showPass.confirm}
                  onToggleVisible={() => setShowPass((s) => ({ ...s, confirm: !s.confirm }))}
                  onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>

              <button
                onClick={savePassword}
                disabled={isSavingPassword}
                className={`mt-8 px-6 py-2 rounded-lg text-white transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isSavingPassword ? "opacity-75 cursor-not-allowed" : ""
                }`}
                type="button"
              >
                {isSavingPassword && <Loader size={18} className="animate-spin" />}
                {isSavingPassword ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Pengaturan Notifikasi</h2>
              <p className="text-sm text-gray-500 mb-6">Kelola preferensi notifikasi sistem</p>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-800">Notifikasi Email Internal</h3>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Pemberitahuan Pembaruan Sistem</h4>
                    <p className="text-xs text-gray-500">Terima email tentang pembaruan fitur atau pemeliharaan sistem.</p>
                  </div>

                  <input
                    type="checkbox"
                    className="sr-only peer"
                    id="divisiSystemUpdate"
                    checked={notifEnabled}
                    onChange={() => setNotifEnabled((v) => !v)}
                  />
                  <label
                    htmlFor="divisiSystemUpdate"
                    className="relative cursor-pointer w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-sky-500/30 rounded-full peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shrink-0"
                  />
                </div>
              </div>

              <button
                onClick={saveNotification}
                disabled={isSavingNotif}
                className={`mt-8 px-6 py-2 rounded-lg text-white transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isSavingNotif ? "opacity-75 cursor-not-allowed" : ""
                }`}
                type="button"
              >
                {isSavingNotif && <Loader size={18} className="animate-spin" />}
                {isSavingNotif ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}