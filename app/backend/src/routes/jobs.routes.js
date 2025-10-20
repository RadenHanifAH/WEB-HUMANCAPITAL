// app/backend/src/routes/jobs.routes.js
const express = require('express');
const router = express.Router();
let jobs = require('../data/job_positions'); 

// HELPER: Mengambil ID baru
const getNewId = () => jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1;

// GET: Semua Lowongan
router.get('/', (req, res) => {
    res.status(200).json(jobs);
});

// POST: Membuat Lowongan Baru
router.post('/', (req, res) => {
    const data = req.body;
    
    // Asumsi data yang dibutuhkan: title, department, location, type, status, deadline, description, requirements
    if (!data.title || !data.department || !data.deadline) {
        return res.status(400).json({ message: 'Data lowongan tidak lengkap.' });
    }

    const newJob = {
        id: getNewId(),
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        status: data.status || 'draft',
        applicants: 0,
        posted: new Date().toISOString().split("T")[0],
        deadline: data.deadline,
        description: data.description || "",
        requirements: data.requirements || "",
    };

    jobs.push(newJob);
    res.status(201).json({ message: 'Lowongan berhasil dibuat', job: newJob });
});

// PUT: Update Lowongan (Edit)
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;
    let jobIndex = jobs.findIndex(j => j.id === id);

    if (jobIndex === -1) {
        return res.status(404).json({ message: 'Lowongan tidak ditemukan.' });
    }
    
    // Lakukan update data
    jobs[jobIndex] = {
        ...jobs[jobIndex],
        ...data, // Data yang masuk dari frontend akan menimpa yang lama
        id: id // Pastikan ID tidak berubah
    };

    res.status(200).json({ message: 'Lowongan berhasil diperbarui', job: jobs[jobIndex] });
});

// DELETE: Hapus Lowongan
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = jobs.length;

    jobs = jobs.filter(j => j.id !== id);

    if (jobs.length === initialLength) {
        return res.status(404).json({ message: 'Lowongan tidak ditemukan.' });
    }
    res.status(200).json({ message: 'Lowongan berhasil dihapus', deletedId: id });
});

module.exports = router;