// scripts/migrate-pelaku-log.js
//
// Migrasi SATU KALI untuk data log_aktivitas yang SUDAH ADA di database
// (dibuat sebelum activityLog.helper.js diperbaiki).
//
// Yang diubah HANYA kolom tampilan:
//   nama_pelaku  → "Administrator"
//   peran_pelaku → "admin"
//
// Kondisi baris yang diubah:
//   1) peran_pelaku === "system"   (dulu tampil sebagai "Sistem")
//   2) peran_pelaku === "pelamar"  (dulu tampil sebagai nama pelamar asli)
//
// pengguna_id TIDAK disentuh sama sekali — kalau baris itu tadinya punya
// pengguna_id milik pelamar (kasus #2), nilainya tetap seperti semula,
// supaya identitas asli tetap bisa ditelusuri lewat relasi `pengguna`
// kalau suatu saat dibutuhkan.
//
// CARA JALANKAN (dari root folder backend):
//   node scripts/migrate-pelaku-log.js
//
// Aman dijalankan berkali-kali (idempotent) — baris yang sudah
// "Administrator"/"admin" otomatis tidak ke-match lagi di query kedua.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Mengecek data log_aktivitas yang perlu dimigrasi...\n");

  const beforeSystem = await prisma.log_aktivitas.count({
    where: { peran_pelaku: "system" },
  });
  const beforePelamar = await prisma.log_aktivitas.count({
    where: { peran_pelaku: "pelamar" },
  });

  console.log(`   - Baris dengan peran_pelaku "system"  : ${beforeSystem}`);
  console.log(`   - Baris dengan peran_pelaku "pelamar" : ${beforePelamar}`);

  if (beforeSystem === 0 && beforePelamar === 0) {
    console.log("\n✅ Tidak ada data yang perlu dimigrasi. Selesai.");
    return;
  }

  console.log("\n🚀 Menjalankan migrasi...\n");

  // 1) Baris "system" → Administrator / admin
  const resultSystem = await prisma.log_aktivitas.updateMany({
    where: { peran_pelaku: "system" },
    data: {
      nama_pelaku: "Administrator",
      peran_pelaku: "admin",
    },
  });
  console.log(`   ✅ ${resultSystem.count} baris "system" diubah jadi Administrator/admin`);

  // 2) Baris "pelamar" → Administrator / admin (pengguna_id TIDAK diubah)
  const resultPelamar = await prisma.log_aktivitas.updateMany({
    where: { peran_pelaku: "pelamar" },
    data: {
      nama_pelaku: "Administrator",
      peran_pelaku: "admin",
    },
  });
  console.log(`   ✅ ${resultPelamar.count} baris "pelamar" diubah jadi Administrator/admin`);

  const totalChanged = resultSystem.count + resultPelamar.count;
  console.log(`\n🎉 Migrasi selesai. Total ${totalChanged} baris diperbarui.`);
}

main()
  .catch((err) => {
    console.error("❌ Migrasi gagal:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });