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
import LamaranSayaSection from "./components/sections/LamaranSayaSection";

import {
  defaultProfileData,
  menuItems,
  getFinalStatusColor,
  getStatusText,
} from "./utils/profileHelpers";

import { compressImageToBase64 } from "./utils/imageCompression";

/** ✅ Normalisasi stage supaya konsisten */
const normalizeStage = (stage) => {
  const s = String(stage || "").trim().toLowerCase();
  if (!s) return null;

  // legacy -> new
  if (s === "under review" || s === "under-review" || s === "screening") return "Screaning";
  if (s === "psikotes") return "Psikotes/technical test";
  if (s.includes("technical")) return "Psikotes/technical test";

  // exact
  if (s === "screaning") return "Screaning";
  if (s === "interview hc") return "Interview HC";
  if (s === "final interview") return "Final Interview";
  if (s.includes("offering")) return "Offering/Final Result";

  return stage;
};

/** ✅ Ambil stage dari status "rejected-at-xxx" */
const stageFromRejectedStatus = (statusRaw) => {
  const s = String(statusRaw || "").trim().toLowerCase();
  if (!s.startsWith("rejected-at-")) return null;

  const slug = s.replace("rejected-at-", "").trim();

  if (
    slug.includes("screaning") ||
    slug.includes("screening") ||
    slug.includes("under-review") ||
    slug.includes("under_review")
  ) {
    return "Screaning";
  }

  if (slug.includes("interview-hc") || slug.includes("interviewhc")) {
    return "Interview HC";
  }

  if (
    slug.includes("psikotes") ||
    slug.includes("psychotest") ||
    slug.includes("psycho") ||
    slug.includes("technical")
  ) {
    return "Psikotes/technical test";
  }

  if (slug.includes("final-interview") || slug.includes("finalinterview")) {
    return "Final Interview";
  }

  if (slug.includes("offering")) {
    return "Offering/Final Result";
  }

  return null;
};

/** ✅ RULE KHUSUS:
 * Kalau ditolak di Final Interview -> currentStep dibuat ke "Offering/Final Result"
 */
const rejectedFinalInterviewGoesToFinalResult = (statusRaw, stageRaw) => {
  const s = String(statusRaw || "").toLowerCase();
  const stage = normalizeStage(stageRaw);

  // jika status reject-at-final-interview
  if (s.startsWith("rejected-at-") && s.includes("final-interview")) return true;

  // fallback kalau backend belum pakai rejected-at tapi stage-nya final interview dan status reject
  if (s.includes("reject") && stage === "Final Interview") return true;

  return false;
};

/** ✅ helper aman untuk ISO date */
const safeToISO = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const ProfilePage = () => {
  const { user, checkAuth, loading: storeLoading, setUser } = useAuthStore();

  const [activeMenu, setActiveMenu] = useState("Data Pribadi");

  const [editedData, setEditedData] = useState(defaultProfileData);
  const [isDataPribadiEditable, setIsDataPribadiEditable] = useState(false);

  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);

  // ✅ timeline app (latest/active)
  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);

  // ✅ list lamaran
  const [myApplications, setMyApplications] = useState([]);
  const [loadingMyApps, setLoadingMyApps] = useState(true);

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

  // ✅ interval ref biar bisa di-clear saat logout
  const timelineIntervalRef = useRef(null);

  /** ---------------------------
   *  Auth Init
   *  --------------------------- */
  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  /** ---------------------------
   *  Sync user -> editedData
   *  --------------------------- */
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

  /** ---------------------------
   *  Auto hide toast
   *  --------------------------- */
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: null, type: null }), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /** ---------------------------
   *  Fetch Timeline + My Applications
   *  --------------------------- */
  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setApplication(null);
      setMyApplications([]);
      setLoadingApp(false);
      setLoadingMyApps(false);

      if (timelineIntervalRef.current) {
        clearInterval(timelineIntervalRef.current);
        timelineIntervalRef.current = null;
      }

      return () => {};
    }

    const controller = new AbortController();

    const fetchTimelineApplication = async (signal) => {
      try {
        const res = await axios.get("/applications/me/latest", { signal });
        const data = res?.data?.data ?? null;
        if (!isMounted || signal?.aborted) return;
        setApplication(data);
      } catch (e) {
        if (!isMounted || signal?.aborted) return;

        const status = e?.response?.status;
        if (status === 401) {
          setApplication(null);
          return;
        }
        setApplication(null);
      } finally {
        if (isMounted && !signal?.aborted) setLoadingApp(false);
      }
    };

    const fetchMyApplications = async (signal) => {
      try {
        const res = await axios.get("/applications/me", { signal });
        const items = res?.data?.data ?? [];
        if (!isMounted || signal?.aborted) return;
        setMyApplications(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!isMounted || signal?.aborted) return;

        const status = e?.response?.status;
        if (status === 401) {
          setMyApplications([]);
          return;
        }
        setMyApplications([]);
      } finally {
        if (isMounted && !signal?.aborted) setLoadingMyApps(false);
      }
    };

    setLoadingApp(true);
    setLoadingMyApps(true);
    fetchTimelineApplication(controller.signal);
    fetchMyApplications(controller.signal);

    if (timelineIntervalRef.current) clearInterval(timelineIntervalRef.current);
    timelineIntervalRef.current = setInterval(() => {
      const c = new AbortController();
      fetchTimelineApplication(c.signal);
    }, 5000);

    return () => {
      isMounted = false;
      controller.abort();

      if (timelineIntervalRef.current) {
        clearInterval(timelineIntervalRef.current);
        timelineIntervalRef.current = null;
      }
    };
  }, [user]);

  /** ---------------------------
   *  Derived timeline state
   *  --------------------------- */
  const hasApplication = useMemo(() => !!application, [application]);

  const derivedFinalStatus = useMemo(() => {
    if (!application) return "Pending";
    const s = String(application?.status || "").toLowerCase();
    if (s.includes("reject")) return "Rejected";
    if (s.includes("accept") || s.includes("hired")) return "Accepted";
    return "Pending";
  }, [application]);

  const derivedCurrentStep = useMemo(() => {
    if (!application) return null;

    // ✅ RULE KHUSUS: ditolak di Final Interview -> masuk Final Result
    if (rejectedFinalInterviewGoesToFinalResult(application?.status, application?.stage)) {
      return "Offering/Final Result";
    }

    // ✅ PRIORITAS: kalau status rejected-at-xxx => stop di stage itu
    const rejectedStage = stageFromRejectedStatus(application?.status);
    if (rejectedStage) return rejectedStage;

    // fallback: pakai stage dari backend
    return normalizeStage(application?.stage) || "Screaning";
  }, [application]);

  const finalStatusClass = useMemo(
    () => getFinalStatusColor(derivedFinalStatus, derivedCurrentStep),
    [derivedFinalStatus, derivedCurrentStep]
  );

  const statusText = useMemo(
    () => getStatusText(derivedFinalStatus, derivedCurrentStep),
    [derivedFinalStatus, derivedCurrentStep]
  );

  const currentPhotoUrl =
    uploadedPhoto ||
    editedData?.profile?.fotoProfile ||
    defaultProfileData?.profile?.fotoProfile ||
    "";

  /** ---------------------------
   *  Handlers: Data Pribadi
   *  --------------------------- */
  const handleDataPribadiChange = (e) => {
    const { id, value } = e.target;
    const ROOT_FIELDS = ["name", "email"];

    if (!ROOT_FIELDS.includes(id)) {
      setEditedData((prev) => ({
        ...prev,
        profile: { ...(prev?.profile || {}), [id]: value },
      }));
    } else {
      setEditedData((prev) => ({ ...prev, [id]: value }));
    }
  };

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
    setError(null);
  };

  const handleSaveDataPribadi = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        fullName: editedData?.profile?.fullName || "",
        NIK: editedData?.profile?.NIK || "",
        gender: editedData?.profile?.gender || "",
        nomorHp: editedData?.profile?.nomorHp || "",
        tempatLahir: editedData?.profile?.tempatLahir || "",
        tanggalLahir: safeToISO(editedData?.profile?.tanggalLahir),
        alamat: editedData?.profile?.alamat || "",
        fotoProfile: editedData?.profile?.fotoProfile || "",
        about: editedData?.profile?.about || "",
      };

      const res = await axios.put("/auth/profile", payload);
      const updatedProfile = res?.data?.data || payload;

      setUser({
        ...editedData,
        profile: {
          ...(editedData?.profile || {}),
          ...updatedProfile,
        },
      });

      setUploadedPhoto(null);
      setIsDataPribadiEditable(false);
      showToast("Data Pribadi berhasil diperbarui!", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menyimpan Data Pribadi.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /** ---------------------------
   *  Photo Upload
   *  --------------------------- */
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
        profile: { ...(prev?.profile || {}), fotoProfile: compressedBase64 },
      }));

      setIsDataPribadiEditable(true);
      setActiveMenu("Data Pribadi");

      showToast("Foto dipilih! Klik 'Simpan' untuk menyimpan perubahan.", "success");
    } catch {
      showToast("Gagal memproses gambar.", "error");
    }
  };

  /** ---------------------------
   *  Pengaturan Akun
   *  --------------------------- */
  const handleSaveAkun = async () => {
    setPasswordError(null);
    setError(null);

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setPasswordError("Password minimal 6 karakter!");
        return;
      }

      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasUpperCase || !hasNumber || !hasSymbol) {
        setPasswordError("Password harus mengandung huruf besar, angka, dan simbol!");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Konfirmasi password tidak sama!");
        return;
      }
    }

    const changes = [];
    if (newPassword) changes.push("Password berhasil diubah.");
    if (uploadedPhoto) changes.push("Foto Profil berhasil diganti.");

    if (changes.length === 0) {
      showToast("Tidak ada perubahan yang terdeteksi untuk disimpan.", "error");
      return;
    }

    try {
      setSaving(true);
      showToast(changes, "success");
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menyimpan Pengaturan Akun.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /** ---------------------------
   *  Logout
   *  --------------------------- */
  const handleLogout = () => {
    try {
      if (timelineIntervalRef.current) {
        clearInterval(timelineIntervalRef.current);
        timelineIntervalRef.current = null;
      }

      setUser(null);
      setApplication(null);
      setMyApplications([]);
      setLoadingApp(false);
      setLoadingMyApps(false);

      showToast("Logout berhasil. Silakan refresh halaman.", "success");
      setActiveMenu("Keluar");
    } catch {
      showToast("Gagal logout.", "error");
    }
  };

  const renderMainContent = () => {
    if (activeMenu === "Data Pribadi") {
      return (
        <DataPribadiSection
          editedData={editedData}
          setEditedData={setEditedData}
          isEditable={isDataPribadiEditable}
          onEdit={() => setIsDataPribadiEditable(true)}
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

    if (activeMenu === "Keluar") return <KeluarSection />;

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
        <p className="text-sky-700 font-semibold text-lg">Memuat data pengguna...</p>
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
            userName={editedData?.profile?.fullName || editedData?.name || "Nama Pengguna"}
            currentPhotoUrl={currentPhotoUrl}
            fileInputRef={fileInputRef}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            onPhotoChange={handlePhotoUploadClientPreview}
            onPickPhoto={() => fileInputRef.current && fileInputRef.current.click()}
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
          {loadingApp ? (
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <p className="text-gray-600 font-medium">Memuat status tahapan seleksi...</p>
            </div>
          ) : (
            <HiringTimeline
              hasApplication={hasApplication}
              currentStep={derivedCurrentStep}
              finalStatus={derivedFinalStatus}
              finalStatusClass={finalStatusClass}
              statusText={statusText}
            />
          )}

          {loadingMyApps ? (
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
              <p className="text-gray-600 font-medium">Memuat daftar lamaran...</p>
            </div>
          ) : (
            <LamaranSayaSection applications={myApplications} />
          )}

          {renderMainContent()}
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90">
          <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">Menyimpan perubahan...</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
