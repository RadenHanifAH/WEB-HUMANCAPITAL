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
  Calendar
} from "lucide-react";

// --- Data & Konfigurasi Simulasi ---

const userProfileData = {
  id: 101,
  name: "Anya Geraldine",
  email: "anya.g@email.com",
  phone: "+6289515222861",
  position: "UI/UX Designer",
  currentCompany: "Digital Creative Hub",
  location: "Bandung, Jawa Barat",
  education: "S1 Desain Komunikasi Visual (DKV)",
  experience: "3 Tahun",
  currentStep: "Psikotes", 
  finalStatus: "Pending", 
  photoUrl: "https://i.pravatar.cc/150?img=47",

  fullName: "Raden Hanif Abdul Hakim",
  nik: "1234567890123456",
  gender: "Laki-laki",
  birthPlace: "Jakarta",
  // Format data internal YYYY-MM-DD
  birthDate: "1995-08-17", 
  address: "Jl. Pegangsaan Timur No. 56, Menteng, Jakarta Pusat",
  aboutMe:
    "Lulusan DKV dengan pengalaman 3 tahun di bidang desain antarmuka dan pengalaman pengguna.",

  // Data akun tetap ada untuk simulasi
  accountPhone: "+6289515222861", 
  currentPassword: "PasswordLama123!", 
};

// Tahapan Proses Perekrutan (DITAMBAH ICON DAN WARNA TAHAPAN)
const HIRING_STEPS = [
  { id: 1, name: "Under Review", icon: Clock, color: "text-orange-500" },
  { id: 2, name: "Interview HC", icon: UserIcon, color: "text-blue-500" },
  { id: 3, name: "Psikotes", icon: Clock, color: "text-purple-500" }, 
  { id: 4, name: "Final Interview", icon: Briefcase, color: "text-green-500" },
  { id: 5, name: "Offering/Final Result", icon: GraduationCap, color: "text-sky-700" },
];

// Item menu navigasi sidebar
const menuItems = [
  { name: "Data Pribadi", icon: UserIcon },
  { name: "Pengaturan Akun", icon: Settings }, 
  { name: "Keluar", icon: LogOut },
];

// --- Helper Functions ---

/** Mengkonversi YYYY-MM-DD ke YYYY-MM-DD (untuk data input internal) */
const toDateInputFormat = (dateStr) => {
    return dateStr;
};

/** Mengkonversi YYYY-MM-DD ke DD-MM-YYYY untuk tampilan dan input type="text" */
const toDisplayFormat = (dateStr) => {
    if (!dateStr || dateStr === "Data belum diisi") return "Data belum diisi";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
    }
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
  return finalStatus === "Accepted"
    ? "DITERIMA"
    : finalStatus === "Rejected"
    ? "DITOLAK"
    : `PROSES (${currentStep})`;
};

// --- Reusable Components ---

const SettingsInput = ({
  label,
  value,
  type = "text",
  readOnly = false,
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
  const inputType = customType === 'password' ? (isPasswordVisible ? 'text' : 'password') : customType || type;
  
  const InputComponent = isTextArea ? 'textarea' : 'input';
  
  const paddingClass = (showToggle || showDateIcon) ? 'pr-10' : 'pr-4';

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
          } ${isTextArea ? 'resize-none' : ''} ${paddingClass}`}
        />
        
        {/* Toggle Password Visibility */}
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
        
        {/* Ikon Kalender Kustom yang Memicu Native Date Picker */}
        {showDateIcon && editable && (
            <button
                type="button"
                onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
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

  if (type === 'success') {
    icon = <Check size={20} className="text-green-600" />;
    colorClasses = "bg-white border-l-4 border-green-500";
    title = "Sukses!";
  } else if (type === 'error') {
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
          <p key={index} className="text-sm text-gray-700 mt-1">{msg}</p>
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


// --- Main Component ---

const User = () => {
  const [activeMenu, setActiveMenu] = useState("Data Pribadi");
  
  // Data Pribadi States
  const [isDataPribadiEditable, setIsDataPribadiEditable] = useState(false);
  const [editedData, setEditedData] = useState(userProfileData); 
  
  // Ref untuk Date Picker
  const dateInputRef = useRef(null);

  // Pengaturan Akun States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null); 

  // Lain-lain
  const [uploadedPhoto, setUploadedPhoto] = useState(null); 
  const fileInputRef = useRef(null); 
  const [isHovered, setIsHovered] = useState(false); 
  const [toast, setToast] = useState({ message: null, type: null });

  // Destructure data dari state editedData
  const {
    name, email, phone, currentStep, finalStatus, fullName, nik, gender,
    birthPlace, birthDate, address, aboutMe
  } = editedData;


  // Effects & Helpers
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: null, type: null });
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const finalStatusClass = getFinalStatusColor(finalStatus);
  const statusText = getStatusText(finalStatus, currentStep);

  const displayData = (data) =>
    data && data !== "" ? toDisplayFormat(data) : "Data belum diisi"; 
  const dataClass = (data) =>
    data && data !== "" ? "text-gray-900 font-medium" : "text-gray-500 italic";
    
  const showToast = (message, type) => {
    setToast({ message: Array.isArray(message) ? message : [message], type });
  };
  
  // Handler untuk Data Pribadi
  const handleEditDataPribadi = () => {
    setIsDataPribadiEditable(true);
  }

  const handleCancelEdit = () => {
    setIsDataPribadiEditable(false);
    // Kembalikan ke data awal 
    setEditedData(userProfileData); 
  }

  const handleDataPribadiChange = (e) => {
    const { id, value } = e.target;

    setEditedData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveDataPribadi = () => {
      // Logika simpan data ke backend (simulasi)
      console.log("Menyimpan Data Pribadi:", editedData);
      
      setIsDataPribadiEditable(false);
      showToast("Data Pribadi berhasil diperbarui!", 'success');
  };
  
  // Handler untuk Foto
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast("Jenis file tidak didukung. Harap unggah .JPG, .PNG, atau .GIF.", 'error');
        fileInputRef.current.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showToast("Ukuran file terlalu besar. Maksimal 2MB.", 'error');
        fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result); 
        showToast(`Foto berhasil diunggah!`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };


  // Handler untuk Pengaturan Akun (Hanya untuk Password dan Foto)
  const handleSaveAkun = () => {
    const password = newPassword;
    let changes = []; 
    
    setPasswordError(null); 

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        const errorMsg = "Password baru dan Konfirmasi Password tidak sama!";
        setPasswordError(errorMsg);
        return;
      }
      
      if (password.length > 0 && password === userProfileData.currentPassword) { 
        const errorMsg = "Password baru yang dimasukkan sudah digunakan. Silakan gunakan password lain.";
        setPasswordError(errorMsg);
        return;
      }

      if (password.length > 0) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password); 
        
        if (password.length < minLength) {
          const errorMsg = `Password minimal ${minLength} karakter!`;
          setPasswordError(errorMsg);
          return;
        }

        if (!hasUpperCase || !hasNumber || !hasSymbol) {
          const errorMsg = "Password harus mengandung huruf besar, angka, dan simbol!";
          setPasswordError(errorMsg);
          return;
        }
        changes.push("Password berhasil diubah.");
      }
    }
    
    if (passwordError) return;

    if (uploadedPhoto) {
        changes.push("Foto Profil berhasil diganti.");
    }

    if (changes.length > 0) {
        showToast(changes, 'success');
    } else {
        showToast("Tidak ada perubahan yang terdeteksi untuk disimpan.", 'error');
    }

    // Reset states setelah berhasil
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const currentPhotoUrl = uploadedPhoto || userProfileData.photoUrl;

  // ======================
  // Render Main Content
  // ======================
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
            
            {/* Tombol Edit/Simpan/Batal */}
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
                value={fullName} 
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
                value={nik} 
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
                value={gender} 
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
                value={birthPlace} 
                onChange={handleDataPribadiChange} 
                editable={isDataPribadiEditable} 
                readOnly={!isDataPribadiEditable} 
              />
            </div>

            {/* Tanggal Lahir (DD-MM-YYYY di mode edit) */}
            <div>
            {isDataPribadiEditable ? (
              <>
              <SettingsInput 
                id="birthDate"
                label="Tanggal Lahir" 
                // Menampilkan DD-MM-YYYY untuk input text
                value={toDisplayFormat(birthDate)} 
                onChange={handleDataPribadiChange} 
                editable={isDataPribadiEditable} 
                readOnly={!isDataPribadiEditable}
                type="text" 
                showDateIcon={true} // Tampilkan ikon kalender kustom
                dateInputRef={dateInputRef} // Pass the ref
              />
              {/* Input tersembunyi type="date" untuk Native Picker dan menyimpan YYYY-MM-DD */}
              <input 
                  ref={dateInputRef} 
                  type="date" 
                  className="absolute opacity-0 w-0 h-0 p-0 m-0" // Menyembunyikan input secara visual
                  value={toDateInputFormat(birthDate)} // Value YYYY-MM-DD
                  onChange={(e) => {
                      // Ketika native date picker diubah, update editedData dengan format internal
                      const internalFormat = e.target.value; // YYYY-MM-DD
                      setEditedData(prev => ({ 
                          ...prev, 
                          birthDate: internalFormat 
                      }));
                  }}
              />
              </>
            ) : (
                <div className="mb-4">
                    <p className="text-base font-bold text-gray-800 mb-1">Tanggal Lahir</p>
                    {/* Styling konsisten dengan input non-editable (bg-gray-100 border-gray-200) */}
                    <div className={`px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-800`}>
                        <p className={dataClass(birthDate)}>{displayData(birthDate)}</p>
                    </div>
                </div>
            )}
            </div>
            
            {/* No Handphone (BISA DIEDIT DI SINI) */}
            <div>
              <SettingsInput 
                id="phone"
                label="No Handphone" 
                value={phone} 
                onChange={handleDataPribadiChange} 
                editable={isDataPribadiEditable} 
                readOnly={!isDataPribadiEditable}
                type="tel" 
              />
            </div>

            {/* Email (BORDER ABU SELALU ADA) */}
            <div>
              <div className="mb-4">
                <p className="text-base font-bold text-gray-800 mb-1">Email</p>
                
                {/* Tampilan input/display dengan styling input non-editable yang konsisten */}
                <div className={`px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-800`}>
                    <p className={dataClass(email)}>{displayData(email)}</p>
                </div>
              </div>
            </div>


            {/* Alamat */}
            <div className="col-span-1 md:col-span-2">
               <SettingsInput 
                id="address"
                label="Alamat Lengkap" 
                value={address} 
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
                value={aboutMe} 
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
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Atur password akun
          </p>

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
            onToggleVisibility={() => setShowNewPassword(prev => !prev)}
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
            onToggleVisibility={() => setShowConfirmPassword(prev => !prev)}
            readOnly={false}
          />

          <div className="mt-8 pt-4 border-t border-gray-300">
            <button
              onClick={handleSaveAkun}
              // Tombol hanya aktif jika ada salah satu field password yang terisi
              className="w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center transform hover:scale-[1.01] disabled:opacity-50 disabled:shadow-none disabled:transform-none"
              disabled={
                  (newPassword === "" && confirmPassword === "") || 
                  (!!newPassword && newPassword !== confirmPassword)
              }
            >
              <Save size={20} className="mr-2" /> Simpan Password
            </button>
          </div>
        </div>
      );
    }
    
    if (activeMenu === "Keluar") {
        console.log("Simulasi proses logout...");
        return (
          <div className="p-6 text-red-600 font-semibold bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center space-x-3">
            <LogOut size={24} />
            <p>Anda memilih **Keluar**. Simulasi Log Out berhasil. Silakan refresh halaman.</p>
          </div>
        );
    }

    return (
      <div className="p-6 text-gray-500 bg-white rounded-xl shadow">
        Konten untuk '{activeMenu}' belum tersedia.
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 font-sans bg-gray-50 min-h-screen">
      
      {/* Toast Notification Container */}
      <ToastNotification 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: null, type: null })}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center border border-sky-100">
            
            {/* Photo Profile Section */}
            <div 
                className="relative w-24 h-24 mx-auto mb-3 group" 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
              <img
                className="w-24 h-24 rounded-full object-cover shadow-md transition-all duration-300 group-hover:opacity-70"
                src={currentPhotoUrl} 
                alt={`Foto ${name}`}
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current.click()}
                className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full text-white transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                } focus:outline-none focus:ring-2 focus:ring-sky-500`}
                aria-label="Ganti Foto Profil"
                title="Ganti Foto Profil"
              >
                <Edit size={24} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          </div>

          {/* Navigation Menu */}
          <nav className="bg-white rounded-xl shadow-lg p-4 space-y-1 border border-gray-100">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                    setActiveMenu(item.name);
                    if (item.name === "Keluar") {
                        console.log("Tombol Keluar diklik. Menjalankan fungsi Log Out...");
                    }
                }}
                className={`w-full flex items-center p-3 rounded-lg transition duration-150 text-left text-base ${
                  item.name === activeMenu
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-inner"
                    : "text-gray-600 hover:bg-gray-100"
                } ${item.name === "Keluar" ? "border-t border-gray-200 mt-2 pt-2 text-red-600 hover:text-red-700" : ""}`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="w-full lg:w-3/4 space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Tahapan Seleksi</h3>
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${finalStatusClass}`}
              >
                {finalStatus === "Accepted" && <CheckCircle size={16} className="mr-2" />}
                {finalStatus === "Rejected" && <XCircle size={16} className="mr-2" />}
                {finalStatus === "Pending" && <Clock size={16} className="mr-2" />}
                {statusText}
              </span>
            </div>

            {/* Timeline Steps Container - Sudah disesuaikan */}
            <div className="flex items-start overflow-x-auto pb-2"> 
              {HIRING_STEPS.map((step, index) => {
                const state = getStepState(step.name, currentStep, finalStatus);

                const NodeIcon = step.icon;
                
                let nodeColor; 
                let iconColor; 
                let IconComponent = NodeIcon; 

                // Logika untuk Warna Node Circle dan Icon
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
                } else { // pending
                  nodeColor = "bg-gray-200";
                  iconColor = "text-gray-500"; 
                }
                
                const prevStepState = index > 0
                    ? getStepState(HIRING_STEPS[index - 1].name, currentStep, finalStatus)
                    : null;

                const lineColor =
                    prevStepState === "completed" || prevStepState === "accepted"
                      ? "bg-green-500"
                      : prevStepState === "rejected"
                      ? "bg-red-500"
                      : "bg-gray-300";

                const lineRightColor =
                    state === "completed" || state === "active" || state === "accepted"
                      ? "bg-green-500"
                      : state === "rejected"
                      ? "bg-red-500"
                      : "bg-gray-300";

                const textColor =
                    state === "active"
                      ? "text-blue-600 font-semibold"
                      : state === "completed" || state === "accepted"
                      ? "text-gray-900"
                      : state === "rejected"
                      ? "text-red-600 line-through"
                      : "text-gray-500";


                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center min-w-[120px] text-center flex-1" 
                  >
                    <div className="flex items-center w-full">
                      {/* LEFT LINE */}
                      {index !== 0 ? (
                        <div className={`flex-1 h-1 transition duration-500 ${lineColor}`} />
                      ) : (
                        <div className="w-1/2 h-1 bg-transparent" /> 
                      )}

                      {/* NODE CIRCLE */}
                      <div
                        className={`w-6 h-6 rounded-full transition duration-500 flex-shrink-0 flex items-center justify-center ${nodeColor}`}
                      >
                        <IconComponent size={14} className={iconColor} />
                      </div>

                      {/* RIGHT LINE */}
                      {index !== HIRING_STEPS.length - 1 ? (
                        <div
                          className={`flex-1 h-1 transition duration-500 ${lineRightColor}`}
                        />
                      ) : (
                        <div className="w-1/2 h-1 bg-transparent" /> 
                      )}
                    </div>

                    <p className={`mt-2 text-sm ${textColor} transition duration-500`}>
                      {step.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content */}
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default User;