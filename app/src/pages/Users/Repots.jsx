import React, { useState, useEffect } from "react";
import {
  User,
  TrendingUp,
  Clock,
  CheckCircle,
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

// --- HELPER COMPONENTS (Cards & Progress) ---
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children }) => (
  <div className="flex flex-row items-center justify-between p-6 pb-2">
    {children}
  </div>
);
const CardTitle = ({ children }) => (
  <h3 className="text-sm font-medium tracking-tight text-gray-500">
    {children}
  </h3>
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

// --- OPSI PERIODE ---
const periodOptions = [
  { id: "daily", label: "Harian" },
  { id: "weekly", label: "Mingguan" },
  { id: "monthly", label: "Bulanan" },
  { id: "yearly", label: "Tahunan" },
];

// --- FUNGSI DUMMY DATA RESPONSIVE ---
const getTrendData = (periodId) => {
  const baseYear = 2025;
  switch (periodId) {
    case "daily":
      return {
        labels: [
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
          "Minggu",
        ],
        applications: [15, 20, 18, 30, 25, 10, 5],
      };
    case "weekly":
      return {
        labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
        applications: [120, 150, 100, 180],
      };
    case "yearly":
      return {
        labels: [
          baseYear.toString(),
          (baseYear + 1).toString(),
          (baseYear + 2).toString(),
        ],
        applications: [1500, 1650, 1800],
      };
    case "monthly":
    default:
      return {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ],
        applications: [50, 75, 60, 90, 80, 110, 100, 95, 85, 70, 65, 55],
      };
  }
};

const getPositionData = (periodId) => {
  let data;
  switch (periodId) {
    case "daily":
      data = [20, 15, 10, 5];
      break;
    case "yearly":
      data = [500, 400, 300, 200];
      break;
    case "weekly":
      data = [100, 80, 60, 40];
      break;
    case "monthly":
    default:
      data = [234, 189, 156, 98];
      break;
  }
  return {
    labels: ["Frontend", "Backend", "UI/UX", "Product"],
    applications: data,
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"], // Hex colors for detail view
  };
};

const getAcceptanceData = (periodId) => {
  const baseYear = 2025;
  const acceptanceColors = [
    "rgba(16, 185, 129, 0.8)",
    "rgba(239, 68, 68, 0.8)",
  ];

  switch (periodId) {
    case "daily":
      return {
        labels: ["Diterima", "Ditolak"],
        applications: [10, 5],
        colors: acceptanceColors,
      };
    case "yearly":
      return {
        labels: [
          baseYear.toString(),
          (baseYear + 1).toString(),
          (baseYear + 2).toString(),
        ],
        applications: [150, 165, 180],
        colors: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(59, 130, 246, 0.8)",
        ],
      };
    case "weekly":
      return {
        labels: ["Diterima", "Ditolak"],
        applications: [30, 15],
        colors: acceptanceColors,
      };
    case "monthly":
    default:
      return {
        labels: ["Diterima", "Ditolak"],
        applications: [89, 43],
        colors: acceptanceColors,
      };
  }
};
// --- AKHIR FUNGSI DUMMY DATA RESPONSIVE ---

const getDetailedPositions = (positionData) => {
  const totalApplications = positionData.applications.reduce(
    (sum, count) => sum + count,
    0
  );

  return positionData.labels.map((label, index) => {
    const count = positionData.applications[index];
    const percentage =
      totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;

    return {
      position: label,
      count: count,
      percentage: percentage,
      color: positionData.colors[index], // Tambahkan warna untuk legend detail
    };
  });
};

// --- BAR CHART COMPONENT ---
const BarChart = ({ data, title, primaryColor }) => {
  const getBorderColor = (color) => {
    if (Array.isArray(color)) {
      return color.map((c) => String(c).replace("0.8", "1"));
    }
    return String(color).replace("0.8", "1");
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label:
          data.labels.length > 2 && data.labels[0].length < 5
            ? "Jumlah Lamaran"
            : "Jumlah Kandidat",
        data: data.applications,
        backgroundColor: primaryColor,
        borderColor: getBorderColor(primaryColor),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: data.labels.length > 2 && data.labels.length !== 2,
      },
      title: { display: true, text: title, font: { size: 16 } },
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
    maintainAspectRatio: false,
  };

  return <Bar data={chartData} options={options} />;
};
// --- AKHIR BAR CHART ---

// --- DOUGHNUT CHART COMPONENT ---
const DoughnutChart = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Jumlah Lamaran",
        data: data.applications,
        backgroundColor: data.colors,
        hoverOffset: 10,
        spacing: 4,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: { padding: 15, boxWidth: 10, font: { size: 12 } },
      },
      title: { display: true, text: title, font: { size: 16 } },
    },
    maintainAspectRatio: false,
  };

  return <Doughnut data={chartData} options={options} />;
};
// --- AKHIR DOUGHNUT CHART ---

// --- KOMPONEN UTAMA REPORTS ---
function Reports() {
  const [metrics, setMetrics] = useState(null);

  // State untuk 3 chart yang kini memiliki filter periode masing-masing
  const [trendPeriod, setTrendPeriod] = useState(periodOptions[0]);
  const [positionPeriod, setPositionPeriod] = useState(periodOptions[0]);
  const [acceptancePeriod, setAcceptancePeriod] = useState(periodOptions[0]);

  // State data chart (diperbarui di useEffect)
  const [trendData, setTrendData] = useState(getTrendData(periodOptions[0].id));
  const [responsivePositionData, setResponsivePositionData] = useState(
    getPositionData(periodOptions[0].id)
  );
  const [responsiveAcceptanceData, setResponsiveAcceptanceData] = useState(
    getAcceptanceData(periodOptions[0].id)
  );

  // STATE untuk menampilkan detail posisi
  const [showFullPositionList, setShowFullPositionList] = useState(false);

  // Data detail posisi yang sudah responsif
  const [detailedPositions, setDetailedPositions] = useState([]);

  useEffect(() => {
    // Data metrik statis yang tidak bergantung pada periode
    setMetrics({
      totalApplications: 1234,
      conversionRate: 23.5,
      avgProcessTime: 14,
      accepted: 89,
      pipeline: { review: 156, interview: 89, psikotes: 34, final: 12 },
      // Data statis (hanya untuk export/kartu metrik, detail visual diambil dari responsivePositionData)
      topPositions: [
        { position: "Frontend Developer", count: 234, percentage: 85 },
        { position: "Backend Developer", count: 189, percentage: 70 },
        { position: "UI/UX Designer", count: 156, percentage: 60 },
        { position: "Product Manager", count: 98, percentage: 40 },
        { position: "Data Analyst", count: 67, percentage: 25 },
        { position: "Cloud Engineer", count: 55, percentage: 20 },
        { position: "Mobile Developer", count: 42, percentage: 15 },
      ],
    });

    // Inisialisasi detail posisi pertama kali
    const initialPositionData = getPositionData(periodOptions[0].id);
    setDetailedPositions(getDetailedPositions(initialPositionData));
  }, []);

  useEffect(() => {
    setTrendData(getTrendData(trendPeriod.id));
  }, [trendPeriod]);

  useEffect(() => {
    const newPositionData = getPositionData(positionPeriod.id);
    setResponsivePositionData(newPositionData);
    // Perbarui Detail Posisi setiap kali periode berubah (memastikan sinkronisasi)
    setDetailedPositions(getDetailedPositions(newPositionData));
  }, [positionPeriod]);

  useEffect(() => {
    setResponsiveAcceptanceData(getAcceptanceData(acceptancePeriod.id));
  }, [acceptancePeriod]);

  // --- Helper Komponen untuk Dropdown Listbox ---
  const PeriodDropdown = ({ selected, onChange }) => (
    <Listbox value={selected} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-32">
          <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30 hover:border-gray-300 transition-colors">
            <span>{selected.label}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
            {periodOptions.map((option) => (
              <Listbox.Option key={option.id} value={option}>
                {({ active, selected }) => (
                  <div
                    className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
                      active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                    }`}
                  >
                    <span>{option.label}</span>
                    {selected && <Check className="w-4 h-4 text-sky-600" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  );
  // --- END Dropdown Helper ---

  // FUNGSI EXPORT CSV
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
    const currentTrendPeriodId = trendPeriod.id;
    const currentPositionPeriodId = positionPeriod.id;
    const currentAcceptancePeriodId = acceptancePeriod.id;
    let filename = `laporan_${type}.csv`;
    let csvData = "";

    // Pastikan metrics terisi sebelum mencoba export
    if (!metrics) {
      alert("Data metrik belum dimuat. Coba lagi.");
      return;
    }

    if (type === "comprehensive") {
      filename = `laporan_komprehensif.csv`; // Nama file umum

      csvData = `Laporan Komprehensif Seluruh Periode\n\n`;

      // 1. Tren Lamaran (Loop semua periode)
      csvData += `--- 1. Lamaran ---\n`;
      periodOptions.forEach((p) => {
        const trendDataExport = getTrendData(p.id);
        csvData += `\nPeriode: ${p.label}\n`;
        csvData += `Waktu,Jumlah Lamaran\n`;
        trendDataExport.labels.forEach((label, index) => {
          csvData += `${label},${trendDataExport.applications[index]}\n`;
        });
      });
      csvData += `\n`;

      // 2. Lamaran Berdasarkan Posisi (Loop semua periode)
      csvData += `--- 2. Lamaran Berdasarkan Posisi ---\n`;
      periodOptions.forEach((p) => {
        const positionDataExport = getPositionData(p.id);
        const detailPositionsExport = getDetailedPositions(positionDataExport);
        csvData += `\nPeriode: ${p.label}\n`;
        csvData += `Posisi,Jumlah Lamaran,Persentase\n`;
        detailPositionsExport.forEach((pos) => {
          // Menghitung ulang persentase di sini jika diperlukan, tetapi menggunakan data dari getDetailedPositions sudah cukup
          csvData += `${pos.position},${pos.count},${pos.percentage}%\n`;
        });
      });
      csvData += `\n`;

      // 3. Hasil Akhir Pelamar (Loop semua periode)
      csvData += `--- 3. Hasil Akhir Pelamar ---\n`;
      periodOptions.forEach((p) => {
        const acceptanceDataExport = getAcceptanceData(p.id);
        csvData += `\nPeriode: ${p.label}\n`;
        csvData += `Status,Jumlah Kandidat\n`;
        acceptanceDataExport.labels.forEach((label, index) => {
          csvData += `${label},${acceptanceDataExport.applications[index]}\n`;
        });
      });
    } else if (type === "trend_analytics") {
      // Logika untuk Tren Lamaran (Menggunakan periode yang saat ini ditampilkan)
      const trendDataExport = getTrendData(trendPeriod.id);
      filename = `laporan_tren_lamaran_${currentTrendPeriodId}.csv`;
      csvData = `Periode,Jumlah Lamaran\n`;
      trendDataExport.labels.forEach((label, index) => {
        csvData += `${label},${trendDataExport.applications[index]}\n`;
      });
    } else if (type === "position_analytics") {
      // Menggunakan data detail posisi yang responsif (periode yang saat ini ditampilkan)
      filename = `laporan_posisi_${currentPositionPeriodId}.csv`;
      csvData = `Posisi,Jumlah Lamaran,Persentase\n`;
      detailedPositions.forEach((pos) => {
        csvData += `${pos.position},${pos.count},${pos.percentage}%\n`;
      });
    } else if (type === "acceptance_analytics") {
      // Menggunakan data acceptance yang responsif (periode yang saat ini ditampilkan)
      const acceptanceData = getAcceptanceData(acceptancePeriod.id);
      filename = `laporan_hasil_akhir_${currentAcceptancePeriodId}.csv`;
      csvData = `Status,Jumlah Kandidat\n`;
      acceptanceData.labels.forEach((label, index) => {
        csvData += `${label},${acceptanceData.applications[index]}\n`;
      });
    }

    exportToCSV(filename, csvData);
  };
  // --- AKHIR FUNGSI EXPORT CSV ---

  return (
    <div className="flex flex-col h-full bg-gray-50 font-[Inter] text-gray-900 p-6 space-y-6">
      {/* Header filter + export */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-sky-900 mb-3">
          Laporan Rekrutmen
        </h1>
        <button
          // Tombol Export Laporan Lengkap (Komprehensif semua periode)
          onClick={() => exportReport("comprehensive")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg shadow-sm hover:bg-sky-700 transition-colors"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Laporan
        </button>
      </div>

      {/* Analisis CHART */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: Tren Lamaran (Penuh di atas) */}
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center p-6 pb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Lamaran</h3>
                <p className="text-sm text-gray-500">
                  Total lamaran yang masuk dari waktu ke waktu
                </p>
              </div>
              <PeriodDropdown
                selected={trendPeriod}
                onChange={setTrendPeriod}
              />
            </div>
            <CardContent>
              <div className="h-64">
                <BarChart
                  data={trendData}
                  title={`Lamaran ${trendPeriod.label}`}
                  primaryColor="rgba(59, 130, 246, 0.8)" // Tailwind blue-500
                />
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Lamaran Berdasarkan Posisi (KIRI BAWAH - 50%) - INI YANG MEMANJANG */}
          <Card>
            <div className="flex justify-between items-center p-6 pb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Lamaran Berdasarkan Posisi
                </h3>
                <p className="text-sm text-gray-500">
                  Distribusi posisi paling diminati
                </p>
              </div>
              <PeriodDropdown
                selected={positionPeriod}
                onChange={setPositionPeriod}
              />
            </div>
            <CardContent>
              <div className="h-64 flex justify-center items-center">
                <DoughnutChart
                  data={responsivePositionData}
                  title={`Lamaran ${positionPeriod.label}`}
                />
              </div>
              {/* Daftar Posisi yang Dapat Diperluas */}
              <div className="mt-4">
                {showFullPositionList && (
                  // Detail yang membuat Card ini memanjang
                  <div className="mt-4 space-y-2 pt-4">
                    <h4 className="text-md font-semibold text-gray-700">
                      Detail Lamaran Posisi ({positionPeriod.label}):
                    </h4>
                    {detailedPositions.map((item) => (
                      <div
                        key={item.position}
                        className="flex items-center text-sm p-2 bg-gray-50 rounded-md"
                      >
                        {/* Kolom Kiri: Warna dan Posisi (Mengambil ruang sisa, max 40%) */}
                        <div className="flex items-center space-x-2 w-full max-w-[40%]">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-gray-800 truncate">
                            {item.position}
                          </span>
                        </div>

                        {/* Kolom Tengah: Jumlah dan Persentase (Lebar Tetap untuk Penyejajaran Tengah) */}
                        <div className="w-24 text-center flex-shrink-0">
                          <span className="text-sky-600 font-bold">
                            {item.count}
                          </span>
                          <span className="text-gray-500 text-xs">
                            ({item.percentage}%)
                          </span>
                        </div>

                        {/* Kolom Kanan: Progress Bar (Lebar Tetap) */}
                        <div className="w-1/3 ml-4 flex-shrink-0">
                          <Progress
                            value={item.percentage}
                            color="bg-sky-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            {/* Tombol Toggle Detail (TANPA BORDER-T) */}
            <div
              className={`p-4 flex justify-center ${
                showFullPositionList ? "" : ""
              }`}
            >
              <button
                onClick={() => setShowFullPositionList(!showFullPositionList)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200"
              >
                {showFullPositionList
                  ? "Sembunyikan Detail"
                  : "Lihat Detail Lamaran"}
              </button>
            </div>
          </Card>

          {/* CARD 3: Jumlah Pelamar Diterima vs. Ditolak (KANAN BAWAH - 50%) */}
          {/* Menggunakan self-start agar kartu ini TIDAK memanjang bersama Card 2 */}
          <Card className="self-start">
            <div className="flex justify-between items-center p-6 pb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Hasil Akhir Pelamar
                </h3>
                <p className="text-sm text-gray-500">
                  Perbandingan jumlah kandidat yang diterima dan ditolak
                </p>
              </div>
              <PeriodDropdown
                selected={acceptancePeriod}
                onChange={setAcceptancePeriod}
              />
            </div>
            <CardContent>
              <div className="h-64">
                <BarChart
                  data={responsiveAcceptanceData}
                  title={`Kandidat Diterima vs Ditolak (${acceptancePeriod.label})`}
                  primaryColor={
                    responsiveAcceptanceData.labels.length === 2
                      ? ["rgba(16, 185, 129, 0.8)", "rgba(239, 68, 68, 0.8)"]
                      : "rgba(59, 130, 246, 0.8)"
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Options */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold">Export Data</h3>
          <p className="text-sm text-gray-500">
            Download laporan dalam berbagai format
          </p>
        </div>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tombol: Tren Lamaran (Periode yang sedang dipilih) */}
            <button
              onClick={() => exportReport("trend_analytics")}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              Lamaran
            </button>

            {/* Tombol: Lamaran Berdasarkan Posisi (Periode yang sedang dipilih) */}
            <button
              onClick={() => exportReport("position_analytics")}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              Lamaran Berdasarkan Posisi
            </button>

            {/* Tombol: Hasil Akhir Pelamar (Periode yang sedang dipilih) */}
            <button
              onClick={() => exportReport("acceptance_analytics")}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              Hasil Akhir Pelamar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Reports;
