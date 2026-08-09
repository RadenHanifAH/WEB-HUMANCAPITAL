const prisma = require("../../config/prisma");

module.exports = {
  // =====================================================
  // CREATE LAMARAN
  // =====================================================
  create(data) {
    return prisma.lamaran.create({ data });
  },

  // =====================================================
  // ADMIN: LIST SEMUA LAMARAN (TANPA BLOB FILE)
  // =====================================================
  findAll() {
    return prisma.lamaran.findMany({
      include: {
        pengguna: {
          include: {
            profil: true,
            pengalaman_kerja: {
              orderBy: { tahun_mulai: "desc" },
            },
            pendidikan: {
              orderBy: { tanggal_mulai: "desc" },
            },
            organisasi: {
              orderBy: { tanggal_mulai: "desc" },
            },
            sertifikat: {
              orderBy: { diterbitkan: "desc" },
            },
            keahlian_pengguna: true,
          },
        },
        lowongan: true,
        jadwal_wawancara: {
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: {
        tanggal_melamar: "desc",
      },
    });
  },

  // =====================================================
  // CEK USER SUDAH APPLY KE JOB INI ATAU BELUM
  // =====================================================
  findByUserAndJob(userId, jobId) {
    return prisma.lamaran.findFirst({
      where: {
        pengguna_id: Number(userId),
        lowongan_id: Number(jobId),
      },
      orderBy: {
        tanggal_melamar: "desc",
      },
    });
  },

  // =====================================================
  // ADMIN / SERVICE: AMBIL STATUS & TAHAP SAJA
  // =====================================================
  findById(id) {
    return prisma.lamaran.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        status: true,
        tahap: true,
      },
    });
  },

  // =====================================================
  // USER: TIMELINE TERAKHIR (TANPA BLOB)
  // =====================================================
  findLatestByUserId(userId) {
    return prisma.lamaran.findFirst({
      where: {
        pengguna_id: Number(userId),
      },
      orderBy: {
        tanggal_melamar: "desc",
      },
      select: {
        id: true,
        status: true,
        tahap: true,
        tanggal_melamar: true,
        nama_cv: true,
        nama_portofolio: true,
        lowongan: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    });
  },

  // =====================================================
  // SERVICE: CEK LAMARAN AKTIF (BELUM DIARSIP)
  // =====================================================
  findActiveByUserId(userId) {
    return prisma.lamaran.findFirst({
      where: {
        pengguna_id: Number(userId),
        arsip: {
          is: null,
        },
      },
      orderBy: {
        tanggal_melamar: "desc",
      },
      select: {
        id: true,
        status: true,
        tahap: true,
        tanggal_melamar: true,
        nama_cv: true,
        nama_portofolio: true,
        lowongan: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    });
  },

  // =====================================================
  // USER: LIST SEMUA LAMARAN DIA (TANPA BLOB)
  // =====================================================
  findManyByUserId(userId) {
    return prisma.lamaran.findMany({
      where: {
        pengguna_id: Number(userId),
      },
      orderBy: {
        tanggal_melamar: "desc",
      },
      select: {
        id: true,
        status: true,
        tahap: true,
        tanggal_melamar: true,
        nama_cv: true,
        nama_portofolio: true,
        lowongan: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    });
  },

  // =====================================================
  // ADMIN: UPDATE STATUS & TAHAP
  // =====================================================
  updateStatusAndTahap(id, status, tahap) {
    return prisma.lamaran.update({
      where: { id: Number(id) },
      data: { status, tahap },
    });
  },

  // =====================================================
  // ADMIN: UPDATE SKOR
  // =====================================================
  updateSkor(id, skor) {
    return prisma.lamaran.update({
      where: { id: Number(id) },
      data: {
        skor: skor === null ? null : Number(skor),
      },
    });
  },

  // =====================================================
  // ADMIN: DOWNLOAD FILE (AMBIL BLOB + METADATA)
  // =====================================================
  findFileById(id) {
    return prisma.lamaran.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        data_cv: true,
        nama_cv: true,
        mime_cv: true,
        ukuran_cv: true,
        data_portofolio: true,
        nama_portofolio: true,
        mime_portofolio: true,
        ukuran_portofolio: true,
      },
    });
  },
};