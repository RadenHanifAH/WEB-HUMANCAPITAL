import React from "react";
import {
  FileText,
  X,
  Calendar,
  Building2,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlignLeft,
  ListChecks,
} from "lucide-react";

/**
 * JobDetailModal
 * Modal "Detail Lowongan" — menampilkan ringkasan satu lowongan kerja.
 *
 * Props:
 * - job: {
 *     title, department, location, type, deadline, status,
 *     description, requirements
 *   }
 * - onClose: () => void
 * - onEdit: () => void
 */
export default function JobDetailModal({ job, onClose}) {
  if (!job) return null;

  const statusStyles = {
    aktif: "bg-emerald-100 text-emerald-700",
    "non-aktif": "bg-gray-200 text-gray-600",
    ditutup: "bg-red-100 text-red-700",
    draft: "bg-amber-100 text-amber-700",
  };

  const statusKey = (job.status || "aktif").toLowerCase();
  const statusClass = statusStyles[statusKey] || statusStyles.aktif;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Detail Lowongan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Grid info utama */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <Field
              icon={Briefcase}
              label="Judul Posisi"
              value={job.title}
              bold
            />
            <Field
              icon={Building2}
              label="Departemen"
              value={job.department}
              bold
            />

            <Field icon={MapPin} label="Lokasi" value={job.location} />
            <Field icon={Briefcase} label="Tipe Pekerjaan" value={job.type} />

            <Field
              icon={Calendar}
              label="Deadline"
              value={
                job.deadline
                  ? new Date(job.deadline).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"
              }
            />
            <div>
              <FieldLabel icon={CheckCircle2} label="Status" />
              <span
                className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold uppercase tracking-wide ${statusClass}`}
              >
                {job.status || "Aktif"}
              </span>
            </div>
          </div>

          {/* Deskripsi Pekerjaan */}
          <div>
            <FieldLabel icon={AlignLeft} label="Deskripsi Pekerjaan" />
            <div className="mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 italic leading-relaxed">
              {job.description || "Tidak ada deskripsi."}
            </div>
          </div>

          {/* Persyaratan */}
          <div>
            <FieldLabel icon={ListChecks} label="Persyaratan" />
            <div className="mt-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 italic leading-relaxed">
              {job.requirements || "Tidak ada persyaratan."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );
}

function Field({ icon, label, value, bold }) {
  return (
    <div>
      <FieldLabel icon={icon} label={label} />
      <p
        className={`mt-1 text-sm text-gray-900 truncate ${
          bold ? "font-semibold" : "font-medium"
        }`}
        title={value}
      >
        {value || "-"}
      </p>
    </div>
  );
}
