// src/components/Lokeradmin.jsx
import React, { useState, useEffect } from "react";
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

const API_URL = "http://localhost:4000/api/jobs";

function Lokeradmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Gagal mengambil data dari backend.");
      }

      const result = await response.json();

      // 🔥 PERBAIKAN: Cek struktur response
      // Jika response berbentuk { data: [...] }
      const jobsData = result.data || result;

      // Validasi apakah jobsData adalah array
      if (!Array.isArray(jobsData)) {
        console.error("Response tidak valid:", result);
        throw new Error("Format data dari backend tidak valid");
      }

      const dataWithDefaults = jobsData.map((job) => ({
        ...job,
        applicants: job.applicants ?? 0,
      }));

      setJobs(dataWithDefaults);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(
        err.message ||
          "Gagal terhubung ke backend. Pastikan server berjalan di port 4000."
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const totalApplicants = jobs.reduce(
    (sum, job) => sum + (job.applicants || 0),
    0
  );

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
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setIsEditMode(true);
    setIsCreateOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus lowongan ini?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Gagal menghapus lowongan.");
        }

        setJobs((prev) => prev.filter((job) => job.id !== id));
        setError(null);
      } catch (err) {
        console.error("Delete Error:", err);
        setError("Gagal menghapus lowongan. Coba lagi.");
      }
    }
  };

  const handleSaveJob = async (formData) => {
    const jobData = {
      title: formData.judulPosisi,
      department: formData.departemen,
      location: formData.lokasi,
      type: formData.tipePekerjaan,
      status: formData.status,
      deadline: formData.deadline,
      description: formData.deskripsi,
      requirements: formData.persyaratan,
    };

    try {
      let response;
      if (isEditMode && selectedJob) {
        response = await fetch(`${API_URL}/${selectedJob.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gagal menyimpan data ke backend. Server merespon: ${errorText}`
        );
      }

      fetchJobs();
      setIsEditMode(false);
      setSelectedJob(null);
      setIsCreateOpen(false);
      setError(null);
    } catch (err) {
      console.error("Save Error:", err);
      setError(`Gagal menyimpan: ${err.message}.`);
    }
  };

  const handleActionSelect = (job, action) => {
    if (action === "view") handleView(job);
    else if (action === "edit") handleEdit(job);
    else if (action === "delete") handleDelete(job.id);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-sky-900 mb-3">
        Lowongan Kerja
      </h1>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Filter + Tombol */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari lowongan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-sky-500/30 focus:outline-none"
            />
          </div>

          {/* Filter Status */}
          <Listbox value={statusFilter} onChange={setStatusFilter}>
            {({ open }) => (
              <div className="relative w-44">
                <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                  <span>
                    {statusFilter === "all"
                      ? "Semua Status"
                      : statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm p-1">
                  {["all", "active", "draft", "closed"].map((st) => (
                    <Listbox.Option key={st} value={st}>
                      {({ active, selected }) => (
                        <div
                          className={`flex justify-between capitalize items-center px-3 py-2 cursor-pointer rounded-md ${
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
        </div>

        <button
          onClick={() => {
            setIsEditMode(false);
            setSelectedJob(null);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 rounded-lg text-white font-semibold transition shadow-lg bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
        >
          + Buat Lowongan Baru
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg shadow bg-white">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Memuat data lowongan...
          </div>
        ) : (
          <table className="w-full text-left text-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Posisi</th>
                <th className="px-4 py-3">Departemen</th>
                <th className="px-4 py-3">Lokasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pelamar</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 transition-colors"
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
                    <td className="px-4 py-3 text-right">
                      <Listbox
                        value={null}
                        onChange={(action) => handleActionSelect(job, action)}
                      >
                        <div className="relative inline-block">
                          <Listbox.Button className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-sky-500/30">
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </Listbox.Button>
                          {/* MODIFIKASI: Muncul ke atas jika merupakan salah satu dari 2 baris terakhir */}
                          <Listbox.Options
                            className={`absolute right-0 w-40 bg-white border border-gray-400 rounded-lg shadow-lg z-50 p-1 ${
                              index >= filteredJobs.length - 2
                                ? "bottom-full mb-2" // Dua baris terakhir: muncul ke atas
                                : "top-full mt-2" // Selain itu: muncul ke bawah
                            }`}
                          >
                            <Listbox.Option value="view">
                              {({ active }) => (
                                <div
                                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg cursor-pointer text-left ${
                                    active
                                      ? "bg-sky-100 text-sky-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <Eye className="w-4 h-4 mr-2" /> Lihat
                                </div>
                              )}
                            </Listbox.Option>
                            <Listbox.Option value="edit">
                              {({ active }) => (
                                <div
                                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg cursor-pointer text-left ${
                                    active
                                      ? "bg-sky-100 text-sky-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </div>
                              )}
                            </Listbox.Option>
                            <Listbox.Option value="delete">
                              {({ active }) => (
                                <div
                                  className={`flex items-center w-full px-3 py-2 text-sm rounded-lg cursor-pointer text-left ${
                                    active
                                      ? "bg-red-100 text-red-700"
                                      : "text-red-600"
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Hapus
                                </div>
                              )}
                            </Listbox.Option>
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada lowongan yang cocok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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
