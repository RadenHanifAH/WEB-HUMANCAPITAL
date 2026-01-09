import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { usePelamar } from "./hooks/usePelamar";
import { statusOptions, API_URL_APPLICANTS } from "./utils/constants";
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
import MessageModal from "./components/MessageModal";

// ✅ mapping dari value dropdown -> status yang dikirim ke backend
// PENTING: backend akan set stage mengikuti status.
// Jadi untuk proses seleksi, kirim nama stage persis seperti timeline user.
const STATUS_TO_BACKEND = {
  "under-review": "Under Review",
  "interview-hc": "Interview HC",
  psikotes: "Psikotes",
  "final-interview": "Final Interview",
  offering: "Offering/Final Result",
  accepted: "Accepted",
  rejected: "Rejected",
};

function Pelamar() {
  const { applicants, setApplicants, jobPositions, loading, error, fetchApplicants } =
    usePelamar();

  // Filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(statusOptions[0]);
  const [filterPosisi, setFilterPosisi] = useState(jobPositions[0]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    applicant: null,
    action: null,
    status: "",
  });

  // 1) Filter
  const filteredApplicants = applicants.filter((a) => {
    const matchName = a.name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus.value === "rejected"
        ? a.status?.toLowerCase().startsWith("rejected")
        : filterStatus.value
        ? a.status === filterStatus.value
        : true;

    const matchPosisi = filterPosisi.value ? a.position === filterPosisi.value : true;

    return matchName && matchStatus && matchPosisi;
  });

  // 2) Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterPosisi]);

  // ✅ helper update status (tanpa kirim stage!)
  const updateApplicantStatus = async (applicantId, newStatusForBackend, applicantName) => {
    const loadingToast = toast.loading(`Memperbarui status ${applicantName}...`);

    try {
      const response = await fetch(`${API_URL_APPLICANTS}/${applicantId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // ✅ HANYA KIRIM status
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

  // 3) Update Status
  const handleStatusUpdate = async (applicant, newStatusValue) => {
    if (!applicant || applicant.status === newStatusValue) return;

    // ✅ Konversi value dropdown -> status untuk backend
    const newStatusForBackend = STATUS_TO_BACKEND[newStatusValue] || newStatusValue;

    // accepted/rejected tetap pakai modal (kirim pesan)
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

    // ✅ status proses langsung update (backend akan set stage = status -> sesuai mapping service)
    await updateApplicantStatus(applicant.id, newStatusForBackend, applicant.name);
  };

  // 4) Download Portfolio
  const handleDownloadPortfolio = (a) => {
    if (!a.portfolioUrl) {
      return toast.error(`Portofolio untuk ${a.name} tidak tersedia.`);
    }
    const safeName = a.name.replace(/\s+/g, "_").toLowerCase();
    downloadFileFromUrl(a.portfolioUrl, `portofolio_${safeName}.pdf`);
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
      />

      <div className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-visible">
        <ApplicantTable
          loading={loading}
          applicants={currentApplicants}
          setApplicants={setApplicants}
          fetchApplicants={fetchApplicants}
          onDetail={setSelectedDetail}
          onDownloadCV={(a) => {
            if (!a.cvUrl) return toast.error(`CV ${a.name} tidak ditemukan`);
            const safeName = a.name.replace(/\s+/g, "_").toLowerCase();
            downloadFileFromUrl(a.cvUrl, `cv_${safeName}.pdf`);
          }}
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
