const router = require("express").Router();
const controller = require("./users.controller");

// GET /api/users/emails?q=...
router.get("/emails", controller.searchEmails);

module.exports = router;
