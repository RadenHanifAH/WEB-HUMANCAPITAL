// backend/src/modules/application/application.service.js
const repo = require("./application.repository");

module.exports = {
async applyJob(userId, jobId, cvUrl, portfolioUrl) {
  return repo.create({
    userId: Number(userId), // Pastikan ini number
    jobId: Number(jobId),   // Pastikan ini number
    cvUrl,
    portfolioUrl,
    status: "under review",
    stage: "Under Review",
  });
},
 async getAllApplications() {
  // Data yang dikembalikan sudah mencakup user dan job karena setting di repository
  return repo.findAll();
 },
 // ✅ FUNGSI DIUBAH
 async updateApplicationStatus(id, status, stage) {


  let manualStage = stage;
   if (manualStage) {
     // Kalau stage dikirim manual, pakai itu
   } else {
     // Auto-determine stage based on status
     if (status.startsWith("Accepted")) {
       stage = "Accepted";
     } else if (status.startsWith("Rejected")) {
       stage = "Rejected";
     } else {
       // ✅ UNTUK STATUS LAINNYA, STAGE TETAP "Under Review"
       stage = "Under Review";
     }
   }

  return repo.updateStatusAndStage(id, status, stage);
 },
 // ✅ FUNGSI BARU
 async updateApplicationScore(id, score) {
  return repo.updateScore(id, score);
 }
};