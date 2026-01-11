import React, { useEffect, useRef, useState, memo } from "react";
import { Loader, Eye, EyeOff } from "lucide-react";
import useAuthStore from "../../../../store/useAuthStore";
import axios from "../../../../api/axiosInstance";

/** ✅ PENTING: letakkan component ini DI LUAR ProfileSettings agar tidak remount tiap render */
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

export default function ProfileSettings({ showToast }) {
  const { user, checkAuth, setUser } = useAuthStore();

  const [profile, setProfile] = useState({ firstName: "", email: "" });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);

  const fileInputRef = useRef(null);

  // ✅ optional guard biar checkAuth ga “spam”
  const didCheckRef = useRef(false);

  useEffect(() => {
    if (user) {
      setLoadingInitial(false);
      return;
    }

    if (!didCheckRef.current) {
      didCheckRef.current = true;

      Promise.resolve(checkAuth?.())
        .catch(() => {})
        .finally(() => setLoadingInitial(false));
    }
  }, [user, checkAuth]);

  useEffect(() => {
    if (!user) return;

    setProfile({
      firstName: user.profile?.fullName || user.name || "",
      email: user.email || "",
    });
    setAvatarUrl(user.profile?.fotoProfile || "");
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

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast?.("Jenis file tidak didukung.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast?.("Ukuran file melebihi 2MB.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const base64 = await compressImage(file, 800, 0.7);
      setAvatarUrl(base64);
      showToast?.("Foto berhasil diunggah.", "success");
    } catch (err) {
      console.error(err);
      showToast?.("Gagal memproses gambar.", "error");
    }
  };

  const save = async () => {
    setIsSaving(true);

    if (password.new && password.new !== password.confirm) {
      setIsSaving(false);
      showToast?.("Password baru dan konfirmasi tidak cocok!", "error");
      return;
    }

    if (password.new && !password.current) {
      setIsSaving(false);
      showToast?.("Password saat ini wajib diisi.", "error");
      return;
    }

    try {
      const payload = {
        fullName: profile.firstName,
        fotoProfile: avatarUrl,
      };

      const res = await axios.put("/auth/profile", payload);

      const updatedProfile = res?.data?.data || res?.data || payload;

      setUser({
        ...user,
        profile: updatedProfile,
      });

      if (password.new) {
        await axios.put("/auth/change-password", {
          currentPassword: password.current,
          newPassword: password.new,
        });
      }

      showToast?.("Profil berhasil diperbarui!", "success");
      setPassword({ current: "", new: "", confirm: "" });
    } catch (e) {
      console.error(e);
      showToast?.(e?.response?.data?.message || "Gagal menyimpan profil.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="animate-spin mr-2" /> Memuat data profil...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Profile Admin</h2>
      <p className="text-sm text-gray-500 mb-6">Kelola informasi profile admin</p>

      <div className="flex items-center gap-6 mb-6">
        <img
          src={avatarUrl || "https://placehold.co/150x150/505050/FFFFFF?text=A"}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
            type="button"
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

          <p className="text-xs text-gray-400 mt-1">.JPG, .PNG atau .GIF. Maksimal 2MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, firstName: e.target.value }))
            }
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="mt-1 block w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-8 space-y-6 border-t pt-6 border-gray-200">
        <h3 className="text-base font-medium text-gray-800">Ubah Password</h3>

        <PasswordField
          label="Password Saat Ini"
          value={password.current}
          visible={showPass.current}
          onToggleVisible={() =>
            setShowPass((s) => ({ ...s, current: !s.current }))
          }
          onChange={(e) =>
            setPassword((p) => ({ ...p, current: e.target.value }))
          }
        />

        <PasswordField
          label="Password Baru"
          value={password.new}
          visible={showPass.new}
          onToggleVisible={() =>
            setShowPass((s) => ({ ...s, new: !s.new }))
          }
          onChange={(e) =>
            setPassword((p) => ({ ...p, new: e.target.value }))
          }
        />

        <PasswordField
          label="Konfirmasi Password Baru"
          value={password.confirm}
          visible={showPass.confirm}
          onToggleVisible={() =>
            setShowPass((s) => ({ ...s, confirm: !s.confirm }))
          }
          onChange={(e) =>
            setPassword((p) => ({ ...p, confirm: e.target.value }))
          }
        />
      </div>

      <button
        onClick={save}
        disabled={isSaving}
        className={`mt-8 px-6 py-2 rounded-lg text-white transition shadow-lg shadow-gray-400/50 bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 flex items-center justify-center gap-2 ${
          isSaving ? "opacity-75 cursor-not-allowed" : ""
        }`}
        type="button"
      >
        {isSaving && <Loader size={18} className="animate-spin" />}
        {isSaving ? "Menyimpan..." : "Simpan Profile"}
      </button>
    </div>
  );
}
