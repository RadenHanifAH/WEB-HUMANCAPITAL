/**
 * prisma/seed.js
 *
 * Seed database dari dummy_data_humancapital_v12.sql — dikonversi otomatis
 * jadi Prisma seed script. Semua data (termasuk dokumen CV/portofolio per
 * pelamar) diambil APA ADANYA dari file seed-data.json (hasil parsing SQL),
 * jadi setiap pelamar punya dokumennya sendiri-sendiri (bukan satu
 * DUMMY_PDF yang dipakai bersama seperti di seed.js versi lama) dan bisa
 * benar-benar diklik/di-download di aplikasi persis seperti kalau datanya
 * diimport langsung dari SQL.
 *
 * Dependencies: npm install @prisma/client bcryptjs (bcryptjs tidak
 * dipakai untuk generate hash baru — password di-copy langsung dari hash
 * bcrypt yang sudah ada di SQL supaya kredensial login tetap identik
 * dengan dump aslinya).
 *
 * Jalankan dengan: node prisma/seed.js
 */

const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8"),
);

// ── HELPERS ──────────────────────────────────────────────────────────────
const toDate = (v) =>
  v === null || v === undefined ? null : new Date(String(v).replace(" ", "T"));
const toNum = (v) => (v === null || v === undefined ? null : Number(v));
const toBool = (v) => (v === null || v === undefined ? null : Boolean(v));

async function main() {
  // ── 0. BERSIHKAN DATA LAMA (urutan mengikuti dependensi FK) ───────────
  console.log("🧹 Membersihkan data lama...");
  await prisma.notifikasi.deleteMany();
  await prisma.pendaftaran_tertunda.deleteMany();
  await prisma.arsip.deleteMany();
  await prisma.hasil_wawancara.deleteMany();
  await prisma.hasil_psikotes.deleteMany();
  await prisma.jadwal_wawancara.deleteMany();
  await prisma.lamaran.deleteMany();
  await prisma.lowongan.deleteMany();
  await prisma.pengajuan_sdm.deleteMany();
  await prisma.dokumen_pengguna.deleteMany();
  await prisma.keahlian_pengguna.deleteMany();
  await prisma.sertifikat.deleteMany();
  await prisma.organisasi.deleteMany();
  await prisma.pengalaman_kerja.deleteMany();
  await prisma.pendidikan.deleteMany();
  await prisma.profil.deleteMany();
  await prisma.pengguna.deleteMany();
  console.log("✓ Data lama dibersihkan");

  // Map dari id lama (di file SQL) -> id baru (hasil create Prisma), per tabel.
  const idMap = {
    pengguna: {},
    pengajuan_sdm: {},
    lowongan: {},
    lamaran: {},
  };

  // ── 1. PENGGUNA (admin, divisi, pelamar lengkap & tidak lengkap) ──────
  console.log("👤 Membuat pengguna...");
  for (const row of DATA.pengguna) {
    const created = await prisma.pengguna.create({
      data: {
        email: row.email,
        nama: row.nama,
        // Hash di-copy langsung dari SQL supaya password login identik
        // dengan dump aslinya (bukan di-hash ulang).
        password: row.password,
        peran: row.peran,
        divisi: row.divisi,
        status_akun: row.status_akun,
        login_terakhir: toDate(row.login_terakhir),
        created_at: toDate(row.created_at),
      },
    });
    idMap.pengguna[row.id] = created.id;
  }
  console.log(`✓ ${DATA.pengguna.length} pengguna`);

  // ── 2. PROFIL ───────────────────────────────────────────────────────
  console.log("🪪 Membuat profil...");
  for (const row of DATA.profil) {
    await prisma.profil.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        nik: row.nik,
        jenis_kelamin: row.jenis_kelamin,
        nomor_hp: row.nomor_hp,
        tempat_lahir: row.tempat_lahir,
        tanggal_lahir: toDate(row.tanggal_lahir),
        alamat: row.alamat,
        foto_profil: row.foto_profil,
        tentang: row.tentang,
      },
    });
  }
  console.log(`✓ ${DATA.profil.length} profil`);

  // ── 3. PENDIDIKAN ───────────────────────────────────────────────────
  console.log("🎓 Membuat pendidikan...");
  for (const row of DATA.pendidikan) {
    await prisma.pendidikan.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        institusi: row.institusi,
        jurusan: row.jurusan,
        gelar: row.gelar,
        tanggal_mulai: toDate(row.tanggal_mulai),
        tanggal_selesai: toDate(row.tanggal_selesai),
        sedang_berlangsung: toBool(row.sedang_berlangsung),
      },
    });
  }
  console.log(`✓ ${DATA.pendidikan.length} pendidikan`);

  // ── 4. PENGALAMAN KERJA ─────────────────────────────────────────────
  console.log("💼 Membuat pengalaman_kerja...");
  for (const row of DATA.pengalaman_kerja) {
    await prisma.pengalaman_kerja.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        jabatan: row.jabatan,
        perusahaan: row.perusahaan,
        jenis_pekerjaan: row.jenis_pekerjaan,
        lokasi: row.lokasi,
        bulan_mulai: toNum(row.bulan_mulai),
        tahun_mulai: row.tahun_mulai,
        bulan_selesai: toNum(row.bulan_selesai),
        tahun_selesai: row.tahun_selesai,
        sedang_bekerja: toBool(row.sedang_bekerja),
      },
    });
  }
  console.log(`✓ ${DATA.pengalaman_kerja.length} pengalaman_kerja`);

  // ── 5. ORGANISASI ───────────────────────────────────────────────────
  console.log("🏛️  Membuat organisasi...");
  for (const row of DATA.organisasi) {
    await prisma.organisasi.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        peran: row.peran,
        nama_organisasi: row.nama_organisasi,
        tanggal_mulai: toDate(row.tanggal_mulai),
        tanggal_selesai: toDate(row.tanggal_selesai),
        sedang_berlangsung: toBool(row.sedang_berlangsung),
        deskripsi: row.deskripsi,
      },
    });
  }
  console.log(`✓ ${DATA.organisasi.length} organisasi`);

  // ── 6. SERTIFIKAT ───────────────────────────────────────────────────
  console.log("📜 Membuat sertifikat...");
  for (const row of DATA.sertifikat) {
    await prisma.sertifikat.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        nama: row.nama,
        penerbit: row.penerbit,
        diterbitkan: toDate(row.diterbitkan),
        kadaluarsa: toDate(row.kadaluarsa),
        file_sertifikat: row.file_sertifikat,
      },
    });
  }
  console.log(`✓ ${DATA.sertifikat.length} sertifikat`);

  // ── 7. KEAHLIAN PENGGUNA ────────────────────────────────────────────
  console.log("🛠️  Membuat keahlian_pengguna...");
  for (const row of DATA.keahlian_pengguna) {
    await prisma.keahlian_pengguna.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        nama: row.nama,
      },
    });
  }
  console.log(`✓ ${DATA.keahlian_pengguna.length} keahlian_pengguna`);

  // ── 8. DOKUMEN PENGGUNA ─────────────────────────────────────────────
  // url_cv / url_portofolio sudah berupa Data URI utuh
  // ("data:application/pdf;base64,...") persis seperti di SQL, jadi
  // setiap pelamar punya file CV & portofolio sendiri yang bisa langsung
  // dibuka/di-download di frontend — bukan satu file placeholder yang
  // dipakai bersama semua pelamar.
  console.log("📎 Membuat dokumen_pengguna (CV & portofolio per pelamar)...");
  for (const row of DATA.dokumen_pengguna) {
    await prisma.dokumen_pengguna.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        url_cv: row.url_cv,
        nama_cv: row.nama_cv,
        url_portofolio: row.url_portofolio,
        nama_portofolio: row.nama_portofolio,
      },
    });
  }
  console.log(`✓ ${DATA.dokumen_pengguna.length} dokumen_pengguna`);

  // ── 9. PENGAJUAN SDM ────────────────────────────────────────────────
  console.log("📝 Membuat pengajuan_sdm...");
  for (const row of DATA.pengajuan_sdm) {
    const created = await prisma.pengajuan_sdm.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        departemen: row.departemen,
        posisi: row.posisi,
        lokasi: row.lokasi,
        tanggal_permintaan: toDate(row.tanggal_permintaan),
        alasan: row.alasan,
        jumlah: toNum(row.jumlah),
        status_karyawan: row.status_karyawan,
        tugas_utama: row.tugas_utama,
        usia_min: toNum(row.usia_min),
        usia_maks: toNum(row.usia_maks),
        status_perkawinan: row.status_perkawinan,
        pendidikan_terakhir: row.pendidikan_terakhir,
        keahlian: row.keahlian,
        pengalaman: row.pengalaman,
        bahasa_asing: row.bahasa_asing,
        level_bahasa_asing: row.level_bahasa_asing,
        keahlian_komputer: row.keahlian_komputer,
        fasilitas: row.fasilitas,
        peta_kekuatan: row.peta_kekuatan ?? {},
        status: row.status,
        dikirim: toDate(row.dikirim),
        catatan_admin: row.catatan_admin,
        ditinjau: toDate(row.ditinjau),
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
    idMap.pengajuan_sdm[row.id] = created.id;
  }
  console.log(`✓ ${DATA.pengajuan_sdm.length} pengajuan_sdm`);

  // ── 10. LOWONGAN ────────────────────────────────────────────────────
  console.log("💼 Membuat lowongan...");
  for (const row of DATA.lowongan) {
    const created = await prisma.lowongan.create({
      data: {
        pengajuan_sdm_id: idMap.pengajuan_sdm[row.pengajuan_sdm_id],
        judul: row.judul,
        departemen: row.departemen,
        lokasi: row.lokasi,
        jenis: row.jenis,
        deskripsi: row.deskripsi,
        persyaratan: row.persyaratan,
        tenggat: toDate(row.tenggat),
        status: row.status,
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
    idMap.lowongan[row.id] = created.id;
  }
  console.log(`✓ ${DATA.lowongan.length} lowongan`);

  // ── 11. LAMARAN ─────────────────────────────────────────────────────
  // data_cv / data_portofolio memakai isi dokumen ASLI per lamaran persis
  // seperti di SQL (masing-masing lamaran bisa punya file berbeda dari
  // dokumen_pengguna, karena pelamar bisa upload CV berbeda tiap melamar),
  // jadi tetap bisa diklik & di-download di halaman detail lamaran.
  console.log("📄 Membuat lamaran (dengan CV/portofolio asli per lamaran)...");
  for (const row of DATA.lamaran) {
    const created = await prisma.lamaran.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        lowongan_id: idMap.lowongan[row.lowongan_id],
        status: row.status,
        tahap: row.tahap,
        tanggal_melamar: toDate(row.tanggal_melamar),
        data_cv: row.data_cv,
        mime_cv: row.mime_cv,
        nama_cv: row.nama_cv,
        ukuran_cv: toNum(row.ukuran_cv),
        data_portofolio: row.data_portofolio,
        mime_portofolio: row.mime_portofolio,
        nama_portofolio: row.nama_portofolio,
        ukuran_portofolio: toNum(row.ukuran_portofolio),
        skor: toNum(row.skor),
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
    idMap.lamaran[row.id] = created.id;
  }
  console.log(`✓ ${DATA.lamaran.length} lamaran`);

  // ── 12. JADWAL WAWANCARA ────────────────────────────────────────────
  console.log("📅 Membuat jadwal_wawancara...");
  for (const row of DATA.jadwal_wawancara) {
    await prisma.jadwal_wawancara.create({
      data: {
        lamaran_id: idMap.lamaran[row.lamaran_id],
        nama_pelamar: row.nama_pelamar,
        posisi: row.posisi,
        jenis: row.jenis,
        status: row.status,
        tanggal_waktu: toDate(row.tanggal_waktu),
        durasi_menit: toNum(row.durasi_menit),
        lokasi: row.lokasi,
        tautan_rapat: row.tautan_rapat,
        sudah_selesai: toBool(row.sudah_selesai),
        waktu_selesai: toDate(row.waktu_selesai),
        dikonfirmasi_oleh_pelamar: toBool(row.dikonfirmasi_oleh_pelamar),
        waktu_konfirmasi: toDate(row.waktu_konfirmasi),
        status_kehadiran: row.status_kehadiran,
        alasan_tidak_hadir: row.alasan_tidak_hadir,
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
  }
  console.log(`✓ ${DATA.jadwal_wawancara.length} jadwal_wawancara`);

  // ── 13. HASIL PSIKOTES ──────────────────────────────────────────────
  // data_dokumen_pendukung ikut dibawa kalau ada isinya di SQL (bisa
  // diklik/di-download juga), sebagian besar NULL di dump ini.
  console.log("🧪 Membuat hasil_psikotes...");
  for (const row of DATA.hasil_psikotes) {
    await prisma.hasil_psikotes.create({
      data: {
        lamaran_id: idMap.lamaran[row.lamaran_id],
        nama_pelamar: row.nama_pelamar,
        posisi: row.posisi,
        tanggal_tes: toDate(row.tanggal_tes),
        data_dokumen_pendukung: row.data_dokumen_pendukung,
        nama_dokumen_pendukung: row.nama_dokumen_pendukung,
        mime_dokumen_pendukung: row.mime_dokumen_pendukung,
        ukuran_dokumen_pendukung: toNum(row.ukuran_dokumen_pendukung),
        kesimpulan: row.kesimpulan,
        skor_akhir: toNum(row.skor_akhir),
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
  }
  console.log(`✓ ${DATA.hasil_psikotes.length} hasil_psikotes`);

  // ── 14. HASIL WAWANCARA ─────────────────────────────────────────────
  console.log("📋 Membuat hasil_wawancara...");
  for (const row of DATA.hasil_wawancara) {
    await prisma.hasil_wawancara.create({
      data: {
        lamaran_id: idMap.lamaran[row.lamaran_id],
        tahap: toNum(row.tahap),
        tanggal_lahir: toDate(row.tanggal_lahir),
        pendidikan_terakhir: row.pendidikan_terakhir,
        jabatan_dilamar: row.jabatan_dilamar,
        tanggal_wawancara: toDate(row.tanggal_wawancara),
        data_dokumen_pendukung: row.data_dokumen_pendukung,
        nama_dokumen_pendukung: row.nama_dokumen_pendukung,
        mime_dokumen_pendukung: row.mime_dokumen_pendukung,
        ukuran_dokumen_pendukung: toNum(row.ukuran_dokumen_pendukung),
        kesimpulan: row.kesimpulan,
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
        nama_pelamar: row.nama_pelamar,
      },
    });
  }
  console.log(`✓ ${DATA.hasil_wawancara.length} hasil_wawancara`);

  // ── 15. ARSIP ───────────────────────────────────────────────────────
  console.log("📦 Membuat arsip...");
  for (const row of DATA.arsip) {
    await prisma.arsip.create({
      data: {
        lamaran_id: idMap.lamaran[row.lamaran_id],
        pengguna_id: idMap.pengguna[row.pengguna_id],
        lowongan_id: idMap.lowongan[row.lowongan_id],
        nama_pelamar: row.nama_pelamar,
        email_pelamar: row.email_pelamar,
        posisi: row.posisi,
        status_akhir: row.status_akhir,
        tanggal_keputusan: toDate(row.tanggal_keputusan),
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
  }
  console.log(`✓ ${DATA.arsip.length} arsip`);

  // ── 16. PENDAFTARAN TERTUNDA ────────────────────────────────────────
  console.log("⏳ Membuat pendaftaran_tertunda...");
  for (const row of DATA.pendaftaran_tertunda) {
    await prisma.pendaftaran_tertunda.create({
      data: {
        pengguna_id: row.pengguna_id ? idMap.pengguna[row.pengguna_id] : null,
        email: row.email,
        nama: row.nama,
        hash_password: row.hash_password,
        nik: row.nik,
        nomor_hp: row.nomor_hp,
        hash_otp: row.hash_otp,
        otp_kadaluarsa: toDate(row.otp_kadaluarsa),
        percobaan: toNum(row.percobaan),
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
  }
  console.log(`✓ ${DATA.pendaftaran_tertunda.length} pendaftaran_tertunda`);

  // ── 17. NOTIFIKASI ──────────────────────────────────────────────────
  console.log("🔔 Membuat notifikasi...");
  for (const row of DATA.notifikasi) {
    await prisma.notifikasi.create({
      data: {
        pengguna_id: idMap.pengguna[row.pengguna_id],
        jenis: row.jenis,
        judul: row.judul,
        pesan: row.pesan,
        sudah_dibaca: toBool(row.sudah_dibaca),
        tautan_aksi: row.tautan_aksi,
        metadata: row.metadata ?? {},
        created_at: toDate(row.created_at),
        updated_at: toDate(row.updated_at),
      },
    });
  }
  console.log(`✓ ${DATA.notifikasi.length} notifikasi`);

  // ── RINGKASAN ────────────────────────────────────────────────────────
  console.log("\n🎉 Seed selesai!");
  console.log("\n📊 Ringkasan data (sesuai SQL asli):");
  console.log(`   - ${DATA.pengguna.length} pengguna (admin, divisi, pelamar)`);
  console.log(
    `   - ${DATA.dokumen_pengguna.length} dokumen_pengguna — CV & portofolio ASLI per pelamar, bisa diklik/di-download`,
  );
  console.log(`   - ${DATA.pengajuan_sdm.length} pengajuan_sdm`);
  console.log(`   - ${DATA.lowongan.length} lowongan`);
  console.log(
    `   - ${DATA.lamaran.length} lamaran — masing-masing dengan file CV/portofolio ASLI, bisa diklik/di-download`,
  );
  console.log(`   - ${DATA.jadwal_wawancara.length} jadwal_wawancara`);
  console.log(`   - ${DATA.hasil_psikotes.length} hasil_psikotes`);
  console.log(`   - ${DATA.hasil_wawancara.length} hasil_wawancara`);
  console.log(`   - ${DATA.arsip.length} arsip`);
  console.log(`   - ${DATA.pendaftaran_tertunda.length} pendaftaran_tertunda`);
  console.log(`   - ${DATA.notifikasi.length} notifikasi`);
  console.log(
    "\n🔑 Password login semua akun memakai hash yang sama dengan file SQL aslinya (tidak di-generate ulang).",
  );
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
