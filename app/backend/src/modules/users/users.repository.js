const prisma = require("../../config/prisma");

function buildWhere({ search, role, divisi, status }) {
  const where = { peran: { in: ["admin", "divisi"] } };

  if (search) {
    where.OR = [
      { nama: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role && role !== "all") where.peran = role;
  if (divisi && divisi !== "all") where.divisi = divisi;
  if (status && status !== "all") where.status_akun = status;

  return where;
}

async function findMany({
  search,
  role,
  divisi,
  status,
  page = 1,
  limit = 10,
}) {
  const where = buildWhere({ search, role, divisi, status });
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.pengguna.findMany({
      where,
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        divisi: true,
        status_akun: true,
        login_terakhir: true,
        created_at: true,
        profil: {
          select: {
            foto_profil: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.pengguna.count({ where }),
  ]);

  return { data, total };
}

const findById = (id) => prisma.pengguna.findUnique({ where: { id: Number(id) } });

const findByEmail = (email) =>
  prisma.pengguna.findFirst({
    where: { email },
  });

const create = (data) => prisma.pengguna.create({ data, include: { profil: true } });
const update = (id, data) =>
  prisma.pengguna.update({ where: { id: Number(id) }, data, include: { profil: true } });
const remove = (id) => prisma.pengguna.delete({ where: { id: Number(id) } });

module.exports = {
  findMany,
  findById,
  findByEmail,
  create,
  update,
  remove,
};