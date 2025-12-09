import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  ArrowLeft,
} from "lucide-react";
// Pastikan path ini benar sesuai struktur folder project Anda
import { fetchJobs } from "./Admin/Lokeradmin/services/api";

// =========================================================================
// KOMPONEN PAGINATION
// =========================================================================
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      }
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const displayPages = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-2 mt-4 p-4">
      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
        </button>
        {displayPages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-9 h-9 flex items-center justify-center text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition duration-150 ${
                currentPage === page
                  ? "bg-sky-600 border-sky-600 text-white shadow-md font-semibold"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-sky-50"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// KOMPONEN UTAMA LOWONGAN
// =========================================================================
function Lowongan() {
  const locationRouter = useLocation();
  const jobsPerPage = 4;

  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [cvFile, setCvFile] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await fetchJobs();
        console.log("Data API:", response);

        let data = [];
        if (Array.isArray(response)) {
          data = response;
        } else if (response && Array.isArray(response.data)) {
          data = response.data;
        }

        // Sorting Descending (Terbaru Pertama)
        const sortedData = data.sort((a, b) => b.id - a.id);
        
        setJobs(sortedData);
      } catch (err) {
        console.error(err);
        setError("Gagal mengambil data lowongan.");
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Filter lists
  const departments = useMemo(
    () => [...new Set(jobs.map((job) => job.department).filter(Boolean))],
    [jobs]
  );
  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location).filter(Boolean))],
    [jobs]
  );
  const jobTypes = useMemo(
    () => [...new Set(jobs.map((job) => job.type).filter(Boolean))],
    [jobs]
  );

  const matchJobType = (jobTypeFilter, jobTypeData) => {
    if (jobTypeFilter === "all") return true;
    if (!jobTypeData) return false;
    const filterLower = jobTypeFilter.toLowerCase();
    const dataLower = jobTypeData.toLowerCase();
    if (
      filterLower.includes("magang") &&
      (dataLower === "onsite" || dataLower.includes("internship"))
    )
      return true;
    if (filterLower.includes("penuh waktu") && dataLower.includes("full-time"))
      return true;
    if (filterLower.includes("kontrak") && dataLower.includes("full-time"))
      return true;
    return filterLower === dataLower;
  };

  // Filter Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const title = job.title ? job.title.toLowerCase() : "";
      const matchesSearch = title.includes(searchTerm.toLowerCase());
      
      const matchesDepartment =
        department === "all" || job.department === department;
      
      const matchesLocation =
        location === "all" || (job.location && job.location.includes(location));
      
      const matchesJobType = matchJobType(jobType, job.type);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLocation &&
        matchesJobType
      );
    });
  }, [jobs, department, location, jobType, searchTerm]);

  // Safe Find Page
  const findJobPage = (jobId, jobsList) => {
    if (!jobsList || !Array.isArray(jobsList) || jobsList.length === 0) {
      return 1;
    }
    const index = jobsList.findIndex((job) => job.id === jobId);
    if (index === -1) return 1;
    return Math.ceil((index + 1) / jobsPerPage);
  };

  const params = new URLSearchParams(locationRouter.search);
  const initialJobId = params.get("jobId");
  const initialJob = useMemo(
    () =>
      initialJobId
        ? jobs.find((job) => job.id === parseInt(initialJobId))
        : null,
    [initialJobId, jobs]
  );

  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (initialJob && !selectedJob) {
      setSelectedJob(initialJob);
      setShowDetail(true);
      const targetPage = findJobPage(initialJob.id, jobs);
      setCurrentPage(targetPage);
      return;
    }
    if (filteredJobs.length > 0) {
      if (!selectedJob || !filteredJobs.some((j) => j.id === selectedJob.id)) {
        if (window.innerWidth >= 1024 || !selectedJob) {
          setSelectedJob(filteredJobs[0]);
        }
      }
    } else {
      setSelectedJob(null);
      setShowDetail(false);
    }
  }, [filteredJobs, initialJob]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    totalPages > 0 ? totalPages : 1
  );
  const indexOfLastJob = safeCurrentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowDetail(true);
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleApply = () => {
    if (!selectedJob) return;
    if (selectedJob.status === "closed") {
      alert("Maaf, lowongan ini sudah ditutup.");
      return;
    }
    if (!cvFile) {
      alert("Harap upload CV (PDF) terlebih dahulu.");
      return;
    }
    const formData = new FormData();
    formData.append("jobId", selectedJob.id);
    formData.append("cv", cvFile);
    if (portfolioFile) formData.append("portfolio", portfolioFile);
    console.log("Mengirim lamaran...", Object.fromEntries(formData));
    alert(`Lamaran untuk ${selectedJob.title} berhasil dikirim!`);
    setCvFile(null);
    setPortfolioFile(null);
  };

  const renderRequirements = (reqs) => {
    if (Array.isArray(reqs)) {
      return reqs.map((req, i) => <li key={i}>{req}</li>);
    }
    if (typeof reqs === "string") {
      return reqs
        .split(/\r?\n/)
        .map((req, i) => (req.trim() ? <li key={i}>{req.trim()}</li> : null));
    }
    return <li>Tidak ada persyaratan spesifik.</li>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak ditentukan";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };
 
  const makeDropdown = (label, value, setValue, options) => (
    <Listbox value={value} onChange={setValue}>
      {({ open }) => (
        <div className="relative w-full">
          <Listbox.Button className="w-full h-[42px] px-3 flex justify-between items-center border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <span className={value === "all" ? "text-gray-400" : ""}>
              {value === "all" ? label : value}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-48 overflow-y-auto">
            <Listbox.Option value="all">
              {({ active }) => (
                <div
                  className={`px-3 py-2 cursor-pointer rounded-md ${
                    active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                  }`}
                >
                  {label}
                </div>
              )}
            </Listbox.Option>
            {options.map((opt, i) => (
              <Listbox.Option key={i} value={opt}>
                {({ active }) => (
                  <div
                    className={`px-3 py-2 cursor-pointer rounded-md ${
                      active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                    }`}
                  >
                    {opt}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  );

  if (loading)
    return (
      <div className="px-4 lg:px-[7rem] py-10 text-center text-gray-500">
        Memuat data lowongan...
      </div>
    );
  if (error)
    return (
      <div className="px-4 lg:px-[7rem] py-10 text-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="px-4 lg:px-[7rem] flex flex-col gap-6 p-4 font-inter">
      {/* Filter */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-1/2 lg:flex-1">
            <input
              type="text"
              placeholder="Posisi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[42px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-gray-400"
            />
          </div>
          <div className="w-full sm:w-1/2 lg:flex-1">
            {makeDropdown("Departemen", department, setDepartment, departments)}
          </div>
          <div className="w-full sm:w-1/2 lg:flex-1">
            {makeDropdown("Lokasi", location, setLocation, locations)}
          </div>
          <div className="w-full sm:w-1/2 lg:flex-1">
            {makeDropdown("Tipe Pekerjaan", jobType, setJobType, jobTypes)}
          </div>
          
          <button className="flex-shrink-0 w-full sm:w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-700 to-sky-600 text-white shadow-md hover:from-sky-800 hover:to-sky-600 transition lg:w-[42px]">
            <FaSearch className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[22px] items-start">
        {/* KIRI - LIST LOWONGAN */}
        <div
          className={`w-full lg:w-1/3 space-y-6 ${
            showDetail ? "hidden lg:block" : "block"
          }`}
        >
          {filteredJobs.length > 0 ? (
            currentJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleCardClick(job)}
                className={`rounded-2xl p-6 bg-white border cursor-pointer transition-all duration-300 ${
                  selectedJob?.id === job.id
                    ? "border-sky-600 shadow-xl ring-1 ring-sky-600 bg-sky-50"
                    : "border-gray-200 shadow-md hover:shadow-lg hover:border-sky-300"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-orange-200 text-amber-800 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                    {job.department}
                  </span>
                  <span className="border border-gray-300 text-gray-600 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium">
                    {job.type}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-2">
                  {job.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {job.description}
                </p>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" /> {job.location}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-2xl shadow border-gray-200 text-center text-gray-500">
              Tidak ada lowongan yang ditemukan.
            </div>
          )}
          {filteredJobs.length > jobsPerPage && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* KANAN - DETAIL LOWONGAN */}
        <div
          className={`w-full lg:flex-1 bg-white p-6 rounded-2xl shadow-lg self-start ${
            showDetail ? "block" : "hidden lg:block"
          }`}
        >
          {selectedJob ? (
            <>
              <button
                onClick={() => setShowDetail(false)}
                className="flex items-center gap-2 text-sky-600 mb-4 lg:hidden font-medium"
              >
                <ArrowLeft size={20} /> Kembali ke Daftar Lowongan
              </button>
              <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 mb-4 gap-2 sm:gap-0">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={16} /> {selectedJob.type}
                  </span>
                </div>
                
                {/* STATUS DITUTUP / DEADLINE */}
                <span className={`flex items-center gap-1 font-semibold text-base ${selectedJob.status === 'closed' ? 'text-gray-500' : 'text-red-600'}`}>
                  <Calendar size={18} className={selectedJob.status === 'closed' ? 'text-gray-500' : 'text-red-600'} /> 
                  {selectedJob.status === 'closed' 
                    ? "Ditutup" 
                    : `Deadline: ${formatDate(selectedJob.deadline)}`
                  }
                </span>

              </div>
              <hr className="my-4" />

              <h3 className="font-semibold">Persyaratan:</h3>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                {renderRequirements(selectedJob.requirements)}
              </ul>

              <h3 className="font-semibold mt-4">Deskripsi:</h3>
              <p className="text-gray-700 mt-1 whitespace-pre-line">
                {selectedJob.description}
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload CV (PDF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={selectedJob.status === 'closed'}
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
                    disabled={selectedJob.status === 'closed'}
                    onChange={(e) => setPortfolioFile(e.target.files[0])}
                    className="block border border-gray-300 rounded-lg w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* TOMBOL LAMAR */}
              <button
                onClick={handleApply}
                disabled={selectedJob.status === 'closed'}
                className={`mt-6 px-6 py-2 rounded-lg text-white font-medium shadow transition ${
                  selectedJob.status === 'closed'
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
                }`}
              >
                {selectedJob.status === 'closed' ? "Lowongan Ditutup" : "Lamar Sekarang"}
              </button>

            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Briefcase size={48} className="mb-4 text-gray-300" />
              <p>Pilih lowongan di sebelah kiri untuk melihat detail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lowongan;