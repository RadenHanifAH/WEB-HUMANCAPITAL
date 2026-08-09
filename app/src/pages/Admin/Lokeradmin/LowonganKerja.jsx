"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  ClipboardList,
  Briefcase,
  Users,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Listbox } from "@headlessui/react";

// Pastikan import ini sesuai dengan struktur folder Anda
import Create from "./components/Create";
import ViewJob from "./components/ViewJob";
import JobTable from "./components/JobTable";
import Alert from "./components/Alert";
import ConfirmDelete from "./components/ConfirmDelet";
import { fetchJobs, saveJob, deleteJob } from "./services/api";

function Lokeradmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Edit & View
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // DELETE STATE
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ALERT STATE
  const [alert, setAlert] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  // --- 1. LOAD DATA & SORTING (TERBARU DI ATAS) ---
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();

        if (Array.isArray(data)) {
          // MODIFIKASI DISINI:
          // Urutkan ID dari Besar ke Kecil (b.id - a.id)
          // Asumsinya ID baru selalu lebih besar. Ini membuat data terbaru muncul di index 0.
          const sortedData = data.sort((a, b) => b.id - a.id);
          setJobs(sortedData);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data lowongan.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Reset ke halaman 1 jika filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);

  // --- LOGIKA FILTER ---
  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const deptMatch = job.department
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || deptMatch;

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
            Active
          </span>
        );
      case "draft":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
            Draft
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-600">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const handleActionSelect = (job, action) => {
    if (action === "view") {
      setSelectedJob(job);
      setIsViewOpen(true);
    }
    if (action === "edit") {
      setSelectedJob(job);
      setIsEditMode(true);
      setIsCreateOpen(true);
    }
    if (action === "delete") {
      setJobToDelete(job);
      setIsDeleteOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob(jobToDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));

      setAlert({
        message: "Lowongan berhasil dihapus!",
        type: "success",
        visible: true,
      });

      if (currentJobs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error(err);
      setAlert({
        message: "Gagal menghapus lowongan!",
        type: "error",
        visible: true,
      });
    } finally {
      setIsDeleteOpen(false);
      setJobToDelete(null);
    }
  };

  // --- 2. HANDLE SAVE (DATA BARU DI AWAL & RESET PAGE) ---
  const handleSaveJob = async (jobData) => {
    try {
      const response = await saveJob(
        jobData,
        isEditMode ? selectedJob?.id : null,
      );

      // ✅ backend kamu balikin { success, message, data }
      const saved = response?.data ?? response;

      if (!saved?.id) {
        throw new Error("Response API tidak mengembalikan id job.");
      }

      setJobs((prevJobs) => {
        if (isEditMode) {
          // ✅ update berdasarkan id asli dari DB
          return prevJobs.map((j) =>
            j.id === saved.id ? { ...j, ...saved } : j,
          );
        } else {
          // ✅ job baru masuk paling atas
          return [{ ...saved, applicants: saved.applicants ?? 0 }, ...prevJobs];
        }
      });

      setIsCreateOpen(false);
      setIsEditMode(false);
      setSelectedJob(null);

      if (!isEditMode) setCurrentPage(1);

      setAlert({
        message: isEditMode
          ? "Lowongan berhasil diperbarui!"
          : "Lowongan berhasil dibuat!",
        type: "success",
        visible: true,
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setAlert({
        message: "Gagal menyimpan lowongan!",
        type: "error",
        visible: true,
      });
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedJob(null);
    setIsCreateOpen(true);
  };

  const getPaginationGroup = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* ALERT */}
      {alert.visible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, visible: false })}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDelete
        isOpen={isDeleteOpen}
        job={jobToDelete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <h1 className="text-2xl font-bold text-sky-900 mb-3">Lowongan Kerja</h1>

      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex justify-between items-center p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition">
          <div>
            <h3 className="text-sm text-gray-500 font-medium">
              Total Lowongan
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalJobs}</p>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg">
            <ClipboardList className="w-6 h-6 text-sky-600" />
          </div>
        </div>

        <div className="flex justify-between items-center p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition">
          <div>
            <h3 className="text-sm text-gray-500 font-medium">
              Lowongan Aktif
            </h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {activeJobs}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <Briefcase className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="flex justify-between items-center p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition">
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Total Pelamar</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {totalApplicants}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari posisi atau departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          <Listbox value={statusFilter} onChange={setStatusFilter}>
            {({ open }) => (
              <div className="relative w-full sm:w-48">
                <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <span className="capitalize">
                    {statusFilter === "all" ? "Semua Status" : statusFilter}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm p-1">
                  {["all", "active", "draft", "closed"].map((st) => (
                    <Listbox.Option key={st} value={st}>
                      {({ active, selected }) => (
                        <div
                          className={`flex justify-between capitalize items-center px-3 py-2 cursor-pointer rounded-md ${
                            active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                          }`}
                        >
                          <span>{st === "all" ? "Semua Status" : st}</span>
                          {selected && (
                            <Check className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            )}
          </Listbox>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-tr from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          + Buat Lowongan Baru
        </button>
      </div>

      {/* Job Table Container */}
      <div className="rounded-xl shadow-sm bg-white border border-gray-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
            Memuat data lowongan...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Data tidak ditemukan.
          </div>
        ) : (
          <>
            <JobTable
              filteredJobs={currentJobs}
              handleActionSelect={handleActionSelect}
              getStatusBadge={getStatusBadge}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 bg-white border-t border-gray-100 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1">
                  {getPaginationGroup().map((item, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof item === "number" && setCurrentPage(item)
                      }
                      disabled={item === "..."}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        item === currentPage
                          ? "bg-sky-600 text-white border border-sky-600"
                          : item === "..."
                            ? "bg-transparent text-gray-500 cursor-default"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Create
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveJob}
        initialData={isEditMode ? selectedJob : null}
      />

      {isViewOpen && selectedJob && (
        <ViewJob
          isOpen={isViewOpen}
          job={selectedJob}
          onClose={() => setIsViewOpen(false)}
        />
      )}
    </div>
  );
}

export default Lokeradmin;
