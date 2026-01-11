import React from "react";
import { Download } from "lucide-react";

export default function ExportButtons({ exporting, onExport }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <button
        onClick={() => onExport("trend_analytics")}
        disabled={exporting}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" /> Export Tren
      </button>

      <button
        onClick={() => onExport("position_analytics")}
        disabled={exporting}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" /> Export Posisi
      </button>

      <button
        onClick={() => onExport("status_analytics")}
        disabled={exporting}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <Download className="h-4 w-4" /> Export Status
      </button>
    </div>
  );
}
