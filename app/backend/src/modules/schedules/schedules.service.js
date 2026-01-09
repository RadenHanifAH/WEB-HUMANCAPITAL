// backend/src/modules/schedules/schedules.service.js
const prisma = require("../../config/prisma");

class SchedulesService {
  // =========================
  // Applicants (from Application)
  // =========================
  async listApplicants({ q = "" }) {
    const where = q
      ? {
          OR: [
            { user: { name: { contains: q } } },
            { user: { email: { contains: q } } },
            { job: { title: { contains: q } } },
            // optional: cari dari fullName juga
            { user: { profile: { is: { fullName: { contains: q } } } } },
          ],
        }
      : {};

    const apps = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { fullName: true, fotoProfile: true } },
          },
        },
        job: { select: { id: true, title: true } },
      },
      orderBy: { appliedAt: "desc" },
      take: 50,
    });

    return apps.map((a) => ({
      applicationId: a.id,
      userId: a.userId,
      applicantName: a.user?.profile?.fullName || a.user?.name || "Unknown",
      applicantEmail: a.user?.email || "-",
      position: a.job?.title || "Unknown Position",
      avatar: a.user?.profile?.fotoProfile || null, // ✅ untuk dropdown kalau mau
    }));
  }

  // =========================
  // List schedules
  // =========================
  async listSchedules({ date = "", type = "all", page = 1, pageSize = 10 }) {
    const take = Number(pageSize) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {
      AND: [
        type !== "all" ? { type } : {},
        date
          ? {
              dateTime: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lte: new Date(`${date}T23:59:59.999Z`),
              },
            }
          : {},
      ],
    };

    const [total, items] = await Promise.all([
      prisma.interviewSchedule.count({ where }),
      prisma.interviewSchedule.findMany({
        where,
        // ✅ FIX UTAMA: yang baru dijadwalkan tampil di atas
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          application: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: {
                    select: { fullName: true, fotoProfile: true },
                  },
                },
              },
              job: { select: { id: true, title: true } },
            },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    // ✅ Optional: rapikan output supaya frontend gampang
    const normalizedItems = items.map((s) => ({
      ...s,
      applicantName:
        s.application?.user?.profile?.fullName ||
        s.application?.user?.name ||
        s.applicantName ||
        "Unknown",
      applicantEmail: s.application?.user?.email || "-",
      position: s.application?.job?.title || s.position || "Unknown Position",
      avatar: s.application?.user?.profile?.fotoProfile || null, // ✅ dipakai di card
    }));

    return { total, items: normalizedItems, page: Number(page), pageSize: take };
  }

  // =========================
  // Create schedule
  // =========================
  async createSchedule({
    applicationId,
    type,
    date,
    time,
    durationMin = 60,
    location,
    notes = null,
    createdById = null,
  }) {
    if (!applicationId || !type || !date || !time || !location) {
      throw new Error("applicationId, type, date, time, location wajib diisi");
    }

    const app = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: {
        user: { include: { profile: true } },
        job: true,
      },
    });
    if (!app) throw new Error("Application tidak ditemukan");

    const dateTime = new Date(`${date}T${time}:00`);

    const conflict = await prisma.interviewSchedule.findFirst({
      where: {
        applicationId: Number(applicationId),
        dateTime,
        status: { not: "canceled" },
      },
    });
    if (conflict) throw new Error("Jadwal untuk kandidat ini di waktu tersebut sudah ada");

    return prisma.interviewSchedule.create({
      data: {
        applicationId: Number(applicationId),
        applicantName: app.user?.profile?.fullName || app.user?.name || "Unknown",
        position: app.job?.title || "Unknown Position",
        type,
        status: "scheduled",
        dateTime,
        durationMin: Number(durationMin) || 60,
        location,
        notes,
        createdById: createdById ? Number(createdById) : null,
        isCompleted: false,
      },
    });
  }

  // =========================
  // Complete schedule
  // =========================
  async completeSchedule(id) {
    const schedule = await prisma.interviewSchedule.findUnique({
      where: { id: Number(id) },
    });
    if (!schedule) throw new Error("Schedule tidak ditemukan");

    return prisma.interviewSchedule.update({
      where: { id: Number(id) },
      data: {
        isCompleted: true,
        status: "completed",
        completedAt: new Date(),
      },
    });
  }

  // =========================
  // Delete schedule
  // =========================
  async deleteSchedule(id) {
    const schedule = await prisma.interviewSchedule.findUnique({
      where: { id: Number(id) },
    });
    if (!schedule) throw new Error("Schedule tidak ditemukan");

    return prisma.interviewSchedule.delete({ where: { id: Number(id) } });
  }
}

module.exports = new SchedulesService();
