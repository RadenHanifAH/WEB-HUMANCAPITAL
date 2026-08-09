const service = require("./documents.service");

const ok = (res, data, message = "OK") =>
  res.status(200).json({ success: true, message, data });

const fail = (res, error, status = 400) =>
  res.status(status).json({ success: false, message: error.message });

const userId = (req) => req.user?.id;

module.exports = {
  // GET /api/profile/documents
  async getDocuments(req, res) {
    try {
      const data = await service.getDocuments(userId(req));
      ok(res, data, "Dokumen berhasil diambil");
    } catch (e) {
      fail(res, e);
    }
  },

  // POST /api/profile/documents/cv  (multipart, field "cv")
  async uploadCv(req, res) {
    try {
      const file = req.files?.["cv"]?.[0] || req.file || null;
      const data = await service.uploadCv(userId(req), file);
      ok(res, data, "CV berhasil diunggah");
    } catch (e) {
      fail(res, e);
    }
  },

  // POST /api/profile/documents/portfolio/file  (multipart, field "portfolio")
  async uploadPortfolioFile(req, res) {
    try {
      const file = req.files?.["portfolio"]?.[0] || req.file || null;
      const data = await service.uploadPortfolioFile(userId(req), file);
      ok(res, data, "Portofolio berhasil diunggah");
    } catch (e) {
      fail(res, e);
    }
  },

  // PUT /api/profile/documents/portfolio/link  { link }
  async setPortfolioLink(req, res) {
    try {
      const { link } = req.body;
      const data = await service.setPortfolioLink(userId(req), link);
      ok(res, data, "Link portofolio berhasil disimpan");
    } catch (e) {
      fail(res, e);
    }
  },

  // DELETE /api/profile/documents/cv
  async deleteCv(req, res) {
    try {
      await service.deleteCv(userId(req));
      ok(res, null, "CV dihapus");
    } catch (e) {
      fail(res, e);
    }
  },

  // DELETE /api/profile/documents/portfolio
  async deletePortfolio(req, res) {
    try {
      await service.deletePortfolio(userId(req));
      ok(res, null, "Portofolio dihapus");
    } catch (e) {
      fail(res, e);
    }
  },
};