import React from "react";
import StatusBadge from "./StatusBadge";
import { getInitials } from "../utils/helpers";

const LatestApplications = ({ applications, loading }) => (
  <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
    <h3 className="text-lg font-semibold mb-1">Lamaran Terbaru</h3>
    <p className="text-sm text-gray-500 mb-4">
      Pelamar yang baru mendaftar hari ini
    </p>

    {loading ? (
      <div className="text-center py-8 text-gray-500">
        Memuat data lamaran...
      </div>
    ) : applications.length === 0 ? (
      <div className="text-center py-8 text-gray-400 italic">
        Belum ada lamaran masuk hari ini.
      </div>
    ) : (
      <div className="space-y-3">
        {applications.map((a, i) => (
          <div
            key={`app-${a.id || i}`}
            className="flex items-center justify-between border border-gray-100 rounded-md p-3 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {a.fotoProfile ? (
                <img
                  src={a.fotoProfile}
                  alt={a.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                  {getInitials(a.name)}
                </div>
              )}
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-gray-500">{a.position}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={a.status} />
              <p className="text-xs text-gray-400 mt-1">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default LatestApplications;