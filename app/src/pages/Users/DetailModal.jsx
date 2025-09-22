// src/components/DetailModal.jsx
import React from 'react';
import { TrendingUp, CheckCircle, XCircle, X, Mail, Phone, MapPin } from 'lucide-react';

const DetailModal = ({ applicant, onClose }) => {
  if (!applicant) return null;

  // Data status kelengkapan dummy
  const completeness = {
    dataLengkap: true,
    cvTerupload: true,
  };

  const getStageIcon = (stageStatus) => {
    const stageFlow = [
      "under-review",
      "interview-hc",
      "psikotes",
      "final-interview"
    ];

    const currentStageIndex = stageFlow.indexOf(applicant.status);
    const stageIndex = stageFlow.indexOf(stageStatus);

    // Cek apakah status pelamar adalah penolakan (contoh: rejected-at-interview-hc)
    if (applicant.status.startsWith('rejected')) {
      const rejectionStage = applicant.status.split('-')[2]; // Mengambil 'interview-hc' dari 'rejected-at-interview-hc'
      const rejectionIndex = stageFlow.indexOf(rejectionStage);
      if (stageIndex >= rejectionIndex) {
        return <XCircle className="h-5 w-5 text-red-500" />;
      }
    }

    // Logic normal jika pelamar belum ditolak
    if (stageIndex <= currentStageIndex) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <CheckCircle className="h-5 w-5 text-gray-300" />;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-6">
        
        {/* Header dan Tombol Tutup */}
        <div className="flex justify-between items-start pb-4 border-b">
          <div className="flex items-center gap-4">
            <img
              src={applicant.avatar}
              alt={applicant.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{applicant.name}</h2>
                {applicant.status === 'accepted' && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    Diterima
                  </span>
                )}
                {applicant.status.startsWith('rejected') && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    Ditolak
                  </span>
                )}
              </div>
              <p className="text-gray-600">{applicant.position}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>Score: {applicant.score}</span>
            </div>
          </div>
        </div>

        {/* Informasi Kontak */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b pb-4">
          <p className="flex items-center gap-1">
            <Mail className="h-4 w-4 text-sky-600" />
            <span className="font-semibold">Email:</span> {applicant.email}
          </p>
          <span className="h-4 w-px bg-gray-300"></span>
          <p className="flex items-center gap-1">
            <Phone className="h-4 w-4 text-sky-600" />
            <span className="font-semibold">Telepon:</span> +62 812-3456-7890
          </p>
          <span className="h-4 w-px bg-gray-300"></span>
          <p className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-sky-600" />
            <span className="font-semibold">Lokasi:</span> {applicant.location}
          </p>
        </div>

        {/* Progress Seleksi */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Progress Seleksi</h3>
            <div className="space-y-2">
              {[
                { status: "under-review", label: "Under Review" },
                { status: "interview-hc", label: "Interview HC" },
                { status: "psikotes", label: "Psikotes" },
                { status: "final-interview", label: "Final Interview" }
              ].map((stage) => (
                <div key={stage.status} className="flex items-center gap-2 text-gray-700">
                  {getStageIcon(stage.status)}
                  <span>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pendidikan & Pengalaman */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Pendidikan</h3>
            <p className="text-gray-700 text-sm">S1 Teknik Informatika</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Pengalaman</h3>
            <p className="text-gray-700 text-sm">{applicant.experience}</p>
          </div>

          {/* Status Kelengkapan */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Status Kelengkapan</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                {completeness.dataLengkap ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Data Pribadi Lengkap</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                {completeness.cvTerupload ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>CV Terupload</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DetailModal;