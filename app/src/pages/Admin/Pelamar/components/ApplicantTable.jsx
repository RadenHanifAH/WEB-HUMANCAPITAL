import React, { Fragment, useMemo } from "react";
import {
  Eye,
  Download,
  Calendar,
  User,
  Clock,
  Check,
  AlertCircle,
  TrendingUp,
  XCircle,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { stageFlow, blockedScoreStages, API_URL_APPLICANTS } from "../utils/constants";
import { formatDate, getProgress } from "../utils/helpers";

const ApplicantTable = ({
  loading,
  applicants,
  onDetail,
  onDownloadCV,
  onDownloadPortofolio,
  setApplicants,
  onOpenStatusModal,
}) => {
  // ✅ Normalisasi: semua variasi psikotes disatukan ke label UI
  const normalizeStatus = (raw) => {
    const s = String(raw || "").trim();
    const low = s.toLowerCase();

    // Screening (typo + variasi)
    if (low === "screaning") return "Screaning";
    if (low === "screening") return "Screaning";
    if (low === "under-review" || low === "under review" || low === "under_review")
      return "Screaning";

    // Interview HC
    if (low === "interview hc" || low === "interview-hc" || low === "interviewhc")
      return "Interview HC";

    // ✅ Psikotes -> label baru
    if (
      low === "psikotes" ||
      low === "psychotest" ||
      low === "psycho test" ||
      low === "technical test" ||
      low === "psikotes/technical test"
    ) {
      return "Psikotes/Technical Test";
    }

    // Final Interview
    if (low === "final interview" || low === "final-interview" || low === "finalinterview")
      return "Final Interview";

    // Accepted / Rejected
    if (low === "accepted" || low === "accept") return "Accepted";
    if (low.startsWith("rejected") || low === "reject") return "Rejected";

    return s;
  };

  const getStatusIcon = (statusRaw) => {
    const status = normalizeStatus(statusRaw);

    const icons = {
      Screaning: Clock,
      "Interview HC": User,
      "Psikotes/Technical Test": AlertCircle,
      "Final Interview": TrendingUp,
      Accepted: Check,
      Rejected: XCircle,
    };

    const colors = {
      Screaning: "text-orange-500",
      "Interview HC": "text-blue-500",
      "Psikotes/Technical Test": "text-purple-500",
      "Final Interview": "text-green-500",
      Accepted: "text-green-600",
      Rejected: "text-red-600",
    };

    const Icon = icons[status] || Clock;
    const color = colors[status] || "text-gray-500";

    return <Icon className={`h-4 w-4 ${color}`} />;
  };

  const getBadgeColor = (statusRaw) => {
    const status = normalizeStatus(statusRaw);

    const colors = {
      Screaning: "bg-orange-100 text-orange-600",
      "Interview HC": "bg-blue-100 text-blue-600",
      "Psikotes/Technical Test": "bg-purple-100 text-purple-600",
      "Final Interview": "bg-green-100 text-green-600",
      Accepted: "bg-green-200 text-green-700",
      Rejected: "bg-red-100 text-red-700",
    };

    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const isFinalStatus = (statusRaw) => {
    const status = normalizeStatus(statusRaw);
    return status === "Accepted" || status.startsWith("Rejected");
  };

  const isScoreBlocked = (statusRaw) => {
    const status = normalizeStatus(statusRaw);
    const normalizedBlocked = blockedScoreStages.map(normalizeStatus);
    return normalizedBlocked.includes(status);
  };

  const handleScoreChange = async (id, newScore) => {
    const val = newScore === "" ? null : parseInt(newScore, 10);

    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, score: val } : a)));

    try {
      await fetch(`${API_URL_APPLICANTS}/${id}/score`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: newScore }),
        credentials: "include",
      });
    } catch (e) {
      console.error("Gagal update score:", e);
    }
  };

  const normalizedApplicants = useMemo(() => {
    return (applicants || []).map((a) => ({
      ...a,
      _statusNormalized: normalizeStatus(a.status),
    }));
  }, [applicants]);

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500 italic">
        Memuat data pelamar...
      </div>
    );

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-100">
        <tr className="text-left text-sm font-semibold text-gray-600">
          <th className="p-4">Pelamar</th>
          <th className="p-4">Posisi</th>
          <th className="p-4 text-center">Tahap Seleksi</th>
          <th className="p-4 text-center">Progress</th>
          <th className="p-4 text-center">Score</th>
          <th className="p-4">Tanggal Lamar</th>
          <th className="p-4 text-right">Aksi</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {normalizedApplicants.map((a, idx) => {
          const st = a._statusNormalized;

          return (
            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {a.avatar ? (
                    <img
                      src={a.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.email}</p>
                  </div>
                </div>
              </td>

              <td className="p-4 text-sm font-medium">{a.position}</td>

              <td className="p-4 text-center">
                <Listbox
                  value={st}
                  onChange={(val) => onOpenStatusModal(a, val)}
                  disabled={isFinalStatus(st)}
                >
                  <div className="relative inline-block w-48">
                    <Listbox.Button
                      className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-semibold ${getBadgeColor(
                        st
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusIcon(st)}
                        <span>{st}</span>
                      </div>
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </Listbox.Button>

                    <Transition as={Fragment} leave="transition ease-in duration-100 opacity-0">
                      <Listbox.Options className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-60 overflow-auto focus:outline-none text-left">
                        {stageFlow.map((step) => (
                          <Listbox.Option
                            key={step.stage}
                            value={step.stage}
                            className={({ active }) =>
                              `px-3 py-2 cursor-pointer text-xs ${
                                active ? "bg-sky-50 text-sky-700" : "text-gray-700"
                              }`
                            }
                          >
                            {step.stage}
                          </Listbox.Option>
                        ))}

                        <div className="border-t border-gray-100 my-1" />

                        <Listbox.Option
                          value="Accepted"
                          className="px-3 py-2 cursor-pointer text-xs font-bold text-green-600 hover:bg-green-50"
                        >
                          TERIMA
                        </Listbox.Option>

                        <Listbox.Option
                          value="Rejected"
                          className="px-3 py-2 cursor-pointer text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          TOLAK
                        </Listbox.Option>
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </td>

              <td className="p-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-1.5 bg-gray-100 rounded-full w-20 overflow-hidden">
                    <div
                      className="h-full bg-sky-500"
                      style={{ width: `${getProgress(st)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">
                    {getProgress(st)}%
                  </span>
                </div>
              </td>

              <td className="p-4 text-center">
                {!isScoreBlocked(st) ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={a.score ?? ""}
                    disabled={st !== "Psikotes/Technical Test" && a.score !== null}
                    onChange={(e) => handleScoreChange(a.id, e.target.value)}
                    className={`w-14 text-center border border-gray-400 rounded-md p-1 text-xs transition-all ${
                      st !== "Psikotes/Technical Test" && a.score !== null
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                        : "focus:ring-2 focus:ring-sky-200 outline-none"
                    }`}
                  />
                ) : (
                  <span className="text-xs text-gray-400 italic">Locked</span>
                )}
              </td>

              <td className="p-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(a.appliedDate)}
                </div>
              </td>

              <td className="p-4 text-right relative">
                <Listbox>
                  <div className="relative inline-block">
                    <Listbox.Button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-5 w-5 text-gray-500" />
                    </Listbox.Button>

                    <Transition as={Fragment} leave="transition duration-100 opacity-0">
                      <Listbox.Options
                        className={`absolute right-0 w-40 bg-white border border-gray-300 rounded-lg shadow-xl z-50 focus:outline-none ${
                          idx >= normalizedApplicants.length - 2 ? "bottom-full mb-1" : "mt-1"
                        }`}
                      >
                        <Listbox.Option
                          value="detail"
                          onClick={() => onDetail(a)}
                          className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                        >
                          <Eye className="h-4 w-4" /> Lihat Detail
                        </Listbox.Option>

                        <Listbox.Option
                          value="cv"
                          onClick={() => onDownloadCV(a)}
                          className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                        >
                          <Download className="h-4 w-4" /> Download CV
                        </Listbox.Option>

                        <Listbox.Option
                          value="portofolio"
                          onClick={() => onDownloadPortofolio(a)}
                          className="px-3 py-2 text-sm rounded-md flex items-center gap-2 cursor-pointer hover:bg-sky-100 hover:text-sky-700"
                        >
                          <Download className="h-4 w-4" /> Portofolio
                        </Listbox.Option>
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ApplicantTable;
