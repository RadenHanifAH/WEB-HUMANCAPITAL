const prisma = require("../../config/prisma");

// ✅ Mapper: ubah field DB (snake_case) -> camelCase untuk frontend
const mapNotif = (n) => n ? {
  id: n.id,
  userId: n.pengguna_id,
  type: n.jenis,
  title: n.judul,
  message: n.pesan,
  isRead: n.sudah_dibaca,
  actionUrl: n.tautan_aksi,
  metadata: n.metadata,
  createdAt: n.created_at,
} : null;

const notificationsRepository = {
  async create(data) {
    const n = await prisma.notifikasi.create({
      data: {
        pengguna_id: data.userId,
        jenis: data.type,
        judul: data.title,
        pesan: data.message,
        tautan_aksi: data.actionUrl,
        metadata: data.metadata,
      }
    });
    return mapNotif(n);
  },

  // Notifikasi personal (userId tertentu) DAN notifikasi broadcast
  async findRecent(userId, limit = 5) {
    const items = await prisma.notifikasi.findMany({
      where: userId ? { OR: [{ pengguna_id: userId }, { pengguna_id: null }] } : {},
      orderBy: { created_at: "desc" },
      take: limit,
    });
    return items.map(mapNotif);
  },

  async findAllPaginated({ userId, page = 1, pageSize = 20, isRead, type }) {
    const where = {
      ...(userId ? { OR: [{ pengguna_id: userId }, { pengguna_id: null }] } : {}),
      ...(typeof isRead === "boolean" ? { sudah_dibaca: isRead } : {}),
      ...(type ? { jenis: type } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.notifikasi.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notifikasi.count({ where }),
    ]);
    return [items.map(mapNotif), total];
  },

  countUnread: (userId) =>
    prisma.notifikasi.count({
      where: {
        sudah_dibaca: false,
        ...(userId ? { OR: [{ pengguna_id: userId }, { pengguna_id: null }] } : {}),
      },
    }),

  async markAsRead(id) {
    const n = await prisma.notifikasi.update({
      where: { id },
      data: { sudah_dibaca: true },
    });
    return mapNotif(n);
  },

  markAllAsRead: (userId) =>
    prisma.notifikasi.updateMany({
      where: {
        sudah_dibaca: false,
        ...(userId ? { OR: [{ pengguna_id: userId }, { pengguna_id: null }] } : {}),
      },
      data: { sudah_dibaca: true },
    }),

  remove: (id) => prisma.notifikasi.delete({ where: { id } }),

  // Dipakai kalau mau tiap admin punya baris notifikasi personal sendiri
  createManyForUsers: (userIds, payload) => {
    if (!userIds.length) return Promise.resolve();
    return prisma.notifikasi.createMany({
      data: userIds.map((userId) => ({
        pengguna_id: userId,
        jenis: payload.type,
        judul: payload.title,
        pesan: payload.message,
        tautan_aksi: payload.actionUrl,
        metadata: payload.metadata,
      })),
    });
  },
};

module.exports = notificationsRepository;