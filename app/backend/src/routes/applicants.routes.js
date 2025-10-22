const express = require("express");
const { applicants, getNextId } = require("../data/applicants");

const router = express.Router();

router.get("/", (req, res) => {
  const { status, position, search } = req.query;
  let result = applicants;

  if (status) {
    if (status === "rejected") {
      result = result.filter((a) => a.status.startsWith("rejected"));
    } else {
      result = result.filter((a) => a.status === status);
    }
  }

  if (position) {
    result = result.filter((a) => a.position === position);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.position && a.position.toLowerCase().includes(q))
    );
  }

  res.json(result);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const applicant = applicants.find((a) => a.id === id);
  if (!applicant) return res.status(404).json({ message: "Applicant not found" });
  res.json(applicant);
});

router.post("/", (req, res) => {
  const payload = req.body;
  if (!payload.name || !payload.email) {
    return res.status(400).json({ message: "name and email are required" });
  }

  const newApplicant = {
    id: getNextId(),
    name: payload.name,
    email: payload.email,
    location: payload.location || "",
    position: payload.position || "",
    experience: payload.experience || "",
    status: payload.status || "under-review",
    stage: payload.stage || "Under Review",
    score: payload.score ?? null,
    appliedDate: payload.appliedDate || new Date().toISOString(),
    avatar: payload.avatar || `https://i.pravatar.cc/100?u=${Date.now()}`
  };

  applicants.push(newApplicant);
  res.status(201).json(newApplicant);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = applicants.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ message: "Applicant not found" });

  applicants[idx] = { ...applicants[idx], ...req.body };
  res.json(applicants[idx]);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = applicants.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ message: "Applicant not found" });
  const removed = applicants.splice(idx, 1);
  res.json({ removed: removed[0] });
});

router.get("/:id/cv", (req, res) => {
  const id = Number(req.params.id);
  const applicant = applicants.find((a) => a.id === id);
  if (!applicant) return res.status(404).json({ message: "Applicant not found" });

  const cvText = `CV - ${applicant.name}\nEmail: ${applicant.email}\nPosisi: ${applicant.position}\nPengalaman: ${applicant.experience}\n\n(Harap ganti dengan file CV asli pada implementasi produksi)`;
  res.setHeader("Content-Disposition", `attachment; filename="CV-${applicant.name.replace(/\s/g, "_")}.txt"`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(cvText);
});

router.get("/:id/portfolio", (req, res) => {
  const id = Number(req.params.id);
  const applicant = applicants.find((a) => a.id === id);
  if (!applicant) return res.status(404).json({ message: "Applicant not found" });

  const portfolioText = `Portfolio - ${applicant.name}\nURL (dummy): https://portfolio.example.com/${encodeURIComponent(applicant.name.toLowerCase().replace(/\s/g, "-"))}\n\n(Harap ganti dengan file portofolio asli pada implementasi produksi)`;
  res.setHeader("Content-Disposition", `attachment; filename="Portfolio-${applicant.name.replace(/\s/g, "_")}.txt"`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(portfolioText);
});

module.exports = router;
