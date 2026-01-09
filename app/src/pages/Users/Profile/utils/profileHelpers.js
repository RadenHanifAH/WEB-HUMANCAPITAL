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
  currentStep: "Under Review",
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

export const getStepState = (stepName, currentStep, finalStatus, steps) => {
  const currentStepIndex = steps.findIndex((step) => step.name === currentStep);
  const stepIndex = steps.findIndex((step) => step.name === stepName);

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

export const getFinalStatusColor = (finalStatus) => {
  return finalStatus === "Accepted"
    ? "bg-green-100 text-green-700"
    : finalStatus === "Rejected"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-700";
};

export const getStatusText = (finalStatus, currentStep) => {
  return finalStatus === "Accepted"
    ? "DITERIMA"
    : finalStatus === "Rejected"
    ? "DITOLAK"
    : `PROSES (${currentStep})`;
};
