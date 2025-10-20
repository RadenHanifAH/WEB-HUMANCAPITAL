const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function untuk memformat data Application agar sesuai dengan harapan frontend (flat structure)
const formatApplicationData = (application) => {
    // Memastikan score 0 jika null, sesuai logika isScoreEditable di frontend
    const scoreValue = application.score === null ? 0 : application.score;

    // Menarik properti dari objek bersarang (user dan position)
    return {
        id: application.id,
        name: application.user ? application.user.name : 'Unknown User',
        email: application.user ? application.user.email : 'N/A',
        avatar: application.user ? application.user.avatar || 'https://i.pravatar.cc/100?img=7' : 'N/A',
        
        position: application.position ? application.position.title : 'N/A',
        location: 'Jakarta', // DUMMY: Sesuaikan dengan data Anda jika ada model Location
        experience: 'N/A',   // DUMMY: Sesuaikan dengan data Anda jika ada model Experience
        
        status: application.status.toLowerCase().replace(/\s/g, '-'), // under-review, accepted, rejected-at-psikotes
        stage: application.status, // Digunakan untuk tampilan badge
        score: scoreValue,
        
        appliedDate: application.appliedAt ? application.appliedAt.toISOString().split('T')[0] : null,
        // userId: application.userId // Bisa ditambahkan jika diperlukan
    };
};


// 1. Ambil semua data lamaran (dengan relasi user & posisi)
exports.getAllApplications = async (req, res) => {
    try {
        const data = await prisma.application.findMany({
            include: {
                user: true,
                position: true,
            },
            orderBy: { appliedAt: 'desc' },
        });

        // ✅ FIX: Format data agar menjadi objek flat (sesuai harapan Pelamar.jsx)
        const formattedData = data.map(formatApplicationData);
        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: 'Gagal mengambil data lamaran' });
    }
};

// 2. Update status lamaran
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Mengupdate status di model Application
        
        const updated = await prisma.application.update({
            where: { id: Number(id) },
            data: { status },
            include: { user: true, position: true } // Include untuk format balik
        });

        res.json(formatApplicationData(updated)); // Kirim data yang sudah di-format
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: 'Gagal memperbarui status lamaran' });
    }
};

// 3. Update score lamaran
exports.updateScore = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body; 
        
        // Pastikan score adalah Int atau null
        const scoreValue = score === null ? null : parseInt(score, 10);
        
        const updated = await prisma.application.update({
            where: { id: Number(id) },
            data: { score: scoreValue }, // ✅ FIX: Mengupdate kolom score
            include: { user: true, position: true }
        });

        res.json(formatApplicationData(updated)); // Kirim data yang sudah di-format
    } catch (error) {
        console.error("Error updating score:", error);
        res.status(500).json({ error: 'Gagal memperbarui score lamaran' });
    }
};
