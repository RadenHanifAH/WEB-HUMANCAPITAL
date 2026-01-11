"use client";
import React from "react";
import {
  X,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  ClipboardList,
  Tag,
} from "lucide-react";

export default function ViewJob({ isOpen, onClose, job }) {
  if (!isOpen || !job) return null;

  // Fungsi untuk memformat tanggal
  const formatDeadline = (dateString) => {
    if (!dateString) return "-";
    try {
      // Membuat objek Date dari string tanggal (e.g., "2024-02-15")
      const date = new Date(dateString);

      // Menggunakan toLocaleDateString untuk format Indonesia (id-ID)
      // options: full day, long month, numeric year
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Kembali ke format asli jika gagal
    }
  };

  const getStatusBadge = (status) => {
    if (status.toLowerCase() === "active")
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
          Aktif
        </span>
      );
    if (status.toLowerCase() === "draft")
      return (
        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
          Draft
        </span>
      );
    if (status.toLowerCase() === "closed" || status.toLowerCase() === "ditutup")
      return (
        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-600">
          Ditutup
        </span>
      );
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-600" /> Detail Lowongan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Judul Posisi */}
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <label className="font-medium text-gray-500">Judul Posisi:</label>
            <p className="ml-1">{job.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Departemen */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <label className="font-medium text-gray-500">Departemen:</label>
              <p className="ml-1">{job.department}</p>
            </div>
            {/* Tipe Pekerjaan */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <label className="font-medium text-gray-500">
                Tipe Pekerjaan:
              </label>
              <p className="ml-1">{job.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Lokasi */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <label className="font-medium text-gray-500">Lokasi:</label>
              <p className="ml-1">{job.location}</p>
            </div>
            {/* Deadline (Perubahan di sini) */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="font-medium text-gray-500">Deadline:</label>
              <p className="ml-1">{formatDeadline(job.deadline)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-500">Status:</label>
            {getStatusBadge(job.status)}
          </div>

          {/* Deskripsi Pekerjaan */}
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-gray-500 mt-1" />
            <label className="font-medium text-gray-500">
              Deskripsi Pekerjaan:
            </label>
            {/* Menggunakan div untuk memastikan teks tetap sejajar dengan label saat wrap */}
            <div className="flex-1 ml-1 whitespace-pre-wrap text-gray-900">
              {job.description || "-"}
            </div>
          </div>

          {/* Persyaratan */}
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-gray-500 mt-1" />
            <label className="font-medium text-gray-500">Persyaratan:</label>
            {/* Menggunakan div untuk memastikan teks tetap sejajar dengan label saat wrap */}
            <div className="flex-1 ml-1 whitespace-pre-wrap text-gray-900">
              {job.requirements || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
