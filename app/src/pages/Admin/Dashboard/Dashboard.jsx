import React, { useState, useEffect } from "react";
import StatsCards from "./components/StatsCards";
import LatestApplications from "./components/LatestApplications";
import Pipeline from "./components/Pipeline";
import { fetchDashboardData } from "./utils/api";
import { Users, Briefcase, FileText, CheckCircle, Clock, UserCheck, AlertCircle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [latestApplications, setLatestApplications] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pipelineInitial = [
    { title: "Under Review", icon: Clock, color: "text-orange-500", value: 65, count: 156 },
    { title: "Interview HC", icon: UserCheck, color: "text-blue-500", value: 45, count: 89 },
    { title: "Psikotes", icon: AlertCircle, color: "text-purple-500", value: 25, count: 34 },
    { title: "Final Interview", icon: TrendingUp, color: "text-green-500", value: 15, count: 12 },
  ];

  const initialStatsTemplate = [
    { title: "Total Pelamar", value: "—", change: "Memuat...", icon: Users, color: "text-green-600" },
    { title: "Lowongan Aktif", value: "—", change: "Memuat...", icon: Briefcase, color: "text-blue-600" },
    { title: "Lamaran Hari Ini", value: "—", change: "Memuat...", icon: FileText, color: "text-orange-600" },
    { title: "Diterima Bulan Ini", value: "—", change: "Memuat...", icon: CheckCircle, color: "text-green-600" },
  ];

  useEffect(() => {
    setStats(initialStatsTemplate);
    const fetchData = async () => {
      try {
        const data = await fetchDashboardData();
        setStats([
          { title: "Total Pelamar", value: data.stats.totalApplications.toLocaleString(), change: "+11% dari bulan lalu", icon: Users, color: "text-green-600" },
          { title: "Lowongan Aktif", value: data.activePositionsCount.toString(), change: `Total ${data.totalPositionsCount} lowongan`, icon: Briefcase, color: data.activePositionsCount > 0 ? "text-blue-600" : "text-gray-500" },
          { title: "Lamaran Hari Ini", value: data.stats.applicationsToday.toString(), change: "+5% dari kemarin", icon: FileText, color: "text-orange-600" },
          { title: "Diterima Bulan Ini", value: data.stats.acceptedThisMonth.toString(), change: "+8% dari target", icon: CheckCircle, color: "text-green-600" },
        ]);
        setLatestApplications(data.latestApplications);
        setPipeline(data.pipeline);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Gagal terhubung ke backend (Port 4000). Pastikan server berjalan.");
        setStats(prevStats => prevStats.map(stat => ({ ...stat, value: "ERR", change: "Koneksi backend gagal", color: "text-red-500" })));
        setPipeline(pipelineInitial);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-sky-900 mb-3">Dashboard Rekrutmen</h1>
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}
      <StatsCards stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <LatestApplications applications={latestApplications} loading={loading} />
        <Pipeline pipeline={pipeline} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
