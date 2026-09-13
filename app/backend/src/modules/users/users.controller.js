const usersService = require("./users.service");
const ExcelJS = require("exceljs");
const { notifyAdmins } = require("../notifications/notify.helper");
const {
  NOTIFICATION_TYPES,
} = require("../notifications/notifications.service");
const {
  logActivity,
  getClientIp,
} = require("../activity-log/activityLog.helper");

async function getUsers(req, res) {
  try {
    const result = await usersService.listUsers(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({
        success: false,
        message: err.message || "Gagal mengambil data user.",
      });
  }
}

async function postUser(req, res) {
  try {
    const pengguna_id = req.user?.id;
    const user = await usersService.createUser(req.body);

    // 📝 Log: user baru dibuat (data password TIDAK ikut disimpan ke log)
    logActivity({
      pengguna_id,
      aksi: "CREATE",
      modul: "user",
      target_id: user.id,
      deskripsi: `Membuat akun baru untuk ${user.email} dengan role ${user.peran}`,
      data_sebelum: null,
      data_sesudah: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        peran: user.peran,
        divisi: user.divisi,
      },
      ip_address: getClientIp(req),
    });

    notifyAdmins({
      type: NOTIFICATION_TYPES.USER_CREATED,
      title: `User Baru Ditambahkan - ${user.nama}`,
      message: `Akun baru dengan role ${user.peran} telah dibuat untuk ${user.email}.`,
      actionUrl: "user-management",
      metadata: { userId: user.id },
    });

    res
      .status(201)
      .json({ success: true, message: "User berhasil dibuat.", user });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Gagal membuat user." });
  }
}

async function putUser(req, res) {
  try {
    const pengguna_id = req.user?.id;
    const targetId = req.params.id;

    const existing = (await usersService.getUserById)
      ? await usersService.getUserById(targetId)
      : null;

    const user = await usersService.updateUser(targetId, req.body);

    // 📝 Log: user diubah (password, jika ada di body, TIDAK ikut disimpan ke log)
    const { password: _pw1, ...beforeSafe } = existing || {};
    const { password: _pw2, ...afterSafe } = user || {};

    logActivity({
      pengguna_id,
      aksi: "UPDATE",
      modul: "user",
      target_id: user.id,
      deskripsi: `Memperbarui data akun ${user.email}`,
      data_sebelum: existing ? beforeSafe : null,
      data_sesudah: afterSafe,
      ip_address: getClientIp(req),
    });

    res
      .status(200)
      .json({ success: true, message: "User berhasil diperbarui.", user });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({
        success: false,
        message: err.message || "Gagal memperbarui user.",
      });
  }
}

async function deleteUser(req, res) {
  try {
    const pengguna_id = req.user?.id;
    const targetId = req.params.id;

    const existing = (await usersService.getUserById)
      ? await usersService.getUserById(targetId)
      : null;

    const result = await usersService.deleteUser(targetId, pengguna_id);

    // 📝 Log: user dihapus
    const { password: _pw, ...beforeSafe } = existing || {};
    logActivity({
      pengguna_id,
      aksi: "DELETE",
      modul: "user",
      target_id: Number(targetId),
      deskripsi: `Menghapus akun user (ID: ${targetId})${existing?.email ? ` — ${existing.email}` : ""}`,
      data_sebelum: existing ? beforeSafe : null,
      data_sesudah: null,
      ip_address: getClientIp(req),
    });

    notifyAdmins({
      type: NOTIFICATION_TYPES.USER_DELETED,
      title: `User Dihapus`,
      message: `Sebuah akun user (ID: ${targetId}) telah dihapus dari sistem.`,
      actionUrl: "user-management",
      metadata: { userId: Number(targetId) },
    });

    res
      .status(200)
      .json({ success: true, message: "User berhasil dihapus.", ...result });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({
        success: false,
        message: err.message || "Gagal menghapus user.",
      });
  }
}

async function exportUsers(req, res) {
  try {
    const { data } = await usersService.listUsers({
      ...req.query,
      page: 1,
      limit: 10000,
    });

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

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=user-management.xlsx",
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Gagal export data." });
  }
}

module.exports = { getUsers, postUser, putUser, deleteUser, exportUsers };
