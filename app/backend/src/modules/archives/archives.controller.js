const service = require("./archives.service");
// 📝 LOG: tambahan untuk Log Aktivitas
const { logActivity, getClientIp } = require("../activity-log/activityLog.helper");

async function list(req, res) {
  const { q = "", status = "all", position = "all", page = 1, pageSize = 10 } = req.query;
  const data = await service.getArchives({
    q,
    status,
    position,
    page: Number(page),
    pageSize: Number(pageSize),
  });
  return res.json(data);
}

async function positions(req, res) {
  const items = await service.getArchivePositions();
  return res.json({ items });
}

async function detail(req, res) {
  try {
    const { id } = req.params;
    const data = await service.getArchiveDetail(id);
    return res.json(data);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
}

async function downloadFile(req, res) {
  try {
    const { id } = req.params;
    const { type = "cv" } = req.query;

    const { base64, name, mime } = await service.downloadArchiveFile(id, type);

    const buffer = Buffer.from(base64, "base64");
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    return res.status(200).send(buffer);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
}

async function exportCsv(req, res) {
  const { q = "", status = "all", position = "all" } = req.query;
  const data = await service.getArchives({ q, status, position, page: 1, pageSize: 100000 });
  const csv = service.generateArchiveCSV(data.items);

  // 📝 LOG: admin mengexport arsip ke CSV
  logActivity({
    pengguna_id: req.user?.id,
    aksi: "EXPORT",
    modul: "arsip",
    target_id: null,
    deskripsi: `Export arsip pelamar ke CSV (${data.items?.length ?? 0} baris)`,
    data_sebelum: null,
    data_sesudah: null,
    ip_address: getClientIp(req),
  });

  const filename = `arsip_pelamar_${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(csv);
}

async function remove(req, res) {
  const { id } = req.params;

  // 📝 LOG: snapshot detail arsip sebelum dihapus (best-effort)
  let detail = null;
  try {
    detail = await service.getArchiveDetail(id);
  } catch (e) {
    detail = null;
  }

  await service.removeArchive(id);

  logActivity({
    pengguna_id: req.user?.id,
    aksi: "DELETE",
    modul: "arsip",
    target_id: Number(id) || id,
    deskripsi: `Menghapus data arsip pelamar (ID: ${id})`,
    data_sebelum: detail || null,
    data_sesudah: null,
    ip_address: getClientIp(req),
  });

  return res.json({ ok: true });
}

async function sync(req, res) {
  const result = await service.syncArchives();

  // 📝 LOG: admin menjalankan sinkronisasi arsip
  logActivity({
    pengguna_id: req.user?.id,
    aksi: "UPDATE",
    modul: "arsip",
    target_id: null,
    deskripsi: `Menjalankan sinkronisasi arsip pelamar`,
    data_sebelum: null,
    data_sesudah: result || null,
    ip_address: getClientIp(req),
  });

  return res.json({ ok: true, ...result });
}

// ✅ NEW: Endpoint untuk memindahkan ke arsip saat HC click Terima/Tolak
async function archiveApplicant(req, res) {
  try {
    const { lamaranId } = req.params;
    const result = await service.archiveIfFinal(lamaranId);

    if (!result) {
      return res.status(400).json({
        message: "Gagal arsip, pastikan status lamaran sudah diupdate menjadi Diterima/Ditolak.",
      });
    }

    // 📝 LOG: lamaran final dipindahkan ke arsip
    logActivity({
      pengguna_id: req.user?.id,
      aksi: "CREATE",
      modul: "arsip",
      target_id: result?.id || Number(lamaranId) || null,
      deskripsi: `Memindahkan lamaran (ID: ${lamaranId}) ke arsip`,
      data_sebelum: null,
      data_sesudah: result || null,
      ip_address: getClientIp(req),
    });

    return res.status(201).json({ message: "Berhasil dipindahkan ke arsip", data: result });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

module.exports = {
  list,
  positions,
  detail,
  downloadFile,
  exportCsv,
  remove,
  sync,
  archiveApplicant,
};