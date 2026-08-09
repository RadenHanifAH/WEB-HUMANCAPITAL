import React from "react";
import {
  MapPin,
  Briefcase,
  Calendar,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

function JobDetail({
  job,
  onBack,
  formatDate,
  renderRequirements,
  submitting,
  handleApply,
  applicationStatus,
  profileReadiness, // ✅ { ready, sections, missing, optional }
  missingLabelsText, // ✅ string label bagian profil yang masih kurang, dipisah koma
}) {
  // ✅ tombol Lamar nonaktif jika lowongan ditutup, sedang submit,
  // ATAU profil (Data Pribadi, Tentang Saya, Pengalaman Kerja, Pendidikan, Skills) belum lengkap
  const isClosed = job.status === "closed";
  const profileIncomplete = !profileReadiness?.ready;
  const applyDisabled = isClosed || submitting || profileIncomplete;

  const getButtonLabel = () => {
    if (isClosed) return "Lowongan Ditutup";
    if (submitting) return "Mengirim...";
    if (profileIncomplete) return "Lengkapi Profil Terlebih Dahulu";
    return "Lamar Sekarang";
  };

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sky-600 mb-4 lg:hidden font-medium"
      >
        <ArrowLeft size={20} />
        Kembali ke Daftar Lowongan
      </button>

      {/* ⚠️ FIX: `job` di sini sudah melalui mapJobFromApi() (lihat
          jobs.api.js) yang mengubah field Prisma (judul, lokasi, jenis,
          tenggat, persyaratan, deskripsi) menjadi nama Inggris (title,
          location, type, deadline, requirements, description) — sama
          seperti yang sudah dipakai JobCard.jsx. Field mentah Indonesia
          seperti job.judul/job.lokasi/job.jenis tidak ada lagi di objek
          ini, makanya sebelumnya selalu kosong. */}
      <h2 className="text-2xl font-bold">{job.title}</h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 mb-4 gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={16} />
            {job.location}
          </span>

          <span className="flex items-center gap-1">
            <Briefcase size={16} />
            {job.type}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 font-semibold text-base ${
            job.status === "closed" ? "text-gray-500" : "text-red-600"
          }`}
        >
          <Calendar
            size={18}
            className={
              job.status === "closed" ? "text-gray-500" : "text-red-600"
            }
          />

          {job.status === "closed"
            ? "Ditutup"
            : `Deadline: ${formatDate(job.deadline)}`}
        </span>
      </div>

      <hr className="my-4" />

      <h3 className="font-semibold">Persyaratan:</h3>

      <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
        {renderRequirements(job.requirements)}
      </ul>

      <h3 className="font-semibold mt-4">Deskripsi:</h3>

      <p className="text-gray-700 mt-1 whitespace-pre-line">{job.description}</p>

      {/* STATUS LAMARAN */}
      {applicationStatus && (
        <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50 p-4">
          <p className="text-sm text-gray-500 mb-1">Status Lamaran</p>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />

            {/* ✅ Persis field yang dikirim application.controller.js ->
                checkApplication(): { id, status, tahap, tanggal_melamar}.
                Tidak ada field "stage", makanya sebelumnya selalu kosong. */}
            <p className="font-semibold text-sky-700">
              {applicationStatus.tahap}
            </p>
          </div>
        </div>
      )}

      {/* FORM APPLY */}
      {!applicationStatus && (
        <>
          {/* ✅ Peringatan bagian profil yang masih kurang */}
          {profileIncomplete && missingLabelsText && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>
                Lengkapi{" "}
                <span className="font-semibold">{missingLabelsText}</span> pada
                halaman Profil sebelum melamar.
              </p>
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={applyDisabled}
            className={`mt-4 px-6 py-2 rounded-lg text-white font-medium shadow transition ${
              applyDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
            }`}
          >
            {getButtonLabel()}
          </button>
        </>
      )}
    </>
  );
}

export default JobDetail;