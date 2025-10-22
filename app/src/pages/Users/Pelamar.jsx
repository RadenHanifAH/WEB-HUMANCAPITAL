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
  User,
  AlertCircle,
  TrendingUp,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";

// URL API Pelamar (Pastikan ini sesuai dengan server.js Anda)
const API_URL = "http://localhost:4000/api/applicants";

// Komponen Modal Detail (Simulasi)
const DetailModal = ({ applicant, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl transform transition-all">
      <h2 className="text-xl font-bold text-sky-800 mb-4 border-b pb-2">
        Detail Pelamar
      </h2>
      <div className="space-y-3 text-gray-700">
        <p>
          <strong>Nama:</strong> {applicant.name}
        </p>
        <p>
          <strong>Email:</strong> {applicant.email}
        </p>
        <p>
          <strong>Posisi Dilamar:</strong> {applicant.position || "N/A"}
        </p>
        <p>
          <strong>Status:</strong> {applicant.stage || applicant.status}
        </p>
        <p>
          <strong>Tanggal Melamar:</strong>{" "}
          {new Date(applicant.appliedDate).toLocaleDateString("id-ID")}
        </p>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition shadow"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
);

// Dropdown options for status and position (TETAP)
const statusOptions = [
  { value: "", label: "Status" },
  { value: "under-review", label: "Under Review" },
  { value: "interview-hc", label: "Interview HC" },
  { value: "psikotes", label: "Psikotes" },
  { value: "final-interview", label: "Final Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const posisiOptions = [
  { value: "", label: "Posisi" },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "UI/UX Designer", label: "UI/UX Designer" },
  { value: "Product Manager", label: "Product Manager" },
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

function Pelamar() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusOptions[0]);
  const [filterPosisi, setFilterPosisi] = useState(posisiOptions[0]);

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Message modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [message, setMessage] = useState("");

  // Detail modal state
  const [isDetailModalOpen, setIsDetailModal] = useState(false);
  const [detailApplicant, setDetailApplicant] = useState(null);

  // --- FUNGSI UTAMA: FETCH DATA DARI BACKEND (Menggunakan useCallback) ---
  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Gagal mengambil data dari backend.");
      }
      const data = await response.json();
      setApplicants(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(
        `Gagal terhubung ke backend. Pastikan server berjalan di port 4000. Error: ${err.message}`
      );
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []); // Dependency array kosong, fungsi tidak akan berubah setelah mount

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]); // Dependensi fetchApplicants adalah fungsi itu sendiri (dari useCallback)
  // --- AKHIR FUNGSI FETCH DATA ---

  const openDetailModal = (applicant) => {
    setDetailApplicant(applicant);
    setIsDetailModal(true);
  };

  const closeDetailModal = () => {
    setIsDetailModal(false);
    setDetailApplicant(null);
  };

  // ✅ FUNGSI FORMAT DATE YANG DIPERBAIKI
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    let dateToParse = dateStr;
    // Jika data dari backend adalah string YYYY-MM-DD, tambahkan offset waktu agar parsing stabil
    if (
      typeof dateStr === "string" &&
      dateStr.length === 10 &&
      dateStr.includes("-")
    ) {
      dateToParse = dateStr + "T00:00:00";
    }

    const date = new Date(dateToParse);

    if (isNaN(date.getTime())) {
      // Jika parsing gagal, kembalikan string asli
      return dateStr;
    }

    // Format tanggal ke format lokal "dd/mm/yyyy"
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  // ✅ AKHIR FUNGSI FORMAT DATE YANG DIPERBAIKI

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
      const response = await fetch(`${API_URL}/${id}/score`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScore === "" ? null : newScore }),
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
      // Filter status
      (filterStatus.value === "rejected"
        ? a.status.startsWith("rejected")
        : filterStatus.value
        ? a.status === filterStatus.value
        : true) &&
      // Filter posisi
      (filterPosisi.value ? a.position === filterPosisi.value : true)
  );

  const exportToCSV = () => {
    // ... (Logika exportToCSV tetap sama)
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
    console.log(`[SIMULASI] Mengunduh CV milik ${applicant.name}`);
  };

  const handleDownloadPortofolio = (applicant) => {
    console.log(`[SIMULASI] Mengunduh Portofolio milik ${applicant.name}`);
  };

  const getMessage = (applicant, action) => {
    const baseMessage = `Halo ${applicant.name}, ini adalah pesan dari tim rekrutmen.`;

    if (applicant.status.startsWith("rejected")) {
      return `${baseMessage}\n\nTerima kasih atas waktu dan usaha Anda. [Pesan penolakan umum...]`;
    }

    if (action === "next") {
      const currentIndex = stageFlow.findIndex(
        (s) => s.status === applicant.status
      );
      const nextStage = stageFlow[currentIndex + 1];
      if (nextStage) {
        return `${baseMessage}\n\nSelamat! Anda telah lolos ke tahap ${nextStage.stage}. [Pesan lanjutan...]`;
      }
    } else if (action === "accept") {
      return `${baseMessage}\n\nSelamat! Anda telah diterima untuk posisi ${applicant.position}. [Pesan penerimaan...]`;
    } else if (action === "reject") {
      return `${baseMessage}\n\nTerima kasih atas minat Anda. [Pesan penolakan...]`;
    } else if (action === "pesan") {
      return `${baseMessage}\n\n[Pesan kustom...]`;
    }
    return "";
  };

  const openModal = (applicant, action) => {
    setSelectedApplicant(applicant);
    setModalAction(action);
    setMessage(getMessage(applicant, action));
    setIsModalOpen(true);
  };

  // --- FUNGSI UPDATE STATUS DENGAN API (Menggunakan useCallback DENGAN DEPENDENSI LENGKAP) ---
  const handleSendMessage = useCallback(async () => {
    if (!selectedApplicant) return;

    if (modalAction === "pesan") {
      alert(
        `Pesan untuk ${selectedApplicant.name} telah dikirim:\n\n"${message}"`
      );
      setIsModalOpen(false);
      return;
    }

    let newStatus, newStage;

    if (modalAction === "next") {
      const currentIndex = stageFlow.findIndex(
        (s) => s.status === selectedApplicant.status
      );
      const nextStage = stageFlow[currentIndex + 1];
      if (nextStage) {
        newStatus = nextStage.status;
        newStage = nextStage.stage;
      }
    } else if (modalAction === "accept") {
      newStatus = "accepted";
      newStage = "Accepted";
    } else if (modalAction === "reject") {
      newStatus = `rejected-at-${selectedApplicant.status}`;
      newStage = "Rejected";
    }

    if (!newStatus) {
      setIsModalOpen(false);
      return;
    }

    // 1. Optimistic UI Update (dengan pesan yang dikirim)
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === selectedApplicant.id
          ? { ...a, status: newStatus, stage: newStage }
          : a
      )
    );
    alert(
      `Pesan untuk ${selectedApplicant.name} telah dikirim dan status diubah!`
    );

    // 2. Kirim Update Status ke Backend
    try {
      await fetch(`${API_URL}/${selectedApplicant.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, stage: newStage }),
      });
    } catch (e) {
      console.error("Status update failed:", e);
      alert("Gagal memperbarui status di server. Data akan direfresh.");
      fetchApplicants();
    }

    setIsModalOpen(false);
  }, [selectedApplicant, modalAction, message, fetchApplicants]);
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
      {/* Catatan: Karena kita fetch data live, stats ini hanya menghitung dari data yang ter-fetch */}
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
                  {posisiOptions.map((posisi) => (
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
      <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm relative">
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
          <table className="w-full border-collapse">
            {/* Header Tabel */}
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Pelamar</th>
                <th className="p-3 text-center">Posisi</th>
                <th className="p-3 text-center">Tahap Seleksi</th>
                <th className="p-3 text-center">Progress</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-center">Tanggal Lamar</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>

            {/* Konten Tabel */}
            <tbody>
              {filteredApplicants.map((a, idx) => (
                <tr key={a.id} className="hover:bg-gray-50 transition relative">
                  {/* 1. Pelamar (Rata Kiri) */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={a.avatar}
                        alt={a.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-sm text-gray-500">{a.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Posisi (Rata Kiri) */}
                  <td className="p-3">
                    <p className="font-medium">{a.position}</p>
                    <p className="text-sm text-gray-500">{a.experience}</p>
                  </td>

                  {/* 3. Tahap Seleksi (Rata Kiri) */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(a.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                          a.status
                        )}`}
                      >
                        {a.stage}
                      </span>
                    </div>
                  </td>

                  {/* 4. Progress (Rata Kiri) */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
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

                  {/* 5. Score (EDITABLE INPUT dengan logika kondisional) */}
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
                      // Tampilkan 0 dan non-editable jika status di bawah Psikotes
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

                  {/* 6. Tanggal Lamar (Rata Kiri) */}
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDate(a.appliedDate)}
                    </div>
                  </td>

                  {/* 7. Aksi (Rata Kanan) */}
                  <td className="p-3 text-right relative overflow-visible">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => openModal(a, "next")}
                        className="p-1 rounded hover:bg-gray-100 transition"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(a, "accept")}
                        className="p-1 rounded bg-green-500/80 text-white hover:bg-green-600 transition"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(a, "reject")}
                        className="p-1 rounded bg-red-500/80 text-white hover:bg-red-600 transition"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>

                      {/* Menggunakan div relative inline-block untuk dropdown yang akurat */}
                      <div className="relative inline-block">
                        <Listbox>
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
                              className={`absolute right-0 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-50 ${
                                // Logika untuk menampilkan dropdown ke atas jika di baris terakhir
                                idx >= filteredApplicants.length - 1
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

                              <Listbox.Option
                                value="pesan"
                                onClick={() => openModal(a, "pesan")}
                                className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                              >
                                <MessageSquare className="h-4 w-4" /> Pesan
                              </Listbox.Option>
                            </Listbox.Options>
                          </Transition>
                        </Listbox>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Message modal */}
      {isModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {modalAction === "next" &&
                "Kirim pesan untuk lanjut ke tahap berikutnya"}
              {modalAction === "accept" && "Kirim pesan penerimaan"}
              {modalAction === "reject" && "Kirim pesan penolakan"}
              {modalAction === "pesan" && "Kirim pesan"}
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
