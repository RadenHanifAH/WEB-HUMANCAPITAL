// src/components/ArsipPelamar.jsx
import React, { useState } from "react";
import {
  Archive,
  Users,
  CheckCheck,
  Search,
  ChevronDown,
  Download,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

// --- Dummy Data ---
const initialApplicants = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "https://i.pravatar.cc/100?img=1",
    position: "Senior Frontend Developer",
    finalStatus: "hired",
    decisionDate: "2024-01-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email",
    avatar: "https://i.pravatar.cc/100?img=2",
    position: "Marketing Manager",
    finalStatus: "hired",
    archivedDate: "15-12-2023",
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob.wilson@email.com",
    avatar: "https://i.pravatar.cc/100?img=3",
    position: "Data Analyst",
    finalStatus: "rejected",
    decisionDate: null,
    archivedDate: "2023/12/20",
  },
];

// --- Helpers ---
// Definisi template grid untuk memastikan semua baris sejajar
const GRID_TEMPLATE = "grid-cols-[2.5fr_1.5fr_1fr_1fr_0.5fr]";

const getStatusColors = (status) => {
  switch (status) {
    case "hired":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const getStatusLabel = (status) => {
  switch (status) {
    case "hired":
      return "Diterima";
    case "rejected":
      return "Ditolak";
    default:
      return status || "-";
  }
};

// Format date robust
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString("id-ID");
  }
  const m = String(dateStr)
    .trim()
    .match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) {
    const [, dd, mm, yy] = m;
    const ddmmyyyy = new Date(`${yy}-${mm}-${dd}`);
    if (!isNaN(ddmmyyyy.getTime())) {
      return ddmmyyyy.toLocaleDateString("id-ID");
    }
  }
  return "-";
};

// CSV escape
const escapeCSV = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

// --- Custom Confirmation Modal ---
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Konfirmasi</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component ---
function ArsipPelamar() {
  const [applicants, setApplicants] = useState(initialApplicants);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState(null);

  const handleDelete = (id) => {
    setApplicantToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    setApplicants((prev) => prev.filter((a) => a.id !== applicantToDelete));
    setIsModalOpen(false);
    setApplicantToDelete(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setApplicantToDelete(null);
  };

  const filteredApplicants = applicants.filter(
    (applicant) =>
      (statusFilter === "all" || applicant.finalStatus === statusFilter) &&
      (applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.position || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const handleExport = () => {
    const headers = ["Nama", "Email", "Posisi", "Status", "Tanggal Keputusan"];
    const rows = applicants.map((a) => {
      const dateRaw = a.decisionDate ?? a.archivedDate ?? null;
      return [
        escapeCSV(a.name),
        escapeCSV(a.email),
        escapeCSV(a.position),
        escapeCSV(getStatusLabel(a.finalStatus)),
        escapeCSV(formatDate(dateRaw)),
      ].join(",");
    });
    const csv = [headers.map(escapeCSV).join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "arsip_pelamar.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <ConfirmModal
        isOpen={isModalOpen}
        message="Yakin ingin menghapus permanen pelamar ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* JUDUL UTAMA */}
      <h1 className="text-2xl font-semibold text-sky-900 mb-6">Arsip Pelamar</h1>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button className="flex-1 px-4 py-3 text-sm font-semibold border-b-2 border-sky-600 text-sky-700">
            Pelamar Diarsipkan
          </button>
        </div>

        <div className="p-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari pelamar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* === Listbox Dropdown === */}
              <Listbox value={statusFilter} onChange={setStatusFilter}>
                {({ open }) => (
                  <div className="relative w-44">
                    <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                      <span>
                        {statusFilter === "all"
                          ? "Semua Status"
                          : statusFilter === "hired"
                          ? "Diterima"
                          : "Ditolak"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
                        {[
                          { value: "all", label: "Semua Status" },
                          { value: "hired", label: "Diterima" },
                          { value: "rejected", label: "Ditolak" },
                        ].map((opt) => (
                          <Listbox.Option key={opt.value} value={opt.value}>
                            {({ active, selected }) => (
                              <div
                                className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
                                  active
                                    ? "bg-sky-100 text-sky-700"
                                    : "text-gray-700"
                                }`}
                              >
                                <span>{opt.label}</span>
                                {selected && (
                                  <Check className="w-4 h-4 text-sky-600" />
                                )}
                              </div>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                )}
              </Listbox>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Download size={16} /> Export Data
              </button>
            </div>
          </div>

          {/* Header Tabel */}
          {/* Menggunakan template GRID_TEMPLATE untuk header */}
          <div className={`grid ${GRID_TEMPLATE} gap-4 py-3 border-b border-gray-200 text-sm font-semibold text-black`}>
            {/* Pelamar - Rata Kiri */}
            <span className="pl-14">Pelamar</span> 
            {/* Posisi - Rata Kiri */}
            <span>Posisi</span>
            {/* Status Akhir - Rata Tengah */}
            <span className="text-center">Status Akhir</span>
            {/* Tanggal Keputusan - Rata Tengah */}
            <span className="text-center">Tanggal Keputusan</span>
            {/* Aksi - Rata Kanan */}
            <span className="text-right pr-2">Aksi</span>
          </div>

          {/* Items */}
          <div className="mt-0 space-y-0 divide-y divide-gray-100">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((applicant) => {
                const dateRaw =
                  applicant.decisionDate ?? applicant.archivedDate ?? null;
                return (
                  // Item pelamar: Menggunakan template GRID_TEMPLATE untuk konten
                  <div
                    key={applicant.id}
                    className={`grid ${GRID_TEMPLATE} gap-4 items-center bg-white py-3 px-0 hover:bg-gray-50 transition-colors`}
                  >
                    {/* 1. Pelamar (Rata Kiri + Avatar space) */}
                    <div className="flex items-center gap-3 pl-2">
                      <img
                        src={applicant.avatar}
                        alt={applicant.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium">{applicant.name}</p>
                        <p className="text-xs text-gray-500">
                          {applicant.email}
                        </p>
                      </div>
                    </div>

                    {/* 2. Posisi (Rata Kiri) */}
                    <span className="text-sm text-gray-700">
                      {applicant.position}
                    </span>

                    {/* 3. Status Akhir (Rata Tengah) */}
                    <div className="flex justify-center">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full text-center ${getStatusColors(
                            applicant.finalStatus
                          )}`}
                        >
                          {getStatusLabel(applicant.finalStatus)}
                        </span>
                    </div>

                    {/* 4. Tanggal Keputusan (Rata Tengah) */}
                    <span className="text-sm text-gray-700 text-center">
                      {formatDate(dateRaw)}
                    </span>

                    {/* 5. Aksi (Rata Kanan) */}
                    <div className="text-right pr-2">
                      <button
                        onClick={() => handleDelete(applicant.id)}
                        className="p-1 rounded-full text-red-500 hover:bg-red-100"
                        title="Hapus Permanen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-500">
                Tidak ada pelamar yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArsipPelamar;