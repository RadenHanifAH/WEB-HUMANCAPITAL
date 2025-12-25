import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileSpreadsheet,
  Download,
  ChevronDown,
  Check,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import { Bar, Doughnut } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Periode didefinisikan di luar agar tidak menyebabkan error inisialisasi state
const periodOptions = [
  { id: "daily", label: "Harian" },
  { id: "weekly", label: "Mingguan" },
  { id: "monthly", label: "Bulanan" },
  { id: "yearly", label: "Tahunan" },
];

const API_BASE_URL = "http://localhost:4000/api/reports";

// --- UI HELPER COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>{children}</div>
);
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
const Progress = ({ value, color = "bg-blue-500" }) => (
  <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden">
    <div
      className={`absolute h-full rounded-full ${color} transition-all duration-300`}
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

function Reports() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Filter dengan safety check
  const [trendPeriod, setTrendPeriod] = useState(periodOptions[2]); 
  const [acceptancePeriod, setAcceptancePeriod] = useState(periodOptions[2]);

  // State Data Chart
  const [trendData, setTrendData] = useState({ labels: [], applications: [] });
  const [acceptanceData, setAcceptanceData] = useState({ labels: [], values: [] });
  const [detailedPositions, setDetailedPositions] = useState([]);
  const [showFullPositionList, setShowFullPositionList] = useState(false);

  // 1. Fetch Data dari Database (Metrics & Positions)
  const fetchData = async () => {
    try {
      // Ambil Metrik Utama (Total, Accepted, Rejected, PositionDetails)
      const resMetrics = await axios.get(`${API_BASE_URL}/metrics`);
      setMetrics(resMetrics.data);
      
      if (resMetrics.data.positionDetails) {
        setDetailedPositions(resMetrics.data.positionDetails.map((p, idx) => ({
          ...p,
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][idx % 5]
        })));
      }

      // Ambil Data Chart berdasarkan filter periode
      const resCharts = await axios.get(`${API_BASE_URL}/charts?period=${trendPeriod.id}`);
      
      if (resCharts.data.chartTrend) {
        setTrendData(resCharts.data.chartTrend);
      }
      
      if (resCharts.data.chartAcceptance) {
        setAcceptanceData({
          labels: resCharts.data.chartAcceptance.labels,
          values: resCharts.data.chartAcceptance.values
        });
      }
    } catch (err) {
      console.error("Database Connection Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trendPeriod, acceptancePeriod]);

  // --- FUNGSI EXPORT CSV (Disesuaikan dengan data dinamis) ---
  const exportToCSV = (filename, data) => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURI(data);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReport = (type) => {
    if (!metrics) return;
    let csvData = "";

    if (type === "position_analytics") {
      csvData = "Posisi,Jumlah Lamaran,Persentase\n";
      detailedPositions.forEach(p => csvData += `${p.position},${p.count},${p.percentage}%\n`);
    } else if (type === "trend_analytics") {
      csvData = "Tanggal/Periode,Jumlah Lamaran\n";
      trendData.labels.forEach((l, i) => csvData += `${l},${trendData.applications[i]}\n`);
    } else {
      csvData = "Ringkasan Laporan Rekrutmen\n";
      csvData += `Total Lamaran,${metrics.totalApplications}\n`;
      csvData += `Diterima,${metrics.accepted}\n`;
      csvData += `Ditolak,${metrics.rejected}\n`;
      csvData += `Conversion Rate,${metrics.conversionRate}%\n`;
    }
    
    exportToCSV(`laporan_${type}_${new Date().toLocaleDateString()}.csv`, csvData);
  };

  if (loading) return <div className="p-10 text-center font-medium">Sinkronisasi Database Human Capital...</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50 font-[Inter] text-gray-900 p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-sky-900 mb-3">Laporan Rekrutmen</h1>
        <button 
          onClick={() => exportReport("comprehensive")} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Tren Lamaran */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center p-6 pb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Tren Lamaran</h3>
              <p className="text-sm text-gray-500">Filter aktif: {trendPeriod.label}</p>
            </div>
            <PeriodDropdown selected={trendPeriod} onChange={setTrendPeriod} />
          </div>
          <CardContent>
            <div className="h-64">
              <Bar 
                key={trendPeriod.id}
                data={{
                  labels: trendData.labels || [],
                  datasets: [{ 
                    label: "Jumlah", 
                    data: trendData.applications || [], 
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderRadius: 4
                  }]
                }} 
                options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Posisi (Detail Memanjang) */}
        <Card>
          <div className="p-6 pb-2"><h3 className="text-lg font-semibold text-gray-800">Jabatan Terpopuler</h3></div>
          <CardContent>
            <div className="h-64 flex justify-center items-center">
              <Doughnut 
                data={{
                  labels: detailedPositions.map(p => p.position),
                  datasets: [{ 
                    data: detailedPositions.map(p => p.count), 
                    backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"] 
                  }]
                }} 
                options={{ responsive: true, maintainAspectRatio: false }} 
              />
            </div>
            {showFullPositionList && (
              <div className="mt-4 space-y-2 pt-4 border-t">
                {detailedPositions.map((item) => (
                  <div key={item.position} className="flex items-center text-sm p-2 bg-gray-50 rounded-md">
                    <div className="w-full max-w-[40%] flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-gray-800 font-medium">{item.position}</span>
                    </div>
                    <div className="w-24 text-center font-bold text-sky-600">{item.count}</div>
                    <div className="w-1/3 ml-4">
                      <Progress value={item.percentage} color="bg-sky-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="p-4 flex justify-center border-t">
            <button 
              onClick={() => setShowFullPositionList(!showFullPositionList)} 
              className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors"
            >
              {showFullPositionList ? "Sembunyikan Detail" : "Lihat Detail Lamaran"}
            </button>
          </div>
        </Card>

        {/* CARD 3: Hasil Akhir */}
        <Card className="self-start">
          <div className="flex justify-between items-center p-6 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Status Kandidat</h3>
            <PeriodDropdown selected={acceptancePeriod} onChange={setAcceptancePeriod} />
          </div>
          <CardContent>
            <div className="h-64">
              <Bar 
                key={acceptancePeriod.id}
                data={{
                  labels: acceptanceData.labels || [],
                  datasets: [{ 
                    label: "Jumlah", 
                    data: acceptanceData.values || [], 
                    backgroundColor: ["#10b981", "#ef4444", "#f59e0b"] 
                  }]
                }} 
                options={{ responsive: true, maintainAspectRatio: false }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tombol Export Tambahan (Opsional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button onClick={() => exportReport("trend_analytics")} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100">
            <Download className="h-4 w-4" /> Export Tren
          </button>
          <button onClick={() => exportReport("position_analytics")} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100">
            <Download className="h-4 w-4" /> Export Posisi
          </button>
      </div>
    </div>
  );
}

// Dropdown Component
const PeriodDropdown = ({ selected, onChange }) => (
  <Listbox value={selected} onChange={onChange}>
    <div className="relative w-32">
      <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white text-sm shadow-sm hover:border-sky-300 transition-colors focus:outline-none">
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </Listbox.Button>
      <Listbox.Options className="absolute mt-1 w-full bg-white border rounded-lg shadow-lg z-20 text-sm overflow-hidden animate-in fade-in slide-in-from-top-1">
        {periodOptions.map((opt) => (
          <Listbox.Option 
            key={opt.id} 
            value={opt} 
            className={({ active }) => `px-3 py-2 cursor-pointer transition-colors ${active ? "bg-sky-100 text-sky-700" : "text-gray-700"}`}
          >
            {opt.label}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </div>
  </Listbox>
);

export default Reports;