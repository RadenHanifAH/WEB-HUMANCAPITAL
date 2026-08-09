import React from "react";
import { Clock, UserCheck, AlertCircle, TrendingUp } from "lucide-react";

const iconMap = {
  "Screaning": Clock,
  "Interview Pertama": UserCheck,
  "Psikotes": AlertCircle,
  "Interview Kedua": TrendingUp,
};

const Pipeline = ({ pipeline, loading }) => (
  <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
    <h3 className="text-lg font-semibold mb-1">Pipeline Rekrutmen</h3>
    <p className="text-sm text-gray-500 mb-4">Status pelamar dalam proses seleksi</p>
    {loading ? (
      <div className="text-center py-8 text-gray-500">Memuat data pipeline...</div>
    ) : (
      <div className="space-y-4">
        {pipeline.map((stage, i) => {
          const Icon = iconMap[stage.title] || Clock;
          return (
            <div key={`pipe-${stage.title || i}`} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${stage.color}`} />
                <span className="text-sm font-medium">{stage.title}</span>
              </div>
              <div className="flex items-center gap-2 w-40">
                <span className="text-sm text-gray-500">{stage.count} pelamar</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${stage.value}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default Pipeline;