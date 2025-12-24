import React from "react";
import { MapPin, Briefcase, Calendar, ArrowLeft } from "lucide-react";

function JobDetail({
  job,
  onBack,
  formatDate,
  renderRequirements,
  submitting,
  setCvFile,
  setPortfolioFile,
  handleApply,
}) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sky-600 mb-4 lg:hidden font-medium"
      >
        <ArrowLeft size={20} /> Kembali ke Daftar Lowongan
      </button>
      <h2 className="text-2xl font-bold">{job.title}</h2>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 mb-4 gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={16} /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={16} /> {job.type}
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
      <p className="text-gray-700 mt-1 whitespace-pre-line">
        {job.description}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload CV (PDF) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            disabled={job.status === "closed" || submitting}
            onChange={(e) => setCvFile(e.target.files[0])}
            className="block border border-gray-300 rounded-lg w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Portofolio (PDF){" "}
            <span className="text-gray-400">(Opsional)</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            disabled={job.status === "closed" || submitting}
            onChange={(e) => setPortfolioFile(e.target.files[0])}
            className="block border border-gray-300 rounded-lg w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <button
        onClick={handleApply}
        disabled={job.status === "closed" || submitting}
        className={`mt-6 px-6 py-2 rounded-lg text-white font-medium shadow transition ${
          job.status === "closed" || submitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
        }`}
      >
        {job.status === "closed"
          ? "Lowongan Ditutup"
          : submitting
          ? "Mengirim..."
          : "Lamar Sekarang"}
      </button>
    </>
  );
}

export default JobDetail;
