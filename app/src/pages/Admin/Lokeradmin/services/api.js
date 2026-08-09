// src/services/jobs.api.js
import axiosInstance from "../../../../api/axiosInstance";
// ⬆️ sesuaikan path jika file ini ada di folder berbeda

/**
 * ✅ MAPPING FIELD
 * Backend (Prisma model `lowongan`) pakai nama Bahasa Indonesia:
 *   judul, lokasi, jenis, pengalaman, pendidikan,
 *   deskripsi, persyaratan, tenggat, status
 * Frontend (Create.jsx, JobTable.jsx, JobDetailModal.jsx, dst) pakai nama Inggris:
 *   title, department, location, type, experienceLevel, educationLevel,
 *   description, requirements, deadline, status
 *
 * ⚠️ CATATAN PENTING soal `departemen`:
 * Kolom `departemen` SUDAH DIHAPUS dari tabel `lowongan`.
 * Departemen sekarang cuma ada di tabel `pengajuan_sdm` dan diambil
 * lewat relasi `pengajuan_sdm_id` (lowongan.pengajuan_sdm.departemen).
 * Backend (job.service.js) sudah nge-flatten field ini ke root object
 * di findJobs / findJobById / updateJob, TAPI tidak di createJob
 * (createJob cuma include relasi tanpa flatten manual).
 * Makanya di sini kita selalu fallback ke job.pengajuan_sdm?.departemen
 * supaya aman di semua kondisi (create/update/list/detail).
 *
 * Dan karena `departemen` bukan field di model `lowongan`, JANGAN pernah
 * kirim `departemen` di payload POST/PUT ke /jobs — Prisma akan error
 * "Unknown argument `departemen`". Departemen ikut otomatis dari
 * pengajuan_sdm yang dipilih (pengajuan_sdm_id), bukan input manual.
 *
 * Mapping dipusatkan di sini supaya komponen React tidak perlu tahu
 * field asli di database.
 */

// Backend -> Frontend (dipakai untuk hasil GET)
function mapJobFromApi(job) {
  if (!job) return job;
  return {
    id: job.id,
    title: job.judul,
    // fallback ke relasi pengajuan_sdm kalau backend belum flatten (mis. response createJob)
    department: job.departemen ?? job.pengajuan_sdm?.departemen ?? null,
    location: job.lokasi,
    type: job.jenis,
    experienceLevel: job.pengalaman,
    educationLevel: job.pendidikan,
    description: job.deskripsi,
    requirements: job.persyaratan,
    deadline: job.tenggat,
    status: job.status,
    applicants: job.applicants ?? 0,
    createdAt: job.created_at,
    pengajuanSdmId: job.pengajuan_sdm_id,
  };
}

// Frontend -> Backend (dipakai untuk payload POST/PUT)
function mapJobToApi(job) {
  const payload = {};
  if (job.title !== undefined) payload.judul = job.title;
  // ❌ JANGAN kirim `departemen` — kolom ini sudah tidak ada di tabel `lowongan`.
  //    Departemen ikut otomatis dari relasi pengajuan_sdm_id.
  if (job.location !== undefined) payload.lokasi = job.location;
  if (job.type !== undefined) payload.jenis = job.type;
  if (job.experienceLevel !== undefined) payload.pengalaman = job.experienceLevel;
  if (job.educationLevel !== undefined) payload.pendidikan = job.educationLevel;
  if (job.description !== undefined) payload.deskripsi = job.description;
  if (job.requirements !== undefined) payload.persyaratan = job.requirements;
  if (job.deadline !== undefined) payload.tenggat = job.deadline;
  if (job.status !== undefined) payload.status = job.status;
  if (job.pengajuanSdmId !== undefined) payload.pengajuan_sdm_id = job.pengajuanSdmId;
  return payload;
}

/**
 * GET jobs
 * ADMIN: isPublic=false supaya tidak difilter status=active
 */
export const fetchJobs = async () => {
  try {
    const res = await axiosInstance.get("/jobs", {
      params: {
        limit: 9999,
        isPublic: false,
      },
    });

    const data = res.data?.data || [];

    return data.map(mapJobFromApi);
  } catch (err) {
    console.error("Fetch Error:", err);
    return [];
  }
};

/**
 * CREATE / UPDATE job
 * - POST jika id null
 * - PUT jika id ada
 */
export const saveJob = async (jobData, id = null) => {
  const payload = mapJobToApi(jobData);

  const res = id
    ? await axiosInstance.put(`/jobs/${id}`, payload)
    : await axiosInstance.post("/jobs", payload);

  // backend balikin { success, message, data: {judul, ...} }
  // kita map "data" kembali ke format Inggris supaya Lokeradmin.jsx
  // (yang baca response?.data?.id, dst) tetap dapat field yang benar.
  return {
    ...res.data,
    data: mapJobFromApi(res.data?.data),
  };
};

/**
 * DELETE job
 */
export const deleteJob = async (id) => {
  const res = await axiosInstance.delete(`/jobs/${id}`);
  return res.data;
};