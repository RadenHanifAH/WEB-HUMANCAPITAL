import React from 'react';
import { Clock, User, AlertCircle, TrendingUp } from "lucide-react";

const StatCards = ({ applicants }) => {
  const stats = [
    { label: "Under Review", count: applicants.filter(a => a.status === "under-review").length, icon: Clock, color: "text-orange-500", sub: "Sedang ditinjau" },
    { label: "Interview HC", count: applicants.filter(a => a.status === "interview-hc").length, icon: User, color: "text-blue-500", sub: "Menunggu jadwal" },
    { label: "Psikotes", count: applicants.filter(a => a.status === "psikotes").length, icon: AlertCircle, color: "text-purple-500", sub: "Dalam proses" },
    { label: "Final Interview", count: applicants.filter(a => a.status === "final-interview").length, icon: TrendingUp, color: "text-green-500", sub: "Tahap akhir" },
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