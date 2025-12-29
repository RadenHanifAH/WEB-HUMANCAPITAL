import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileSpreadsheet,
  Download,
  ChevronDown,
  Check,
  Archive,
  Trash2,
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

const periodOptions = [
  { id: "daily", label: "Harian" },
  { id: "weekly", label: "Mingguan" },
  { id: "monthly", label: "Bulanan" },
  { id: "yearly", label: "Tahunan" },
];

const API_BASE_URL = "http://localhost:4000/api/reports";

// UI Helper Components
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

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
  const [exporting, setExporting] = useState(false);

  // State Filter
  const [trendPeriod, setTrendPeriod] = useState(periodOptions[2]);
  const [acceptancePeriod, setAcceptancePeriod] = useState(periodOptions[2]);

  // State Data Chart
  const [trendData, setTrendData] = useState({ labels: [], applications: [] });
  const [acceptanceData, setAcceptanceData] = useState({
    labels: [],
    values: [],
  });
  const [detailedPositions, setDetailedPositions] = useState([]);
  const [showFullPositionList, setShowFullPositionList] = useState(false);

  // State untuk Saved Reports
  const [savedReports, setSavedReports] = useState([]);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Fetch Real-time Data
  const fetchData = async () => {
    try {
      // Ambil Metrik Utama
      const resMetrics = await axios.get(`${API_BASE_URL}/metrics`);
      setMetrics(resMetrics.data);

      if (resMetrics.data.positionDetails) {
        setDetailedPositions(
          resMetrics.data.positionDetails.map((p, idx) => ({
            ...p,
            color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][
              idx % 5
            ],
          }))
        );
      }

      // Ambil Data Chart
      const resCharts = await axios.get(
        `${API_BASE_URL}/charts?period=${trendPeriod.id}`
      );

      if (resCharts.data.chartTrend) {
        setTrendData(resCharts.data.chartTrend);
      }

      if (resCharts.data.chartAcceptance) {
        setAcceptanceData({
          labels: resCharts.data.chartAcceptance.labels,
          values: resCharts.data.chartAcceptance.values,
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

  // ✅ Fetch Saved Reports
  const fetchSavedReports = async () => {
    setLoadingSaved(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/saved`, {
        withCredentials: true,
      });
      setSavedReports(response.data.data);
    } catch (error) {
      console.error("Error fetching saved reports:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (showSavedReports) {
      fetchSavedReports();
    }
  }, [showSavedReports]);

  // ✅ Export Report (Auto-save to DB + Download CSV)
  const exportReport = async (type) => {
    if (!metrics) {
      alert("Data belum siap, mohon tunggu...");
      return;
    }

    setExporting(true);
    try {
      const period = trendPeriod.id;

      console.log(`📤 Exporting ${type} report...`);

      // Request export (backend akan auto-save ke DB dan return CSV)
      const response = await axios.get(
        `${API_BASE_URL}/export?type=${type}&period=${period}`,
        {
          withCredentials: true,
          responseType: "blob", // Important for file download
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `laporan_${type}_${new Date().toLocaleDateString()}.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Export successful & saved to database");
      alert(
        `✅ Laporan berhasil di-export dan disimpan ke database!\nFile: ${filename}`
      );

      // Refresh saved reports jika sedang ditampilkan
      if (showSavedReports) {
        fetchSavedReports();
      }
    } catch (error) {
      console.error("Export Error:", error);
      alert(
        "❌ Gagal export laporan: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setExporting(false);
    }
  };

  // ✅ Delete Saved Report
  const deleteSavedReport = async (id) => {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/saved/${id}`, {
        withCredentials: true,
      });
      alert("✅ Laporan berhasil dihapus");
      fetchSavedReports();
    } catch (error) {
      console.error("Delete Error:", error);
      alert("❌ Gagal menghapus laporan");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-medium">
        Sinkronisasi Database Human Capital...
      </div>
    );

  return (
    <div className="flex flex-col h-full bg-gray-50 font-[Inter] text-gray-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-sky-900 mb-3">
          Laporan Rekrutmen
        </h1>

        <div className="flex gap-2">
          {/* Toggle Saved Reports */}
          <button
            onClick={() => setShowSavedReports(!showSavedReports)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-sky-700 bg-white border border-sky-300 rounded-lg hover:bg-sky-50 transition-colors"
          >
            <Archive className="h-4 w-4" />
            {showSavedReports ? "Tampilkan Real-Time" : "Lihat Arsip"}
          </button>

          {/* Export Button (Auto-save to DB) */}
          <button
            onClick={() => exportReport("comprehensive")}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting ? "Menyimpan & Export..." : "Export & Simpan Laporan"}
          </button>
        </div>
      </div>

      {/* Saved Reports Section */}
      {showSavedReports && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Arsip Laporan</h2>

          {loadingSaved ? (
            <p className="text-gray-500 text-sm italic">Memuat arsip...</p>
          ) : savedReports.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              Belum ada arsip laporan. Klik "Export & Simpan Laporan" untuk
              membuat arsip pertama.
            </p>
          ) : (
            <div className="grid gap-3">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        Laporan{" "}
                        {report.period.charAt(0).toUpperCase() +
                          report.period.slice(1)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Periode:{" "}
                        {new Date(report.startDate).toLocaleDateString("id-ID")}{" "}
                        - {new Date(report.endDate).toLocaleDateString("id-ID")}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-700">
                          <strong>Total:</strong> {report.totalApplications}
                        </span>
                        <span className="text-green-600">
                          <strong>Diterima:</strong> {report.accepted}
                        </span>
                        <span className="text-red-600">
                          <strong>Ditolak:</strong> {report.rejected}
                        </span>
                        <span className="text-sky-600">
                          <strong>Rate:</strong> {report.conversionRate}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500 text-right">
                        Disimpan:{" "}
                        {new Date(report.createdAt).toLocaleString("id-ID")}
                      </div>
                      <button
                        onClick={() => deleteSavedReport(report.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Tren Lamaran */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center p-6 pb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Tren Lamaran
              </h3>
              <p className="text-sm text-gray-500">
                Filter aktif: {trendPeriod.label}
              </p>
            </div>
            <PeriodDropdown selected={trendPeriod} onChange={setTrendPeriod} />
          </div>
          <CardContent>
            <div className="h-64">
              <Bar
                key={trendPeriod.id}
                data={{
                  labels: trendData.labels || [],
                  datasets: [
                    {
                      label: "Jumlah",
                      data: trendData.applications || [],
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: Posisi */}
        <Card>
          <div className="p-6 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Jabatan Terpopuler
            </h3>
          </div>
          <CardContent>
            <div className="h-64 flex justify-center items-center">
              <Doughnut
                data={{
                  labels: detailedPositions.map((p) => p.position),
                  datasets: [
                    {
                      data: detailedPositions.map((p) => p.count),
                      backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
            {showFullPositionList && (
              <div className="mt-4 space-y-2 pt-4 border-t">
                {detailedPositions.map((item) => (
                  <div
                    key={item.position}
                    className="flex items-center text-sm p-2 bg-gray-50 rounded-md"
                  >
                    <div className="w-full max-w-[40%] flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-gray-800 font-medium">
                        {item.position}
                      </span>
                    </div>
                    <div className="w-24 text-center font-bold text-sky-600">
                      {item.count}
                    </div>
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
              {showFullPositionList
                ? "Sembunyikan Detail"
                : "Lihat Detail Lamaran"}
            </button>
          </div>
        </Card>

        {/* CARD 3: Status Kandidat */}
        <Card className="self-start">
          <div className="flex justify-between items-center p-6 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Status Kandidat
            </h3>
            <PeriodDropdown
              selected={acceptancePeriod}
              onChange={setAcceptancePeriod}
            />
          </div>
          <CardContent>
            <div className="h-64">
              <Bar
                key={acceptancePeriod.id}
                data={{
                  labels: acceptanceData.labels || [],
                  datasets: [
                    {
                      label: "Jumlah",
                      data: acceptanceData.values || [],
                      backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons (Additional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <button
          onClick={() => exportReport("trend_analytics")}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" /> Export Tren
        </button>
        <button
          onClick={() => exportReport("position_analytics")}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" /> Export Posisi
        </button>
        <button
          onClick={() => exportReport("comprehensive")}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" /> Export Lengkap
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
            className={({ active }) =>
              `px-3 py-2 cursor-pointer transition-colors ${
                active ? "bg-sky-100 text-sky-700" : "text-gray-700"
              }`
            }
          >
            {opt.label}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </div>
  </Listbox>
);

export default Reports;
