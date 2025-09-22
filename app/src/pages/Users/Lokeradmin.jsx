// src/components/Lokeradmin.jsx
import React, { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  Eye,
  Edit,
  Trash2,
  ClipboardList,
  ChevronDown,
  Check,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import Create from "./Create";
import ViewJob from "./ViewJob";

const jobsData = [
  {
    id: 1,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Jakarta",
    type: "Full-time",
    status: "active",
    applicants: 45,
    posted: "2024-01-15",
    deadline: "2024-02-15",
    description: "Mengembangkan tampilan frontend aplikasi web.",
    requirements: "Menguasai React, Tailwind, Git.",
  },
  {
    id: 2,
    title: "UI/UX Designer",
    department: "Design",
    location: "Bandung",
    type: "Full-time",
    status: "active",
    applicants: 32,
    posted: "2024-01-10",
    deadline: "2024-02-10",
    description: "Membuat desain antarmuka yang intuitif.",
    requirements: "Figma, Adobe XD, riset pengguna.",
  },
  {
    id: 3,
    title: "Backend Developer",
    department: "Engineering",
    location: "Surabaya",
    type: "Full-time",
    status: "draft",
    applicants: 0,
    posted: "2024-01-20",
    deadline: "2024-02-20",
    description: "Membangun API dan layanan backend.",
    requirements: "Node.js, Express, Database.",
  },
  {
    id: 4,
    title: "Product Manager",
    department: "Product",
    location: "Jakarta",
    type: "Full-time",
    status: "closed",
    applicants: 78,
    posted: "2023-12-01",
    deadline: "2024-01-01",
    description: "Mengelola roadmap produk perusahaan.",
    requirements: "Leadership, komunikasi, analisis pasar.",
  },
];

function Lokeradmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobs, setJobs] = useState(jobsData);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    if (status === "active")
      return (
        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
          Active
        </span>
      );
    if (status === "draft")
      return (
        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
          Draft
        </span>
      );
    if (status === "closed")
      return (
        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-600">
          Closed
        </span>
      );
  };

  const handleView = (job) => {
    setSelectedJob(job);
    setIsViewOpen(true);
    setOpenMenu(null);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setIsEditMode(true);
    setIsCreateOpen(true);
    setOpenMenu(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus lowongan ini?")) {
      setJobs((prev) => prev.filter((job) => job.id !== id));
      setOpenMenu(null);
    }
  };

  const handleSaveJob = (newJob) => {
    if (isEditMode && selectedJob) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === selectedJob.id
            ? {
                ...job,
                title: newJob.judulPosisi,
                department: newJob.departemen,
                location: newJob.lokasi,
                type: newJob.tipePekerjaan,
                status: newJob.status,
                deadline: newJob.deadline,
                description: newJob.description ?? job.description,
                requirements: newJob.requirements ?? job.requirements,
              }
            : job
        )
      );
      setIsEditMode(false);
      setSelectedJob(null);
      setIsCreateOpen(false);
    } else {
      const jobWithId = {
        id: jobs.length + 1,
        title: newJob.judulPosisi,
        department: newJob.departemen,
        location: newJob.lokasi,
        type: newJob.tipePekerjaan,
        status: newJob.status,
        applicants: 0,
        posted: new Date().toISOString().split("T")[0],
        deadline: newJob.deadline,
        description: newJob.description ?? "",
        requirements: newJob.requirements ?? "",
      };
      setJobs((prev) => [...prev, jobWithId]);
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Lowongan */}
        <div className="flex justify-between items-center p-4 border border-gray-300 rounded-lg shadow bg-white">
          <div>
            <h3 className="text-sm text-gray-500">Total Lowongan</h3>
            <p className="text-2xl font-semibold">{totalJobs}</p>
            <span className="text-xs text-gray-400">Semua lowongan</span>
          </div>
          <div className="p-3 rounded-full bg-sky-100">
            <ClipboardList className="w-6 h-6 text-sky-600" />
          </div>
        </div>

        {/* Lowongan Aktif */}
        <div className="flex justify-between items-center p-4 border border-gray-300 rounded-lg shadow bg-white">
          <div>
            <h3 className="text-sm text-gray-500">Lowongan Aktif</h3>
            <p className="text-2xl font-semibold">{activeJobs}</p>
            <span className="text-xs text-gray-400">Sedang dibuka</span>
          </div>
          <div className="p-3 rounded-full bg-green-100">
            <Briefcase className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Total Pelamar */}
        <div className="flex justify-between items-center p-4 border border-gray-300 rounded-lg shadow bg-white">
          <div>
            <h3 className="text-sm text-gray-500">Total Pelamar</h3>
            <p className="text-2xl font-semibold">{totalApplicants}</p>
            <span className="text-xs text-gray-400">Dari semua lowongan</span>
          </div>
          <div className="p-3 rounded-full bg-purple-100">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Header + Filter + Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Daftar Lowongan</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari lowongan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* === Listbox Dropdown === */}
          <Listbox
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          >
            {({ open }) => (
              <div className="relative w-44">
                <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <span>
                    {statusFilter === "all" ? "Semua Status" : statusFilter}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Listbox.Button>

                <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
                  {["all", "active", "draft", "closed"].map((st, i) => (
                    <Listbox.Option key={i} value={st}>
                      {({ active, selected }) => (
                        <div
                          className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
                            active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                          }`}
                        >
                          <span>{st === "all" ? "Semua Status" : st}</span>
                          {selected && (
                            <Check className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            )}
          </Listbox>

          <button
            onClick={() => {
              setIsEditMode(false);
              setSelectedJob(null);
              setIsCreateOpen(true);
            }}
            className="bg-sky-700 text-white px-4 py-2 rounded-lg hover:bg-sky-800"
          >
            + Buat Lowongan Baru
          </button>
        </div>
      </div>

      {/* Tabel Lowongan */}
      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="w-full text-left text-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Posisi</th>
              <th className="px-4 py-3">Departemen</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pelamar</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr
                key={job.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-gray-500">{job.type}</div>
                </td>
                <td className="px-4 py-3">{job.department}</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {job.location}
                </td>
                <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" />
                  {job.applicants}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>Deadline</span>
                    </div>
                    <span className="text-sm">
                      {new Date(job.deadline).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right absolute overflow-visible">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() =>
                      setOpenMenu(openMenu === job.id ? null : job.id)
                    }
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>

                  {openMenu === job.id && (
                    <div className="absolute right-0 top-full w-40 bg-white border border-gray-400 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => handleView(job)}
                        className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-sky-100"
                      >
                        <Eye className="w-4 h-4 mr-2 text-gray-500" /> Lihat
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-sky-100"
                      >
                        <Edit className="w-4 h-4 mr-2 text-gray-500" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-sky-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Tidak ada lowongan yang cocok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Buat/Edit */}
      <Create
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditMode(false);
          setSelectedJob(null);
        }}
        onSave={handleSaveJob}
        initialData={isEditMode ? selectedJob : null}
      />

      {/* Modal ViewJob */}
      {isViewOpen && selectedJob && (
        <ViewJob
          isOpen={isViewOpen}
          job={selectedJob}
          onClose={() => setIsViewOpen(false)}
        />
      )}
    </div>
  );
}

export default Lokeradmin;
