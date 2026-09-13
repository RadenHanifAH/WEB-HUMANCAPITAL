/* eslint-disable no-unused-vars */
import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";

/* ---------------------------------------------------------- */
/* Helper umum                                                 */
/* ---------------------------------------------------------- */

const formatDateID = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const HEADER_COLOR = [27, 42, 74]; // #1B2A4A

function drawHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...HEADER_COLOR);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 14, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(subtitle, 14, 20);

  doc.setTextColor(0, 0, 0);
  return 36; // posisi Y setelah header
}

function drawSectionTitle(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...HEADER_COLOR);
  doc.text(text, 14, y);
  doc.setDrawColor(...HEADER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(14, y + 1.5, doc.internal.pageSize.getWidth() - 14, y + 1.5);
  doc.setTextColor(0, 0, 0);
  return y + 8;
}

function drawKeyValueGrid(doc, pairs, y, colWidth = 90) {
  doc.setFontSize(9.5);
  let col = 0;
  let rowY = y;
  const startX = 14;

  pairs.forEach(([label, value]) => {
    const x = startX + col * colWidth;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(String(label ?? "-"), x, rowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(String(value ?? "-"), x, rowY + 5);

    col += 1;
    if (col >= 2) {
      col = 0;
      rowY += 14;
    }
  });

  if (col !== 0) rowY += 14;
  doc.setTextColor(0, 0, 0);
  return rowY + 2;
}

// ✅ NEW: pastikan ada cukup ruang di halaman saat ini; kalau tidak,
// pindah ke halaman baru dan kembalikan posisi Y awal halaman baru.
function ensureSpace(doc, y, needed) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ✅ NEW: menulis paragraf dengan word-wrap otomatis (dipakai untuk "Catatan")
function drawParagraph(doc, text, y, maxWidth) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = maxWidth ?? pageWidth - 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);

  const lines = doc.splitTextToSize(String(text ?? "-"), width);
  lines.forEach((line) => {
    y = ensureSpace(doc, y, 6);
    doc.text(line, 14, y);
    y += 5;
  });

  doc.setTextColor(0, 0, 0);
  return y + 3;
}

// ✅ NEW: tabel sederhana (tanpa dependency jspdf-autotable) dengan
// word-wrap per sel, border, header abu-abu, dan auto page-break.
// columns: [{ header: string, width: number (mm) }]
// rows: array of array of string (urutan sesuai columns)
function drawTable(doc, { y, columns, rows, emptyLabel = "Belum ada data." }) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const startX = 14;
  const lineHeight = 4.6;
  const cellPadding = 2;
  const headerRowH = 7;
  let currentY = y;

  const drawHeaderRow = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    let x = startX;
    columns.forEach((col) => {
      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(224, 224, 224);
      doc.rect(x, currentY, col.width, headerRowH, "FD");
      doc.setTextColor(90, 90, 90);
      doc.text(col.header, x + cellPadding, currentY + headerRowH / 2 + 1.5);
      x += col.width;
    });
    currentY += headerRowH;
    doc.setTextColor(0, 0, 0);
  };

  drawHeaderRow();

  if (!rows || rows.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    const totalWidth = columns.reduce((s, c) => s + c.width, 0);
    doc.setDrawColor(230, 230, 230);
    doc.rect(startX, currentY, totalWidth, 9);
    doc.text(emptyLabel, startX + cellPadding, currentY + 6);
    doc.setTextColor(0, 0, 0);
    return currentY + 9 + 4;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  rows.forEach((row) => {
    const cellLines = columns.map((col, ci) => {
      const text = String(row[ci] ?? "-");
      return doc.splitTextToSize(text, col.width - cellPadding * 2);
    });
    const maxLines = Math.max(...cellLines.map((l) => l.length), 1);
    const rowH = maxLines * lineHeight + cellPadding * 2;

    if (currentY + rowH > pageHeight - 18) {
      doc.addPage();
      currentY = 20;
      drawHeaderRow();
    }

    let x = startX;
    columns.forEach((col, ci) => {
      doc.setDrawColor(230, 230, 230);
      doc.rect(x, currentY, col.width, rowH);
      doc.text(cellLines[ci], x + cellPadding, currentY + cellPadding + 3.3);
      x += col.width;
    });

    currentY += rowH;
  });

  return currentY + 4;
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Dicetak otomatis oleh Sistem Rekrutmen Syaamil • ${new Date().toLocaleString("id-ID")}`,
      14,
      pageHeight - 8,
    );
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 14, pageHeight - 8, {
      align: "right",
    });
  }
}

/* ---------------------------------------------------------- */
/* Helper: baca dimensi gambar dari base64                     */
/* ---------------------------------------------------------- */

const getImageSizeFromDataUrl = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });

/* ---------------------------------------------------------- */
/* Helper untuk menggabungkan dokumen pendukung upload (PDF)   */
/* ---------------------------------------------------------- */

const dataUrlToUint8Array = (dataUrl) => {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const wrapMergedPdfBytes = (bytes) => {
  const blob = new Blob([bytes], { type: "application/pdf" });

  return {
    output: (type) => (type === "blob" ? blob : bytes),
    save: (filename) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },
  };
};

async function mergeWithUploadedPdf(summaryDoc, uploadedDataUrl) {
  try {
    const summaryBytes = summaryDoc.output("arraybuffer");
    const mergedPdf = await PDFDocument.create();

    const summaryPdf = await PDFDocument.load(summaryBytes);
    const summaryPages = await mergedPdf.copyPages(summaryPdf, summaryPdf.getPageIndices());
    summaryPages.forEach((p) => mergedPdf.addPage(p));

    const uploadedBytes = dataUrlToUint8Array(uploadedDataUrl);
    const uploadedPdf = await PDFDocument.load(uploadedBytes);
    const pages = await mergedPdf.copyPages(uploadedPdf, uploadedPdf.getPageIndices());
    pages.forEach((p) => mergedPdf.addPage(p));

    const mergedBytes = await mergedPdf.save();
    return wrapMergedPdfBytes(mergedBytes);
  } catch (e) {
    console.error("Gagal menggabungkan dokumen pendukung PDF:", e.message);
    return summaryDoc;
  }
}

/* ---------------------------------------------------------- */
/* PDF: Hasil Wawancara (Interview Tahap 1 & 2)                */
/* ---------------------------------------------------------- */

export async function generateInterviewPdf({ candidate, data, stageLabel }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const applicantName = data?.namaPelamar || candidate?.applicantName || "-";

  let y = drawHeader(
    doc,
    "Rangkuman Hasil Wawancara Calon Karyawan",
    `${stageLabel} • ${applicantName}`,
  );

  // 1. Data Calon
  y += 4;
  y = drawSectionTitle(doc, "Data Calon", y);
  y = drawKeyValueGrid(
    doc,
    [
      ["Nama Calon", applicantName],
      ["Tanggal Wawancara", formatDateID(data?.tanggalWawancara)],
      ["Jabatan Dilamar", data?.jabatanDilamar || "-"],
      ["Usia", data?.usia ? `${data.usia} tahun` : "-"],
      ["Pendidikan Terakhir", data?.pendidikanTerakhir || "-"],
      [
        "Pengalaman Kerja",
        [data?.pengalamanKerja, data?.bidangPengalaman].filter(Boolean).join(" • ") || "-",
      ],
    ],
    y,
  );

  // ✅ NEW: Tabel Penilaian Aspek Wawancara (Aspek, Nilai, Keterangan)
  y = ensureSpace(doc, y, 30);
  y += 2;
  y = drawSectionTitle(doc, "Penilaian Aspek Wawancara", y);

  const penilaianRows = Array.isArray(data?.penilaian)
    ? data.penilaian
        .filter((r) => r && (r.aspek || r.nilai || r.keterangan))
        .map((r, i) => [String(i + 1), r.aspek || "-", r.nilai || "-", r.keterangan || "-"])
    : [];

  y = drawTable(doc, {
    y,
    columns: [
      { header: "No", width: 10 },
      { header: "Aspek", width: 38 },
      { header: "Nilai", width: 22 },
      { header: "Keterangan", width: 112 },
    ],
    rows: penilaianRows,
    emptyLabel: "Belum ada penilaian aspek yang diisi.",
  });

  // ✅ NEW: Ekspektasi & Pewawancara
  y = ensureSpace(doc, y, 24);
  y += 2;
  y = drawSectionTitle(doc, "Ekspektasi & Pewawancara", y);
  y = drawKeyValueGrid(
    doc,
    [
      ["Gaji Harapan", data?.gajiHarapan || "-"],
      ["Nama Pewawancara", data?.namaPewawancara || "-"],
    ],
    y,
  );

  // Lampiran hasil interview berupa gambar (jika ada)
  const uploadedData = data?.dataDokumenPendukung;
  const uploadedMime = data?.mimeDokumenPendukung;
  const isImage = uploadedMime === "image/png" || uploadedMime === "image/jpeg";

  if (uploadedData && isImage) {
    y = ensureSpace(doc, y, 30);
    y += 2;
    y = drawSectionTitle(doc, "Lampiran Hasil Interview", y);

    try {
      const { width, height } = await getImageSizeFromDataUrl(uploadedData);
      const maxW = pageWidth - 28;
      const maxH = pageHeight - y - 40;

      const scale = Math.min(maxW / width, maxH / height, 1);
      const drawW = width * scale;
      const drawH = height * scale;

      if (drawH > pageHeight - y - 40) {
        doc.addPage();
        y = 20;
      }

      const format = uploadedMime === "image/png" ? "PNG" : "JPEG";
      doc.addImage(uploadedData, format, 14, y, drawW, drawH);
      y += drawH + 8;
    } catch (e) {
      console.error("Gagal menempelkan gambar hasil interview:", e.message);
    }
  }

  // Kesimpulan Akhir
  y = ensureSpace(doc, y, 24);
  y += 2;
  y = drawSectionTitle(doc, "Kesimpulan Akhir", y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  const kesimpulanLower = (data?.kesimpulan || "").toLowerCase();
  const isRekomendasi = kesimpulanLower.includes("direkomendasikan") && !kesimpulanLower.includes("tidak");
  doc.setTextColor(...(isRekomendasi ? [21, 128, 61] : [185, 28, 28]));
  doc.text((data?.kesimpulan || "-").toUpperCase(), 14, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  if (data?.tandaTanganPewawancara) {
    y = ensureSpace(doc, y, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Tanda Tangan Pewawancara:", 14, y);
    try {
      doc.addImage(data.tandaTanganPewawancara, "PNG", 14, y + 3, 55, 22);
    } catch (e) {
      // kalau format gambar tidak didukung, lewati saja
    }
    y += 28;
    doc.setTextColor(0, 0, 0);
  }

  drawFooter(doc);

  if (uploadedData && uploadedMime === "application/pdf") {
    return mergeWithUploadedPdf(doc, uploadedData);
  }

  return doc;
}

/* ---------------------------------------------------------- */
/* PDF: Hasil Psikotest                                        */
/* ---------------------------------------------------------- */

export async function generatePsikotestPdf({ candidate, data }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const applicantName = data?.namaPelamar || candidate?.applicantName || "-";

  let y = drawHeader(
    doc,
    "Rangkuman Hasil Psikotest Calon Karyawan",
    `Psikotes • ${applicantName}`,
  );

  // 1. Data Calon
  y += 4;
  y = drawSectionTitle(doc, "Data Calon", y);
  y = drawKeyValueGrid(
    doc,
    [
      ["Nama Kandidat", applicantName],
      ["Posisi Dilamar", data?.posisi || candidate?.position || "-"],
      ["Tanggal Test", formatDateID(data?.tanggalTest)],
      ["Tester", data?.penguji || "-"],
    ],
    y,
  );

  // 2. Ringkasan Skor
  y = ensureSpace(doc, y, 20);
  y += 2;
  y = drawSectionTitle(doc, "Ringkasan Skor", y);
  y = drawKeyValueGrid(
    doc,
    [
      ["Skor Akhir", `${data?.skorAkhir ?? "-"}/100`],
      ["Skor IQ (Kognitif)", data?.skorIq ?? "-"],
      ["Keterangan IQ", data?.keteranganIq || "-"],
    ],
    y,
  );

  // ✅ NEW: Hasil Kepribadian
  y = ensureSpace(doc, y, 20);
  y += 2;
  y = drawSectionTitle(doc, "Hasil Kepribadian", y);
  y = drawKeyValueGrid(
    doc,
    [
      ["Kepribadian", data?.kepribadian || "-"],
      ["Stabilitas Emosi", data?.stabilitasEmosi || "-"],
      ["Integritas", data?.integritas || "-"],
    ],
    y,
  );

  // ✅ NEW: Tabel Aspek Tambahan (Aspek, Nilai, Keterangan), jika ada
  const aspekTambahanRows = Array.isArray(data?.aspekTambahan)
    ? data.aspekTambahan
        .filter((r) => r && (r.aspek || r.nilai || r.keterangan))
        .map((r, i) => [String(i + 1), r.aspek || "-", r.nilai || "-", r.keterangan || "-"])
    : [];

  if (aspekTambahanRows.length > 0) {
    y = ensureSpace(doc, y, 24);
    y += 2;
    y = drawSectionTitle(doc, "Aspek Tambahan", y);
    y = drawTable(doc, {
      y,
      columns: [
        { header: "No", width: 10 },
        { header: "Aspek", width: 38 },
        { header: "Nilai", width: 22 },
        { header: "Keterangan", width: 112 },
      ],
      rows: aspekTambahanRows,
    });
  }

  // ✅ NEW: Catatan
  if (data?.catatan) {
    y = ensureSpace(doc, y, 20);
    y += 2;
    y = drawSectionTitle(doc, "Catatan", y);
    y = drawParagraph(doc, data.catatan, y);
  }

  // ✅ NEW: Pemeriksa
  y = ensureSpace(doc, y, 20);
  y += 2;
  y = drawSectionTitle(doc, "Pemeriksa", y);
  y = drawKeyValueGrid(
    doc,
    [
      ["Staff Human Capital", data?.namaPemeriksaStaff || "-"],
      ["Human Capital Manager", data?.namaPemeriksaManager || "-"],
    ],
    y,
  );

  // Lampiran hasil psikotest berupa gambar (jika ada)
  const uploadedData = data?.dataDokumenPendukung;
  const uploadedMime = data?.mimeDokumenPendukung;
  const isImage = uploadedMime === "image/png" || uploadedMime === "image/jpeg";

  if (uploadedData && isImage) {
    y = ensureSpace(doc, y, 30);
    y += 2;
    y = drawSectionTitle(doc, "Lampiran Hasil Psikotest", y);

    try {
      const { width, height } = await getImageSizeFromDataUrl(uploadedData);
      const maxW = pageWidth - 28;
      const maxH = pageHeight - y - 40;

      const scale = Math.min(maxW / width, maxH / height, 1);
      const drawW = width * scale;
      const drawH = height * scale;

      if (drawH > pageHeight - y - 40) {
        doc.addPage();
        y = 20;
      }

      const format = uploadedMime === "image/png" ? "PNG" : "JPEG";
      doc.addImage(uploadedData, format, 14, y, drawW, drawH);
      y += drawH + 8;
    } catch (e) {
      console.error("Gagal menempelkan gambar hasil psikotest:", e.message);
    }
  }

  // Kesimpulan Akhir
  y = ensureSpace(doc, y, 24);
  y += 2;
  y = drawSectionTitle(doc, "Kesimpulan Akhir", y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  const kesimpulanLower = (data?.kesimpulan || "").toLowerCase();
  const isRekomendasi = kesimpulanLower.includes("direkomendasikan") && !kesimpulanLower.includes("tidak");
  doc.setTextColor(...(isRekomendasi ? [21, 128, 61] : [185, 28, 28]));
  doc.text((data?.kesimpulan || "-").toUpperCase(), 14, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  drawFooter(doc);

  if (uploadedData && uploadedMime === "application/pdf") {
    return mergeWithUploadedPdf(doc, uploadedData);
  }

  return doc;
}

/* ---------------------------------------------------------- */
/* Util blob                                                    */
/* ---------------------------------------------------------- */

export function pdfDocToBlobUrl(doc) {
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

export function downloadPdfDoc(doc, filename) {
  doc.save(filename);
}