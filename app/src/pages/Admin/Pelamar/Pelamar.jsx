import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { usePelamar } from "./hooks/usePelamar";
import { statusOptions, API_URL_APPLICANTS } from "./utils/constants";
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
import MessageModal from "./components/MessageModal";

// ✅ mapping dari value dropdown -> status yang dikirim ke backend
// PENTING: backend akan set stage mengikuti status.
const STATUS_TO_BACKEND = {
  screaning: "Screaning",
  "interview-hc": "Interview HC",

  // ✅ walau UI tampil "Psikotes/Technical Test", backend tetap terima "Psikotes"
  psikotes: "Psikotes",

  "final-interview": "Final Interview",
  offering: "Offering/Final Result",
  accepted: "Accepted",
  rejected: "Rejected",
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

  // Filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusOptions[0]);
  const [filterPosisi, setFilterPosisi] = useState(jobPositions[0]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal detail
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Modal accept/reject + pesan
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    applicant: null,
    action: null,
    status: "",
  });

  // reset page kalau filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterPosisi]);

  // 1) Filter
  const filteredApplicants = (applicants || []).filter((a) => {
    const name = String(a?.name || "");
    const status = String(a?.status || "");
    const position = String(a?.position || "");

    const matchName = name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus.value === "rejected"
        ? status.toLowerCase().startsWith("rejected")
        : filterStatus.value
        ? status === filterStatus.value
        : true;

    const matchPosisi = filterPosisi.value
      ? position === filterPosisi.value
      : true;

    return matchName && matchStatus && matchPosisi;
  });

  // 2) Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ✅ helper update status (tanpa kirim stage!)
  const updateApplicantStatus = async (
    applicantId,
    newStatusForBackend,
    applicantName
  ) => {
    const loadingToast = toast.loading(`Memperbarui status ${applicantName}...`);

    try {
      const response = await fetch(`${API_URL_APPLICANTS}/${applicantId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatusForBackend }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} - ${text}`);
      }

      toast.success(`Status ${applicantName} berhasil diubah`, { id: loadingToast });
      fetchApplicants();
    } catch (e) {
      toast.error(`Gagal update status: ${e.message}`, { id: loadingToast });
    }
  };

  // 3) Update Status (trigger dari dropdown di table)
  const handleStatusUpdate = async (applicant, newStatusValue) => {
    if (!applicant) return;

    // ✅ Konversi dropdown value -> status untuk backend
    const newStatusForBackend = STATUS_TO_BACKEND[newStatusValue] || newStatusValue;

    // accepted/rejected pakai modal (kirim pesan)
    if (newStatusValue === "accepted") {
      setModalData({ applicant, action: "accept", status: newStatusForBackend });
      setIsMessageModalOpen(true);
      return;
    }

    if (newStatusValue === "rejected") {
      setModalData({ applicant, action: "reject", status: newStatusForBackend });
      setIsMessageModalOpen(true);
      return;
    }

    // status proses langsung update
    await updateApplicantStatus(applicant.id, newStatusForBackend, applicant.name);
  };

  // ✅ Download CV dari DB (endpoint /file?type=cv)
  const handleDownloadCV = (a) => {
    if (!a?.cvDownloadUrl) return toast.error(`CV ${a?.name} tidak ditemukan`);

    const finalUrl = a.cvDownloadUrl.startsWith("http")
      ? a.cvDownloadUrl
      : `http://localhost:4000${a.cvDownloadUrl}`;

    window.open(finalUrl, "_blank");
  };

  // ✅ Download Portofolio dari DB (endpoint /file?type=portfolio)
  const handleDownloadPortfolio = (a) => {
    if (!a?.portfolioDownloadUrl)
      return toast.error(`Portofolio ${a?.name} tidak tersedia.`);

    const finalUrl = a.portfolioDownloadUrl.startsWith("http")
      ? a.portfolioDownloadUrl
      : `http://localhost:4000${a.portfolioDownloadUrl}`;

    window.open(finalUrl, "_blank");
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
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1) ||
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
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
        />
      )}

      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          data={modalData}
          onSuccess={() => {
            setIsMessageModalOpen(false);
            fetchApplicants();
            toast.success("Pesan berhasil dikirim dan status diperbarui");
          }}
        />
      )}
    </div>
  );
}

export default Pelamar;
