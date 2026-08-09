import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PsikotestForm from "./PsikotestForm";
import InterviewForm from "./InterviewForm";

// Urutan proses penilaian: Interview Tahap 1 -> Psikotest -> Interview Tahap 2.
// Interview tahap 1 & 2 memakai komponen InterviewForm yang sama,
// hanya dibedakan lewat prop `stage`.
const TABS = [
  { key: "interview1", label: "Interview Tahap 1" },
  { key: "psikotest", label: "Psikotest" },
  { key: "interview2", label: "Interview Tahap 2" },
];

const PenilaianPage = () => {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId") || "";
  const [activeTab, setActiveTab] = useState("interview1");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-6">
            {TABS.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold ${
                    activeTab === tab.key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-8">
        {activeTab === "interview1" && (
          <InterviewForm applicationId={applicationId} stage={1} />
        )}
        {activeTab === "psikotest" && (
          <PsikotestForm applicationId={applicationId} />
        )}
        {activeTab === "interview2" && (
          <InterviewForm applicationId={applicationId} stage={2} />
        )}
      </div>
    </div>
  );
};

export default PenilaianPage;

// =========================================================
// Daftarkan route ini di router utama, contoh (react-router-dom):
//
// import PenilaianPage from "./pages/Admin/Penilaian";
// <Route path="/admin/penilaian" element={<PenilaianPage />} />
//
// Diakses dengan query, misal dari daftar applicant:
// /admin/penilaian?applicationId=12
// =========================================================