const prisma = require("../../config/prisma");

module.exports = {
  async getSingleton() {
    let row = await prisma.appSettings.findFirst();
    if (!row) {
      row = await prisma.appSettings.create({
        data: {
          companyName: "Syaamil Group",
          website: "https://www.syaamilquran.com/",
          location: "Bandung",
          timezone: "WIB (UTC+7)",
          systemUpdateEmailEnabled: true,
          systemVersion: "v2.1.0",
          database: "MySQL",
          lastUpdate: "",
        },
      });
    }
    return row;
  },

  async update(data) {
    const existing = await prisma.appSettings.findFirst();
    if (!existing) {
      return prisma.appSettings.create({ data });
    }
    return prisma.appSettings.update({
      where: { id: existing.id },
      data,
    });
  },
};
