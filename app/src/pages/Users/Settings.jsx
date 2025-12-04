import React, { useState, useRef, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Download,
  Database,
  Trash2,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore"; // Pastikan path sesuai dengan struktur proyek Anda
import axios from "../../api/axiosInstance"; // Pastikan path sesuai dengan struktur proyek Anda

/**
 * Komponen Toast untuk Notifikasi Umpan Balik
 */
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  const typeStyles = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    icon:
      type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl text-white flex items-center gap-3 transition-opacity duration-300 z-50 ${typeStyles[type]}`}
      role="alert"
    >
      {typeStyles.icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-75 hover:opacity-100">
        &times;
      </button>
    </div>
  );
};

/**
 * Komponen GeneralSettings: Menampilkan formulir pengaturan umum.
 */
const GeneralSettings = ({ showToast }) => {
  // Kode tetap sama, tidak diubah
  const [settings, setSettings] = useState({
    companyName: "Syaamil Group",
    website: "https://www.syaamilquran.com/",
    location: "Bandung",
    timezone: "WIB (UTC+7)",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulasikan panggilan API
    setTimeout(() => {
      setIsSaving(false);
      console.log("Pengaturan Umum Disimpan:", settings);
      showToast("Pengaturan umum berhasil diperbarui!");
    }, 1500);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Pengaturan Umum</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Konfigurasi dasar sistem perusahaan.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Nama Perusahaan */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Nama Perusahaan
          </label>
          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          />
        </div>
        {/* Website Perusahaan */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Website Perusahaan
          </label>
          <input
            type="url"
            name="website"
            value={settings.website}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          />
        </div>
        {/* Lokasi Default */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Lokasi Default
          </label>
          <select
            name="location"
            value={settings.location}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          >
            <option>Bandung</option>
            <option>Jakarta</option>
            <option>Surabaya</option>
          </select>
        </div>
        {/* Zona Waktu */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Zona Waktu
          </label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500"
          >
            <option>WIB (UTC+7)</option>
            <option>WITA (UTC+8)</option>
            <option>WIT (UTC+9)</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`mt-8 px-6 py-2 rounded-lg text-center text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-sky-500/30 ${
          isSaving ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isSaving && <Loader size={18} className="animate-spin" />}
        {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </div>
  );
};

/**
 * Komponen ProfileSettings: Mengelola informasi dan password profil admin.
 * Diintegrasikan dengan useAuthStore dan axios untuk mengambil/simpan data dari database.
 */
const ProfileSettings = ({ showToast }) => {
  // Auth store
  const { user, checkAuth, setUser } = useAuthStore();

  // State lokal untuk profile dan password
  const [profile, setProfile] = useState({
    firstName: "",
    email: "",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef(null);

  // Loading state untuk inisialisasi data
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Fungsi kompresi gambar (dari contoh)
  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

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
              const compressedReader = new FileReader();
              compressedReader.onloadend = () =>
                resolve(compressedReader.result);
              compressedReader.onerror = reject;
              compressedReader.readAsDataURL(blob);
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
  };

  // Sinkronisasi data dari store ke state lokal
  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.profile?.fullName || user.name || "",
        email: user.email || "",
      });
      setAvatarUrl(user.profile?.fotoProfile || "");
    } else {
      setProfile({
        firstName: "",
        email: "",
      });
      setAvatarUrl("");
    }
    setLoadingInitial(false);
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword((prevPassword) => ({ ...prevPassword, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Validasi Password Sederhana
    if (password.new && password.new !== password.confirm) {
      setIsSaving(false);
      showToast("Password baru dan konfirmasi tidak cocok!", "error");
      return;
    }

    try {
      // Payload untuk profile (sesuai contoh, tambahkan field jika diperlukan)
      const payload = {
        fullName: profile.firstName,
        fotoProfile: avatarUrl,
        // Tambahkan field lain jika backend memerlukannya, misalnya:
        // NIK: profile.NIK || "",
        // gender: profile.gender || "",
        // tempatLahir: profile.tempatLahir || "",
        // tanggalLahir: profile.tanggalLahir ? new Date(profile.tanggalLahir).toISOString() : null,
        // alamat: profile.alamat || "",
        // about: profile.about || "",
      };

      // Logging untuk debug
      console.log("Payload yang dikirim:", payload);
      console.log("Payload size:", JSON.stringify(payload).length, "bytes");

      // Ambil token dari store atau localStorage (sesuaikan dengan implementasi Anda)
      const token = user?.token || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.put("/auth/profile", payload, { headers });

      console.log("Response dari backend:", res.data);

      // Update store dengan data baru
      setUser({ ...user, profile: res.data.data });

      // Untuk password, jika ada endpoint terpisah, gunakan ini. Jika tidak, hapus atau simulasikan.
      if (password.new) {
        // Asumsikan endpoint /auth/change-password
        try {
          await axios.put(
            "/auth/change-password",
            {
              currentPassword: password.current,
              newPassword: password.new,
            },
            { headers }
          );
          console.log("Password berhasil diubah");
        } catch (pwdErr) {
          console.error("Error changing password:", pwdErr);
          showToast("Profil diperbarui, tapi gagal ubah password.", "error");
          return; // Jangan lanjut jika password gagal
        }
      }

      showToast("Profil dan password berhasil diperbarui!");
      // Bersihkan field password setelah berhasil
      setPassword({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Save profile error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      showToast(
        err.response?.data?.message || "Gagal menyimpan profil.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Jenis file tidak didukung.", "error");
      fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast("Ukuran file melebihi 2MB.", "error");
      fileInputRef.current.value = "";
      return;
    }

    try {
      const compressedBase64 = await compressImage(file, 800, 0.7);
      setAvatarUrl(compressedBase64);
      showToast("Foto berhasil diunggah.");
    } catch (err) {
      console.error("Compress image error:", err);
      showToast("Gagal memproses gambar.", "error");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  if (loadingInitial) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader size={24} className="animate-spin" />
        <span className="ml-2">Memuat data profil...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Profile Admin</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Kelola informasi profile admin
      </p>
      <div className="flex items-center gap-6 mb-6">
        <img
          src={avatarUrl || "https://placehold.co/150x150/505050/FFFFFF?text=A"}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          >
            Upload Foto
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/gif"
            className="hidden"
          />
          <p className="text-xs text-gray-400 mt-1">
            .JPG, .PNG atau .GIF. Maksimal 2MB
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Nama Depan */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleProfileChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
      </div>

      <div className="mt-8 space-y-6 border-t pt-6 border-gray-200">
        <h3 className="text-base font-medium text-gray-800">Ubah Password</h3>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Password Saat Ini
          </label>
          <input
            type="password"
            name="current"
            value={password.current}
            onChange={handlePasswordChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Password Baru
          </label>
          <input
            type="password"
            name="new"
            value={password.new}
            onChange={handlePasswordChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            name="confirm"
            value={password.confirm}
            onChange={handlePasswordChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
      </div>
      <button
        onClick={handleSaveProfile}
        disabled={isSaving}
        className={`mt-8 px-6 py-2 rounded-lg text-center text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-sky-500/30 ${
          isSaving ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isSaving && <Loader size={18} className="animate-spin" />}
        {isSaving ? "Menyimpan..." : "Simpan Profile"}
      </button>
    </div>
  );
};

/**
 * Komponen NotificationSettings: Mengelola preferensi notifikasi.
 */
const NotificationSettings = ({ showToast }) => {
  const [isSystemUpdateEnabled, setIsSystemUpdateEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulasikan panggilan API
    setTimeout(() => {
      setIsSaving(false);
      console.log(
        "Pengaturan Notifikasi Disimpan. Status Pembaruan Sistem:",
        isSystemUpdateEnabled
      );
      showToast("Pengaturan notifikasi berhasil diperbarui!");
    }, 1500);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Pengaturan Notifikasi
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Kelola preferensi notifikasi sistem
      </p>
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-800">
          Notifikasi Email Internal
        </h3>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-800">
              Pemberitahuan Pembaruan Sistem
            </h4>
            <p className="text-xs text-gray-500">
              Terima email tentang pembaruan fitur atau pemeliharaan sistem.
            </p>
          </div>
          <input
            type="checkbox"
            className="sr-only peer"
            id="systemUpdate"
            checked={isSystemUpdateEnabled}
            onChange={() => setIsSystemUpdateEnabled(!isSystemUpdateEnabled)}
          />
          <label
            htmlFor="systemUpdate"
            className="relative cursor-pointer w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-sky-500/30 rounded-full peer-checked:bg-sky-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"
          ></label>
        </div>
      </div>
      <div className="mt-6 space-y-4 opacity-50 cursor-not-allowed">
        <h3 className="text-sm font-medium text-gray-800">
          Push Notifications (Non-Aktif)
        </h3>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-gray-800">
              Notifikasi browser
            </h4>
            <p className="text-xs text-gray-500">
              Tampilkan notifikasi di browser (memerlukan konfigurasi tambahan).
            </p>
          </div>
          <input type="checkbox" className="sr-only" disabled />
          <div className="relative w-10 h-6 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`mt-8 px-6 py-2 rounded-lg text-center text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-sky-500/30 ${
          isSaving ? "opacity-75 cursor-not-allowed" : "hover:bg-sky-700"
        } focus:outline-none focus:ring-1 focus:ring-sky-500/30`}
      >
        {isSaving && <Loader size={18} className="animate-spin" />}
        {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </div>
  );
};

/**
 * Komponen SystemSettings: Pengaturan sistem, backup, dan informasi.
 */
const SystemSettings = ({ showToast }) => {
  const [systemData, setSystemData] = useState({
    lastBackup: "15 Januari 2024, 02:00 WIB",
    // storageUsed dan storageTotal dihapus
    systemVersion: "v2.1.0",
    uptime: "15 hari, 4 jam",
    database: "PostgreSQL 14.2",
    lastUpdate: "10 Januari 2024",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackup = () => {
    setIsProcessing(true);
    showToast("Memulai proses backup data...", "error");
    setTimeout(() => {
      setIsProcessing(false);
      const newBackupTime =
        new Date().toLocaleString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) + " WIB";
      setSystemData((prev) => ({ ...prev, lastBackup: newBackupTime }));
      showToast("Backup data berhasil dibuat!", "success");
    }, 2500);
  };

  const handleDownload = () => {
    showToast("Memulai download file backup...", "success");
    // Di lingkungan nyata, ini akan memicu unduhan file
  };

  // progressPercentage dihapus
  // handleCleanTemp dihapus

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon size={20} className="text-sky-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          Pengaturan Sistem
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Konfigurasi sistem dan maintenance.
      </p>

      {/* 1. Backup & Restore */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Backup & Restore
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-sm text-gray-700">
            <p className="font-medium">Backup otomatis (setiap hari)</p>
            <p className="text-xs text-gray-500">
              Backup terakhir: {systemData.lastBackup}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              disabled={isProcessing}
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handleBackup}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-center text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-500/30${
                isProcessing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing && <Loader size={16} className="animate-spin" />}
              {isProcessing ? "Proses..." : "Backup Sekarang"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. System Information */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Versi Sistem</p>
              <p className="font-medium text-gray-800">
                {systemData.systemVersion}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Uptime</p>
              <p className="font-medium text-gray-800">{systemData.uptime}</p>
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500">Database</p>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Database size={16} className="text-sky-600" />
                {systemData.database}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Update</p>
              <p className="font-medium text-gray-800">
                {systemData.lastUpdate}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Tombol Simpan dihapus dari sini */}
    </div>
  );
};

/**
 * Komponen Settings: Komponen utama yang mengelola tab dan konten pengaturan.
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState("system");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    const props = { showToast }; // Meneruskan fungsi toast ke setiap komponen
    switch (activeTab) {
      case "general":
        return <GeneralSettings {...props} />;
      case "profile":
        return <ProfileSettings {...props} />;
      case "notifications":
        return <NotificationSettings {...props} />;
      case "system":
        return <SystemSettings {...props} />;
      default:
        return <GeneralSettings {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans">
      <h1 className="text-2xl font-semibold text-sky-900 mb-6">Pengaturan</h1>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Navigasi tab */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap text-sm font-medium text-center text-gray-500">
            <button
              className={`flex-1 px-4 py-3 transition-colors focus:outline-none ${
                activeTab === "general"
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("general")}
            >
              Umum
            </button>
            <button
              className={`flex-1 px-4 py-3 transition-colors focus:outline-none  ${
                activeTab === "profile"
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`flex-1 px-4 py-3 transition-colors focus:outline-none  ${
                activeTab === "notifications"
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              Notifikasi
            </button>
            <button
              className={`flex-1 px-4 py-3 transition-colors focus:outline-none ${
                activeTab === "system"
                  ? "border-b-2 border-sky-600 text-sky-600"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("system")}
            >
              Sistem
            </button>
          </div>
        </div>
        {/* Konten tab */}
        <div className="p-0">{renderContent()}</div>
      </div>

      {/* Tampilkan Toast */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default Settings;
