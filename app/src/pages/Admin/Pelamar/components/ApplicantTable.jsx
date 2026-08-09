import React, { useMemo } from "react";
import {
  Eye,
  Calendar,
  User,
  Clock,
  Check,
  AlertCircle,
  TrendingUp,
  XCircle,
  Award,
  CalendarX,
} from "lucide-react";
import { formatDate, getProgress } from "../utils/helpers";

// ✅ Map dari label tahap (yang dipakai di UI) ke `jenis` mentah yang
// tersimpan di kolom jadwal_wawancara.jenis (enum jenis_jadwal_wawancara)
const STAGE_TO_SCHEDULE_TYPE = {
  "Interview Pertama": "InterviewHC",
  Psikotes: "Psikotes",
  "Interview Kedua": "FinalInterview",
};

// Stage yang butuh jadwal (di luar ini, catatan tidak ditampilkan)
const SCHEDULABLE_STAGES = Object.keys(STAGE_TO_SCHEDULE_TYPE);

const ApplicantTable = ({ loading, applicants, onDetail }) => {
  const normalizeStatus = (raw) => {
    const s = String(raw || "").trim();
    const low = s.toLowerCase();

    if (
      low === "screaning" ||
      low === "screening" ||
      low === "under-review" ||
      low === "under review" ||
      low === "under_review"
    )
      return "Screaning";

    if (
      low === "interview hc" ||
      low === "interview-hc" ||
      low === "interviewhc" ||
      low === "interview pertama" ||
      low === "interview-pertama" ||
      low === "interviewpertama"
    )
      return "Interview Pertama";

    if (
      low === "psikotes" ||
      low === "psikotes/technical test" ||
      low === "technical test" ||
      low === "psychotest" ||
      low === "psycho test"
    )
      return "Psikotes";

    if (
      low === "final interview" ||
      low === "final-interview" ||
      low === "finalinterview" ||
      low === "interview kedua" ||
      low === "interview-kedua" ||
      low === "interviewkedua"
    )
      return "Interview Kedua";

    if (
      low === "final result" ||
      low === "final-result" ||
      low === "offering/final result" ||
      low === "offering-final-result" ||
      low.includes("offering")
    )
      return "Final Result";

    if (low === "accepted" || low === "accept" || low === "diterima")
      return "Diterima";
    if (low.startsWith("rejected") || low === "reject" || low.startsWith("ditolak"))
      return "Ditolak";

    return s;
  };

  // =====================================================
  // ✅ Cari jadwal terbaru untuk stage tertentu, cocokkan lewat field
  // `jenis` mentah (InterviewHC/Psikotes/FinalInterview), abaikan jadwal
  // yang sudah dibatalkan ("canceled").
  // =====================================================
  const findScheduleForStage = (applicant, normalizedStage) => {
    const scheduleType = STAGE_TO_SCHEDULE_TYPE[normalizedStage];
    if (!scheduleType) return null;

    // ✅ field mentah dari application.controller.js getAll: jadwal_wawancara
    const list = Array.isArray(applicant?.jadwal_wawancara)
      ? applicant.jadwal_wawancara
      : [];

    // list sudah diurutkan terbaru dulu dari backend (orderBy created_at desc)
    return (
      list.find(
        (s) => s?.jenis === scheduleType && s?.status !== "canceled",
      ) || null
    );
  };

  // Mengembalikan { text, scheduled } atau null kalau tidak perlu ditampilkan
  const getScheduleNote = (applicant, normalizedStage) => {
    if (!SCHEDULABLE_STAGES.includes(normalizedStage)) return null;

    const schedule = findScheduleForStage(applicant, normalizedStage);

    if (!schedule || !schedule.tanggal_waktu) {
      return { text: "Belum dijadwalkan", scheduled: false };
    }

    return {
      text: `Terjadwal: ${formatDate(schedule.tanggal_waktu)}`,
      scheduled: true,
    };
  };

  const getStatusIcon = (statusRaw) => {
    const status = normalizeStatus(statusRaw);

    const icons = {
      Screaning: Clock,
      "Interview Pertama": User,
      Psikotes: AlertCircle,
      "Interview Kedua": TrendingUp,
      "Final Result": Award,
      Diterima: Check,
      Ditolak: XCircle,
    };

    const colors = {
      Screaning: "text-orange-500",
      "Interview Pertama": "text-blue-500",
      Psikotes: "text-purple-500",
      "Interview Kedua": "text-green-500",
      "Final Result": "text-teal-600",
      Diterima: "text-green-600",
      Ditolak: "text-red-600",
    };

    const Icon = icons[status] || Clock;
    const color = colors[status] || "text-gray-500";
    return <Icon className={`h-4 w-4 ${color}`} />;
  };

  const getBadgeColor = (statusRaw) => {
    const status = normalizeStatus(statusRaw);
    const colors = {
      Screaning: "bg-orange-100 text-orange-600",
      "Interview Pertama": "bg-blue-100 text-blue-600",
      Psikotes: "bg-purple-100 text-purple-600",
      "Interview Kedua": "bg-green-100 text-green-600",
      "Final Result": "bg-teal-100 text-teal-600",
      Diterima: "bg-green-200 text-green-700",
      Ditolak: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const isScoreAvailable = (statusRaw) => {
    const status = normalizeStatus(statusRaw);
    return status !== "Screaning" && status !== "Interview Pertama";
  };

  // ✅ `a` = satu item dari response application.controller.js `getAll`:
  // { id, status, tahap, skor, tanggal_melamar, pengguna: { nama, email, profil },
  //   lowongan: { judul }, jadwal_wawancara: [...] }
  const normalizedApplicants = useMemo(() => {
    return (applicants || []).map((a) => ({
      ...a,
      _statusNormalized: normalizeStatus(a.status),
    }));
  }, [applicants]);

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500 italic">
        Memuat data pelamar...
      </div>
    );

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-100">
        <tr className="text-left text-sm font-semibold text-gray-600">
          <th className="p-4">Pelamar</th>
          <th className="p-4">Posisi</th>
          <th className="p-4 text-center">Tahap Seleksi</th>
          <th className="p-4 text-center">Progress</th>
          <th className="p-4 text-center">Score</th>
          <th className="p-4">Tanggal Lamar</th>
          <th className="p-4 text-right">Aksi</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {normalizedApplicants.map((a) => {
          const st = a._statusNormalized;
          const scheduleNote = getScheduleNote(a, st);

          // ✅ Nama, email, foto — dari relasi `pengguna` (raw Prisma)
          const applicantName = a.pengguna?.nama || "-";
          const applicantEmail = a.pengguna?.email || "-";
          const applicantPhoto = a.pengguna?.profil?.foto_profil || null;

          // ✅ Posisi — dari relasi `lowongan.judul`
          const positionText = a.lowongan?.judul || "-";

          return (
            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {applicantPhoto ? (
                    <img
                      src={applicantPhoto}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{applicantName}</p>
                    <p className="text-xs text-gray-500">{applicantEmail}</p>
                  </div>
                </div>
              </td>

              <td className="p-4 text-sm font-medium">{positionText}</td>

              <td className="p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold w-48 mx-auto ${getBadgeColor(st)}`}
                  >
                    {getStatusIcon(st)}
                    <span>{st}</span>
                  </span>

                  {/* ✅ catatan jadwal di bawah badge tahap seleksi */}
                  {scheduleNote && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] mt-0.5 ${
                        scheduleNote.scheduled
                          ? "text-gray-400"
                          : "text-red-500 font-medium"
                      }`}
                    >
                      
                      {scheduleNote.text}
                    </span>
                  )}
                </div>
              </td>

              <td className="p-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-1.5 bg-gray-100 rounded-full w-20 overflow-hidden">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${getProgress(st)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">
                    {getProgress(st)}%
                  </span>
                </div>
              </td>

              <td className="p-4 text-center">
                {isScoreAvailable(st) ? (
                  <span
                    className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md text-xs font-bold ${
                      a.skor !== null && a.skor !== undefined
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-gray-50 text-gray-400 border border-gray-200"
                    }`}
                    title="Diambil otomatis dari hasil Psikotest"
                  >
                    {a.skor !== null && a.skor !== undefined ? a.skor : "-"}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">Belum Psikotes</span>
                )}
              </td>

              <td className="p-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(a.tanggal_melamar)}
                </div>
              </td>

              <td className="p-4 text-right">
                <button
                  onClick={() => onDetail(a)}
                  className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-sky-100 hover:text-sky-600 transition-colors"
                  title="Lihat Detail"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ApplicantTable;