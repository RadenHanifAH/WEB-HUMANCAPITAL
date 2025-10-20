const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET semua pelamar
router.get('/', async (req, res) => {
  try {
    const pelamar = await prisma.user.findMany({
      where: { role: 'pelamar' },
      include: {
        applications: {
          include: { position: true },
        },
      },
    });

    res.status(200).json(pelamar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data pelamar', error });
  }
});

// GET pelamar berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const pelamar = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        applications: {
          include: { position: true },
        },
      },
    });

    if (!pelamar) return res.status(404).json({ message: 'Pelamar tidak ditemukan' });
    res.status(200).json(pelamar);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelamar', error });
  }
});

module.exports = router;
