const usersService = require("./users.service");
const ExcelJS = require("exceljs");
const { notifyAdmins } = require("../notifications/notify.helper");
const { NOTIFICATION_TYPES } = require("../notifications/notifications.service");

async function getUsers(req, res) {
  try {
    const result = await usersService.listUsers(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Gagal mengambil data user." });
  }
}

async function postUser(req, res) {
  try {
    const user = await usersService.createUser(req.body);

    notifyAdmins({
      type: NOTIFICATION_TYPES.USER_CREATED,
      title: `User Baru Ditambahkan - ${user.nama}`,
      message: `Akun baru dengan role ${user.peran} telah dibuat untuk ${user.email}.`,
      actionUrl: "user-management",
      metadata: { userId: user.id },
    });

    res.status(201).json({ success: true, message: "User berhasil dibuat.", user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Gagal membuat user." });
  }
}

async function putUser(req, res) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, message: "User berhasil diperbarui.", user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Gagal memperbarui user." });
  }
}

async function deleteUser(req, res) {
  try {
    const result = await usersService.deleteUser(req.params.id, req.user?.id);

    notifyAdmins({
      type: NOTIFICATION_TYPES.USER_DELETED,
      title: `User Dihapus`,
      message: `Sebuah akun user (ID: ${req.params.id}) telah dihapus dari sistem.`,
      actionUrl: "user-management",
      metadata: { userId: Number(req.params.id) },
    });

    res.status(200).json({ success: true, message: "User berhasil dihapus.", ...result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Gagal menghapus user." });
  }
}

async function exportUsers(req, res) {
  try {
    const { data } = await usersService.listUsers({ ...req.query, page: 1, limit: 10000 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Users");
    sheet.columns = [
      { header: "Nama Lengkap", key: "nama", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Role", key: "peran", width: 18 },
      { header: "Divisi", key: "divisi", width: 18 },
      { header: "Status", key: "status_akun", width: 15 },
      { header: "Terakhir Login", key: "login_terakhir", width: 20 },
    ];
    data.forEach((u) => sheet.addRow(u));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=user-management.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Gagal export data." });
  }
}

module.exports = { getUsers, postUser, putUser, deleteUser, exportUsers };