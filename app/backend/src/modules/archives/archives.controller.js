const service = require("./archives.service");

async function list(req, res) {
  const { q = "", status = "all", page = 1, pageSize = 10 } = req.query;
  const data = await service.getArchives({ q, status, page: Number(page), pageSize: Number(pageSize) });
  return res.json(data);
}

async function exportCsv(req, res) {
  const { q = "", status = "all" } = req.query;
  const data = await service.getArchives({ q, status, page: 1, pageSize: 100000 });
  const csv = service.generateArchiveCSV(data.items);

  const filename = `arsip_pelamar_${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(csv);
}

async function remove(req, res) {
  const { id } = req.params;
  await service.removeArchive(id);
  return res.json({ ok: true });
}

// ✅ ini yang “memasukkan” semua accepted/rejected lama ke tabel archive
async function sync(req, res) {
  const result = await service.syncArchives();
  return res.json({ ok: true, ...result });
}

module.exports = { list, exportCsv, remove, sync };
