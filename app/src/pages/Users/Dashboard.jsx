import React, { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle,
} from "lucide-react";

// URL BACKEND YANG BARU DIBUAT (Endpoint Tunggal)
const API_URL = "http://localhost:4000/api/dashboard/data";

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [latestApplications, setLatestApplications] = useState([]);
  const [pipeline, setPipeline] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data Pipeline yang statis (fallback visual)
  const pipelineInitial = [
    { title: "Under Review", icon: Clock, color: "text-orange-500", value: 65, count: 156 },
    { title: "Interview HC", icon: UserCheck, color: "text-blue-500", value: 45, count: 89 },
    { title: "Psikotes", icon: AlertCircle, color: "text-purple-500", value: 25, count: 34 },
    { title: "Final Interview", icon: TrendingUp, color: "text-green-500", value: 15, count: 12 },
  ];
  
  // Placeholder awal
  const initialStatsTemplate = [
    { title: "Total Pelamar", value: "—", change: "Memuat...", icon: Users, color: "text-green-600" },
    { title: "Lowongan Aktif", value: "—", change: "Memuat...", icon: Briefcase, color: "text-blue-600" },
    { title: "Lamaran Hari Ini", value: "—", change: "Memuat...", icon: FileText, color: "text-orange-600" },
    { title: "Diterima Bulan Ini", value: "—", change: "Memuat...", icon: CheckCircle, color: "text-green-600" },
  ];
  
  useEffect(() => {
    setStats(initialStatsTemplate);

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error(`Gagal memuat data: ${response.statusText}`);
        
        const data = await response.json();
        
        const newStats = [
          {
            title: "Total Pelamar",
            value: data.stats.totalApplications.toLocaleString(),
            change: "+11% dari bulan lalu",
            icon: Users,
            color: "text-green-600",
          },
          {
            title: "Lowongan Aktif",
            value: data.activePositionsCount.toString(),
            change: `Total ${data.totalPositionsCount} lowongan`,
            icon: Briefcase,
            color: data.activePositionsCount > 0 ? "text-blue-600" : "text-gray-500",
          },
          {
            title: "Lamaran Hari Ini",
            value: data.stats.applicationsToday.toString(),
            change: "+5% dari kemarin",
            icon: FileText,
            color: "text-orange-600",
          },
          {
            title: "Diterima Bulan Ini",
            value: data.stats.acceptedThisMonth.toString(),
            change: "+8% dari target",
            icon: CheckCircle,
            color: "text-green-600",
          },
        ];

        setLatestApplications(data.latestApplications);
        setPipeline(data.pipeline);
        
        setStats(newStats);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal terhubung ke backend (Port 4000). Pastikan server berjalan.");
        
        setStats(prevStats =>
          prevStats.map(stat => ({
            ...stat,
            value: "ERR",
            change: "Koneksi backend gagal",
            color: "text-red-500",
          }))
        );
        setPipeline(pipelineInitial);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper badge status
  const getStatusClasses = (status) => {
    switch (status) {
      case "Under Review": return "bg-gray-200 text-gray-700";
      case "Interview HC": return "bg-blue-100 text-blue-800";
      case "Psikotes": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      {/* 🟢 Judul Dashboard */}
      <h1 className="text-2xl font-semibold text-sky-900 mb-3">Dashboard Rekrutmen</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error} 
        </div>
      )}
      
      {/* 🟢 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-500">{item.title}</h2>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-gray-500 mt-1">{item.change}</p>
            </div>
          );
        })}
      </div>

      {/* 🟢 Dual Panel: Latest Apps & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Lamaran Terbaru */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-1">Lamaran Terbaru</h3>
          <p className="text-sm text-gray-500 mb-4">Pelamar yang baru mendaftar hari ini</p>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data lamaran...</div>
          ) : (
            <div className="space-y-3">
              {latestApplications.map((a, i) => (
                <div
                  key={`app-${a.id || i}`} 
                  className="flex items-center justify-between border border-gray-100 rounded-md p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {a.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusClasses(a.status)}`}>
                      {a.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pipeline Rekrutmen */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-1">Pipeline Rekrutmen</h3>
          <p className="text-sm text-gray-500 mb-4">
            Status pelamar dalam proses seleksi
          </p>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data pipeline...</div>
          ) : (
            <div className="space-y-4">
              {pipeline.map((stage, i) => (
                <div 
                  key={`pipe-${stage.title || i}`} 
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {stage.title === "Under Review" && <Clock className={`h-4 w-4 ${stage.color}`} />}
                    {stage.title === "Interview HC" && <UserCheck className={`h-4 w-4 ${stage.color}`} />}
                    {stage.title === "Psikotes" && <AlertCircle className={`h-4 w-4 ${stage.color}`} />}
                    {stage.title === "Final Interview" && <TrendingUp className={`h-4 w-4 ${stage.color}`} />}
                    <span className="text-sm font-medium">{stage.title}</span>
                  </div>
                  <div className="flex items-center gap-2 w-40">
                    <span className="text-sm text-gray-500">{stage.count} pelamar</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${stage.value}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
