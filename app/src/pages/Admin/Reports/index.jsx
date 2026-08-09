import React, { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance"; // ✅ sesuaikan path kalau beda
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import LoadingState from "./components/LoadingState";
import TrendCard from "./components/TrendCard";
import PositionsCard from "./components/PositionsCard";
import StatusCard from "./components/StatusCard";
import ExportButtons from "./components/ExportButtons";

import { useReportsDashboard } from "./hooks/useReportsDashboard";
import { API_REPORTS } from "./utils/constants";
import { downloadBlob, getFilenameFromContentDisposition } from "./utils/download";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const { loading, exporting, setExporting, dropdownState, dataState, exportParams } =
    useReportsDashboard();

  const { trendPeriod, setTrendPeriod, dateRange, applyRange, clearRange } = dropdownState;

  const {
    trendData,
    acceptanceData,
    detailedPositions,
    showFullPositionList,
    setShowFullPositionList,
  } = dataState;

  // ✅ BARU: format export yang sedang dipilih, dipakai baik oleh tombol
  // "Export" utama (dashboard) maupun tombol-tombol quick export per
  // section di <ExportButtons />. Defaultnya tetap Excel supaya perilaku
  // lama tidak berubah untuk siapa pun yang belum menyentuh toggle ini.
  const [exportFormat, setExportFormat] = useState("xlsx"); // "xlsx" | "pdf"

  // ✅ Digeneralisasi dari `exportExcel` -> `exportReport`: sekarang bisa
  // export ke Excel (.xlsx) ATAU PDF laporan formal, tergantung state
  // `exportFormat` yang dipilih user lewat toggle di toolbar.
  const exportReport = async (type) => {
    if (exporting) return;

    setExporting(true);
    try {
      let params = { format: exportFormat };

      if (type === "dashboard") {
        params = {
          ...params,
          type: "dashboard",
          trendPeriod: exportParams.trendPeriodId,
          startDate: exportParams.startDate,
          endDate: exportParams.endDate,
        };
      } else if (type === "trend_analytics") {
        params = {
          ...params,
          type: "trend_analytics",
          period: exportParams.trendPeriodId,
          startDate: exportParams.startDate,
          endDate: exportParams.endDate,
        };
      } else if (type === "position_analytics") {
        params = {
          ...params,
          type: "position_analytics",
          period: exportParams.fixedPeriod,
        };
      } else if (type === "status_analytics") {
        params = {
          ...params,
          type: "status_analytics",
          period: exportParams.fixedPeriod,
        };
      } else {
        params = { ...params, type };
      }

      // ✅ axiosInstance, tanpa localhost
      const res = await axiosInstance.get(`${API_REPORTS}/export`, {
        responseType: "blob",
        params,
      });

      const cd = res.headers?.["content-disposition"];
      const ext = exportFormat === "pdf" ? "pdf" : "xlsx";
      const fallback = `laporan_${type}.${ext}`;
      const filename = getFilenameFromContentDisposition(cd, fallback);

      downloadBlob(res.data, filename);
    } catch (e) {
      console.error("Export Report Error:", e);
      const label = exportFormat === "pdf" ? "PDF" : "Excel";
      alert(`❌ Gagal export ${label}: ` + (e?.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-col h-full bg-gray-50 font-[Inter] text-gray-900 p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-sky-900 mb-3">
          Laporan Rekrutmen
        </h1>

        <div className="flex items-center gap-3">
          {/* ✅ BARU: toggle pilihan format. Berlaku untuk tombol "Export"
              utama di sini maupun tombol-tombol quick export di
              <ExportButtons /> di bagian bawah halaman. */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setExportFormat("xlsx")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                exportFormat === "xlsx"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              type="button"
              onClick={() => setExportFormat("pdf")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                exportFormat === "pdf"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>

          <button
            onClick={() => exportReport("dashboard")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {exportFormat === "pdf" ? (
              <FileText className="h-4 w-4" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {exporting ? "Menyimpan & Export..." : "Export"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendCard
          trendPeriod={trendPeriod}
          setTrendPeriod={setTrendPeriod}
          trendData={trendData}
          dateRange={dateRange}
          onApplyRange={applyRange}
          onClearRange={clearRange}
        />

        <PositionsCard
          detailedPositions={detailedPositions}
          showFullPositionList={showFullPositionList}
          setShowFullPositionList={setShowFullPositionList}
        />

        <StatusCard acceptanceData={acceptanceData} />
      </div>

      {/* ✅ ExportButtons tetap dipakai apa adanya (propnya tidak berubah),
          tapi karena `exportReport` membaca `exportFormat` dari state di
          atas, tombol-tombol quick export di sini otomatis ikut format
          yang sedang dipilih user di toggle Excel/PDF */}
      <ExportButtons exporting={exporting} onExport={exportReport} />
    </div>
  );
}