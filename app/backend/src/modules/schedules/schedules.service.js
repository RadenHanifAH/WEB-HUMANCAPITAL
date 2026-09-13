const prisma = require("../../config/prisma");
const { sendScheduleEmail } = require("./schedules.email");
const applicationService = require("../application/application.service");
const { verifyConfirmToken } = require("./schedules.token"); // ✅ BARU
const {
  notificationsService,
  NOTIFICATION_TYPES,
} = require("../notifications/notifications.service");

const STAGE_MAP = {
  InterviewHC: [
    "Interview Pertama", "interview pertama", "interview-pertama", "interviewpertama",
    "Interview HC", "interview hc", "interviewhc", "interview-hc",
  ],
  Psikotes: [
    "Psikotes", "psikotes", "Psikotes/Technical Test", "psikotes/technical test",
    "psychotest", "technical test",
  ],
  FinalInterview: [
    "Interview Kedua", "interview kedua", "interview-kedua", "interviewkedua",
    "Final Interview", "final interview", "finalinterview", "final-interview",
  ],
};

const TYPE_LABELS = {
  InterviewHC: "Interview Pertama",
  Psikotes: "Psikotes",
  FinalInterview: "Interview Kedua",
};

const PRISMA_ENUM_MAP = {
  InterviewHC: "InterviewPertama",
  Psikotes: "Psikotes",
  FinalInterview: "InterviewKedua",
  InterviewPertama: "InterviewPertama",
  InterviewKedua: "InterviewKedua",
};

const ATTENDANCE_VALUES = ["pending", "hadir", "tidak_hadir"];

function assertDateIsHPlusOne(dateStr) {
  const requested = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(requested.getTime())) throw new Error("Format tanggal tidak valid");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);

  if (requested < minDate) {
    throw new Error("Tanggal jadwal minimal H+1 (besok), tidak bisa hari ini");
  }
}

function fireNotification(payload) {
  notificationsService
    .notifyAllAdmins(payload)
    .catch((err) => console.error("❌ Gagal membuat notifikasi:", err.message));
}

const APPLICANT_INCLUDE = {
  pengguna: {
    select: {
      id: true, nama: true, email: true,
      profil: { select: { foto_profil: true } },
    },
  },
  lowongan: { select: { id: true, judul: true } },
};

class SchedulesService {
  _toClientShape(s) {
    return {
      id: s.id,
      applicationId: s.lamaran_id,
      applicantName: s.lamaran?.pengguna?.nama || s.nama_pelamar || "Unknown",
      applicantEmail: s.lamaran?.pengguna?.email || "-",
      position: s.lamaran?.lowongan?.judul || s.posisi || "Unknown Position",
      avatar: s.lamaran?.pengguna?.profil?.foto_profil || null,
      type: s.jenis,
      status: s.status,
      dateTime: s.tanggal_waktu,
      durationMin: s.durasi_menit,
      location: s.lokasi,
      meetingLink: s.tautan_rapat,
      isCompleted: s.sudah_selesai,
      completedAt: s.waktu_selesai,
      attendanceStatus: s.status_kehadiran,
      absentReason: s.alasan_tidak_hadir,
      confirmedByApplicant: s.dikonfirmasi_oleh_pelamar,
      confirmedAt: s.waktu_konfirmasi,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    };
  }

  async listApplicantsByStage({ type }) {
    const validStatuses = STAGE_MAP[type];
    if (!validStatuses) throw new Error("Tipe tidak valid");

    const apps = await prisma.lamaran.findMany({
      where: { status: { in: validStatuses } },
      include: APPLICANT_INCLUDE,
      orderBy: { tanggal_melamar: "desc" },
    });

    return apps.map((a) => ({
      applicationId: a.id,
      userId: a.pengguna_id,
      applicantName: a.pengguna?.nama || "Unknown",
      applicantEmail: a.pengguna?.email || "-",
      position: a.lowongan?.judul || "Unknown Position",
      avatar: a.pengguna?.profil?.foto_profil || null,
    }));
  }

  async listApplicants({ q = "" }) {
    const where = q ? {
      OR: [
        { pengguna: { nama: { contains: q } } },
        { pengguna: { email: { contains: q } } },
        { lowongan: { judul: { contains: q } } },
      ],
    } : {};

    const apps = await prisma.lamaran.findMany({
      where,
      include: APPLICANT_INCLUDE,
      orderBy: { tanggal_melamar: "desc" },
      take: 50,
    });

    return apps.map((a) => ({
      applicationId: a.id,
      userId: a.pengguna_id,
      applicantName: a.pengguna?.nama || "Unknown",
      applicantEmail: a.pengguna?.email || "-",
      position: a.lowongan?.judul || "Unknown Position",
      avatar: a.pengguna?.profil?.foto_profil || null,
    }));
  }

  async listMySchedules(penggunaId) {
    if (!penggunaId) throw new Error("Tidak ada pengguna yang login");

    const items = await prisma.jadwal_wawancara.findMany({
      where: {
        lamaran: { pengguna_id: Number(penggunaId) },
        status: { not: "canceled" },
      },
      include: { lamaran: { include: APPLICANT_INCLUDE } },
      orderBy: { tanggal_waktu: "asc" },
    });

    return items.map((s) => this._toClientShape(s));
  }

  async listSchedules({ date = "", type = "all", page = 1, pageSize = 10 }) {
    const take = Number(pageSize) || 10;
    const skip = (Number(page) - 1) * take;

    const prismaType = PRISMA_ENUM_MAP[type] || type;

    const where = {
      AND: [
        type !== "all" && prismaType ? { jenis: prismaType } : {},
        date ? {
          tanggal_waktu: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lte: new Date(`${date}T23:59:59.999Z`),
          },
        } : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.jadwal_wawancara.count({ where }),
      prisma.jadwal_wawancara.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take,
        include: {
          lamaran: { include: APPLICANT_INCLUDE },
        },
      }),
    ]);

    return {
      total,
      items: items.map((s) => this._toClientShape(s)),
      page: Number(page),
      pageSize: take,
    };
  }

  async getScheduleById(id) {
    const s = await prisma.jadwal_wawancara.findUnique({
      where: { id: Number(id) },
      include: {
        lamaran: { include: APPLICANT_INCLUDE },
      },
    });
    if (!s) throw new Error("Jadwal tidak ditemukan");
    return this._toClientShape(s);
  }

  async createSchedule({ applicationId, type, date, time, durationMin = 60, location, meetingLink = null }) {
    if (!applicationId || !type || !date || !time || !location) {
      throw new Error("applicationId, type, date, time, location wajib diisi");
    }

    const prismaType = PRISMA_ENUM_MAP[type];
    if (!prismaType) {
      throw new Error(`Tipe jadwal tidak valid: ${type}`);
    }

    assertDateIsHPlusOne(date);

    const app = await prisma.lamaran.findUnique({
      where: { id: Number(applicationId) },
      include: {
        pengguna: { select: { id: true, nama: true, email: true, profil: { select: { foto_profil: true } } } },
        lowongan: true,
      },
    });
    if (!app) throw new Error("Application tidak ditemukan");

    const dateTime = new Date(`${date}T${time}:00`);

    const conflict = await prisma.jadwal_wawancara.findFirst({
      where: { lamaran_id: Number(applicationId), tanggal_waktu: dateTime, status: { not: "canceled" } },
    });
    if (conflict) throw new Error("Jadwal untuk kandidat ini di waktu tersebut sudah ada");

    const created = await prisma.jadwal_wawancara.create({
      data: {
        lamaran_id: Number(applicationId),
        nama_pelamar: app.pengguna?.nama || "Unknown",
        posisi: app.lowongan?.judul || "Unknown Position",
        jenis: prismaType,
        status: "scheduled",
        tanggal_waktu: dateTime,
        durasi_menit: Number(durationMin) || 60,
        lokasi: location,
        tautan_rapat: meetingLink || null,
        sudah_selesai: false,
        status_kehadiran: "pending",
        updated_at: new Date(),
      },
    });

    fireNotification({
      type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
      title: `Penjadwalan ${TYPE_LABELS[type] || type} - ${created.nama_pelamar}`,
      message: `${TYPE_LABELS[type] || type} untuk ${created.posisi} dijadwalkan pada ${dateTime.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} pukul ${time} WIB.`,
      actionUrl: "schedule",
      metadata: { scheduleId: created.id, applicationId: created.lamaran_id },
    });

    const email = app.pengguna?.email;
    if (email) {
      sendScheduleEmail({
        to: email, applicantName: app.pengguna?.nama || "Unknown", type, date, time, location,
        meetingLink: meetingLink || null, position: app.lowongan?.judul || "Unknown Position", scheduleId: created.id,
      }).catch((err) => console.error(`❌ Gagal kirim email ke ${email}:`, err.message));
    }

    return this._toClientShape(created);
  }

  async bulkCreateSchedule({ applicationIds, type, date, time, durationMin = 60, location, meetingLink = null }) {
    if (!applicationIds?.length || !type || !date || !time || !location) {
      throw new Error("applicationIds, type, date, time, location wajib diisi");
    }

    const prismaType = PRISMA_ENUM_MAP[type];
    if (!prismaType) {
      throw new Error(`Tipe jadwal tidak valid: ${type}`);
    }

    assertDateIsHPlusOne(date);

    const dateTime = new Date(`${date}T${time}:00`);
    const results = [];
    const errors = [];

    for (const applicationId of applicationIds) {
      try {
        const app = await prisma.lamaran.findUnique({
          where: { id: Number(applicationId) },
          include: {
            pengguna: { select: { id: true, nama: true, email: true, profil: { select: { foto_profil: true } } } },
            lowongan: true,
          },
        });

        if (!app) {
          errors.push({ applicationId, reason: "Application tidak ditemukan" });
          continue;
        }

        const conflict = await prisma.jadwal_wawancara.findFirst({
          where: { lamaran_id: Number(applicationId), tanggal_waktu: dateTime, status: { not: "canceled" } },
        });

        if (conflict) {
          errors.push({ applicationId, reason: "Jadwal sudah ada di waktu tersebut" });
          continue;
        }

        const created = await prisma.jadwal_wawancara.create({
          data: {
            lamaran_id: Number(applicationId),
            nama_pelamar: app.pengguna?.nama || "Unknown",
            posisi: app.lowongan?.judul || "Unknown Position",
            jenis: prismaType,
            status: "scheduled",
            tanggal_waktu: dateTime,
            durasi_menit: Number(durationMin) || 60,
            lokasi: location,
            tautan_rapat: meetingLink || null,
            sudah_selesai: false,
            status_kehadiran: "pending",
            updated_at: new Date(),
          },
        });

        results.push(created);

        const email = app.pengguna?.email;
        if (email) {
          sendScheduleEmail({
            to: email, applicantName: app.pengguna?.nama || "Unknown", type, date, time, location,
            meetingLink: meetingLink || null, position: app.lowongan?.judul || "Unknown Position", scheduleId: created.id,
          }).catch((err) => console.error(`❌ Gagal kirim email ke ${email}:`, err.message));
        }
      } catch (e) {
        errors.push({ applicationId, reason: e.message });
      }
    }

    if (results.length > 0) {
      fireNotification({
        type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
        title: `${results.length} Jadwal ${TYPE_LABELS[type] || type} Dibuat`,
        message: `${results.length} kandidat dijadwalkan untuk ${TYPE_LABELS[type] || type} pada ${dateTime.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} pukul ${time} WIB.`,
        actionUrl: "schedule",
        metadata: { scheduleIds: results.map((r) => r.id) },
      });
    }

    return { created: results.length, errors };
  }

  async autoRejectApplicant(applicationId, scheduleType) {
    if (!applicationId) return;
    try {
      await applicationService.updateApplicationStatus(applicationId, "Ditolak");
      console.log(`✅ Application #${applicationId} otomatis ditolak karena tidak hadir/tidak merespon pada tahap ${scheduleType}`);
    } catch (err) {
      console.error(`❌ Gagal auto-tolak application #${applicationId} setelah tidak hadir:`, err.message);
    }
  }

  // ✅ FIX (sebelumnya): tidak lagi auto-reject lamaran begitu HR
  // menandai tidak hadir — HR yang memilih lewat tombol "Tolak Lamaran"
  // atau "Reschedule" setelahnya.
  async markNoShowByHR(id, { reason } = {}) {
    const s = await prisma.jadwal_wawancara.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error("Jadwal tidak ditemukan");

    if (s.status_kehadiran !== "hadir") {
      throw new Error("Hanya bisa menandai tidak hadir untuk jadwal yang berstatus 'Hadir'");
    }
    if (s.sudah_selesai) throw new Error("Jadwal yang sudah diselesaikan tidak bisa diubah");

    const finalReason = String(reason || "").trim() || "kandidat tidak datang";

    const updated = await prisma.jadwal_wawancara.update({
      where: { id: Number(id) },
      data: {
        status_kehadiran: "tidak_hadir",
        alasan_tidak_hadir: finalReason,
        updated_at: new Date(),
      },
    });

    fireNotification({
      type: NOTIFICATION_TYPES.NO_SHOW,
      title: `${updated.nama_pelamar} Tidak Hadir`,
      message: `Ditandai tidak hadir oleh HR pada tahap ${TYPE_LABELS[updated.jenis] || updated.jenis}. Alasan: ${finalReason}. Silakan tolak lamaran atau buat jadwal ulang (reschedule) untuk kandidat ini.`,
      actionUrl: "schedule",
      metadata: { scheduleId: updated.id, applicationId: updated.lamaran_id },
    });

    return this._toClientShape(updated);
  }

  // ✅ FIX: sekarang menerima `token` (dari link email) sebagai bukti
  // kepemilikan yang berdiri sendiri, di luar sesi login. `penggunaId`
  // tetap dipakai sebagai fallback untuk pemakaian dari dalam aplikasi
  // yang sudah login (mis. "Lamaran Saya"). Aksi diizinkan kalau SALAH
  // SATU dari keduanya valid.
  async confirmAttendance(id, { attendanceStatus, absentReason, penggunaId, token } = {}) {
    const s = await prisma.jadwal_wawancara.findUnique({
      where: { id: Number(id) },
      include: { lamaran: { select: { pengguna_id: true } } },
    });
    if (!s) throw new Error("Jadwal tidak ditemukan");

    const hasValidToken = verifyConfirmToken(id, token);
    const isOwnerBySession = Boolean(
      penggunaId && s.lamaran?.pengguna_id === Number(penggunaId)
    );

    if (!hasValidToken && !isOwnerBySession) {
      throw new Error("Jadwal ini bukan milik Anda");
    }

    if (s.dikonfirmasi_oleh_pelamar) throw new Error("Kehadiran untuk jadwal ini sudah pernah dikonfirmasi");

    if (!ATTENDANCE_VALUES.includes(attendanceStatus) || attendanceStatus === "pending") {
      throw new Error("attendanceStatus harus 'hadir' atau 'tidak_hadir'");
    }

    if (attendanceStatus === "tidak_hadir" && !String(absentReason || "").trim()) {
      throw new Error("Alasan ketidakhadiran wajib diisi");
    }

    const updated = await prisma.jadwal_wawancara.update({
      where: { id: Number(id) },
      data: {
        status_kehadiran: attendanceStatus,
        alasan_tidak_hadir: attendanceStatus === "tidak_hadir" ? String(absentReason).trim() : null,
        dikonfirmasi_oleh_pelamar: true,
        waktu_konfirmasi: new Date(),
        updated_at: new Date(),
      },
    });

    if (attendanceStatus === "tidak_hadir") {
      fireNotification({
        type: NOTIFICATION_TYPES.NO_SHOW,
        title: `${updated.nama_pelamar} Konfirmasi Tidak Hadir`,
        message: `Pelamar mengonfirmasi tidak dapat hadir pada tahap ${TYPE_LABELS[updated.jenis] || updated.jenis}. Alasan: ${updated.alasan_tidak_hadir}. Mohon ditindaklanjuti (ditolak) oleh HR.`,
        actionUrl: "schedule",
        metadata: { scheduleId: updated.id, applicationId: updated.lamaran_id },
      });
    }

    return this._toClientShape(updated);
  }

  async markExpiredAsAbsent(id) {
    const s = await prisma.jadwal_wawancara.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error("Jadwal tidak ditemukan");

    if (s.dikonfirmasi_oleh_pelamar) return this._toClientShape(s);

    const expiredTime = new Date(new Date(s.created_at).getTime() + 24 * 60 * 60 * 1000);
    if (new Date() <= expiredTime) throw new Error("Jadwal belum melewati batas waktu konfirmasi");

    const updated = await prisma.jadwal_wawancara.update({
      where: { id: Number(id) },
      data: {
        status_kehadiran: "tidak_hadir",
        alasan_tidak_hadir: "Tidak ada konfirmasi dari pelamar dalam 1x24 jam sejak undangan dikirim (otomatis oleh sistem).",
        dikonfirmasi_oleh_pelamar: true,
        waktu_konfirmasi: new Date(),
        updated_at: new Date(),
      },
    });

    fireNotification({
      type: NOTIFICATION_TYPES.NO_SHOW,
      title: `${updated.nama_pelamar} Tidak Merespon (Otomatis Tidak Hadir)`,
      message: `Tidak ada konfirmasi dalam 1x24 jam pada tahap ${TYPE_LABELS[updated.jenis] || updated.jenis}, sistem otomatis menandai tidak hadir.`,
      actionUrl: "schedule",
      metadata: { scheduleId: updated.id, applicationId: updated.lamaran_id },
    });

    await this.autoRejectApplicant(s.lamaran_id, s.jenis);

    return this._toClientShape(updated);
  }

  async rejectSchedule(id) {
    const s = await prisma.jadwal_wawancara.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error("Schedule tidak ditemukan");

    await this.autoRejectApplicant(s.lamaran_id, s.jenis);

    const updated = await prisma.jadwal_wawancara.update({
      where: { id: Number(id) },
      data: {
        sudah_selesai: true,
        status: "completed",
        waktu_selesai: new Date(),
        updated_at: new Date(),
      },
    });

    return this._toClientShape(updated);
  }

  async completeSchedule(id) {
    const s = await prisma.jadwal_wawancara.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error("Schedule tidak ditemukan");

    const updated = await prisma.jadwal_wawancara.update({
      where: { id: Number(id) },
      data: {
        sudah_selesai: true,
        status: "completed",
        waktu_selesai: new Date(),
        updated_at: new Date(),
      },
    });

    return this._toClientShape(updated);
  }

  async deleteSchedule(id) {
    const s = await prisma.jadwal_wawancara.findUnique({ where: { id: Number(id) } });
    if (!s) throw new Error("Schedule tidak ditemukan");
    return prisma.jadwal_wawancara.delete({ where: { id: Number(id) } });
  }
}

module.exports = new SchedulesService();