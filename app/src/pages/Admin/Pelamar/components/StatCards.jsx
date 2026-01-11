import React, { useMemo } from "react";
import { Clock, User, AlertCircle, TrendingUp } from "lucide-react";

const normalizeStatus = (raw) => {
  const s = String(raw || "").trim();
  const low = s.toLowerCase();

  if (low === "screaning" || low === "screening" || low === "under-review" || low === "under review")
    return "Screaning";

  if (low === "interview hc" || low === "interview-hc" || low === "interviewhc")
    return "Interview HC";

  if (
    low === "psikotes" ||
    low === "psikotes/technical test" ||
    low === "technical test" ||
    low === "psychotest" ||
    low === "psycho test"
  )
    return "Psikotes/Technical Test";

  if (low === "final interview" || low === "final-interview" || low === "finalinterview")
    return "Final Interview";

  return s;
};

const StatCards = ({ applicants }) => {
  const counts = useMemo(() => {
    const c = {
      "Screaning": 0,
      "Interview HC": 0,
      "Psikotes/Technical Test": 0,
      "Final Interview": 0,
    };

    (applicants || []).forEach((a) => {
      const st = normalizeStatus(a.status);
      if (c[st] !== undefined) c[st] += 1;
    });

    return c;
  }, [applicants]);

  const stats = [
    {
      label: "Screaning",
      count: counts["Screaning"],
      icon: Clock,
      color: "text-orange-500",
      sub: "Sedang ditinjau",
    },
    {
      label: "Interview HC",
      count: counts["Interview HC"],
      icon: User,
      color: "text-blue-500",
      sub: "Menunggu jadwal",
    },
    {
      label: "Psikotes/Technical Test",
      count: counts["Psikotes/Technical Test"],
      icon: AlertCircle,
      color: "text-purple-500",
      sub: "Dalam proses",
    },
    {
      label: "Final Interview",
      count: counts["Final Interview"],
      icon: TrendingUp,
      color: "text-green-500",
      sub: "Tahap akhir",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s, idx) => (
        <div key={idx} className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-500">{s.label}</p>
            <s.icon className={`h-4 w-4 ${s.color}`} />
          </div>
          <h2 className="text-2xl font-bold">{s.count}</h2>
          <p className="text-sm text-gray-500">{s.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;
