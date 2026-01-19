import React from "react";
import { FileSpreadsheet } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance"; // ✅ sesuaikan path kalau beda
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ReportsPage() {
  const { loading, exporting, setExporting, dropdownState, dataState, exportParams } =
    useReportsDashboard();

  const { trendPeriod, setTrendPeriod } = dropdownState;

  const {
    trendData,
    acceptanceData,
    detailedPositions,
    showFullPositionList,
    setShowFullPositionList,
  } = dataState;

  const exportExcel = async (type) => {
    if (exporting) return;

    setExporting(true);
    try {
      let params = { format: "xlsx" };

      if (type === "dashboard") {
        params = {
          ...params,
          type: "dashboard",
          trendPeriod: exportParams.trendPeriodId,
        };
      } else if (type === "trend_analytics") {
        params = {
          ...params,
          type: "trend_analytics",
          period: exportParams.trendPeriodId,
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
      const fallback = `laporan_${type}.xlsx`;
      const filename = getFilenameFromContentDisposition(cd, fallback);

      downloadBlob(res.data, filename);
    } catch (e) {
      console.error("Export Excel Error:", e);
      alert("❌ Gagal export Excel: " + (e?.message || "Unknown error"));
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

        <button
          onClick={() => exportExcel("dashboard")}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {exporting ? "Menyimpan & Export..." : "Export"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendCard
          trendPeriod={trendPeriod}
          setTrendPeriod={setTrendPeriod}
          trendData={trendData}
        />

        <PositionsCard
          detailedPositions={detailedPositions}
          showFullPositionList={showFullPositionList}
          setShowFullPositionList={setShowFullPositionList}
        />

        <StatusCard acceptanceData={acceptanceData} />
      </div>

      <ExportButtons exporting={exporting} onExport={exportExcel} />
    </div>
  );
}
