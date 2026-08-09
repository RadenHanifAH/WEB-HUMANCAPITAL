const penilaianRepository = require("./penilaian.repository");
const applicationService = require("../application/application.service");

// ✅ FIX: Hapus "Dipertimbangkan"
const KESIMPULAN_PSIKOTEST_OPTIONS = [
  "Direkomendasikan",
  "Tidak Direkomendasikan",
];

// ✅ FIX: Hapus "Dipertimbangkan"
const KESIMPULAN_INTERVIEW = ["Direkomendasikan", "Tidak Direkomendasikan"];

const INTERVIEW_STAGES = [1, 2];

const VALID_STAGE_KEYS = ["interview-pertama", "psikotes", "interview-kedua"];

const STAGE_ORDER = [
  "Screaning",
  "Interview Pertama",
  "Psikotes",
  "Interview Kedua",
  "Final Result",
];

const MAX_DOKUMEN_PENDUKUNG_SIZE = 10 * 1024 * 1024; // 10MB

const advanceApplicationStage = async (lamaran_id, targetStage) => {
  if (!lamaran_id) return;

  try {
    const current = await penilaianRepository.getApplicationStage(lamaran_id);
    if (!current) return;

    const lowStatus = String(current.status || "").toLowerCase();
    if (lowStatus.startsWith("rejected") || lowStatus === "diterima") return;

    const currentIndex = STAGE_ORDER.indexOf(current.tahap);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);

    if (currentIndex === -1 || currentIndex < targetIndex) {
      await applicationService.updateApplicationStatus(lamaran_id, targetStage);
    }
  } catch (err) {
    console.error("Gagal auto-advance stage aplikasi:", err.message);
  }
};

const rejectApplication = async (lamaran_id, reason) => {
  if (!lamaran_id) return;
  try {
    await applicationService.updateApplicationStatus(lamaran_id, "Ditolak");
    console.log(`✅ Application #${lamaran_id} otomatis ditolak (${reason}).`);
  } catch (err) {
    console.error(
      `❌ Gagal auto-tolak application #${lamaran_id}:`,
      err.message,
    );
  }
};

const syncApplicationScoreFromPsikotest = async (lamaran_id, skor_akhir) => {
  if (!lamaran_id) {
    console.warn(
      "⚠️ syncApplicationScoreFromPsikotest dilewati: lamaran_id kosong/null. " +
        "Kemungkinan psikotest ini tidak terhubung ke lamaran manapun.",
    );
    return { synced: false, reason: "NO_LAMARAN_ID" };
  }

  try {
    const updated = await applicationService.updateApplicationScore(
      lamaran_id,
      skor_akhir,
    );
    console.log(
      `✅ Skor lamaran #${lamaran_id} berhasil disinkron ke ${updated.skor}`,
    );
    return { synced: true, lamaran_id, skor: updated.skor };
  } catch (err) {
    console.error(
      `❌ Gagal sinkronkan skor lamaran #${lamaran_id} dari psikotest ` +
        `(skor_akhir=${skor_akhir}):`,
      err.message,
    );
    return { synced: false, reason: err.message };
  }
};

// ---------- PSIKOTEST ----------

const saveOrUpdatePsikotest = async (payload) => {
  const {
    id,
    lamaran_id,
    nama_pelamar,
    posisi,
    tanggal_tes,
    kesimpulan,
    skor_akhir,
    data_dokumen_pendukung,
    nama_dokumen_pendukung,
    mime_dokumen_pendukung,
    ukuran_dokumen_pendukung,
  } = payload;

  if (!nama_pelamar) throw new Error("Nama kandidat wajib diisi");
  if (!posisi) throw new Error("Posisi dilamar wajib diisi");
  if (!kesimpulan || !KESIMPULAN_PSIKOTEST_OPTIONS.includes(kesimpulan)) {
    throw new Error("Kesimpulan test tidak valid");
  }
  if (skor_akhir === undefined || skor_akhir === null || skor_akhir === "") {
    throw new Error("Skor akhir wajib diisi");
  }
  if (Number(skor_akhir) < 1 || Number(skor_akhir) > 100) {
    throw new Error("Skor akhir harus di antara 1-100");
  }

  const data = {
    lamaran_id: lamaran_id ? Number(lamaran_id) : null,
    nama_pelamar,
    posisi,
    tanggal_tes: tanggal_tes ? new Date(tanggal_tes) : new Date(),
    kesimpulan,
    skor_akhir: Number(skor_akhir),
    data_dokumen_pendukung: data_dokumen_pendukung || null,
    nama_dokumen_pendukung: nama_dokumen_pendukung || null,
    mime_dokumen_pendukung: mime_dokumen_pendukung || null,
    ukuran_dokumen_pendukung:
      ukuran_dokumen_pendukung !== undefined &&
      ukuran_dokumen_pendukung !== null
        ? Number(ukuran_dokumen_pendukung)
        : null,
  };

  const result = id
    ? await penilaianRepository.updatePsikotest(id, data)
    : await penilaianRepository.createPsikotest(data);

  let scoreSyncWarning = null;

  if (data.lamaran_id) {
    if (data.kesimpulan === "Tidak Direkomendasikan") {
      await rejectApplication(
        data.lamaran_id,
        "Tidak Direkomendasikan Psikotes",
      );
    } else {
      await advanceApplicationStage(data.lamaran_id, "Interview Kedua");
    }

    const syncResult = await syncApplicationScoreFromPsikotest(
      data.lamaran_id,
      data.skor_akhir,
    );

    if (!syncResult.synced) {
      scoreSyncWarning =
        `Data psikotest berhasil disimpan, tapi skor gagal disinkronkan ` +
        `ke tabel Pelamar: ${syncResult.reason}`;
    }
  } else {
    scoreSyncWarning =
      "Psikotest ini tidak terhubung ke lamaran manapun (lamaran_id kosong), " +
      "sehingga skor tidak akan muncul di tabel Pelamar.";
  }

  return {
    ...result,
    ...(scoreSyncWarning ? { _scoreSyncWarning: scoreSyncWarning } : {}),
  };
};

const getPsikotest = async (id) => penilaianRepository.getPsikotestById(id);

const getPsikotestByApplication = async (lamaran_id) =>
  penilaianRepository.getPsikotestByApplication(lamaran_id);

const listPsikotest = async (params) =>
  penilaianRepository.listPsikotest(params);

const removePsikotest = async (id) => penilaianRepository.deletePsikotest(id);

// ---------- INTERVIEW ----------

const saveOrUpdateInterview = async (payload) => {
  const {
    id,
    lamaran_id,
    tahap,
    nama_pelamar,
    tanggal_lahir,
    pendidikan_terakhir,
    jabatan_dilamar,
    tanggal_wawancara,
    kesimpulan,
    data_dokumen_pendukung,
    nama_dokumen_pendukung,
    mime_dokumen_pendukung,
    ukuran_dokumen_pendukung,
  } = payload;

  if (!nama_pelamar) throw new Error("Nama calon wajib diisi");
  if (!kesimpulan || !KESIMPULAN_INTERVIEW.includes(kesimpulan)) {
    throw new Error("Kesimpulan wawancara tidak valid");
  }

  const tahapNumber = tahap ? Number(tahap) : 1;
  if (!INTERVIEW_STAGES.includes(tahapNumber)) {
    throw new Error("Tahap wawancara tidak valid (harus 1 atau 2)");
  }

  if (data_dokumen_pendukung) {
    if (!nama_dokumen_pendukung) {
      throw new Error("Nama file dokumen pendukung tidak valid");
    }
    if (Number(ukuran_dokumen_pendukung) > MAX_DOKUMEN_PENDUKUNG_SIZE) {
      throw new Error("Ukuran dokumen pendukung maksimal 10MB");
    }
  }

  const data = {
    lamaran_id: lamaran_id ? Number(lamaran_id) : null,
    tahap: tahapNumber,
    nama_pelamar,
    tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
    pendidikan_terakhir: pendidikan_terakhir || null,
    jabatan_dilamar: jabatan_dilamar || "-",
    tanggal_wawancara: tanggal_wawancara
      ? new Date(tanggal_wawancara)
      : new Date(),
    kesimpulan,
    data_dokumen_pendukung: data_dokumen_pendukung || null,
    nama_dokumen_pendukung: nama_dokumen_pendukung || null,
    mime_dokumen_pendukung: mime_dokumen_pendukung || null,
    ukuran_dokumen_pendukung:
      ukuran_dokumen_pendukung !== undefined &&
      ukuran_dokumen_pendukung !== null
        ? Number(ukuran_dokumen_pendukung)
        : null,
  };

  const result = id
    ? await penilaianRepository.updateInterview(id, data)
    : await penilaianRepository.createInterview(data);

  if (data.lamaran_id) {
    if (data.kesimpulan === "Tidak Direkomendasikan") {
      await rejectApplication(
        data.lamaran_id,
        `Tidak Direkomendasikan Interview Tahap ${data.tahap}`,
      );
    } else {
      if (data.tahap === 1) {
        await advanceApplicationStage(data.lamaran_id, "Psikotes");
      } else if (data.tahap === 2) {
        await advanceApplicationStage(data.lamaran_id, "Final Result");
      }
    }
  }

  return result;
};

const getInterview = async (id) => penilaianRepository.getInterviewById(id);

const getInterviewByApplication = async (lamaran_id, tahap) =>
  penilaianRepository.getInterviewByApplication(
    lamaran_id,
    tahap ? Number(tahap) : undefined,
  );

const listInterview = async (params) =>
  penilaianRepository.listInterview(params);

const removeInterview = async (id) => penilaianRepository.deleteInterview(id);

// ---------- PREFILL (+ profil lengkap) ----------

const getApplicationForPrefill = async (lamaran_id) => {
  const app = await penilaianRepository.getApplicationForPrefill(lamaran_id);
  if (!app) return null;

  return {
    id: app.id,
    tahap: app.tahap,
    status: app.status,
    pengguna: app.pengguna
      ? {
          nama: app.pengguna.nama,
          email: app.pengguna.email,
          profil: app.pengguna.profil || null,
          pendidikan: app.pengguna.pendidikan || [],
        }
      : null,
    lowongan: app.lowongan ? { judul: app.lowongan.judul } : null,
  };
};

// ---------- search kandidat untuk autocomplete, DIFILTER sesuai tahap ----------

const searchCandidates = async (q, stageKey) => {
  if (!q || q.trim().length < 2) return [];

  const normalizedStageKey = VALID_STAGE_KEYS.includes(stageKey)
    ? stageKey
    : undefined;

  const apps = await penilaianRepository.searchApplicationsByName(
    q,
    normalizedStageKey,
  );

  return apps.map((app) => {
    const profil = app.pengguna?.profil || null;
    const latestPendidikan = app.pengguna?.pendidikan?.[0] || null;

    const rawTanggalLahir = profil?.tanggal_lahir;
    const tanggal_lahir = rawTanggalLahir
      ? rawTanggalLahir instanceof Date
        ? rawTanggalLahir.toISOString().substring(0, 10)
        : String(rawTanggalLahir).substring(0, 10)
      : "";

    return {
      applicationId: app.id,
      applicantName: app.pengguna?.nama || "",
      position: app.lowongan?.judul || "",
      profile: { fotoProfile: profil?.foto_profil || null },

      id: app.id,
      pengguna: app.pengguna
        ? {
            nama: app.pengguna.nama,
            email: app.pengguna.email,
            profil,
          }
        : null,
      lowongan: app.lowongan ? { judul: app.lowongan.judul } : null,

      tahap: app.tahap,
      status: app.status,
      tanggal_lahir,
      pendidikan_terakhir: latestPendidikan?.gelar || "",
    };
  });
};

// ---------- DOKUMEN PENILAIAN ----------

const mapPsikotestForClient = (h) => {
  if (!h) return null;
  return {
    id: h.id,
    lamaran_id: h.lamaran_id,
    namaPelamar: h.nama_pelamar,
    posisi: h.posisi,
    tanggalTest: h.tanggal_tes,
    kesimpulan: h.kesimpulan,
    skorAkhir: h.skor_akhir,
    dataDokumenPendukung: h.data_dokumen_pendukung,
    namaDokumenPendukung: h.nama_dokumen_pendukung,
    mimeDokumenPendukung: h.mime_dokumen_pendukung,
    ukuranDokumenPendukung: h.ukuran_dokumen_pendukung,
    updatedAt: h.updated_at,
    createdAt: h.created_at,
  };
};

const mapInterviewForClient = (h) => {
  if (!h) return null;
  return {
    id: h.id,
    lamaran_id: h.lamaran_id,
    tahap: h.tahap,
    namaPelamar: h.nama_pelamar,
    tanggalLahir: h.tanggal_lahir,
    pendidikanTerakhir: h.pendidikan_terakhir,
    jabatanDilamar: h.jabatan_dilamar,
    tanggalWawancara: h.tanggal_wawancara,
    kesimpulan: h.kesimpulan,
    dataDokumenPendukung: h.data_dokumen_pendukung,
    namaDokumenPendukung: h.nama_dokumen_pendukung,
    mimeDokumenPendukung: h.mime_dokumen_pendukung,
    ukuranDokumenPendukung: h.ukuran_dokumen_pendukung,
    updatedAt: h.updated_at,
    createdAt: h.created_at,
  };
};

const mapAssessmentDocument = (app) => {
  const profil = app.pengguna?.profil || null;
  const rawPsikotest = app.hasil_psikotes?.[0] || null;
  const rawWawancara1 = app.hasil_wawancara?.find((r) => r.tahap === 1) || null;
  const rawWawancara2 = app.hasil_wawancara?.find((r) => r.tahap === 2) || null;

  const timestamps = [
    rawPsikotest?.updated_at,
    rawWawancara1?.updated_at,
    rawWawancara2?.updated_at,
  ].filter(Boolean);
  const lastUpdatedAt = timestamps.length
    ? new Date(Math.max(...timestamps.map((d) => new Date(d).getTime())))
    : app.tanggal_melamar;

  return {
    applicationId: app.id,
    applicantName: app.pengguna?.nama || "-",
    email: app.pengguna?.email || "-",
    position: app.lowongan?.judul || "-",
    fotoProfile: profil?.foto_profil || null,
    alamat: profil?.alamat || null,
    stage: app.tahap || "-",
    status: app.status || "-",
    skills: app.pengguna?.keahlian_pengguna?.map((k) => k.nama) || [],

    psikotest: mapPsikotestForClient(rawPsikotest),
    interview1: mapInterviewForClient(rawWawancara1),
    interview2: mapInterviewForClient(rawWawancara2),

    hasCv: !!app.nama_cv,
    hasPortfolio: !!app.nama_portofolio,
    lastUpdatedAt,
  };
};

const listAssessmentDocuments = async (q) => {
  const apps = await penilaianRepository.listAssessmentDocuments(q);
  return apps.map(mapAssessmentDocument);
};

module.exports = {
  saveOrUpdatePsikotest,
  getPsikotest,
  getPsikotestByApplication,
  listPsikotest,
  removePsikotest,

  saveOrUpdateInterview,
  getInterview,
  getInterviewByApplication,
  listInterview,
  removeInterview,

  getApplicationForPrefill,
  searchCandidates,

  listAssessmentDocuments,
};