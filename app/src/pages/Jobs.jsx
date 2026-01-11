import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { fetchJobs } from "./Admin/Lokeradmin/services/api";

/**
 * ✅ Parse requirements agar selalu jadi array per-point
 * Support:
 * - array: ["A", "B"]
 * - string dipisah newline: "A\nB\nC"
 * - string dipisah koma/semicolon: "A, B; C"
 */
function parseRequirements(req) {
  if (!req) return [];

  // kalau sudah array
  if (Array.isArray(req)) {
    return req.map((x) => String(x).trim()).filter(Boolean);
  }

  // kalau string
  const s = String(req).trim();
  if (!s) return [];

  // pecah berdasarkan newline / koma / semicolon
  return s
    .split(/\r?\n|,|;/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

const Jobs = ({ newJobFromAdmin }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load jobs awal
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();
        if (Array.isArray(data) && data.length) {
          // 1. Filter hanya job aktif
          const activeJobs = data.filter((job) => job.status === "active");

          // 2. Sorting terbaru
          const sortedJobs = activeJobs.sort((a, b) => b.id - a.id);

          // 3. Ambil 3 job terbaru
          setJobs(sortedJobs.slice(0, 3));
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error("Gagal fetch jobs", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // Tambah job baru jika ada prop baru dari LokerAdmin
  useEffect(() => {
    if (!newJobFromAdmin || typeof newJobFromAdmin !== "object") return;
    if (newJobFromAdmin.status !== "active") return;

    setJobs((prevJobs) => {
      const updated = [newJobFromAdmin, ...prevJobs];
      return updated.slice(0, 3);
    });
  }, [newJobFromAdmin]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="py-16 px-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-[80rem] mx-auto mb-12">
        <h1 className="text-gray-900 font-extrabold text-3xl sm:text-4xl">
          Lowongan{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
            Terbaru
          </span>
        </h1>
        <Link
          to="/lowongan"
          className="mt-4 sm:mt-0 border border-sky-600/50 text-sky-600 px-5 sm:px-6 py-2 rounded-xl hover:bg-sky-600/50 hover:text-white transition font-semibold flex items-center gap-1"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Job Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-[80rem] mx-auto">
        {jobs.map((job) => {
          const reqs = parseRequirements(job.requirements);

          // ✅ hanya tampil 3
          const shownReqs = reqs.slice(0, 4);
          const remaining = Math.max(0, reqs.length - shownReqs.length);

          return (
            <div
              key={job.id}
              className="rounded-2xl p-6 sm:p-8 min-h-[420px] flex flex-col justify-between bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-center mb-4 space-x-2">
                  <span className="bg-orange-200 text-amber-800 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                    {job.department || "N/A"}
                  </span>
                  <span className="border border-gray-300 text-gray-600 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium">
                    {job.type || "N/A"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 text-left mb-3">
                  {job.title || "No Title"}
                </h2>

                <p className="text-sm text-gray-500 text-left line-clamp-3 mb-4">
                  {job.description || "Deskripsi tidak tersedia"}
                </p>

                <div className="space-y-2 text-left mb-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {job.location || "Lokasi tidak tersedia"}
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <div className="text-sm font-semibold text-gray-800">
                    Persyaratan Utama:
                  </div>

                  {/* ✅ tampil per-point + max 3 */}
                  <ul className="text-sm text-gray-600 space-y-1">
                    {shownReqs.length ? (
                      shownReqs.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1 font-extrabold">
                            •
                          </span>
                          <span className="leading-snug">{req}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 italic">Tidak ada persyaratan</li>
                    )}

                    {/* ✅ jika lebih dari 3 */}
                    {remaining > 0 && (
                      <li className="text-gray-500 text-xs font-semibold">
                        +{remaining} lainnya
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <Link
                to={`/lowongan?jobId=${job.id}`}
                className="mt-6 w-full py-3 px-4 rounded-xl text-center text-white font-semibold transition shadow-lg shadow-blue-800/50 transform hover:scale-[1.01] bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
              >
                Lamar Sekarang
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Jobs;
