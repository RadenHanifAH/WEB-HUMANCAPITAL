import React, { useState } from "react"
import { MapPin, Clock3, Users, X } from "lucide-react"

export function JobPreviewModal({ job, isOpen, onClose }) {
  const [showAllReq, setShowAllReq] = useState(false)

  if (!isOpen) return null

  const extraReq = job?.requirements?.length > 2 ? job.requirements.length - 2 : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job?.category && (
            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md border">
              {job.category}
            </span>
          )}
          {job?.type && (
            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md border">
              {job.type}
            </span>
          )}
          {job?.status && (
            <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-md border border-green-200">
              {job.status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {job?.title || "Judul Posisi"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {job?.description || "Deskripsi pekerjaan akan muncul di sini..."}
        </p>

        {/* Info lokasi & pengalaman */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            {job?.location || "Lokasi"}
          </div>
          <div className="flex items-center gap-1">
            <Clock3 className="w-4 h-4 text-gray-500" />
            {job?.experience || "Pengalaman"}
          </div>
        </div>

        {/* Jumlah lamaran */}
        <div className="flex items-center gap-1 text-sm text-blue-600 mb-3">
          <Users className="w-4 h-4" />
          {(job?.applicationsCount || 0) + " lamaran"}
        </div>

        {/* Requirements */}
        {job?.requirements?.length > 0 && (
          <div className="mb-5">
            <p className="font-semibold text-sm text-gray-800 mb-1">Persyaratan:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {(showAllReq ? job.requirements : job.requirements.slice(0, 2)).map(
                (req, i) => (
                  <li key={i}>{req}</li>
                )
              )}
            </ul>
            {!showAllReq && extraReq > 0 && (
              <p
                onClick={() => setShowAllReq(true)}
                className="text-sm text-blue-600 mt-1 cursor-pointer hover:underline"
              >
                +{extraReq} persyaratan lainnya
              </p>
            )}
          </div>
        )}

        {/* Tombol action */}
        <button className="w-full bg-amber-600 hover:bg-[#D96F32] text-white font-medium py-3 rounded-lg">
          Lihat Lamaran
        </button>
      </div>

      {/* Animasi fade in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
