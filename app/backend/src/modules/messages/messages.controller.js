const service = require("./messages.service");

class MessagesController {
  list = async (req, res) => {
    try {
      const data = await service.listMessages(req.query);
      res.status(200).json({
        message: "Daftar pesan",
        ...data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Gagal memuat pesan",
        error: error.message,
      });
    }
  };

  send = async (req, res) => {
    try {
      const { recipientEmail, subject, body } = req.body;

      const result = await service.sendMessage({
        recipientEmail,
        subject,
        body,
      });

      // ✅ tetap 201 karena record sudah tersimpan
      return res.status(201).json({
        message: result.ok
          ? "Pesan berhasil dikirim dan disimpan"
          : "Pesan gagal dikirim, tetapi sudah disimpan",
        ok: result.ok,
        data: result.data,
        error: result.ok ? null : result.error,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Gagal memproses pesan",
        error: error.message,
      });
    }
  };

  // ✅ hapus 1 pesan: DELETE /api/messages/:id
  deleteOne = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ message: "ID tidak valid" });
      }

      await service.deleteMessageById(id);

      return res.status(200).json({
        message: "Pesan berhasil dihapus",
      });
    } catch (error) {
      // kalau record tidak ada, kamu bisa kirim 404
      if (
        typeof error.message === "string" &&
        error.message.toLowerCase().includes("not found")
      ) {
        return res.status(404).json({
          message: "Pesan tidak ditemukan",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Gagal menghapus pesan",
        error: error.message,
      });
    }
  };

  // ✅ hapus semua / bulk: DELETE /api/messages/bulk?q=&status=
  deleteBulk = async (req, res) => {
    try {
      const { q = "", status = "all" } = req.query;

      const result = await service.deleteBulkMessages({ q, status });

      return res.status(200).json({
        message: "Bulk delete berhasil",
        deleted: result.deleted,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Gagal menghapus semua pesan",
        error: error.message,
      });
    }
  };
}

module.exports = new MessagesController();
