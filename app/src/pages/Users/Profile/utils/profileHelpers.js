import { User as UserIcon, Settings, LogOut } from "lucide-react";

/** fallback profile structure */
export const defaultProfileData = {
  id: null,
  name: "",
  email: "",
  profile: {
    fullName: "",
    NIK: "",
    gender: "",
    nomorHp: "",
    tempatLahir: "",
    tanggalLahir: "",
    alamat: "",
    fotoProfile: "",
    about: "",
  },
  currentStep: "Screaning",
  finalStatus: "Pending",
};

export const menuItems = [
  { name: "Data Pribadi", icon: UserIcon },
  { name: "Pengaturan Akun", icon: Settings },
  { name: "Keluar", icon: LogOut },
];

export const toDateInputFormat = (dateStr) => dateStr || "";

export const toDisplayFormat = (dateStr) => {
  if (!dateStr || dateStr === "") return "Data belum diisi";

  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoMatch) dateStr = isoMatch[1];

  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return dateStr;
};

// ✅ jika user belum melamar => semua pending (abu)
export const getStepState = (stepName, currentStep, finalStatus, steps) => {
  if (!currentStep) return "pending";

  const currentStepIndex = steps.findIndex((step) => step.name === currentStep);
  const stepIndex = steps.findIndex((step) => step.name === stepName);

  if (currentStepIndex === -1 || stepIndex === -1) return "pending";

  if (finalStatus === "Rejected") {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "rejected";
    return "pending";
  }

  if (finalStatus === "Accepted" && stepName === "Offering/Final Result") return "accepted";
  if (finalStatus === "Accepted" && stepIndex < steps.length - 1) return "completed";

  if (stepIndex < currentStepIndex) return "completed";
  if (stepIndex === currentStepIndex) return "active";

  return "pending";
};

/**
 * ✅ Warna badge berdasarkan step (Pending)
 * Kamu bisa ubah mapping warnanya sesuka kamu
 */
export const getStepBadgeColor = (currentStep) => {
  const step = String(currentStep || "").trim();

  // default kalau kosong / belum melamar
  if (!step) return "bg-gray-100 text-gray-700";

  switch (step) {
    case "Screaning":
      return "bg-orange-100 text-orange-600";
    case "Interview HC":
      return "bg-blue-100 text-blue-600";
    case "Psikotes/technical test":
      return "bg-purple-100 text-purple-600";
    case "Final Interview":
      return "bg-green-100 text-green-600";
    case "Offering/Final Result":
      return "bg-teal-100 text-teal-700";
    default:
      // kalau ada mismatch nama step
      return "bg-gray-100 text-gray-700";
  }
};

/**
 * ✅ Class badge final status (Accepted / Rejected / Pending)
 * - Pending sekarang warnanya mengikuti step
 */
export const getFinalStatusColor = (finalStatus, currentStep) => {
  if (finalStatus === "Accepted") return "bg-green-100 text-green-700";
  if (finalStatus === "Rejected") return "bg-red-100 text-red-700";
  return getStepBadgeColor(currentStep); // ✅ pending ikut step
};

/**
 * ✅ Text badge kanan atas
 * - "PROSES" dihilangkan
 * - jadi langsung "(currentStep)"
 */
export const getStatusText = (finalStatus, currentStep) => {
  if (finalStatus === "Accepted") return "DITERIMA";
  if (finalStatus === "Rejected") return "DITOLAK";
  if (currentStep) return `(${currentStep})`; // ✅ tanpa "PROSES"
  return "BELUM MELAMAR";
};
