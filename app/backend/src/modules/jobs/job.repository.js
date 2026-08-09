const prisma = require("../../config/prisma");

const toIntId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) ? n : NaN;
};

const createJob = async (data) => {
  return prisma.lowongan.create({
    data: {
      pengajuan_sdm_id: data.pengajuan_sdm_id,
      judul: data.judul,
      departemen: data.departemen, // ✅ KEMBALIKAN
      lokasi: data.lokasi,
      jenis: data.jenis,
      deskripsi: data.deskripsi,
      persyaratan: data.persyaratan,
      tenggat: data.tenggat ? new Date(data.tenggat) : null,
      status: data.status || "active",
    },
  });
};

const findJobById = async (id) => {
  const jobId = toIntId(id);
  if (!jobId) return null;

  const job = await prisma.lowongan.findUnique({
    where: { id: jobId },
    include: {
      _count: { select: { lamaran: true } },
      lamaran: true,
    },
  });

  if (!job) return null;

  return {
    ...job,
    applicants: job._count?.lamaran ?? job.lamaran?.length ?? 0,
  };
};

const updateJob = async (id, data) => {
  const jobId = toIntId(id);
  if (!jobId) {
    const err = new Error("Job ID tidak valid");
    err.statusCode = 400;
    throw err;
  }

  const payload = {
    ...(data.judul !== undefined && { judul: data.judul }),
    ...(data.departemen !== undefined && { departemen: data.departemen }), // ✅ KEMBALIKAN
    ...(data.lokasi !== undefined && { lokasi: data.lokasi }),
    ...(data.jenis !== undefined && { jenis: data.jenis }),
    ...(data.deskripsi !== undefined && { deskripsi: data.deskripsi }),
    ...(data.persyaratan !== undefined && { persyaratan: data.persyaratan }),
    ...(data.tenggat !== undefined && {
      tenggat: data.tenggat ? new Date(data.tenggat) : null,
    }),
    ...(data.status !== undefined && { status: data.status }),
  };

  try {
    const updated = await prisma.lowongan.update({
      where: { id: jobId },
      data: payload,
      include: { _count: { select: { lamaran: true } } },
    });

    return {
      ...updated,
      applicants: updated?._count?.lamaran ?? 0,
    };
  } catch (e) {
    if (e.code === "P2025") {
      const err = new Error("Lowongan tidak ditemukan (ID tidak ada)");
      err.statusCode = 404;
      throw err;
    }
    throw e;
  }
};

const deleteJob = async (id) => {
  const jobId = toIntId(id);
  if (!jobId) {
    const err = new Error("Job ID tidak valid");
    err.statusCode = 400;
    throw err;
  }

  try {
    const deleted = await prisma.lowongan.delete({ where: { id: jobId } });
    return deleted;
  } catch (e) {
    if (e.code === "P2025") {
      const err = new Error("Lowongan tidak ditemukan (ID tidak ada)");
      err.statusCode = 404;
      throw err;
    }
    throw e;
  }
};

const findJobs = async (filter, skip, limit) => {
  const jobs = await prisma.lowongan.findMany({
    where: filter,
    skip,
    take: limit,
    orderBy: { created_at: "desc" },
    include: { _count: { select: { lamaran: true } } },
  });

  return jobs.map((j) => ({
    ...j,
    applicants: j._count?.lamaran ?? 0,
  }));
};

const countJobs = async (filter) => {
  return prisma.lowongan.count({ where: filter });
};

module.exports = {
  findJobs,
  findJobById,
  createJob,
  countJobs,
  updateJob,
  deleteJob,
};