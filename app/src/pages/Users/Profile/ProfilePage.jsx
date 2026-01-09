import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 as LoaderIcon, User as UserIcon } from "lucide-react";

import useAuthStore from "../../../store/useAuthStore";
import axios from "../../../api/axiosInstance";

import ProfileSidebar from "./components/ProfileSidebar";
import HiringTimeline from "./components/HiringTimeline";
import ToastNotification from "./components/ToastNotification";

import DataPribadiSection from "./components/sections/DataPribadiSection";
import PengaturanAkunSection from "./components/sections/PengaturanAkunSection";
import KeluarSection from "./components/sections/KeluarSection";

import {
  defaultProfileData,
  menuItems,
  getFinalStatusColor,
  getStatusText,
} from "./utils/profileHelpers";

import { compressImageToBase64 } from "./utils/imageCompression";

const ProfilePage = () => {
  // auth store
  const { user, checkAuth, loading: storeLoading, setUser } = useAuthStore();

  // UI state
  const [activeMenu, setActiveMenu] = useState("Data Pribadi");

  // local editable data
  const [editedData, setEditedData] = useState(defaultProfileData);
  const [isDataPribadiEditable, setIsDataPribadiEditable] = useState(false);

  // refs & upload
  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // save/loading/error
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);

  // ✅ application state (untuk timeline)
  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  // account settings
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // toast
  const [toast, setToast] = useState({ message: null, type: null });

  const showToast = (message, type) => {
    setToast({ message: Array.isArray(message) ? message : [message], type });
  };

  // initial auth
  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  // sync user -> editedData
  useEffect(() => {
    if (user) {
      setEditedData({
        ...user,
        profile: {
          fullName: user.profile?.fullName || "",
          NIK: user.profile?.NIK || "",
          gender: user.profile?.gender || "",
          nomorHp: user.profile?.nomorHp || "",
          tempatLahir: user.profile?.tempatLahir || "",
          tanggalLahir: user.profile?.tanggalLahir || "",
          alamat: user.profile?.alamat || "",
          fotoProfile: user.profile?.fotoProfile || "",
          about: user.profile?.about || "",
        },
      });
    } else {
      setEditedData(defaultProfileData);
    }
    setLoadingInitial(false);
  }, [user]);

  // auto hide toast
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(
        () => setToast({ message: null, type: null }),
        4500
      );
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    let intervalId;

    const fetchTimelineApplication = async () => {
      try {
        const res = await axios.get("/applications/me/latest"); // ✅ FIX
        const data = res?.data?.data || null;

        console.log("[timeline] me/latest:", data);
        setApplication(data);
      } catch (e) {
        console.error(
          "[timeline] fetch error:",
          e?.response?.data || e.message
        );
        setApplication(null);
      } finally {
        setLoadingApp(false);
      }
    };

    fetchTimelineApplication();
    intervalId = setInterval(fetchTimelineApplication, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // ✅ derive timeline state from application
  const derivedCurrentStep = useMemo(() => {
    // stage harus match step name di HiringTimeline
    return application?.stage || "Under Review";
  }, [application]);

  const derivedFinalStatus = useMemo(() => {
    // Kamu belum punya final decision di Application schema (final ada di Archive).
    // Jadi sementara:
    // - kalau status mengandung "rejected" => Rejected
    // - kalau status mengandung "accepted" => Accepted
    // - default => Pending
    const s = (application?.status || "").toLowerCase();
    if (s.includes("reject")) return "Rejected";
    if (s.includes("accept")) return "Accepted";
    return "Pending";
  }, [application]);

  const finalStatusClass = useMemo(
    () => getFinalStatusColor(derivedFinalStatus),
    [derivedFinalStatus]
  );

  const statusText = useMemo(
    () => getStatusText(derivedFinalStatus, derivedCurrentStep),
    [derivedFinalStatus, derivedCurrentStep]
  );

  const currentPhotoUrl =
    uploadedPhoto ||
    editedData?.profile?.fotoProfile ||
    defaultProfileData.profile.fotoProfile;

  /* ---------------------------
     Handlers: Data Pribadi
     --------------------------- */
  const handleDataPribadiChange = (e) => {
    const { id, value } = e.target;
    const ROOT_FIELDS = ["name", "email"];

    if (!ROOT_FIELDS.includes(id)) {
      setEditedData((prev) => ({
        ...prev,
        profile: { ...prev.profile, [id]: value },
      }));
    } else {
      setEditedData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleEditDataPribadi = () => setIsDataPribadiEditable(true);

  const handleCancelEdit = () => {
    if (user) {
      setEditedData({
        ...user,
        profile: {
          fullName: user.profile?.fullName || "",
          NIK: user.profile?.NIK || "",
          gender: user.profile?.gender || "",
          nomorHp: user.profile?.nomorHp || "",
          tempatLahir: user.profile?.tempatLahir || "",
          tanggalLahir: user.profile?.tanggalLahir || "",
          alamat: user.profile?.alamat || "",
          fotoProfile: user.profile?.fotoProfile || "",
          about: user.profile?.about || "",
        },
      });
    } else {
      setEditedData(defaultProfileData);
    }

    setIsDataPribadiEditable(false);
    setPasswordError(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveDataPribadi = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        fullName: editedData.profile.fullName,
        NIK: editedData.profile.NIK,
        gender: editedData.profile.gender,
        nomorHp: editedData.profile.nomorHp,
        tempatLahir: editedData.profile.tempatLahir,
        tanggalLahir: editedData.profile.tanggalLahir
          ? new Date(editedData.profile.tanggalLahir).toISOString()
          : null,
        alamat: editedData.profile.alamat,
        fotoProfile: editedData.profile.fotoProfile,
        about: editedData.profile.about,
      };

      console.log("Payload size:", JSON.stringify(payload).length, "bytes");
      console.log("FotoProfile length:", payload.fotoProfile?.length || 0);

      const res = await axios.put("/auth/profile", payload);

      setUser({ ...editedData, profile: res.data.data });
      setUploadedPhoto(null);
      setIsDataPribadiEditable(false);
      showToast("Data Pribadi berhasil diperbarui!", "success");
    } catch (err) {
      console.error("Save Data Pribadi error:", err);
      console.error("Error response:", err.response?.data);
      showToast(
        err.response?.data?.message || "Gagal menyimpan Data Pribadi.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     Photo Upload (Client Preview)
     --------------------------- */
  const handlePhotoUploadClientPreview = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Jenis file tidak didukung.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast("Ukuran file terlalu besar. Maksimal 2MB.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const compressedBase64 = await compressImageToBase64(file, {
        maxWidth: 800,
        quality: 0.7,
        outputMime: "image/jpeg",
      });

      setUploadedPhoto(compressedBase64);
      setEditedData((prev) => ({
        ...prev,
        profile: { ...prev.profile, fotoProfile: compressedBase64 },
      }));

      setIsDataPribadiEditable(true);
      setActiveMenu("Data Pribadi");

      showToast(
        "Foto dipilih! Klik 'Simpan' untuk menyimpan perubahan.",
        "success"
      );
    } catch (err) {
      console.error("Compress image error:", err);
      showToast("Gagal memproses gambar.", "error");
    }
  };

  /* ---------------------------
     Pengaturan Akun
     --------------------------- */
  const handleSaveAkun = async () => {
    setPasswordError(null);
    const changes = [];

    if (newPassword && newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter!");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasNumber || !hasSymbol) {
      setPasswordError(
        "Password harus mengandung huruf besar, angka, dan simbol!"
      );
      return;
    }

    changes.push("Password berhasil diubah.");
    if (uploadedPhoto) changes.push("Foto Profil berhasil diganti.");

    if (changes.length === 0) {
      showToast("Tidak ada perubahan yang terdeteksi untuk disimpan.", "error");
      return;
    }

    try {
      setSaving(true);
      // NOTE: endpoint password belum ada. Ini simulasi saja.
      showToast(changes, "success");

      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error("Save Akun error", err);
      showToast("Gagal menyimpan Pengaturan Akun.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     Logout
     --------------------------- */
  const handleLogout = () => {
    try {
      setUser(null);
      showToast("Logout berhasil. Silakan refresh halaman.", "success");
      setActiveMenu("Keluar");
    } catch (err) {
      console.error("Logout error", err);
      showToast("Gagal logout.", "error");
    }
  };

  /* ---------------------------
     Render content
     --------------------------- */
  const renderMainContent = () => {
    if (activeMenu === "Data Pribadi") {
      return (
        <DataPribadiSection
          editedData={editedData}
          setEditedData={setEditedData}
          isEditable={isDataPribadiEditable}
          onEdit={handleEditDataPribadi}
          onCancel={handleCancelEdit}
          onSave={handleSaveDataPribadi}
          onChange={handleDataPribadiChange}
          dateInputRef={dateInputRef}
          saving={saving}
        />
      );
    }

    if (activeMenu === "Pengaturan Akun") {
      return (
        <PengaturanAkunSection
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          onSave={handleSaveAkun}
        />
      );
    }

    if (activeMenu === "Keluar") {
      return <KeluarSection />;
    }

    return (
      <div className="p-6 text-gray-500 bg-white rounded-xl">
        Konten untuk '{activeMenu}' belum tersedia.
      </div>
    );
  };

  if (storeLoading || loadingInitial) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
        <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
        <p className="text-sky-700 font-semibold text-lg">
          Memuat data pengguna...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 font-sans bg-gray-50 min-h-screen">
      <ToastNotification
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: null })}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 space-y-6">
          <ProfileSidebar
            userName={
              editedData?.profile?.fullName ||
              editedData?.name ||
              "Nama Pengguna"
            }
            currentPhotoUrl={currentPhotoUrl}
            fileInputRef={fileInputRef}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            onPhotoChange={handlePhotoUploadClientPreview}
            onPickPhoto={() =>
              fileInputRef.current && fileInputRef.current.click()
            }
            activeMenu={activeMenu}
            setActiveMenu={(menu) => {
              setActiveMenu(menu);
              if (menu === "Keluar") handleLogout();
            }}
            menuItems={menuItems}
            FallbackIcon={UserIcon}
          />
        </div>

        {/* Main */}
        <div className="w-full lg:w-3/4 space-y-6">
          {/* ✅ Timeline now from application */}
          {loadingApp ? (
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <p className="text-gray-600 font-medium">
                Memuat status tahapan seleksi...
              </p>
            </div>
          ) : (
            <HiringTimeline
              currentStep={derivedCurrentStep}
              finalStatus={derivedFinalStatus}
              finalStatusClass={finalStatusClass}
              statusText={statusText}
            />
          )}

          {renderMainContent()}
        </div>
      </div>

      {/* Global saving overlay */}
      {saving && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90">
          <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">
            Menyimpan perubahan...
          </p>
        </div>
      )}

      {/* Local error */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
