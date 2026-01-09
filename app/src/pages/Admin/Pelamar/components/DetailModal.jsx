import React from "react";
import {
  CheckCircle,
  XCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Hash,
  UserCheck,
  User,
  CalendarDays,
  TrendingUp as ScoreIcon,
} from "lucide-react";



const toKebab = (val) =>
  String(val || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const DetailModal = ({ applicant, profile, onClose }) => {
  if (!applicant) return null;

  // ✅ NORMALIZE
  const statusRaw = applicant.status || "";
  const stageRaw = applicant.stage || ""; // ✅ ambil stage dari application
  const status = toKebab(statusRaw);
  const stage = toKebab(stageRaw);

  // ✅ flow harus konsisten kebab-case
  const stageFlow = [
    "under-review",
    "interview-hc",
    "psikotes",
    "final-interview",
    "offering-final-result",
  ];

  // ✅ Final status
  const isAccepted =
    status === "accepted" || status.includes("accept") || stage === "accepted";
  const isRejected =
    status === "rejected" || status.includes("reject") || stage === "rejected";

  const blockedScoreStages = ["under-review", "interview-hc"];
  const shouldDisplayScore =
    !blockedScoreStages.includes(status) && !isRejected;

  // ✅ Tentukan posisi progress berdasarkan STAGE kalau ada,
  // fallback ke STATUS kalau stage kosong
  const currentKey = stage || status;
  const currentIndex = stageFlow.indexOf(currentKey);

  const getStageIcon = (stageKey) => {
    const idx = stageFlow.indexOf(stageKey);

    // kalau accepted -> semua hijau
    if (isAccepted) return <CheckCircle className="h-5 w-5 text-green-500" />;

    // kalau rejected -> semua setelah posisi current jadi merah
    if (isRejected) {
      if (currentIndex === -1) {
        // kalau tidak ketemu index, minimal tampilkan abu2
        return <CheckCircle className="h-5 w-5 text-gray-300" />;
      }
      if (idx <= currentIndex) {
        // sampai tahap terakhir yang dicapai sebelum reject
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      }
      return <XCircle className="h-5 w-5 text-red-500" />;
    }

    // normal progress
    if (currentIndex === -1) {
      // kalau stage/status tidak match, tampilkan abu2 (biar tidak salah)
      return <CheckCircle className="h-5 w-5 text-gray-300" />;
    }

    if (idx <= currentIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    return <CheckCircle className="h-5 w-5 text-gray-300" />;
  };

  const DetailField = ({ label, value, icon: Icon }) => (
    <div className="col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2 text-gray-800 text-base">
        {Icon && <Icon className="h-5 w-5 text-sky-600" />}
        <span className="font-medium text-gray-900">{value || "-"}</span>
      </div>
    </div>
  );

  const stageLabel = (k) =>
    k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-999 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 space-y-7 max-h-[90vh] overflow-y-auto relative">
        {/* HEADER */}
        <div className="flex justify-between items-start pb-5 border-b border-gray-200">
          <div className="flex items-center gap-5">
            {profile?.fotoProfile ? (
              <img
                src={profile.fotoProfile}
                alt="Foto Profil"
                className="w-20 h-20 rounded-full object-cover border-2 border-sky-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-sky-100">
                <User className="h-10 text-gray-400" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {profile?.fullName || applicant.name}
                </h2>

                {isAccepted && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Diterima
                  </span>
                )}

                {isRejected && (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Ditolak
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg mt-1">{applicant.position}</p>

              {/* ✅ debug kecil biar kamu tahu yang dipakai */}
              <p className="text-xs text-gray-400 mt-1">
                status: <span className="font-semibold">{statusRaw}</span> |
                stage: <span className="font-semibold">{stageRaw}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>

            {shouldDisplayScore && (
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                <ScoreIcon className="h-4 w-4 text-sky-600" />
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

        {/* INFORMASI PRIBADI */}
        <h3 className="text-xl font-bold text-gray-900 mt-6">
          Informasi Pribadi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="NIK" value={profile?.NIK} icon={Hash} />
          <DetailField
            label="Jenis Kelamin"
            value={profile?.gender}
            icon={UserCheck}
          />
          <DetailField
            label="Tempat Lahir"
            value={profile?.tempatLahir}
            icon={MapPin}
          />
          <DetailField
            label="Tanggal Lahir"
            value={
              profile?.tanggalLahir
                ? new Date(profile.tanggalLahir).toLocaleDateString("id-ID")
                : "-"
            }
            icon={CalendarDays}
          />
          <DetailField
            label="No Handphone"
            value={profile?.nomorHp}
            icon={Phone}
          />
          <DetailField label="Email" value={applicant.email} icon={Mail} />
        </div>

        {/* ALAMAT */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">Alamat Lengkap</h4>
          <div className="flex items-start gap-2 text-gray-800">
            <MapPin className="h-5 w-5 text-sky-600 shrink-0" />
            <span className="font-medium text-gray-900">
              {profile?.alamat || "Alamat belum diisi"}
            </span>
          </div>
        </div>

        {/* ABOUT */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">Tentang Saya</h3>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-700">
            {profile?.about || "Pelamar belum mengisi deskripsi diri."}
          </div>
        </div>

        {/* PROGRESS & DOKUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Progress Seleksi
            </h3>

            <div className="space-y-3">
              {stageFlow.map((k) => (
                <div key={k} className="flex items-center gap-3">
                  {getStageIcon(k)}
                  <span className="capitalize">{stageLabel(k)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Kelengkapan Dokumen
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {profile?.NIK ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Data Pribadi Lengkap</span>
              </div>

              <div className="flex items-center gap-3">
                {applicant?.cvUrl ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>CV Terupload</span>
              </div>

              <div className="flex items-center gap-3">
                {applicant?.portfolioUrl ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span>
                  {applicant?.portfolioUrl
                    ? "Portofolio Terupload"
                    : "Belum ada portofolio"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
