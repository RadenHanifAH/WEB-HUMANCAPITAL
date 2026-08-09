const prisma = require("../../config/prisma");

const getByUserId = (userId) =>
  prisma.dokumen_pengguna.findUnique({ where: { pengguna_id: userId } });

const upsertCv = (userId, { url_cv, nama_cv }) =>
  prisma.dokumen_pengguna.upsert({
    where: { pengguna_id: userId },
    update: { url_cv, nama_cv },
    create: { pengguna_id: userId, url_cv, nama_cv },
  });

const upsertPortfolio = (userId, { url_portofolio, nama_portofolio }) =>
  prisma.dokumen_pengguna.upsert({
    where: { pengguna_id: userId },
    update: { url_portofolio, nama_portofolio },
    create: { pengguna_id: userId, url_portofolio, nama_portofolio },
  });

const deleteCv = (userId) =>
  prisma.dokumen_pengguna.updateMany({
    where: { pengguna_id: userId },
    data: { url_cv: null, nama_cv: null },
  });

const deletePortfolio = (userId) =>
  prisma.dokumen_pengguna.updateMany({
    where: { pengguna_id: userId },
    data: { url_portofolio: null, nama_portofolio: null },
  });

module.exports = {
  getByUserId,
  upsertCv,
  upsertPortfolio,
  deleteCv,
  deletePortfolio,
};