import React from "react";
import axios from "axios";
import { FileSpreadsheet } from "lucide-react";
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

import { API_BASE_URL } from "./utils/constants";
import { downloadBlob, getFilenameFromContentDisposition } from "./utils/download";
import { useReportsDashboard } from "./hooks/useReportsDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ReportsPage() {
  const {
    loading,
    exporting,
    setExporting,
    dropdownState,
    dataState,
    exportParams,
  } = useReportsDashboard();

  const {
    trendPeriod,
    positionPeriod,
    statusPeriod,
    setTrendPeriod,
    setPositionPeriod,
    setStatusPeriod,
  } = dropdownState;

  const {
    trendData,
    acceptanceData,
    detailedPositions,
    showFullPositionList,
    setShowFullPositionList,
  } = dataState;

  const exportReport = async (type) => {
    setExporting(true);
    try {
      // EXPORT SEMUA (dashboard)
      if (type === "dashboard") {
        const response = await axios.get(
          `${API_BASE_URL}/export?type=dashboard&trendPeriod=${exportParams.trendPeriodId}&positionPeriod=${exportParams.positionPeriodId}&statusPeriod=${exportParams.statusPeriodId}`,
          { withCredentials: true, responseType: "blob" }
        );

        const filename = getFilenameFromContentDisposition(
          response.headers["content-disposition"],
          `laporan_dashboard_${new Date().toISOString().split("T")[0]}.csv`
        );

        downloadBlob(response.data, filename);
        return;
      }

      // EXPORT SINGLE (ikut dropdown masing-masing)
      let period = exportParams.trendPeriodId;
      if (type === "position_analytics") period = exportParams.positionPeriodId;
      if (type === "status_analytics") period = exportParams.statusPeriodId;

      const response = await axios.get(`${API_BASE_URL}/export?type=${type}&period=${period}`, {
        withCredentials: true,
        responseType: "blob",
      });

      const filename = getFilenameFromContentDisposition(
        response.headers["content-disposition"],
        `laporan_${type}_${period}_${new Date().toISOString().split("T")[0]}.csv`
      );

      downloadBlob(response.data, filename);
    } catch (error) {
      console.error("Export Error:", error);
      alert("❌ Gagal export laporan: " + (error.response?.data?.message || error.message));
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="flex flex-col h-full bg-gray-50 font-[Inter] text-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-sky-900 mb-3">Laporan Rekrutmen</h1>

        <button
          onClick={() => exportReport("dashboard")}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {exporting ? "Menyimpan & Export..." : "Export Semua"}
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendCard trendPeriod={trendPeriod} setTrendPeriod={setTrendPeriod} trendData={trendData} />

        <PositionsCard
          positionPeriod={positionPeriod}
          setPositionPeriod={setPositionPeriod}
          detailedPositions={detailedPositions}
          showFullPositionList={showFullPositionList}
          setShowFullPositionList={setShowFullPositionList}
        />

        <StatusCard
          statusPeriod={statusPeriod}
          setStatusPeriod={setStatusPeriod}
          acceptanceData={acceptanceData}
        />
      </div>

      {/* Export single */}
      <ExportButtons exporting={exporting} onExport={exportReport} />
    </div>
  );
}
