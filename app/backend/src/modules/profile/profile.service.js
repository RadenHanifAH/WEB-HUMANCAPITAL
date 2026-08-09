// src/modules/profile/profile.service.js
const profileRepository = require("./profile.repository");
const { toPublicPath, removeCertificateFile } = require("./profile.upload");

const parseDate = (val) => (val ? new Date(val) : undefined);

// "true"/"false" datang sebagai string ketika dikirim lewat FormData
const parseBool = (val) => val === true || val === "true" || val === "1";

/* ============================
   FULL PROFILE
   ============================ */
const getFullProfile = (pengguna_id) => profileRepository.getFullProfile(pengguna_id);

/* ============================
   WORK EXPERIENCE (pengalaman_kerja)
   ============================ */
const getWorkExperiences = (pengguna_id) =>
  profileRepository.getWorkExperiences(pengguna_id);

const createWorkExperience = (pengguna_id, body) => {
  const {
    jabatan,
    perusahaan,
    jenis_pekerjaan,
    lokasi,
    bulan_mulai,
    tahun_mulai,
    bulan_selesai,
    tahun_selesai,
    sedang_bekerja,
  } = body;

  if (!jabatan || !perusahaan || !bulan_mulai || !tahun_mulai) {
    throw new Error("jabatan, perusahaan, bulan_mulai, dan tahun_mulai wajib diisi");
  }

  return profileRepository.createWorkExperience(pengguna_id, {
    jabatan,
    perusahaan,
    jenis_pekerjaan,
    lokasi,
    bulan_mulai,
    tahun_mulai,
    bulan_selesai,
    tahun_selesai,
    sedang_bekerja,
  });
};

const updateWorkExperience = async (id, pengguna_id, body) => {
  const {
    jabatan,
    perusahaan,
    jenis_pekerjaan,
    lokasi,
    bulan_mulai,
    tahun_mulai,
    bulan_selesai,
    tahun_selesai,
    sedang_bekerja,
  } = body;

  const result = await profileRepository.updateWorkExperience(Number(id), pengguna_id, {
    jabatan,
    perusahaan,
    jenis_pekerjaan,
    lokasi,
    bulan_mulai,
    tahun_mulai,
    bulan_selesai: sedang_bekerja ? null : bulan_selesai,
    tahun_selesai: sedang_bekerja ? null : tahun_selesai,
    sedang_bekerja: !!sedang_bekerja,
  });

  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

const deleteWorkExperience = async (id, pengguna_id) => {
  const result = await profileRepository.deleteWorkExperience(Number(id), pengguna_id);
  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

/* ============================
   EDUCATION (pendidikan)
   ============================ */
const getEducations = (pengguna_id) => profileRepository.getEducations(pengguna_id);

const createEducation = (pengguna_id, body) => {
  const { institusi, jurusan, gelar, tanggal_mulai, tanggal_selesai, sedang_berlangsung } = body;

  if (!institusi || !tanggal_mulai) {
    throw new Error("institusi dan tanggal_mulai wajib diisi");
  }

  return profileRepository.createEducation(pengguna_id, {
    institusi,
    jurusan,
    gelar,
    tanggal_mulai: parseDate(tanggal_mulai),
    tanggal_selesai: sedang_berlangsung ? null : parseDate(tanggal_selesai),
    sedang_berlangsung: !!sedang_berlangsung,
  });
};

const updateEducation = async (id, pengguna_id, body) => {
  const { institusi, jurusan, gelar, tanggal_mulai, tanggal_selesai, sedang_berlangsung } = body;

  const result = await profileRepository.updateEducation(Number(id), pengguna_id, {
    institusi,
    jurusan,
    gelar,
    tanggal_mulai: parseDate(tanggal_mulai),
    tanggal_selesai: sedang_berlangsung ? null : parseDate(tanggal_selesai),
    sedang_berlangsung: !!sedang_berlangsung,
  });

  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

const deleteEducation = async (id, pengguna_id) => {
  const result = await profileRepository.deleteEducation(Number(id), pengguna_id);
  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

/* ============================
   ORGANIZATION (organisasi)
   ============================ */
const getOrganizations = (pengguna_id) => profileRepository.getOrganizations(pengguna_id);

const createOrganization = (pengguna_id, body) => {
  const { peran, nama_organisasi, tanggal_mulai, tanggal_selesai, sedang_berlangsung, deskripsi } = body;

  if (!peran || !nama_organisasi || !tanggal_mulai) {
    throw new Error("peran, nama_organisasi, dan tanggal_mulai wajib diisi");
  }

  return profileRepository.createOrganization(pengguna_id, {
    peran,
    nama_organisasi,
    tanggal_mulai: parseDate(tanggal_mulai),
    tanggal_selesai: sedang_berlangsung ? null : parseDate(tanggal_selesai),
    sedang_berlangsung: !!sedang_berlangsung,
    deskripsi,
  });
};

const updateOrganization = async (id, pengguna_id, body) => {
  const { peran, nama_organisasi, tanggal_mulai, tanggal_selesai, sedang_berlangsung, deskripsi } = body;

  const result = await profileRepository.updateOrganization(Number(id), pengguna_id, {
    peran,
    nama_organisasi,
    tanggal_mulai: parseDate(tanggal_mulai),
    tanggal_selesai: sedang_berlangsung ? null : parseDate(tanggal_selesai),
    sedang_berlangsung: !!sedang_berlangsung,
    deskripsi,
  });

  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

const deleteOrganization = async (id, pengguna_id) => {
  const result = await profileRepository.deleteOrganization(Number(id), pengguna_id);
  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

/* ============================
   CERTIFICATE (sertifikat)
   ============================ */
const getCertificates = (pengguna_id) => profileRepository.getCertificates(pengguna_id);

// body: field teks (nama, penerbit, diterbitkan, kadaluarsa, noExpiry)
// file: object dari multer (req.file), opsional
const createCertificate = (pengguna_id, body, file) => {
  const { nama, penerbit, diterbitkan, kadaluarsa } = body;

  if (!nama || !penerbit) {
    throw new Error("nama dan penerbit wajib diisi");
  }

  const noExpiry = parseBool(body.noExpiry);

  return profileRepository.createCertificate(pengguna_id, {
    nama,
    penerbit,
    diterbitkan: parseDate(diterbitkan),
    kadaluarsa: noExpiry ? null : parseDate(kadaluarsa),
    file_sertifikat: file ? toPublicPath(file.filename) : null,
  });
};

const updateCertificate = async (id, pengguna_id, body, file) => {
  const { nama, penerbit, diterbitkan, kadaluarsa } = body;
  const noExpiry = parseBool(body.noExpiry);
  // Frontend kirim removeFile="true" kalau user menghapus file tanpa upload baru
  const removeFile = parseBool(body.removeFile);

  const existing = await profileRepository.getCertificateById(Number(id), pengguna_id);
  if (!existing) throw new Error("Data tidak ditemukan");

  let file_sertifikat = existing.file_sertifikat;

  if (file) {
    // Ada file baru: hapus file lama, pakai path baru
    if (existing.file_sertifikat) removeCertificateFile(existing.file_sertifikat);
    file_sertifikat = toPublicPath(file.filename);
  } else if (removeFile) {
    // User menghapus file tanpa mengganti
    if (existing.file_sertifikat) removeCertificateFile(existing.file_sertifikat);
    file_sertifikat = null;
  }

  const result = await profileRepository.updateCertificate(Number(id), pengguna_id, {
    nama,
    penerbit,
    diterbitkan: parseDate(diterbitkan),
    kadaluarsa: noExpiry ? null : parseDate(kadaluarsa),
    file_sertifikat,
  });

  if (result.count === 0) throw new Error("Data tidak ditemukan");
  return result;
};

const deleteCertificate = async (id, pengguna_id) => {
  const existing = await profileRepository.getCertificateById(Number(id), pengguna_id);
  if (!existing) throw new Error("Data tidak ditemukan");

  const result = await profileRepository.deleteCertificate(Number(id), pengguna_id);
  if (result.count === 0) throw new Error("Data tidak ditemukan");

  if (existing.file_sertifikat) removeCertificateFile(existing.file_sertifikat);
  return result;
};

/* ============================
   SKILLS (keahlian_pengguna)
   ============================ */
const getUserSkills = (pengguna_id) => profileRepository.getUserSkills(pengguna_id);

const replaceUserSkills = (pengguna_id, skills) => {
  if (!Array.isArray(skills)) throw new Error("skills harus berupa array");
  return profileRepository.replaceUserSkills(pengguna_id, skills);
};

module.exports = {
  getFullProfile,

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
  createCertificate,
  updateCertificate,
  deleteCertificate,

  getUserSkills,
  replaceUserSkills,
};