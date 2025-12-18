// src/components/Pelamar.jsx
import React, { useState, useEffect, Fragment, useCallback } from "react";
import {
  Search,
  Download,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Calendar,
  Eye,
  MessageSquare,
  ChevronDown,
  Check,
  Clock,
  User, // Digunakan sebagai fallback avatar
  AlertCircle,
  TrendingUp,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";

// Import DetailModal dari file terpisah
import DetailModal from "./DetailModal";

// Definisikan URL API
const API_URL_APPLICANTS = "http://localhost:4000/api/applications"; // Endpoint API untuk Aplikasi/Pelamar
const API_URL_JOBS = "http://localhost:4000/api/jobs"; // URL untuk mengambil data Lowongan Kerja

// Dropdown options for status (TETAP)
const statusOptions = [
  { value: "", label: "Status" },
  { value: "under-review", label: "Under Review" },
  { value: "interview-hc", label: "Interview HC" },
  { value: "psikotes", label: "Psikotes" },
  { value: "final-interview", label: "Final Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

// Stage flow for progress calculation (TETAP)
const stageFlow = [
  { status: "under-review", stage: "Under Review" },
  { status: "interview-hc", stage: "Interview HC" },
  { status: "psikotes", stage: "Psikotes" },
  { status: "final-interview", stage: "Final Interview" },
];

// Tahapan yang TIDAK mengizinkan input score (sebelum Psikotes) (TETAP)
const blockedScoreStages = ["under-review", "interview-hc"];

// Helper untuk mengunduh file, terutama jika Base64
const downloadFileFromUrl = (url, filename) => {
    if (!url) return;

    if (url.startsWith('data:')) {
        // Jika ini adalah Base64 Data URL, gunakan teknik download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // Jika ini adalah URL biasa (link eksternal), buka di tab baru
        window.open(url, '_blank');
    }
};


function Pelamar() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusOptions[0]);
  
  const [jobPositions, setJobPositions] = useState([{ value: "", label: "Posisi" }]);
  const [filterPosisi, setFilterPosisi] = useState(jobPositions[0]);

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [message, setMessage] = useState("");

  const [isDetailModalOpen, setIsDetailModal] = useState(false);
  const [detailApplicant, setDetailApplicant] = useState(null);

  const fetchJobPositions = async () => {
    try {
      const response = await fetch(API_URL_JOBS, {
        credentials: 'include', // Sertakan cookie untuk otentikasi
      });
      if (!response.ok) {
        throw new Error(`Gagal mengambil data posisi lowongan. Status: ${response.status}`);
      }
      const data = await response.json();
      
      const jobData = data.data || data; 
      const uniqueTitles = [...new Set(jobData.map(job => job.title))];
      
      const newPosisiOptions = [
        { value: "", label: "Posisi" },
        ...uniqueTitles.map(title => ({ value: title, label: title }))
      ];
      
      setJobPositions(newPosisiOptions);
      if (!newPosisiOptions.some(opt => opt.value === filterPosisi.value)) {
        setFilterPosisi(newPosisiOptions[0]);
      }
    } catch (err) {
      console.error("Fetch Job Positions Error:", err);
    }
  };


  // --- FUNGSI UTAMA: FETCH DATA DARI BACKEND ---
  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL_APPLICANTS, {
        credentials: 'include', 
      });
      if (!response.ok) {
        throw new Error(`Gagal mengambil data dari backend. Status: ${response.status}`);
      }
      const result = await response.json();
      
      // Menggunakan result.data (sesuai format controller backend)
      setApplicants(result.data || []); 
    } catch (err) {
      console.error("Fetch Error:", err);
      // Pesan error diperbarui agar lebih jelas terkait otentikasi
      setError(
        `Gagal terhubung ke backend atau otentikasi gagal. Pastikan Anda sudah login sebagai Admin. Error: ${err.message}`
      );
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
    fetchJobPositions();
  }, [fetchApplicants]);
  // --- AKHIR FUNGSI FETCH DATA ---

  const openDetailModal = (applicant) => {
    setDetailApplicant(applicant);
    setIsDetailModal(true);
  };

  const closeDetailModal = () => {
    setIsDetailModal(false);
    setDetailApplicant(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    let dateToParse = dateStr;
    if (
      typeof dateStr === "string" &&
      dateStr.length === 10 &&
      dateStr.includes("-")
    ) {
      dateToParse = dateStr + "T00:00:00";
    }

    const date = new Date(dateToParse);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handler untuk mengubah score pelamar
  const handleScoreChange = async (id, newScore) => {
    const scoreValue = newScore === "" ? null : parseInt(newScore, 10);

    // Optimistic UI Update
    setApplicants((prevApplicants) =>
      prevApplicants.map((applicant) =>
        applicant.id === id ? { ...applicant, score: scoreValue } : applicant
      )
    );

    // Kirim Update ke Backend
    try {
      const response = await fetch(`${API_URL_APPLICANTS}/${id}/score`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScore }),
        credentials: 'include', // Sertakan cookie
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan score.");
      }
    } catch (e) {
      console.error("Score update failed:", e);
      alert("Gagal menyimpan score. Data akan direfresh.");
      fetchApplicants();
    }
  };
  
  // FUNGSI UTAMA UNTUK MENGUBAH STATUS DARI DROPDOWN
  const handleStatusChange = async (applicant, newStatusValue) => {
      // Jika statusnya sama, jangan lakukan apa-apa
      if (applicant.status === newStatusValue) return;

      let newStatus, newStage;
      let action;

      if (newStatusValue === 'accepted') {
          newStatus = 'accepted';
          newStage = 'Accepted';
          action = 'accept';
      } else if (newStatusValue === 'rejected') {
          // Arahkan ke reject pada tahap saat ini
          newStatus = `rejected-at-${applicant.status}`;
          newStage = 'Rejected';
          action = 'reject';
      } else {
          // Pindah ke tahap yang dipilih (aksi "next")
          const nextStageObj = stageFlow.find(s => s.status === newStatusValue);
          if (nextStageObj) {
              newStatus = nextStageObj.status;
              newStage = nextStageObj.stage;
              action = 'next';
          }
      }

      if (!newStatus) return;


      if (action === 'next') {
          // KASUS 1: NEXT STEP (TIDAK ADA MODAL PESAN - LANGSUNG UPDATE)
          
          // 1. Optimistic UI Update
          setApplicants((prev) =>
              prev.map((a) =>
                  a.id === applicant.id
                      ? { ...a, status: newStatus, stage: newStage }
                      : a
              )
          );
          
          // 2. Kirim Update Status ke Backend
          try {
              const response = await fetch(`${API_URL_APPLICANTS}/${applicant.id}/status`, { 
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus, stage: newStage }),
                  credentials: 'include',
              });

              if (!response.ok) {
                  throw new Error("Gagal memperbarui status di server.");
              }
              console.log(`Status berhasil diubah ke ${newStage} untuk ${applicant.name}`);
          } catch (e) {
              console.error("Status update failed:", e);
              alert("Gagal memperbarui status di server. Data akan direfresh.");
              fetchApplicants();
          }

      } else {
          // KASUS 2: ACCEPT ATAU REJECT (DENGAN MODAL PESAN)
          setSelectedApplicant({...applicant, status: newStatus, stage: newStage});
          setModalAction(action);
          setMessage(getMessage({...applicant, status: newStatus}, action));
          setIsModalOpen(true);
      }
  };


  const getProgress = (status) => {
    const stageProgress = {
      "under-review": 25,
      "interview-hc": 50,
      psikotes: 75,
      "final-interview": 100,
      accepted: 100,
    };

    if (status.startsWith("rejected-at-")) {
      const rejectionStage = status.split("-")[2];
      const progress = stageProgress[rejectionStage];
      return progress || 0;
    }

    return stageProgress[status] || 0;
  };

  const getStatusIcon = (status) => {
    const icons = {
      "under-review": <Clock className="h-5 w-5 text-orange-500" />,
      "interview-hc": <User className="h-5 w-5 text-blue-500" />,
      psikotes: <AlertCircle className="h-5 w-5 text-purple-500" />,
      "final-interview": <TrendingUp className="h-5 w-5 text-green-500" />,
      accepted: <Check className="h-5 w-5 text-green-600" />,
      rejected: <XCircle className="h-5 w-5 text-red-600" />,
    };

    if (status.startsWith("rejected-at-")) {
      return icons["rejected"];
    }

    return icons[status] || null;
  };

  const getBadgeColor = (status) => {
    if (status.startsWith("rejected-at-")) {
      return "bg-red-200 text-red-700";
    }

    switch (status) {
      case "under-review":
        return "bg-orange-100 text-orange-600";
      case "interview-hc":
        return "bg-blue-100 text-blue-600";
      case "psikotes":
        return "bg-purple-100 text-purple-600";
      case "final-interview":
        return "bg-green-100 text-green-600";
      case "accepted":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredApplicants = applicants.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterStatus.value === "rejected"
        ? a.status.startsWith("rejected")
        : filterStatus.value
        ? a.status === filterStatus.value
        : true) &&
      (filterPosisi.value ? a.position === filterPosisi.value : true)
  );

  const exportToCSV = () => {
    const header = [
      "Nama",
      "Email",
      "Posisi",
      "Pengalaman",
      "Tahap Seleksi",
      "Score",
      "Tanggal Lamar",
    ];
    const rows = filteredApplicants.map((a) => [
      a.name,
      a.email,
      a.position,
      a.experience,
      a.stage,
      blockedScoreStages.includes(a.status) ? 0 : a.score || 0,
      formatDate(a.appliedDate),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_pelamar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCV = (applicant) => {
    if (!applicant.cvUrl) {
      alert(`CV untuk ${applicant.name} tidak tersedia.`);
      return;
    }
    // Menggunakan helper function yang sudah dimodifikasi
    downloadFileFromUrl(applicant.cvUrl, `cv_${applicant.name}.pdf`);
  };

  const handleDownloadPortofolio = (applicant) => {
    if (!applicant.portfolioUrl) {
      alert(`Portofolio untuk ${applicant.name} tidak tersedia.`);
      return;
    }
    // Menggunakan helper function yang sudah dimodifikasi
    downloadFileFromUrl(applicant.portfolioUrl, `portofolio_${applicant.name}.pdf`);
  };

  const getMessage = (applicant, action) => {
    const baseMessage = `Halo ${applicant.name}, ini adalah pesan dari tim rekrutmen.`;

    if (applicant.status.startsWith("rejected") || action === 'reject') {
      return `${baseMessage}\n\nTerima kasih atas waktu dan usaha Anda. Kami mohon maaf, Anda tidak lolos pada tahap ini.`;
    }

    if (action === 'accept') {
        return `${baseMessage}\n\nSelamat! Anda telah diterima untuk posisi ${applicant.position}. Kami tunggu kehadiran Anda!`;
    }

    // Default message for progression (action === 'next' or undefined)
    const nextStageName = stageFlow.find(s => s.status === applicant.status)?.stage;
    if (nextStageName) {
        return `${baseMessage}\n\nSelamat! Anda telah lolos dan melanjutkan ke tahap: ${nextStageName}.`;
    }
    
    // Fallback message for custom action (should not happen if action === 'pesan' is removed)
    return `${baseMessage}\n\n[Pesan kustom...]`;
  };

  // --- FUNGSI UPDATE STATUS DENGAN API ---
  const handleSendMessage = useCallback(async () => {
    if (!selectedApplicant) return;

    // Status dan stage sudah disiapkan di openModal atau handleStatusChange
    const newStatus = selectedApplicant.status; 
    const newStage = selectedApplicant.stage; 

    // 1. Optimistic UI Update
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === selectedApplicant.id
          ? { ...a, status: newStatus, stage: newStage }
          : a
      )
    );
    console.log(`Status berhasil diubah ke ${newStage} untuk ${selectedApplicant.name}`);


    // 2. Kirim Update Status ke Backend
    try {
      const response = await fetch(`${API_URL_APPLICANTS}/${selectedApplicant.id}/status`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, stage: newStage }),
        credentials: 'include', // Sertakan cookie
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status di server.");
      }
    } catch (e) {
      console.error("Status update failed:", e);
      alert("Gagal memperbarui status di server. Data akan direfresh.");
      fetchApplicants();
    }

    setIsModalOpen(false);
  }, [selectedApplicant, message, fetchApplicants]); // Menghapus modalAction dari dependencies karena sudah dicheck di awal
  // --- AKHIR FUNGSI UPDATE STATUS ---

  // Logika untuk menentukan apakah kolom Score bisa diinput atau tidak (TETAP)
  const isScoreEditable = (status) => {
    return (
      status === "psikotes" ||
      status === "final-interview" ||
      status === "accepted" ||
      status.startsWith("rejected-at-psikotes") ||
      status.startsWith("rejected-at-final-interview")
    );
  };

  // Mendapatkan nilai score yang akan ditampilkan (0 jika belum psikotes) (TETAP)
  const getDisplayScore = (applicant) => {
    if (blockedScoreStages.includes(applicant.status)) {
      return 0;
    }
    return applicant.score === null ? "" : applicant.score;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-sky-900 mb-3">Pelamar</h1>

      {/* Error Message Bar */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Under Review */}
        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Under Review</p>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {applicants.filter((a) => a.status === "under-review").length}
          </h2>
          <p className="text-sm text-gray-500">Sedang ditinjau</p>
        </div>

        {/* Interview HC */}
        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Interview HC</p>
            <User className="h-4 w-4 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {applicants.filter((a) => a.status === "interview-hc").length}
          </h2>
          <p className="text-sm text-gray-500">Menunggu jadwal</p>
        </div>

        {/* Psikotes */}
        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Psikotes</p>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {applicants.filter((a) => a.status === "psikotes").length}
          </h2>
          <p className="text-sm text-gray-500">Dalam proses</p>
        </div>

        {/* Final Interview */}
        <div className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">Final Interview</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {applicants.filter((a) => a.status === "final-interview").length}
          </h2>
          <p className="text-sm text-gray-500">Tahap akhir</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 ">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari pelamar..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full text-sm 
              focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Listbox */}
          <Listbox value={filterStatus} onChange={setFilterStatus}>
            <div className="relative w-44">
              <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                {filterStatus.label}
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  {statusOptions.map((status) => (
                    <Listbox.Option
                      key={status.value}
                      value={status}
                      className={({ active }) =>
                        `px-3 py-2 cursor-pointer text-sm flex rounded-md items-center gap-2 ${
                          active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          {selected && (
                            <Check className="h-4 w-4 text-sky-600" />
                          )}
                          {status.label}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* Posisi Listbox */}
          <Listbox value={filterPosisi} onChange={setFilterPosisi}>
            <div className="relative w-44">
              <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm truncate focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                {filterPosisi.label}
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  {jobPositions.map((posisi) => (
                    <Listbox.Option
                      key={posisi.value}
                      value={posisi}
                      className={({ active }) =>
                        `px-3 py-2 cursor-pointer rounded-md text-sm flex items-center gap-2 ${
                          active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          {selected && (
                            <Check className="h-4 w-4 text-sky-600" />
                          )}
                          {posisi.label}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 flex items-center gap-2 border rounded-lg text-white bg-sky-600 shadow-sm hover:bg-sky-700 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-xl bg-white shadow-sm relative">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Memuat data pelamar...
          </div>
        ) : error ? (
          <div className="p-6 text-red-700 bg-red-100 border border-red-300">
            Gagal memuat data: {error}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada pelamar yang cocok dengan filter ini.
          </div>
        ) : (
          <div>
            <table className="w-full border-collapse">
              {/* Header Tabel */}
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left rounded-tl-xl">Pelamar</th>
                  <th className="p-3 text-left">Posisi</th>
                  <th className="p-3 text-center">Tahap Seleksi</th>
                  <th className="p-3 text-center">Progress</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-left">Tanggal Lamar</th>
                  <th className="p-3 text-right rounded-tr-xl">Aksi</th>
                </tr>
              </thead>

              {/* Konten Tabel */}
              <tbody>
                {filteredApplicants.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    {/* 1. Pelamar */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {/* LOGIKA KONDISIONAL AVATAR */}
                        {a.avatar && a.avatar.length > 0 ? (
                          <img
                            src={a.avatar}
                            alt={a.name}
                            className="w-10 h-10 rounded-full object-cover"
                            // Optional: Tambahkan onError handling jika URL gambar gagal dimuat
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        {/* AKHIR LOGIKA AVATAR */}
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <p className="text-sm text-gray-500">{a.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Posisi */}
                    <td className="p-3">
                      <p className="font-medium">{a.position}</p>
                      <p className="text-sm text-gray-500">{a.experience}</p>
                    </td>

                    {/* 3. Tahap Seleksi (DROPDOWN) */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                          {/* Listbox untuk Status */}
                          <Listbox 
                              value={a.status} 
                              onChange={(newStatus) => handleStatusChange(a, newStatus)}
                              disabled={a.status === 'accepted' || a.status.startsWith('rejected')} // Disable jika sudah final
                          >
                            {({ open }) => (
                              <div className="relative w-40">
                                <Listbox.Button 
                                    className={`flex items-center justify-between w-full px-2 py-1 rounded-lg text-xs font-medium transition ${
                                        getBadgeColor(a.status)
                                    } ${open ? 'ring-2 ring-sky-500/50' : ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(a.status)}
                                      {a.stage}
                                    </div>
                                    <ChevronDown className="h-3 w-3" />
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50 text-left">
                                    
                                    {/* Opsi Tahap Selanjutnya (Flow) */}
                                    {stageFlow.map((step) => (
                                      <Listbox.Option
                                        key={step.status}
                                        value={step.status}
                                        className={({ active }) =>
                                          `cursor-pointer select-none relative py-2 pl-3 pr-9 text-sm ${
                                            active ? 'bg-sky-100 text-sky-900' : 'text-gray-900'
                                          }`
                                        }
                                      >
                                        {({ selected }) => (
                                          <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                            {step.stage}
                                            {selected && (
                                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sky-600">
                                                <Check className="h-4 w-4" />
                                              </span>
                                            )}
                                          </span>
                                        )}
                                      </Listbox.Option>
                                    ))}

                                    {/* Separator */}
                                    <hr className="my-1 border-gray-200" />
                                    
                                    {/* Opsi Final Status */}
                                    <Listbox.Option value="accepted" className={({ active }) =>
                                        `cursor-pointer select-none relative py-2 pl-3 pr-9 text-sm ${
                                          active ? 'bg-green-100 text-green-900' : 'text-green-700'
                                        }`
                                      }
                                    >
                                        DITERIMA
                                    </Listbox.Option>

                                    <Listbox.Option value="rejected" className={({ active }) =>
                                        `cursor-pointer select-none relative py-2 pl-3 pr-9 text-sm ${
                                          active ? 'bg-red-100 text-red-900' : 'text-red-700'
                                        }`
                                      }
                                    >
                                        DITOLAK
                                    </Listbox.Option>

                                  </Listbox.Options>
                                </Transition>
                              </div>
                            )}
                          </Listbox>
                      </div>
                    </td>
                    {/* AKHIR 3. Tahap Seleksi (DROPDOWN) */}


                    {/* 4. Progress */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 bg-gray-200 rounded w-24">
                          <div
                            className="h-2 bg-blue-500 rounded"
                            style={{ width: `${getProgress(a.status)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {getProgress(a.status)}%
                        </span>
                      </div>
                    </td>

                    {/* 5. Score */}
                    <td className="p-3 text-center">
                      {isScoreEditable(a.status) ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={getDisplayScore(a)}
                          onChange={(e) =>
                            handleScoreChange(a.id, e.target.value)
                          }
                          className={`w-14 text-center border p-1 rounded-lg text-sm transition focus:outline-none focus:ring-1 focus:ring-sky-500/30 ${
                            a.score >= 85
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-yellow-100 text-yellow-700 border-yellow-300"
                          }`}
                        />
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            blockedScoreStages.includes(a.status)
                              ? "bg-gray-100 text-gray-500"
                              : ""
                          }`}
                        >
                          {getDisplayScore(a)}
                        </span>
                      )}
                    </td>

                    {/* 6. Tanggal Lamar */}
                    <td className="p-3 text-left">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(a.appliedDate)}
                      </div>
                    </td>

                    {/* 7. Aksi */}
                    <td className="p-3 text-right relative">
                      <div className="flex justify-end gap-2 items-center">
                        {/* Dropdown More */}
                        <Listbox>
                          <div className="relative inline-block">
                            <Listbox.Button className="p-1 rounded hover:bg-gray-100 transition">
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options
                                className={`absolute right-0 w-40 bg-white border border-gray-300 rounded-lg shadow-xl z-50 focus:outline-none ${
                                  idx >= filteredApplicants.length - 2
                                    ? "bottom-full mb-1"
                                    : "mt-1"
                                }`}
                              >
                                <Listbox.Option
                                  value="detail"
                                  onClick={() => openDetailModal(a)}
                                  className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                                >
                                  <Eye className="h-4 w-4" /> Lihat Detail
                                </Listbox.Option>
                                <Listbox.Option
                                  value="cv"
                                  onClick={() => handleDownloadCV(a)}
                                  className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                                >
                                  <Download className="h-4 w-4" /> Download CV
                                </Listbox.Option>

                                <Listbox.Option
                                  value="portofolio"
                                  onClick={() => handleDownloadPortofolio(a)}
                                  className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                                >
                                  <Download className="h-4 w-4" /> Portofolio
                                </Listbox.Option>
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message modal */}
      {isModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {modalAction === "accept" && "Kirim pesan penerimaan"}
              {modalAction === "reject" && "Kirim pesan penolakan"}
            </h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              rows="8"
              placeholder="Tulis pesan untuk pelamar..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              >
                Batal
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-lg text-center text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && detailApplicant && (
        <DetailModal applicant={detailApplicant} onClose={closeDetailModal} />
      )}
    </div>
  );
}

export default Pelamar;