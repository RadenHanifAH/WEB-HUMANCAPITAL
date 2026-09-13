// Opsi kesimpulan Form Psikotest
export const KESIMPULAN_PSIKOTEST_OPTIONS = [
  "Direkomendasikan",
  "Tidak Direkomendasikan",
];

export const IQ_KETERANGAN_OPTIONS = [
  "Border Line",
  "Average",
  "Genius",
  "Superior",
];

export const KESIMPULAN_INTERVIEW_OPTIONS = [
  "Direkomendasikan",
  "Tidak Direkomendasikan",
];

// Tahapan interview: 1 = Tahap Pertama, 2 = Tahap Kedua.
// Formnya sama persis (InterviewForm), hanya dibedakan lewat prop `stage`.
export const INTERVIEW_STAGE_LABELS = {
  1: "Interview Tahap Pertama",
  2: "Interview Tahap Kedua",
};

// Opsi penilaian per-aspek pada tabel wawancara (Rangkuman Hasil Wawancara).
export const RATING_OPTIONS = ["Kurang", "Cukup", "Baik"];

// Opsi Baik/Buruk untuk Kepribadian, Stabilitas Emosi, Integritas pada
// Form Hasil Keputusan Psikotest.
export const BAIK_BURUK_OPTIONS = ["Baik", "Buruk"];

// Template 13 aspek penilaian wawancara, sesuai formulir
// "Rangkuman Hasil Wawancara Calon Karyawan". Setiap baris dinilai
// Kurang / Cukup / Baik + Keterangan bebas.
export const PENILAIAN_ASPEK_TEMPLATE = [
  {
    aspek: "Penampilan Fisik",
    uraian:
      "Badan sehat dan tegap, pakaian bersih/rapi, wajah segar dan bersemangat.",
  },
  {
    aspek: "Sopan Santun",
    uraian:
      "Menyapa dengan baik, duduk setelah dipersilahkan, posisi duduk baik, mata terarah kepada pewawancara, penuh perhatian.",
  },
  {
    aspek: "Performance Appraisal",
    uraian: "Prestasi kerja, pendidikan umum yang pernah diikuti.",
  },
  {
    aspek: "Penguasaan Teknis Pekerjaan",
    uraian:
      "Mampu menjelaskan dengan baik prosedur kerja, tanggung jawab dalam hambatan kerja, dapat menyampaikan perubahan positif yang pernah dilakukan, dan menunjukkan interest yang tinggi terhadap pekerjaan.",
  },
  {
    aspek: "Leadership",
    uraian:
      "Kemampuan memimpin, problem solving, decision making, gaya kepemimpinan.",
  },
  {
    aspek: "Aktivitas Sosial",
    uraian:
      "Pernah/sedang menjadi anggota organisasi, jabatan dan perannya dalam organisasi tsb, kesuksesan yang pernah diraih, cara mengisi waktu luang.",
  },
  {
    aspek: "Kemampuan Menyampaikan Pendapat",
    uraian:
      "Dapat menyampaikan pemikirannya dengan jelas dan baik, bahasa yang digunakan mudah dimengerti, tenang, tidak ragu, dan arah pembicaraan jelas.",
  },
  {
    aspek: "Daya Tangkap",
    uraian:
      "Dapat memahami pertanyaan dengan baik, pewawancara tidak perlu mengulang pertanyaan, memberi jawaban sesuai dengan pertanyaan.",
  },
  {
    aspek: "Kepercayaan Diri",
    uraian: "Tidak gugup, tenang, dan tidak ragu dalam menyampaikan pemikiran.",
  },
  {
    aspek: "Motivasi Kerja",
    uraian:
      "Menunjukkan interes yang tinggi pada pekerjaan yang ditawarkan, energik, ada keinginan untuk segera bekerja, siap menghadapi masalah-masalah dalam pekerjaan.",
  },
  {
    aspek: "Kerjasama Kelompok",
    uraian:
      "Menunjukkan minat untuk bekerja secara kelompok, bersedia menanggung resiko kelompok, tidak enggan untuk dipimpin, ada keinginan membuat persahabatan baru.",
  },
  {
    aspek: "Dorongan Berprestasi",
    uraian:
      "Ada keinginan mengerjakan tugas-tugas yang sangat berarti, memecahkan masalah yang sulit, bekerja lebih baik dari yang lain, tidak ragu mengungkapkan keterampilan.",
  },
  {
    aspek: "Stabilitas Emosi",
    uraian:
      "Memiliki kemauan yang jelas, mempunyai sikap yang menyenangkan, kontrol diri baik, tidak mudah cemas, mudah menyesuaikan diri dengan situasi wawancara.",
  },
];
