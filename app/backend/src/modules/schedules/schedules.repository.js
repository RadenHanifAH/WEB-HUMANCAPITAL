const prisma = require("../../config/prisma");

module.exports = {
  findMany({ query, page, pageSize }) {
    return prisma.interviewSchedule.findMany({
      orderBy: { dateTime: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  count() {
    return prisma.interviewSchedule.count();
  },

  create(data) {
    return prisma.interviewSchedule.create({ data });
  },

  update(id, data) {
    return prisma.interviewSchedule.update({
      where: { id },
      data,
    });
  },

  deleteById(id) {
    return prisma.interviewSchedule.delete({
      where: { id },
    });
  },
};
