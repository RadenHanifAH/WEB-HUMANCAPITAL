import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
  ArrowLeft,
} from "lucide-react";
import {
  fetchScheduleById,
  confirmScheduleApplicant,
  markScheduleExpired,
} from "../services/schedules.api";

const TYPE_LABEL = {
  InterviewHC: "Interview Pertama",
  Psikotes: "Psikotes",
  FinalInterview: "Interview Kedua",
};

const TYPE_STYLE = {
  InterviewHC: {
    header: "bg-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Psikotes: {
    header: "bg-purple-600",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
  FinalInterview: {
    header: "bg-green-600",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
};

const formatDateTime = (dateTime) =>
  new Date(dateTime).toLocaleString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }) + " WIB";

export default function ConfirmSchedulePage() {
  const { id } = useParams();
  // ✅ BARU: ambil token dari query string link email (?token=...)
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [schedule, setSchedule] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const data = await fetchScheduleById(id);
        setSchedule(data);

        if (data.confirmedByApplicant) {
          setStatus(
            data.attendanceStatus === "tidak_hadir" ? "already_absent" : "already_hadir"
          );
          return;
        }

        const createdAt = new Date(data.createdAt);
        const expiredTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now > expiredTime) {
          try {
            await markScheduleExpired(id);
          } catch (err) {
            console.error(err);
          }
          setStatus("expired");
          return;
        }

        setStatus("choice");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    run();
  }, [id]);

  const typeStyle = TYPE_STYLE[schedule?.type] || {
    header: "bg-sky-600",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
  };

  const handleConfirmHadir = async () => {
    setStatus("submitting");
    setSubmitError("");
    try {
      // ✅ FIX: kirim token dari link email
      const res = await confirmScheduleApplicant(id, { attendanceStatus: "hadir" }, token);
      setSchedule(res.data);
      setStatus("success_hadir");
    } catch (e) {
      setSubmitError(e?.response?.data?.message || "Gagal mengirim konfirmasi");
      setStatus("choice");
    }
  };

  const handleSubmitAbsent = async () => {
    if (!reason.trim()) {
      setReasonError("Mohon isi alasan ketidakhadiran Anda");
      return;
    }
    setReasonError("");
    setStatus("submitting");
    setSubmitError("");
    try {
      // ✅ FIX: kirim token dari link email
      const res = await confirmScheduleApplicant(
        id,
        { attendanceStatus: "tidak_hadir", absentReason: reason.trim() },
        token
      );
      setSchedule(res.data);
      setStatus("success_absent");
    } catch (e) {
      setSubmitError(e?.response?.data?.message || "Gagal mengirim konfirmasi");
      setStatus("reason_form");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[95vh] overflow-y-auto">

        {(status === "loading" || status === "submitting") && (
          <div className="p-10 sm:p-16 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
            <p className="text-gray-500 text-sm text-center">
              {status === "loading" ? "Memuat data jadwal..." : "Mengirim konfirmasi..."}
            </p>
          </div>
        )}

        {status === "choice" && schedule && (
          <>
            <div className={`${typeStyle.header} px-6 py-8 sm:px-8 text-center`}>
              <h1 className="text-white text-lg sm:text-xl font-bold">Konfirmasi Kehadiran</h1>
              <p className="text-white/80 text-sm mt-1">
                Mohon konfirmasi kehadiran Anda pada jadwal berikut
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${typeStyle.badge}`}
              >
                {TYPE_LABEL[schedule.type] || schedule.type}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 break-words">
                {schedule.applicantName}
              </h2>
              <p className="text-sm text-gray-500 mb-4 break-words">{schedule.position}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{formatDateTime(schedule.dateTime)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="break-words">{schedule.location}</span>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {submitError}
                </div>
              )}

              <p className="text-sm text-gray-700 font-medium mb-3">
                Apakah Anda dapat menghadiri jadwal ini?
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleConfirmHadir}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  Ya, Saya Akan Hadir
                </button>
                <button
                  onClick={() => setStatus("reason_form")}
                  className="flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
                >
                  <UserX className="h-4 w-4" />
                  Saya Tidak Bisa Hadir
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Jika Anda memilih "Tidak Bisa Hadir", tim HR akan meninjau
                alasan Anda dan menindaklanjuti status lamaran Anda secara manual.
              </p>
            </div>
          </>
        )}

        {status === "reason_form" && schedule && (
          <>
            <div className="bg-red-600 px-6 py-8 sm:px-8 text-center">
              <UserX className="h-12 w-12 text-white mx-auto mb-2" />
              <h1 className="text-white text-lg sm:text-xl font-bold">Konfirmasi Tidak Hadir</h1>
              <p className="text-white/80 text-sm mt-1">
                Mohon sertakan alasan agar tim HR dapat menindaklanjuti
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1 break-words">
                {schedule.applicantName}
              </h2>
              <p className="text-sm text-gray-500 mb-4 break-words">
                {TYPE_LABEL[schedule.type] || schedule.type} · {formatDateTime(schedule.dateTime)}
              </p>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                  {submitError}
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Alasan ketidakhadiran <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError("");
                }}
                rows={4}
                placeholder="Contoh: Sakit, memerlukan waktu istirahat 2-3 hari berdasarkan surat dokter."
                className={`w-full text-sm border rounded-xl p-3 focus:outline-none focus:ring-2 resize-none ${
                  reasonError
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-sky-500"
                }`}
                autoFocus
              />
              {reasonError && (
                <p className="text-xs text-red-600 mt-1">{reasonError}</p>
              )}

              <div className="flex flex-col gap-2 mt-5">
                <button
                  onClick={handleSubmitAbsent}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
                >
                  Kirim Konfirmasi
                </button>
                <button
                  onClick={() => {
                    setStatus("choice");
                    setReasonError("");
                  }}
                  className="flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>
              </div>
            </div>
          </>
        )}

        {status === "success_hadir" && schedule && (
          <>
            <div className={`${typeStyle.header} px-6 py-10 sm:px-8 text-center`}>
              <CheckCircle className="h-14 w-14 text-white mx-auto mb-3" />
              <h1 className="text-white text-xl sm:text-2xl font-bold">Kehadiran Dikonfirmasi!</h1>
              <p className="text-white/80 text-sm mt-1">Terima kasih atas konfirmasi Anda</p>
            </div>

            <div className="p-5 sm:p-6">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${typeStyle.badge}`}
              >
                {TYPE_LABEL[schedule.type] || schedule.type}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 break-words">
                {schedule.applicantName}
              </h2>
              <p className="text-sm text-gray-500 mb-4 break-words">{schedule.position}</p>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{formatDateTime(schedule.dateTime)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="break-words">{schedule.location}</span>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-800">
                📋 Harap datang <strong>15 menit lebih awal</strong>
              </div>
            </div>
          </>
        )}

        {status === "success_absent" && schedule && (
          <>
            <div className="bg-red-600 px-6 py-10 sm:px-8 text-center">
              <XCircle className="h-14 w-14 text-white mx-auto mb-3" />
              <h1 className="text-white text-lg sm:text-xl font-bold">Konfirmasi Diterima</h1>
              <p className="text-white/80 text-sm mt-1">
                Alasan ketidakhadiran Anda telah dikirim ke tim HR untuk ditinjau
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1 break-words">
                {schedule.applicantName}
              </h2>
              <p className="text-sm text-gray-500 mb-4 break-words">
                {TYPE_LABEL[schedule.type] || schedule.type} · {formatDateTime(schedule.dateTime)}
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Alasan yang Anda sampaikan
                </p>
                <p className="text-sm text-gray-700 break-words">{schedule.absentReason}</p>
              </div>
            </div>
          </>
        )}

        {status === "already_hadir" && schedule && (
          <>
            <div className={`${typeStyle.header} px-6 py-10 sm:px-8 text-center`}>
              <CheckCircle className="h-14 w-14 text-white mx-auto mb-3" />
              <h1 className="text-white text-lg sm:text-xl font-bold">Sudah Dikonfirmasi</h1>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-gray-600 text-sm mb-4">
                Anda sudah mengonfirmasi <strong>akan hadir</strong> pada jadwal ini.
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{formatDateTime(schedule.dateTime)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="break-words">{schedule.location}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {status === "already_absent" && schedule && (
          <>
            <div className="bg-red-600 px-6 py-10 sm:px-8 text-center">
              <XCircle className="h-14 w-14 text-white mx-auto mb-3" />
              <h1 className="text-white text-lg sm:text-xl font-bold">Sudah Dikonfirmasi</h1>
              <p className="text-white/80 text-sm mt-1">
                Anda sebelumnya menyatakan tidak dapat hadir
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Alasan yang Anda sampaikan
                </p>
                <p className="text-sm text-gray-700 break-words">
                  {schedule.absentReason || "-"}
                </p>
              </div>
            </div>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="bg-red-600 px-6 py-10 sm:px-8 text-center">
              <XCircle className="h-14 w-14 text-white mx-auto mb-3" />
              <h1 className="text-white text-lg sm:text-xl font-bold">Konfirmasi Berakhir</h1>
              <p className="text-white/80 text-sm mt-1">
                Status kehadiran dinyatakan tidak hadir
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                Anda tidak melakukan konfirmasi dalam waktu
                <strong> 1 x 24 jam </strong>
                sejak undangan dikirim sehingga sistem secara otomatis
                mencatat status kehadiran sebagai
                <strong> Tidak Hadir</strong>, dan lamaran Anda pada tahap ini
                otomatis ditandai <strong>Ditolak</strong>.
              </div>
            </div>
          </>
        )}

        {status === "error" && (
          <div className="p-8 sm:p-12 flex flex-col items-center gap-3 text-center">
            <XCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-lg font-bold text-gray-700">Link Tidak Valid</h2>
            <p className="text-gray-500 text-sm">
              Jadwal tidak ditemukan atau link konfirmasi sudah tidak
              berlaku. Silakan hubungi tim Human Capital untuk informasi
              lebih lanjut.
            </p>
          </div>
        )}

        <div className="px-6 pb-5 pt-2 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Syaamil Group · Human Capital System
          </p>
        </div>
      </div>
    </div>
  );
}