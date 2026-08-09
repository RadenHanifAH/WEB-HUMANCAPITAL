import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance"; // ✅ sesuaikan jika beda
import { usePelamar } from "./hooks/usePelamar";
import { statusOptions, API_APPLICANTS } from "./utils/constants";
import { downloadFileFromUrl } from "./utils/helpers";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import StatCards from "./components/StatCards";
import FilterBar from "./components/FilterBar";
import ApplicantTable from "./components/ApplicantTable";
import DetailModal from "./components/DetailModal";

const STATUS_TO_BACKEND = {
  screaning: "Screaning",
  "interview-pertama": "Interview Pertama",
  psikotes: "Psikotes",
  "interview-kedua": "Interview Kedua",
  offering: "Final Result",
  accepted: "Diterima",
  rejected: "Ditolak",
};

function Pelamar() {
  const {
    applicants,
    setApplicants,
    jobPositions,
    loading,
    error,
    fetchApplicants,
  } = usePelamar();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusOptions[0]);
  const [filterPosisi, setFilterPosisi] = useState(jobPositions[0]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterPosisi]);

  const filteredApplicants = (applicants || []).filter((a) => {
    const name = String(a?.pengguna?.nama || a?.name || "");
    const status = String(a?.status || "");
    const position = String(a?.lowongan?.judul || a?.position || "");

    const matchName = name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus.value === "rejected"
        ? status.toLowerCase().startsWith("rejected") || status.toLowerCase().startsWith("ditolak")
        : filterStatus.value
          ? status === filterStatus.value
          : true;

    const matchPosisi = filterPosisi.value
      ? position === filterPosisi.value
      : true;

    return matchName && matchStatus && matchPosisi;
  });

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const updateApplicantStatus = async (
    applicantId,
    newStatusForBackend,
    applicantName,
  ) => {
    const loadingToast = toast.loading(
      `Memperbarui status ${applicantName}...`,
    );

    try {
      await axiosInstance.put(`${API_APPLICANTS}/${applicantId}/status`, {
        status: newStatusForBackend,
      });

      toast.success(`Status ${applicantName} berhasil diubah`, {
        id: loadingToast,
      });
      fetchApplicants();
    } catch (e) {
      toast.error(`Gagal update status: ${e?.message || "error"}`, {
        id: loadingToast,
      });
    }
  };

  // ✅ MessageModal dihapus: sekarang "accepted" & "rejected" langsung
  // memanggil updateApplicantStatus juga, sama seperti status lainnya,
  // tanpa popup pesan konfirmasi.
  const handleStatusUpdate = async (applicant, newStatusValue) => {
    if (!applicant) return;

    const newStatusForBackend =
      STATUS_TO_BACKEND[newStatusValue] || newStatusValue;

    await updateApplicantStatus(
      applicant.id,
      newStatusForBackend,
      applicant.pengguna?.nama || applicant.name,
    );
  };

  // ✅ handler untuk tombol "Acc" di DetailModal (Screening -> Interview Pertama, dst).
  const handleAccFromDetail = async (
    applicant,
    fromKey,
    toKey,
    backendStatus,
  ) => {
    if (!applicant?.id) return;

    const loadingToast = toast.loading(
      `Menyimpan perubahan tahap ${applicant.pengguna?.nama || applicant.name}...`,
    );

    try {
      const res = await axiosInstance.put(
        `${API_APPLICANTS}/${applicant.id}/status`,
        { status: backendStatus },
      );

      // Backend (updateStatus controller) mengembalikan { message, data: updatedApplication }
      const updated = res?.data?.data;
      const newStatus = updated?.status ?? backendStatus;
      const newStage = updated?.stage ?? backendStatus;

      // Sinkronkan list applicants (dipakai ApplicantTable, StatCards, dst)
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id
            ? { ...a, status: newStatus, stage: newStage }
            : a,
        ),
      );

      // ✅ Sinkronkan applicant yang sedang dibuka di DetailModal.
      setSelectedDetail((prev) =>
        prev && prev.id === applicant.id
          ? { ...prev, status: newStatus, stage: newStage }
          : prev,
      );

      toast.success(`${applicant.pengguna?.nama || applicant.name} berhasil maju ke tahap ${newStage}`, {
        id: loadingToast,
      });

      // Refetch di background supaya data benar-benar sinkron dengan DB.
      fetchApplicants();
    } catch (e) {
      console.error("Gagal ACC dari DetailModal:", e);
      toast.error(
        `Gagal menyimpan perubahan tahap: ${e?.response?.data?.message || e?.message || "error"}`,
        { id: loadingToast },
      );
    }
  };

  // ✅ NEW: helper generik untuk tombol Tolak / Terima di DetailModal.
  // Sama pola-nya dengan handleAccFromDetail (update list + selectedDetail
  // + toast), tapi backendStatus-nya langsung "Ditolak" / "Diterima"
  // (bukan nama stage), sesuai yang dikenali updateApplicationStatus di
  // application.service.js.
  const handleStatusChangeFromDetail = async (
    applicant,
    backendStatus,
    successLabel,
  ) => {
    if (!applicant?.id) return;

    const applicantName = applicant.pengguna?.nama || applicant.name;
    const loadingToast = toast.loading(
      `Menyimpan perubahan ${applicantName}...`,
    );

    try {
      // 1. Update status lamaran menjadi Diterima / Ditolak
      const res = await axiosInstance.put(
        `${API_APPLICANTS}/${applicant.id}/status`,
        { status: backendStatus },
      );

      // 2. Pindahkan ke arsip secara manual (panggil endpoint baru)
      await axiosInstance.post(`/archives/archive/${applicant.id}`);

      const updated = res?.data?.data;
      const newStatus = updated?.status ?? backendStatus;
      const newStage = updated?.stage ?? backendStatus;

      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id
            ? { ...a, status: newStatus, stage: newStage }
            : a,
        ),
      );

      // Tutup modal langsung setelah berhasil ditolak/diterima
      setSelectedDetail(null);

      toast.success(`${applicantName} ${successLabel} & dipindahkan ke arsip`, {
        id: loadingToast,
      });

      fetchApplicants();
    } catch (e) {
      console.error("Gagal update status dari DetailModal:", e);
      toast.error(
        `Gagal menyimpan perubahan: ${e?.response?.data?.message || e?.message || "error"}`,
        { id: loadingToast },
      );
    }
  };

  // ✅ NEW: tombol "Tolak" — tersedia mulai stage Screaning s.d. Interview
  // Kedua, dan juga muncul (berdampingan dengan Terima) di stage Final
  // Result. Lihat DetailModal.jsx bagian kartu "Aksi".
  const handleRejectFromDetail = (applicant) =>
    handleStatusChangeFromDetail(applicant, "Ditolak", "berhasil ditolak");

  // ✅ NEW: tombol "Terima" — hanya muncul di stage Final Result.
  const handleAcceptFromDetail = (applicant) =>
    handleStatusChangeFromDetail(applicant, "Diterima", "berhasil diterima");

  const handleDownloadCV = (a) => {
    const url = a?.cvDownloadUrl;
    if (!url) return toast.error(`CV ${a?.pengguna?.nama || a?.name} tidak ditemukan`);
    downloadFileFromUrl(url, `CV_${a?.pengguna?.nama || "pelamar"}.pdf`);
  };

  const handleDownloadPortfolio = (a) => {
    const url = a?.portfolioDownloadUrl;
    if (!url)
      return toast.error(`Portofolio ${a?.pengguna?.nama || a?.name} tidak tersedia.`);
    downloadFileFromUrl(
      url,
      `Portofolio_${a?.pengguna?.nama || "pelamar"}.pdf`,
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-900">Manajemen Pelamar</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error Sistem</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <StatCards applicants={applicants} />

      <FilterBar
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPosisi={filterPosisi}
        setFilterPosisi={setFilterPosisi}
        jobPositions={jobPositions}
        filteredApplicants={filteredApplicants}
        loading={loading}
      />

      <div className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-visible">
        <ApplicantTable
          loading={loading}
          applicants={currentApplicants}
          setApplicants={setApplicants}
          onDetail={setSelectedDetail}
          onDownloadCV={handleDownloadCV}
          onDownloadPortofolio={handleDownloadPortfolio}
          onOpenStatusModal={handleStatusUpdate}
        />

        {!loading && filteredApplicants.length > 0 && (
          <div className="flex items-center justify-center py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-md">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sky-900"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sky-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    totalPages <= 5 ||
                    (pageNum >= currentPage - 1 &&
                      pageNum <= currentPage + 1) ||
                    pageNum === 1 ||
                    pageNum === totalPages
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-sky-600 text-white"
                            : "text-gray-500 hover:bg-white hover:border-gray-200 border border-transparent hover:text-sky-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="text-gray-400 px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sky-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sky-900"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedDetail && (
        <DetailModal
          applicant={selectedDetail}
          profile={selectedDetail.profile}
          onClose={() => setSelectedDetail(null)}
          onAcc={handleAccFromDetail}
          onReject={handleRejectFromDetail}
          onAccept={handleAcceptFromDetail}
        />
      )}
    </div>
  );
}

export default Pelamar;