import React from "react";

const normalizeStage = (stage) => {
  const s = String(stage || "").trim().toLowerCase();
  if (!s) return "-";

  if (s === "under review" || s === "under-review" || s === "screening") return "Screaning";
  if (s === "psikotes") return "Psikotes/technical test";
  if (s.includes("technical")) return "Psikotes/technical test";

  if (s === "screaning") return "Screaning";
  if (s === "interview hc") return "Interview HC";
  if (s === "final interview") return "Final Interview";
  if (s.includes("offering")) return "Offering/Final Result";

  return stage;
};

const getFinalBadge = (statusRaw) => {
  const s = String(statusRaw || "").trim().toLowerCase();
  if (!s) return null;

  if (s.includes("reject")) return { text: "DITOLAK", cls: "bg-red-100 text-red-700" };

  if (s.includes("accept") || s.includes("hired"))
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
            const stage = normalizeStage(app?.stage);
            const finalBadge = getFinalBadge(app?.status);

            const badgeText = finalBadge?.text ?? stage;
            const badgeClass = finalBadge?.cls ?? stageBadgeClass(stage);

            // ✅ pakai field yang benar dari backend
            const cvExists = !!(app?.cvDownloadUrl || app?.cvName);
            const portfolioExists = !!(app?.portfolioDownloadUrl || app?.portfolioName);

            return (
              <div
                key={app.id}
                className="border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {app?.job?.title || app?.position || "-"}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    Tanggal Lamar: {formatDateTime(app?.appliedAt || app?.appliedDate)}
                  </p>

                  <div className="mt-3 text-sm text-gray-700 flex gap-6 flex-wrap">
                    {/* ✅ CV */}
                    <div>
                      <span className="font-semibold">CV:</span>{" "}
                      {cvExists ? (
                        app?.cvDownloadUrl ? (
                          <a
                            href={app.cvDownloadUrl}
                            className="text-sky-700 font-semibold hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Tersimpan
                          </a>
                        ) : (
                          <span className="text-green-700 font-semibold">Tersimpan</span>
                        )
                      ) : (
                        "—"
                      )}
                      {app?.cvName ? (
                        <span className="text-xs text-gray-500 ml-2">({app.cvName})</span>
                      ) : null}
                    </div>

                    {/* ✅ Portfolio (opsional) */}
                    <div>
                      <span className="font-semibold">Portfolio:</span>{" "}
                      {portfolioExists ? (
                        app?.portfolioDownloadUrl ? (
                          <a
                            href={app.portfolioDownloadUrl}
                            className="text-sky-700 font-semibold hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Tersimpan
                          </a>
                        ) : (
                          <span className="text-green-700 font-semibold">Tersimpan</span>
                        )
                      ) : (
                        "—"
                      )}
                      {app?.portfolioName ? (
                        <span className="text-xs text-gray-500 ml-2">({app.portfolioName})</span>
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
