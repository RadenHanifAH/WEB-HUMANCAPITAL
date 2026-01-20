const service = require("./users.service");

class UsersController {
  searchEmails = async (req, res) => {
    try {
      const q = String(req.query.q || "").trim();
      const items = await service.searchEmails(q);
      return res.status(200).json({ success: true, items });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}

module.exports = new UsersController();
