// src/modules/profile/profile.controller.js
const profileService = require("./profile.service");

const ok = (res, data, message = "OK") =>
  res.status(200).json({ success: true, message, data });

const fail = (res, error, status = 400) =>
  res.status(status).json({ success: false, message: error.message });

const userId = (req) => req.user?.id;

/* ============================
   FULL PROFILE
   ============================ */
const getFullProfile = async (req, res) => {
  try {
    const data = await profileService.getFullProfile(userId(req));
    ok(res, data, "Full profile fetched");
  } catch (e) {
    fail(res, e);
  }
};

/* ============================
   WORK EXPERIENCE
   ============================ */
const getWorkExperiences = async (req, res) => {
  try {
    ok(res, await profileService.getWorkExperiences(userId(req)));
  } catch (e) {
    fail(res, e);
  }
};

const createWorkExperience = async (req, res) => {
  try {
    const data = await profileService.createWorkExperience(userId(req), req.body);
    res.status(201).json({ success: true, message: "Pengalaman kerja ditambahkan", data });
  } catch (e) {
    fail(res, e);
  }
};

const updateWorkExperience = async (req, res) => {
  try {
    await profileService.updateWorkExperience(req.params.id, userId(req), req.body);
    ok(res, null, "Pengalaman kerja diperbarui");
  } catch (e) {
    fail(res, e);
  }
};

const deleteWorkExperience = async (req, res) => {
  try {
    await profileService.deleteWorkExperience(req.params.id, userId(req));
    ok(res, null, "Pengalaman kerja dihapus");
  } catch (e) {
    fail(res, e);
  }
};

/* ============================
   EDUCATION
   ============================ */
const getEducations = async (req, res) => {
  try {
    ok(res, await profileService.getEducations(userId(req)));
  } catch (e) {
    fail(res, e);
  }
};

const createEducation = async (req, res) => {
  try {
    const data = await profileService.createEducation(userId(req), req.body);
    res.status(201).json({ success: true, message: "Pendidikan ditambahkan", data });
  } catch (e) {
    fail(res, e);
  }
};

const updateEducation = async (req, res) => {
  try {
    await profileService.updateEducation(req.params.id, userId(req), req.body);
    ok(res, null, "Pendidikan diperbarui");
  } catch (e) {
    fail(res, e);
  }
};

const deleteEducation = async (req, res) => {
  try {
    await profileService.deleteEducation(req.params.id, userId(req));
    ok(res, null, "Pendidikan dihapus");
  } catch (e) {
    fail(res, e);
  }
};

/* ============================
   ORGANIZATION
   ============================ */
const getOrganizations = async (req, res) => {
  try {
    ok(res, await profileService.getOrganizations(userId(req)));
  } catch (e) {
    fail(res, e);
  }
};

const createOrganization = async (req, res) => {
  try {
    const data = await profileService.createOrganization(userId(req), req.body);
    res.status(201).json({ success: true, message: "Organisasi ditambahkan", data });
  } catch (e) {
    fail(res, e);
  }
};

const updateOrganization = async (req, res) => {
  try {
    await profileService.updateOrganization(req.params.id, userId(req), req.body);
    ok(res, null, "Organisasi diperbarui");
  } catch (e) {
    fail(res, e);
  }
};

const deleteOrganization = async (req, res) => {
  try {
    await profileService.deleteOrganization(req.params.id, userId(req));
    ok(res, null, "Organisasi dihapus");
  } catch (e) {
    fail(res, e);
  }
};

/* ============================
   CERTIFICATE
   ============================ */
const getCertificates = async (req, res) => {
  try {
    ok(res, await profileService.getCertificates(userId(req)));
  } catch (e) {
    fail(res, e);
  }
};

// req.file diisi oleh middleware uploadCertificate (multer.single("certificateFile"))
// req.body berisi field teks lain (name, issuer, issuedAt, expiredAt, dst) karena multipart/form-data
const createCertificate = async (req, res) => {
  try {
    const data = await profileService.createCertificate(userId(req), req.body, req.file);
    res.status(201).json({ success: true, message: "Sertifikat ditambahkan", data });
  } catch (e) {
    fail(res, e);
  }
};

const updateCertificate = async (req, res) => {
  try {
    await profileService.updateCertificate(req.params.id, userId(req), req.body, req.file);
    ok(res, null, "Sertifikat diperbarui");
  } catch (e) {
    fail(res, e);
  }
};

const deleteCertificate = async (req, res) => {
  try {
    await profileService.deleteCertificate(req.params.id, userId(req));
    ok(res, null, "Sertifikat dihapus");
  } catch (e) {
    fail(res, e);
  }
};

/* ============================
   SKILLS
   ============================ */
const getUserSkills = async (req, res) => {
  try {
    ok(res, await profileService.getUserSkills(userId(req)));
  } catch (e) {
    fail(res, e);
  }
};

const replaceUserSkills = async (req, res) => {
  try {
    await profileService.replaceUserSkills(userId(req), req.body.skills);
    ok(res, null, "Skills diperbarui");
  } catch (e) {
    fail(res, e);
  }
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