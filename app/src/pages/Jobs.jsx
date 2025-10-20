import React from "react";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const jobs = [
  {
    id: 6,
    title: "Product Manager - Makanan Instan",
    department: "Product Development",
    location: "Jakarta",
    type: "Full-time",
    experience: "3-5 tahun",
    description:
      "Memimpin pengembangan produk makanan instan inovatif untuk pasar Indonesia dan regional...",
    requirements: [
      "S1 Teknologi Pangan/Marketing",
      "Pengalaman product management",
      "Kemampuan analisis pasar",
    ],
    deadline: "31 Oktober 2025",
  },
  {
    id: 7,
    title: "Quality Assurance Specialist",
    department: "Quality Control",
    location: "Surabaya",
    type: "Full-time",
    experience: "2-4 tahun",
    description:
      "Memastikan kualitas produk sesuai standar internasional dan regulasi pemerintah...",
    requirements: [
      "S1 Teknologi Pangan/Kimia",
      "Sertifikasi HACCP/ISO",
      "Detail oriented",
    ],
    deadline: "15 November 2025",
  },
  {
    id: 8,
    title: "Digital Marketing Manager",
    department: "Marketing",
    location: "Jakarta",
    type: "Full-time",
    experience: "4-6 tahun",
    description:
      "Mengembangkan strategi pemasaran digital untuk meningkatkan brand awareness...",
    requirements: [
      "S1 Marketing/Komunikasi",
      "Pengalaman digital marketing",
      "Data-driven mindset",
    ],
    deadline: "10 November 2025",
  },
];

const Jobs = () => {
  return (
    <div className="py-16 px-4 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between max-w-[80rem] mx-auto mb-12">
        <div>
          <h1 className="text-gray-900 font-extrabold text-3xl sm:text-4xl">
            Lowongan{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Terbaru
            </span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            Temukan posisi yang cocok untuk langkah karier Anda berikutnya.
          </p>
        </div>

        <Link
          to="/lowongan"
          className="mt-4 sm:mt-0 border-1 border-sky-600/50 text-sky-600 px-5 sm:px-6 py-2 rounded-xl hover:bg-sky-600/50 hover:text-white transition font-semibold text-sm sm:text-base flex items-center gap-1"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Job Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-[80rem] mx-auto">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-2xl p-6 sm:p-8 min-h-[420px] flex flex-col justify-between bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div>
              {/* Department & Type */}
              <div className="flex justify-between items-center mb-4 space-x-2">
                <span className="bg-orange-200 text-amber-800 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                  {job.department}
                </span>
                <span className="border border-gray-300 text-gray-600 text-[10px] sm:text-xs px-3 py-1 rounded-full font-medium">
                  {job.type}
                </span>
              </div>

              {/* Job Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 text-left mb-3">
                {job.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-500 text-left line-clamp-3 mb-4">
                {job.description}
              </p>

              {/* Location & Experience */}
              <div className="space-y-2 text-left mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Clock className="h-4 w-4 text-blue-600" />
                  {job.experience}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-2 text-left">
                <div className="text-sm font-semibold text-gray-800">
                  Persyaratan Utama:
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {job.requirements.map((req, index) => (
                    <li
                      key={`${job.id}-req-${index}`}
                      className="flex items-start gap-2"
                    >
                      <span className="text-amber-600 mt-1 font-extrabold">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Apply Button */}
            <Link
              to={`/lowongan?jobId=${job.id}`}
              className="mt-6 w-full py-3 px-4 rounded-xl text-center text-white font-semibold transition shadow-lg shadow-blue-800/50 transform hover:scale-[1.01]
                bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
            >
              Lamar Sekarang
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
