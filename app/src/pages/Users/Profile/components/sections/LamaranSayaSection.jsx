import React from "react";

// ✅ File sertifikat/dokumen lain di app ini pakai origin backend terpisah
// dari frontend (lihat CertificateModal.jsx / DocumentsSayaSection.jsx),
// jadi link download di sini juga perlu digabung ke origin API.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const normalizeStage = (stage) => {
  const s = String(stage || "").trim().toLowerCase();
  if (!s) return "-";

  if (s === "under review" || s === "under-review" || s === "screening") return "Screaning";
  if (s === "psikotes") return "Psikotes/technical test";
  if (s.includes("technical")) return "Psikotes/technical test";

  if (s === "screaning") return "Screaning";
  if (s === "interview pertama") return "Interview Pertama";
  if (s === "interview kedua") return "Interview Kedua";
  if (s.includes("offering")) return "Final Result";

  return stage;
};

const getFinalBadge = (statusRaw) => {
  const s = String(statusRaw || "").trim().toLowerCase();
  if (!s) return null;

  if (s.includes("reject")) return { text: "DITOLAK", cls: "bg-red-100 text-red-700" };

  if (s.includes("accept") || s.includes("hired") || s.includes("diterima"))
    return { text: "DITERIMA", cls: "bg-green-100 text-green-700" };

  return null;
};

const stageBadgeClass = (stage) => {
  const s = String(stage || "").toLowerCase();
  if (s.includes("screaning")) return "bg-yellow-100 text-yellow-700";
  if (s.includes("interview")) return "bg-blue-100 text-blue-700";
  if (s.includes("psikotes") || s.includes("technical")) return "bg-purple-100 text-purple-700";
  if (s.includes("final")) return "bg-sky-100 text-sky-700";
  if (s.includes("offering")) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export default function LamaranSayaSection({ applications = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900">Lamaran Saya</h3>
      <p className="text-sm text-gray-500 mt-1">Riwayat lamaran yang pernah Anda kirim.</p>

      {applications.length === 0 ? (
        <div className="mt-6 p-5 border border-dashed rounded-xl text-gray-500 text-sm">
          Anda belum pernah mengirim lamaran.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => {
            // ✅ Persis field yang dikembalikan GET /applications/me
            // (repo.findManyByUserId): id, status, tahap, tanggal_melamar,
            // nama_cv, nama_portofolio, lowongan: { id, judul }
            const stage = normalizeStage(app?.tahap);
            const finalBadge = getFinalBadge(app?.status);

            const badgeText = finalBadge?.text ?? stage;
            const badgeClass = finalBadge?.cls ?? stageBadgeClass(stage);

            const cvExists = Boolean(app?.nama_cv);
            const portfolioExists = Boolean(app?.nama_portofolio);

            // Endpoint /applications/me tidak mengirim URL download,
            // jadi dibangun manual mengarah ke route yang sama dipakai
            // admin: GET /api/applications/:id/file?type=cv|portfolio
            const cvDownloadUrl = cvExists
              ? `${BASE_URL}/api/applications/${app.id}/file?type=cv`
              : null;
            const portfolioDownloadUrl = portfolioExists
              ? `${BASE_URL}/api/applications/${app.id}/file?type=portfolio`
              : null;

            return (
              <div
                key={app.id}
                className="border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {app?.lowongan?.judul || "-"}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Tanggal Lamar: {formatDateTime(app?.tanggal_melamar)}
                  </p>

                  <div className="mt-3 text-sm text-gray-700 flex gap-6 flex-wrap">
                    {/* ✅ CV */}
                    <div>
                      <span className="font-semibold">CV:</span>{" "}
                      {cvExists ? (
                        <a
                          href={cvDownloadUrl}
                          className="text-sky-700 font-semibold hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Tersimpan
                        </a>
                      ) : (
                        "—"
                      )}
                      {app?.nama_cv ? (
                        <span className="text-xs text-gray-500 ml-2">({app.nama_cv})</span>
                      ) : null}
                    </div>

                    {/* ✅ Portfolio (opsional) */}
                    <div>
                      <span className="font-semibold">Portfolio:</span>{" "}
                      {portfolioExists ? (
                        <a
                          href={portfolioDownloadUrl}
                          className="text-sky-700 font-semibold hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Tersimpan
                        </a>
                      ) : (
                        "—"
                      )}
                      {app?.nama_portofolio ? (
                        <span className="text-xs text-gray-500 ml-2">({app.nama_portofolio})</span>
                      ) : null}
                    </div>
                  </div>

                  {finalBadge?.text === "DITOLAK" && stage !== "-" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Ditolak pada tahap: <span className="font-semibold">{stage}</span>
                    </p>
                  )}
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                  {badgeText}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}