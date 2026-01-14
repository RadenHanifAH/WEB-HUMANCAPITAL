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

// ✅ helper: cek string ada isi
const hasValue = (v) => String(v ?? "").trim().length > 0;

// ✅ helper: cek data pribadi lengkap (silakan tambah/kurangi field wajib)
const isProfileComplete = (p) => {
  if (!p) return false;

  const required = [
    p.fullName,
    p.NIK,
    p.gender,
    p.nomorHp,
    p.tempatLahir,
    p.tanggalLahir,
    p.alamat,
  ];

  return required.every((x) => (x instanceof Date ? !isNaN(x) : hasValue(x)));
};

const DetailModal = ({ applicant, profile, onClose }) => {
  if (!applicant) return null;

  const statusRaw = applicant.status || "";
  const stageRaw = applicant.stage || "";

  const status = toKebab(statusRaw);
  const stage = toKebab(stageRaw);

  const stageFlow = [
    "screaning",
    "interview-hc",
    "psikotes",
    "final-interview",
    "offering-final-result",
  ];

  const isAccepted = status === "accepted" || status.includes("accept");
  const isRejected =
    status === "rejected" ||
    status.includes("reject") ||
    status.startsWith("rejected-at-");

  // ✅ ambil "stage yang ditolak" dari status rejected-at-xxx
  const rejectedStageKey = status.startsWith("rejected-at-")
    ? status.replace("rejected-at-", "").trim()
    : null;

  // ✅ index untuk progress normal
  const currentKey = stage || status;
  const currentIndex = stageFlow.indexOf(currentKey);

  // ✅ index untuk rejected (kalau ada rejected-at-xxx)
  const rejectedIndex = rejectedStageKey
    ? stageFlow.indexOf(rejectedStageKey)
    : -1;

  const blockedScoreStages = ["screaning", "interview-hc"];
  const shouldDisplayScore =
    !blockedScoreStages.includes(status) && !isRejected;

  const stageLabel = (k) => {
    if (k === "screaning") return "Screaning";
    if (k === "interview-hc") return "Interview HC";
    if (k === "psikotes") return "Psikotes";
    if (k === "final-interview") return "Final Interview";
    if (k === "offering-final-result") return "Offering Final Result";
    return k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStageIcon = (stageKey) => {
    const idx = stageFlow.indexOf(stageKey);

    // ✅ accepted: semua hijau
    if (isAccepted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    // ✅ rejected: X hanya di stage yang ditolak
    if (isRejected) {
      // kalau rejected-at-xxx tidak ketemu, fallback: tidak usah bikin kacau
      if (rejectedIndex === -1) {
        if (currentIndex !== -1 && idx <= currentIndex) {
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        }
        return <CheckCircle className="h-5 w-5 text-gray-300" />;
      }

      if (idx < rejectedIndex) {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      }
      if (idx === rejectedIndex) {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
      return <CheckCircle className="h-5 w-5 text-gray-300" />;
    }

    // ✅ normal progress (belum final)
    if (currentIndex === -1) {
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

              <p className="text-xs text-gray-400 mt-1">
                status: <span className="font-semibold">{statusRaw}</span> | stage:{" "}
                <span className="font-semibold">{stageRaw}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              type="button"
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

        {/* PROGRESS */}
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

          {/* DOKUMEN */}
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-4">
              Kelengkapan Dokumen
            </h3>

            <div className="space-y-3">
              {/* ✅ DATA PRIBADI */}
              <div className="flex items-center gap-3">
                {isProfileComplete(profile) ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Data Pribadi Lengkap</span>
              </div>

              {/* ✅ CV (WAJIB) */}
              <div className="flex items-center gap-3">
                {applicant?.cvDownloadUrl ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>CV Terupload</span>
              </div>

              {/* ✅ PORTOFOLIO (OPSIONAL) */}
              <div className="flex items-center gap-3">
                {applicant?.portfolioDownloadUrl ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Portofolio Terupload</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span>Belum ada portofolio</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
