import React, { useState, Fragment } from "react";
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

// ✅ Placeholder for DetailModal component
// Replace this with your actual DetailModal.jsx file content
function DetailModal({ applicant, onClose }) {
  if (!applicant) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-bold">Detail Pelamar</h2>
        <div className="flex flex-col items-center">
          <img
            src={applicant.avatar}
            alt={applicant.name}
            className="w-24 h-24 rounded-full mb-4"
          />
          <h3 className="text-xl font-semibold">{applicant.name}</h3>
          <p className="text-gray-500">{applicant.email}</p>
        </div>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Posisi:</span> {applicant.position}
          </p>
          <p>
            <span className="font-medium">Lokasi:</span> {applicant.location}
          </p>
          <p>
            <span className="font-medium">Pengalaman:</span>{" "}
            {applicant.experience}
          </p>
          <p>
            <span className="font-medium">Tahap Seleksi:</span>{" "}
            {applicant.stage}
          </p>
          <p>
            <span className="font-medium">Skor:</span> {applicant.score}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Data dummy pelamar
const applicantsData = [
  {
    id: 1,
    name: "Ahmad Rizki Pratama",
    email: "ahmad.rizki@email.com",
    location: "Jakarta",
    position: "Frontend Developer",
    experience: "3 tahun",
    status: "under-review",
    stage: "Under Review",
    score: 85,
    appliedDate: "2024-01-15",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    name: "Sari Indah Permata",
    email: "sari.indah@email.com",
    location: "Bandung",
    position: "UI/UX Designer",
    experience: "2 tahun",
    status: "interview-hc",
    stage: "Interview HC",
    score: 92,
    appliedDate: "2024-01-12",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    location: "Surabaya",
    position: "Backend Developer",
    experience: "4 tahun",
    status: "psikotes",
    stage: "Psikotes",
    score: 88,
    appliedDate: "2024-01-10",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
  {
    id: 4,
    name: "Maya Putri Sari",
    email: "maya.putri@email.com",
    location: "Jakarta",
    position: "Product Manager",
    experience: "5 tahun",
    status: "rejected-at-final-interview",
    stage: "Ditolak",
    score: 95,
    appliedDate: "2024-01-08",
    avatar: "https://i.pravatar.cc/100?img=4",
  },
  {
    id: 5,
    name: "Joko Susilo",
    email: "joko.susilo@email.com",
    location: "Jakarta",
    position: "Frontend Developer",
    experience: "2 tahun",
    status: "accepted",
    stage: "Diterima",
    score: 90,
    appliedDate: "2024-01-05",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: 6,
    name: "Diah Kusuma",
    email: "diah.kusuma@email.com",
    location: "Bandung",
    position: "UI/UX Designer",
    experience: "1 tahun",
    status: "rejected-at-interview-hc",
    stage: "Ditolak",
    score: 75,
    appliedDate: "2024-01-01",
    avatar: "https://i.pravatar.cc/100?img=6",
  },
];

// ✅ Opsi dropdown status & posisi
const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "under-review", label: "Under Review" },
  { value: "interview-hc", label: "Interview HC" },
  { value: "psikotes", label: "Psikotes" },
  { value: "final-interview", label: "Final Interview" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
];

const posisiOptions = [
  { value: "", label: "Semua Posisi" },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "UI/UX Designer", label: "UI/UX Designer" },
  { value: "Product Manager", label: "Product Manager" },
];

// ✅ Mapping tahap seleksi
const stageFlow = [
  { status: "under-review", stage: "Under Review" },
  { status: "interview-hc", stage: "Interview HC" },
  { status: "psikotes", stage: "Psikotes" },
  { status: "final-interview", stage: "Final Interview" },
];

function Pelamar() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusOptions[0]);
  const [filterPosisi, setFilterPosisi] = useState(posisiOptions[0]);
  const [applicants, setApplicants] = useState(applicantsData);

  // ✅ Modal pesan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ State untuk modal detail
  const [isDetailModalOpen, setIsDetailModal] = useState(false);
  const [detailApplicant, setDetailApplicant] = useState(null);

  const openDetailModal = (applicant) => {
    setDetailApplicant(applicant);
    setIsDetailModal(true);
  };

  const closeDetailModal = () => {
    setIsDetailModal(false);
    setDetailApplicant(null);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(day)}/${parseInt(month)}/${year}`;
  };

  const getProgress = (status) => {
    const stageProgress = {
      "under-review": 25,
      "interview-hc": 50,
      "psikotes": 75,
      "final-interview": 100,
      "accepted": 100,
    };

    if (status.startsWith("rejected-at-")) {
      const rejectionStage = status.split("-")[2];
      const progress = stageProgress[rejectionStage];
      return progress || 0;
    }

    return stageProgress[status] || 0;
  };

  // ✅ FUNGSI BARU: Mendapatkan ikon berdasarkan status
  const getStatusIcon = (status) => {
    const icons = {
      "under-review": <Clock className="h-5 w-5 text-orange-500" />,
      "interview-hc": <User className="h-5 w-5 text-blue-500" />,
      "psikotes": <AlertCircle className="h-5 w-5 text-purple-500" />,
      "final-interview": <TrendingUp className="h-5 w-5 text-green-500" />,
      "accepted": <Check className="h-5 w-5 text-green-600" />,
      "rejected": <XCircle className="h-5 w-5 text-red-600" />,
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
      a.score,
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

  // ✅ FUNGSI BARU: Simulasi download CV
  const handleDownloadCV = (applicant) => {
    // Simulates a CV download by creating a simple text file
    const cvContent = `CV for ${applicant.name}\n\nEmail: ${applicant.email}\nPosition: ${applicant.position}\nExperience: ${applicant.experience}\n\nThis is a mock CV file.`;
    const blob = new Blob([cvContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `CV-${applicant.name.replace(/\s/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ✅ UPDATE DI SINI: tambahkan pesan spesifik untuk setiap tahapan
  const getMessage = (applicant, action) => {
    const baseMessage = `Halo ${applicant.name}, ini adalah pesan dari tim rekrutmen.`;
    if (action === "next") {
      const currentIndex = stageFlow.findIndex(
        (s) => s.status === applicant.status
      );
      const nextStage = stageFlow[currentIndex + 1];
      if (nextStage) {
        return `${baseMessage}\n\nSelamat! Anda telah lolos ke tahap ${nextStage.stage}. Silakan tunggu informasi selanjutnya.`;
      }
    } else if (action === "accept") {
      return `${baseMessage}\n\nSelamat! Anda telah diterima untuk posisi ${applicant.position}. Tim HR akan menghubungi Anda segera.`;
    } else if (action === "reject") {
      return `${baseMessage}\n\nTerima kasih atas minat Anda. Mohon maaf, untuk saat ini Anda belum dapat melanjutkan ke tahap selanjutnya.`;
    } else if (action === "pesan") {
      switch (applicant.status) {
        case "under-review":
          return `${baseMessage}\n\nSaat ini, kami sedang meninjau aplikasi Anda untuk posisi ${applicant.position}. Kami akan segera menghubungi Anda untuk langkah selanjutnya.`;
        case "interview-hc":
          return `${baseMessage}\n\nJadwal interview dengan tim HR untuk posisi ${applicant.position} telah ditetapkan. Silakan cek email Anda untuk detail lebih lanjut.`;
        case "psikotes":
          return `${baseMessage}\n\nKami mengundang Anda untuk mengikuti tes psikotes sebagai bagian dari proses seleksi untuk posisi ${applicant.position}. Detail tes akan dikirimkan melalui email.`;
        case "final-interview":
          return `${baseMessage}\n\nSelamat! Anda telah mencapai tahap final interview untuk posisi ${applicant.position}. Silakan bersiap, tim terkait akan segera menghubungi Anda.`;
        case "accepted":
          return `${baseMessage}\n\nSelamat! Anda telah resmi diterima di perusahaan kami untuk posisi ${applicant.position}. Tim HR akan segera menghubungi Anda untuk proses onboarding.`;
        case "rejected":
          return `${baseMessage}\n\nTerima kasih atas waktu dan usaha Anda. Setelah evaluasi, kami mohon maaf, saat ini Anda belum dapat melanjutkan ke tahap berikutnya untuk posisi ${applicant.position}. Semoga berhasil di kesempatan lain!`;
        default:
          return `${baseMessage}\n\nInformasi terbaru mengenai status lamaran Anda untuk posisi ${applicant.position} akan segera kami beritahukan.`;
      }
    }
    return "";
  };

  const openModal = (applicant, action) => {
    setSelectedApplicant(applicant);
    setModalAction(action);
    setMessage(getMessage(applicant, action));
    setIsModalOpen(true);
  };

  const handleSendMessage = () => {
    if (!selectedApplicant) return;

    // ✅ Tangani aksi "pesan" tanpa mengubah state
    if (modalAction === "pesan") {
      alert(`Pesan untuk ${selectedApplicant.name} telah dikirim:\n\n"${message}"`);
      setIsModalOpen(false);
      return; // Keluar dari fungsi
    }

    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== selectedApplicant.id) return a;

        if (modalAction === "next") {
          const currentIndex = stageFlow.findIndex(
            (s) => s.status === a.status
          );
          const nextStage = stageFlow[currentIndex + 1];
          if (nextStage) {
            return {
              ...a,
              status: nextStage.status,
              stage: nextStage.stage,
            };
          }
        }

        if (modalAction === "accept") {
          return { ...a, status: "accepted", stage: "Diterima" };
        }

        if (modalAction === "reject") {
          const rejectionStatus = `rejected-at-${a.status}`;
          return { ...a, status: rejectionStatus, stage: "Ditolak" };
        }

        return a;
      })
    );

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* ✅ Header Stats */}
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

      {/* ✅ Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 ">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari pelamar..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Listbox */}
          <Listbox value={filterStatus} onChange={setFilterStatus}>
            <div className="relative w-44">
              <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500">
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
              <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm truncate focus:outline-none focus:ring-1 focus:ring-sky-500">
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
          className="px-4 py-2 flex items-center gap-2 border rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {/* ✅ Table */}
      <div className="border border-gray-300 rounded-xl overflow-visible bg-white shadow-sm relative">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Pelamar</th>
              <th className="p-3">Posisi</th>
              <th className="p-3">Tahap Seleksi</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Score</th>
              <th className="p-3">Tanggal Lamar</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map((a, idx) => (
              <tr key={a.id} className="hover:bg-gray-50 transition relative">
                <td className="p-2">
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
                <td className="p-3">
                  <p className="font-medium">{a.position}</p>
                  <p className="text-sm text-gray-500">{a.experience}</p>
                </td>

                {/* ✅ PERUBAHAN DI SINI: Ganti teks dengan ikon dan label */}
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
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      a.score >= 85
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {a.score}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(a.appliedDate)}
                  </div>
                </td>

                {/* ✅ Dropdown aksi dengan posisi otomatis */}
                <td className="p-3 text-right relative overflow-visible">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(a, "next")}
                      className="p-1 border rounded hover:bg-gray-100 transition"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal(a, "accept")}
                      className="p-1 border rounded text-green-600 hover:bg-green-50 transition"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal(a, "reject")}
                      className="p-1 border rounded text-red-600 hover:bg-red-50 transition"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>

                    <Listbox>
                      <div className="relative">
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
                              idx === filteredApplicants.length - 1
                                ? "bottom-full mb-2"
                                : "mt-2"
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
                              value="pesan"
                              onClick={() => openModal(a, "pesan")}
                              className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                            >
                              <MessageSquare className="h-4 w-4" /> Pesan
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

      {/* ✅ Modal pesan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {modalAction === "next" && "Kirim pesan untuk lanjut ke tahap berikutnya"}
              {modalAction === "accept" && "Kirim pesan penerimaan"}
              {modalAction === "reject" && "Kirim pesan penolakan"}
              {modalAction === "pesan" && "Kirim pesan"}
            </h2>
            <textarea
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
              rows="4"
              placeholder="Tulis pesan untuk pelamar..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Detail Modal */}
      {isDetailModalOpen && (
        <DetailModal applicant={detailApplicant} onClose={closeDetailModal} />
      )}
    </div>
  );
}

export default Pelamar;