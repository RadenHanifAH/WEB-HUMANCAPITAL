import React from "react";
import { Calendar, Clock, Video, MapPin, Trash2, CheckCircle, User } from "lucide-react";
import { getColorsForType, typeLabel } from "./constants";

export default function ScheduleCard({ item, onDelete, onComplete }) {
  const { cardBg, badgeBg, badgeText } = getColorsForType(item.type);
  const isCompleted = item.isCompleted;

  const date = new Date(item.dateTime);

  return (
    <div className={`border rounded-xl p-4 shadow-sm transition-colors ${cardBg}`}>
      <div className="flex gap-4 items-center">
        {/* ✅ Avatar / Fallback User Icon */}
        {item.avatar ? (
          <img
            src={item.avatar}
            alt="Foto Profil"
            className="h-14 w-14 rounded-full object-cover border border-sky-100"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
        )}

        <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1">
            <h4 className={`font-semibold text-xl ${isCompleted ? "text-gray-600" : "text-gray-800"}`}>
              {item.applicantName}
            </h4>
            <p className="text-sm text-gray-500">{item.position}</p>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badgeBg} ${badgeText}`}>
                {typeLabel(item.type)}
              </span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-sm mt-2 sm:mt-0 ${
              isCompleted ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-700"
            }`}
          >
            {isCompleted ? "Dikonfirmasi" : "Dijadwalkan"}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm w-full max-w-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            {String(item.location).toLowerCase().includes("video") ? (
              <Video className="h-4 w-4 text-gray-500" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-500" />
            )}
            <span>{item.location}</span>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-shrink-0">
          <button onClick={() => onDelete(item.id)} className="p-2 rounded-full text-red-600 hover:bg-red-100" title="Hapus Jadwal">
            <Trash2 className="h-4 w-4" />
          </button>

          {!isCompleted && (
            <button
              onClick={() => onComplete(item.id)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg shadow-sm transition-colors text-xs font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Konfirmasi Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
