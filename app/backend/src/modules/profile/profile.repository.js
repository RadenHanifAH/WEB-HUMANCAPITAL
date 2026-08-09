// src/modules/profile/profile.repository.js
const prisma = require("../../config/prisma");

// ⚠️ FIX: seluruh mapper camelCase dihapus. Semua fungsi mengembalikan
// row/relasi Prisma apa adanya, persis nama kolom di schema.prisma.

/* ============================
   WORK EXPERIENCE (pengalaman_kerja)
   ============================ */
const getWorkExperiences = async (pengguna_id) => {
  return prisma.pengalaman_kerja.findMany({
    where: { pengguna_id },
    orderBy: { tahun_mulai: "desc" },
  });
};

const createWorkExperience = async (pengguna_id, data) => {
  return prisma.pengalaman_kerja.create({
    data: {
      pengguna_id,
      jabatan: data.jabatan,
      perusahaan: data.perusahaan,
      jenis_pekerjaan: data.jenis_pekerjaan,
      lokasi: data.lokasi,
      bulan_mulai: data.bulan_mulai,
      tahun_mulai: data.tahun_mulai,
      bulan_selesai: data.bulan_selesai,
      tahun_selesai: data.tahun_selesai,
      sedang_bekerja: data.sedang_bekerja,
    },
  });
};

const updateWorkExperience = (id, pengguna_id, data) =>
  prisma.pengalaman_kerja.updateMany({
    where: { id, pengguna_id },
    data: {
      jabatan: data.jabatan,
      perusahaan: data.perusahaan,
      jenis_pekerjaan: data.jenis_pekerjaan,
      lokasi: data.lokasi,
      bulan_mulai: data.bulan_mulai,
      tahun_mulai: data.tahun_mulai,
      bulan_selesai: data.bulan_selesai,
      tahun_selesai: data.tahun_selesai,
      sedang_bekerja: data.sedang_bekerja,
    },
  });

const deleteWorkExperience = (id, pengguna_id) =>
  prisma.pengalaman_kerja.deleteMany({ where: { id, pengguna_id } });

/* ============================
   EDUCATION (pendidikan)
   ============================ */
const getEducations = async (pengguna_id) => {
  return prisma.pendidikan.findMany({
    where: { pengguna_id },
    orderBy: { tanggal_mulai: "desc" },
  });
};

const createEducation = async (pengguna_id, data) => {
  return prisma.pendidikan.create({
    data: {
      pengguna_id,
      institusi: data.institusi,
      jurusan: data.jurusan,
      gelar: data.gelar,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      sedang_berlangsung: data.sedang_berlangsung,
    },
  });
};

const updateEducation = (id, pengguna_id, data) =>
  prisma.pendidikan.updateMany({
    where: { id, pengguna_id },
    data: {
      institusi: data.institusi,
      jurusan: data.jurusan,
      gelar: data.gelar,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      sedang_berlangsung: data.sedang_berlangsung,
    },
  });

const deleteEducation = (id, pengguna_id) =>
  prisma.pendidikan.deleteMany({ where: { id, pengguna_id } });

/* ============================
   ORGANIZATION (organisasi)
   ============================ */
const getOrganizations = async (pengguna_id) => {
  return prisma.organisasi.findMany({
    where: { pengguna_id },
    orderBy: { tanggal_mulai: "desc" },
  });
};

const createOrganization = async (pengguna_id, data) => {
  return prisma.organisasi.create({
    data: {
      pengguna_id,
      peran: data.peran,
      nama_organisasi: data.nama_organisasi,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      sedang_berlangsung: data.sedang_berlangsung,
      deskripsi: data.deskripsi,
    },
  });
};

const updateOrganization = (id, pengguna_id, data) =>
  prisma.organisasi.updateMany({
    where: { id, pengguna_id },
    data: {
      peran: data.peran,
      nama_organisasi: data.nama_organisasi,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai: data.tanggal_selesai,
      sedang_berlangsung: data.sedang_berlangsung,
      deskripsi: data.deskripsi,
    },
  });

const deleteOrganization = (id, pengguna_id) =>
  prisma.organisasi.deleteMany({ where: { id, pengguna_id } });

/* ============================
   CERTIFICATE (sertifikat)
   ============================ */
const getCertificates = async (pengguna_id) => {
  return prisma.sertifikat.findMany({
    where: { pengguna_id },
    orderBy: { diterbitkan: "desc" },
  });
};

const getCertificateById = async (id, pengguna_id) => {
  return prisma.sertifikat.findFirst({ where: { id, pengguna_id } });
};

const createCertificate = async (pengguna_id, data) => {
  return prisma.sertifikat.create({
    data: {
      pengguna_id,
      nama: data.nama,
      penerbit: data.penerbit,
      diterbitkan: data.diterbitkan,
      kadaluarsa: data.kadaluarsa,
      file_sertifikat: data.file_sertifikat,
    },
  });
};

const updateCertificate = (id, pengguna_id, data) =>
  prisma.sertifikat.updateMany({
    where: { id, pengguna_id },
    data: {
      nama: data.nama,
      penerbit: data.penerbit,
      diterbitkan: data.diterbitkan,
      kadaluarsa: data.kadaluarsa,
      file_sertifikat: data.file_sertifikat,
    },
  });

const deleteCertificate = (id, pengguna_id) =>
  prisma.sertifikat.deleteMany({ where: { id, pengguna_id } });

/* ============================
   SKILLS (keahlian_pengguna)
   ============================ */
const getUserSkills = async (pengguna_id) => {
  return prisma.keahlian_pengguna.findMany({ where: { pengguna_id } });
};

const replaceUserSkills = async (pengguna_id, skillNames) => {
  await prisma.keahlian_pengguna.deleteMany({ where: { pengguna_id } });
  if (!skillNames?.length) return [];
  return prisma.keahlian_pengguna.createMany({
    data: skillNames.map((nama) => ({ pengguna_id, nama })),
  });
};

/* ============================
   FULL PROFILE
   ============================ */
const getFullProfile = async (pengguna_id) => {
  const pengguna = await prisma.pengguna.findUnique({
    where: { id: pengguna_id },
    include: { profil: true },
  });

  const [pengalaman_kerja, pendidikan, organisasi, sertifikat, keahlian_pengguna] =
    await Promise.all([
      getWorkExperiences(pengguna_id),
      getEducations(pengguna_id),
      getOrganizations(pengguna_id),
      getCertificates(pengguna_id),
      getUserSkills(pengguna_id),
    ]);

  return {
    pengguna: pengguna
      ? {
          id: pengguna.id,
          email: pengguna.email,
          nama: pengguna.nama,
          peran: pengguna.peran,
          divisi: pengguna.divisi,
          profil: pengguna.profil || null,
        }
      : null,
    pengalaman_kerja,
    pendidikan,
    organisasi,
    sertifikat,
    keahlian_pengguna,
  };
};

module.exports = {
  getWorkExperiences,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,

  getEducations,
  createEducation,
  updateEducation,
  deleteEducation,

  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,

  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,

  getUserSkills,
  replaceUserSkills,

  getFullProfile,
};