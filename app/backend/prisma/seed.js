/**
 * prisma/dummy_seed.js
 *
 * Menambahkan data dummy ke database.
 * TIDAK menghapus akun admin & pelamar yang sudah ada (id=1, id=2).
 *
 * Jalankan dengan: node prisma/dummy_seed.js
 * Dependencies: npm install bcryptjs
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DUMMY_PDF_BASE64 = "JVBERi0xLjQK";

async function main() {
  console.log("Mencari akun yang sudah ada...");

  const admin = await prisma.pengguna.findUnique({
    where: { email: "admin@gmail.com" },
  });
  const raden = await prisma.pengguna.findUnique({
    where: { email: "radenhanifabdulhakim67@gmail.com" },
  });

  if (!admin || !raden) {
    throw new Error(
      "Akun admin@gmail.com atau radenhanifabdulhakim67@gmail.com tidak ditemukan. Cek dulu isi tabel pengguna."
    );
  }

  const passwordHash = await bcrypt.hash("Pelamar123!", 10);

  // ── 1. Lengkapi data pelamar yang sudah ada (raden) ────────────────────
  console.log("Melengkapi profil untuk akun pelamar yang sudah ada...");

  await prisma.profil.upsert({
    where: { pengguna_id: raden.id },
    update: {},
    create: {
      pengguna_id: raden.id,
      nik: "3273010101990001",
      jenis_kelamin: "Laki-laki",
      nomor_hp: "081234567890",
      tempat_lahir: "Bandung",
      tanggal_lahir: new Date("1999-05-12"),
      alamat: "Jl. Merdeka No. 10, Bandung",
      tentang: "Fresh graduate Teknik Informatika, tertarik di bidang web development.",
    },
  });

  await prisma.pendidikan.create({
    data: {
      pengguna_id: raden.id,
      institusi: "Universitas Padjadjaran",
      jurusan: "Teknik Informatika",
      gelar: "S1",
      tanggal_mulai: new Date("2018-08-01"),
      tanggal_selesai: new Date("2022-07-01"),
      sedang_berlangsung: false,
    },
  });

  await prisma.pengalaman_kerja.create({
    data: {
      pengguna_id: raden.id,
      jabatan: "Junior Web Developer",
      perusahaan: "PT Digital Kreasi",
      jenis_pekerjaan: "FullTime",
      lokasi: "Bandung",
      bulan_mulai: 8,
      tahun_mulai: "2022",
      bulan_selesai: 12,
      tahun_selesai: "2023",
      sedang_bekerja: false,
    },
  });

  await prisma.keahlian_pengguna.createMany({
    data: ["JavaScript", "React", "Node.js", "MySQL"].map((nama) => ({
      pengguna_id: raden.id,
      nama,
    })),
  });

  await prisma.dokumen_pengguna.upsert({
    where: { pengguna_id: raden.id },
    update: {},
    create: {
      pengguna_id: raden.id,
      url_cv: "cv/radenhanif.pdf",
      nama_cv: "CV_Raden_Hanif.pdf",
      url_portofolio: "portofolio/radenhanif.pdf",
      nama_portofolio: "Portofolio_Raden_Hanif.pdf",
    },
  });

  // ── 2. Tambah 3 pelamar baru ─────────────────────────────────────────────
  console.log("Membuat 3 pelamar baru...");

  const pelamarData = [
    {
      email: "citra.dewi@gmail.com",
      nama: "Citra Dewi",
      nik: "3273010404950004",
      hp: "081234567804",
      lahir: new Date("1995-04-04"),
      tempat: "Surabaya",
      tentang: "Berpengalaman sebagai UI/UX Designer selama 4 tahun.",
      pendidikan: {
        institusi: "Institut Teknologi Sepuluh Nopember",
        jurusan: "Desain Komunikasi Visual",
        gelar: "S1",
        mulai: new Date("2013-08-01"),
        selesai: new Date("2017-07-01"),
      },
      pengalaman: {
        jabatan: "UI/UX Designer",
        perusahaan: "PT Kreatif Nusantara",
        jenis: "FullTime",
        lokasi: "Surabaya",
        bulanMulai: 1,
        tahunMulai: "2018",
        bekerja: true,
      },
      keahlian: ["Figma", "Adobe XD", "Wireframing"],
    },
    {
      email: "doni.saputra@gmail.com",
      nama: "Doni Saputra",
      nik: "3273010505920005",
      hp: "081234567805",
      lahir: new Date("1992-05-05"),
      tempat: "Yogyakarta",
      tentang: "Data analyst dengan pengalaman di bidang keuangan.",
      pendidikan: {
        institusi: "Universitas Gadjah Mada",
        jurusan: "Statistika",
        gelar: "S1",
        mulai: new Date("2010-08-01"),
        selesai: new Date("2014-07-01"),
      },
      pengalaman: {
        jabatan: "Data Analyst",
        perusahaan: "PT Finansial Sejahtera",
        jenis: "FullTime",
        lokasi: "Yogyakarta",
        bulanMulai: 3,
        tahunMulai: "2015",
        bulanSelesai: 6,
        tahunSelesai: "2023",
        bekerja: false,
      },
      keahlian: ["Python", "SQL", "Power BI"],
    },
    {
      email: "eka.putri@gmail.com",
      nama: "Eka Putri",
      nik: "3273010606980006",
      hp: "081234567806",
      lahir: new Date("1998-06-06"),
      tempat: "Semarang",
      tentang: "HR generalist dengan minat besar di rekrutmen digital.",
      pendidikan: {
        institusi: "Universitas Diponegoro",
        jurusan: "Manajemen SDM",
        gelar: "S1",
        mulai: new Date("2016-08-01"),
        selesai: new Date("2020-07-01"),
      },
      pengalaman: {
        jabatan: "HR Staff",
        perusahaan: "PT Sumber Daya Insani",
        jenis: "FullTime",
        lokasi: "Semarang",
        bulanMulai: 2,
        tahunMulai: "2021",
        bekerja: true,
      },
      keahlian: ["Rekrutmen", "Microsoft Excel", "Komunikasi"],
    },
  ];

  const pelamarList = [];
  for (const p of pelamarData) {
    const user = await prisma.pengguna.create({
      data: {
        email: p.email,
        nama: p.nama,
        password: passwordHash,
        peran: "pelamar",
        status_akun: "active",
        profil: {
          create: {
            nik: p.nik,
            jenis_kelamin: p.nama.endsWith("a") ? "Perempuan" : "Laki-laki",
            nomor_hp: p.hp,
            tempat_lahir: p.tempat,
            tanggal_lahir: p.lahir,
            alamat: `Jl. Contoh No. ${Math.floor(Math.random() * 100)}, ${p.tempat}`,
            tentang: p.tentang,
          },
        },
        pendidikan: {
          create: {
            institusi: p.pendidikan.institusi,
            jurusan: p.pendidikan.jurusan,
            gelar: p.pendidikan.gelar,
            tanggal_mulai: p.pendidikan.mulai,
            tanggal_selesai: p.pendidikan.selesai,
            sedang_berlangsung: false,
          },
        },
        pengalaman_kerja: {
          create: {
            jabatan: p.pengalaman.jabatan,
            perusahaan: p.pengalaman.perusahaan,
            jenis_pekerjaan: p.pengalaman.jenis,
            lokasi: p.pengalaman.lokasi,
            bulan_mulai: p.pengalaman.bulanMulai,
            tahun_mulai: p.pengalaman.tahunMulai,
            bulan_selesai: p.pengalaman.bulanSelesai ?? null,
            tahun_selesai: p.pengalaman.tahunSelesai ?? null,
            sedang_bekerja: p.pengalaman.bekerja,
          },
        },
        keahlian_pengguna: {
          create: p.keahlian.map((k) => ({ nama: k })),
        },
        dokumen_pengguna: {
          create: {
            url_cv: `cv/${p.email.split("@")[0]}.pdf`,
            nama_cv: `CV_${p.nama.replace(/\s+/g, "_")}.pdf`,
          },
        },
      },
    });
    pelamarList.push(user);
  }

  const [citra, doni] = pelamarList;

  // ── 3. Pengajuan SDM ──────────────────────────────────────────────────────
  console.log("Membuat pengajuan SDM...");

  const pengajuan = await prisma.pengajuan_sdm.create({
    data: {
      pengguna_id: admin.id,
      departemen: "Information Technology",
      posisi: "Backend Developer",
      alasan: "Penambahan kapasitas tim untuk proyek baru.",
      jumlah: 2,
      status_karyawan: "Karyawan Tetap",
      tugas_utama: [
        "Mengembangkan dan memelihara REST API",
        "Melakukan code review",
        "Berkoordinasi dengan tim frontend",
      ],
      usia_min: 22,
      usia_maks: 35,
      status_perkawinan: ["Menikah", "Belum Menikah"],
      pendidikan_terakhir: "S1 (Sarjana)",
      keahlian: ["Node.js", "MySQL", "REST API", "Git"],
      pengalaman: "Minimal 2 tahun di bidang backend development.",
      bahasa_asing: "Inggris",
      level_bahasa_asing: "Menengah",
      keahlian_komputer: ["Microsoft Office", "Visual Studio Code", "Postman"],
      fasilitas: ["BPJS Kesehatan", "BPJS Ketenagakerjaan", "Laptop Kantor"],
      peta_kekuatan: { analitis: 4, komunikasi: 3, kepemimpinan: 2, kerjaTim: 4 },
      status: "APPROVED",
      dikirim: new Date(),
      catatan_admin: "Disetujui, silakan buka lowongan.",
      ditinjau: new Date(),
    },
  });

  // ── 4. Lowongan ───────────────────────────────────────────────────────────
  console.log("Membuat lowongan...");

  const lowonganBackend = await prisma.lowongan.create({
    data: {
      pengajuan_sdm_id: pengajuan.id,
      judul: "Backend Developer",
      departemen: "Information Technology",
      lokasi: "Bandung",
      jenis: "FullTime",
      deskripsi: "Bertanggung jawab mengembangkan dan memelihara layanan backend perusahaan.",
      persyaratan: "Minimal S1 Teknik Informatika, menguasai Node.js dan MySQL, pengalaman 2 tahun.",
      tenggat: new Date("2026-09-30"),
      status: "active",
    },
  });

  const lowonganDesigner = await prisma.lowongan.create({
    data: {
      judul: "UI/UX Designer",
      departemen: "Product",
      lokasi: "Surabaya",
      jenis: "FullTime",
      deskripsi: "Merancang antarmuka dan pengalaman pengguna untuk produk digital perusahaan.",
      persyaratan: "Menguasai Figma, memiliki portofolio, pengalaman minimal 2 tahun.",
      tenggat: new Date("2026-09-15"),
      status: "active",
    },
  });

  const lowonganAnalyst = await prisma.lowongan.create({
    data: {
      judul: "Data Analyst",
      departemen: "Finance",
      lokasi: "Yogyakarta",
      jenis: "Contract",
      deskripsi: "Menganalisis data keuangan untuk mendukung pengambilan keputusan bisnis.",
      persyaratan: "Menguasai SQL dan Power BI, pengalaman minimal 3 tahun.",
      tenggat: new Date("2026-08-31"),
      status: "closed",
    },
  });

  // ── 5. Lamaran ────────────────────────────────────────────────────────────
  console.log("Membuat lamaran...");

  const lamaranRaden = await prisma.lamaran.create({
    data: {
      pengguna_id: raden.id,
      lowongan_id: lowonganBackend.id,
      status: "Interview",
      tahap: "Interview Kedua",
      tanggal_melamar: new Date("2026-06-10"),
      data_cv: DUMMY_PDF_BASE64,
      mime_cv: "application/pdf",
      nama_cv: "CV_Raden_Hanif.pdf",
      ukuran_cv: 245760,
      skor: 85,
    },
  });

  const lamaranCitra = await prisma.lamaran.create({
    data: {
      pengguna_id: citra.id,
      lowongan_id: lowonganDesigner.id,
      status: "Diterima",
      tahap: "Selesai",
      tanggal_melamar: new Date("2026-06-05"),
      data_cv: DUMMY_PDF_BASE64,
      mime_cv: "application/pdf",
      nama_cv: "CV_Citra_Dewi.pdf",
      ukuran_cv: 198432,
      data_portofolio: DUMMY_PDF_BASE64,
      mime_portofolio: "application/pdf",
      nama_portofolio: "Portofolio_Citra_Dewi.pdf",
      ukuran_portofolio: 3145728,
      skor: 92,
    },
  });

  const lamaranDoni = await prisma.lamaran.create({
    data: {
      pengguna_id: doni.id,
      lowongan_id: lowonganAnalyst.id,
      status: "Ditolak",
      tahap: "Screaning",
      tanggal_melamar: new Date("2026-05-20"),
      data_cv: DUMMY_PDF_BASE64,
      mime_cv: "application/pdf",
      nama_cv: "CV_Doni_Saputra.pdf",
      ukuran_cv: 210304,
      skor: 60,
    },
  });

  // ── 6. Jadwal Wawancara ──────────────────────────────────────────────────
  console.log("Membuat jadwal wawancara...");

  await prisma.jadwal_wawancara.create({
    data: {
      lamaran_id: lamaranRaden.id,
      nama_pelamar: raden.nama,
      posisi: "Backend Developer",
      jenis: "InterviewKedua",
      status: "scheduled",
      tanggal_waktu: new Date("2026-08-20T10:00:00"),
      durasi_menit: 60,
      lokasi: "Kantor Pusat Bandung, Ruang Meeting 2",
      tautan_rapat: "https://meet.google.com/contoh-wawancara",
      dikonfirmasi_oleh_pelamar: true,
      waktu_konfirmasi: new Date("2026-08-15T09:00:00"),
      status_kehadiran: "confirmed",
    },
  });

  await prisma.jadwal_wawancara.create({
    data: {
      lamaran_id: lamaranCitra.id,
      nama_pelamar: "Citra Dewi",
      posisi: "UI/UX Designer",
      jenis: "InterviewPertama",
      status: "completed",
      tanggal_waktu: new Date("2026-06-15T13:00:00"),
      durasi_menit: 45,
      lokasi: "Kantor Cabang Surabaya",
      sudah_selesai: true,
      waktu_selesai: new Date("2026-06-15T13:45:00"),
      dikonfirmasi_oleh_pelamar: true,
      waktu_konfirmasi: new Date("2026-06-12T08:00:00"),
      status_kehadiran: "hadir",
    },
  });

  await prisma.jadwal_wawancara.create({
    data: {
      lamaran_id: lamaranDoni.id,
      nama_pelamar: "Doni Saputra",
      posisi: "Data Analyst",
      jenis: "Psikotes",
      status: "canceled",
      tanggal_waktu: new Date("2026-05-25T09:00:00"),
      durasi_menit: 90,
      lokasi: "Kantor Cabang Yogyakarta",
      status_kehadiran: "tidak_hadir",
      alasan_tidak_hadir: "Pelamar mengundurkan diri dari proses seleksi.",
    },
  });

  // ── 7. Hasil Psikotes ────────────────────────────────────────────────────
  console.log("Membuat hasil psikotes...");

  await prisma.hasil_psikotes.create({
    data: {
      lamaran_id: lamaranRaden.id,
      nama_pelamar: raden.nama,
      posisi: "Backend Developer",
      tanggal_tes: new Date("2026-06-25"),
      kesimpulan: "Direkomendasikan",
      skor_akhir: 88,
    },
  });

  // ── 8. Hasil Wawancara ───────────────────────────────────────────────────
  console.log("Membuat hasil wawancara...");

  await prisma.hasil_wawancara.create({
    data: {
      lamaran_id: lamaranCitra.id,
      tahap: 1,
      nama_pelamar: "Citra Dewi",
      tanggal_lahir: new Date("1995-04-04"),
      pendidikan_terakhir: "S1 Desain Komunikasi Visual",
      jabatan_dilamar: "UI/UX Designer",
      tanggal_wawancara: new Date("2026-06-15"),
      kesimpulan: "Sangat direkomendasikan, komunikasi baik dan portofolio kuat.",
    },
  });

  // ── 9. Arsip ──────────────────────────────────────────────────────────────
  console.log("Membuat arsip...");

  await prisma.arsip.create({
    data: {
      lamaran_id: lamaranCitra.id,
      pengguna_id: citra.id,
      lowongan_id: lowonganDesigner.id,
      nama_pelamar: "Citra Dewi",
      email_pelamar: "citra.dewi@gmail.com",
      posisi: "UI/UX Designer",
      status_akhir: "Diterima",
      tanggal_keputusan: new Date("2026-06-20"),
    },
  });

  await prisma.arsip.create({
    data: {
      lamaran_id: lamaranDoni.id,
      pengguna_id: doni.id,
      lowongan_id: lowonganAnalyst.id,
      nama_pelamar: "Doni Saputra",
      email_pelamar: "doni.saputra@gmail.com",
      posisi: "Data Analyst",
      status_akhir: "Ditolak",
      tanggal_keputusan: new Date("2026-05-28"),
    },
  });

  // ── 10. Notifikasi ───────────────────────────────────────────────────────
  console.log("Membuat notifikasi...");

  await prisma.notifikasi.create({
    data: {
      pengguna_id: raden.id,
      jenis: "wawancara",
      judul: "Jadwal Wawancara Ditentukan",
      pesan: "Anda dijadwalkan wawancara tahap kedua pada 20 Agustus 2026 pukul 10:00.",
      tautan_aksi: "/jadwal-wawancara",
      metadata: { lamaran_id: lamaranRaden.id },
    },
  });

  await prisma.notifikasi.create({
    data: {
      pengguna_id: citra.id,
      jenis: "status_lamaran",
      judul: "Selamat! Anda Diterima",
      pesan: "Selamat, Anda dinyatakan diterima untuk posisi UI/UX Designer.",
      sudah_dibaca: true,
      tautan_aksi: "/lamaran-saya",
      metadata: { lamaran_id: lamaranCitra.id },
    },
  });

  await prisma.notifikasi.create({
    data: {
      pengguna_id: doni.id,
      jenis: "status_lamaran",
      judul: "Update Status Lamaran",
      pesan: "Mohon maaf, lamaran Anda untuk posisi Data Analyst belum dapat kami lanjutkan.",
      tautan_aksi: "/lamaran-saya",
      metadata: { lamaran_id: lamaranDoni.id },
    },
  });

  await prisma.notifikasi.create({
    data: {
      pengguna_id: admin.id,
      jenis: "pengajuan_sdm",
      judul: "Pengajuan SDM Disetujui",
      pesan: "Pengajuan kebutuhan SDM untuk posisi Backend Developer telah disetujui.",
      tautan_aksi: "/pengajuan-sdm",
      metadata: { pengajuan_sdm_id: pengajuan.id },
    },
  });

  console.log("✅ Dummy data selesai ditambahkan!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat dummy data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });