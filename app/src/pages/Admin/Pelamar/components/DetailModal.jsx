import React, { useState, useEffect } from "react";
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
  ChevronRight,
  Download,
  Briefcase,
  GraduationCap,
  Users as OrgIcon,
  Award,
  Sparkles,
  CalendarClock,
} from "lucide-react";

const toKebab = (val) =>
  String(val || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

// ✅ Resolver stage/status dari backend (Prisma: `tahap` / `status`) menjadi
// key kebab-case internal yang dipakai UI.
const resolveStageKey = (raw) => {
  let s = String(raw || "").trim().toLowerCase();
  if (!s) return "";

  if (s.startsWith("rejected-at-")) {
    s = s.replace("rejected-at-", "");
  }

  const norm = s
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (["screaning", "screening", "under-review", "under_review"].includes(norm))
    return "screaning";

  if (
    ["interview-hc", "interviewhc", "interview-pertama", "interviewpertama"].includes(norm)
  )
    return "interview-pertama";

  if (norm.includes("psikotes") || norm.includes("psycho") || norm.includes("technical"))
    return "psikotes";

  if (
    norm === "final-interview" ||
    norm === "finalinterview" ||
    norm === "interview-kedua" ||
    norm === "interviewkedua" ||
    norm.includes("final-interview")
  )
    return "interview-kedua";

  if (norm.includes("offering") || norm.includes("final-result"))
    return "final-result";

  if (norm.includes("accept") || norm.includes("hired") || norm.includes("diterima"))
    return "final-result";

  if (norm.includes("reject") || norm.includes("ditolak")) return "screaning";

  return norm;
};

const hasValue = (v) => String(v ?? "").trim().length > 0;

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const formatDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return (
    d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear()
  );
};

const formatMonthYear = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return MONTHS[d.getMonth()] + " " + d.getFullYear();
};

const formatDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return "";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "";
  const end = isCurrent ? new Date() : endDate ? new Date(endDate) : null;
  if (!end || Number.isNaN(end.getTime())) return "";

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;

  const parts = [];
  if (years > 0) parts.push(years + " thn");
  if (remMonths > 0) parts.push(remMonths + " bln");
  return parts.join(" ");
};

const STAGE_FLOW = [
  "screaning",
  "interview-pertama",
  "psikotes",
  "interview-kedua",
  "final-result",
];

const STAGE_LABELS = {
  screaning: "Screening",
  "interview-pertama": "Interview Pertama",
  psikotes: "Psikotes",
  "interview-kedua": "Interview Kedua",
  "final-result": "Final Result",
};

const stageLabel = (k) =>
  STAGE_LABELS[k] ||
  k.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ✅ Key internal -> nilai `tahap`/`status` mentah yang dipakai backend
// (application.service.js VALID_STAGES)
const STAGE_KEY_TO_BACKEND_STATUS = {
  screaning: "Screaning",
  "interview-pertama": "Interview Pertama",
  psikotes: "Psikotes",
  "interview-kedua": "Interview Kedua",
  "final-result": "Final Result",
};

// ✅ Key internal -> enum `jenis_jadwal_wawancara` di Prisma
const STAGE_KEY_TO_SCHEDULE_TYPE = {
  "interview-pertama": "InterviewHC",
  psikotes: "Psikotes",
  "interview-kedua": "FinalInterview",
};

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const resolveFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return BASE_URL + path;
};

// ✅ Kelengkapan data pribadi — langsung baca field mentah model `profil`
// (nik, jenis_kelamin, nomor_hp, tempat_lahir, tanggal_lahir, alamat) + `nama`.
const isProfileComplete = (nama, profil) => {
  if (!profil) return false;
  const required = [
    nama,
    profil.nik,
    profil.jenis_kelamin,
    profil.nomor_hp,
    profil.tempat_lahir,
    profil.tanggal_lahir,
    profil.alamat,
  ];
  return required.every((x) => hasValue(x));
};

const SectionHeader = ({ icon: IconComponent, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 text-sky-600">
      {IconComponent && <IconComponent className="h-4 w-4" />}
    </span>
    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
  </div>
);

const Field = ({ label, value, icon: Icon, full }) => (
  <div className={`${full ? "md:col-span-2" : ""} min-w-0`}>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <div className="flex items-start gap-2 text-gray-900 min-w-0">
      {Icon && <Icon className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />}
      <span className="font-semibold text-sm leading-snug break-all">
        {value || "-"}
      </span>
    </div>
  </div>
);

const Card = ({ children, className }) => (
  <div
    className={
      "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 " +
      (className || "")
    }
  >
    {children}
  </div>
);

const EmptyRow = ({ text }) => (
  <p className="text-sm text-gray-400 italic">{text}</p>
);

const DocRow = ({ ok, okLabel, badLabel, href }) => (
  <div
    className={
      "flex items-center justify-between gap-3 px-2 py-2 rounded-lg " +
      (ok ? "" : "bg-red-50")
    }
  >
    <div className="flex items-center gap-3">
      {ok ? (
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
      )}
      <span
        className={
          "text-sm font-medium " + (ok ? "text-gray-800" : "text-red-600")
        }
      >
        {ok ? okLabel : badLabel}
      </span>
    </div>
    {ok && href && (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-sky-600"
      >
        <Download className="h-4 w-4" />
      </a>
    )}
  </div>
);

// ✅ `applicant` = satu item dari response application.controller.js `getAll`,
// bentuknya persis Prisma:
// {
//   id, status, tahap, skor, cvDownloadUrl, portfolioDownloadUrl,
//   pengguna: { nama, email, profil: { nik, jenis_kelamin, nomor_hp,
//     tempat_lahir, tanggal_lahir, alamat, foto_profil, tentang } },
//   lowongan: { judul },
//   pengalaman_kerja: [{ jabatan, perusahaan, jenis_pekerjaan, lokasi,
//     bulan_mulai, tahun_mulai, bulan_selesai, tahun_selesai, sedang_bekerja }],
//   pendidikan: [{ institusi, jurusan, gelar, tanggal_mulai, tanggal_selesai,
//     sedang_berlangsung }],
//   organisasi: [{ peran, nama_organisasi, tanggal_mulai, tanggal_selesai,
//     sedang_berlangsung, deskripsi }],
//   sertifikat: [{ nama, penerbit, diterbitkan, kadaluarsa, file_sertifikat }],
//   keahlian_pengguna: [{ nama }],
//   jadwal_wawancara: [{ jenis, tanggal_waktu, status, sudah_selesai, status_kehadiran }],
// }
const DetailModal = ({ applicant, onClose, onAcc, onReject, onAccept }) => {
  const [optimisticStage, setOptimisticStage] = useState(null);

  useEffect(() => {
    setOptimisticStage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicant && applicant.id]);

  useEffect(() => {
    if (
      optimisticStage &&
      applicant &&
      resolveStageKey(applicant.tahap || applicant.status) === optimisticStage
    ) {
      setOptimisticStage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicant && applicant.tahap, applicant && applicant.status]);

  const handleAccClick = (fromKey, toKey) => {
    setOptimisticStage(toKey);
    const backendStatus = STAGE_KEY_TO_BACKEND_STATUS[toKey] || toKey;
    onAcc && onAcc(applicant, fromKey, toKey, backendStatus);
  };

  const handleRejectClick = () => {
    onReject && onReject(applicant);
  };

  const handleAcceptClick = () => {
    onAccept && onAccept(applicant);
  };

  if (!applicant) return null;

  const pengguna = applicant.pengguna || {};
  const profil = pengguna.profil || {};

  const workExperiences = applicant.pengalaman_kerja || [];
  const educations = applicant.pendidikan || [];
  const organizations = applicant.organisasi || [];
  const certificates = applicant.sertifikat || [];
  const skills = (applicant.keahlian_pengguna || []).filter((s) => hasValue(s?.nama));
  const schedules = applicant.jadwal_wawancara || [];

  const cvUrl = resolveFileUrl(applicant.cvDownloadUrl);
  const portfolioUrl = resolveFileUrl(applicant.portfolioDownloadUrl);

  const statusRaw = applicant.status || "";
  const tahapRaw = applicant.tahap || "";

  const status = toKebab(statusRaw);

  const isAccepted = status === "diterima" || status.includes("accept");
  const isRejected = status.startsWith("rejected-at-") || status.includes("ditolak");

  // ✅ Saat ditolak, `tahap` menyimpan stage terakhir sebelum penolakan
  // (lihat application.service.js updateApplicationStatus).
  const rejectedStageKey = isRejected ? resolveStageKey(tahapRaw) : null;

  const currentKey = resolveStageKey(optimisticStage || tahapRaw || statusRaw);
  const currentIndex = STAGE_FLOW.indexOf(currentKey);
  const rejectedIndex = rejectedStageKey
    ? STAGE_FLOW.indexOf(rejectedStageKey)
    : -1;

  const blockedScoreStages = ["screaning", "interview-pertama"];
  const shouldDisplayScore =
    !blockedScoreStages.includes(currentKey) && !isRejected;

  const stageState = (idx) => {
    if (isAccepted) return "done";
    if (isRejected) {
      if (rejectedIndex === -1) {
        return currentIndex !== -1 && idx <= currentIndex ? "done" : "upcoming";
      }
      if (idx < rejectedIndex) return "done";
      if (idx === rejectedIndex) return "rejected";
      return "upcoming";
    }
    if (currentIndex === -1) return "upcoming";
    if (idx < currentIndex) return "done";
    if (idx === currentIndex) return "current";
    return "upcoming";
  };

  const stageSubtext = (key, state) => {
    if (state === "done") return "Selesai";
    if (state === "current") return "Sedang Berjalan";
    if (state === "rejected") return "Tidak Lolos";
    if (key === "psikotes") {
      return applicant.skor !== null && applicant.skor !== undefined
        ? "Menunggu antrian · Score: " + applicant.skor
        : "Menunggu antrian";
    }
    return "Menunggu antrian";
  };

  // ✅ Cari jadwal berdasarkan `jenis` mentah dari backend
  // (InterviewHC | Psikotes | FinalInterview), abaikan yang dibatalkan.
  const getScheduleNote = (stageKey) => {
    const scheduleType = STAGE_KEY_TO_SCHEDULE_TYPE[stageKey];
    if (!scheduleType) return null;

    const schedule = schedules.find(
      (s) => s?.jenis === scheduleType && s?.status !== "canceled",
    );

    if (!schedule || !schedule.tanggal_waktu) {
      return { text: "Belum dijadwalkan", scheduled: false };
    }

    return {
      text: `Terjadwal: ${formatDate(schedule.tanggal_waktu)}`,
      scheduled: true,
    };
  };

  const statusLabelText =
    tahapRaw || statusRaw
      ? isRejected
        ? "Ditolak"
        : stageLabel(currentKey || resolveStageKey(tahapRaw || statusRaw))
      : "-";

  const sertifikatLengkap = certificates.length > 0;

  const showActionCard = !isAccepted && !isRejected;
  const isAtFinalResult = currentKey === "final-result";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400 font-medium">Pelamar</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="text-sky-600 font-semibold">Detail Peserta</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* === Header Card === */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {profil.foto_profil ? (
                  <img
                    src={profil.foto_profil}
                    alt="Foto Profil"
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-sky-100">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {pengguna.nama || "-"}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-gray-500">
                    {applicant.lowongan?.judul}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1 bg-sky-50 text-sky-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Status: {statusLabelText}
                  </span>
                  {isAccepted && (
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      Diterima
                    </span>
                  )}
                  {isRejected && (
                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      Ditolak
                    </span>
                  )}
                </div>
              </div>

              {shouldDisplayScore && (
                <div className="ml-auto hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 shrink-0">
                  <ScoreIcon className="h-4 w-4 text-sky-600" />
                  <span>
                    Score:{" "}
                    <span className="font-bold text-sky-700">
                      {applicant.skor || 0}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
            {/* === Kolom Kiri === */}
            <div className="space-y-6">
              <Card>
                <SectionHeader icon={User} title="Biodata Diri" />
                <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                  <Field label="NIK" value={profil.nik} icon={Hash} />
                  <Field
                    label="Jenis Kelamin"
                    value={profil.jenis_kelamin}
                    icon={UserCheck}
                  />
                  <Field
                    label="Tempat Lahir"
                    value={profil.tempat_lahir}
                    icon={MapPin}
                  />
                  <Field
                    label="Tanggal Lahir"
                    value={
                      profil.tanggal_lahir
                        ? new Date(profil.tanggal_lahir).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"
                    }
                    icon={CalendarDays}
                  />
                </div>
              </Card>

              <Card>
                <SectionHeader icon={MapPin} title="Kontak & Lokasi" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
                  <Field label="Email" value={pengguna.email} icon={Mail} />
                  <Field label="No. Handphone" value={profil.nomor_hp} icon={Phone} />
                  <Field
                    label="Alamat Domisili"
                    value={profil.alamat}
                    icon={MapPin}
                    full={true}
                  />
                </div>
              </Card>

              <Card>
                <SectionHeader icon={Sparkles} title="Tentang Saya" />
                {hasValue(profil.tentang) ? (
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {profil.tentang}
                  </p>
                ) : (
                  <EmptyRow text="Belum ada deskripsi tentang diri." />
                )}
              </Card>

              {/* === Pengalaman Kerja === */}
              <Card>
                <SectionHeader icon={Briefcase} title="Pengalaman Kerja" />
                {workExperiences.length === 0 ? (
                  <EmptyRow text="Belum ada pengalaman kerja." />
                ) : (
                  <div className="space-y-4">
                    {workExperiences.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {item.jabatan}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.perusahaan}
                            {item.jenis_pekerjaan ? " · " + item.jenis_pekerjaan : ""}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.bulan_mulai && item.tahun_mulai
                              ? MONTHS[item.bulan_mulai - 1] + " " + item.tahun_mulai
                              : "-"}{" "}
                            -{" "}
                            {item.sedang_bekerja
                              ? "Sekarang"
                              : item.bulan_selesai && item.tahun_selesai
                                ? MONTHS[item.bulan_selesai - 1] + " " + item.tahun_selesai
                                : "-"}
                          </p>
                          {item.lokasi && (
                            <p className="text-xs text-gray-400">{item.lokasi}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* === Pendidikan === */}
              <Card>
                <SectionHeader icon={GraduationCap} title="Pendidikan" />
                {educations.length === 0 ? (
                  <EmptyRow text="Belum ada data pendidikan." />
                ) : (
                  <div className="space-y-4">
                    {educations.map((item) => {
                      const duration = formatDuration(
                        item.tanggal_mulai,
                        item.tanggal_selesai,
                        item.sedang_berlangsung,
                      );
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {item.institusi}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {[item.gelar, item.jurusan].filter(Boolean).join(" - ") || "-"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatMonthYear(item.tanggal_mulai)} -{" "}
                              {item.sedang_berlangsung
                                ? "Sekarang"
                                : formatMonthYear(item.tanggal_selesai)}
                              {duration ? " · " + duration : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* === Organisasi === */}
              <Card>
                <SectionHeader icon={OrgIcon} title="Pengalaman Organisasi" />
                {organizations.length === 0 ? (
                  <EmptyRow text="Belum ada pengalaman organisasi." />
                ) : (
                  <div className="space-y-4">
                    {organizations.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {item.peran}
                          </h4>
                          <p className="text-sm text-gray-600">{item.nama_organisasi}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatMonthYear(item.tanggal_mulai)} -{" "}
                            {item.sedang_berlangsung
                              ? "Sekarang"
                              : formatMonthYear(item.tanggal_selesai)}
                          </p>
                          {item.deskripsi && (
                            <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* === Sertifikat === */}
              <Card>
                <SectionHeader icon={Award} title="Sertifikat" />
                {certificates.length === 0 ? (
                  <EmptyRow text="Belum ada sertifikat." />
                ) : (
                  <div className="space-y-4">
                    {certificates.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-sky-400 mt-2 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {item.nama}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.penerbit}
                            {item.diterbitkan
                              ? " · Dikeluarkan " + formatMonthYear(item.diterbitkan)
                              : ""}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.kadaluarsa
                              ? "Berlaku hingga " + formatMonthYear(item.kadaluarsa)
                              : "Tidak memiliki batas waktu masa aktif"}
                          </p>
                          {item.file_sertifikat && (
                            <a
                              href={resolveFileUrl(item.file_sertifikat)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 mt-1"
                            >
                              Lihat Sertifikat
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* === Skills === */}
              <Card>
                <SectionHeader icon={Sparkles} title="Skills" />
                {skills.length === 0 ? (
                  <EmptyRow text="Belum ada skills." />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s.id}
                        className="bg-sky-50 text-sky-700 text-xs font-medium px-3 py-1.5 rounded-full border border-sky-100"
                      >
                        {s.nama}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* === Kolom Kanan === */}
            <div className="space-y-6">
              {/* Progress Seleksi */}
              <Card>
                <h3 className="text-sm font-bold text-gray-900 mb-5">Progress Seleksi</h3>
                <div className="relative pl-1">
                  {STAGE_FLOW.map((key, idx) => {
                    const state = stageState(idx);
                    const isLast = idx === STAGE_FLOW.length - 1;
                    const nextKey = !isLast ? STAGE_FLOW[idx + 1] : null;

                    let circle;
                    if (state === "done") {
                      circle = (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white shrink-0">
                          <CheckCircle className="h-4 w-4" />
                        </span>
                      );
                    } else if (state === "current") {
                      circle = (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-sky-600 bg-white shrink-0">
                          <span className="w-2 h-2 rounded-full bg-sky-600" />
                        </span>
                      );
                    } else if (state === "rejected") {
                      circle = (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white shrink-0">
                          <XCircle className="h-4 w-4" />
                        </span>
                      );
                    } else {
                      circle = (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-200 bg-white shrink-0" />
                      );
                    }

                    let labelColor;
                    if (state === "done" || state === "current") {
                      labelColor = "text-sky-600";
                    } else if (state === "rejected") {
                      labelColor = "text-red-500";
                    } else {
                      labelColor = "text-gray-900";
                    }

                    let lineColor;
                    if (state === "done") {
                      lineColor = "bg-sky-600";
                    } else {
                      lineColor = "bg-gray-200";
                    }

                    const showAccButton =
                      key === "screaning" && state === "current" && nextKey;

                    const scheduleNote = getScheduleNote(key);
                    const showScheduleNote =
                      scheduleNote && (scheduleNote.scheduled || state === "current");

                    return (
                      <div key={key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          {circle}
                          {!isLast && (
                            <span
                              className={"w-0.5 flex-1 my-1 " + lineColor}
                              style={{ minHeight: 28 }}
                            />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className={"text-sm font-semibold " + labelColor}>
                            {stageLabel(key)}
                          </p>

                          {showAccButton && (
                            <button
                              type="button"
                              onClick={() => handleAccClick(key, nextKey)}
                              className="mt-1.5 inline-flex items-center justify-center text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-colors px-3 py-1 rounded-full shadow-sm"
                            >
                              Sesuai Kriteria
                            </button>
                          )}

                          <p className="text-xs text-gray-400 mt-1">
                            {stageSubtext(key, state)}
                          </p>

                          {showScheduleNote && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] mt-1 ${
                                scheduleNote.scheduled
                                  ? "text-sky-600 font-medium"
                                  : "text-gray-400 italic"
                              }`}
                            >
                              {scheduleNote.scheduled && (
                                <CalendarClock className="h-3 w-3" />
                              )}
                              {scheduleNote.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Kelengkapan Dokumen */}
              <Card>
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  Kelengkapan Dokumen
                </h3>
                <div className="space-y-1">
                  <DocRow
                    ok={isProfileComplete(pengguna.nama, profil)}
                    okLabel="Data Pribadi Lengkap"
                    badLabel="Data Pribadi Belum Lengkap"
                  />
                  <DocRow
                    ok={Boolean(cvUrl)}
                    okLabel="CV Terupload"
                    badLabel="CV Belum Diupload"
                    href={cvUrl}
                  />
                  <DocRow
                    ok={Boolean(portfolioUrl)}
                    okLabel="Portofolio Terupload"
                    badLabel="Portofolio Belum Diupload"
                    href={portfolioUrl}
                  />
                  <DocRow
                    ok={sertifikatLengkap}
                    okLabel="Sertifikat"
                    badLabel="Sertifikat"
                  />
                </div>
              </Card>

              {/* Aksi */}
              {showActionCard && (
                <Card>
                  {isAtFinalResult ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAcceptClick}
                        className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors px-4 py-2.5 rounded-xl shadow-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Terima
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectClick}
                        className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors px-4 py-2.5 rounded-xl shadow-sm"
                      >
                        <XCircle className="h-4 w-4" />
                        Tolak
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRejectClick}
                      className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors px-4 py-2.5 rounded-xl shadow-sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Tolak Pelamar
                    </button>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;