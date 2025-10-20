import React, { useState, Fragment } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  MapPin,
  X,
  ChevronDown,
  Check,
  CheckCircle, 
  ChevronsLeft, // Icon <<
  ChevronLeft, // Icon <
  ChevronRight, // Icon >
  ChevronsRight, // Icon >>
  Trash2, // Icon untuk Delete
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";

// Batasan jumlah jadwal per halaman
const ITEMS_PER_PAGE = 3;

// Dummy data kandidat
const applicantsData = [
  {
    id: 1,
    name: "Ahmad Rizki Pratama",
    position: "Frontend Developer",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    name: "Sari Indah Permata",
    position: "UI/UX Designer",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: 3,
    name: "Budi Santoso",
    position: "Backend Developer",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
  {
    id: 4,
    name: "Dewi Melati",
    position: "Marketing Manager",
    avatar: "https://i.pravatar.cc/100?img=4",
  },
  {
    id: 5,
    name: "Fajar Gemilang",
    position: "Product Manager",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  // Tambahan data dummy agar paginasi terlihat
  { id: 6, name: "Gita Cahaya", position: "Data Analyst", avatar: "https://i.pravatar.cc/100?img=6", status: "scheduled", isCompleted: false },
  { id: 7, name: "Hadi Kusuma", position: "DevOps Engineer", avatar: "https://i.pravatar.cc/100?img=7", status: "scheduled", isCompleted: false },
  { id: 8, name: "Indra Wijaya", position: "Software Tester", avatar: "https://i.pravatar.cc/100?img=8", status: "scheduled", isCompleted: false },
];

// Dummy tipe interview
const interviewTypes = ["Interview HC", "Final Interview", "Psikotes"];

// Fungsi utilitas untuk mendapatkan kelas warna berdasarkan tipe interview
const getColorsForType = (type) => {
  // Card selalu putih dengan border abu-abu
  const neutralCardStyle = {
    cardBg: "bg-white border-gray-300",
  };

  switch (type) {
    case "Interview HC":
      return {
        ...neutralCardStyle,
        badgeBg: "bg-blue-200",
        badgeText: "text-blue-700",
      };
    case "Final Interview":
      return {
        ...neutralCardStyle,
        badgeBg: "bg-green-200",
        badgeText: "text-green-700",
      };
    case "Psikotes":
      return {
        ...neutralCardStyle,
        badgeBg: "bg-purple-200",
        badgeText: "text-purple-700",
      };
    default:
      return {
        ...neutralCardStyle,
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-700",
      };
  }
};

function Schedule() {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      applicantName: "Ahmad Rizki Pratama",
      position: "Frontend Developer",
      type: "Interview HC",
      date: "2024-01-20",
      time: "10:00",
      duration: "60 menit",
      location: "Meeting Room A",
      status: "scheduled",
      avatar: "https://i.pravatar.cc/100?img=1",
      isCompleted: false, // Status baru: apakah sudah dikonfirmasi selesai
    },
    {
      id: 2,
      applicantName: "Sari Indah Permata",
      position: "UI/UX Designer",
      type: "Final Interview",
      date: "2024-01-22",
      time: "14:00",
      duration: "90 menit",
      location: "Video Call",
      status: "scheduled", 
      avatar: "https://i.pravatar.cc/100?img=2",
      isCompleted: false,
    },
    {
      id: 3,
      applicantName: "Budi Santoso",
      position: "Backend Developer",
      type: "Psikotes",
      date: "2024-01-25",
      time: "09:00",
      duration: "120 menit",
      location: "Meeting Room B",
      status: "scheduled",
      avatar: "https://i.pravatar.cc/100?img=3",
      isCompleted: false,
    },
    { // Item ke-4
        id: 4,
        applicantName: "Dewi Melati",
        position: "Marketing Manager",
        type: "Interview HC",
        date: "2024-01-26",
        time: "11:00",
        duration: "45 menit",
        location: "Video Call",
        status: "scheduled",
        avatar: "https://i.pravatar.cc/100?img=4",
        isCompleted: false,
    },
    { // Item ke-5
        id: 5,
        applicantName: "Fajar Gemilang",
        position: "Product Manager",
        type: "Final Interview",
        date: "2024-01-28",
        time: "16:00",
        duration: "60 menit",
        location: "Meeting Room C",
        status: "scheduled",
        avatar: "https://i.pravatar.cc/100?img=5",
        isCompleted: false,
    },
    { // Item ke-6
        id: 6,
        applicantName: "Gita Cahaya",
        position: "Data Analyst",
        type: "Psikotes",
        date: "2024-01-29",
        time: "10:00",
        duration: "90 menit",
        location: "Video Call",
        status: "scheduled",
        avatar: "https://i.pravatar.cc/100?img=6",
        isCompleted: false,
    },
    { // Item ke-7
        id: 7,
        applicantName: "Hadi Kusuma",
        position: "DevOps Engineer",
        type: "Interview HC",
        date: "2024-01-30",
        time: "13:00",
        duration: "60 menit",
        location: "Meeting Room A",
        status: "scheduled",
        avatar: "https://i.pravatar.cc/100?img=7",
        isCompleted: false,
    },
    { // Item ke-8
        id: 8,
        applicantName: "Indra Wijaya",
        position: "Software Tester",
        type: "Final Interview",
        date: "2024-01-31",
        time: "15:00",
        duration: "60 menit",
        location: "Meeting Room B",
        status: "scheduled",
        avatar: "https://i.pravatar.cc/100?img=8",
        isCompleted: false,
    },
  ]);

  const [selectedDate, setSelectedDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    candidate: null,
    type: null,
    date: "",
    time: "",
    location: "",
  });
  
  // State untuk melacak halaman saat ini (PAGINASI)
  const [currentPage, setCurrentPage] = useState(1);

  // Filter jadwal
  const filteredSchedules = schedules.filter((schedule) => {
    const matchDate = selectedDate ? schedule.date === selectedDate : true;
    const matchType =
      typeFilter === "all" ? true : schedule.type === typeFilter;
    return matchDate && matchType;
  });
  
  // Logika Pagination
  const totalPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  // Jadwal yang akan ditampilkan di halaman saat ini
  const schedulesToDisplay = filteredSchedules.slice(startIndex, endIndex);


  // Logika untuk mendapatkan rentang tombol paginasi numerik (max 5 tombol)
  const getPaginationRange = () => {
    if (totalPages <= 5) {
        return [...Array(totalPages)].map((_, i) => i + 1);
    }
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        end = 5;
    } else if (currentPage > totalPages - 2) {
        start = totalPages - 4;
    }
    
    // Pastikan range tidak melebihi totalPages
    start = Math.max(1, start);
    end = Math.min(totalPages, end);

    const range = [];
    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
  };


  // Submit form
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (
      !newSchedule.candidate ||
      !newSchedule.type ||
      !newSchedule.date ||
      !newSchedule.time
    ) {
      document.getElementById('missing-fields-message').classList.remove('hidden');
      return;
    }

    const nextId =
      schedules.length > 0 ? Math.max(...schedules.map((s) => s.id)) + 1 : 1;
    const newScheduleObject = {
      id: nextId,
      applicantName: newSchedule.candidate.name,
      position: newSchedule.candidate.position,
      type: newSchedule.type,
      date: newSchedule.date,
      time: newSchedule.time,
      duration: "60 menit",
      location: newSchedule.location || "Meeting Room A",
      status: "scheduled",
      avatar: newSchedule.candidate.avatar,
      isCompleted: false,
    };

    setSchedules([newScheduleObject, ...schedules]);
    setShowForm(false);
    setNewSchedule({
      candidate: null,
      type: null,
      date: "",
      time: "",
      location: "",
    });
    // Reset ke halaman 1 setelah menambah jadwal baru
    setCurrentPage(1);
  };
  
  // FUNGSI Konfirmasi Jadwal Selesai
  const handleComplete = (id) => {
      setSchedules(prevSchedules => 
          prevSchedules.map(schedule => 
              schedule.id === id 
                  ? { ...schedule, isCompleted: true } 
                  : schedule
          )
      );
  };
  
  // FUNGSI Hapus Jadwal
  const handleDelete = (id) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
          setSchedules(prevSchedules => 
              prevSchedules.filter(schedule => schedule.id !== id)
          );
          // Pindah ke halaman 1 jika item terakhir di halaman saat ini dihapus
          if (schedulesToDisplay.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
          }
      }
  };
  
  // Handler untuk navigasi halaman
  const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
      }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
             <h1 className="text-2xl font-semibold text-sky-900 mb-3">
          Jadwal Interview
        </h1>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tanggal */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
              }}
              className="border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 px-3 py-2 text-sm pl-9 transition-colors"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          {/* Filter Tipe Interview (Listbox) */}
          <Listbox value={typeFilter} onChange={(val) => {
            setTypeFilter(val);
            setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
          }}>
            {({ open }) => (
              <div className="relative w-44">
                <Listbox.Button 
                  className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors">
                  <span>
                    {typeFilter === "all" ? "Semua Tipe" : typeFilter}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-60 overflow-auto">
                    {[
                      { value: "all", label: "Semua Tipe" },
                      ...interviewTypes.map((t) => ({ value: t, label: t })),
                    ].map((option) => (
                      <Listbox.Option key={option.value} value={option.value}>
                        {({ active, selected }) => (
                          <div
                            className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
                              active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                            }`}
                          >
                            <span>{option.label}</span>
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
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg text-white font-semibold transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Jadwalkan Interview
        </button>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedulesToDisplay.length > 0 ? (
          schedulesToDisplay.map((schedule) => {
            // Mengambil kelas warna yang sesuai
            const { cardBg, badgeBg, badgeText } = getColorsForType(schedule.type);
            const isCompleted = schedule.isCompleted;

            return (
              <div
                key={schedule.id}
                className={`border rounded-xl p-4 shadow-sm transition-colors ${cardBg}`}
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={schedule.avatar}
                    alt={schedule.applicantName}
                    className="h-14 w-14 rounded-full object-cover shadow-sm"
                  />
                  <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex-1">
                      <h4 className={`font-semibold text-xl ${isCompleted ? 'text-gray-600' : 'text-gray-800'}`}>
                        {schedule.applicantName}
                      </h4>
                      <p className="text-sm text-gray-500">{schedule.position}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <span
                          // Menerapkan kelas warna dinamis ke BADGE
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${badgeBg} ${badgeText}`}
                        >
                          {schedule.type}
                        </span>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-sm mt-2 sm:mt-0 ${
                          isCompleted ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {/* Mengganti status menjadi Dikonfirmasi jika selesai */}
                      {isCompleted ? 'Dikonfirmasi' : 'Dijadwalkan'}
                    </span>
                  </div>
                </div>
                
                {/* Detail Schedule dan Tombol Aksi */}
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200">
                    
                    {/* Detail Schedule */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm w-full max-w-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          {new Date(schedule.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {schedule.time} WIB {/* Menghilangkan durasi dan menambahkan WIB */}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        {schedule.location.includes("Video") ? (
                          <Video className="h-4 w-4 text-gray-500" />
                        ) : (
                          <MapPin className="h-4 w-4 text-gray-500" />
                        )}
                        <span>{schedule.location}</span>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex gap-2 items-center flex-shrink-0">
                        {/* Tombol Hapus */}
                        <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                            title="Hapus Jadwal"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        
                        {/* Tombol Konfirmasi Selesai */}
                        {!isCompleted && (
                            <button
                                onClick={() => handleComplete(schedule.id)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg shadow-sm transition-colors text-xs font-medium"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Konfirmasi Selesai
                            </button>
                        )}
                    </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-10">
            Tidak ada jadwal interview yang ditemukan.
          </div>
        )}
      </div>

      {/* Paginasi (Navigasi Tombol + Numerik) */}
      {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
              
              {/* Tombol First Page (<<) */}
              <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-gray-300 ${
                      currentPage === 1 ? "text-gray-400 cursor-not-allowed bg-gray-50" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                  <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Tombol Previous Page (<) */}
              <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-gray-300 ${
                      currentPage === 1 ? "text-gray-400 cursor-not-allowed bg-gray-50" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                  <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Tombol Numerik (1 2 3...) */}
              {getPaginationRange().map((pageNumber) => (
                  <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-10 h-10 rounded-full font-medium transition-colors border border-gray-300 ${
                          currentPage === pageNumber
                              ? "bg-sky-700 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                      {pageNumber}
                  </button>
              ))}
              
              {/* Tombol Next Page (>) */}
              <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-gray-300 ${
                      currentPage === totalPages ? "text-gray-400 cursor-not-allowed bg-gray-50" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                  <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Tombol Last Page (>>) */}
              <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border border-gray-300 ${
                      currentPage === totalPages ? "text-gray-400 cursor-not-allowed bg-gray-50" : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                  <ChevronsRight className="w-4 h-4" />
              </button>
          </div>
      )}


      {/* Form Jadwal Baru */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Jadwalkan Interview Baru</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-sky-800" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Buat jadwal interview untuk kandidat
            </p>
            {/* Message box for missing fields */}
            <div id="missing-fields-message" className="hidden mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
              Semua field harus diisi.
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {/* Dropdown kandidat */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kandidat <span className="text-red-500">*</span>
                </label>
                <Listbox
                  value={newSchedule.candidate}
                  onChange={(val) =>
                    setNewSchedule({ ...newSchedule, candidate: val })
                  }
                >
                  {({ open }) => (
                    <div className="relative mt-1">
                      <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                        <span className="block truncate">
                          {newSchedule.candidate
                            ? newSchedule.candidate.name
                            : "Pilih kandidat"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}/>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-60 overflow-auto">
                          {applicantsData.map((applicant) => (
                            <Listbox.Option
                              key={applicant.id}
                              value={applicant}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-sky-100 text-sky-900"
                                    : "text-gray-900"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {applicant.name}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                      <Check className="h-5 w-5" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  )}
                </Listbox>
              </div>

              {/* Dropdown tipe interview */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipe Interview <span className="text-red-500">*</span>
                </label>
                <Listbox
                  value={newSchedule.type}
                  onChange={(val) =>
                    setNewSchedule({ ...newSchedule, type: val })
                  }
                >
                  {({ open }) => (
                    <div className="relative mt-1">
                      <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                        <span className="block truncate">
                          {newSchedule.type || "Pilih tipe"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}/>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm max-h-60 overflow-auto">
                          {interviewTypes.map((type) => (
                            <Listbox.Option
                              key={type}
                              value={type}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-sky-100 text-sky-900"
                                    : "text-gray-900"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {type}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-600">
                                      <Check className="h-5 w-5" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  )}
                </Listbox>
              </div>

              {/* Input tanggal & waktu */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      className="border border-gray-300 shadow rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                      value={newSchedule.date}
                      onChange={(e) =>
                        setNewSchedule({ ...newSchedule, date: e.target.value })
                      }
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Waktu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="time"
                      className="border border-gray-300 shadow rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                      value={newSchedule.time}
                      onChange={(e) =>
                        setNewSchedule({ ...newSchedule, time: e.target.value })
                      }
                    />
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    placeholder="Meeting Room atau Video Call"
                    className="border border-gray-300 shadow rounded-lg px-3 py-2 text-sm w-full pl-9 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                    value={newSchedule.location}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        location: e.target.value,
                      })
                    }
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-1 focus:ring-sky-500/30 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600 text-sm"
                >
                  Jadwalkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;