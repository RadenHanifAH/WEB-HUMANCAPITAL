// src/modules/messages/messages.controller.js
const service = require("./messages.service");

class MessagesController {
  list = async (req, res) => {
    try {
      const data = await service.listMessages(req.query);
      return res.status(200).json({ message: "Daftar pesan", ...data });
    } catch (error) {
      return res.status(500).json({ message: "Gagal memuat pesan", error: error.message });
    }
  };

  send = async (req, res) => {
    try {
      const { recipientEmail, subject, body } = req.body;

      const result = await service.sendMessage({ recipientEmail, subject, body });

      // ✅ kalau user tidak ditemukan -> ok=false + status failed
      if (!result.ok) {
        return res.status(201).json({
          ok: false,
          message: "Pesan gagal dikirim, tetapi sudah disimpan",
          data: result.data,
          error: result.error,
        });
      }

      // ✅ sukses: disimpan dan dikirim async (tidak loading lama)
      return res.status(201).json({
        ok: true,
        queued: true,
        message: "Pesan disimpan & sedang dikirim (async).",
        data: result.data,
        error: null,
      });
    } catch (error) {
      return res.status(500).json({ message: "Gagal memproses pesan", error: error.message });
    }
  };

  deleteOne = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

      await service.deleteMessageById(id);
      return res.status(200).json({ message: "Pesan berhasil dihapus" });
    } catch (error) {
      if (String(error.message).toLowerCase().includes("not found")) {
        return res.status(404).json({ message: "Pesan tidak ditemukan", error: error.message });
      }
      return res.status(500).json({ message: "Gagal menghapus pesan", error: error.message });
    }
  };

  deleteBulk = async (req, res) => {
    try {
      const { q = "", status = "all" } = req.query;
      const result = await service.deleteBulkMessages({ q, status });

      return res.status(200).json({ message: "Bulk delete berhasil", deleted: result.deleted });
    } catch (error) {
      return res.status(500).json({ message: "Gagal menghapus semua pesan", error: error.message });
    }
  };
}

module.exports = new MessagesController();
