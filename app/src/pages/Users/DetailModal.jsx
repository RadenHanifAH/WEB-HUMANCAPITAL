// src/components/DetailModal.jsx
import React from "react";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Hash,
  UserCheck,
  CalendarDays,
  Globe,
  BookOpen,
} from "lucide-react";

const DetailModal = ({ applicant, onClose }) => {
  if (!applicant) return null;

  // --- Data Profil Tambahan (Hardcoded dari gambar) ---
  const profileData = {
    fullName: "Raden Hanif Abdul Hakim",
    nik: "1234567890123456",
    gender: "Laki-laki",
    birthPlace: "Jakarta",
    birthDate: "17-08-1995",
    phone: "+6289515222861",
    email: "anya.g@email.com",
    fullAddress: "Jl. Pegangsaan Timur No. 56, Menteng, Jakarta Pusat",
    aboutMe:
      "Lulusan DKV dengan pengalaman 3 tahun di bidang desain antarmuka dan pengalaman pengguna. Memiliki passion tinggi dalam menciptakan user experience yang intuitif dan menarik. Terampil dalam Figma, Sketch, Adobe XD, serta memiliki pemahaman yang kuat tentang prinsip-prinsip desain UI/UX.",
    education: "S1 Teknik Informatika",
  };
  // ----------------------------------------------------

  // --- LOGIKA DARI PELAMAR.JSX ---
  const blockedScoreStages = ["under-review", "interview-hc"];
  const shouldDisplayScore =
    !blockedScoreStages.includes(applicant.status) &&
    !applicant.status.startsWith("rejected-at-under-review");

  const completeness = {
    dataLengkap: true,
    cvTerupload: true,
  };

  const getStageIcon = (stageStatus) => {
    const stageFlow = [
      "under-review",
      "interview-hc",
      "psikotes",
      "final-interview",
    ];
    const currentStatus = applicant.status;
    const stageIndex = stageFlow.indexOf(stageStatus);

    if (currentStatus.startsWith("rejected")) {
      const rejectedAtStage = currentStatus.split("-").slice(-2, -1)[0];
      const rejectionIndex = stageFlow.indexOf(rejectedAtStage);

      if (rejectionIndex === -1)
        return <XCircle className="h-5 w-5 text-red-500" />;

      if (stageIndex >= rejectionIndex) {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
    }

    const currentStageIndex = stageFlow.indexOf(currentStatus);

    if (currentStatus === "accepted" || stageIndex <= currentStageIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return <CheckCircle className="h-5 w-5 text-gray-300" />;
  };
  // -------------------------------

  // Helper component untuk field input read-only yang disederhanakan
  const DetailField = ({ label, value, icon: Icon }) => (
    <div className={"col-span-1"}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 text-gray-800 text-base">
        {Icon && <Icon className="h-5 w-5 text-sky-600" />}
        <span className="font-medium text-gray-900">{value || "-"}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      {/* Menggunakan rounded-xl untuk rounding yang rapi */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 p-8 space-y-7 max-h-[90vh] overflow-y-auto">
        {/* Bagian 1: Header dan Tombol Tutup */}
        <div className="flex justify-between items-start pb-5 border-b border-gray-200">
          <div className="flex items-center gap-5">
            <img
              src={applicant.avatar}
              alt={applicant.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {profileData.fullName}
                </h2>
                {/* Status tag yang tidak mencolok */}
                {applicant.status === "accepted" && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Diterima
                  </span>
                )}
                {applicant.status.startsWith("rejected") && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Ditolak
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg mt-1">{applicant.position}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            {shouldDisplayScore && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-sky-50 px-3 py-1 rounded-full">
                <TrendingUp className="h-4 w-4 text-sky-600" />
                <span>
                  Score:{" "}
                  <span className="font-bold text-sky-700">
                    {applicant.score || 0}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bagian 3: Detail Profil Pribadi (Grid Tanpa Border) */}
        <h3 className="text-xl font-bold text-gray-900 mt-6">
          Informasi Pribadi
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          {/* NIK & Jenis Kelamin */}
          <DetailField label="NIK" value={profileData.nik} icon={Hash} />
          <DetailField
            label="Jenis Kelamin"
            value={profileData.gender}
            icon={UserCheck}
          />

          {/* Tempat & Tanggal Lahir */}
          <DetailField
            label="Tempat Lahir"
            value={profileData.birthPlace}
            icon={MapPin}
          />
          <DetailField
            label="Tanggal Lahir"
            value={profileData.birthDate}
            icon={CalendarDays}
          />

          {/* Kontak: HP & Email */}
          <DetailField
            label="No Handphone"
            value={profileData.phone}
            icon={Phone}
          />
          <DetailField label="Email" value={profileData.email} icon={Mail} />
        </div>

        {/* Alamat Lengkap - Dibuat minimalis dan rapi */}
        <div className="space-y-3 pt-6 border-t border-gray-200 mt-7">
          <h4 className="block text-sm font-medium text-gray-700 mb-1">
            Alamat Lengkap
          </h4>
          <div className="flex items-start gap-2 text-gray-800 text-base">
            <MapPin className="h-5 w-5 text-sky-600" />
            <span className="font-medium text-gray-900 leading-relaxed">
              {profileData.fullAddress || "-"}
            </span>
          </div>
        </div>

        {/* Bagian 4: Tentang Saya - Mengubah p-4 dan rounded-lg agar seragam */}
        <div className="space-y-3 pt-6 border-t border-gray-200 mt-7">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Tentang Saya</h3>
          {/* Styling dikembalikan ke format box yang rapi, dengan rounded-lg yang konsisten */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-800 text-base leading-relaxed min-h-[100px]">
            {profileData.aboutMe}
          </div>
        </div>

        {/* Bagian 5: Progress Seleksi & Status Kelengkapan (Pendidikan & Pengalaman Dihilangkan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-200 mt-7">
          {/* Progress Seleksi */}
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Progress Seleksi
            </h3>
            <div className="space-y-3">
              {[
                { status: "under-review", label: "Under Review" },
                { status: "interview-hc", label: "Interview HC" },
                { status: "psikotes", label: "Psikotes" },
                { status: "final-interview", label: "Final Interview" },
              ].map((stage) => (
                <div
                  key={stage.status}
                  className="flex items-center gap-3 text-gray-700"
                >
                  {getStageIcon(stage.status)}
                  <span className="text-base">{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Kelengkapan Dokumen (Dipindahkan ke kolom kedua) */}
          <div className="mt-0 md:mt-0">
            {" "}
            {/* Menyesuaikan margin agar sejajar dengan Progress Seleksi */}
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Status Kelengkapan Dokumen
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                {completeness.dataLengkap ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-base">Data Pribadi Lengkap</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                {completeness.cvTerupload ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-base">CV Terupload</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
