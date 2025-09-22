import React, { useState } from "react";
import {
  Search,
  GraduationCap,
  Briefcase,
  MapPin,
  Settings,
  Building2,
  Calendar,
} from "lucide-react";

// ✅ Komponen JobCard
function JobCard({
  title,
  category,
  company,
  location,
  experience,
  department,
  validUntil,
  isNew,
}) {
  return (
    <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-800">
            {category}
          </span>
          {isNew && (
            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
              Baru
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-900 transition-colors">
          {title}
        </h3>

        {/* Job Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{company}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>{experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{department}</span>
          </div>
        </div>

        {/* Valid Until */}
        <div className="pt-2 border-t text-xs text-gray-500">
          Berlaku hingga {validUntil}
        </div>
      </div>
    </div>
  );
}

// ✅ Data Lowongan
const jobData = [
  {
    id: 1,
    title: "SAP FI",
    category: "Information Technology",
    company: "Corporate",
    location: "Sudirman Plaza - Jakarta Selatan",
    experience: "S1",
    department: "Pengalaman - Tetap",
    validUntil: "03 Nov 2025",
    isNew: true,
  },
  {
    id: 2,
    title: "SAP Plant Maintenance",
    category: "Information Technology",
    company: "Corporate",
    location: "Sudirman Plaza - Jakarta Selatan",
    experience: "S1",
    department: "Pengalaman - Tetap",
    validUntil: "03 Nov 2025",
  },
  {
    id: 3,
    title: "Digital Marketing Specialist",
    category: "Marketing",
    company: "Corporate",
    location: "Jakarta Pusat",
    experience: "S1",
    department: "Pengalaman - Tetap",
    validUntil: "15 Nov 2025",
  },
  {
    id: 4,
    title: "Financial Analyst",
    category: "Finance",
    company: "Corporate",
    location: "Jakarta Selatan",
    experience: "S1",
    department: "Pengalaman - Tetap",
    validUntil: "20 Nov 2025",
    isNew: true,
  },
  {
    id: 5,
    title: "HR Business Partner",
    category: "Human Resources",
    company: "Corporate",
    location: "Jakarta Pusat",
    experience: "S1",
    department: "Pengalaman - Tetap",
    validUntil: "25 Nov 2025",
  },
  {
    id: 6,
    title: "Supply Chain Coordinator",
    category: "Operations",
    company: "Corporate",
    location: "Bekasi",
    experience: "S1",
    department: "Pengalaman - Tetap",
    validUntil: "30 Nov 2025",
  },
];

// ✅ Komponen Filter
function JobFilters() {
  return (
    <div className="w-80 bg-white rounded-lg border border-gray-200 p-6 h-fit">
      <div className="space-y-6">
        {/* Education Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <GraduationCap className="h-4 w-4" />
            Pendidikan
          </div>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600">
            <option value="">Pilih pendidikan</option>
            <option value="sma">SMA/SMK</option>
            <option value="d3">Diploma (D3)</option>
            <option value="s1">Sarjana (S1)</option>
            <option value="s2">Magister (S2)</option>
            <option value="s3">Doktor (S3)</option>
          </select>
        </div>

        {/* Experience Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Briefcase className="h-4 w-4" />
            Pengalaman
          </div>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600">
            <option value="">Pilih pengalaman</option>
            <option value="fresh">Fresh Graduate</option>
            <option value="1-2">1-2 Tahun</option>
            <option value="3-5">3-5 Tahun</option>
            <option value="5+">5+ Tahun</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="h-4 w-4" />
            Lokasi
          </div>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600">
            <option value="">Pilih lokasi</option>
            <option value="jakarta">Jakarta</option>
            <option value="surabaya">Surabaya</option>
            <option value="bandung">Bandung</option>
            <option value="medan">Medan</option>
            <option value="semarang">Semarang</option>
          </select>
        </div>

        {/* Function Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Settings className="h-4 w-4" />
            Fungsi
          </div>
          <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600">
            <option value="">Pilih fungsi</option>
            <option value="it">Information Technology</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Hapus
          </button>
          <button className="flex-1 bg-sky-700 text-white rounded-md px-4 py-2 text-sm hover:bg-sky-600">
            Lihat Hasil
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ Komponen Pagination
function Pagination({ totalPages, currentPage, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Prev Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-md border disabled:opacity-50"
      >
        &lt;
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-2 rounded-md ${
            currentPage === index + 1
              ? "bg-blue-100 text-blue-600 border"
              : "hover:bg-gray-100"
          }`}
        >
          {index + 1}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-md border disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  );
}

// ✅ Halaman Lowongan
function Lowongan() {
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const totalPages = Math.ceil(jobData.length / jobsPerPage);

  const startIndex = (currentPage - 1) * jobsPerPage;
  const selectedJobs = jobData.slice(startIndex, startIndex + jobsPerPage);

  return (
    <section className="relative bg-white overflow-hidden min-h-screen">
      {/* Decorative circles */}
      <div className="absolute top-10 right-20 w-32 h-32 bg-gray-100 rounded-full"></div>
      <div className="absolute top-32 right-40 w-20 h-20 bg-gray-50 rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gray-50 rounded-full"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-4 gap-9 lg:gap-20">
        {/* Sidebar Filter */}
        <JobFilters />

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Search Form */}
          <div className="p-6 mt-2">
            <div className="flex gap-3">
              {/* Input manual */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari Lowongan"
                  className="w-full pl-4 pr-10 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Button manual */}
              <button className="bg-sky-700 hover:bg-sky-600 text-white px-8 py-3 text-base font-medium rounded-md transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Job List */}
          <div className="grid md:grid-cols-2 gap-6">
            {selectedJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </section>
  );
}

export default Lowongan;
