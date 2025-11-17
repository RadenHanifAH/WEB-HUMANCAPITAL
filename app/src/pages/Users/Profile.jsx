// Profile.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Settings,
  LogOut,
  Eye,
  EyeOff,
  Edit,
  Save,
  Check,
  AlertTriangle,
  GraduationCap,
  Calendar,
  X as XIcon,
  Loader2 as LoaderIcon
} from "lucide-react";

import useAuthStore from "../../store/useAuthStore";
import axios from "../../api/axiosInstance";

/* ===========================
   Simulasi KONFIG & Helper
   =========================== */

/** Jika user store tidak punya semua field, kita gunakan fallback */
const defaultProfileData = {
  id: null,
  name: "",
  email: "",
  noHp: "",
  nik: "",
  phone: "",
  position: "",
  currentCompany: "",
  location: "",
  education: "",
  experience: "",
  currentStep: "Under Review",
  finalStatus: "Pending",
  fullName: "",
  gender: "",
  birthPlace: "",
  birthDate: "", // YYYY-MM-DD
  address: "",
  aboutMe: "",
  accountPhone: "",
  currentPassword: "",
};

const HIRING_STEPS = [
  { id: 1, name: "Under Review", icon: Clock, color: "text-orange-500" },
  { id: 2, name: "Interview HC", icon: UserIcon, color: "text-blue-500" },
  { id: 3, name: "Psikotes", icon: Clock, color: "text-purple-500" },
  { id: 4, name: "Final Interview", icon: Briefcase, color: "text-green-500" },
  { id: 5, name: "Offering/Final Result", icon: GraduationCap, color: "text-sky-700" },
];

const menuItems = [
  { name: "Data Pribadi", icon: UserIcon },
  { name: "Pengaturan Akun", icon: Settings },
  { name: "Keluar", icon: LogOut },
];

const toDateInputFormat = (dateStr) => {
  // dateStr expected YYYY-MM-DD or empty
  return dateStr || "";
};

const toDisplayFormat = (dateStr) => {
  if (!dateStr || dateStr === "") return "Data belum diisi";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

const getStepState = (stepName, currentStep, finalStatus) => {
  const currentStepIndex = HIRING_STEPS.findIndex((step) => step.name === currentStep);
  const stepIndex = HIRING_STEPS.findIndex((step) => step.name === stepName);

  if (finalStatus === "Rejected") {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "rejected";
    return "pending";
  }

  if (finalStatus === "Accepted" && stepName === "Offering/Final Result") return "accepted";
  if (finalStatus === "Accepted" && stepIndex < HIRING_STEPS.length - 1) return "completed";

  if (stepIndex < currentStepIndex) return "completed";
  if (stepIndex === currentStepIndex) return "active";

  return "pending";
};

const getFinalStatusColor = (finalStatus) => {
  return finalStatus === "Accepted"
    ? "bg-green-100 text-green-700"
    : finalStatus === "Rejected"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-700";
};

const getStatusText = (finalStatus, currentStep) => {
  return finalStatus === "Accepted" ? "DITERIMA" : finalStatus === "Rejected" ? "DITOLAK" : `PROSES (${currentStep})`;
};

/* ===========================
   Reusable subcomponents
   =========================== */

const SettingsInput = ({
  label,
  value,
  type = "text",
  readOnly = true,
  onChange,
  editable = false,
  customType = null,
  showToggle = false,
  onToggleVisibility,
  isPasswordVisible = false,
  id,
  isTextArea = false,
  showDateIcon = false,
  dateInputRef = null,
}) => {
  const inputType = customType === "password" ? (isPasswordVisible ? "text" : "password") : customType || type;
  const InputComponent = isTextArea ? "textarea" : "input";
  const paddingClass = showToggle || showDateIcon ? "pr-10" : "pr-4";

  return (
    <div className="mb-4">
      <p className="text-base font-bold text-gray-800 mb-1">{label}</p>
      <div className="flex items-center gap-2 relative">
        <InputComponent
          id={id}
          type={!isTextArea ? inputType : undefined}
          value={value}
          readOnly={readOnly && !editable}
          onChange={onChange}
          rows={isTextArea ? 3 : undefined}
          className={`flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 border transition-all ${
            editable ? "bg-white border-sky-400" : "bg-gray-100 border-gray-200"
          } ${isTextArea ? "resize-none" : ""} ${paddingClass}`}
        />

        {showToggle && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-sky-600 transition p-1 z-10"
            aria-label={isPasswordVisible ? "Sembunyikan password" : "Lihat password"}
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {showDateIcon && editable && (
          <button
            type="button"
            onClick={() => dateInputRef.current && dateInputRef.current.showPicker?.()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-sky-600 transition p-1 z-10"
            aria-label="Pilih tanggal"
          >
            <Calendar size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

const ToastNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-start space-x-3 max-w-sm transition-all transform duration-300 ease-out";

  let icon, colorClasses, title;

  if (type === "success") {
    icon = <Check size={20} className="text-green-600" />;
    colorClasses = "bg-white border-l-4 border-green-500";
    title = "Sukses!";
  } else if (type === "error") {
    icon = <AlertTriangle size={20} className="text-red-600" />;
    colorClasses = "bg-white border-l-4 border-red-500";
    title = "Kesalahan!";
  } else {
    return null;
  }

  return (
    <div className={`${baseClasses} ${colorClasses} opacity-100 translate-y-0`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {message.map((msg, index) => (
          <p key={index} className="text-sm text-gray-700 mt-1">
            {msg}
          </p>
        ))}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
        aria-label="Tutup notifikasi"
      >
        <XCircle size={16} />
      </button>
    </div>
  );
};

/* ===========================
   Main Component
   =========================== */

const Profile = () => {
  // auth store
  const { user: storeUser, checkAuth, loading: storeLoading, set } = useAuthStore();

  // UI states
  const [activeMenu, setActiveMenu] = useState("Data Pribadi");

  // local copy of user fields for editing
  const [editedData, setEditedData] = useState({ ...defaultProfileData });
  const [isDataPribadiEditable, setIsDataPribadiEditable] = useState(false);

  // refs & upload
  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // auth/profile saving states
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState(null);

  // account settings states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // toast
  const [toast, setToast] = useState({ message: null, type: null });

  // derive fields from editedData for easier access
  const {
    id,
    name,
    email,
    noHp,
    nik,
    currentStep,
    finalStatus,
    fullName,
    gender,
    birthPlace,
    birthDate,
    address,
    aboutMe,
    fotoProfile,
  } = editedData;

  // set initial data from storeUser
  useEffect(() => {
    // ensure auth checked
    if (!storeUser) checkAuth();
  }, [storeUser, checkAuth]);

  // sync store user to local editedData
  useEffect(() => {
    if (storeUser) {
      // map storeUser fields to expected fields
      const mapped = {
        ...defaultProfileData,
        id: storeUser.id ?? storeUser._id ?? defaultProfileData.id,
        name: storeUser.name ?? storeUser.fullName ?? defaultProfileData.name,
        email: storeUser.email ?? defaultProfileData.email,
        noHp: storeUser.noHp ?? storeUser.phone ?? storeUser.accountPhone ?? defaultProfileData.noHp,
        phone: storeUser.phone ?? storeUser.noHp ?? defaultProfileData.phone,
        nik: storeUser.nik ?? defaultProfileData.nik,
        fullName: storeUser.fullName ?? storeUser.name ?? defaultProfileData.fullName,
        gender: storeUser.gender ?? defaultProfileData.gender,
        birthPlace: storeUser.birthPlace ?? defaultProfileData.birthPlace,
        birthDate: storeUser.birthDate ?? defaultProfileData.birthDate,
        address: storeUser.address ?? defaultProfileData.address,
        aboutMe: storeUser.aboutMe ?? defaultProfileData.aboutMe,
        photoUrl: storeUser.photoUrl ?? storeUser.avatar ?? defaultProfileData.photoUrl,
        currentStep: storeUser.currentStep ?? defaultProfileData.currentStep,
        finalStatus: storeUser.finalStatus ?? defaultProfileData.finalStatus,
        accountPhone: storeUser.accountPhone ?? defaultProfileData.accountPhone,
      };
      setEditedData(mapped);
    } else {
      // no store user yet; keep defaults
      setEditedData(defaultProfileData);
    }
    setLoadingInitial(false);
  }, [storeUser]);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: null, type: null }), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const finalStatusClass = getFinalStatusColor(finalStatus);
  const statusText = getStatusText(finalStatus, currentStep);

  const displayData = (data) => (data && data !== "" ? toDisplayFormat(data) : "Data belum diisi");
  const dataClass = (data) => (data && data !== "" ? "text-gray-900 font-medium" : "text-gray-500 italic");

  const showToast = (message, type) => {
    setToast({ message: Array.isArray(message) ? message : [message], type });
  };

  /* ---------------------------
     Handlers: Data Pribadi
     --------------------------- */
  const handleDataPribadiChange = (e) => {
    const { id: fieldId, value } = e.target;
    setEditedData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleEditDataPribadi = () => setIsDataPribadiEditable(true);

  const handleCancelEdit = () => {
    // reset to store user data
    if (storeUser) {
      const mapped = {
        ...defaultProfileData,
        id: storeUser.id ?? storeUser._id ?? defaultProfileData.id,
        name: storeUser.name ?? storeUser.fullName ?? defaultProfileData.name,
        email: storeUser.email ?? defaultProfileData.email,
        noHp: storeUser.noHp ?? storeUser.phone ?? storeUser.accountPhone ?? defaultProfileData.noHp,
        phone: storeUser.phone ?? storeUser.noHp ?? defaultProfileData.phone,
        nik: storeUser.nik ?? defaultProfileData.nik,
        fullName: storeUser.fullName ?? storeUser.name ?? defaultProfileData.fullName,
        gender: storeUser.gender ?? defaultProfileData.gender,
        birthPlace: storeUser.birthPlace ?? defaultProfileData.birthPlace,
        birthDate: storeUser.birthDate ?? defaultProfileData.birthDate,
        address: storeUser.address ?? defaultProfileData.address,
        aboutMe: storeUser.aboutMe ?? defaultProfileData.aboutMe,
        photoUrl: storeUser.photoUrl ?? storeUser.avatar ?? defaultProfileData.photoUrl,
        currentStep: storeUser.currentStep ?? defaultProfileData.currentStep,
        finalStatus: storeUser.finalStatus ?? defaultProfileData.finalStatus,
        accountPhone: storeUser.accountPhone ?? defaultProfileData.accountPhone,
      };
      setEditedData(mapped);
    } else {
      setEditedData(defaultProfileData);
    }
    setIsDataPribadiEditable(false);
    setPasswordError(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveDataPribadi = async () => {
    // Simpan perubahan Data Pribadi via API (PATCH/PUT)
    try {
      setSaving(true);
      setError(null);

      // Prepare payload: only send editable fields
      const payload = {
        fullName: editedData.fullName,
        name: editedData.name,
        nik: editedData.nik,
        gender: editedData.gender,
        birthPlace: editedData.birthPlace,
        birthDate: editedData.birthDate,
        phone: editedData.phone || editedData.noHp,
        noHp: editedData.noHp || editedData.phone,
        address: editedData.address,
        aboutMe: editedData.aboutMe,
        email: editedData.email,
      };

      // call update endpoint
      const res = await axios.put(`/auth/update-profile/${editedData.id}`, payload);

      // update global store user jika backend mengembalikan data user
      if (res?.data?.user) {
        set({ user: res.data.user });
        // sinkron kembali editedData
        const updated = {
          ...editedData,
          ...res.data.user,
        };
        setEditedData(updated);
      } else {
        // fallback, update local state
        setEditedData((prev) => ({ ...prev, ...payload }));
      }

      setIsDataPribadiEditable(false);
      showToast("Data Pribadi berhasil diperbarui!", "success");
    } catch (err) {
      console.error("Save Data Pribadi error:", err);
      setError("Gagal menyimpan Data Pribadi. Coba lagi nanti.");
      showToast("Gagal menyimpan Data Pribadi.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     Handlers: Photo Upload
     --------------------------- */
  const handlePhotoUploadClientPreview = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("Jenis file tidak didukung. Harap unggah .JPG, .PNG, atau .GIF.", "error");
      fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast("Ukuran file terlalu besar. Maksimal 2MB.", "error");
      fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedPhoto(reader.result);
      showToast("Foto berhasil diunggah! (preview)", "success");
    };
    reader.readAsDataURL(file);

    // optional: auto-upload to backend
    // doUploadPhotoToServer(file);
  };

  const doUploadPhotoToServer = async (file) => {
    if (!file) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await axios.post(`/auth/upload-photo/${editedData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.user) {
        set({ user: res.data.user });
        setEditedData((prev) => ({ ...prev, photoUrl: res.data.user.photoUrl ?? prev.photoUrl }));
        showToast("Foto profil berhasil diunggah.", "success");
      } else if (res?.data?.photoUrl) {
        setEditedData((prev) => ({ ...prev, photoUrl: res.data.photoUrl }));
        showToast("Foto profil berhasil diunggah.", "success");
      } else {
        showToast("Upload foto selesai (server tidak mengembalikan url).", "success");
      }
    } catch (err) {
      console.error("Upload photo error", err);
      showToast("Gagal mengunggah foto. Coba lagi.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------
     Handlers: Pengaturan Akun
     --------------------------- */

  const handleSaveAkun = async () => {
    setPasswordError(null);
    const changes = [];

    // Validate password change
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError("Password baru dan Konfirmasi Password tidak sama!");
        return;
      }
      if (newPassword && newPassword.length < 6) {
        setPasswordError("Password minimal 6 karakter!");
        return;
      }
      // Additional checks
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSymbol = /[!@#$%^&*(),.?\":{}|<>]/.test(newPassword);
      if (!hasUpperCase || !hasNumber || !hasSymbol) {
        setPasswordError("Password harus mengandung huruf besar, angka, dan simbol!");
        return;
      }
      changes.push("Password berhasil diubah.");
    }

    if (uploadedPhoto) changes.push("Foto Profil berhasil diganti.");

    if (changes.length === 0) {
      showToast("Tidak ada perubahan yang terdeteksi untuk disimpan.", "error");
      return;
    }

    try {
      setSaving(true);
      // send changes to backend
      const payload = {};

      if (newPassword) payload.newPassword = newPassword;
      // handle photo upload if want to send
      // if (uploadedPhoto) payload.photo = uploadedPhoto (but file preferred)

      const res = await axios.put(`/auth/update-profile/${editedData.id}`, payload);

      if (res?.data?.user) {
        set({ user: res.data.user });
        setEditedData((prev) => ({ ...prev, ...res.data.user }));
      }

      showToast(changes, "success");

      // reset account fields
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
     Logout simulation
     --------------------------- */
  const handleLogout = () => {
    // Jika kamu punya action logout di store, panggil di sini
    // contoh: logout(); atau set({ user: null })
    try {
      set({ user: null });
      showToast("Logout berhasil. Silakan refresh halaman.", "success");
      setActiveMenu("Keluar");
    } catch (err) {
      console.error("Logout error", err);
      showToast("Gagal logout.", "error");
    }
  };

  /* ---------------------------
     Render main content by menu
     --------------------------- */

  const renderMainContent = () => {
    if (activeMenu === "Data Pribadi") {
      return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Data Pribadi</h3>
              <p className="text-sm text-gray-500 mt-1">
                {isDataPribadiEditable ? "Mode Edit Aktif. Jangan lupa simpan perubahan Anda." : "Pastikan data pribadi benar untuk mempermudah proses pendaftaran"}
              </p>
            </div>

            {isDataPribadiEditable ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center text-gray-600 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50 border border-gray-300"
                  aria-label="Batalkan Edit"
                >
                  Batalkan
                </button>
                <button
                  onClick={handleSaveDataPribadi}
                  className="flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 transition"
                  aria-label="Simpan Data"
                >
                  <Save size={20} className="mr-2" /> Simpan
                </button>
              </div>
            ) : (
              <button
                className="text-sky-600 hover:text-blue-800 transition p-2 rounded-full hover:bg-sky-50"
                aria-label="Edit Data"
                onClick={handleEditDataPribadi}
              >
                <Edit size={20} />
              </button>
            )}
          </div>

          <h4 className="text-lg font-bold text-gray-900 mt-6 mb-4">Biodata</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-gray-700">
            {/* Nama Lengkap */}
            <div className="col-span-1 md:col-span-2">
              <SettingsInput
                id="fullName"
                label="Nama Lengkap"
                value={fullName || name || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
              />
            </div>

            {/* NIK */}
            <div>
              <SettingsInput
                id="nik"
                label="NIK"
                value={nik || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <SettingsInput
                id="gender"
                label="Jenis Kelamin"
                value={gender || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
              />
            </div>

            {/* Tempat Lahir */}
            <div>
              <SettingsInput
                id="birthPlace"
                label="Tempat Lahir"
                value={birthPlace || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              {isDataPribadiEditable ? (
                <>
                  <SettingsInput
                    id="birthDate"
                    label="Tanggal Lahir"
                    value={toDisplayFormat(birthDate)}
                    onChange={(e) => {
                      // For editable text we interpret user input as DD-MM-YYYY -> convert to internal YYYY-MM-DD if possible
                      const val = e.target.value;
                      // Try to detect DD-MM-YYYY -> convert to YYYY-MM-DD
                      const parts = val.split("-");
                      if (parts.length === 3) {
                        const [dd, mm, yyyy] = parts;
                        // naive validation
                        if (dd.length === 2 && mm.length === 2 && yyyy.length === 4) {
                          setEditedData((prev) => ({ ...prev, birthDate: `${yyyy}-${mm}-${dd}` }));
                        } else {
                          // just set the display text (won't persist to backend until native date picks)
                          setEditedData((prev) => ({ ...prev, birthDate: val }));
                        }
                      } else {
                        setEditedData((prev) => ({ ...prev, birthDate: val }));
                      }
                    }}
                    editable={isDataPribadiEditable}
                    readOnly={!isDataPribadiEditable}
                    type="text"
                    showDateIcon={true}
                    dateInputRef={dateInputRef}
                  />
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="absolute opacity-0 w-0 h-0 p-0 m-0"
                    value={toDateInputFormat(birthDate)}
                    onChange={(e) => {
                      const internalFormat = e.target.value;
                      setEditedData((prev) => ({ ...prev, birthDate: internalFormat }));
                    }}
                  />
                </>
              ) : (
                <div className="mb-4">
                  <p className="text-base font-bold text-gray-800 mb-1">Tanggal Lahir</p>
                  <div className={`px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-800`}>
                    <p className={dataClass(birthDate)}>{displayData(birthDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* No Handphone */}
            <div>
              <SettingsInput
                id="phone"
                label="No Handphone"
                value={editedData.phone || editedData.noHp || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
                type="tel"
              />
            </div>

            {/* Email */}
            <div>
              <div className="mb-4">
                <p className="text-base font-bold text-gray-800 mb-1">Email</p>
                <div className={`px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-800`}>
                  <p className={dataClass(email)}>{email || "Data belum diisi"}</p>
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="col-span-1 md:col-span-2">
              <SettingsInput
                id="address"
                label="Alamat Lengkap"
                value={address || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
                isTextArea={true}
              />
            </div>

            {/* About Me */}
            <div className="col-span-1 md:col-span-2">
              <SettingsInput
                id="aboutMe"
                label="Tentang Saya (About Me)"
                value={aboutMe || ""}
                onChange={handleDataPribadiChange}
                editable={isDataPribadiEditable}
                readOnly={!isDataPribadiEditable}
                isTextArea={true}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === "Pengaturan Akun") {
      return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Pengaturan Akun</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">Atur password akun</p>

          <h4 className="text-lg font-bold text-gray-800 mt-6 mb-4 border-t border-gray-300 pt-4">Ubah Password</h4>

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
              onClick={handleSaveAkun}
              className="w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center transform hover:scale-[1.01] disabled:opacity-50 disabled:shadow-none disabled:transform-none"
              disabled={(newPassword === "" && confirmPassword === "") || (!!newPassword && newPassword !== confirmPassword)}
            >
              <Save size={20} className="mr-2" /> Simpan Password
            </button>
          </div>
        </div>
      );
    }

    if (activeMenu === "Keluar") {
      return (
        <div className="p-6 text-red-600 font-semibold bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center space-x-3">
          <LogOut size={24} />
          <p>Anda memilih <strong>Keluar</strong>. Simulasi Log Out berhasil. Silakan refresh halaman.</p>
        </div>
      );
    }

    return <div className="p-6 text-gray-500 bg-white rounded-xl shadow">Konten untuk '{activeMenu}' belum tersedia.</div>;
  };

  /* ===========================
     Render keseluruhan
     =========================== */

  if (storeLoading || loadingInitial) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
        <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
        <p className="text-sky-700 font-semibold text-lg">Memuat data pengguna...</p>
      </div>
    );
  }

  const currentPhotoUrl = uploadedPhoto || editedData.photoUrl || defaultProfileData.photoUrl;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 font-sans bg-gray-50 min-h-screen">
      {/* Toast */}
      <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: null })} />

      {/* Center area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center border border-sky-100">
            <div className="relative w-24 h-24 mx-auto mb-3 group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
              <img className="w-24 h-24 rounded-full object-cover shadow-md transition-all duration-300 group-hover:opacity-70" src={currentPhotoUrl} alt={`Foto ${name || editedData.name}`} />

              <input type="file" ref={fileInputRef} onChange={(e) => { handlePhotoUploadClientPreview(e); if (e.target.files?.[0]) doUploadPhotoToServer(e.target.files[0]); }} accept="image/jpeg,image/png,image/gif" className="hidden" />

              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full text-white transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} focus:outline-none focus:ring-2 focus:ring-sky-500`}
                aria-label="Ganti Foto Profil"
                title="Ganti Foto Profil"
              >
                <Edit size={24} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-900">{name || editedData.name || "Nama Pengguna"}</h2>
          </div>

          <nav className="bg-white rounded-xl shadow-lg p-4 space-y-1 border border-gray-100">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  if (item.name === "Keluar") handleLogout();
                }}
                className={`w-full flex items-center p-3 rounded-lg transition duration-150 text-left text-base ${
                  item.name === activeMenu ? "bg-blue-50 text-blue-700 font-semibold shadow-inner" : "text-gray-600 hover:bg-gray-100"
                } ${item.name === "Keluar" ? "border-t border-gray-200 mt-2 pt-2 text-red-600 hover:text-red-700" : ""}`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main */}
        <div className="w-full lg:w-3/4 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Tahapan Seleksi</h3>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${finalStatusClass}`}>
                {finalStatus === "Accepted" && <CheckCircle size={16} className="mr-2" />}
                {finalStatus === "Rejected" && <XCircle size={16} className="mr-2" />}
                {finalStatus === "Pending" && <Clock size={16} className="mr-2" />}
                {statusText}
              </span>
            </div>

            <div className="flex items-start overflow-x-auto pb-2">
              {HIRING_STEPS.map((step, index) => {
                const state = getStepState(step.name, currentStep, finalStatus);
                const NodeIcon = step.icon;
                let nodeColor;
                let iconColor;
                let IconComponent = NodeIcon;

                if (state === "accepted" || state === "completed") {
                  nodeColor = "bg-green-500";
                  iconColor = "text-white";
                } else if (state === "rejected") {
                  nodeColor = "bg-red-500";
                  iconColor = "text-white";
                  IconComponent = XCircle;
                } else if (state === "active") {
                  nodeColor = `bg-white border-2 border-sky-500`;
                  iconColor = "text-sky-500";
                } else {
                  nodeColor = "bg-gray-200";
                  iconColor = "text-gray-500";
                }

                const prevStepState = index > 0 ? getStepState(HIRING_STEPS[index - 1].name, currentStep, finalStatus) : null;

                const lineColor = prevStepState === "completed" || prevStepState === "accepted" ? "bg-green-500" : prevStepState === "rejected" ? "bg-red-500" : "bg-gray-300";

                const lineRightColor = state === "completed" || state === "active" || state === "accepted" ? "bg-green-500" : state === "rejected" ? "bg-red-500" : "bg-gray-300";

                const textColor = state === "active" ? "text-blue-600 font-semibold" : state === "completed" || state === "accepted" ? "text-gray-900" : state === "rejected" ? "text-red-600 line-through" : "text-gray-500";

                return (
                  <div key={step.id} className="flex flex-col items-center min-w-[120px] text-center flex-1">
                    <div className="flex items-center w-full">
                      {index !== 0 ? <div className={`flex-1 h-1 transition duration-500 ${lineColor}`} /> : <div className="w-1/2 h-1 bg-transparent" />}

                      <div className={`w-6 h-6 rounded-full transition duration-500 flex-shrink-0 flex items-center justify-center ${nodeColor}`}>
                        <IconComponent size={14} className={iconColor} />
                      </div>

                      {index !== HIRING_STEPS.length - 1 ? <div className={`flex-1 h-1 transition duration-500 ${lineRightColor}`} /> : <div className="w-1/2 h-1 bg-transparent" />}
                    </div>

                    <p className={`mt-2 text-sm ${textColor} transition duration-500`}>{step.name}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic content */}
          {renderMainContent()}
        </div>
      </div>

      {/* Global fixed saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90">
          <LoaderIcon className="w-12 h-12 text-sky-600 animate-spin mb-3" />
          <p className="text-sky-700 font-semibold text-lg">Menyimpan perubahan...</p>
        </div>
      )}

      {/* Local non-fatal error */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </div>
  );
};

export default Profile;
