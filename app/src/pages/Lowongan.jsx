import React, { useState, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  MapPin,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Magang Kompartemen Manajemen & Pengembangan SDM",
    department: "IT Development",
    location: "Jakarta Barat",
    type: "Onsite",
    applicants: 674,
    duration: "2 bulan",
    deadline: "2 Oktober 2025",
    posted: "2 hari yang lalu",
    education: "S1 Semua Jurusan",
    experience: "Fresh Graduate",
    description:
      "Kesempatan magang di bidang manajemen dan pengembangan SDM untuk mendukung aktivitas strategis perusahaan.",
    requirements: ["S1 Semua Jurusan", "Fresh Graduate", "Motivasi tinggi"],
  },
  {
    id: 2,
    title: "Product Manager - Makanan Instan",
    department: "Product Development",
    location: "Jakarta",
    type: "Full-time",
    applicants: 320,
    duration: "3 - 5 tahun",
    deadline: "15 Oktober 2025",
    posted: "5 hari yang lalu",
    education: "S1 Teknologi Pangan / Marketing",
    experience: "3 - 5 Tahun",
    description:
      "Memimpin pengembangan produk makanan instan inovatif untuk pasar Indonesia dan regional.",
    requirements: [
      "S1 Teknologi Pangan/Marketing",
      "Pengalaman product management",
      "Kemampuan analisis pasar",
    ],
  },
  {
    id: 3,
    title: "UI/UX Designer",
    department: "Creative Design",
    location: "Bandung",
    type: "Full-time",
    applicants: 120,
    duration: "1 - 2 tahun",
    deadline: "20 Oktober 2025",
    posted: "1 minggu yang lalu",
    education: "S1 Desain Komunikasi Visual",
    experience: "1 - 2 Tahun",
    description:
      "Mendesain pengalaman pengguna yang menarik untuk aplikasi mobile.",
    requirements: [
      "S1 DKV",
      "Pengalaman desain UI/UX",
      "Menguasai Figma/Adobe XD",
    ],
  },
  {
    id: 4,
    title: "Data Analyst",
    department: "IT Development",
    location: "Surabaya",
    type: "Full-time",
    applicants: 200,
    duration: "1 - 2 tahun",
    deadline: "25 Oktober 2025",
    posted: "3 hari yang lalu",
    education: "S1 Statistika / Informatika",
    experience: "1 - 2 Tahun",
    description: "Menganalisis data untuk pengambilan keputusan bisnis.",
    requirements: [
      "S1 Statistika/Informatika",
      "SQL, Python/R",
      "Analisis Data",
    ],
  },
  {
    id: 5,
    title: "HR Staff",
    department: "HR & Legal",
    location: "Medan",
    type: "Full-time",
    applicants: 95,
    duration: "Fresh Graduate",
    deadline: "30 Oktober 2025",
    posted: "4 hari yang lalu",
    education: "S1 Psikologi / Manajemen",
    experience: "Fresh Graduate",
    description:
      "Mendukung aktivitas HR seperti rekrutmen dan administrasi SDM.",
    requirements: ["S1 Psikologi/Manajemen", "Fresh Graduate"],
  },
  {
    id: 6,
    title: "Product Manager - Makanan Instan",
    department: "Product Development",
    location: "Jakarta",
    type: "Full-time",
    experience: "3-5 tahun",
    description:
      "Memimpin pengembangan produk makanan instan inovatif untuk pasar Indonesia dan regional...",
    requirements: [
      "S1 Teknologi Pangan/Marketing",
      "Pengalaman product management",
      "Kemampuan analisis pasar",
    ],
    deadline: "31 Oktober 2025",
  },
  {
    id: 7,
    title: "Quality Assurance Specialist",
    department: "Quality Control",
    location: "Surabaya",
    type: "Full-time",
    experience: "2-4 tahun",
    description:
      "Memastikan kualitas produk sesuai standar internasional dan regulasi pemerintah...",
    requirements: [
      "S1 Teknologi Pangan/Kimia",
      "Sertifikasi HACCP/ISO",
      "Detail oriented",
    ],
    deadline: "15 November 2025",
  },
  {
    id: 8,
    title: "Digital Marketing Manager",
    department: "Marketing",
    location: "Jakarta",
    type: "Full-time",
    experience: "4-6 tahun",
    description:
      "Mengembangkan strategi pemasaran digital untuk meningkatkan brand awareness...",
    requirements: [
      "S1 Marketing/Komunikasi",
      "Pengalaman digital marketing",
      "Data-driven mindset",
    ],
    deadline: "10 November 2025",
  },
];
const departments = [
  "General Affairs",
  "Marketing",
  "Finance",
  "IT Development",
  "Creative Design",
  "HR & Legal",
];
const locations = ["Jakarta", "Bandung", "Medan", "Surabaya"];
const experiences = [
  "Fresh Graduate",
  "1 - 2 Tahun",
  "3 - 5 Tahun",
  "> 5 Tahun",
];
const educationLevels = ["SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"];
const jobTypes = [
  "Penuh Waktu (Tetap)",
  "Kontrak (PKWT)",
  "Paruh Waktu (Part-time)",
  "Magang (Internship)",
  "Paruh Waktu/Lepas (Freelance)",
];

const matchJobType = (jobTypeFilter, jobTypeData) => {
  if (jobTypeFilter === "all") return true;
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

  return false;
};

// =========================================================================
// KOMPONEN PAGINATION
// =========================================================================
function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxVisibleNums = 3;
  const side = Math.floor(maxVisibleNums / 2);
  let displayPages = [];

  if (totalPages > 0) {
    
    // Pastikan halaman 1 dan halaman terakhir selalu ditampilkan jika totalPages > 1
    if (totalPages > 1) {
        if (!displayPages.includes(1)) {
            displayPages.push(1);
        }
    }

    let midStart = Math.max(2, currentPage - side);
    let midEnd = Math.min(totalPages - 1, currentPage + side);

    // Logic untuk menggeser window agar jumlah terlihat konstan (maxVisibleNums)
    if (midEnd - midStart + 1 < maxVisibleNums) {
        if (midStart === 2) {
            midEnd = Math.min(
                totalPages - 1,
                midEnd + (maxVisibleNums - (midEnd - midStart + 1))
            );
        } else if (midEnd === totalPages - 1) {
            midStart = Math.max(
                2,
                midStart - (maxVisibleNums - (midEnd - midStart + 1))
            );
        }
    }

    midStart = Math.max(2, midStart);
    midEnd = Math.min(totalPages - 1, midEnd);

    // Tambahkan titik-titik di awal jika midStart lebih besar dari 2
    if (midStart > 2) {
      displayPages.push("...");
    }

    // Tambahkan angka-angka di tengah
    for (let i = midStart; i <= midEnd; i++) {
        displayPages.push(i);
    }
    
    // Tambahkan titik-titik di akhir jika midEnd kurang dari totalPages - 1
    if (midEnd < totalPages - 1) {
      displayPages.push("...");
    }
    
    // Tambahkan halaman terakhir jika belum ada dan totalPages > 1
    if (totalPages > 1 && !displayPages.includes(totalPages)) {
      displayPages.push(totalPages);
    }

    // Cleaning step: Menghapus duplikasi dan '...' yang berdekatan
    const cleanedPages = [];
    const seen = new Set();
    for (let i = 0; i < displayPages.length; i++) {
        const page = displayPages[i];
        if (page === "...") {
            if (cleanedPages.length > 0 && cleanedPages[cleanedPages.length - 1] !== "...") {
                cleanedPages.push(page);
            }
        } else if (typeof page === 'number') {
            if (!seen.has(page)) {
                cleanedPages.push(page);
                seen.add(page);
            }
        }
    }
    
    // Pastikan 1 ada di awal dan totalPages ada di akhir (untuk edge case)
    const finalPages = [];
    if (totalPages > 0) {
        if (totalPages > 1 && !cleanedPages.includes(1)) {
            finalPages.push(1);
        }
        for(const p of cleanedPages) {
            if (p !== 1 && p !== totalPages) {
                finalPages.push(p);
            }
        }
        if (totalPages > 1 && !finalPages.includes(totalPages)) {
            finalPages.push(totalPages);
        } else if (totalPages === 1 && !finalPages.includes(1)) {
            finalPages.push(1);
        }
    }


    const pagesToDisplay = [...new Set(finalPages)]; // Gunakan Set untuk jaminan unik dan urutan (meski ada potensi urutan error jika di tengah)
    
    // Jika total halaman hanya sedikit, langsung tampilkan semua.
    if (totalPages <= maxVisibleNums + 2) {
        const simplePages = [];
        for (let i = 1; i <= totalPages; i++) {
            simplePages.push(i);
        }
        displayPages = simplePages;
    } else {
        displayPages = pagesToDisplay;
    }

    if (totalPages > 0) {
      return (
        <div className="flex flex-col items-center gap-2 mt-4 p-4">
          {" "}
          <div className="flex justify-center items-center gap-2">
            {/* Go to First (<<) */}{" "}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="First Page"
            >
              <ChevronsLeft size={16} />{" "}
            </button>
            {/* Previous (<) */}{" "}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />{" "}
            </button>{" "}
            {displayPages.map((page, index) =>
              page === "..." ? (
                <span
                  key={index}
                  className="w-9 h-9 flex items-center justify-center text-gray-500"
                >
                  ...{" "}
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition duration-150 ${
                    currentPage === page
                      ? "bg-sky-600 border-sky-600 text-white shadow-md font-semibold"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-sky-50"
                  }`}
                >
                  {page}{" "}
                </button>
              )
            )}
            {/* Next (>) */}{" "}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Next Page"
            >
              <ChevronRight size={16} />{" "}
            </button>
            {/* Go to Last (>>) */}{" "}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Last Page"
            >
              <ChevronsRight size={16} />{" "}
            </button>{" "}
          </div>{" "}
        </div>
      );
    }
  }
  return null;
}

// =========================================================================
// KOMPONEN UTAMA LOWONGAN
// =========================================================================
function Lowongan() {
  const locationRouter = useLocation();
  const jobsPerPage = 4;

  // ------------------------------------
  // State Filter
  // ------------------------------------
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [experience, setExperience] = useState("all");
  const [education, setEducation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [cvFile, setCvFile] = useState(null);
  const [portfolioFile, setPortfolioFile] = useState(null);

  // --- LOGIKA FILTER PEKERJAAN (MEMOIZED) ---
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDepartment =
        department === "all" || job.department === department;
      const matchesLocation =
        location === "all" || job.location.includes(location);
      const matchesExperience =
        experience === "all" || job.experience.includes(experience);

      // PERBAIKAN LOGIKA PENDIDIKAN
      const matchesEducation =
        education === "all" ||
        (job.education &&
          job.education
            .toLowerCase()
            .split(" ")
            .some(eduPart => eduPart === education.toLowerCase()));
            
      const matchesJobType = matchJobType(jobType, job.type);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLocation &&
        matchesExperience &&
        matchesEducation &&
        matchesJobType
      );
    });
  }, [department, location, experience, education, jobType, searchTerm]);

  // --- LOGIKA PENCARIAN HALAMAN LOWONGAN ---
  const findJobPage = (jobId, jobsList) => {
    const index = jobsList.findIndex((job) => job.id === jobId);
    if (index === -1) return 1;
    return Math.ceil((index + 1) / jobsPerPage);
  };

  // --- INISIALISASI DARI URL ---
  const params = new URLSearchParams(locationRouter.search);
  const initialJobId = params.get("jobId");
  
  const initialJob = useMemo(() => {
      return initialJobId ? jobs.find((job) => job.id === parseInt(initialJobId)) : null;
  }, [initialJobId]);

  const [selectedJob, setSelectedJob] = useState(initialJob);
  const [showDetail, setShowDetail] = useState(!!initialJob);

  // ✅ EFEK UNTUK SINKRONISASI FILTER DAN PAGINASI
  useEffect(() => {
    // Jika filter berubah, pastikan currentPage reset ke 1
    setCurrentPage(1);
    
    if (selectedJob && !filteredJobs.some(job => job.id === selectedJob.id)) {
        // Jika lowongan yang dipilih tereliminasi oleh filter
        setSelectedJob(filteredJobs[0] || null);
        setShowDetail(!!filteredJobs.length);
    } else if (!selectedJob && filteredJobs.length > 0) {
        // Jika tidak ada lowongan yang dipilih tapi ada hasil filter
        setSelectedJob(filteredJobs[0]);
        setShowDetail(true);
    } else if (filteredJobs.length === 0) {
        // Jika tidak ada hasil
        setSelectedJob(null);
        setShowDetail(false);
    }
  }, [
    filteredJobs,
    selectedJob 
  ]);

  // Perhitungan Pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Menyesuaikan currentPage jika filteredJobs berkurang
  const safeCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
  const indexOfLastJob = safeCurrentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Fungsi untuk menangani klik pada kartu lowongan (internal)
  const handleCardClick = (job) => {
    const targetPage = findJobPage(job.id, filteredJobs);
    setSelectedJob(job);
    setShowDetail(true);
    setCurrentPage(targetPage);
  };

  const handleApply = () => {
    if (!selectedJob) return;

    if (!cvFile) {
      alert("Harap upload CV (PDF) terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", selectedJob.id);
    formData.append("cv", cvFile);
    if (portfolioFile) {
      formData.append("portfolio", portfolioFile);
    }

    console.log("Lamaran terkirim:", {
      job: selectedJob.title,
      cv: cvFile.name,
      portfolio: portfolioFile ? portfolioFile.name : "Tidak ada",
    });

    alert("Lamaran berhasil dikirim!");
    setCvFile(null);
    setPortfolioFile(null);
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

          <div className="w-full sm:w-1/2 lg:flex-1">
            {makeDropdown("Pengalaman", experience, setExperience, experiences)}
          </div>

          <div className="w-full sm:w-1/2 lg:flex-1">
            {makeDropdown(
              "Jenjang Pendidikan",
              education,
              setEducation,
              educationLevels
            )}
          </div>

          <button
            className="flex-shrink-0 w-full sm:w-[42px] h-[42px] flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-700 to-sky-600 text-white shadow-md hover:from-sky-800 hover:to-sky-600 transition duration-150 lg:w-[42px]"
            aria-label="Cari Lowongan"
          >
            <FaSearch className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Job List + Detail (Layout Responsif) */}
      <div className="flex flex-col lg:flex-row gap-[22px] items-start">
        {/* Kiri: Job List */}
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
                    ? "border-sky-600 shadow-xl"
                    : "border-gray-200 shadow-md"
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" /> {job.experience}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-white rounded-2xl shadow border-gray-200 text-center text-gray-500">
              Tidak ada lowongan yang ditemukan dengan filter ini.
            </div>
          )}

          {/* ✅ Pagination */}
          {filteredJobs.length > jobsPerPage && (
            <Pagination
              currentPage={safeCurrentPage} 
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Kanan: DETAIL LOWONGAN */}
        <div
          className={`w-full lg:flex-1 bg-white p-6 rounded-2xl shadow-lg self-start ${
            showDetail ? "block" : "hidden lg:block"
          }`}
        >
          {selectedJob ? (
            <>
              {/* Tombol Kembali (Hanya muncul di mobile) */}
              <button
                onClick={() => setShowDetail(false)}
                className="flex items-center gap-2 text-sky-600 mb-4 lg:hidden font-medium"
              >
                <ArrowLeft size={20} /> Kembali ke Daftar Lowongan
              </button>

              <h2 className="text-2xl font-bold">{selectedJob.title}</h2>

              {/* DEADLINE DI KANAN */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 mb-4 gap-2 sm:gap-0">
                {/* Kiri: Info Metadata Utama (Lokasi, Tipe, Pengalaman) */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} /> {selectedJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={16} /> {selectedJob.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> {selectedJob.experience}
                  </span>
                </div>

                {/* Kanan: DEADLINE */}
                <span className="flex items-center gap-1 text-red-600 font-semibold text-base">
                  <Calendar size={18} className="text-red-600" /> Deadline:{" "}
                  {selectedJob.deadline}
                </span>
              </div>

              <hr className="my-4" />

              <h3 className="font-semibold">Persyaratan:</h3>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>

              <h3 className="font-semibold mt-4">Deskripsi:</h3>
              <p className="text-gray-700 mt-1">{selectedJob.description}</p>

              {/* Upload Section */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload CV (PDF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files[0])}
                    className="block border border-gray-300 rounded-lg w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
file:rounded-lg file:border-0 file:text-sm file:font-semibold
file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
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
                    onChange={(e) => setPortfolioFile(e.target.files[0])}
                    className="block border border-gray-300 rounded-lg w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
file:rounded-lg file:border-0 file:text-sm file:font-semibold
file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleApply}
                className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-sky-700 to-sky-600 text-white font-medium shadow hover:from-sky-800 hover:to-sky-600"
              >
                Lamar Sekarang
              </button>
            </>
          ) : (
            <p className="text-gray-500">
              Pilih lowongan di sebelah kiri untuk melihat detail, atau
              sesuaikan filter Anda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lowongan;