import React from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Trash2,
  CheckCircle,
  User,
  UserCheck,
  UserX,
  Clock3,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { getColorsForType, typeLabel, ATTENDANCE } from "./constants";

export default function ScheduleCard({ item, onDelete, onComplete, onMarkNoShow, onReject, onReschedule }) {
  const { badgeBg, badgeText } = getColorsForType(item.type);
  const isCompleted = item.isCompleted;
  const date = new Date(item.dateTime);
  const isOnline = Boolean(item.meetingLink);

  const attendanceStatus = item.attendanceStatus || ATTENDANCE.PENDING;
  const isTidakHadir = attendanceStatus === ATTENDANCE.TIDAK_HADIR;
  const isHadir = attendanceStatus === ATTENDANCE.HADIR;
  const isPending = attendanceStatus === ATTENDANCE.PENDING;

  return (
    <div className="border border-gray-200 bg-white rounded-xl p-3 sm:p-4 shadow-sm transition-colors">
      {/* Top row */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {item.avatar ? (
          <img
            src={item.avatar}
            alt="Foto Profil"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border border-sky-100 flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-semibold text-base sm:text-xl break-words ${
                isCompleted ? "text-gray-600" : "text-gray-800"
              }`}
            >
              {item.applicantName}
            </h4>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badgeBg} ${badgeText}`}
            >
              {typeLabel(item.type)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 break-words">{item.position}</p>

          <div className="flex items-center gap-2 flex-wrap mt-2.5">
            <span className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 bg-white shrink-0">
              <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 bg-white shrink-0">
              <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB
            </span>
            {item.location && (
              <span className="flex items-start gap-1.5 border border-gray-200 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 bg-white max-w-full">
                {isOnline ? (
                  <Video className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                )}
                <span className="break-words">{item.location}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {isOnline && (
        <a
          href={item.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-between gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700 font-medium hover:bg-green-100 transition-colors"
        >
          <span className="flex items-center gap-1.5 truncate min-w-0">
            <Video className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.meetingLink}</span>
          </span>
          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        </a>
      )}

      {/* Bottom row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 pt-3 border-t border-gray-100 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isPending && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
              <Clock3 className="h-3.5 w-3.5" />
              Menunggu Konfirmasi Pelamar
            </span>
          )}

          {isHadir && (
            <>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <UserCheck className="h-3.5 w-3.5" />
                Hadir
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {isCompleted ? "Selesai" : "Dijadwalkan"}
              </span>
            </>
          )}

          {isTidakHadir && (
            <>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 border border-red-200">
                <UserX className="h-3.5 w-3.5" />
                Tidak Hadir
              </span>
              {item.rescheduleRequested && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Meminta Reschedule
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end w-full sm:w-auto">
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-full text-red-600 hover:bg-red-100"
            title="Hapus Jadwal"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Tombol aksi jika pelamar TIDAK HADIR dan jadwal belum selesai */}
          {isTidakHadir && !isCompleted && (
            <>
              <button
                onClick={() => onReject(item.id)}
                title="Tolak lamaran kandidat ini secara permanen"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm transition-colors text-xs font-medium bg-red-500 hover:bg-red-600 text-white whitespace-nowrap"
              >
                <XCircle className="h-4 w-4" />
                Tolak Lamaran
              </button>
              <button
                onClick={() => onReschedule(item.id)}
                title="Hapus jadwal ini dan buat jadwal baru"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm transition-colors text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4" />
                Reschedule
              </button>
            </>
          )}

          {/* Tombol koreksi manual (Hadir -> Tidak Hadir) */}
          {isHadir && !isCompleted && (
            <button
              onClick={() => onMarkNoShow(item.id)}
              title="Tandai kandidat tidak hadir saat wawancara meskipun sebelumnya konfirmasi hadir"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm transition-colors text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 whitespace-nowrap"
            >
              <UserX className="h-4 w-4" />
              Tidak Hadir
            </button>
          )}

          {/* Tombol Konfirmasi Selesai hanya untuk yang Hadir atau Pending */}
          {!isCompleted && !isTidakHadir && (
            <button
              onClick={() => onComplete(item.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm transition-colors text-xs font-medium whitespace-nowrap bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Konfirmasi Selesai
            </button>
          )}
        </div>
      </div>

      {isTidakHadir && (
        <div className="mt-3 bg-sky-50 border border-sky-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            Alasan Ketidakhadiran :
          </p>
          <p className="text-sm text-gray-600 mt-1 break-words">
            {item.absentReason || "Belum ada alasan yang diberikan."}
          </p>
        </div>
      )}
    </div>
  );
}