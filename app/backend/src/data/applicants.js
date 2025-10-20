// Menggunakan data dummy in-memory
let { applicants } = require('../data/applicants'); // Import data
const { getNextId } = require('../data/applicants'); // Import helper ID

// Helper untuk format data (misalnya mengubah score null ke 0)
const formatApplicant = (applicant) => ({
    ...applicant,
    // Pastikan score yang tersimpan 'null' dikirim sebagai 0 untuk tampilan di frontend
    score: applicant.score === null ? 0 : applicant.score,
    // appliedDate di format agar konsisten
    appliedDate: applicant.appliedDate ? applicant.appliedDate.substring(0, 10) : null,
});


// [GET] Mengambil semua data pelamar
const getAllPelamar = (req, res) => {
    // Simulasi penundaan jaringan
    setTimeout(() => {
        const formattedApplicants = applicants.map(formatApplicant);
        res.json(formattedApplicants); 
    }, 500); 
};

// [PUT] Mengupdate status pelamar
const updateStatus = (req, res) => {
    const { id } = req.params;
    const { status, stage } = req.body; 

    const applicantId = parseInt(id);
    const applicantIndex = applicants.findIndex(a => a.id === applicantId);

    if (applicantIndex === -1) {
        return res.status(404).json({ error: "Pelamar tidak ditemukan." });
    }

    // Update data di memory
    applicants[applicantIndex] = {
        ...applicants[applicantIndex],
        status: status,
        stage: stage
    };

    res.json(formatApplicant(applicants[applicantIndex]));
};

// [PUT] Mengupdate score pelamar
const updateScore = (req, res) => {
    const { id } = req.params;
    const { score } = req.body; 
    
    const applicantId = parseInt(id);
    const scoreValue = score === null || score === "" ? null : parseInt(score, 10);
    const applicantIndex = applicants.findIndex(a => a.id === applicantId);

    if (applicantIndex === -1) {
        return res.status(404).json({ error: "Pelamar tidak ditemukan." });
    }

    // Update data di memory
    applicants[applicantIndex] = {
        ...applicants[applicantIndex],
        score: scoreValue
    };

    res.json(formatApplicant(applicants[applicantIndex]));
};


module.exports = {
    getAllPelamar,
    updateStatus,
    updateScore
};
