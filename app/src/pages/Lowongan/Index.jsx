/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Briefcase } from "lucide-react";

// Import Komponen Hasil Pisah
import Pagination from "./components/Pagination";
import JobCard from "./components/JobCard";
import JobDetail from "./components/JobDetail";
import ToastAlert from "./components/Alert";

// Integrasi Backend
import useAuthStore from "../../store/useAuthStore";
import axiosInstance from "../../api/axiosInstance";
import { fetchJobs } from "../Admin/Lokeradmin/services/api";

function Lowongan() {
  const locationRouter = useLocation();
  const { user } = useAuthStore();

  const jobsPerPage = 4;

  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // STATE UNTUK FILE
  const [cvFile, setCvFile] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true); // tetap dipakai internal (buat disable tombol dll kalau mau)
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // ✅ STATE ALERT (toast kanan atas)
  const [alert, setAlert] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (type, title, message) => {
    setAlert({ open: true, type, title, message });
  };

  const closeAlert = () => setAlert((prev) => ({ ...prev, open: false }));

  // ✅ ambil jobId dari URL: /lowongan?jobId=123
  const jobIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(locationRouter.search);
    const val = params.get("jobId");
    return val ? String(val) : null;
  }, [locationRouter.search]);

  // Fetch jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchJobs();

        let data = [];
        if (Array.isArray(response)) data = response;
        else if (response && Array.isArray(response.data)) data = response.data;

        // urutkan terbaru
        const sortedData = [...data].sort(
          (a, b) => Number(b.id) - Number(a.id),
        );
        setJobs(sortedData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Gagal mengambil data lowongan.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Filter lists logic
  const departments = useMemo(
    () => [...new Set(jobs.map((job) => job.department).filter(Boolean))],
    [jobs],
  );
  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location).filter(Boolean))],
    [jobs],
  );
  const jobTypes = useMemo(
    () => [...new Set(jobs.map((job) => job.type).filter(Boolean))],
    [jobs],
  );

  const matchJobType = (jobTypeFilter, jobTypeData) => {
    if (jobTypeFilter === "all") return true;
    if (!jobTypeData) return false;

    const filterLower = jobTypeFilter.toLowerCase();
    const dataLower = String(jobTypeData).toLowerCase();

    if (
      filterLower.includes("magang") &&
      (dataLower === "onsite" || dataLower.includes("internship"))
    )
      return true;

    if (filterLower.includes("penuh waktu") && dataLower.includes("full-time"))
      return true;

    return filterLower === dataLower;
  };

  const filteredJobs = useMemo(() => {
    return (
      jobs
        // ✅ 1) hilangkan draft
        .filter((job) => String(job.status || "").toLowerCase() !== "draft")
        // ✅ 2) baru filter yg lain
        .filter((job) => {
          const title = job.title ? job.title.toLowerCase() : "";
          const matchesSearch = title.includes(searchTerm.toLowerCase());
          const matchesDepartment =
            department === "all" || job.department === department;
          const matchesLocation =
            location === "all" ||
            (job.location && String(job.location).includes(location));
          const matchesJobType = matchJobType(jobType, job.type);

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesLocation &&
            matchesJobType
          );
        })
    );
  }, [jobs, department, location, jobType, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const currentJobs = filteredJobs.slice(
    (safeCurrentPage - 1) * jobsPerPage,
    safeCurrentPage * jobsPerPage,
  );

  // pilih job dari URL
  useEffect(() => {
    // saat masih loading dan jobs kosong, jangan ubah2 selectedJob
    if (loading) return;

    if (!filteredJobs.length) {
      setSelectedJob(null);
      setShowDetail(false);
      return;
    }

    if (jobIdFromUrl) {
      const found = filteredJobs.find((j) => String(j.id) === jobIdFromUrl);

      if (found) {
        setSelectedJob(found);
        setShowDetail(true);

        const idx = filteredJobs.findIndex(
          (j) => String(j.id) === jobIdFromUrl,
        );
        if (idx >= 0) {
          const page = Math.floor(idx / jobsPerPage) + 1;
          setCurrentPage(page);
        }

        if (window.innerWidth < 1024) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
    }

    if (!selectedJob || !filteredJobs.some((j) => j.id === selectedJob.id)) {
      setSelectedJob(filteredJobs[0]);
      if (window.innerWidth >= 1024 || !selectedJob) setShowDetail(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs, jobIdFromUrl, loading]);

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowDetail(true);
    if (window.innerWidth < 1024)
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ LOGIKA PENGIRIMAN LAMARAN + ALERT TOAST
  const handleApply = async () => {
    if (!selectedJob) return;

    // ✅ Wajib login
    if (!user) {
      showAlert(
        "warning",
        "Peringatan",
        "Silakan login terlebih dahulu untuk mengirim lamaran.",
      );
      return;
    }

    if (selectedJob.status === "closed") {
      showAlert(
        "error",
        "Lowongan ditutup",
        "Maaf, lowongan ini sudah ditutup.",
      );
      return;
    }

    if (!cvFile) {
      showAlert(
        "warning",
        "CV belum diupload",
        "Harap upload CV (PDF) terlebih dahulu.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("jobId", selectedJob.id);
      formData.append("cv", cvFile);
      if (portfolioFile) formData.append("portfolio", portfolioFile);

      await axiosInstance.post("/applications/job", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showAlert(
        "success",
        "Lamaran berhasil dikirim!",
        `Lamaran untuk posisi "${selectedJob.title}" sudah terkirim.`,
      );

      setCvFile(null);
      setPortfolioFile(null);
      document
        .querySelectorAll('input[type="file"]')
        .forEach((input) => (input.value = ""));
    } catch (err) {
      console.error("Error Detail:", err);
      const message =
        err.response?.data?.message || "Server Error: Gagal mengirim lamaran";
      showAlert("error", "Gagal mengirim lamaran", message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRequirements = (reqs) => {
    if (Array.isArray(reqs))
      return reqs.map((req, i) => <li key={i}>{req}</li>);
    if (typeof reqs === "string")
      return reqs
        .split(/\r?\n/)
        .map((req, i) => (req.trim() ? <li key={i}>{req.trim()}</li> : null));
    return <li>Tidak ada persyaratan spesifik.</li>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak ditentukan";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
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

  // ✅ ERROR (kalau error, tetap tampilkan error)
  if (error)
    return (
      <div className="px-4 lg:px-[7rem] py-10 text-center text-red-500 font-inter">
        {error}
      </div>
    );

  return (
    <div className="px-4 lg:px-[7rem] flex flex-col gap-6 p-4 font-inter">
      {/* ✅ TOAST ALERT */}
      <ToastAlert
        open={alert.open}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
        duration={2500}
      />

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full border border-gray-100">
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

          <button className="flex-shrink-0 w-full sm:w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-700 to-sky-600 text-white shadow-md hover:from-sky-800 transition lg:w-[42px]">
            <FaSearch className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[22px] items-start">
        {/* Kolom Kiri */}
        <div
          className={`w-full lg:w-1/3 space-y-6 ${
            showDetail ? "hidden lg:block" : "block"
          }`}
        >
          {/* ✅ Tanpa loading: kalau data belum masuk, tampil kosong / placeholder */}
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onClick={handleCardClick}
              />
            ))
          ) : (
            <div className="p-6 bg-white rounded-2xl shadow border-gray-200 text-center text-gray-500">
              {loading ? " " : "Tidak ada lowongan ditemukan."}
            </div>
          )}

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Kolom Kanan */}
        <div
          className={`w-full lg:flex-1 bg-white p-6 rounded-2xl shadow-lg self-start border border-gray-100 ${
            showDetail ? "block" : "hidden lg:block"
          }`}
        >
          {selectedJob ? (
            <JobDetail
              job={selectedJob}
              onBack={() => setShowDetail(false)}
              formatDate={formatDate}
              renderRequirements={renderRequirements}
              submitting={submitting}
              setCvFile={setCvFile}
              setPortfolioFile={setPortfolioFile}
              handleApply={handleApply}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Briefcase size={48} className="mb-4 text-gray-300 opacity-20" />
              <p className="font-medium">
                {loading
                  ? " "
                  : "Pilih lowongan di sebelah kiri untuk melihat detail."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lowongan;
