import React from "react";
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

function Dashboard() {
  // 📌 Data dummy
  const stats = [
    {
      title: "Total Pelamar",
      value: "1,234",
      change: "+12% dari bulan lalu",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Lowongan Aktif",
      value: "23",
      change: "+3 lowongan baru",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      title: "Lamaran Hari Ini",
      value: "89",
      change: "+5% dari kemarin",
      icon: FileText,
      color: "text-orange-600",
    },
    {
      title: "Diterima Bulan Ini",
      value: "45",
      change: "+8% dari target",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  const latestApplications = [
    { name: "Ahmad Rizki", position: "Frontend Developer", time: "2 jam lalu", status: "Under Review" },
    { name: "Sari Indah", position: "UI/UX Designer", time: "4 jam lalu", status: "Interview HC" },
    { name: "Budi Santoso", position: "Backend Developer", time: "6 jam lalu", status: "Under Review" },
    { name: "Maya Putri", position: "Product Manager", time: "8 jam lalu", status: "Psikotes" },
  ];

  const pipeline = [
    { title: "Under Review", icon: Clock, color: "text-orange-500", value: 65, count: 156 },
    { title: "Interview HC", icon: UserCheck, color: "text-blue-500", value: 45, count: 89 },
    { title: "Psikotes", icon: AlertCircle, color: "text-purple-500", value: 25, count: 34 },
    { title: "Final Interview", icon: TrendingUp, color: "text-green-500", value: 15, count: 12 },
  ];

  return (
    <div>
      {/* 🟢 Judul Dashboard */}
      {/* <h1 className="text-3xl font-bold text-gray-700 mb-3">Dashboard Admin</h1>
      <p className="text-sm font-semibold text-gray-400 mb-7">
        Ringkasan proses rekrutmen terbaru
      </p> */}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* 🟢 Lamaran Terbaru */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-1">Lamaran Terbaru</h3>
          <p className="text-sm text-gray-500 mb-4">
            Pelamar yang baru mendaftar hari ini
          </p>
          <div className="space-y-3">
            {latestApplications.map((a, i) => (
              <div
                key={i}
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
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      a.status === "Under Review"
                        ? "bg-gray-200 text-gray-700"
                        : a.status === "Interview HC"
                        ? "bg-blue-100 text-blue-800"
                        : a.status === "Psikotes"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {a.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🟢 Pipeline Rekrutmen */}
        <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-1">Pipeline Rekrutmen</h3>
          <p className="text-sm text-gray-500 mb-4">
            Status pelamar dalam proses seleksi
          </p>
          <div className="space-y-4">
            {pipeline.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${stage.color}`} />
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
              );
            })}
          </div>
        </div>
      </div>

      {/* 🟢 Aksi Cepat */}
      <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-1">Aksi Cepat</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tugas yang perlu segera ditindaklanjuti
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Review CV Baru</p>
                <p className="text-sm text-gray-500">23 CV menunggu review</p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Jadwalkan Interview</p>
                <p className="text-sm text-gray-500">12 kandidat siap interview</p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Finalisasi Penerimaan</p>
                <p className="text-sm text-gray-500">5 kandidat siap diterima</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
