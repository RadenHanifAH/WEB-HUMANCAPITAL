const prisma = require("../../config/prisma");

function buildWhere({ q, status, direction }) {
  const where = {};
  if (status) where.status = status;
  if (direction) where.direction = direction;

  if (q) {
    where.OR = [
      { recipientEmail: { contains: q } },
      { recipientName: { contains: q } },
      { subject: { contains: q } },
      { body: { contains: q } },
    ];
  }
  return where;
}

module.exports = {
  findMany({ q, status, direction, page, pageSize }) {
    const where = buildWhere({ q, status, direction });
    return prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  count({ q, status, direction }) {
    const where = buildWhere({ q, status, direction });
    return prisma.message.count({ where });
  },

  create(data) {
    return prisma.message.create({ data });
  },

  update(id, data) {
    return prisma.message.update({ where: { id }, data });
  },

  findById(id) {
    return prisma.message.findUnique({ where: { id } });
  },

  deleteById(id) {
    return prisma.message.delete({ where: { id } });
  },

  async deleteMany({ q, status, direction }) {
    const where = buildWhere({ q, status, direction });
    const result = await prisma.message.deleteMany({ where });
    return result.count;
  },
};
