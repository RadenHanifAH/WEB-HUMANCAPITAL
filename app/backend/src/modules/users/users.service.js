const prisma = require("../../config/prisma");

class UsersService {
  async searchEmails(q) {
    if (!q) return [];

    const take = 8;

    const items = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true },
      take,
      orderBy: { createdAt: "desc" },
    });

    return items;
  }
}

module.exports = new UsersService();
