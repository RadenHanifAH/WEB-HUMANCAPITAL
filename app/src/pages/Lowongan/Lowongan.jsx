/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

// COMPONENTS
import Pagination from "./components/Pagination";
import JobCard from "./components/JobCard";
import JobDetail from "./components/JobDetail";
import ToastAlert from "./components/Alert";

// BACKEND
import useAuthStore from "../../store/useAuthStore";
import axiosInstance from "../../api/axiosInstance";
import { fetchJobs } from "../Admin/Lokeradmin/services/api";

const SECTION_LABELS = {
  dataPribadi: "Data Pribadi",
  tentangSaya: "Tentang Saya",
  pengalamanKerja: "Pengalaman Kerja",
  pendidikan: "Pendidikan",
  skills: "Skills",
};

const DEFAULT_READINESS = {
  ready: false,
  sections: {},
  missing: [],
  optional: {},
};

// ✅ Pindahkan Dropdown ke luar komponen agar state HeadlessUI stabil
const FilterDropdown = ({ label, value, setValue, options }) => (
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

        <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 text-sm max-h-48 overflow-y-auto">
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

function Lowongan() {
  const locationRouter = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const jobsPerPage = 4;

  // FILTER
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // DATA
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APPLY
  const [submitting, setSubmitting] = useState(false);

  const [profileReadiness, setProfileReadiness] = useState(DEFAULT_READINESS);
  const [loadingReadiness, setLoadingReadiness] = useState(true);

  // DETAIL
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // APPLICATION STATUS
  const [applicationStatus, setApplicationStatus] = useState(null);

  // ALERT
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

  const missingLabelsText = useMemo(() => {
    return profileReadiness.missing
      .map((key) => SECTION_LABELS[key] || key)
      .join(", ");
  }, [profileReadiness.missing]);

  const jobIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(locationRouter.search);
    const val = params.get("jobId");
    return val ? String(val) : null;
  }, [locationRouter.search]);

  // FETCH JOBS
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchJobs();
        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (response && Array.isArray(response.data)) {
          data = response.data;
        }

        const sortedData = [...data].sort((a, b) => Number(b.id) - Number(a.id));
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

  // ✅ CEK KELENGKAPAN PROFIL
  useEffect(() => {
    const loadProfileReadiness = async () => {
      if (!user) {
        setProfileReadiness(DEFAULT_READINESS);
        setLoadingReadiness(false);
        return;
      }

      try {
        setLoadingReadiness(true);
        const res = await axiosInstance.get("/applications/profile-readiness");
        setProfileReadiness(res?.data?.data || DEFAULT_READINESS);
      } catch (err) {
        console.error("Gagal memeriksa kelengkapan profil:", err);
        setProfileReadiness(DEFAULT_READINESS);
      } finally {
        setLoadingReadiness(false);
      }
    };

    loadProfileReadiness();
  }, [user]);

  const checkApplicationStatus = async (jobId) => {
    if (!user || !jobId) {
      setApplicationStatus(null);
      return;
    }

    try {
      const res = await axiosInstance.get(`/applications/check/${jobId}`);
      if (res.data?.alreadyApplied) {
        setApplicationStatus(res.data.application);
      } else {
        setApplicationStatus(null);
      }
    } catch (err) {
      console.error(err);
      setApplicationStatus(null);
    }
  };

  // ✅ FILTER OPTIONS (Aman dari undefined field)
  const departments = useMemo(
    () => [...new Set(jobs.map((job) => job.departemen || job.department).filter(Boolean))],
    [jobs]
  );

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.lokasi || job.location).filter(Boolean))],
    [jobs]
  );

  const jobTypes = useMemo(
    () => [...new Set(jobs.map((job) => job.jenis || job.type).filter(Boolean))],
    [jobs]
  );

  // ✅ FILTERED JOBS (Logika disesuaikan agar case-insensitive & aman)
  const filteredJobs = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return jobs
      .filter((job) => String(job.status || "").toLowerCase() !== "draft")
      .filter((job) => {
        const judul = (job.judul || job.title || "").toLowerCase();
        const matchesSearch = judul.includes(searchLower);

        const jobDept = job.departemen || job.department || "";
        const matchesDepartment =
          department === "all" || jobDept === department;

        const jobLoc = job.lokasi || job.location || "";
        const matchesLocation =
          location === "all" ||
          (jobLoc && jobLoc.toLowerCase().includes(location.toLowerCase()));

        const jobTypeData = job.jenis || job.type || "";
        const matchesJobType =
          jobType === "all" ||
          (jobTypeData && jobTypeData.toLowerCase() === jobType.toLowerCase());

        return matchesSearch && matchesDepartment && matchesLocation && matchesJobType;
      });
  }, [jobs, department, location, jobType, searchTerm]);

  // ✅ RESET PAGINATION KE PAGE 1 SETIAP KALI FILTER DIUBAH
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, department, location, jobType]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const currentJobs = filteredJobs.slice(
    (safeCurrentPage - 1) * jobsPerPage,
    safeCurrentPage * jobsPerPage
  );

  // AUTO SELECT JOB
  useEffect(() => {
    if (loading) return;

    if (!filteredJobs.length) {
      setSelectedJob(null);
      return;
    }

    if (jobIdFromUrl) {
      const found = filteredJobs.find((j) => String(j.id) === jobIdFromUrl);
      if (found) {
        setSelectedJob(found);
        const idx = filteredJobs.findIndex((j) => String(j.id) === jobIdFromUrl);
        if (idx >= 0) {
          const page = Math.floor(idx / jobsPerPage) + 1;
          setCurrentPage(page);
        }
        return;
      }
    }

    if (!selectedJob && filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, jobIdFromUrl, loading]);

  useEffect(() => {
    if (selectedJob?.id) {
      checkApplicationStatus(selectedJob.id);
    }
  }, [selectedJob]);

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowDetail(true);
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    if (!user) {
      showAlert("warning", "Peringatan", "Silakan login terlebih dahulu untuk mengirim lamaran.");
      return;
    }

    if (!profileReadiness.ready) {
      showAlert(
        "warning",
        "Lengkapi Profil Terlebih Dahulu",
        `Anda belum melengkapi: ${missingLabelsText}. Silakan lengkapi data tersebut pada halaman Profil sebelum melamar.`
      );
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/applications/job", { jobId: selectedJob.id });
      await checkApplicationStatus(selectedJob.id);
      showAlert("success", "Berhasil", "Lamaran berhasil dikirim");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.code === "PROFILE_INCOMPLETE") {
        showAlert(
          "warning",
          "Lengkapi Profil Terlebih Dahulu",
          err.response?.data?.message || "Silakan lengkapi profil Anda sebelum melamar."
        );
        return;
      }
      showAlert("error", "Gagal", err.response?.data?.message || "Gagal mengirim lamaran");
    } finally {
      setSubmitting(false);
    }
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
    return <li>Tidak ada persyaratan.</li>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="px-4 lg:px-[7rem] flex flex-col gap-6 p-4">
      <ToastAlert
        open={alert.open}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={closeAlert}
      />

      {/* FILTER */}
      <div className="bg-white p-6 rounded-xl shadow-lg w-full border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-1/2 lg:flex-1">
            <input
              type="text"
              placeholder="Cari posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[42px] px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="w-full sm:w-1/2 lg:flex-1">
            <FilterDropdown label="Departemen" value={department} setValue={setDepartment} options={departments} />
          </div>

          <div className="w-full sm:w-1/2 lg:flex-1">
            <FilterDropdown label="Lokasi" value={location} setValue={setLocation} options={locations} />
          </div>

          <div className="w-full sm:w-1/2 lg:flex-1">
            <FilterDropdown label="Tipe Pekerjaan" value={jobType} setValue={setJobType} options={jobTypes} />
          </div>

          <button className="flex-shrink-0 w-full sm:w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-700 to-sky-600 text-white shadow-md">
            <FaSearch className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className={`w-full lg:w-1/3 ${showDetail ? "hidden lg:block" : "block"}`}>
          <div className="space-y-4">
            {currentJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onClick={handleCardClick}
              />
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        <div
          className={`w-full lg:w-2/3 bg-white p-6 rounded-2xl shadow self-start ${
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
              handleApply={handleApply}
              applicationStatus={applicationStatus}
              profileReadiness={profileReadiness}
              missingLabelsText={missingLabelsText}
            />
          ) : (
            <div className="text-center text-gray-500 py-20">Pilih lowongan</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lowongan;